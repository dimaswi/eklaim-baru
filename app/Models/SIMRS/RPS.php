<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class RPS extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'rps';

}
