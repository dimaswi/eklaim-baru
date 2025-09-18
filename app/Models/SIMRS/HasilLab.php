<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class HasilLab extends Model
{
    protected $connection = 'layanan';

    protected $table = 'hasil_lab';

    public function parameter_tindakan_lab()
    {
        return $this->belongsTo(ParameterTindakanLab::class, 'PARAMETER_TINDAKAN', 'ID');
    }
}
