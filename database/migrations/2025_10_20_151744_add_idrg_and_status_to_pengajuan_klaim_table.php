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
        Schema::connection('app')->table('pengajuan_klaim', function (Blueprint $table) {
            // Add IDRG column - untuk menyimpan kode INA-DRG
            $table->tinyInteger('idrg')->default(0)->after('status_pengiriman')->comment('Kode INA-DRG');
            
            // Add indexes for better performance
            $table->index('idrg', 'idx_pengajuan_klaim_idrg');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->table('pengajuan_klaim', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('idx_pengajuan_klaim_idrg');
            
            // Drop columns
            $table->dropColumn(['idrg']);
        });
    }
};
