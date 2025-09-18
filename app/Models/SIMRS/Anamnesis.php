<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Anamnesis extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'anamnesis';

}
