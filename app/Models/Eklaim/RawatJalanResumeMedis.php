<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawatJalanResumeMedis extends Model
{
    use HasFactory;

    protected $connection = 'app';
    protected $table = 'rawat_jalan_resume_medis';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kunjungan_nomor',
        'nama',
        'norm',
        'tanggal_lahir',
        'jenis_kelamin',
        'tanggal_masuk',
        'tanggal_keluar',
        'ruangan',
        'penanggung_jawab',
        'indikasi_rawat_inap',
        'riwayat_penyakit_dahulu',
        'riwayat_penyakit_sekarang',
        'pemeriksaan_fisik',
        'hasil_konsultasi',
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
        'cara_keluar',
        'keadaan_keluar',
        'jadwal_kontrol_tanggal',
        'jadwal_kontrol_jam',
        'jadwal_kontrol_tujuan',
        'jadwal_kontrol_nomor_bpjs',
        'dokter',
        'petugas',
        'selected_diagnosa',
        'selected_procedures',
        'resep_pulang',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_masuk' => 'datetime',
        'tanggal_keluar' => 'datetime',
        'jadwal_kontrol_tanggal' => 'date',
        'selected_diagnosa' => 'array',
        'selected_procedures' => 'array',
        'resep_pulang' => 'array',
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
}
