<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class EdukasiPasien extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'edukasi_pasien_keluarga';
}
