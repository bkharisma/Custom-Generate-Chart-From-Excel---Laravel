<?php

namespace Database\Factories;

use App\Models\Sheet;
use App\Models\Spreadsheet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sheet>
 */
class SheetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'spreadsheet_id' => Spreadsheet::factory(),
            'name' => fake()->word(),
            'row_count' => fake()->numberBetween(1, 100),
            'col_count' => fake()->numberBetween(1, 20),
        ];
    }
}
