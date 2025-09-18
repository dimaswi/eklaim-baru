<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HasilLaboratorium extends Model
{
    use HasFactory;

    protected $connection = 'app';

    protected $table = 'hasil_laboratoriums';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kunjungan_nomor',
        'tindakan_medis_data',
        'pasien_data',
        'is_fiktif',
        'nomor_kunjungan_fiktif',
        'template_data',
    ];

    protected $casts = [
        'tindakan_medis_data' => 'array',
        'pasien_data' => 'array',
        'template_data' => 'array',
        'is_fiktif' => 'boolean',
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class);
    }
}
