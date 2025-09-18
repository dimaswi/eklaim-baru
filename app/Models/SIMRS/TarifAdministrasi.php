<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TarifAdministrasi extends Model
{
    protected $connection = 'master';

    protected $table = 'tarif_administrasi';

    public function nama_tarif()
    {
        return $this->hasOne(Referensi::class, 'ID', 'JENIS_KUNJUNGAN')->where('JENIS', 15);
    }
}
