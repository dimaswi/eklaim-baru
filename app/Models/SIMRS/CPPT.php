<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class CPPT extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'cppt';

    public function oleh()
    {
        return $this->hasOne(Pengguna::class, 'ID', 'OLEH');
    }
}
