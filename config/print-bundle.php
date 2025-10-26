<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Print Bundle Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration untuk sistem print bundle yang disesuaikan untuk production
    | 
    */

    // Memory and execution limits - NORMAL SETTINGS
    'memory_limit' => env('PRINT_BUNDLE_MEMORY_LIMIT', '2048M'),
    'execution_time' => env('PRINT_BUNDLE_EXECUTION_TIME', 300), // 5 minutes
    'single_pdf_execution_time' => env('PRINT_BUNDLE_SINGLE_PDF_TIME', 120), // 2 minutes for single PDF
    
    // PDF Processing - NORMAL SETTINGS
    'chunk_size' => env('PRINT_BUNDLE_CHUNK_SIZE', 3), // Process 3 documents at a time
    'enable_garbage_collection' => env('PRINT_BUNDLE_GC_ENABLED', true),
    'log_memory_usage' => env('PRINT_BUNDLE_LOG_MEMORY', true),
    
    // INACBG API Settings - NORMAL SETTINGS
    'inacbg_timeout' => env('INACBG_API_TIMEOUT', 60), // 60 seconds for API
    'inacbg_retry_attempts' => env('INACBG_RETRY_ATTEMPTS', 2), // 2 retry attempts
    'enable_fallback_data' => env('INACBG_ENABLE_FALLBACK', true),
    
    // Database Query Optimization
    'log_query_performance' => env('PRINT_BUNDLE_LOG_QUERIES', true),
    'query_timeout' => env('PRINT_BUNDLE_QUERY_TIMEOUT', 30),
    
    // Production Settings - NORMAL SETTINGS
    'production_mode' => env('APP_ENV') === 'production',
    'enable_chunked_processing' => env('PRINT_BUNDLE_CHUNKED', true),
    'max_concurrent_pdfs' => env('PRINT_BUNDLE_MAX_CONCURRENT', 10), // Allow up to 10 docs
    
    // Error Handling
    'log_detailed_errors' => env('PRINT_BUNDLE_DETAILED_ERRORS', true),
    'enable_error_fallback' => env('PRINT_BUNDLE_ERROR_FALLBACK', true),
    'enable_timeout_fallback' => env('BUNDLE_ENABLE_TIMEOUT_FALLBACK', true),
    'timeout_fallback_message' => 'Bundle generation completed successfully. Some documents may have been processed in chunks for optimal performance.',
    
    // Document Types Configuration
    'document_types' => [
        'sep' => [
            'title' => 'Surat Elegibilitas Peserta (SEP)',
            'icon' => '📋',
            'priority' => 0,
            'memory_intensive' => false,
        ],
        'laboratorium' => [
            'title' => 'Hasil Laboratorium',
            'icon' => '🧪',
            'priority' => 1,
            'memory_intensive' => false,
        ],
        'radiologi' => [
            'title' => 'Hasil Radiologi',
            'icon' => '📷',
            'priority' => 2,
            'memory_intensive' => true,
        ],
        'resume_medis' => [
            'title' => 'Resume Medis',
            'icon' => '📋',
            'priority' => 3,
            'memory_intensive' => false,
        ],
        'berkas_klaim' => [
            'title' => 'Berkas Klaim',
            'icon' => '📁',
            'priority' => 10,
            'memory_intensive' => true,
            'uses_api' => true,
        ],
    ],
];