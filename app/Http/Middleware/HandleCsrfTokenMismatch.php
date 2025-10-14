<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;

class HandleCsrfTokenMismatch
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            return $next($request);
        } catch (TokenMismatchException $e) {
            Log::warning('CSRF Token Mismatch Handled', [
                'url' => $request->url(),
                'method' => $request->method(),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
                'session_id' => session()->getId(),
                'has_session' => session()->isStarted()
            ]);

            // Handle AJAX requests
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'CSRF token mismatch. Please refresh the page and try again.',
                    'error' => 'csrf_token_mismatch',
                    'csrf_token' => csrf_token(), // Provide new token
                    'reload_required' => true
                ], 419);
            }

            // Handle regular requests - redirect back with error
            return redirect()->back()
                ->withInput($request->except(['password', '_token']))
                ->withErrors([
                    'csrf' => 'Your session has expired. Please try again.'
                ])
                ->with('error', 'Your session has expired. Please try again.');
        }
    }
}