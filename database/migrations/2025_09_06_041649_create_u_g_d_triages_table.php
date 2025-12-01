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
        Schema::connection('app')->create('u_g_d_triages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('kunjungan_nomor');
            $table->text('nama');
            $table->text('norm');
            $table->text('tanggal_lahir');
            $table->text('jenis_kelamin');
            $table->boolean('kedatangan_datang_sendiri')->default(false);
            $table->text('kedatangan_pengantar')->nullable();
            $table->text('kedatangan_alat_transportasi')->nullable();
            $table->boolean('kedatangan_polisi')->default(false);
            $table->text('kedatangan_asal_rujukan')->nullable();
            $table->boolean('kasus_jenis_kasus')->default(false);
            $table->boolean('kasus_laka_lantas')->default(false);
            $table->boolean('kasus_kecelakaan_kerja')->default(false);
            $table->text('kasus_lokasi')->nullable();
            $table->text('anamnese_terpimpin')->nullable();
            $table->text('anamnese_keluhan_utama')->nullable();
            $table->text('tanda_vital_tekanan_darah')->nullable();
            $table->text('tanda_vital_suhu')->nullable();
            $table->text('tanda_vital_nadi')->nullable();
            $table->text('tanda_vital_pernafasan')->nullable();
            $table->text('tanda_vital_skala_nyeri')->nullable();
            $table->text('tanda_vital_metode_ukur')->nullable();
            $table->boolean('triage_resusitasi')->default(false);
            $table->boolean('triage_emergency')->default(false);
            $table->boolean('triage_urgent')->default(false);
            $table->boolean('triage_less_urgent')->default(false);
            $table->boolean('triage_non_urgent')->default(false);
            $table->boolean('triage_doa')->default(false);
            $table->text('kategori_triage')->nullable();
            $table->timestamps();

            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->index(['pengajuan_klaim_id', 'kunjungan_nomor'], 'triage_klaim_kunjungan_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('ugd_triages');
    }
};
