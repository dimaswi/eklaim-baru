<?php

namespace App\Models\SIMRS;

use Illuminate\Database\Eloquent\Model;

class Triage extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'triage';

    protected $casts = [
        'ANAMNESE' => 'json',
        'KEDATANGAN' => 'json',
        'KASUS' => 'json',
        'TANDA_VITAL' => 'json',
        'OBGYN' => 'json',
        'KEBUTUHAN_KHUSUS' => 'json',
        'RESUSITASI' => 'json',
        'EMERGENCY' => 'json',
        'URGENT' => 'json',
        'LESS_URGENT' => 'json',
        'NON_URGENT' => 'json',
        'DOA' => 'json',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'OLEH', 'ID');
    }
}
