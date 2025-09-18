<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawatInapCPPT extends Model
{
    use HasFactory;

    protected $connection = 'app';    

    protected $table = 'rawat_inap_cppts';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kunjungan_nomor',
        'tanggal',
        'profesi',
        'subyektif',
        'obyektif',
        'assesment',
        'planning',
        'instruksi',
        'nama_petugas',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class);
    }
}
