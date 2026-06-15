<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ExcelParserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class SpreadsheetController extends Controller
{
    public function upload(Request $request, Project $project): RedirectResponse
    {
        Gate::authorize('view', $project);

        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store('spreadsheets');

        $spreadsheet = $project->spreadsheets()->create([
            'user_id' => $request->user()->id,
            'original_filename' => $file->getClientOriginalName(),
            'stored_path' => $path,
        ]);

        try {
            $fullPath = Storage::path($path);
            app(ExcelParserService::class)->parse($fullPath, $spreadsheet);
        } catch (\Exception $e) {
            $spreadsheet->delete();
            Storage::delete($path);

            return redirect()
                ->route('projects.show', $project)
                ->with('error', 'Failed to parse the uploaded file. Please ensure it is a valid Excel file.');
        }

        $firstSheet = $spreadsheet->sheets()->first();

        if (! $firstSheet) {
            return redirect()
                ->route('projects.show', $project)
                ->with('error', 'No sheets found in the uploaded file.');
        }

        return redirect()
            ->route('sheets.show', $firstSheet)
            ->with('success', 'File uploaded and parsed successfully.');
    }
}
