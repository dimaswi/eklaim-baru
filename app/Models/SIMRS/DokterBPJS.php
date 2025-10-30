
<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class DokterBPJS extends Model
{
    protected $connection = 'reg';

    protected $table = 'dokter';

    public function pegawai()
    {
        return $this->hasOne(Pegawai::class, 'NIP', 'NIP');
    }
}
