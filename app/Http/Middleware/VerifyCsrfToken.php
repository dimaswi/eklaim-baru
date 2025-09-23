<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Exclude print bundle preview and PDF generation from CSRF for easier access
        'eklaim/print-bundle/*/preview',
        'eklaim/print-bundle/*/pdf',
        'eklaim/print-bundle/*/bundle',
    ];
}