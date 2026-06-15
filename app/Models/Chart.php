<?php

namespace App\Models;

use App\Enums\ChartType;
use Database\Factories\ChartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['project_id', 'sheet_id', 'user_id', 'title', 'chart_type', 'x_column_id', 'y_columns', 'options'])]
class Chart extends Model
{
    /** @use HasFactory<ChartFactory> */
    use HasFactory;

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function sheet(): BelongsTo
    {
        return $this->belongsTo(Sheet::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function xColumn(): BelongsTo
    {
        return $this->belongsTo(SheetColumn::class, 'x_column_id');
    }

    protected function casts(): array
    {
        return [
            'chart_type' => ChartType::class,
            'y_columns' => 'array',
            'options' => 'array',
        ];
    }
}
