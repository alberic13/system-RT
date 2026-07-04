<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Change enum to string to support dynamic payment types
            $table->string('type')->change();
            
            // Add proof of payment column
            $table->string('payment_proof')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('type', ['kebersihan', 'satpam'])->change();
            $table->dropColumn('payment_proof');
        });
    }
};
