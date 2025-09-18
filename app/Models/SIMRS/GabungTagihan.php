<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class GabungTagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'gabung_tagihan';
}
