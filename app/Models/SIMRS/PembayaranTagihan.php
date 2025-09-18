<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class PembayaranTagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'pembayaran_tagihan';

    public function transaksi_kasir()
    {
        return $this->hasOne(TransaksiKasir::class, 'NOMOR', 'TRANSAKSI_KASIR_NOMOR');
    }
}
