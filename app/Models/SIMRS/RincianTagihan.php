<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class RincianTagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'rincian_tagihan';

    public function tarif_administrasi()
    {
        return $this->hasOne(TarifAdministrasi::class, 'ID', 'TARIF_ID'); // JIKA PADA RINCIAN TAGIHAN DENGAN JENIS = 1
    }

    public function tarif_harga_barang()
    {
        return $this->hasOne(TarifHargaBarang::class, 'ID', 'TARIF_ID'); // JIKA PADA RINCIAN TAGIHAN DENGAN JENIS = 4
    }

    public function tarif_o2()
    {
        return $this->hasOne(TarifOksigen::class, 'ID', 'TARIF_ID'); // JIKA PADA RINCIAN TAGIHAN DENGAN JENIS = 6
    }

    public function tarif_paket()
    {
        return $this->hasOne(TarifPaket::class, 'ID', 'TARIF_ID'); // JIKA PADA RINCIAN TAGIHAN DENGAN JENIS = 5
    }

    public function tarif_ruang_rawat()
    {
        return $this->hasOne(TarifRuangRawat::class, 'ID', 'TARIF_ID'); // JIKA PADA RINCIAN TAGIHAN DENGAN JENIS = 2   
    }

    public function tarif_tindakan()
    {
        return $this->hasOne(TarifTindakan::class, 'ID', 'TARIF_ID'); // JIKA PADA RINCIAN TAGIHAN DENGAN JENIS = 3
    }
}
