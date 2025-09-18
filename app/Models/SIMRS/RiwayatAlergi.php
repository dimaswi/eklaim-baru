<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class RiwayatAlergi extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'riwayat_alergi';
}
