<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TarifHargaBarang extends Model
{
    protected $connection = 'inventory';

    protected $table = 'harga_barang';

    public function nama_barang()
    {
        return $this->hasOne(Barang::class, 'ID', 'BARANG');
    }
}
