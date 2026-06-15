<?php

namespace Tests\Unit;

use App\Models\Sheet;
use App\Models\SheetColumn;
use App\Models\SheetRow;
use App\Models\Spreadsheet;
use App\Services\ExcelParserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExcelParserServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_parse_creates_sheets_and_columns(): void
    {
        $filePath = $this->createTestExcelFile();

        $spreadsheet = Spreadsheet::factory()->create();

        $service = app(ExcelParserService::class);
        $service->parse($filePath, $spreadsheet);

        $this->assertDatabaseHas('sheets', [
            'spreadsheet_id' => $spreadsheet->id,
            'name' => 'Sheet1',
        ]);

        $this->assertDatabaseHas('sheet_columns', [
            'name' => 'Name',
            'data_type' => 'string',
        ]);

        $this->assertDatabaseHas('sheet_columns', [
            'name' => 'Value',
            'data_type' => 'number',
        ]);

        unlink($filePath);
    }

    public function test_parse_creates_row_data(): void
    {
        $filePath = $this->createTestExcelFile();

        $spreadsheet = Spreadsheet::factory()->create();

        $service = app(ExcelParserService::class);
        $service->parse($filePath, $spreadsheet);

        $sheet = $spreadsheet->sheets()->first();
        $this->assertNotNull($sheet);
        $this->assertEquals(3, $sheet->row_count);

        $rows = SheetRow::where('sheet_id', $sheet->id)->get();
        $this->assertCount(2, $rows);

        unlink($filePath);
    }

    public function test_parse_handles_empty_headers(): void
    {
        $spreadsheetObj = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheetObj->getActiveSheet();
        $sheet->setTitle('Empty');
        $sheet->setCellValue([1, 1], null);

        $tempPath = tempnam(sys_get_temp_dir(), 'test_') . '.xlsx';
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheetObj);
        $writer->save($tempPath);

        $spreadsheet = Spreadsheet::factory()->create();

        $service = app(ExcelParserService::class);
        $service->parse($tempPath, $spreadsheet);

        $sheetModel = $spreadsheet->sheets()->first();
        $this->assertNotNull($sheetModel);
        $this->assertEquals(0, $sheetModel->col_count);

        unlink($tempPath);
    }

    private function createTestExcelFile(): string
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Sheet1');
        $sheet->setCellValue([1, 1], 'Name');
        $sheet->setCellValue([2, 1], 'Value');
        $sheet->setCellValue([1, 2], 'Item 1');
        $sheet->setCellValue([2, 2], 100);
        $sheet->setCellValue([1, 3], 'Item 2');
        $sheet->setCellValue([2, 3], 200);

        $tempPath = tempnam(sys_get_temp_dir(), 'test_') . '.xlsx';
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        return $tempPath;
    }
}
