<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class RPK extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'rpk';
}
