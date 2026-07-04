<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseResident extends Model
{
    protected $table = 'house_residents';

    protected $fillable = [
        'house_id',
        'resident_id',
        'resident_name',   // snapshot nama penghuni saat assignment
        'is_active',
        'start_date',
        'end_date'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date'
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    /**
     * Relasi ke Resident (nullable karena penghuni bisa dihapus,
     * tapi riwayat tetap tersimpan via resident_name).
     */
    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Nama penghuni yang akan ditampilkan:
     * pakai nama dari relasi jika masih ada, fallback ke snapshot resident_name.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->resident?->name ?? $this->resident_name ?? '(Penghuni Dihapus)';
    }
}

