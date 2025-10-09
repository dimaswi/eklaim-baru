<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataGroupper extends Model
{
    protected $connection = 'app';
    protected $table = 'data_groupper';
    
    protected $fillable = [
        'pengajuan_klaim_id',
        'nomor_sep',
        'metadata_code',
        'metadata_message',
        'cbg_code',
        'cbg_description',
        'cbg_tariff',
        'sub_acute_code',
        'sub_acute_description',
        'sub_acute_tariff',
        'chronic_code',
        'chronic_description',
        'chronic_tariff',
        'kelas',
        'add_payment_amt',
        'inacbg_version',
        'covid19_data',
        'response_inagrouper',
        'special_cmg_option',
        'tarif_alt',
        'full_response',
    ];
    
    protected $casts = [
        'covid19_data' => 'array',
        'response_inagrouper' => 'array',
        'special_cmg_option' => 'array',
        'tarif_alt' => 'array',
        'full_response' => 'array',
        'sub_acute_tariff' => 'integer',
        'chronic_tariff' => 'integer',
        'add_payment_amt' => 'integer',
        'metadata_code' => 'integer',
    ];
    
    public function pengajuanKlaim(): BelongsTo
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
    
    // Helper method to format tariff as currency
    public function getFormattedCbgTariff(): string
    {
        return 'Rp ' . number_format((int)$this->cbg_tariff, 0, ',', '.');
    }
    
    public function getFormattedSubAcuteTariff(): string
    {
        return 'Rp ' . number_format($this->sub_acute_tariff, 0, ',', '.');
    }
    
    public function getFormattedChronicTariff(): string
    {
        return 'Rp ' . number_format($this->chronic_tariff, 0, ',', '.');
    }
    
    public function getFormattedAddPayment(): string
    {
        return 'Rp ' . number_format($this->add_payment_amt, 0, ',', '.');
    }
}
