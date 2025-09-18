<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class PerencanaanRawatInap extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'perencanaan_rawat_inap';

    public function kunjungan_rs()
    {
        return $this->hasOne(KunjunganRS::class, 'NOMOR', 'KUNJUNGAN'); 
    }
}
