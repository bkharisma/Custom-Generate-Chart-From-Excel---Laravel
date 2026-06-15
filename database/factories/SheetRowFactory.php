<?php

namespace Database\Factories;

use App\Models\Sheet;
use App\Models\SheetRow;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SheetRow>
 */
class SheetRowFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sheet_id' => Sheet::factory(),
            'row_index' => fake()->unique()->numberBetween(1, 1000),
            'data' => [
                'Name' => fake()->word(),
                'Value' => fake()->numberBetween(1, 100),
            ],
        ];
    }
}
