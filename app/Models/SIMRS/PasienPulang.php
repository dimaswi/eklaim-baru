<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class PasienPulang extends Model
{
    protected $connection = 'layanan';

    protected $table = 'pasien_pulang';

    public function cara_pulang()
    {
        return $this->belongsTo(Referensi::class, 'CARA', 'ID')->where('JENIS', 45);
    }

    public function keadaan_pulang()
    {
        return $this->belongsTo(Referensi::class, 'KEADAAN', 'ID')->where('JENIS', 46);
    }
}
