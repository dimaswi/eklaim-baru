<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class HasilRadiologi extends Model
{
    protected $connection = 'layanan';

    protected $table = 'hasil_rad';
}
