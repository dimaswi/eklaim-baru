<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class DateHelper
{
    /**
     * Parse date string from various formats to DateTime object
     * Supports:
     * - ISO format: 2025-01-15T14:30:00 or 2025-01-15T14:30
     * - Database format: 2025-01-15 14:30:00
     * - Indonesian format: 15/01/2025 14:30:00 or 15/01/2025 14:30
     * 
     * @param string|null $dateString
     * @return \DateTime|null
     */
    public static function parseDateTime(?string $dateString): ?\DateTime
    {
        if (empty($dateString)) {
            return null;
        }

        try {
            // Check if it's dd/mm/yyyy format (Indonesian format)
            if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/', $dateString, $matches)) {
                $day = $matches[1];
                $month = $matches[2];
                $year = $matches[3];
                $hour = $matches[4];
                $minute = $matches[5];
                $second = $matches[6] ?? '00';
                
                // Validate date components
                if (!checkdate((int)$month, (int)$day, (int)$year)) {
                    Log::warning('Invalid date components', ['input' => $dateString]);
                    return null;
                }
                
                $dateString = "{$year}-{$month}-{$day} {$hour}:{$minute}:{$second}";
            }

            // Check if it's dd/mm/yyyy format without time
            if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateString, $matches)) {
                $day = $matches[1];
                $month = $matches[2];
                $year = $matches[3];
                
                if (!checkdate((int)$month, (int)$day, (int)$year)) {
                    Log::warning('Invalid date components', ['input' => $dateString]);
                    return null;
                }
                
                $dateString = "{$year}-{$month}-{$day} 00:00:00";
            }

            // Now try to parse with DateTime (handles ISO and database formats)
            return new \DateTime($dateString);
        } catch (\Exception $e) {
            Log::warning('Failed to parse date string', [
                'input' => $dateString,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Format date for database storage (Y-m-d H:i:s)
     * 
     * @param string|null $dateString
     * @return string|null
     */
    public static function formatForDatabase(?string $dateString): ?string
    {
        $date = self::parseDateTime($dateString);
        return $date ? $date->format('Y-m-d H:i:s') : null;
    }

    /**
     * Format date for INACBG API (Y-m-d H:i:s)
     * Returns empty string instead of null for API compatibility
     * 
     * @param string|null $dateString
     * @return string
     */
    public static function formatForInacbg(?string $dateString): string
    {
        $date = self::parseDateTime($dateString);
        return $date ? $date->format('Y-m-d H:i:s') : '';
    }

    /**
     * Format date for display (d/m/Y H:i:s) - Indonesian format
     * 
     * @param string|null $dateString
     * @return string
     */
    public static function formatForDisplay(?string $dateString): string
    {
        $date = self::parseDateTime($dateString);
        return $date ? $date->format('d/m/Y H:i:s') : '';
    }

    /**
     * Format date for frontend datetime-local input (Y-m-d\TH:i:s)
     * 
     * @param string|null $dateString
     * @return string
     */
    public static function formatForInput(?string $dateString): string
    {
        $date = self::parseDateTime($dateString);
        return $date ? $date->format('Y-m-d\TH:i:s') : '';
    }

    /**
     * Convert ISO format to Indonesian display format
     * 
     * @param string|null $isoDateString
     * @return string
     */
    public static function isoToIndonesian(?string $isoDateString): string
    {
        return self::formatForDisplay($isoDateString);
    }

    /**
     * Convert Indonesian format to ISO format
     * 
     * @param string|null $indonesianDateString
     * @return string
     */
    public static function indonesianToIso(?string $indonesianDateString): string
    {
        return self::formatForInput($indonesianDateString);
    }
}
