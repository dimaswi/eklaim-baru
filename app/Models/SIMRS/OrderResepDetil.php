<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class OrderResepDetil extends Model
{
    protected $connection = 'layanan';

    protected $table = 'order_detil_resep';

    public function nama_obat()
    {
        return $this->hasOne(Barang::class, 'ID', 'FARMASI');
    }

    public function frekuensi()
    {
        return $this->hasOne(FrekuensiAturanResep::class, 'ID', 'FREKUENSI');
    }

    // public function cara_pemberian()
    // {
    //     return $this->hasOne(Referensi::class, 'ID', 'RUTE_PEMBERIAN')->where('JENIS', 41);
    // }

}
