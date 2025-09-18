<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class BalanceCairan extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'penilaian_ballance_cairan';

    public function oleh()
    {
        return $this->hasOne(Pengguna::class, 'ID', 'OLEH');
    }
}
