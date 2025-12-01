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
        Schema::connection('app')->create('rawat_inap_cppts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('kunjungan_nomor');
            $table->date('tanggal');
            $table->string('profesi');
            $table->text('subyektif')->nullable();
            $table->text('obyektif')->nullable();
            $table->text('assesment')->nullable();
            $table->text('planning')->nullable();
            $table->text('instruksi')->nullable();
            $table->string('nama_petugas');
            $table->timestamps();

            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->index(['pengajuan_klaim_id', 'kunjungan_nomor'], 'cppt_klaim_kunjungan_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('rawat_inap_cppts');
    }
};
