<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class KeluhanUtama extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'keluhan_utama';
}
