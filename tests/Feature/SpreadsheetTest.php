<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class SpreadsheetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_xlsx_file(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $file = $this->createTestExcel();

        $response = $this->actingAs($user)
            ->post(route('projects.upload', $project), [
                'file' => $file,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('spreadsheets', [
            'project_id' => $project->id,
            'original_filename' => 'test.xlsx',
        ]);
    }

    public function test_upload_validates_file_type(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $file = UploadedFile::fake()->create('test.txt', 100);

        $response = $this->actingAs($user)
            ->post(route('projects.upload', $project), [
                'file' => $file,
            ]);

        $response->assertSessionHasErrors('file');
    }

    public function test_upload_validates_file_required(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->post(route('projects.upload', $project), []);

        $response->assertSessionHasErrors('file');
    }

    public function test_user_cannot_upload_to_other_users_project(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $other->id]);

        $file = $this->createTestExcel();

        $response = $this->actingAs($user)
            ->post(route('projects.upload', $project), [
                'file' => $file,
            ]);

        $response->assertForbidden();
    }

    private function createTestExcel(): UploadedFile
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

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $tempPath = tempnam(sys_get_temp_dir(), 'test_') . '.xlsx';
        $writer->save($tempPath);

        return new UploadedFile($tempPath, 'test.xlsx', null, null, true);
    }
}
