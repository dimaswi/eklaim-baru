<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TandaVital extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'tanda_vital';
}
