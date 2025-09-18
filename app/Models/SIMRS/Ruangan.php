<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    protected $connection = 'master';

    protected $table = 'ruangan';

    public function scopeJenisKunjunganFilter($query, $jenis = [1, 2, 3])
    {
        return $query->whereIn('JENIS_KUNJUNGAN', $jenis);
    }
}
