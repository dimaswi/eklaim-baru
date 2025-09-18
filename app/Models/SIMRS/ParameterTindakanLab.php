<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class ParameterTindakanLab extends Model
{
    protected $connection = 'master';

    protected $table = 'parameter_tindakan_lab';

    public function satuan()
    {
        return $this->belongsTo(Referensi::class, 'SATUAN', 'ID')->where('JENIS', 35);
    }
}
