<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class QRCodeHelper
{
    /**
     * Generate QR Code data URL menggunakan QR Server API
     * 
     * @param string $text
     * @param int $size
     * @return string
     */
    public static function generateDataURL($text, $size = 150)
    {
        // Encode text untuk URL
        $encodedText = urlencode($text);
        
        // Menggunakan QR Server API (gratis) dengan margin yang lebih baik
        $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size={$size}x{$size}&data={$encodedText}&format=png&margin=5";
        
        try {
            // Set context untuk allow_url_fopen dan ignore SSL
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'method' => 'GET',
                    'ignore_errors' => true,
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ]
            ]);
            
            // Get QR code image content
            $imageContent = file_get_contents($qrUrl, false, $context);
            
            if ($imageContent !== false && !empty($imageContent)) {
                // Convert to base64 data URL
                $base64 = base64_encode($imageContent);
                return 'data:image/png;base64,' . $base64;
            }
        } catch (\Exception $e) {
            // Jika gagal, log error dan return fallback
            Log::warning('Failed to generate QR code from API: ' . $e->getMessage());
        }
        
        // Fallback: return placeholder QR code
        return self::generateFallbackQR($text);
    }
    
    /**
     * Generate simple QR code fallback
     * 
     * @param string $text
     * @return string
     */
    private static function generateFallbackQR($text)
    {
        // Generate a simple SVG QR-like pattern based on text hash
        $hash = md5($text);
        $patterns = [];
        
        // Generate pattern dari hash
        for ($i = 0; $i < 16; $i++) {
            $patterns[] = hexdec($hash[$i]) % 2;
        }
        
        $svg = '
        <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
            <rect width="60" height="60" fill="white" stroke="black" stroke-width="1"/>
            
            <!-- Corner markers -->
            <rect x="5" y="5" width="10" height="10" fill="black"/>
            <rect x="7" y="7" width="6" height="6" fill="white"/>
            <rect x="45" y="5" width="10" height="10" fill="black"/>
            <rect x="47" y="47" width="6" height="6" fill="white"/>
            <rect x="5" y="45" width="10" height="10" fill="black"/>
            <rect x="7" y="47" width="6" height="6" fill="white"/>
            
            <!-- Data pattern -->
            <rect x="20" y="20" width="4" height="4" fill="' . ($patterns[0] ? 'black' : 'white') . '"/>
            <rect x="25" y="20" width="4" height="4" fill="' . ($patterns[1] ? 'black' : 'white') . '"/>
            <rect x="30" y="20" width="4" height="4" fill="' . ($patterns[2] ? 'black' : 'white') . '"/>
            <rect x="35" y="20" width="4" height="4" fill="' . ($patterns[3] ? 'black' : 'white') . '"/>
            
            <rect x="20" y="25" width="4" height="4" fill="' . ($patterns[4] ? 'black' : 'white') . '"/>
            <rect x="25" y="25" width="4" height="4" fill="black"/>
            <rect x="30" y="25" width="4" height="4" fill="black"/>
            <rect x="35" y="25" width="4" height="4" fill="' . ($patterns[5] ? 'black' : 'white') . '"/>
            
            <rect x="20" y="30" width="4" height="4" fill="' . ($patterns[6] ? 'black' : 'white') . '"/>
            <rect x="25" y="30" width="4" height="4" fill="black"/>
            <rect x="30" y="30" width="4" height="4" fill="black"/>
            <rect x="35" y="30" width="4" height="4" fill="' . ($patterns[7] ? 'black' : 'white') . '"/>
            
            <rect x="20" y="35" width="4" height="4" fill="' . ($patterns[8] ? 'black' : 'white') . '"/>
            <rect x="25" y="35" width="4" height="4" fill="' . ($patterns[9] ? 'black' : 'white') . '"/>
            <rect x="30" y="35" width="4" height="4" fill="' . ($patterns[10] ? 'black' : 'white') . '"/>
            <rect x="35" y="35" width="4" height="4" fill="' . ($patterns[11] ? 'black' : 'white') . '"/>
            
            <!-- Timing patterns -->
            <rect x="20" y="15" width="2" height="2" fill="black"/>
            <rect x="25" y="15" width="2" height="2" fill="white"/>
            <rect x="30" y="15" width="2" height="2" fill="black"/>
            <rect x="35" y="15" width="2" height="2" fill="white"/>
            
            <rect x="15" y="20" width="2" height="2" fill="black"/>
            <rect x="15" y="25" width="2" height="2" fill="white"/>
            <rect x="15" y="30" width="2" height="2" fill="black"/>
            <rect x="15" y="35" width="2" height="2" fill="white"/>
        </svg>';
        
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }
    
    /**
     * Generate QR code untuk nama dengan informasi tambahan
     * 
     * @param string $nama
     * @param string $nip
     * @param string $role
     * @return string
     */
    public static function generateForStaff($nama, $nip, $role = '')
    {
        // Format QR text yang lebih sederhana dan mudah dibaca
        $qrText = "{$nama} - {$nip}";
        if ($role) {
            $qrText .= " ({$role})";
        }
        
        return self::generateDataURL($qrText, 120);
    }
}
