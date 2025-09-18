<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Tindakan extends Model
{
    protected $connection = 'master';

    protected $table = 'tindakan';

    public function parameter_tindakan_lab()
    {
        return $this->hasMany(ParameterTindakanLab::class, 'TINDAKAN', 'ID')->where('STATUS', 1);
    }

    public function tarif_tindakan()
    {
        return $this->hasOne(TarifTindakan::class, 'TINDAKAN', 'ID')->where('STATUS', 1)->where('KELAS', 0);
    }
}
