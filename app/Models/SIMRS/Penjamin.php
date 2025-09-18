<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Penjamin extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'penjamin';

    public function kunjungan_bpjs()
    {
        return $this->hasOne(KunjunganBPJS::class, 'noSEP', 'NOMOR');
    }

    public function pendaftaran()
    {
        return $this->hasOne(Pendaftaran::class, 'NOMOR', 'NOPEN');
    }

    public function perencanaan_rawat_inap()
    {
        return $this->hasOne(PerencanaanRawatInap::class, 'NOMOR_REFERENSI', 'NO_SURAT');
    }

    public function nama_penjamin()
    {
        return $this->hasOne(Referensi::class, 'ID', 'JENIS')->where('JENIS', 10);
    }
}
