# Print Bundle 502 Error Analysis & Solutions

## Error 502 Root Causes

### 1. **Memory Exhaustion**
- **Problem**: Multiple `base64_encode()` operations on large PDF files
- **Location**: Lines 676, 686, 804 in PrintBundleController.php
- **Impact**: Each PDF conversion to base64 increases memory usage by ~33%

### 2. **Database Query Overload**
- **Problem**: `getDocumentData()` method performs 15+ database queries per document type
- **Location**: Lines 925-1125 in PrintBundleController.php
- **Impact**: N+1 query problem in production with larger datasets

### 3. **INACBG API Timeout**
- **Problem**: `getBerkasKlaimData()` calls external API without timeout handling
- **Location**: Lines 1270+ in PrintBundleController.php
- **Impact**: Hanging requests cause 502 errors

### 4. **Production CSRF Middleware**
- **Problem**: `HandleProductionCsrf` middleware adds extra processing overhead
- **Location**: app/Http/Middleware/HandleProductionCsrf.php
- **Impact**: Additional validation steps that can timeout

## Immediate Solutions

### 1. **Add Memory Management**
```php
// Add to controller methods
ini_set('memory_limit', '1024M');
set_time_limit(300); // 5 minutes
```

### 2. **Optimize Database Queries**
```php
// Use eager loading instead of multiple queries
$data = HasilLaboratorium::with(['pengajuanKlaim'])
    ->where('pengajuan_klaim_id', $pengajuanId)
    ->get();
```

### 3. **Add Chunked Processing**
```php
// Process documents in chunks to prevent memory overflow
$chunks = array_chunk($documentTypes, 3);
foreach ($chunks as $chunk) {
    // Process 3 documents at a time
    gc_collect_cycles(); // Force garbage collection
}
```

### 4. **INACBG API Timeout**
```php
// Add timeout to API calls
$context = stream_context_create([
    'http' => [
        'timeout' => 30
    ]
]);
```

## Production-Specific Fixes

### 1. **Nginx Configuration**
```nginx
# Increase timeouts
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

### 2. **PHP-FPM Configuration**
```ini
# php-fpm.conf
request_terminate_timeout = 300
max_execution_time = 300
memory_limit = 1024M
```

### 3. **Laravel Queue Implementation**
- Move PDF generation to background jobs
- Use Redis/database queues for heavy operations
- Return job ID to frontend for progress tracking

## Error Monitoring

### 1. **Add Memory Tracking**
```php
Log::info('Memory Usage', [
    'current' => memory_get_usage(true),
    'peak' => memory_get_peak_usage(true),
    'limit' => ini_get('memory_limit')
]);
```

### 2. **Add Execution Time Tracking**
```php
$startTime = microtime(true);
// ... operations
$executionTime = microtime(true) - $startTime;
Log::info('Execution Time', ['time' => $executionTime]);
```

## Critical File Locations

1. **PrintBundleController.php**: Lines 676, 686, 804 (base64_encode operations)
2. **HandleProductionCsrf.php**: Production-specific CSRF handling
3. **getDocumentData()**: Lines 925-1125 (database queries)
4. **getBerkasKlaimData()**: Lines 1270+ (INACBG API calls)

## Recommended Implementation Order

1. **Immediate**: Add memory limits and timeout settings
2. **Short-term**: Optimize database queries and add chunked processing
3. **Long-term**: Implement queue system for heavy operations
4. **Monitor**: Add comprehensive logging for production debugging