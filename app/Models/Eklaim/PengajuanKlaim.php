<?php

namespace App\Models\Eklaim;

use App\Models\SIMRS\Penjamin;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class PengajuanKlaim extends Model
{
    use HasFactory;

    protected $connection = 'app';
    protected $table = 'pengajuan_klaim';

    protected $fillable = [
        'nomor_sep',
        'tanggal_pengajuan',
        'tanggal_masuk',
        'tanggal_keluar',
        'norm',
        'status_pengiriman',
        'response_message',
        'response_data',
        'nomor_kartu',
        'nama_pasien',
        'gender',
        'tgl_lahir',
        'ruangan',
        'jenis_kunjungan',
        'status_pengiriman',
        'idrg',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'date',
        'tgl_lahir' => 'date',
        'response_data' => 'array',
    ];

    /**
     * Serialize tanggal_masuk without timezone conversion
     */
    protected function tanggalMasuk(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value,
            set: fn ($value) => $value,
        );
    }

    /**
     * Serialize tanggal_keluar without timezone conversion
     */
    protected function tanggalKeluar(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value,
            set: fn ($value) => $value,
        );
    }

    /**
     * Override toArray to format datetime without timezone
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Format tanggal_masuk and tanggal_keluar as Y-m-d H:i:s (no timezone)
        if (isset($array['tanggal_masuk']) && $array['tanggal_masuk']) {
            $array['tanggal_masuk'] = $this->getRawOriginal('tanggal_masuk');
        }
        if (isset($array['tanggal_keluar']) && $array['tanggal_keluar']) {
            $array['tanggal_keluar'] = $this->getRawOriginal('tanggal_keluar');
        }
        
        return $array;
    }

    /**
     * Status constants
     */
    const STATUS_DEFAULT = 0;          // Default
    const STATUS_TERSIMPAN = 1;        // Tersimpan
    const STATUS_GROUPER = 2;          // Grouper
    const STATUS_GROUPER_STAGE2 = 3;   // Grouper Stage 2
    const STATUS_FINAL = 4;            // Final
    const STATUS_KIRIM = 5;            // Kirim

    /**
     * Status constants for IDRG
     */
    const STATUS_DEFAULT_IDRG = 0;         // Default
    const STATUS_GROUPING_IDRG = 1;        // Grouping
    const STATUS_FINAL_IDRG = 2;           // Final

    /**
     * Get status options
     */
    public static function getStatusOptions()
    {
        return [
            self::STATUS_DEFAULT => 'Default',
            self::STATUS_TERSIMPAN => 'Tersimpan',
            self::STATUS_GROUPER => 'Grouper',
            self::STATUS_GROUPER_STAGE2 => 'Grouper Stage 2',
            self::STATUS_FINAL => 'Final',
            self::STATUS_KIRIM => 'Kirim',
        ];
    }

    /**
     * Get status options for IDRG
     */
    public static function getStatusOptionsIDRG()
    {
        return [
            self::STATUS_DEFAULT_IDRG => 'Default',
            self::STATUS_GROUPING_IDRG => 'Grouping',
            self::STATUS_FINAL_IDRG => 'Final',
        ];
    }

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status_pengiriman', $status);
    }

    /**
     * Scope untuk filter berdasarkan tanggal
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_pengajuan', [$startDate, $endDate]);
    }

    /**
     * Accessor untuk status dalam bahasa Indonesia
     */
    public function getStatusLabelAttribute()
    {
        $statuses = self::getStatusOptions();
        return $statuses[$this->status_pengiriman] ?? $this->status_pengiriman;
    }

    /**
     * Get status label for IDRG
     */
    public function getStatusLabelIDRGAttribute()
    {
        $statuses = self::getStatusOptionsIDRG();
        return $statuses[$this->status] ?? $this->status;
    }



    /**
     * Check if submission was successful (Tersimpan or higher)
     */
    public function isSuccess()
    {
        return $this->status_pengiriman >= self::STATUS_TERSIMPAN;
    }

    /**
     * Check if submission failed (Default status)
     */
    public function isFailed()
    {
        return $this->status_pengiriman === self::STATUS_DEFAULT;
    }

    /**
     * Check if submission is pending (Default status)
     */
    public function isPending()
    {
        return $this->status_pengiriman === self::STATUS_DEFAULT;
    }

    /**
     * Check if ready to send (Final status)
     */
    public function isReadyToSend()
    {
        return $this->status_pengiriman === self::STATUS_FINAL;
    }

    /**
     * Check if already sent (Kirim status)
     */
    public function isSent()
    {
        return $this->status_pengiriman === self::STATUS_KIRIM;
    }

    /**
     * Get status badge class for UI
     */
    public function getStatusBadgeClassAttribute()
    {
        return match ($this->status_pengiriman) {
            self::STATUS_DEFAULT => 'bg-gray-100 text-gray-800',
            self::STATUS_TERSIMPAN => 'bg-blue-100 text-blue-800',
            self::STATUS_GROUPER => 'bg-yellow-100 text-yellow-800',
            self::STATUS_GROUPER_STAGE2 => 'bg-orange-100 text-orange-800',
            self::STATUS_FINAL => 'bg-purple-100 text-purple-800',
            self::STATUS_KIRIM => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Get IDRG status badge class for UI
     */
    public function getIdrgStatusBadgeClassAttribute()
    {
        return match ($this->status) {
            self::STATUS_DEFAULT_IDRG => 'bg-gray-100 text-gray-800',
            self::STATUS_GROUPING_IDRG => 'bg-blue-100 text-blue-800',
            self::STATUS_FINAL_IDRG => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Accessor untuk IDRG status dalam bahasa Indonesia
     */
    public function getIdrgStatusLabelAttribute()
    {
        $statuses = self::getStatusOptionsIDRG();
        return $statuses[$this->idrg] ?? $this->idrg;
    }

    /**
     * Scope untuk filter berdasarkan IDRG status
     */
    public function scopeByIdrgStatus($query, $status)
    {
        return $query->where('idrg', $status);
    }

    /**
     * Check if IDRG processing is complete (Final status)
     */
    public function isIdrgComplete()
    {
        return $this->idrg === self::STATUS_FINAL_IDRG;
    }

    /**
     * Check if IDRG is in grouping process
     */
    public function isIdrgGrouping()
    {
        return $this->idrg === self::STATUS_GROUPING_IDRG;
    }

    /**
     * Check if IDRG is in default state
     */
    public function isIdrgDefault()
    {
        return $this->idrg === self::STATUS_DEFAULT_IDRG;
    }

    public function penjamin()
    {
        return $this->hasOne(Penjamin::class, 'NOMOR', 'nomor_sep');
    }
}
