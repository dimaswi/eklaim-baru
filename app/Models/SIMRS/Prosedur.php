<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Prosedur extends Model
{
    protected $connection = 'medicalrecord';
    
    protected $table = 'prosedur';
}
