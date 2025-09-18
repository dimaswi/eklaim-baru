<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class RiwayatPenyakitKeluarga extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'riwayat_penyakit_keluarga';
}
