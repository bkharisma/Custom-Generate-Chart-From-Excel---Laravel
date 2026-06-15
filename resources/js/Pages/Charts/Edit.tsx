import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import ColumnSelector from '@/Components/ColumnSelector';
import ChartConfigPanel, { ChartOptions } from '@/Components/ChartConfigPanel';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

interface Column {
    id: number;
    name: string;
    data_type: string;
}

interface ChartItem {
    id: number;
    title: string;
    chart_type: string;
    sheet_id: number;
    x_column_id: number | null;
    y_columns: number[];
    options: Record<string, unknown>;
    project: { id: number; name: string };
    sheet: { id: number; name: string; columns: Column[] };
    x_column: { id: number; name: string } | null;
}

interface Filter {
    column_id: number;
    value: string;
    label: string;
}

interface ExcludeRow {
    column_id: number;
    value: string;
}

export default function Edit({
    chart,
    columns,
    chartTypes,
    yColumns,
}: PageProps<{
    chart: ChartItem;
    columns: Column[];
    chartTypes: { name: string; value: string }[];
    yColumns: Column[];
}>) {
    const [title, setTitle] = useState(chart.title);
    const [chartType, setChartType] = useState(chart.chart_type);
    const [xColumnId, setXColumnId] = useState<number | null>(chart.x_column_id);
    const [yColumnIds, setYColumnIds] = useState<number[]>(chart.y_columns);
    const [options, setOptions] = useState<ChartOptions>((chart.options as ChartOptions) || {});
    const [filters, setFilters] = useState<Filter[]>(
        ((chart.options as Record<string, unknown>)?.filters as Filter[]) || [],
    );
    const [yLabels, setYLabels] = useState<Record<number, string>>(
        ((chart.options as Record<string, unknown>)?.y_labels as Record<number, string>) || {},
    );
    const [excludedCategories, setExcludedCategories] = useState<string[]>(
        ((chart.options as Record<string, unknown>)?.excluded_categories as string[]) || [],
    );
    const [excludeRows, setExcludeRows] = useState<ExcludeRow[]>(
        ((chart.options as Record<string, unknown>)?.exclude_rows as ExcludeRow[]) || [],
    );
    const [uniqueValues, setUniqueValues] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    const yColumnsKey = yColumnIds.join(',');

    useEffect(() => {
        if (chart.sheet_id && yColumnIds.length > 0) {
            fetch(`/sheets/${chart.sheet_id}/columns/${yColumnIds[0]}/values`)
                .then((res) => res.json())
                .then((vals) => setUniqueValues(vals))
                .catch(() => setUniqueValues([]));
        }
    }, [chart.sheet_id, yColumnsKey]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.put(
            route('charts.update', chart.id),
            {
                title,
                chart_type: chartType,
                x_column_id: xColumnId,
                y_columns: yColumnIds,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filters: filters as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                y_labels: yLabels as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                excluded_categories: excludedCategories as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                exclude_rows: excludeRows as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                options: options as any,
            },
            {
                onFinish: () => setProcessing(false),
                onError: (err) => setErrors(err as Record<string, string>),
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Edit Chart
                </h2>
            }
        >
            <Head title="Edit Chart" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Sheet:{' '}
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {chart.sheet.name}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chart Type
                                    </label>
                                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {chartTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() =>
                                                    setChartType(type.value)
                                                }
                                                className={`rounded-md border px-3 py-2 text-sm font-medium capitalize ${
                                                    chartType === type.value
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900 dark:text-indigo-300'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {type.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <ColumnSelector
                                    columns={columns}
                                    xColumnId={xColumnId}
                                    yColumnIds={yColumnIds}
                                    yLabels={yLabels}
                                    filters={filters}
                                    onXColumnChange={setXColumnId}
                                    onYColumnsChange={setYColumnIds}
                                    onYLabelsChange={setYLabels}
                                    onFiltersChange={setFilters}
                                />
                                <InputError message={errors.y_columns} className="mt-2" />

                                {yColumnIds.length > 0 && uniqueValues.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Exclude Categories
                                        </label>
                                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            Uncheck categories to hide them
                                            from the chart and table.
                                        </p>
                                        <div className="max-h-48 overflow-auto rounded-md border border-gray-200 p-2 dark:border-gray-700">
                                            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                                                {uniqueValues.map((val) => {
                                                    const excluded =
                                                        excludedCategories.includes(
                                                            val,
                                                        );
                                                    return (
                                                        <label
                                                            key={val}
                                                            className={`flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 text-xs ${
                                                                excluded
                                                                    ? 'text-gray-400 line-through dark:text-gray-500'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    !excluded
                                                                }
                                                                onChange={() => {
                                                                    setExcludedCategories(
                                                                        excluded
                                                                            ? excludedCategories.filter(
                                                                                  (
                                                                                      c,
                                                                                  ) =>
                                                                                      c !==
                                                                                      val,
                                                                              )
                                                                            : [
                                                                                  ...excludedCategories,
                                                                                  val,
                                                                              ],
                                                                    );
                                                                }}
                                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                                                            />
                                                            {val}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {columns.length > 0 && (
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Exclude Rows
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setExcludeRows([
                                                        ...excludeRows,
                                                        {
                                                            column_id:
                                                                columns[0]
                                                                    ?.id ?? 0,
                                                            value: '',
                                                        },
                                                    ]);
                                                }}
                                                className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                                            >
                                                + Add Exclude
                                            </button>
                                        </div>
                                        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                            Remove rows matching conditions
                                            before counting. Useful for
                                            excluding specific sub-groups.
                                        </p>
                                        {excludeRows.map((er, i) => (
                                            <div
                                                key={i}
                                                className="mb-2 flex flex-wrap items-end gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-700"
                                            >
                                                <div className="min-w-[140px] flex-1">
                                                    <label className="block text-xs text-gray-500 dark:text-gray-400">
                                                        Where
                                                    </label>
                                                    <select
                                                        value={er.column_id}
                                                        onChange={(e) => {
                                                            const next = [
                                                                ...excludeRows,
                                                            ];
                                                            next[i] = {
                                                                ...next[i],
                                                                column_id:
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                            };
                                                            setExcludeRows(
                                                                next,
                                                            );
                                                        }}
                                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                    >
                                                        {columns.map(
                                                            (col) => (
                                                                <option
                                                                    key={
                                                                        col.id
                                                                    }
                                                                    value={
                                                                        col.id
                                                                    }
                                                                >
                                                                    {col.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="min-w-[80px] flex-1">
                                                    <label className="block text-xs text-gray-500 dark:text-gray-400">
                                                        Not Equal To
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={er.value}
                                                        onChange={(e) => {
                                                            const next = [
                                                                ...excludeRows,
                                                            ];
                                                            next[i] = {
                                                                ...next[i],
                                                                value:
                                                                    e.target
                                                                        .value,
                                                            };
                                                            setExcludeRows(
                                                                next,
                                                            );
                                                        }}
                                                        placeholder="ex: SBM Poltekpar"
                                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setExcludeRows(
                                                            excludeRows.filter(
                                                                (_, j) =>
                                                                    j !== i,
                                                            ),
                                                        );
                                                    }}
                                                    className="rounded-md px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                                                >
                                                    &#10005;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chart Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Customization
                                    </h3>
                                    <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                        <ChartConfigPanel
                                            options={options}
                                            onChange={setOptions}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </PrimaryButton>
                                    <Link
                                        href={route('charts.show', chart.id)}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
