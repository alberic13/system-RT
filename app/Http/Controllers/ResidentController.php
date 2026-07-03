<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    public function index()
    {
        return response()->json(Resident::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:tetap,kontrak',
            'phone' => 'required|string|max:20',
            'is_married' => 'required|boolean',
            'id_card_photo' => 'nullable|image|max:2048', // max 2MB
        ]);

        if ($request->hasFile('id_card_photo')) {
            $path = $request->file('id_card_photo')->store('ktp', 'public');
            $validated['id_card_photo'] = '/storage/' . $path;
        }

        $resident = Resident::create($validated);

        return response()->json($resident, 201);
    }

    public function update(Request $request, $id)
    {
        $resident = Resident::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:tetap,kontrak',
            'phone' => 'required|string|max:20',
            'is_married' => 'required|boolean',
            'id_card_photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('id_card_photo')) {
            // Delete old photo if exists
            if ($resident->id_card_photo) {
                $oldPath = str_replace('/storage/', '', $resident->id_card_photo);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('id_card_photo')->store('ktp', 'public');
            $validated['id_card_photo'] = '/storage/' . $path;
        }

        $resident->update($validated);

        return response()->json($resident);
    }

    public function destroy($id)
    {
        $resident = Resident::findOrFail($id);

        // Delete photo if exists
        if ($resident->id_card_photo) {
            $oldPath = str_replace('/storage/', '', $resident->id_card_photo);
            Storage::disk('public')->delete($oldPath);
        }

        $resident->delete();

        return response()->json(['message' => 'Resident deleted successfully']);
    }
}
