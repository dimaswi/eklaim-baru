<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\HasilLaboratorium;
use App\Models\Eklaim\HasilRadiologi;
use App\Models\Eklaim\RawatInapResumeMedis;
use App\Models\Eklaim\RawatJalanResumeMedis;
use App\Models\Eklaim\UGDResumeMedis;
use App\Models\Eklaim\RawatInapCPPT;
use App\Models\Eklaim\RawatInapPengkajianAwal;
use App\Models\Eklaim\RawatJalanPengkajianAwal;
use App\Models\Eklaim\UGDPengkajianAwal;
use App\Models\Eklaim\UGDTriage;
use App\Models\Eklaim\RawatInapBalanceCairan;
use App\Models\Eklaim\Tagihan;

class DatabaseDiagnostic extends Command
{
    protected $signature = 'db:diagnostic {--pengajuan-id= : Test with specific pengajuan ID}';
    protected $description = 'Run database diagnostic for PrintBundle functionality';

    public function handle()
    {
        $this->info('=== Database Diagnostic for PrintBundle ===');
        $this->info('Environment: ' . app()->environment());
        $this->info('Laravel Version: ' . app()->version());
        $this->info('PHP Version: ' . phpversion());
        $this->newLine();

        // Test database connections
        $this->testDatabaseConnections();
        
        // Test required tables
        $this->testRequiredTables();
        
        // Test models
        $this->testModels();
        
        // Test specific pengajuan if provided
        if ($pengajuanId = $this->option('pengajuan-id')) {
            $this->testSpecificPengajuan($pengajuanId);
        }
        
        $this->info('=== Diagnostic Complete ===');
    }
    
    private function testDatabaseConnections()
    {
        $this->info('Testing Database Connections...');
        
        $connections = ['app', 'eklaim', 'medicalrecord'];
        
        foreach ($connections as $connection) {
            $config = Config::get("database.connections.{$connection}");
            if ($config) {
                $this->line("Connection '{$connection}':");
                $this->line("  Host: " . $config['host']);
                $this->line("  Database: " . $config['database']);
                
                try {
                    DB::connection($connection)->getPdo();
                    $this->line("  Status: <fg=green>✅ Connected</>");
                    
                    // Test simple query
                    DB::connection($connection)->select('SELECT 1 as test');
                    $this->line("  Query Test: <fg=green>✅ Success</>");
                    
                } catch (\Exception $e) {
                    $this->line("  Status: <fg=red>❌ Failed - " . $e->getMessage() . "</>");
                }
            } else {
                $this->line("Connection '{$connection}': <fg=red>❌ Not configured</>");
            }
            $this->newLine();
        }
    }
    
    private function testRequiredTables()
    {
        $this->info('Testing Required Tables (app connection)...');
        
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
        
        try {
            foreach ($requiredTables as $table) {
                try {
                    $exists = DB::connection('app')->getSchemaBuilder()->hasTable($table);
                    if ($exists) {
                        $count = DB::connection('app')->table($table)->count();
                        $this->line("Table '{$table}': <fg=green>✅ Exists (records: {$count})</>");
                    } else {
                        $this->line("Table '{$table}': <fg=red>❌ Missing</>");
                    }
                } catch (\Exception $e) {
                    $this->line("Table '{$table}': <fg=red>❌ Error - " . $e->getMessage() . "</>");
                }
            }
        } catch (\Exception $e) {
            $this->error("Cannot check tables: " . $e->getMessage());
        }
        $this->newLine();
    }
    
    private function testModels()
    {
        $this->info('Testing Models...');
        
        $models = [
            'PengajuanKlaim' => PengajuanKlaim::class,
            'HasilLaboratorium' => HasilLaboratorium::class,
            'HasilRadiologi' => HasilRadiologi::class,
            'RawatInapResumeMedis' => RawatInapResumeMedis::class,
            'RawatJalanResumeMedis' => RawatJalanResumeMedis::class,
            'UGDResumeMedis' => UGDResumeMedis::class,
            'RawatInapCPPT' => RawatInapCPPT::class,
            'RawatInapPengkajianAwal' => RawatInapPengkajianAwal::class,
            'RawatJalanPengkajianAwal' => RawatJalanPengkajianAwal::class,
            'UGDPengkajianAwal' => UGDPengkajianAwal::class,
            'UGDTriage' => UGDTriage::class,
            'RawatInapBalanceCairan' => RawatInapBalanceCairan::class,
            'Tagihan' => Tagihan::class
        ];
        
        foreach ($models as $modelName => $modelClass) {
            try {
                $model = new $modelClass();
                $connection = $model->getConnectionName();
                $table = $model->getTable();
                $count = $modelClass::count();
                $this->line("Model '{$modelName}': <fg=green>✅ OK</> (connection: {$connection}, table: {$table}, records: {$count})");
            } catch (\Exception $e) {
                $this->line("Model '{$modelName}': <fg=red>❌ Error - " . $e->getMessage() . "</>");
            }
        }
        $this->newLine();
    }
    
    private function testSpecificPengajuan($pengajuanId)
    {
        $this->info("Testing Specific Pengajuan ID: {$pengajuanId}");
        
        try {
            $pengajuan = PengajuanKlaim::find($pengajuanId);
            if (!$pengajuan) {
                $this->error("Pengajuan with ID {$pengajuanId} not found");
                return;
            }
            
            $this->line("Pengajuan found:");
            $this->line("  ID: " . $pengajuan->id);
            $this->line("  Nomor SEP: " . ($pengajuan->nomor_sep ?? 'NULL'));
            $this->line("  Nama Pasien: " . ($pengajuan->nama_pasien ?? 'NULL'));
            $this->line("  Status Pengiriman: " . ($pengajuan->status_pengiriman ?? 'NULL'));
            $this->newLine();
            
            // Test each model for this pengajuan
            $models = [
                'HasilLaboratorium' => HasilLaboratorium::class,
                'HasilRadiologi' => HasilRadiologi::class,
                'RawatInapResumeMedis' => RawatInapResumeMedis::class,
                'RawatJalanResumeMedis' => RawatJalanResumeMedis::class,
                'UGDResumeMedis' => UGDResumeMedis::class,
                'RawatInapCPPT' => RawatInapCPPT::class,
                'RawatInapPengkajianAwal' => RawatInapPengkajianAwal::class,
                'RawatJalanPengkajianAwal' => RawatJalanPengkajianAwal::class,
                'UGDPengkajianAwal' => UGDPengkajianAwal::class,
                'UGDTriage' => UGDTriage::class,
                'RawatInapBalanceCairan' => RawatInapBalanceCairan::class,
                'Tagihan' => Tagihan::class
            ];
            
            $this->info('Related records for this pengajuan:');
            foreach ($models as $modelName => $modelClass) {
                try {
                    $count = $modelClass::where('pengajuan_klaim_id', $pengajuanId)->count();
                    if ($count > 0) {
                        $this->line("  {$modelName}: <fg=green>{$count} records</>");
                    } else {
                        $this->line("  {$modelName}: <fg=yellow>0 records</>");
                    }
                } catch (\Exception $e) {
                    $this->line("  {$modelName}: <fg=red>Error - " . $e->getMessage() . "</>");
                }
            }
            
        } catch (\Exception $e) {
            $this->error("Error testing pengajuan {$pengajuanId}: " . $e->getMessage());
        }
    }
}