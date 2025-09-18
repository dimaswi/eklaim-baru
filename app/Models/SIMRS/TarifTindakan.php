<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class TarifTindakan extends Model
{
    protected $connection = 'master';

    protected $table = 'tarif_tindakan';

    public function nama_tindakan()
    {
        return $this->hasOne(Tindakan::class, 'ID', 'TINDAKAN');
    }
}
