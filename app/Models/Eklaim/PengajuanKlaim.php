<?php

namespace App\Models\Eklaim;

use App\Models\SIMRS\Penjamin;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'date',
        'tanggal_masuk' => 'date',
        'tanggal_keluar' => 'date',
        'tgl_lahir' => 'date',
        'response_data' => 'array',
    ];

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
        return match($this->status_pengiriman) {
            self::STATUS_DEFAULT => 'bg-gray-100 text-gray-800',
            self::STATUS_TERSIMPAN => 'bg-blue-100 text-blue-800',
            self::STATUS_GROUPER => 'bg-yellow-100 text-yellow-800',
            self::STATUS_GROUPER_STAGE2 => 'bg-orange-100 text-orange-800',
            self::STATUS_FINAL => 'bg-purple-100 text-purple-800',
            self::STATUS_KIRIM => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function penjamin()
    {
        return $this->hasOne(Penjamin::class, 'NOMOR', 'nomor_sep');
    }
}
