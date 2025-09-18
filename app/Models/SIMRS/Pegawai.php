<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    protected $connection = 'master';

    protected $table = 'pegawai';

    public function dokter()
    {
        return $this->hasOne(Dokter::class, 'NIP', 'NIP');
    }

    public function profesi()
    {
        return $this->hasOne(Referensi::class, 'ID', 'PROFESI')->where('JENIS', 36);
    }
}
