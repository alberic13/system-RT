<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $fillable = [
        'name',
        'id_card_photo',
        'status',
        'phone',
        'is_married'
    ];

    protected $casts = [
        'is_married' => 'boolean'
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function houses()
    {
        return $this->belongsToMany(House::class, 'house_residents')
                    ->withPivot('is_active', 'start_date', 'end_date')
                    ->withTimestamps();
    }
}
