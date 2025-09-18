<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'pendaftaran';

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'NORM', 'NORM');
    }

    public function penjamin()
    {
        return $this->belongsTo(Penjamin::class, 'NOMOR', 'NOPEN');
    }

    public function kunjungan_rs()
    {
        return $this->hasMany(KunjunganRS::class, 'NOPEN', 'NOMOR');
    }

    // Untuk cross-database relationship, kita tidak bisa menggunakan whereHas langsung
    // Jadi kita akan handle filtering di controller atau dengan collection filtering
}
