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
        Schema::table('data_groupper', function (Blueprint $table) {
            $table->string('stage')->default('1')->after('nomor_sep');
            $table->json('special_cmg')->nullable()->after('tarif_alt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_groupper', function (Blueprint $table) {
            $table->dropColumn(['stage', 'special_cmg']);
        });
    }
};
