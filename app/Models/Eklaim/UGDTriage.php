<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UGDTriage extends Model
{
    use HasFactory;

    protected $connection = 'app';

    protected $table = 'u_g_d_triages';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kunjungan_nomor',
        'nama',
        'norm',
        'tanggal_lahir',
        'jenis_kelamin',
        'dokter',
        'petugas',
        'kedatangan_datang_sendiri',
        'kedatangan_pengantar',
        'kedatangan_alat_transportasi',
        'kedatangan_polisi',
        'kedatangan_asal_rujukan',
        'kasus_jenis_kasus',
        'kasus_laka_lantas',
        'kasus_kecelakaan_kerja',
        'kasus_lokasi',
        'anamnese_terpimpin',
        'anamnese_keluhan_utama',
        'tanda_vital_tekanan_darah',
        'tanda_vital_suhu',
        'tanda_vital_nadi',
        'tanda_vital_pernafasan',
        'tanda_vital_skala_nyeri',
        'tanda_vital_metode_ukur',
        'triage_resusitasi',
        'triage_emergency',
        'triage_urgent',
        'triage_less_urgent',
        'triage_non_urgent',
        'triage_doa',
        'kategori_triage',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'kedatangan_datang_sendiri' => 'boolean',
        'kedatangan_polisi' => 'boolean',
        'kasus_jenis_kasus' => 'boolean',
        'kasus_laka_lantas' => 'boolean',
        'kasus_kecelakaan_kerja' => 'boolean',
        'triage_resusitasi' => 'boolean',
        'triage_emergency' => 'boolean',
        'triage_urgent' => 'boolean',
        'triage_less_urgent' => 'boolean',
        'triage_non_urgent' => 'boolean',
        'triage_doa' => 'boolean',
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class);
    }
}
