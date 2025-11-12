<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Deteksi jika request datang melalui Cloudflare / reverse proxy
        if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
            $scheme = $_SERVER['HTTP_X_FORWARDED_PROTO'];

            // Jika lewat HTTPS, set agar Laravel tahu ini HTTPS
            if ($scheme === 'https') {
                $this->app['request']->server->set('HTTPS', 'on');
                \Illuminate\Support\Facades\URL::forceScheme('https');
            } else {
                // Jika HTTP, pastikan Laravel tidak memaksa HTTPS
                $this->app['request']->server->set('HTTPS', 'off');
            }
        }
    }
}
