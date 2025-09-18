<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Dokter extends Model
{
    protected $connection = 'master';

    protected $table = 'dokter';

    public function pegawai()
    {
        return $this->hasOne(Pegawai::class, 'NIP', 'NIP');
    }
}
