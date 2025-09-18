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
        Schema::connection('app')->create('u_g_d_resume_medis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_klaim_id')->constrained('pengajuan_klaim')->onDelete('cascade');
            
            // Identitas Pasien dari frontend
            $table->text('nama')->nullable();
            $table->text('norm')->nullable();
            $table->text('tanggal_lahir')->nullable();
            $table->text('jenis_kelamin')->nullable();
            $table->text('tanggal_masuk')->nullable();
            $table->text('tanggal_keluar')->nullable();
            $table->text('ruangan')->nullable();
            $table->text('penanggung_jawab')->nullable();
            $table->text('dokter')->nullable();
            
            // Medical Data dari frontend
            $table->text('indikasi_rawat_inap')->nullable();
            $table->text('riwayat_penyakit_dahulu')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('pemeriksaan_fisik')->nullable();
            $table->text('hasil_konsultasi')->nullable();
            
            // Tanda Vital dari frontend
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
            
            // Discharge dari frontend
            $table->text('cara_keluar')->nullable();
            $table->text('keadaan_keluar')->nullable();
            
            // Kontrol dari frontend
            $table->text('jadwal_kontrol_tanggal')->nullable();
            $table->text('jadwal_kontrol_jam')->nullable();
            $table->text('jadwal_kontrol_tujuan')->nullable();
            $table->text('jadwal_kontrol_nomor_bpjs')->nullable();
            
            // Arrays dari frontend
            $table->json('selected_diagnosa')->nullable();
            $table->json('selected_procedures')->nullable();
            $table->json('resep_pulang')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('u_g_d_resume_medis');
    }
};
