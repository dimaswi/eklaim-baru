<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    protected $connection = 'inventory';

    protected $table = 'barang';

    public function harga_barang()
    {
        return $this->hasOne(HargaBarang::class, 'BARANG', 'ID');
    }
}
