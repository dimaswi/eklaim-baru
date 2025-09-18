<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TagihanPendaftaran extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'tagihan_pendaftaran';

    public function gabung_tagihan()
    {
        return $this->hasOne(GabungTagihan::class, 'KE', 'TAGIHAN');
    }
}
