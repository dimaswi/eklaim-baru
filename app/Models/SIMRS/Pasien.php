<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Pasien extends Model
{
    protected $connection = 'master';

    protected $table = 'pasien';

    public function scopeActive($query)
    {
        return $query->where('STATUS', '1');
    }

    public function scopeInactive($query)
    {
        return $query->where('STATUS', '0');
    }

    public function scopeByDateBirth($query, $date)
    {
        return $query->whereDate('TANGGAL_LAHIR', $date);
    }

    public function scopeByName($query, $name)
    {
        return $query->where('NAMA', 'like', "%{$name}%");
    }

    public function scopeByNorm($query, $norm)
    {
        return $query->where('NORM', 'like', "%{$norm}%");
    }

    public function pendaftaran()
    {
        return $this->hasMany(Pendaftaran::class, 'NORM', 'NORM');
    }

    public function desa()
    {
        return $this->belongsTo(Wilayah::class, 'WILAYAH', 'ID');
    }

    public function kecamatan()
    {
        return $this->belongsTo(Wilayah::class, 'kecamatan_id', 'ID');
    }

    public function kabupaten()
    {
        return $this->belongsTo(Wilayah::class, 'kabupaten_id', 'ID');
    }

    public function provinsi()
    {
        return $this->belongsTo(Wilayah::class, 'provinsi_id', 'ID');
    }

    public function getKecamatanIdAttribute()
    {
        return $this->WILAYAH ? substr($this->WILAYAH, 0, 6) : null;
    }

    public function getKabupatenIdAttribute()
    {
        return $this->WILAYAH ? substr($this->WILAYAH, 0, 4) : null;
    }

    public function getProvinsiIdAttribute()
    {
        return $this->WILAYAH ? substr($this->WILAYAH, 0, 2) : null;
    }
}
