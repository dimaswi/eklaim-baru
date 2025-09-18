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
        // UGD Resume Medis
        Schema::connection('app')->table('u_g_d_resume_medis', function (Blueprint $table) {
            $table->string('petugas')->nullable()->after('dokter');
        });

        // Rawat Jalan Resume Medis
        Schema::connection('app')->table('rawat_jalan_resume_medis', function (Blueprint $table) {
            $table->string('petugas')->nullable()->after('dokter');
        });

        // Rawat Inap Resume Medis
        Schema::connection('app')->table('rawat_inap_resume_medis', function (Blueprint $table) {
            $table->string('petugas')->nullable()->after('dokter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // UGD Resume Medis
        Schema::connection('app')->table('u_g_d_resume_medis', function (Blueprint $table) {
            $table->dropColumn('petugas');
        });

        // Rawat Jalan Resume Medis
        Schema::connection('app')->table('rawat_jalan_resume_medis', function (Blueprint $table) {
            $table->dropColumn('petugas');
        });

        // Rawat Inap Resume Medis
        Schema::connection('app')->table('rawat_inap_resume_medis', function (Blueprint $table) {
            $table->dropColumn('petugas');
        });
    }
};
