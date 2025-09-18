<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class JadwalKontrol extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'jadwal_kontrol';

    public function ruangan()
    {
        return $this->hasOne(Ruangan::class, 'ID', 'RUANGAN');
    }
}
