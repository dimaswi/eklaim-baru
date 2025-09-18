<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TarifOksigen extends Model
{
    protected $connection = 'master';

    protected $table = 'tarif_o2';
}
