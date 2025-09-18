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
        Schema::connection('app')->create('rawat_inap_balance_cairans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('kunjungan_nomor');
            $table->text('intake_oral')->nullable();
            $table->text('intake_ngt')->nullable();
            $table->text('konsumsi_jumlah')->nullable();
            $table->text('transfusi_produk')->nullable();
            $table->text('transfusi_produk_jumlah')->nullable();
            $table->text('output_oral')->nullable();
            $table->text('output_ngt')->nullable();
            $table->text('urine_jumlah')->nullable();
            $table->text('pendarahan_jumlah')->nullable();
            $table->text('fases_jumlah')->nullable();
            $table->text('total_intake')->nullable();
            $table->text('total_output')->nullable();
            $table->text('volume_intake')->nullable();
            $table->text('volume_output')->nullable();
            $table->text('volume_balance')->nullable();
            $table->text('suhu')->nullable();
            $table->text('waktu_pemeriksaan');
            $table->text('tanggal');
            $table->text('nama_petugas');
            $table->timestamps();

            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->index(['pengajuan_klaim_id', 'kunjungan_nomor'], 'balance_klaim_kunjungan_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rawat_inap_balance_cairans');
    }
};
