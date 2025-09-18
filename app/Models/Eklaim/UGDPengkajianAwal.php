<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UGDPengkajianAwal extends Model
{
    use HasFactory;

    protected $table = 'u_g_d_pengkajian_awals';

    protected $fillable = [
        'pengajuan_klaim_id',
        
        // Identitas Pasien
        'nama',
        'norm',
        'tanggal_lahir',
        'jenis_kelamin',
        'tanggal_masuk',
        'tanggal_keluar',
        'alamat',
        'ruangan',
        
        // Anamnesis
        'autoanamnesis',
        'alloanamnesis',
        'anamnesis_dari',
        'keluhan_utama',
        'riwayat_penyakit_sekarang',
        'riwayat_penyakit_dahulu',
        'faktor_resiko',
        
        // Tanda Vital
        'tanda_vital_keadaan_umum',
        'tanda_vital_kesadaran',
        'tanda_vital_sistolik',
        'tanda_vital_distolik',
        'tanda_vital_frekuensi_nadi',
        'tanda_vital_frekuensi_nafas',
        'tanda_vital_suhu',
        'tanda_vital_saturasi_o2',
        'tanda_vital_eye',
        'tanda_vital_motorik',
        'tanda_vital_verbal',
        'tanda_vital_gcs',
        
        // Pemeriksaan Fisik
        'mata',
        'pupil',
        'ikterus',
        'diameter_pupil',
        'udem_palpebrae',
        'tht',
        'faring',
        'tongsil',
        'lidah',
        'bibir',
        'leher',
        'jvp',
        'limfe',
        'kaku_kuduk',
        'thoraks',
        'cor',
        's1s2',
        'mur_mur',
        'pulmo',
        'ronchi',
        'wheezing',
        'peristaltik',
        'abdomen',
        'meteorismus',
        'asites',
        'nyeri_tekan',
        'hepar',
        'lien',
        'extremitas',
        'udem',
        'defeksesi',
        'urin',
        'kelainan',
        'lainnya',
        
        // Riwayat Alergi
        'riwayat_alergi',
        
        // JSON Fields for grouped data
        'status_psikologi',
        'status_mental_hubungan',
        'tempat_tinggal',
        'spiritual',
        'ekonomi',
        'edukasi',
        
        // Penilaian Nyeri
        'nyeri',
        'onset',
        'pencetus',
        'lokasi_nyeri',
        'gambaran_nyeri',
        'durasi_nyeri',
        'skala_nyeri',
        'metode_nyeri',
        
        // Medical
        'masalah_medis',
        'diagnosis_medis',
        'rencana_terapi',
        
        // Dokter dan Petugas
        'dokter',
        'petugas',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_masuk' => 'datetime',
        'tanggal_keluar' => 'datetime',
        
        // JSON casts for grouped data
        'status_psikologi' => 'array',
        'status_mental_hubungan' => 'array',
        'tempat_tinggal' => 'array',
        'spiritual' => 'array',
        'ekonomi' => 'array',
        'edukasi' => 'array',
    ];

    public function pengajuanKlaim(): BelongsTo
    {
        return $this->belongsTo(PengajuanKlaim::class);
    }
}
