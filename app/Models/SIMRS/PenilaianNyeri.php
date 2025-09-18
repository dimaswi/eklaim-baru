<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class PenilaianNyeri extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'penilaian_nyeri';

    public function metode()
    {
        return $this->hasOne(Referensi::class, 'ID', 'METODE')->where('JENIS', 71);
    }
}
