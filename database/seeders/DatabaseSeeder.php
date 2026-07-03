<?php

namespace Database\Seeders;

use App\Models\House;
use App\Models\Resident;
use App\Models\HouseResident;
use App\Models\Payment;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create 20 Houses
        $houses = [];
        for ($i = 1; $i <= 20; $i++) {
            $code = 'A-' . str_pad($i, 2, '0', STR_PAD_LEFT);
            $houses[] = House::create([
                'house_code' => $code,
                'status' => 'tidak_dihuni', // will update once residents are assigned
            ]);
        }

        // 2. Create 18 Residents
        // 15 Permanent Residents
        $permanentNames = [
            'Budi Santoso', 'Siti Rahma', 'Joko Widodo', 'Dewi Lestari', 'Ahmad Fauzi',
            'Rini Amalia', 'Hendra Wijaya', 'Mega Utami', 'Andi Pratama', 'Yulia Fitri',
            'Rudi Hermawan', 'Lina Marlina', 'Fajar Sidik', 'Evi Sofia', 'Wawan Setiawan'
        ];

        $permanentResidents = [];
        foreach ($permanentNames as $name) {
            $permanentResidents[] = Resident::create([
                'name' => $name,
                'id_card_photo' => null,
                'status' => 'tetap',
                'phone' => '0812' . rand(10000000, 99999999),
                'is_married' => (bool)rand(0, 1),
            ]);
        }

        // 3 Temporary Residents (contractors)
        $contractNames = ['Ryan Hidayat', 'Dina Kartika', 'Gani Prakoso'];
        $contractResidents = [];
        foreach ($contractNames as $name) {
            $contractResidents[] = Resident::create([
                'name' => $name,
                'id_card_photo' => null,
                'status' => 'kontrak',
                'phone' => '0857' . rand(10000000, 99999999),
                'is_married' => (bool)rand(0, 1),
            ]);
        }

        // 3. Assign Residents to Houses & Create Residency History
        // Houses 1 to 15: Permanent residents
        for ($i = 0; $i < 15; $i++) {
            $house = $houses[$i];
            $resident = $permanentResidents[$i];

            // Setup active residency
            HouseResident::create([
                'house_id' => $house->id,
                'resident_id' => $resident->id,
                'is_active' => true,
                'start_date' => Carbon::create(2025, 1, 1),
            ]);

            $house->update(['status' => 'dihuni']);

            // Create some past historical residents for House A-01 and A-02 to test history
            if ($i === 0) {
                HouseResident::create([
                    'house_id' => $house->id,
                    'resident_id' => Resident::create([
                        'name' => 'Anto Wijaya (Alumni)',
                        'status' => 'kontrak',
                        'phone' => '089912345678',
                        'is_married' => false,
                    ])->id,
                    'is_active' => false,
                    'start_date' => Carbon::create(2024, 1, 1),
                    'end_date' => Carbon::create(2024, 12, 31),
                ]);
            }
        }

        // Houses 16 to 18: Temporary residents (occupied)
        for ($i = 0; $i < 3; $i++) {
            $house = $houses[15 + $i];
            $resident = $contractResidents[$i];

            HouseResident::create([
                'house_id' => $house->id,
                'resident_id' => $resident->id,
                'is_active' => true,
                'start_date' => Carbon::create(2026, 1, 1),
            ]);

            $house->update(['status' => 'dihuni']);
        }

        // Houses 19 and 20 remain 'tidak_dihuni' (unoccupied)

        // 4. Seed Payments for 2026 (Jan to Jun)
        // Kebersihan: 15k, Satpam: 100k
        $months = range(1, 6);
        $year = 2026;

        // Fetch all active house residents
        $activeResidencies = HouseResident::where('is_active', true)->get();

        foreach ($activeResidencies as $residency) {
            $houseId = $residency->house_id;
            $residentId = $residency->resident_id;
            $resident = $residency->resident;

            // Make Budi Santoso (Resident 1) pay the full year (12 months) for Kebersihan to show "iuran 1 tahun" feature
            if ($resident->name === 'Budi Santoso') {
                for ($m = 1; $m <= 12; $m++) {
                    Payment::create([
                        'house_id' => $houseId,
                        'resident_id' => $residentId,
                        'type' => 'kebersihan',
                        'amount' => 15000,
                        'month' => $m,
                        'year' => $year,
                        'payment_date' => Carbon::create($year, 1, 10),
                        'status' => 'lunas',
                    ]);
                }
                // Also Budi pays monthly for satpam (Jan to Jun)
                for ($m = 1; $m <= 6; $m++) {
                    Payment::create([
                        'house_id' => $houseId,
                        'resident_id' => $residentId,
                        'type' => 'satpam',
                        'amount' => 100000,
                        'month' => $m,
                        'year' => $year,
                        'payment_date' => Carbon::create($year, $m, 10),
                        'status' => 'lunas',
                    ]);
                }
                continue;
            }

            // Normal residents pay monthly
            foreach ($months as $m) {
                // Introduce some randomness for unpaid bills to verify "belum lunas" reporting
                // Let's say house A-05 and A-10 skipped payment for May and June
                $houseCode = House::find($houseId)->house_code;
                if (($houseCode === 'A-05' || $houseCode === 'A-10') && ($m === 5 || $m === 6)) {
                    continue; // Leave unpaid
                }

                // Kebersihan (15k)
                Payment::create([
                    'house_id' => $houseId,
                    'resident_id' => $residentId,
                    'type' => 'kebersihan',
                    'amount' => 15000,
                    'month' => $m,
                    'year' => $year,
                    'payment_date' => Carbon::create($year, $m, rand(5, 15)),
                    'status' => 'lunas',
                ]);

                // Satpam (100k)
                Payment::create([
                    'house_id' => $houseId,
                    'resident_id' => $residentId,
                    'type' => 'satpam',
                    'amount' => 100000,
                    'month' => $m,
                    'year' => $year,
                    'payment_date' => Carbon::create($year, $m, rand(5, 15)),
                    'status' => 'lunas',
                ]);
            }
        }

        // 5. Seed Monthly Expenses for 2026 (Jan to Jun)
        foreach ($months as $m) {
            // Fixed Expense 1: Gaji Satpam (1,500,000 IDR)
            Expense::create([
                'description' => 'Gaji Satpam Bulan ' . Carbon::create(2026, $m, 1)->format('F'),
                'amount' => 1500000,
                'date' => Carbon::create($year, $m, 28),
            ]);

            // Fixed Expense 2: Token Listrik Pos Satpam (200,000 IDR)
            Expense::create([
                'description' => 'Token Listrik Pos Satpam Bulan ' . Carbon::create(2026, $m, 1)->format('F'),
                'amount' => 200000,
                'date' => Carbon::create($year, $m, 5),
            ]);
        }

        // Occasional/Random Expenses
        Expense::create([
            'description' => 'Perbaikan Pipa Selokan Utama RT',
            'amount' => 750000,
            'date' => Carbon::create(2026, 2, 14),
        ]);

        Expense::create([
            'description' => 'Fogging Demam Berdarah Serentak',
            'amount' => 450000,
            'date' => Carbon::create(2026, 4, 18),
        ]);

        Expense::create([
            'description' => 'Perbaikan Lubang Jalan Blok A',
            'amount' => 3000000,
            'date' => Carbon::create(2026, 5, 22),
        ]);
    }
}
