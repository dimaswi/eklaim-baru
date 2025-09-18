<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Pengguna extends Model
{
    protected $connection = 'aplikasi';

    protected $table = 'pengguna';

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }
}
