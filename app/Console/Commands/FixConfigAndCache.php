<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class FixConfigAndCache extends Command
{
    protected $signature = 'fix:config-cache {--force : Force clear all caches}';
    protected $description = 'Fix configuration and cache issues that cause curl errors';

    public function handle()
    {
        $this->info('🔧 Starting Configuration and Cache Fix...');
        $this->newLine();

        // Step 1: Check current environment
        $this->info('📋 Environment Check:');
        $this->line('  Environment: ' . app()->environment());
        $this->line('  PHP Version: ' . phpversion());
        $this->line('  Laravel Version: ' . app()->version());
        $this->newLine();

        // Step 2: Clear caches step by step
        $this->info('🧹 Clearing Caches...');
        
        try {
            // Clear config cache
            $this->line('  Clearing config cache...');
            Artisan::call('config:clear');
            $this->line('  ✅ Config cache cleared');
            
            // Clear route cache
            $this->line('  Clearing route cache...');
            Artisan::call('route:clear');
            $this->line('  ✅ Route cache cleared');
            
            // Clear view cache
            $this->line('  Clearing view cache...');
            Artisan::call('view:clear');
            $this->line('  ✅ View cache cleared');
            
            // Clear application cache
            $this->line('  Clearing application cache...');
            Artisan::call('cache:clear');
            $this->line('  ✅ Application cache cleared');
            
            if ($this->option('force')) {
                // Clear compiled views and services
                $this->line('  Clearing compiled files...');
                Artisan::call('clear-compiled');
                $this->line('  ✅ Compiled files cleared');
                
                // Optimize clear
                $this->line('  Running optimize clear...');
                Artisan::call('optimize:clear');
                $this->line('  ✅ Optimization cleared');
            }
            
        } catch (\Exception $e) {
            $this->error('  ❌ Error clearing caches: ' . $e->getMessage());
        }
        
        $this->newLine();

        // Step 3: Check configuration issues
        $this->info('⚙️ Configuration Check:');
        
        // Check APP_KEY
        $appKey = config('app.key');
        if (empty($appKey)) {
            $this->error('  ❌ APP_KEY is missing!');
            $this->line('  Run: php artisan key:generate');
        } else {
            $this->line('  ✅ APP_KEY is set');
        }
        
        // Check session configuration
        $sessionDriver = config('session.driver');
        $this->line("  Session driver: {$sessionDriver}");
        
        if ($sessionDriver === 'database') {
            try {
                // Check if sessions table exists
                $hasSessionsTable = DB::getSchemaBuilder()->hasTable('sessions');
                if ($hasSessionsTable) {
                    $this->line('  ✅ Sessions table exists');
                } else {
                    $this->error('  ❌ Sessions table missing!');
                    $this->line('  Run: php artisan session:table && php artisan migrate');
                }
            } catch (\Exception $e) {
                $this->error('  ❌ Database connection issue: ' . $e->getMessage());
            }
        }
        
        // Check database connections
        $this->info('🗄️ Database Connection Check:');
        $connections = ['app', 'eklaim', 'medicalrecord'];
        
        foreach ($connections as $connection) {
            try {
                if (config("database.connections.{$connection}")) {
                    DB::connection($connection)->getPdo();
                    $this->line("  ✅ Connection '{$connection}' is working");
                } else {
                    $this->line("  ⚠️ Connection '{$connection}' not configured");
                }
            } catch (\Exception $e) {
                $this->error("  ❌ Connection '{$connection}' failed: " . $e->getMessage());
            }
        }
        
        $this->newLine();

        // Step 4: Fix permissions (if on Linux/Unix)
        if (PHP_OS_FAMILY !== 'Windows') {
            $this->info('🔒 Fixing Permissions...');
            
            $storagePath = storage_path();
            $bootstrapCachePath = base_path('bootstrap/cache');
            
            try {
                // Fix storage permissions
                exec("chmod -R 755 {$storagePath}");
                exec("chmod -R 755 {$bootstrapCachePath}");
                $this->line('  ✅ Permissions fixed');
            } catch (\Exception $e) {
                $this->error('  ❌ Permission fix failed: ' . $e->getMessage());
                $this->line('  Manual fix: chmod -R 755 storage bootstrap/cache');
            }
        }

        // Step 5: Regenerate optimized files
        $this->info('🚀 Regenerating Optimized Files...');
        
        try {
            // Generate fresh config cache
            $this->line('  Caching config...');
            Artisan::call('config:cache');
            $this->line('  ✅ Config cached');
            
            // Generate fresh route cache
            $this->line('  Caching routes...');
            Artisan::call('route:cache');
            $this->line('  ✅ Routes cached');
            
            // Optimize autoloader
            $this->line('  Optimizing autoloader...');
            Artisan::call('optimize');
            $this->line('  ✅ Autoloader optimized');
            
        } catch (\Exception $e) {
            $this->error('  ❌ Error regenerating caches: ' . $e->getMessage());
            $this->line('  You may need to run these manually after fixing issues');
        }
        
        $this->newLine();
        
        // Step 6: Test basic functionality
        $this->info('🧪 Testing Basic Functionality...');
        
        try {
            // Test route resolution
            $testRoute = route('eklaim.pengajuan.index');
            $this->line('  ✅ Route generation working');
            
            // Test CSRF token generation
            $csrfToken = csrf_token();
            if ($csrfToken) {
                $this->line('  ✅ CSRF token generation working');
            }
            
        } catch (\Exception $e) {
            $this->error('  ❌ Basic functionality test failed: ' . $e->getMessage());
        }

        $this->newLine();
        $this->info('✅ Configuration and Cache Fix Complete!');
        $this->newLine();
        
        // Final recommendations
        $this->info('📝 Recommendations:');
        $this->line('  1. If still having issues, check your .env file');
        $this->line('  2. Ensure web server has proper permissions');
        $this->line('  3. Check Laravel logs: storage/logs/laravel.log');
        $this->line('  4. For CSRF issues, ensure meta CSRF token is in frontend');
        $this->line('  5. Test with: php artisan serve (for development)');
        
        return 0;
    }
}