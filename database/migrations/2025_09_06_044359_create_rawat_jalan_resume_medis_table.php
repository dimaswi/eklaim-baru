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
        Schema::connection('app')->create('rawat_jalan_resume_medis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('kunjungan_nomor');
            
            // Data Pasien
            $table->text('nama')->nullable();
            $table->string('norm')->nullable();
            $table->text('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->text('ruangan')->nullable();
            $table->text('penanggung_jawab')->nullable();
            $table->text('dokter')->nullable();
            
            // Data Medis
            $table->text('tanggal_masuk')->nullable();
            $table->text('tanggal_keluar')->nullable();
            $table->integer('lama_rawat')->nullable();
            $table->text('indikasi_rawat_inap')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('riwayat_penyakit_dahulu')->nullable();
            $table->text('riwayat_pengobatan')->nullable();
            $table->text('riwayat_penyakit_keluarga')->nullable();
            $table->text('pemeriksaan_fisik')->nullable();
            $table->text('pemeriksaan_penunjang')->nullable();
            $table->text('hasil_konsultasi')->nullable();
            
            // Tanda Vital
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
            
            // Discharge
            $table->text('cara_keluar')->nullable();
            $table->text('keadaan_keluar')->nullable();
            
            // Jadwal Kontrol
            $table->text('jadwal_kontrol_tanggal')->nullable();
            $table->text('jadwal_kontrol_jam')->nullable();
            $table->text('jadwal_kontrol_tujuan')->nullable();
            $table->text('jadwal_kontrol_nomor_bpjs')->nullable();
            
            // Data Array JSON
            $table->json('selected_diagnosa')->nullable();
            $table->json('selected_procedures')->nullable();
            $table->json('resep_pulang')->nullable();
            $table->timestamps();

            $table->foreign('pengajuan_klaim_id')->references('id')->on('pengajuan_klaim')->onDelete('cascade');
            $table->index(['pengajuan_klaim_id', 'kunjungan_nomor'], 'rj_resume_klaim_kunjungan_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('rawat_jalan_resume_medis');
    }
};
