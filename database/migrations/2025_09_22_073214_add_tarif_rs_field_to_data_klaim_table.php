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
        Schema::connection('app')->table('data_klaim', function (Blueprint $table) {
            // Add tarif_rs JSON field to store nested tariff data
            $table->json('tarif_rs')->nullable()->after('total_tarif');
            
            // Add some missing fields that might be needed
            $table->string('nomor_kartu_t', 50)->nullable()->after('nomor_kartu');
            $table->string('bayi_lahir_status_cd', 10)->nullable()->after('nomor_kartu_t');
            $table->string('covid19_status_cd', 10)->nullable()->after('bayi_lahir_status_cd');
            $table->string('payor_id', 50)->nullable()->after('covid19_status_cd');
            $table->string('payor_cd', 50)->nullable()->after('payor_id');
            
            // COVID-19 related fields
            $table->string('covid19_rs_darurat_ind', 10)->nullable()->after('payor_cd');
            $table->string('pemulasaraan_jenazah', 10)->nullable()->after('covid19_rs_darurat_ind');
            
            // Additional vital signs and medical data
            $table->string('kesadaran', 50)->nullable()->after('pemulasaraan_jenazah');
            $table->string('riwayat_alergi_obat', 255)->nullable()->after('kesadaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->table('data_klaim', function (Blueprint $table) {
            $table->dropColumn([
                'tarif_rs',
                'nomor_kartu_t',
                'bayi_lahir_status_cd',
                'covid19_status_cd',
                'payor_id',
                'payor_cd',
                'covid19_rs_darurat_ind',
                'pemulasaraan_jenazah',
                'kesadaran',
                'riwayat_alergi_obat'
            ]);
        });
    }
};
