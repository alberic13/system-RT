<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * - Tambah kolom resident_name (snapshot nama penghuni saat assignment)
     * - Ubah foreign key resident_id agar SET NULL saat resident dihapus
     *   sehingga riwayat tetap terjaga.
     */
    public function up(): void
    {
        // 1. Tambah kolom resident_name sebagai snapshot nama (jika belum ada)
        if (!Schema::hasColumn('house_residents', 'resident_name')) {
            Schema::table('house_residents', function (Blueprint $table) {
                $table->string('resident_name')->nullable()->after('resident_id');
            });

            // 2. Isi resident_name dari data residents yang ada saat ini
            DB::statement('
                UPDATE house_residents
                SET resident_name = (
                    SELECT name
                    FROM residents
                    WHERE residents.id = house_residents.resident_id
                )
                WHERE EXISTS (
                    SELECT 1
                    FROM residents
                    WHERE residents.id = house_residents.resident_id
                )
            ');
        }

        // 3. Ubah resident_id menjadi nullable agar FK SET NULL bisa bekerja
        if (Schema::hasColumn('house_residents', 'resident_id')) {
            Schema::table('house_residents', function (Blueprint $table) {
                $table->unsignedBigInteger('resident_id')->nullable()->change();
            });
        }

        // 4. Drop foreign key lama lalu buat ulang dengan onDelete SET NULL
        Schema::table('house_residents', function (Blueprint $table) {
            // Drop old FK (nama constraint ikut konvensi Laravel)
            try {
                $table->dropForeign(['resident_id']);
            } catch (\Exception $e) {
                // FK sudah tidak ada atau sudah dihapus
            }
            
            // Buat ulang dengan SET NULL agar riwayat tidak ikut terhapus
            $table->foreign('resident_id')
                  ->references('id')
                  ->on('residents')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('house_residents', function (Blueprint $table) {
            // Kembalikan ke cascade delete
            try {
                $table->dropForeign(['resident_id']);
            } catch (\Exception $e) {
                // FK sudah tidak ada
            }
            
            $table->foreign('resident_id')
                  ->references('id')
                  ->on('residents')
                  ->onDelete('cascade');

            if (Schema::hasColumn('house_residents', 'resident_name')) {
                $table->dropColumn('resident_name');
            }
        });
    }
};

