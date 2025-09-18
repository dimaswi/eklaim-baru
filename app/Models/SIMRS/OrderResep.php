<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class OrderResep extends Model
{
    protected $connection = 'layanan';

    protected $table = 'order_resep';

    public function order_resep_detil()
    {
        return $this->hasMany(OrderResepDetil::class, 'ORDER_ID', 'NOMOR');
    }
}
