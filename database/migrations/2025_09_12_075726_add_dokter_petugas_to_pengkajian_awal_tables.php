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
        // UGD Pengkajian Awal
        Schema::connection('app')->table('u_g_d_pengkajian_awals', function (Blueprint $table) {
            $table->string('dokter')->nullable()->after('rencana_terapi');
            $table->string('petugas')->nullable()->after('dokter');
        });

        // Rawat Jalan Pengkajian Awal
        Schema::connection('app')->table('rawat_jalan_pengkajian_awals', function (Blueprint $table) {
            $table->string('dokter')->nullable()->after('selected_diagnosa');
            $table->string('petugas')->nullable()->after('dokter');
        });

        // Rawat Inap Pengkajian Awal
        Schema::connection('app')->table('rawat_inap_pengkajian_awals', function (Blueprint $table) {
            $table->string('dokter')->nullable()->after('selected_diagnosa');
            $table->string('petugas')->nullable()->after('dokter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // UGD Pengkajian Awal
        Schema::connection('app')->table('u_g_d_pengkajian_awals', function (Blueprint $table) {
            $table->dropColumn(['dokter', 'petugas']);
        });

        // Rawat Jalan Pengkajian Awal
        Schema::connection('app')->table('rawat_jalan_pengkajian_awals', function (Blueprint $table) {
            $table->dropColumn(['dokter', 'petugas']);
        });

        // Rawat Inap Pengkajian Awal
        Schema::connection('app')->table('rawat_inap_pengkajian_awals', function (Blueprint $table) {
            $table->dropColumn(['dokter', 'petugas']);
        });
    }
};
