<?php

/**
 * Script untuk mengecek database connections dan tabel yang diperlukan
 * Jalankan dengan: php database_check.php
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

echo "=== Database Connection Check ===\n";
echo "Environment: " . app()->environment() . "\n";
echo "Laravel Version: " . app()->version() . "\n";
echo "PHP Version: " . phpversion() . "\n\n";

// Check database configuration
echo "=== Database Configuration ===\n";
echo "Default Connection: " . Config::get('database.default') . "\n";

$connections = ['app', 'eklaim', 'medicalrecord'];

foreach ($connections as $connection) {
    $config = Config::get("database.connections.{$connection}");
    if ($config) {
        echo "Connection '{$connection}':\n";
        echo "  Driver: " . $config['driver'] . "\n";
        echo "  Host: " . $config['host'] . "\n";
        echo "  Database: " . $config['database'] . "\n";
        echo "  Username: " . $config['username'] . "\n";
        
        // Test connection
        try {
            DB::connection($connection)->getPdo();
            echo "  Status: ✅ Connected\n";
            
            // Test simple query
            $result = DB::connection($connection)->select('SELECT 1 as test');
            echo "  Query Test: ✅ Success\n";
            
        } catch (Exception $e) {
            echo "  Status: ❌ Failed - " . $e->getMessage() . "\n";
        }
    } else {
        echo "Connection '{$connection}': ❌ Not configured\n";
    }
    echo "\n";
}

// Check required tables for PrintBundle
echo "=== Required Tables Check (app connection) ===\n";

$requiredTables = [
    'pengajuan_klaim',
    'hasil_laboratoriums',
    'hasil_radiologis',
    'rawat_inap_resume_medis',
    'rawat_jalan_resume_medis',
    'ugd_resume_medis',
    'rawat_inap_cpptes',
    'rawat_inap_pengkajian_awals',
    'rawat_jalan_pengkajian_awals',
    'ugd_pengkajian_awals',
    'ugd_triages',
    'rawat_inap_balance_cairans',
    'tagihans'
];

$connectionToCheck = 'app';

try {
    foreach ($requiredTables as $table) {
        try {
            $exists = DB::connection($connectionToCheck)->getSchemaBuilder()->hasTable($table);
            if ($exists) {
                $count = DB::connection($connectionToCheck)->table($table)->count();
                echo "Table '{$table}': ✅ Exists (records: {$count})\n";
            } else {
                echo "Table '{$table}': ❌ Missing\n";
            }
        } catch (Exception $e) {
            echo "Table '{$table}': ❌ Error - " . $e->getMessage() . "\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Cannot check tables: " . $e->getMessage() . "\n";
}

echo "\n=== Test Sample Queries ===\n";

// Test pengajuan_klaim query
try {
    $count = DB::connection('app')->table('pengajuan_klaim')->count();
    echo "Total pengajuan_klaim records: {$count}\n";
    
    $sample = DB::connection('app')->table('pengajuan_klaim')->first();
    if ($sample) {
        echo "Sample pengajuan_klaim ID: " . $sample->id . "\n";
        echo "Sample nomor_sep: " . ($sample->nomor_sep ?? 'NULL') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Error querying pengajuan_klaim: " . $e->getMessage() . "\n";
}

// Test model instantiation
echo "\n=== Model Tests ===\n";

$models = [
    'App\Models\Eklaim\PengajuanKlaim',
    'App\Models\Eklaim\HasilLaboratorium',
    'App\Models\Eklaim\HasilRadiologi',
    'App\Models\Eklaim\RawatInapResumeMedis',
    'App\Models\Eklaim\RawatJalanResumeMedis',
    'App\Models\Eklaim\UGDResumeMedis',
    'App\Models\Eklaim\RawatInapCPPT',
    'App\Models\Eklaim\RawatInapPengkajianAwal',
    'App\Models\Eklaim\RawatJalanPengkajianAwal',
    'App\Models\Eklaim\UGDPengkajianAwal',
    'App\Models\Eklaim\UGDTriage',
    'App\Models\Eklaim\RawatInapBalanceCairan',
    'App\Models\Eklaim\Tagihan'
];

foreach ($models as $modelClass) {
    try {
        $model = new $modelClass();
        $connection = $model->getConnectionName();
        $table = $model->getTable();
        $count = $modelClass::count();
        echo "Model '{$modelClass}': ✅ OK (connection: {$connection}, table: {$table}, records: {$count})\n";
    } catch (Exception $e) {
        echo "Model '{$modelClass}': ❌ Error - " . $e->getMessage() . "\n";
    }
}

echo "\n=== End Database Check ===\n";