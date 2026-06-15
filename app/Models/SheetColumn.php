<?php

namespace App\Models;

use Database\Factories\SheetColumnFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['sheet_id', 'name', 'data_type', 'original_index'])]
class SheetColumn extends Model
{
    /** @use HasFactory<SheetColumnFactory> */
    use HasFactory;

    public function sheet(): BelongsTo
    {
        return $this->belongsTo(Sheet::class);
    }
}
