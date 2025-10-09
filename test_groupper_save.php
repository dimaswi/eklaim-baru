<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Eklaim\DataGroupper;
use Illuminate\Support\Facades\DB;

// Test connecting to the app database
try {
    echo "Testing database connection...\n";
    
    // Test basic connection
    $connection = DB::connection('app');
    $result = $connection->select('SELECT 1 as test');
    echo "Database connection successful: " . json_encode($result) . "\n";
    
    // Check if data_groupper table exists
    $tables = $connection->select("SHOW TABLES LIKE 'data_groupper'");
    echo "data_groupper table exists: " . (count($tables) > 0 ? 'YES' : 'NO') . "\n";
    
    // Check table structure for our fields
    $columns = $connection->select("DESCRIBE data_groupper");
    $columnNames = array_column($columns, 'Field');
    echo "response_inagrouper column exists: " . (in_array('response_inagrouper', $columnNames) ? 'YES' : 'NO') . "\n";
    echo "tarif_alt column exists: " . (in_array('tarif_alt', $columnNames) ? 'YES' : 'NO') . "\n";
    
    // Test saving data
    echo "\nTesting data save...\n";
    $testData = [
        'pengajuan_klaim_id' => 1,
        'nomor_sep' => 'TEST-' . time(),
        'response_inagrouper' => ['test' => 'data', 'array' => [1, 2, 3]],
        'tarif_alt' => ['tarif1' => 100000, 'tarif2' => 200000],
        'cbg_code' => 'TEST-CBG'
    ];
    
    $dataGroupper = new DataGroupper();
    $dataGroupper->fill($testData);
    $saved = $dataGroupper->save();
    
    echo "Save successful: " . ($saved ? 'YES' : 'NO') . "\n";
    echo "Saved ID: " . $dataGroupper->id . "\n";
    
    // Retrieve and check
    $retrieved = DataGroupper::find($dataGroupper->id);
    echo "Retrieved response_inagrouper: " . json_encode($retrieved->response_inagrouper) . "\n";
    echo "Retrieved tarif_alt: " . json_encode($retrieved->tarif_alt) . "\n";
    
    // Clean up
    $retrieved->delete();
    echo "Test data cleaned up.\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}