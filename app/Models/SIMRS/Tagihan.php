<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'tagihan';
}
