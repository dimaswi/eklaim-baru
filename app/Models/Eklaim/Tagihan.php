<?php

namespace App\Models\Eklaim;

use App\Models\Eklaim\PengajuanKlaim;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tagihan extends Model
{
    use HasFactory;

    protected $connection = 'app';

    protected $table = 'tagihans';

    protected $fillable = [
        'pengajuan_klaim_id',
        'nomor_kunjungan',
        'data_pasien',
        'rincian_tagihan',
        'total_tagihan',
        'nama_petugas',
    ];

    protected $casts = [
        'data_pasien' => 'array',
        'rincian_tagihan' => 'array',
        'total_tagihan' => 'decimal:2',
    ];

    public function pengajuanKlaim(): BelongsTo
    {
        return $this->belongsTo(PengajuanKlaim::class);
    }
}
