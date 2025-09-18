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
        Schema::connection('app')->table('u_g_d_triages', function (Blueprint $table) {
            $table->string('dokter')->nullable()->after('jenis_kelamin');
            $table->string('petugas')->nullable()->after('dokter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->table('u_g_d_triages', function (Blueprint $table) {
            $table->dropColumn(['dokter', 'petugas']);
        });
    }
};
