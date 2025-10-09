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
        Schema::connection('app')->create('data_groupper_stage2', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->unsignedBigInteger('data_groupper_id'); // Reference to stage 1
            $table->string('nomor_sep');
            $table->string('selected_special_cmg'); // Which special CMG was selected
            
            // Metadata
            $table->integer('metadata_code')->nullable();
            $table->string('metadata_message')->nullable();
            
            // CBG Data (same as stage 1 but might be different)
            $table->string('cbg_code')->nullable();
            $table->text('cbg_description')->nullable();
            $table->string('cbg_tariff')->nullable();
            
            // Special CMG Data (the selected one)
            $table->json('special_cmg')->nullable();
            
            // Additional Data
            $table->string('kelas')->nullable();
            $table->bigInteger('add_payment_amt')->nullable();
            $table->string('inacbg_version')->nullable();
            
            // COVID-19 Data (might be different from stage 1)
            $table->json('covid19_data')->nullable();
            
            // INA Grouper Response (might be different from stage 1)
            $table->json('response_inagrouper')->nullable();
            
            // Special CMG Options (available options)
            $table->json('special_cmg_option')->nullable();
            
            // Tarif Alternative with Special CMG tariffs
            $table->json('tarif_alt')->nullable();
            
            // Full response for backup
            $table->json('full_response')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->foreign('data_groupper_id')->references('id')->on('data_groupper')->onDelete('cascade');
            $table->index(['nomor_sep']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('data_groupper_stage2');
    }
};
