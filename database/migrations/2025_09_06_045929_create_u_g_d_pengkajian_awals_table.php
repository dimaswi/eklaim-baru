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
        Schema::connection('app')->create('u_g_d_pengkajian_awals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_klaim_id')->constrained('pengajuan_klaim')->onDelete('cascade');
            $table->string('kunjungan_nomor')->nullable();
            
            // Identitas Pasien
            $table->text('nama')->nullable();
            $table->text('norm')->nullable();
            $table->text('tanggal_lahir')->nullable();
            $table->text('jenis_kelamin')->nullable();
            $table->text('tanggal_masuk')->nullable();
            $table->text('tanggal_keluar')->nullable();
            $table->text('alamat')->nullable();
            $table->text('ruangan')->nullable();
            
            // Anamnesis
            $table->text('autoanamnesis')->nullable();
            $table->text('alloanamnesis')->nullable();
            $table->text('anamnesis_dari')->nullable();
            $table->text('keluhan_utama')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('riwayat_penyakit_dahulu')->nullable();
            $table->text('faktor_resiko')->nullable();
            
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
            
            // Pemeriksaan Fisik
            $table->text('mata')->nullable();
            $table->text('pupil')->nullable();
            $table->text('ikterus')->nullable();
            $table->text('diameter_pupil')->nullable();
            $table->text('udem_palpebrae')->nullable();
            $table->text('tht')->nullable();
            $table->text('faring')->nullable();
            $table->text('tongsil')->nullable();
            $table->text('lidah')->nullable();
            $table->text('bibir')->nullable();
            $table->text('leher')->nullable();
            $table->text('jvp')->nullable();
            $table->text('limfe')->nullable();
            $table->text('kaku_kuduk')->nullable();
            $table->text('thoraks')->nullable();
            $table->text('cor')->nullable();
            $table->text('s1s2')->nullable();
            $table->text('mur_mur')->nullable();
            $table->text('pulmo')->nullable();
            $table->text('ronchi')->nullable();
            $table->text('wheezing')->nullable();
            $table->text('peristaltik')->nullable();
            $table->text('abdomen')->nullable();
            $table->text('meteorismus')->nullable();
            $table->text('asites')->nullable();
            $table->text('nyeri_tekan')->nullable();
            $table->text('hepar')->nullable();
            $table->text('lien')->nullable();
            $table->text('extremitas')->nullable();
            $table->text('udem')->nullable();
            $table->text('defeksesi')->nullable();
            $table->text('urin')->nullable();
            $table->text('kelainan')->nullable();
            $table->text('lainnya')->nullable();
            
            // Riwayat Alergi
            $table->text('riwayat_alergi')->nullable();
            
            // Status Psikologi - digabung dalam JSON
            $table->json('status_psikologi')->nullable();
            
            // Status Mental dan Hubungan Keluarga - digabung dalam JSON
            $table->json('status_mental_hubungan')->nullable();
            
            // Tempat Tinggal - digabung dalam JSON
            $table->json('tempat_tinggal')->nullable();
            
            // Spiritual - digabung dalam JSON
            $table->json('spiritual')->nullable();
            
            // Keputusan dan Ekonomi - digabung dalam JSON
            $table->json('ekonomi')->nullable();
            
            // Penilaian Nyeri
            $table->text('nyeri')->nullable();
            $table->text('onset')->nullable();
            $table->text('pencetus')->nullable();
            $table->text('lokasi_nyeri')->nullable();
            $table->text('gambaran_nyeri')->nullable();
            $table->text('durasi_nyeri')->nullable();
            $table->text('skala_nyeri')->nullable();
            $table->text('metode_nyeri')->nullable();
            
            // Edukasi Pasien - digabung dalam JSON
            $table->json('edukasi')->nullable();
            
            // Medical
            $table->text('masalah_medis')->nullable();
            $table->text('diagnosis_medis')->nullable();
            $table->text('rencana_terapi')->nullable();
            $table->json('selected_diagnosa')->nullable();
            
            $table->timestamps();

            $table->index(['pengajuan_klaim_id', 'kunjungan_nomor'], 'ugd_pengkajian_klaim_kunjungan_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('u_g_d_pengkajian_awals');
    }
};
