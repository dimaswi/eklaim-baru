<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PDF Generation Performance Optimization
    |--------------------------------------------------------------------------
    |
    | Settings to improve PDF generation speed and reduce file sizes
    |
    */

    // Cache Settings
    'cache_logos' => env('PDF_CACHE_LOGOS', true),
    'cache_qr_codes' => env('PDF_CACHE_QR', false), // QR codes are dynamic, usually don't cache
    'cache_fonts' => env('PDF_CACHE_FONTS', true),
    
    // Performance Settings
    'parallel_processing' => env('PDF_PARALLEL_PROCESSING', false), // Experimental
    'max_parallel_workers' => env('PDF_MAX_WORKERS', 2),
    'pre_generate_common_assets' => env('PDF_PRE_GENERATE_ASSETS', true),
    
    // DomPDF Optimization
    'dompdf_options' => [
        'isRemoteEnabled' => false, // Disable remote file loading
        'isHtml5ParserEnabled' => true,
        'isFontSubsettingEnabled' => true,
        'defaultFont' => 'sans-serif',
        'dpi' => 72, // Lower DPI = smaller files
        'enable_font_subsetting' => true,
        'compress' => 1,
        'debugPng' => false,
        'debugKeepTemp' => false,
        'debugCss' => false,
        'debugLayout' => false,
        'logOutputFile' => null, // Disable logging for speed
    ],
    
    // Memory Management
    'immediate_cleanup' => env('PDF_IMMEDIATE_CLEANUP', true),
    'aggressive_gc' => env('PDF_AGGRESSIVE_GC', true),
];
