<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class KunjunganBPJS extends Model
{
    protected $connection = 'bpjs';

    protected $table = 'kunjungan';

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeBySEPDate($query, $date)
    {
        return $query->whereDate('tglSEP', $date);
    }

    public function penjamin()
    {
        return $this->hasOne(Penjamin::class, 'NOMOR', 'noSEP');
    }
}
