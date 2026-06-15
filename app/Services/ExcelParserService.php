<?php

namespace App\Services;

use App\Models\Sheet;
use App\Models\SheetColumn;
use App\Models\SheetRow;
use App\Models\Spreadsheet;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ExcelParserService
{
    public function parse(string $filePath, Spreadsheet $spreadsheet): void
    {
        $reader = IOFactory::createReaderForFile($filePath);
        $reader->setReadDataOnly(true);
        $spreadsheetObj = $reader->load($filePath);

        foreach ($spreadsheetObj->getSheetNames() as $index => $sheetName) {
            $worksheet = $spreadsheetObj->getSheet($index);

            $colCount = 0;
            $rowCount = $worksheet->getHighestDataRow();

            $sheet = Sheet::create([
                'spreadsheet_id' => $spreadsheet->id,
                'name' => $sheetName,
                'row_count' => $rowCount,
                'col_count' => 0,
            ]);

            $columns = [];
            $colIndex = 1;
            while ($worksheet->getCell([$colIndex, 1])->getValue() !== null) {
                $header = (string) $worksheet->getCell([$colIndex, 1])->getValue();
                $sampleValue = null;
                for ($r = 2; $r <= min($rowCount, 10); $r++) {
                    $cell = $worksheet->getCell([$colIndex, $r]);
                    if ($cell->getValue() !== null) {
                        $sampleValue = $cell->getValue();
                        break;
                    }
                }
                $dataType = $this->inferDataType($sampleValue);

                $column = SheetColumn::create([
                    'sheet_id' => $sheet->id,
                    'name' => $header ?: "Column {$colIndex}",
                    'data_type' => $dataType,
                    'original_index' => $colIndex,
                ]);
                $columns[] = $column;
                $colIndex++;
            }
            $colCount = $colIndex - 1;
            $sheet->update(['col_count' => $colCount]);

            for ($r = 2; $r <= $rowCount; $r++) {
                $rowData = [];
                foreach ($columns as $col) {
                    $value = $worksheet->getCell([$col->original_index, $r])->getValue();
                    $rowData[$col->name] = $value;
                }

                SheetRow::create([
                    'sheet_id' => $sheet->id,
                    'row_index' => $r,
                    'data' => $rowData,
                ]);
            }
        }
    }

    private function inferDataType(mixed $value): string
    {
        if ($value === null) {
            return 'string';
        }

        if (is_int($value)) {
            return 'number';
        }

        if (is_float($value)) {
            return 'number';
        }

        if (is_numeric($value)) {
            return 'number';
        }

        if ($value instanceof \DateTime) {
            return 'date';
        }

        return 'string';
    }
}
