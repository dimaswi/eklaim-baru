<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class KunjunganRS extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'kunjungan';

    protected $primaryKey = 'NOMOR';
    
    public $incrementing = false;
    
    protected $keyType = 'string';

    public function pendaftaran()
    {
        return $this->belongsTo(Pendaftaran::class, 'NOPEN', 'NOMOR');
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class, 'RUANGAN', 'ID');
    }

    public function ruangan_filtered()
    {
        return $this->belongsTo(Ruangan::class, 'RUANGAN', 'ID')
                    ->whereIn('JENIS_KUNJUNGAN', [1, 2, 3]);
    }

    public function pasien_pulang()
    {
        return $this->hasOne(PasienPulang::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function resume_medis()
    {
        return $this->hasOne(ResumeMedis::class, 'NOPEN', 'NOPEN');
    }

    public function penjamin()
    {
        return $this->belongsTo(Penjamin::class, 'NOPEN', 'NOPEN');
    }

    public function tanda_vital()
    {
        return $this->hasOne(TandaVital::class, 'KUNJUNGAN', 'NOMOR')->latest('TANGGAL');
    }

    public function order_resep_pulang()
    {
        return $this->hasMany(OrderResep::class, 'KUNJUNGAN', 'NOMOR')->where('RESEP_PASIEN_PULANG', 1);
    }
    
    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'DPJP', 'ID');
    }

    public function cppt()
    {
        return $this->hasMany(CPPT::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function balance_cairan()
    {
        return $this->hasMany(BalanceCairan::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function anamnesis()
    {
        return $this->hasOne(Anamnesis::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function anamnesis_diperoleh()
    {
        return $this->hasOne(AnamnesisDiperoleh::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function rpp()
    {
        return $this->hasMany(RPP::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function riwayat_penyakit_keluarga()
    {
        return $this->hasOne(RiwayatPenyakitKeluarga::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function faktor_resiko()
    {
        return $this->hasOne(FaktorResiko::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function keadaan_umum()
    {
        return $this->hasOne(TandaVital::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function keluhan_utama()
    {
        return $this->hasOne(KeluhanUtama::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function jadwal_kontrol()
    {
        return $this->hasOne(JadwalKontrol::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function diagnosa()
    {
        return $this->hasMany(Diagnosa::class, 'NOPEN', 'NOPEN')->where('INA_GROUPER', 0);
    }

    public function procedures()
    {
        return $this->hasMany(Prosedur::class, 'NOPEN', 'NOPEN')->where('INA_GROUPER', 0);
    }

    public function riwayat_alergi()
    {
        return $this->hasOne(RiwayatAlergi::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function penilaian_nyeri()
    {
        return $this->hasOne(PenilaianNyeri::class, 'KUNJUNGAN', 'NOMOR');
    }
    
    public function edukasi_pasien()
    {
        return $this->hasOne(EdukasiPasien::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function rencana_terapi()
    {
        return $this->hasOne(RencanaTerapi::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function triage()
    {
        return $this->hasOne(Triage::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function tindakan_medis()
    {
        return $this->hasMany(TindakanMedis::class, 'KUNJUNGAN', 'NOMOR');
    }
}
