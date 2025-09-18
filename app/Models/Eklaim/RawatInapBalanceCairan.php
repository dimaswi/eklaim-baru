<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawatInapBalanceCairan extends Model
{
    use HasFactory;

    protected $connection = 'app';

    protected $table = 'rawat_inap_balance_cairans';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kunjungan_nomor',
        'intake_oral',
        'intake_ngt',
        'konsumsi_jumlah',
        'transfusi_produk',
        'transfusi_produk_jumlah',
        'output_oral',
        'output_ngt',
        'urine_jumlah',
        'pendarahan_jumlah',
        'fases_jumlah',
        'total_intake',
        'total_output',
        'volume_intake',
        'volume_output',
        'volume_balance',
        'suhu',
        'waktu_pemeriksaan',
        'tanggal',
        'nama_petugas',
    ];

    protected $casts = [
        'waktu_pemeriksaan' => 'datetime',
        'tanggal' => 'datetime',
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class);
    }
}
