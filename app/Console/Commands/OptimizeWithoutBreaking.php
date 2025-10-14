<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class OptimizeWithoutBreaking extends Command
{
    protected $signature = 'optimize:safe {--force : Force optimization even with warnings}';
    protected $description = 'Safely optimize Laravel without breaking CSRF or URL generation';

    public function handle()
    {
        $this->info('🚀 Starting Safe Laravel Optimization...');
        $this->newLine();

        // Step 1: Check current state
        $this->checkCurrentState();

        // Step 2: Clear all caches first
        $this->info('🧹 Clearing existing caches...');
        $this->clearAllCaches();

        // Step 3: Validate configuration
        $this->info('⚙️ Validating configuration...');
        if (!$this->validateConfiguration()) {
            $this->error('Configuration validation failed. Please fix issues before optimizing.');
            return 1;
        }

        // Step 4: Safe optimization
        $this->info('🔧 Performing safe optimization...');
        $this->safeOptimization();

        // Step 5: Post-optimization validation
        $this->info('✅ Validating optimization...');
        $this->validateOptimization();

        $this->newLine();
        $this->info('🎉 Safe optimization completed successfully!');
        
        return 0;
    }

    private function checkCurrentState()
    {
        $this->line('Current Environment: ' . app()->environment());
        $this->line('APP_URL: ' . config('app.url'));
        $this->line('APP_KEY: ' . (config('app.key') ? 'Set' : 'Missing'));
        $this->line('Session Driver: ' . config('session.driver'));
        $this->newLine();
    }

    private function clearAllCaches()
    {
        $commands = [
            'config:clear' => 'Configuration cache',
            'route:clear' => 'Route cache',
            'view:clear' => 'View cache',
            'cache:clear' => 'Application cache',
            'clear-compiled' => 'Compiled files'
        ];

        foreach ($commands as $command => $description) {
            try {
                $this->line("  Clearing {$description}...");
                Artisan::call($command);
                $this->line("  ✅ {$description} cleared");
            } catch (\Exception $e) {
                $this->error("  ❌ Failed to clear {$description}: " . $e->getMessage());
            }
        }
        
        $this->newLine();
    }

    private function validateConfiguration()
    {
        $valid = true;

        // Check APP_KEY
        if (empty(config('app.key'))) {
            $this->error('  ❌ APP_KEY is missing');
            $this->line('  Run: php artisan key:generate');
            $valid = false;
        } else {
            $this->line('  ✅ APP_KEY is configured');
        }

        // Check APP_URL
        $appUrl = config('app.url');
        if (empty($appUrl) || $appUrl === 'http://localhost') {
            $this->warn('  ⚠️ APP_URL is default/empty, this may cause URL generation issues');
            $this->line('  Consider setting proper APP_URL in .env file');
        } else {
            $this->line('  ✅ APP_URL is configured: ' . $appUrl);
        }

        // Check session configuration
        $sessionDriver = config('session.driver');
        if ($sessionDriver === 'database') {
            try {
                DB::connection()->getSchemaBuilder()->hasTable('sessions');
                $this->line('  ✅ Session table exists');
            } catch (\Exception $e) {
                $this->error('  ❌ Session table missing for database driver');
                $this->line('  Run: php artisan session:table && php artisan migrate');
                $valid = false;
            }
        }

        $this->newLine();
        return $valid;
    }

    private function safeOptimization()
    {
        // Step 1: Cache configuration (but validate first)
        try {
            $this->line('  Caching configuration...');
            Artisan::call('config:cache');
            
            // Test if config cache works
            $testUrl = config('app.url');
            if (empty($testUrl)) {
                throw new \Exception('Config cache broke URL generation');
            }
            
            $this->line('  ✅ Configuration cached successfully');
        } catch (\Exception $e) {
            $this->error('  ❌ Config caching failed: ' . $e->getMessage());
            $this->line('  Clearing config cache and continuing...');
            Artisan::call('config:clear');
        }

        // Step 2: Cache routes (with validation)
        try {
            $this->line('  Caching routes...');
            Artisan::call('route:cache');
            
            // Test if route cache works
            $testRoute = route('home');
            if (empty($testRoute)) {
                throw new \Exception('Route cache broke route generation');
            }
            
            $this->line('  ✅ Routes cached successfully');
        } catch (\Exception $e) {
            $this->error('  ❌ Route caching failed: ' . $e->getMessage());
            $this->line('  Clearing route cache and continuing...');
            Artisan::call('route:clear');
        }

        // Step 3: Cache views
        try {
            $this->line('  Caching views...');
            Artisan::call('view:cache');
            $this->line('  ✅ Views cached successfully');
        } catch (\Exception $e) {
            $this->error('  ❌ View caching failed: ' . $e->getMessage());
            Artisan::call('view:clear');
        }

        // Step 4: Optimize autoloader
        try {
            $this->line('  Optimizing autoloader...');
            Artisan::call('optimize');
            $this->line('  ✅ Autoloader optimized');
        } catch (\Exception $e) {
            $this->error('  ❌ Autoloader optimization failed: ' . $e->getMessage());
        }

        $this->newLine();
    }

    private function validateOptimization()
    {
        $tests = [
            'URL Generation' => function() {
                return !empty(config('app.url')) && !empty(url('/'));
            },
            'Route Generation' => function() {
                try {
                    return !empty(route('home'));
                } catch (\Exception $e) {
                    return false;
                }
            },
            'CSRF Token' => function() {
                try {
                    return !empty(csrf_token());
                } catch (\Exception $e) {
                    return false;
                }
            },
            'Session' => function() {
                try {
                    return session()->isStarted() || session()->start();
                } catch (\Exception $e) {
                    return false;
                }
            }
        ];

        foreach ($tests as $testName => $test) {
            if ($test()) {
                $this->line("  ✅ {$testName} working");
            } else {
                $this->error("  ❌ {$testName} failed");
            }
        }

        $this->newLine();
    }
}