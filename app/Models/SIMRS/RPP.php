<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class RPP extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'rpp';
}
