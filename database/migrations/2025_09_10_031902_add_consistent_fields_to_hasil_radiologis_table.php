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
        Schema::connection('app')->table('hasil_radiologis', function (Blueprint $table) {
            // Add consistent fields to match hasil_laboratoriums structure
            $table->text('tindakan_medis_data')->nullable()->after('kunjungan_nomor');
            $table->text('pasien_data')->nullable()->after('tindakan_medis_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->table('hasil_radiologis', function (Blueprint $table) {
            $table->dropColumn(['tindakan_medis_data', 'pasien_data']);
        });
    }
};
