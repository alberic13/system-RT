<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'house_id',
        'resident_id',
        'type',
        'amount',
        'month',
        'year',
        'payment_date',
        'status'
    ];

    protected $casts = [
        'payment_date' => 'date'
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}
