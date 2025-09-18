<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TransaksiKasir extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'transaksi_kasir';

    public function pengguna()
    {
        return $this->hasOne(Pengguna::class, 'ID', 'KASIR');
    }
}
