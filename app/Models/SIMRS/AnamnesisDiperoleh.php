<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class AnamnesisDiperoleh extends Model
{
    protected $connection = 'medicalrecord';    

    protected $table = 'anamnesis_diperoleh';
}
