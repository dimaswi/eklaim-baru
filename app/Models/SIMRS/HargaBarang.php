<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class HargaBarang extends Model
{
    protected $connection = 'inventory';

    protected $table = 'harga_barang';
}
