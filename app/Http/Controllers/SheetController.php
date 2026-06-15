<?php

namespace App\Http\Controllers;

use App\Models\Sheet;
use App\Models\SheetColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SheetController extends Controller
{
    public function columns(Sheet $sheet): JsonResponse
    {
        Gate::authorize('view', $sheet->spreadsheet->project);

        return response()->json($sheet->columns()->orderBy('id')->get(['id', 'name', 'data_type']));
    }

    public function columnValues(Sheet $sheet, SheetColumn $column): JsonResponse
    {
        Gate::authorize('view', $sheet->spreadsheet->project);

        if ($column->sheet_id !== $sheet->id) {
            abort(404);
        }

        $values = $sheet->rows()
            ->select('data')
            ->get()
            ->pluck('data.' . $column->name)
            ->filter(fn ($v) => $v !== null && $v !== '')
            ->unique()
            ->map(fn ($v) => (string) $v)
            ->sort()
            ->values();

        return response()->json($values);
    }

    public function show(Request $request, Sheet $sheet): Response
    {
        $project = $sheet->spreadsheet->project;
        Gate::authorize('view', $project);

        $sheet->load(['columns', 'spreadsheet']);
        $rows = $sheet->rows()->orderBy('row_index')->paginate(50);

        $spreadsheet = $sheet->spreadsheet;
        $sheets = $spreadsheet->sheets()->orderBy('id')->get();

        return Inertia::render('Spreadsheets/Show', [
            'sheet' => $sheet,
            'sheets' => $sheets,
            'spreadsheet' => $spreadsheet->load('project'),
            'rows' => $rows,
        ]);
    }
}
