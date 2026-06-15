<?php

namespace Database\Factories;

use App\Models\Sheet;
use App\Models\SheetColumn;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SheetColumn>
 */
class SheetColumnFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sheet_id' => Sheet::factory(),
            'name' => fake()->unique()->word(),
            'data_type' => fake()->randomElement(['string', 'number', 'date']),
            'original_index' => fake()->unique()->numberBetween(1, 50),
        ];
    }
}
