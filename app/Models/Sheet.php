<?php

namespace App\Models;

use Database\Factories\SheetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['spreadsheet_id', 'name', 'row_count', 'col_count'])]
class Sheet extends Model
{
    /** @use HasFactory<SheetFactory> */
    use HasFactory;

    public function spreadsheet(): BelongsTo
    {
        return $this->belongsTo(Spreadsheet::class);
    }

    public function columns(): HasMany
    {
        return $this->hasMany(SheetColumn::class);
    }

    public function rows(): HasMany
    {
        return $this->hasMany(SheetRow::class);
    }
}
