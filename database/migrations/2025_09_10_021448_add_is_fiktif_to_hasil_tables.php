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
        // Tambah field is_fiktif ke tabel hasil_laboratoriums
        Schema::connection('app')->table('hasil_laboratoriums', function (Blueprint $table) {
            $table->boolean('is_fiktif')->default(false)->after('pasien_data');
            $table->string('nomor_kunjungan_fiktif')->nullable()->after('is_fiktif');
            $table->text('template_data')->nullable()->after('nomor_kunjungan_fiktif');
        });

        // Tambah field is_fiktif ke tabel hasil_radiologis
        Schema::connection('app')->table('hasil_radiologis', function (Blueprint $table) {
            $table->boolean('is_fiktif')->default(false)->after('dokter_pengirim');
            $table->string('nomor_kunjungan_fiktif')->nullable()->after('is_fiktif');
            $table->text('template_data')->nullable()->after('nomor_kunjungan_fiktif');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->table('hasil_laboratoriums', function (Blueprint $table) {
            $table->dropColumn(['is_fiktif', 'nomor_kunjungan_fiktif', 'template_data']);
        });

        Schema::connection('app')->table('hasil_radiologis', function (Blueprint $table) {
            $table->dropColumn(['is_fiktif', 'nomor_kunjungan_fiktif', 'template_data']);
        });
    }
};
