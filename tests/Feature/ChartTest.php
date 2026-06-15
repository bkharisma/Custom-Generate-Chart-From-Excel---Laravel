<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Chart;
use App\Models\Project;
use App\Models\Sheet;
use App\Models\SheetColumn;
use App\Models\Spreadsheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChartTest extends TestCase
{
    use RefreshDatabase;

    private function createSheetWithColumns(User $user): array
    {
        $project = Project::factory()->create(['user_id' => $user->id]);
        $spreadsheet = Spreadsheet::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
        ]);
        $sheet = Sheet::factory()->create(['spreadsheet_id' => $spreadsheet->id]);
        $col1 = SheetColumn::factory()->create([
            'sheet_id' => $sheet->id,
            'name' => 'Category',
            'data_type' => 'string',
        ]);
        $col2 = SheetColumn::factory()->create([
            'sheet_id' => $sheet->id,
            'name' => 'Value',
            'data_type' => 'number',
        ]);

        return [$sheet, $col1, $col2, $project];
    }

    public function test_user_can_create_chart(): void
    {
        $user = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($user);

        $response = $this->actingAs($user)->post(route('charts.store'), [
            'title' => 'My Chart',
            'chart_type' => 'bar',
            'sheet_id' => $sheet->id,
            'x_column_id' => $col1->id,
            'y_columns' => [$col2->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Chart created successfully.');

        $this->assertDatabaseHas('charts', [
            'title' => 'My Chart',
            'chart_type' => 'bar',
        ]);
    }

    public function test_chart_requires_title(): void
    {
        $user = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($user);

        $response = $this->actingAs($user)->post(route('charts.store'), [
            'chart_type' => 'bar',
            'sheet_id' => $sheet->id,
            'y_columns' => [$col2->id],
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_chart_requires_y_columns(): void
    {
        $user = User::factory()->create();
        [$sheet, $col1] = $this->createSheetWithColumns($user);

        $response = $this->actingAs($user)->post(route('charts.store'), [
            'title' => 'My Chart',
            'chart_type' => 'bar',
            'sheet_id' => $sheet->id,
            'y_columns' => [],
        ]);

        $response->assertSessionHasErrors('y_columns');
    }

    public function test_chart_requires_valid_chart_type(): void
    {
        $user = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($user);

        $response = $this->actingAs($user)->post(route('charts.store'), [
            'title' => 'My Chart',
            'chart_type' => 'invalid_type',
            'sheet_id' => $sheet->id,
            'y_columns' => [$col2->id],
        ]);

        $response->assertSessionHasErrors('chart_type');
    }

    public function test_user_can_view_chart(): void
    {
        $user = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($user);

        $chart = Chart::factory()->create([
            'project_id' => $sheet->spreadsheet->project_id,
            'sheet_id' => $sheet->id,
            'user_id' => $user->id,
            'x_column_id' => $col1->id,
            'y_columns' => [$col2->id],
        ]);

        $response = $this->actingAs($user)->get(route('charts.show', $chart));

        $response->assertOk();
    }

    public function test_user_can_update_chart(): void
    {
        $user = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($user);

        $chart = Chart::factory()->create([
            'project_id' => $sheet->spreadsheet->project_id,
            'sheet_id' => $sheet->id,
            'user_id' => $user->id,
            'x_column_id' => $col1->id,
            'y_columns' => [$col2->id],
        ]);

        $response = $this->actingAs($user)->put(route('charts.update', $chart), [
            'title' => 'Updated Chart',
            'chart_type' => 'line',
            'x_column_id' => $col1->id,
            'y_columns' => [$col2->id],
        ]);

        $response->assertRedirect(route('charts.show', $chart));
        $response->assertSessionHas('success', 'Chart updated.');

        $this->assertDatabaseHas('charts', [
            'id' => $chart->id,
            'title' => 'Updated Chart',
            'chart_type' => 'line',
        ]);
    }

    public function test_user_can_delete_chart(): void
    {
        $user = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($user);

        $chart = Chart::factory()->create([
            'project_id' => $sheet->spreadsheet->project_id,
            'sheet_id' => $sheet->id,
            'user_id' => $user->id,
            'x_column_id' => $col1->id,
            'y_columns' => [$col2->id],
        ]);

        $response = $this->actingAs($user)->delete(route('charts.destroy', $chart));

        $response->assertRedirect(route('charts.index'));
        $this->assertDatabaseMissing('charts', ['id' => $chart->id]);
    }

    public function test_user_cannot_access_other_users_chart(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($owner);

        $chart = Chart::factory()->create([
            'project_id' => $sheet->spreadsheet->project_id,
            'sheet_id' => $sheet->id,
            'user_id' => $owner->id,
            'x_column_id' => $col1->id,
            'y_columns' => [$col2->id],
        ]);

        $response = $this->actingAs($other)->get(route('charts.show', $chart));

        $response->assertForbidden();
    }

    public function test_admin_can_see_any_chart(): void
    {
        $admin = User::factory()->create(['role' => Role::Admin]);
        $owner = User::factory()->create();
        [$sheet, $col1, $col2] = $this->createSheetWithColumns($owner);

        $chart = Chart::factory()->create([
            'project_id' => $sheet->spreadsheet->project_id,
            'sheet_id' => $sheet->id,
            'user_id' => $owner->id,
            'x_column_id' => $col1->id,
            'y_columns' => [$col2->id],
        ]);

        $response = $this->actingAs($admin)->get(route('charts.show', $chart));

        $response->assertOk();
    }
}
