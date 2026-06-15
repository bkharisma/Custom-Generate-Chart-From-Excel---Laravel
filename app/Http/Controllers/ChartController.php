<?php

namespace App\Http\Controllers;

use App\Enums\ChartType;
use App\Enums\Role;
use App\Models\Chart;
use App\Models\Sheet;
use App\Models\SheetColumn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ChartController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Chart::class);

        $charts = Chart::query()
            ->when($request->user()->role !== Role::Admin, fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['project', 'sheet', 'xColumn'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Charts/Index', [
            'charts' => $charts,
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Chart::class);

        $sheet = null;
        $columns = collect();

        if ($request->has('sheet_id')) {
            $sheet = Sheet::with(['columns', 'spreadsheet.project'])->find($request->get('sheet_id'));

            if ($sheet) {
                $project = $sheet->spreadsheet->project;
                Gate::authorize('view', $project);
                $columns = $sheet->columns;
            }
        }

        $projects = $request->user()->projects()->with(['spreadsheets.sheets'])->get();

        return Inertia::render('Charts/Create', [
            'chartTypes' => $this->chartTypes(),
            'selectedSheet' => $sheet,
            'columns' => $columns,
            'projects' => $projects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Chart::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'chart_type' => ['required', 'string', 'in:bar,bar_y,line,pie,scatter,area,radar'],
            'sheet_id' => ['required', 'exists:sheets,id'],
            'x_column_id' => ['nullable', 'exists:sheet_columns,id'],
            'y_columns' => ['required', 'array', 'min:1'],
            'y_columns.*' => ['exists:sheet_columns,id'],
            'filters' => ['nullable', 'array'],
            'filters.*.column_id' => ['required', 'integer', 'exists:sheet_columns,id'],
            'filters.*.value' => ['required', 'string'],
            'filters.*.label' => ['required', 'string', 'max:255'],
            'y_labels' => ['nullable', 'array'],
            'y_labels.*' => ['nullable', 'string', 'max:255'],
            'excluded_categories' => ['nullable', 'array'],
            'excluded_categories.*' => ['string'],
            'exclude_rows' => ['nullable', 'array'],
            'exclude_rows.*.column_id' => ['required', 'integer', 'exists:sheet_columns,id'],
            'exclude_rows.*.value' => ['required', 'string'],
        ]);

        $sheet = Sheet::findOrFail($validated['sheet_id']);
        $project = $sheet->spreadsheet->project;
        Gate::authorize('view', $project);

        $chart = Chart::create([
            'project_id' => $project->id,
            'sheet_id' => $validated['sheet_id'],
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'chart_type' => $validated['chart_type'],
            'x_column_id' => $validated['x_column_id'],
            'y_columns' => $validated['y_columns'],
            'options' => [
                'filters' => $validated['filters'] ?? [],
                'y_labels' => $validated['y_labels'] ?? [],
                'excluded_categories' => $validated['excluded_categories'] ?? [],
                'exclude_rows' => $validated['exclude_rows'] ?? [],
            ],
        ]);

        return redirect()
            ->route('charts.show', $chart)
            ->with('success', 'Chart created successfully.');
    }

    public function show(Chart $chart): Response
    {
        Gate::authorize('view', $chart);

        $chart->load(['project', 'sheet.columns', 'xColumn']);

        $yColumns = SheetColumn::whereIn('id', $chart->y_columns)->get();
        $rows = $chart->sheet->rows()->orderBy('row_index')->get();

        $chartConfig = $this->generateChartConfig($chart, $rows, $yColumns);

        return Inertia::render('Charts/Show', [
            'chart' => $chart->load(['project', 'sheet', 'xColumn']),
            'yColumns' => $yColumns,
            'chartConfig' => $chartConfig,
            'chartTable' => $this->buildChartTable($chartConfig, $chart),
        ]);
    }

    public function edit(Chart $chart): Response
    {
        Gate::authorize('update', $chart);

        $chart->load(['project', 'sheet.columns', 'xColumn']);

        return Inertia::render('Charts/Edit', [
            'chart' => $chart,
            'columns' => $chart->sheet->columns,
            'chartTypes' => $this->chartTypes(),
            'yColumns' => SheetColumn::whereIn('id', $chart->y_columns)->get(),
        ]);
    }

    public function update(Request $request, Chart $chart): RedirectResponse
    {
        Gate::authorize('update', $chart);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'chart_type' => ['required', 'string', 'in:bar,bar_y,line,pie,scatter,area,radar'],
            'x_column_id' => ['nullable', 'exists:sheet_columns,id'],
            'y_columns' => ['required', 'array', 'min:1'],
            'y_columns.*' => ['exists:sheet_columns,id'],
            'filters' => ['nullable', 'array'],
            'filters.*.column_id' => ['required', 'integer', 'exists:sheet_columns,id'],
            'filters.*.value' => ['required', 'string'],
            'filters.*.label' => ['required', 'string', 'max:255'],
            'y_labels' => ['nullable', 'array'],
            'y_labels.*' => ['nullable', 'string', 'max:255'],
            'excluded_categories' => ['nullable', 'array'],
            'excluded_categories.*' => ['string'],
            'exclude_rows' => ['nullable', 'array'],
            'exclude_rows.*.column_id' => ['required', 'integer', 'exists:sheet_columns,id'],
            'exclude_rows.*.value' => ['required', 'string'],
            'options' => ['nullable', 'array'],
        ]);

        $options = array_merge($chart->options ?? [], [
            'filters' => $validated['filters'] ?? [],
            'y_labels' => $validated['y_labels'] ?? [],
            'excluded_categories' => $validated['excluded_categories'] ?? [],
            'exclude_rows' => $validated['exclude_rows'] ?? [],
        ]);

        if (! empty($validated['options'])) {
            foreach ($validated['options'] as $key => $value) {
                if (! in_array($key, ['filters', 'y_labels', 'excluded_categories', 'exclude_rows'])) {
                    $options[$key] = $value;
                }
            }
        }

        $chart->update([
            'title' => $validated['title'],
            'chart_type' => $validated['chart_type'],
            'x_column_id' => $validated['x_column_id'],
            'y_columns' => $validated['y_columns'],
            'options' => $options,
        ]);

        return redirect()
            ->route('charts.show', $chart)
            ->with('success', 'Chart updated.');
    }

    public function destroy(Chart $chart): RedirectResponse
    {
        Gate::authorize('delete', $chart);

        $chart->delete();

        return redirect()
            ->route('charts.index')
            ->with('success', 'Chart deleted.');
    }

    private function generateChartConfig(Chart $chart, $rows, $yColumns): array
    {
        $xCol = $chart->xColumn;
        $chartType = $chart->chart_type->value;

        $options = $chart->options ?? [];
        $yLabels = $options['y_labels'] ?? [];
        $showAllLabels = ($options['showAllLabels'] ?? false) !== false;
        $yColNames = $yColumns->map(fn ($c) => ($yLabels[$c->id] ?? null) ?: $c->name)->toArray();

        $excludeRowDefs = [];
        foreach ($options['exclude_rows'] ?? [] as $er) {
            $col = SheetColumn::find($er['column_id']);
            if ($col) {
                $excludeRowDefs[] = ['name' => $col->name, 'value' => (string) $er['value']];
            }
        }
        if (! empty($excludeRowDefs)) {
            $rows = $rows->filter(function ($row) use ($excludeRowDefs) {
                foreach ($excludeRowDefs as $def) {
                    if ((string) ($row->data[$def['name']] ?? '') === $def['value']) {
                        return false;
                    }
                }
                return true;
            })->values();
        }

        $xData = [];
        $rawSeries = [];
        $needsAggregation = false;

        foreach ($yColumns as $yCol) {
            $displayName = ($yLabels[$yCol->id] ?? null) ?: $yCol->name;
            $yData = [];
            foreach ($rows as $row) {
                $val = $row->data[$yCol->name] ?? null;
                $yData[] = is_numeric($val) ? (float) $val : $val;
            }

            $sample = collect($yData)->filter(fn ($v) => $v !== null)->first();
            if ($sample !== null && !is_numeric($sample)) {
                $needsAggregation = true;
            }

            $rawSeries[] = [
                'name' => $displayName,
                'values' => $yData,
            ];
        }

        if ($needsAggregation) {
            return $this->aggregateChartConfig($chart, $rows, $yColumns, $xCol, $chartType, $options, $rawSeries, $chart->options['filters'] ?? []);
        }

        if ($xCol) {
            foreach ($rows as $row) {
                $xData[] = $row->data[$xCol->name] ?? '';
            }
        }

        $series = [];
        $echartsType = $chartType === 'bar_y' ? 'bar' : $chartType;
        $isAreaType = $echartsType === 'area';
        $actualType = $isAreaType ? 'line' : $echartsType;

        foreach ($rawSeries as $rs) {
            $serieConfig = [
                'name' => $rs['name'],
                'type' => $actualType,
                'data' => $rs['values'],
            ];

            if ($isAreaType) {
                $serieConfig['areaStyle'] = [];
            }

            $series[] = $serieConfig;
        }

        $config = [
            'title' => ['text' => $chart->title],
            'tooltip' => ['trigger' => 'axis'],
            'legend' => ['data' => $yColNames, 'bottom' => 0],
        ];

        if (in_array($chartType, ['bar', 'line', 'area', 'scatter', 'radar'])) {
            if ($chartType === 'scatter') {
                $config['xAxis'] = ['type' => 'value'];
                $config['yAxis'] = ['type' => 'value'];
            } elseif ($chartType === 'radar') {
                $config['radar'] = ['indicator' => array_map(fn ($name) => ['name' => $name], $xData)];
            } else {
                $config['xAxis'] = [
                    'type' => 'category',
                    'data' => $xData,
                ];
                if ($showAllLabels) {
                    $config['xAxis']['axisLabel'] = ['interval' => 0, 'rotate' => 45];
                }
                $config['yAxis'] = ['type' => 'value'];
            }
        } elseif ($chartType === 'bar_y') {
            $config['yAxis'] = [
                'type' => 'category',
                'data' => $xData,
            ];
            if ($showAllLabels) {
                $config['yAxis']['axisLabel'] = ['interval' => 0];
            }
            $config['xAxis'] = ['type' => 'value'];
        }

        if ($showAllLabels && in_array($chartType, ['bar', 'bar_y', 'line', 'area', 'scatter'])) {
            $config['grid'] = ['bottom' => 100, 'containLabel' => true];
        }

        if ($chartType === 'pie') {
            $config['tooltip']['trigger'] = 'item';
            unset($config['xAxis'], $config['yAxis']);
            $pieData = [];
            foreach ($xData as $i => $label) {
                $pieData[] = [
                    'name' => (string) $label,
                    'value' => $series[0]['data'][$i] ?? 0,
                ];
            }
            $series[0] = [
                'name' => $yColNames[0],
                'type' => 'pie',
                'data' => $pieData,
                'radius' => '60%',
            ];
        }

        $config['series'] = $series;

        if (! empty($options)) {
            $config = array_replace_recursive($config, $options);
        }

        return $config;
    }

    private function aggregateChartConfig(Chart $chart, $rows, $yColumns, $xCol, string $chartType, array $options, array $rawSeries, array $filters = []): array
    {
        $yLabels = $options['y_labels'] ?? [];
        $showAllLabels = ($options['showAllLabels'] ?? false) !== false;
        $yColNames = $yColumns->map(fn ($c) => ($yLabels[$c->id] ?? null) ?: $c->name)->toArray();
        $echartsType = $chartType === 'bar_y' ? 'bar' : $chartType;
        $isAreaType = $echartsType === 'area';
        $actualType = $isAreaType ? 'line' : $echartsType;

        if ($chartType === 'pie' && count($rawSeries) > 1) {
            $rawSeries = [array_shift($rawSeries)];
            $yColNames = [$yColNames[0]];
        }

        $filterColumns = [];
        foreach ($filters as $f) {
            $col = SheetColumn::find($f['column_id']);
            if ($col) {
                $filterColumns[] = [
                    'column' => $col,
                    'value' => $f['value'],
                    'label' => $f['label'],
                ];
            }
        }

        $allCounts = [];
        $allLabels = [];
        foreach ($rawSeries as $si => $rs) {
            $counts = [];
            foreach ($rs['values'] as $val) {
                $key = (string) $val;
                $counts[$key] = ($counts[$key] ?? 0) + 1;
            }
            $allCounts[] = ['name' => $rs['name'], 'counts' => $counts];

            foreach (array_keys($counts) as $label) {
                $allLabels[$label] = true;
            }

            foreach ($filterColumns as $fc) {
                $filteredCounts = [];
                foreach ($rows as $rowIdx => $row) {
                    $rowVal = (string) ($row->data[$fc['column']->name] ?? '');
                    if ($rowVal === $fc['value'] || (string) $fc['value'] === $rowVal) {
                        $key = (string) $rs['values'][$rowIdx];
                        $filteredCounts[$key] = ($filteredCounts[$key] ?? 0) + 1;
                    }
                }
                $allCounts[] = ['name' => $fc['label'], 'counts' => $filteredCounts];
                foreach (array_keys($filteredCounts) as $label) {
                    $allLabels[$label] = true;
                }
            }
        }

        $labels = array_keys($allLabels);
        sort($labels);

        $excluded = $options['excluded_categories'] ?? [];
        if (! empty($excluded)) {
            $excludedSet = array_flip($excluded);
            $labels = array_values(array_filter($labels, fn ($l) => ! isset($excludedSet[$l])));
        }

        $series = [];
        foreach ($allCounts as $ac) {
            $data = array_map(fn ($label) => $ac['counts'][$label] ?? 0, $labels);

            if ($chartType === 'pie') {
                $pieData = [];
                foreach ($labels as $i => $label) {
                    $pieData[] = ['name' => $label ?: '(empty)', 'value' => $data[$i]];
                }
                $series[] = [
                    'name' => $ac['name'],
                    'type' => 'pie',
                    'data' => $pieData,
                    'radius' => '60%',
                ];
            } else {
                $series[] = array_merge([
                    'name' => $ac['name'],
                    'type' => $actualType,
                    'data' => $data,
                ], $isAreaType ? ['areaStyle' => []] : []);
            }
        }

        $legendNames = $yColNames;
        foreach ($filterColumns as $fc) {
            $legendNames[] = $fc['label'];
        }

        $config = [
            'title' => ['text' => $chart->title],
            'tooltip' => ['trigger' => $chartType === 'pie' ? 'item' : 'axis'],
            'legend' => ['data' => $legendNames, 'bottom' => 0],
        ];

        if (in_array($chartType, ['bar', 'line', 'area'])) {
            $config['xAxis'] = [
                'type' => 'category',
                'data' => $labels,
            ];
            if ($showAllLabels) {
                $config['xAxis']['axisLabel'] = ['interval' => 0, 'rotate' => 45];
            }
            $config['yAxis'] = ['type' => 'value'];
        } elseif ($chartType === 'bar_y') {
            $config['yAxis'] = [
                'type' => 'category',
                'data' => $labels,
            ];
            if ($showAllLabels) {
                $config['yAxis']['axisLabel'] = ['interval' => 0];
            }
            $config['xAxis'] = ['type' => 'value'];
        }

        if ($showAllLabels && in_array($chartType, ['bar', 'bar_y', 'line', 'area'])) {
            $config['grid'] = ['bottom' => 100, 'containLabel' => true];
        }

        $config['series'] = $series;

        if (! empty($options)) {
            $config = array_replace_recursive($config, $options);
        }

        return $config;
    }

    private function buildChartTable(array $config, Chart $chart): array
    {
        $series = $config['series'] ?? [];

        if ($chart->chart_type === ChartType::Pie) {
            $data = $series[0]['data'] ?? [];
            return [
                'columns' => ['Category', 'Count'],
                'rows' => array_map(fn ($item) => [$item['name'], $item['value']], $data),
            ];
        }

        $xLabels = $config['xAxis']['data'] ?? $config['yAxis']['data'] ?? [];
        $columns = $chart->xColumn ? [$chart->xColumn->name] : ['Label'];

        foreach ($series as $s) {
            $columns[] = $s['name'] ?? 'Value';
        }

        $rows = [];
        foreach ($xLabels as $i => $label) {
            $row = [$label];
            foreach ($series as $s) {
                $row[] = $s['data'][$i] ?? null;
            }
            $rows[] = $row;
        }

        return ['columns' => $columns, 'rows' => $rows];
    }

    private function chartTypes(): Collection
    {
        $labels = [
            'BarY' => 'Horizontal Bar',
        ];

        return collect(ChartType::cases())->map(fn (ChartType $case) => [
            'name' => $labels[$case->name] ?? $case->name,
            'value' => $case->value,
        ])->values();
    }
}
