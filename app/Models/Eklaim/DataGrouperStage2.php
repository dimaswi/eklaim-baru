<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataGrouperStage2 extends Model
{
    protected $table = 'data_groupper_stage2';
    
    protected $fillable = [
        'pengajuan_klaim_id',
        'data_groupper_id',
        'nomor_sep',
        'selected_special_cmg',
        'metadata_code',
        'metadata_message',
        'cbg_code',
        'cbg_description',
        'cbg_tariff',
        'special_cmg',
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
        'special_cmg' => 'array',
        'covid19_data' => 'array',
        'response_inagrouper' => 'array',
        'special_cmg_option' => 'array',
        'tarif_alt' => 'array',
        'full_response' => 'array',
        'add_payment_amt' => 'integer',
        'metadata_code' => 'integer',
    ];
    
    public function pengajuanKlaim(): BelongsTo
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
    
    public function dataGroupper(): BelongsTo
    {
        return $this->belongsTo(DataGroupper::class, 'data_groupper_id');
    }
    
    // Helper method to format tariff as currency
    public function getFormattedCbgTariff(): string
    {
        return 'Rp ' . number_format((int)$this->cbg_tariff, 0, ',', '.');
    }
    
    public function getFormattedAddPayment(): string
    {
        return 'Rp ' . number_format($this->add_payment_amt, 0, ',', '.');
    }
    
    // Helper to get formatted special CMG tariff
    public function getFormattedSpecialCmgTariff(): string
    {
        if (is_array($this->special_cmg) && count($this->special_cmg) > 0) {
            $totalTariff = array_sum(array_column($this->special_cmg, 'tariff'));
            return 'Rp ' . number_format($totalTariff, 0, ',', '.');
        }
        return 'Rp 0';
    }
}
