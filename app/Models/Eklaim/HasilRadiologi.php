<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HasilRadiologi extends Model
{
    use HasFactory;

    protected $connection = 'app';
    protected $table = 'hasil_radiologis';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kunjungan_nomor',
        'tindakan_medis_data',
        'pasien_data',
        'tanggal_pemeriksaan',
        'jenis_pemeriksaan',
        'tindakan_id',
        'nama_tindakan',
        'klinis',
        'kesan',
        'usul',
        'hasil',
        'btk',
        'hasil_radiologi',
        'saran',
        'dokter_radiologi',
        'dokter_pengirim',
        'is_fiktif',
        'nomor_kunjungan_fiktif',
        'template_data',
    ];

    protected $casts = [
        'tindakan_medis_data' => 'array',
        'pasien_data' => 'array',
        'template_data' => 'array',
        'hasil_radiologi' => 'array',
        'is_fiktif' => 'boolean',
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
}