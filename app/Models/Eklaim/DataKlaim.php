<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataKlaim extends Model
{
    use HasFactory;

    protected $connection = "app";
    
    protected $table = 'data_klaim';

    protected $fillable = [
        'pengajuan_klaim_id',
        
        // Basic Patient Information
        'nomor_sep',
        'nomor_kartu',
        'nomor_kartu_t',
        'nomor_rm',
        'nama_pasien',
        'jenis_kelamin',
        'tanggal_lahir',
        'nik',
        'nomor_telepon',
        'alamat',
        'kelurahan',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'kode_pos',
        'nomor_rujukan',
        'faskes_rujukan',
        'ppk_pelayanan',
        'tanggal_sep',
        'tanggal_masuk',
        'tanggal_keluar',
        'cara_masuk',
        'keluhan',
        'alergi',
        'kelas_rawat',
        'nomor_registrasi',
        'nomor_kamar',
        'ruangan',
        'naik_kelas',
        'bayi_lahir_status_cd',
        'covid19_status_cd',
        'payor_id',
        'payor_cd',
        'covid19_rs_darurat_ind',
        'pemulasaraan_jenazah',
        'kesadaran',
        'riwayat_alergi_obat',
        
        // Treatment Information
        'jenis_rawat',
        'discharge_status',
        'nama_dokter',
        
        // ICD Data
        'kode_icd10_primer',
        'diagnosa_primer',
        'diagnosa_sekunder',
        'kode_icd9_primer',
        'tindakan_primer',
        'tindakan_sekunder',
        'diagnosa',
        'procedure',
        'diagnosa_inagrouper',
        'procedure_inagrouper',
        
        // Tariff Information
        'akomodasi',
        'asuhan_keperawatan',
        'bahan_medis_habis_pakai',
        'kamar_operasi',
        'konsultasi',
        'obat',
        'pelayanan_darah',
        'penunjang',
        'prosedur_bedah',
        'prosedur_non_bedah',
        'rehabilitasi',
        'sewa_alat',
        'visite',
        'icu',
        'iccu',
        'alat_kesehatan',
        'transport_pasien',
        'lain_lain',
        'total_tarif',
        'tarif_rs',
        'tarif_poli_eks',
        
        // Case Information
        'tipe_discharge',
        'case_death',
        'adl_score',
        'upgrade_class_ind',
        'los_icu',
        'ventilator_hour',
        'upgrade_class_class',
        'upgrade_class_los',
        'upgrade_class_payor',
        'birth_weight',
        'los',
        'birth_weight_grams',
        'gestational_age',
        
        // Medical Data & Vital Signs
        'sistole',
        'diastole',
        'berat_badan',
        'tinggi_badan',
        'tekanan_darah',
        'nadi',
        'suhu',
        'pernapasan',
        
        // Additional Medical Information
        'pemeriksaan_penunjang',
        'cara_pulang',
        'kondisi_pulang',
        'penyebab_kematian',
        'riwayat_alergi',
        'riwayat_penyakit',
        'prosedur_medis',
        'obat_dikonsumsi',
        'diet_nutrisi',
        'treatment_history',
        'medication_allergy',
        'food_allergy',
        'other_allergy',
        'treatment_plan',
        'nursing_care_plan',
        'special_procedures',
        
        // APGAR Scores
        'apgar',
        'apgar_appearance_1',
        'apgar_pulse_1',
        'apgar_grimace_1',
        'apgar_activity_1',
        'apgar_respiration_1',
        'apgar_appearance_5',
        'apgar_pulse_5',
        'apgar_grimace_5',
        'apgar_activity_5',
        'apgar_respiration_5',
        
        // Ventilator Data
        'ventilator',
        'ventilator_start_date',
        'ventilator_end_date',
        'ventilator_duration',
        
        // Funeral Preparation Fields
        'deceased_date',
        'deceased_time',
        'deceased_location',
        'funeral_method',
        'funeral_name',
        'funeral_nik',
        'funeral_family_card',
        
        // Upgrade Class Details
        'upgrade_class',
        'upgrade_class_indication',
        'upgrade_class_care_class',
        'upgrade_class_care_los',
        'upgrade_class_payor_detail',
        
        // Boolean/Checkbox Fields
        'add_payment_pct',
        'birth_weight_extreme',
        'fetal_reduction',
        'admission_weight',
        'chronic_dialysis',
        'acute_dialysis',
        'ventilator_support',
        'chemotherapy',
        'is_covid19_suspect',
        'is_covid19_probable',
        'is_covid19_confirmed',
        'is_persalinan',
        
        // COVID-19 Fields
        'covid_19_status',
        'covid_19_cc',
        'covid_19_pcare',
        
        // Persalinan Information
        'persalinan_data',
        
        // Status and Tracking
        'status',
        'is_saved_as_progress',
        'submitted_at',
        'approved_at',
        'rejection_reason',
                // Additional metadata
        'metadata',
        
        // Fields from JSON dokumentasi 
        'coder_nik',
        'episodes',
        'akses_naat',
        'isoman_ind',
        'dializer_single_use',
        'kantong_darah',
        'alteplase_ind',
        'kantong_jenazah',
        'peti_jenazah',
        'plastik_erat',
        'desinfektan_jenazah',
        'mobil_jenazah',
        'desinfektan_mobil_jenazah',
        'terapi_konvalesen',
        'adl_sub_acute',
        'adl_chronic',
        'icu_indikator',
        'icu_los',
        'covid19_cc_ind',
        'covid19_rs_darurat_ind',
        'covid19_co_insidense_ind',
        'covid19_penunjang_pengurang',
        'nomor_kartu_t',
        'kode_tarif',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_sep' => 'date',
        'tanggal_masuk' => 'datetime',
        'tanggal_keluar' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        
        // Decimal fields
        'akomodasi' => 'decimal:2',
        'asuhan_keperawatan' => 'decimal:2',
        'bahan_medis_habis_pakai' => 'decimal:2',
        'kamar_operasi' => 'decimal:2',
        'konsultasi' => 'decimal:2',
        'obat' => 'decimal:2',
        'pelayanan_darah' => 'decimal:2',
        'penunjang' => 'decimal:2',
        'prosedur_bedah' => 'decimal:2',
        'prosedur_non_bedah' => 'decimal:2',
        'rehabilitasi' => 'decimal:2',
        'sewa_alat' => 'decimal:2',
        'visite' => 'decimal:2',
        'icu' => 'decimal:2',
        'iccu' => 'decimal:2',
        'alat_kesehatan' => 'decimal:2',
        'transport_pasien' => 'decimal:2',
        'lain_lain' => 'decimal:2',
        'total_tarif' => 'decimal:2',
        'tarif_poli_eks' => 'decimal:2',
        'upgrade_class_payor' => 'decimal:2',
        'birth_weight' => 'decimal:2',
        
        // Integer fields
        'apgar_appearance_1' => 'integer',
        'apgar_pulse_1' => 'integer',
        'apgar_grimace_1' => 'integer',
        'apgar_activity_1' => 'integer',
        'apgar_respiration_1' => 'integer',
        'apgar_appearance_5' => 'integer',
        'apgar_pulse_5' => 'integer',
        'apgar_grimace_5' => 'integer',
        'apgar_activity_5' => 'integer',
        'apgar_respiration_5' => 'integer',
        'upgrade_class_care_los' => 'integer',
        
        // Boolean fields
        'case_death' => 'boolean',
        'upgrade_class_ind' => 'boolean',
        'add_payment_pct' => 'boolean',
        'birth_weight_extreme' => 'boolean',
        'fetal_reduction' => 'boolean',
        'admission_weight' => 'boolean',
        'chronic_dialysis' => 'boolean',
        'acute_dialysis' => 'boolean',
        'ventilator_support' => 'boolean',
        'chemotherapy' => 'boolean',
        'is_covid19_suspect' => 'boolean',
        'is_covid19_probable' => 'boolean',
        'is_covid19_confirmed' => 'boolean',
        'is_persalinan' => 'boolean',
        'is_saved_as_progress' => 'boolean',
        
        // JSON fields
        'alergi' => 'json',
        'diagnosa_sekunder' => 'json',
        'tindakan_sekunder' => 'json',
        'prosedur_medis' => 'json',
        'obat_dikonsumsi' => 'json',
        'apgar' => 'json',
        'ventilator' => 'json',
        'upgrade_class' => 'json',
        'covid_19_cc' => 'json',
        'covid_19_pcare' => 'json',
        'persalinan_data' => 'json',
        'tarif_rs' => 'json',
        'metadata' => 'json',
    ];

    // Relationship
    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
}
