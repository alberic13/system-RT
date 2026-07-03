<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    protected $fillable = [
        'house_code',
        'status'
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function activeResidentRelation()
    {
        return $this->hasOne(HouseResident::class)->where('is_active', true);
    }

    public function activeResident()
    {
        return $this->belongsToMany(Resident::class, 'house_residents')
                    ->wherePivot('is_active', true)
                    ->withPivot('is_active', 'start_date', 'end_date')
                    ->withTimestamps();
    }

    public function residents()
    {
        return $this->belongsToMany(Resident::class, 'house_residents')
                    ->withPivot('is_active', 'start_date', 'end_date')
                    ->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
