<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Spreadsheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Spreadsheet>
 */
class SpreadsheetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'original_filename' => fake()->word() . '.xlsx',
            'stored_path' => 'spreadsheets/' . fake()->uuid() . '.xlsx',
        ];
    }
}
