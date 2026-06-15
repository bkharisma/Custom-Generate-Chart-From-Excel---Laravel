<?php

namespace Database\Factories;

use App\Enums\ChartType;
use App\Models\Chart;
use App\Models\Project;
use App\Models\Sheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chart>
 */
class ChartFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'sheet_id' => Sheet::factory(),
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'chart_type' => fake()->randomElement(ChartType::cases()),
            'x_column_id' => null,
            'y_columns' => [],
            'options' => [],
        ];
    }
}
