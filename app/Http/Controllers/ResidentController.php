<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseResident;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ResidentController extends Controller
{
    public function index()
    {
        return response()->json(Resident::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'status'       => 'required|in:tetap,kontrak',
            'phone'        => 'required|string|max:20',
            'is_married'   => 'required|boolean',
            'id_card_photo'=> 'nullable|image|max:2048', // max 2MB
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
            'name'         => 'required|string|max:255',
            'status'       => 'required|in:tetap,kontrak',
            'phone'        => 'required|string|max:20',
            'is_married'   => 'required|boolean',
            'id_card_photo'=> 'nullable|image|max:2048',
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

        $oldName = $resident->name;

        $resident->update($validated);

        // Jika nama penghuni berubah, sinkronkan snapshot resident_name
        // di semua record riwayat house_residents yang terhubung.
        if (isset($validated['name']) && $validated['name'] !== $oldName) {
            HouseResident::where('resident_id', $resident->id)
                ->update(['resident_name' => $validated['name']]);
        }

        return response()->json($resident);
    }

    public function destroy($id)
    {
        $resident = Resident::findOrFail($id);

        // Foto KTP dihapus
        if ($resident->id_card_photo) {
            $oldPath = str_replace('/storage/', '', $resident->id_card_photo);
            Storage::disk('public')->delete($oldPath);
        }

        DB::transaction(function () use ($resident) {
            // Dapatkan semua ID rumah di mana warga ini saat ini aktif sebagai penghuni
            $houseIds = HouseResident::where('resident_id', $resident->id)
                ->where('is_active', true)
                ->pluck('house_id');

            // Sebelum delete: set end_date pada riwayat hunian aktif yang masih terhubung
            // (FK resident_id akan di-SET NULL oleh database, resident_name tetap tersimpan)
            HouseResident::where('resident_id', $resident->id)
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'end_date'  => now()->toDateString(),
                ]);

            // Update status unit rumah yang ditinggalkan menjadi 'tidak_dihuni'
            if ($houseIds->isNotEmpty()) {
                House::whereIn('id', $houseIds)->update(['status' => 'tidak_dihuni']);
            }

            $resident->delete();
        });

        return response()->json(['message' => 'Resident deleted successfully']);
    }
}
