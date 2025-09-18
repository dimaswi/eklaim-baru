<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class FaktorResiko extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'faktor_risiko';
}
