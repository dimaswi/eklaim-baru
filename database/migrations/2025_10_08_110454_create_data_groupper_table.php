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
        Schema::connection('app')->create('data_groupper', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('nomor_sep');
            
            // Metadata
            $table->integer('metadata_code')->nullable();
            $table->string('metadata_message')->nullable();
            
            // CBG Data
            $table->string('cbg_code')->nullable();
            $table->text('cbg_description')->nullable();
            $table->string('cbg_tariff')->nullable();
            
            // Sub Acute Data
            $table->string('sub_acute_code')->nullable();
            $table->text('sub_acute_description')->nullable();
            $table->bigInteger('sub_acute_tariff')->nullable();
            
            // Chronic Data
            $table->string('chronic_code')->nullable();
            $table->text('chronic_description')->nullable();
            $table->bigInteger('chronic_tariff')->nullable();
            
            // Additional Data
            $table->string('kelas')->nullable();
            $table->bigInteger('add_payment_amt')->nullable();
            $table->string('inacbg_version')->nullable();
            
            // COVID-19 Data (stored as JSON)
            $table->json('covid19_data')->nullable();
            
            // INA Grouper Response (stored as JSON)
            $table->json('response_inagrouper')->nullable();
            
            // Special CMG Options (stored as JSON)
            $table->json('special_cmg_option')->nullable();
            
            // Tarif Alternative (stored as JSON)
            $table->json('tarif_alt')->nullable();
            
            // Full response for backup (stored as JSON)
            $table->json('full_response')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->index(['nomor_sep']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('data_groupper');
    }
};
