<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TindakanMedis extends Model
{
    protected $connection = 'layanan';

    protected $table = 'tindakan_medis';

    public function hasil_laboratorium()
    {
        return $this->hasMany(HasilLab::class, 'TINDAKAN_MEDIS', 'ID');
    }

    public function hasil_radiologi()
    {
        return $this->hasOne(HasilRadiologi::class, 'TINDAKAN_MEDIS', 'ID');
    }

    public function nama_tindakan()
    {
        return $this->hasOne(Tindakan::class, 'ID', 'TINDAKAN');
    }

}
