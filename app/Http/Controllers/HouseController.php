<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseResident;
use App\Models\Resident;
use Carbon\Carbon;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;

class HouseController extends Controller
{
    public function index()
    {
        // Load houses with their active resident (through houseResidents and resident)
        $houses = House::with(['activeResidentRelation.resident'])
            ->get()
            ->sortBy('house_code', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->map(function ($house) {
                $activeRes = $house->activeResidentRelation;
                $computedStatus = ($activeRes && $activeRes->resident) ? 'dihuni' : 'tidak_dihuni';
                return [
                    'id' => $house->id,
                    'house_code' => $house->house_code,
                    'status' => $computedStatus,
                    'active_resident' => $activeRes ? $activeRes->resident : null,
                    'start_date' => $activeRes ? $activeRes->start_date->format('Y-m-d') : null,
                ];
            });

        return response()->json($houses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_code' => 'required|string|unique:houses,house_code|max:50',
            'status' => 'required|in:dihuni,tidak_dihuni',
        ]);

        $house = House::create($validated);

        return response()->json($house, 201);
    }

    public function update(Request $request, $id)
    {
        $house = House::findOrFail($id);

        $validated = $request->validate([
            'house_code' => 'required|string|max:50|unique:houses,house_code,' . $id,
            'status' => 'required|in:dihuni,tidak_dihuni',
        ]);

        $house->update($validated);

        return response()->json($house);
    }

    public function assignResident(Request $request, $id)
    {
        $house = House::findOrFail($id);

        $validated = $request->validate([
            'resident_id' => 'nullable|exists:residents,id',
            'start_date' => 'nullable|required_with:resident_id|date',
        ]);

        $residentId = $validated['resident_id'] ?? null;
        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : null;

        $house = DB::transaction(function () use ($house, $residentId, $startDate) {
            // 1. Terminate current active residency
            $activeResidency = HouseResident::where('house_id', $house->id)
                ->where('is_active', true)
                ->first();

            if ($activeResidency) {
                $activeResidency->update([
                    'is_active' => false,
                    'end_date'  => $startDate ? $startDate->copy()->subDay() : Carbon::today(),
                ]);
            }

            // 2. Set up new occupancy or mark house empty
            if ($residentId) {
                // Ambil nama penghuni untuk disimpan sebagai snapshot
                $residentName = Resident::find($residentId)?->name;

                HouseResident::create([
                    'house_id'      => $house->id,
                    'resident_id'   => $residentId,
                    'resident_name' => $residentName,   // snapshot nama
                    'is_active'     => true,
                    'start_date'    => $startDate,
                ]);

                $house->update(['status' => 'dihuni']);
            } else {
                $house->update(['status' => 'tidak_dihuni']);
            }

            return $house;
        });

        return response()->json([
            'message' => 'Resident assignment updated successfully',
            'house' => $house->load(['activeResidentRelation.resident'])
        ]);
    }

    public function history($id)
    {
        $history = HouseResident::where('house_id', $id)
            ->with('resident')
            ->orderBy('is_active', 'desc')
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($hr) {
                return [
                    'id'             => $hr->id,
                    // Gunakan display_name: nama dari relasi atau snapshot resident_name
                    'resident_name'  => $hr->display_name,
                    'resident'       => $hr->resident,
                    'is_active'      => $hr->is_active,
                    'start_date'     => $hr->start_date->format('Y-m-d'),
                    'end_date'       => $hr->end_date ? $hr->end_date->format('Y-m-d') : null,
                ];
            });

        return response()->json($history);
    }

    public function destroy($id)
    {
        $house = House::findOrFail($id);
        $house->delete();

        return response()->json([
            'message' => 'House deleted successfully'
        ]);
    }
}
