<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class ResumeMedis extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'resume';

    public function anamnesis()
    {
        return $this->hasOne(Anamnesis::class, 'ID', 'ANAMNESIS');
    }

    public function rps()
    {
        return $this->hasOne(RPS::class, 'ID', 'RPS');
    }

    public function rpp()
    {
        return $this->hasOne(RPP::class, 'ID', 'RPP');
    }

    public function diagnosis()
    {
        return $this->hasMany(Diagnosa::class, 'NOPEN', 'NOPEN')->where('INA_GROUPER', 0);
    }

    public function procedures()
    {
        return $this->hasMany(Prosedur::class, 'NOPEN', 'NOPEN')->where('INA_GROUPER', 0);
    }

    public function jadwal_kontrol()
    {
        return $this->hasOne(JadwalKontrol::class, 'ID', 'JADWAL_KONTROL');
    }
}
