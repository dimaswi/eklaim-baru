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
        Schema::connection('app')->create('hasil_radiologis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('kunjungan_nomor');
            $table->text('tanggal_pemeriksaan');
            $table->text('jenis_pemeriksaan');
            $table->text('tindakan_id')->nullable();
            $table->text('nama_tindakan')->nullable();
            $table->text('klinis')->nullable();
            $table->text('kesan')->nullable();
            $table->text('usul')->nullable();
            $table->text('hasil')->nullable();
            $table->text('btk')->nullable();
            $table->json('hasil_radiologi')->nullable();
            $table->text('saran')->nullable();
            $table->text('dokter_radiologi')->nullable();
            $table->text('dokter_pengirim')->nullable();
            $table->timestamps();

            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->index(['pengajuan_klaim_id', 'kunjungan_nomor'], 'radiologi_klaim_kunjungan_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('hasil_radiologis');
    }
};
