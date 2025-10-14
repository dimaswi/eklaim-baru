<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class HandleProductionCsrf
{
    /**
     * Handle an incoming request.
     * Special CSRF handling for production environment with nginx
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply special handling in production
        if (!app()->environment('production')) {
            return $next($request);
        }

        // Check if this is a print bundle request
        if (!$request->is('eklaim/print-bundle/*')) {
            return $next($request);
        }

        // For GET requests, no CSRF needed
        if ($request->isMethod('GET')) {
            return $next($request);
        }

        // For POST requests, check CSRF token with production-specific handling
        if ($request->isMethod('POST')) {
            $sessionToken = $request->session()->token();
            $requestToken = $request->input('_token') ?: $request->header('X-CSRF-TOKEN');

            Log::info('Production CSRF Check', [
                'url' => $request->url(),
                'method' => $request->method(),
                'has_session_token' => !empty($sessionToken),
                'has_request_token' => !empty($requestToken),
                'tokens_match' => hash_equals($sessionToken ?? '', $requestToken ?? ''),
                'user_agent' => $request->userAgent(),
                'forwarded_for' => $request->header('X-Forwarded-For'),
                'real_ip' => $request->header('X-Real-IP'),
            ]);

            // If tokens don't match, regenerate and return new token
            if (!hash_equals($sessionToken ?? '', $requestToken ?? '')) {
                // Regenerate CSRF token
                $request->session()->regenerateToken();
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'CSRF token mismatch in production. Please refresh and try again.',
                        'csrf_error' => true,
                        'new_token' => $request->session()->token(),
                        'production_handling' => true
                    ], 419);
                }

                return redirect()->back()
                    ->withErrors(['csrf' => 'Security token expired. Please try again.'])
                    ->with('csrf_regenerated', true);
            }
        }

        return $next($request);
    }
}