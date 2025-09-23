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
        Schema::connection('app')->create('data_klaim', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_sep', 19)->unique()->index();
            $table->foreignId('pengajuan_klaim_id')->nullable()->constrained('pengajuan_klaim')->onDelete('cascade');
            
            // Header Information
            $table->string('nomor_kartu', 13)->nullable();
            $table->string('nomor_rm', 20)->nullable();
            $table->string('nama_pasien', 255)->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('nik', 16)->nullable();
            $table->string('nomor_telepon', 15)->nullable();
            $table->text('alamat')->nullable();
            $table->string('kelurahan', 100)->nullable();
            $table->string('kecamatan', 100)->nullable();
            $table->string('kabupaten', 100)->nullable();
            $table->string('provinsi', 100)->nullable();
            $table->string('kode_pos', 5)->nullable();
            $table->string('nomor_rujukan', 19)->nullable();
            $table->string('faskes_rujukan', 255)->nullable();
            $table->string('ppk_pelayanan', 8)->nullable();
            $table->date('tanggal_sep')->nullable();
            $table->datetime('tanggal_masuk')->nullable();
            $table->datetime('tanggal_keluar')->nullable();
            $table->string('cara_masuk', 50)->nullable();
            $table->text('keluhan')->nullable();
            $table->json('alergi')->nullable();
            $table->string('kelas_rawat', 50)->nullable();
            $table->string('nomor_registrasi', 20)->nullable();
            $table->string('nomor_kamar', 10)->nullable();
            $table->string('ruangan', 100)->nullable();
            $table->integer('naik_kelas')->nullable();
            
            // ICD Data
            $table->string('kode_icd10_primer', 10)->nullable();
            $table->string('diagnosa_primer', 500)->nullable();
            $table->json('diagnosa_sekunder')->nullable();
            $table->string('kode_icd9_primer', 10)->nullable();
            $table->string('tindakan_primer', 500)->nullable();
            $table->json('tindakan_sekunder')->nullable();
            
            // Tariff Information
            $table->decimal('akomodasi', 12, 2)->nullable();
            $table->decimal('asuhan_keperawatan', 12, 2)->nullable();
            $table->decimal('bahan_medis_habis_pakai', 12, 2)->nullable();
            $table->decimal('kamar_operasi', 12, 2)->nullable();
            $table->decimal('konsultasi', 12, 2)->nullable();
            $table->decimal('obat', 12, 2)->nullable();
            $table->decimal('pelayanan_darah', 12, 2)->nullable();
            $table->decimal('penunjang', 12, 2)->nullable();
            $table->decimal('prosedur_bedah', 12, 2)->nullable();
            $table->decimal('prosedur_non_bedah', 12, 2)->nullable();
            $table->decimal('rehabilitasi', 12, 2)->nullable();
            $table->decimal('sewa_alat', 12, 2)->nullable();
            $table->decimal('visite', 12, 2)->nullable();
            $table->decimal('icu', 12, 2)->nullable();
            $table->decimal('iccu', 12, 2)->nullable();
            $table->decimal('alat_kesehatan', 12, 2)->nullable();
            $table->decimal('transport_pasien', 12, 2)->nullable();
            $table->decimal('lain_lain', 12, 2)->nullable();
            $table->decimal('total_tarif', 12, 2)->nullable();
            
            // Case Information
            $table->string('tipe_discharge', 50)->nullable();
            $table->boolean('case_death')->default(false);
            $table->string('adl_score', 10)->nullable();
            $table->boolean('upgrade_class_ind')->default(false);
            $table->string('los_icu', 10)->nullable();
            $table->string('ventilator_hour', 10)->nullable();
            $table->string('upgrade_class_class', 50)->nullable();
            $table->string('upgrade_class_los', 10)->nullable();
            $table->decimal('upgrade_class_payor', 12, 2)->nullable();
            $table->decimal('birth_weight', 8, 2)->nullable();
            
            // COVID-19 Fields
            $table->boolean('covid_19_status')->default(false);
            $table->json('covid_19_cc')->nullable();
            $table->json('covid_19_pcare')->nullable();
            
            // Additional Medical Information
            $table->text('pemeriksaan_penunjang')->nullable();
            $table->string('cara_pulang', 50)->nullable();
            $table->string('kondisi_pulang', 50)->nullable();
            $table->string('penyebab_kematian', 500)->nullable();
            $table->text('riwayat_alergi')->nullable();
            $table->text('riwayat_penyakit')->nullable();
            $table->json('prosedur_medis')->nullable();
            $table->json('obat_dikonsumsi')->nullable();
            $table->text('diet_nutrisi')->nullable();
            $table->string('berat_badan', 10)->nullable();
            $table->string('tinggi_badan', 10)->nullable();
            $table->string('tekanan_darah', 20)->nullable();
            $table->string('nadi', 10)->nullable();
            $table->string('suhu', 10)->nullable();
            $table->string('pernapasan', 10)->nullable();
            $table->string('sistole', 10)->nullable();
            $table->string('diastole', 10)->nullable();
            $table->string('discharge_status', 50)->nullable();
            $table->string('jenis_rawat', 50)->nullable();
            $table->string('nama_dokter', 255)->nullable();
            
            // Tarif Tambahan
            $table->decimal('tarif_poli_eks', 12, 2)->nullable();
            
            // APGAR Scores (nested data stored as JSON but also individual fields for queries)
            $table->json('apgar')->nullable();
            $table->integer('apgar_appearance_1')->nullable();
            $table->integer('apgar_pulse_1')->nullable();
            $table->integer('apgar_grimace_1')->nullable();
            $table->integer('apgar_activity_1')->nullable();
            $table->integer('apgar_respiration_1')->nullable();
            $table->integer('apgar_appearance_5')->nullable();
            $table->integer('apgar_pulse_5')->nullable();
            $table->integer('apgar_grimace_5')->nullable();
            $table->integer('apgar_activity_5')->nullable();
            $table->integer('apgar_respiration_5')->nullable();
            
            // Ventilator Data
            $table->json('ventilator')->nullable();
            $table->string('ventilator_start_date', 50)->nullable();
            $table->string('ventilator_end_date', 50)->nullable();
            $table->string('ventilator_duration', 50)->nullable();
            
            // Funeral Preparation Fields
            $table->string('deceased_date', 50)->nullable();
            $table->string('deceased_time', 50)->nullable();
            $table->string('deceased_location', 100)->nullable();
            $table->string('funeral_method', 50)->nullable();
            $table->string('funeral_name', 255)->nullable();
            $table->string('funeral_nik', 16)->nullable();
            $table->string('funeral_family_card', 20)->nullable();
            
            // Upgrade Class Details
            $table->json('upgrade_class')->nullable();
            $table->string('upgrade_class_indication', 100)->nullable();
            $table->string('upgrade_class_care_class', 50)->nullable();
            $table->integer('upgrade_class_care_los')->nullable();
            $table->string('upgrade_class_payor_detail', 100)->nullable();
            
            // COVID-19 Additional Fields
            $table->boolean('is_covid19_suspect')->default(false);
            $table->boolean('is_covid19_probable')->default(false);
            $table->boolean('is_covid19_confirmed')->default(false);
            
            // Additional Checkbox Indicators
            $table->boolean('add_payment_pct')->default(false);
            $table->boolean('birth_weight_extreme')->default(false);
            $table->boolean('fetal_reduction')->default(false);
            $table->boolean('admission_weight')->default(false);
            $table->boolean('chronic_dialysis')->default(false);
            $table->boolean('acute_dialysis')->default(false);
            $table->boolean('ventilator_support')->default(false);
            $table->boolean('chemotherapy')->default(false);
            
            // Treatment Information
            $table->string('los', 10)->nullable();
            $table->string('birth_weight_grams', 10)->nullable();
            $table->string('gestational_age', 10)->nullable();
            $table->text('treatment_history')->nullable();
            $table->text('medication_allergy')->nullable();
            $table->text('food_allergy')->nullable();
            $table->text('other_allergy')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->text('nursing_care_plan')->nullable();
            $table->text('special_procedures')->nullable();
            
            // ICD Additional Fields
            $table->string('diagnosa', 1000)->nullable(); // For frontend codes
            $table->string('procedure', 1000)->nullable(); // For frontend codes
            $table->string('diagnosa_inagrouper', 1000)->nullable();
            $table->string('procedure_inagrouper', 1000)->nullable();
            
            // Persalinan Data
            $table->boolean('is_persalinan')->default(false);
            $table->json('persalinan_data')->nullable();
            
            // Status and Tracking
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->boolean('is_saved_as_progress')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['nomor_kartu', 'tanggal_sep']);
            $table->index(['nomor_rm', 'tanggal_masuk']);
            $table->index('status');
            $table->index('is_saved_as_progress');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_klaim');
    }
};
