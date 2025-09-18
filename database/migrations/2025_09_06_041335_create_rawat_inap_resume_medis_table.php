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
        Schema::connection('app')->create('rawat_inap_resume_medis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('kunjungan_nomor');
            $table->text('nama');
            $table->text('norm');
            $table->text('tanggal_lahir');
            $table->text('jenis_kelamin'); // 1=Laki-laki, 2=Perempuan
            $table->text('tanggal_masuk');
            $table->text('tanggal_keluar')->nullable();
            $table->text('ruangan');
            $table->text('penanggung_jawab');
            $table->text('indikasi_rawat_inap')->nullable();
            $table->text('riwayat_penyakit_dahulu')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('pemeriksaan_fisik')->nullable();
            $table->text('hasil_konsultasi')->nullable();
            $table->text('tanda_vital_keadaan_umum')->nullable();
            $table->text('tanda_vital_kesadaran')->nullable();
            $table->text('tanda_vital_sistolik')->nullable();
            $table->text('tanda_vital_distolik')->nullable();
            $table->text('tanda_vital_frekuensi_nadi')->nullable();
            $table->text('tanda_vital_frekuensi_nafas')->nullable();
            $table->text('tanda_vital_suhu')->nullable();
            $table->text('tanda_vital_saturasi_o2')->nullable();
            $table->text('tanda_vital_eye')->nullable();
            $table->text('tanda_vital_motorik')->nullable();
            $table->text('tanda_vital_verbal')->nullable();
            $table->text('tanda_vital_gcs')->nullable();
            $table->text('cara_keluar')->nullable();
            $table->text('keadaan_keluar')->nullable();
            $table->text('jadwal_kontrol_tanggal')->nullable();
            $table->text('jadwal_kontrol_jam')->nullable();
            $table->text('jadwal_kontrol_tujuan')->nullable();
            $table->text('jadwal_kontrol_nomor_bpjs')->nullable();
            $table->text('dokter');
            $table->json('selected_diagnosa')->nullable();
            $table->json('selected_procedures')->nullable();
            $table->json('resep_pulang')->nullable();
            $table->timestamps();

            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->index(['pengajuan_klaim_id', 'kunjungan_nomor'], 'resume_klaim_kunjungan_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rawat_inap_resume_medis');
    }
};
