<?php

namespace App\Models;

use Database\Factories\SpreadsheetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['project_id', 'user_id', 'original_filename', 'stored_path'])]
class Spreadsheet extends Model
{
    /** @use HasFactory<SpreadsheetFactory> */
    use HasFactory;

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sheets(): HasMany
    {
        return $this->hasMany(Sheet::class);
    }
}
