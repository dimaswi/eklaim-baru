<?php

/**
 * Test Medical Records untuk debugging production
 * Usage: php test_medical_records.php <pengajuan_id>
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\Eklaim\PrintBundleController;
use App\Models\Eklaim\PengajuanKlaim;
use Illuminate\Support\Facades\Log;

$pengajuanId = $argv[1] ?? null;

if (!$pengajuanId) {
    echo "Usage: php test_medical_records.php <pengajuan_id>\n";
    echo "Example: php test_medical_records.php 123\n";
    exit(1);
}

echo "=== Testing Medical Records ===\n";
echo "Pengajuan ID: {$pengajuanId}\n";
echo "Environment: " . app()->environment() . "\n";
echo "Timestamp: " . now()->toDateTimeString() . "\n\n";

try {
    // Test pengajuan klaim exists
    echo "1. Testing Pengajuan Klaim...\n";
    $pengajuan = PengajuanKlaim::find($pengajuanId);
    if (!$pengajuan) {
        echo "❌ Pengajuan not found\n";
        exit(1);
    }
    
    echo "✅ Pengajuan found\n";
    echo "   Nomor SEP: " . ($pengajuan->nomor_sep ?? 'NULL') . "\n";
    echo "   Nama Pasien: " . ($pengajuan->nama_pasien ?? 'NULL') . "\n";
    echo "   Status Pengiriman: " . ($pengajuan->status_pengiriman ?? 'NULL') . "\n";
    echo "   Connection: " . $pengajuan->getConnectionName() . "\n";
    echo "   Table: " . $pengajuan->getTable() . "\n\n";
    
    // Test controller method
    echo "2. Testing getAllMedicalRecords method...\n";
    $controller = new PrintBundleController();
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('getAllMedicalRecords');
    $method->setAccessible(true);
    
    $medicalRecords = $method->invoke($controller, $pengajuanId, $pengajuan->status_pengiriman);
    
    echo "✅ getAllMedicalRecords executed successfully\n";
    echo "Total document types: " . count($medicalRecords) . "\n\n";
    
    // Detail per document type
    echo "3. Medical Records Details:\n";
    
    $availableCount = 0;
    $totalCount = 0;
    
    foreach ($medicalRecords as $type => $record) {
        $status = ($record['available'] ?? false) ? '✅' : '❌';
        $count = $record['count'] ?? 0;
        $title = $record['title'] ?? ucfirst(str_replace('_', ' ', $type));
        
        echo "   {$status} {$type}:\n";
        echo "      Title: {$title}\n";
        echo "      Count: {$count}\n";
        echo "      Available: " . ($record['available'] ? 'YES' : 'NO') . "\n";
        echo "      Type: " . ($record['type'] ?? 'unknown') . "\n";
        
        if (isset($record['error_fallback']) && $record['error_fallback']) {
            echo "      ⚠️  Error Fallback: " . ($record['error_message'] ?? 'Unknown error') . "\n";
        }
        
        if (isset($record['priority'])) {
            echo "      Priority: " . $record['priority'] . "\n";
        }
        
        echo "\n";
        
        if ($record['available'] ?? false) {
            $availableCount++;
        }
        $totalCount++;
    }
    
    echo "4. Summary:\n";
    echo "   Total document types: {$totalCount}\n";
    echo "   Available documents: {$availableCount}\n";
    echo "   Missing documents: " . ($totalCount - $availableCount) . "\n\n";
    
    // Test specific queries
    echo "5. Direct Model Testing:\n";
    
    $models = [
        'HasilLaboratorium' => \App\Models\Eklaim\HasilLaboratorium::class,
        'HasilRadiologi' => \App\Models\Eklaim\HasilRadiologi::class,
        'RawatInapResumeMedis' => \App\Models\Eklaim\RawatInapResumeMedis::class,
        'RawatJalanResumeMedis' => \App\Models\Eklaim\RawatJalanResumeMedis::class,
        'UGDResumeMedis' => \App\Models\Eklaim\UGDResumeMedis::class,
        'RawatInapCPPT' => \App\Models\Eklaim\RawatInapCPPT::class,
        'RawatInapPengkajianAwal' => \App\Models\Eklaim\RawatInapPengkajianAwal::class,
        'RawatJalanPengkajianAwal' => \App\Models\Eklaim\RawatJalanPengkajianAwal::class,
        'UGDPengkajianAwal' => \App\Models\Eklaim\UGDPengkajianAwal::class,
        'UGDTriage' => \App\Models\Eklaim\UGDTriage::class,
        'RawatInapBalanceCairan' => \App\Models\Eklaim\RawatInapBalanceCairan::class,
        'Tagihan' => \App\Models\Eklaim\Tagihan::class,
    ];
    
    foreach ($models as $modelName => $modelClass) {
        try {
            $count = $modelClass::where('pengajuan_klaim_id', $pengajuanId)->count();
            $totalRecords = $modelClass::count();
            
            if ($count > 0) {
                echo "   ✅ {$modelName}: {$count} records (total in table: {$totalRecords})\n";
            } else {
                echo "   ❌ {$modelName}: 0 records (total in table: {$totalRecords})\n";
            }
        } catch (\Exception $e) {
            echo "   ❌ {$modelName}: ERROR - " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n6. Database Connection Test:\n";
    try {
        $pdo = \Illuminate\Support\Facades\DB::connection('app')->getPdo();
        echo "   ✅ Database connection successful\n";
        echo "   PDO Driver: " . $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) . "\n";
        echo "   Server Version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n";
    } catch (\Exception $e) {
        echo "   ❌ Database connection failed: " . $e->getMessage() . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Critical Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";