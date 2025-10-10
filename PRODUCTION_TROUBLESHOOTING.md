## Panduan Troubleshooting Production - Print Bundle

### 1. Script Database Check

Untuk mengecek database connection dan tabel di production, jalankan:

```bash
# Method 1: Menggunakan PHP script langsung
cd /path/to/your/laravel/project
php database_check.php

# Method 2: Menggunakan Artisan Command
php artisan db:diagnostic

# Method 3: Test dengan pengajuan ID specific
php artisan db:diagnostic --pengajuan-id=123
```

### 2. Monitor Log Production

Untuk memonitor log Laravel di production:

```bash
# Monitor log secara real-time
tail -f storage/logs/laravel.log | grep "Print Bundle"

# Filter log untuk error database
tail -f storage/logs/laravel.log | grep -E "(Print Bundle|database|connection|query)"

# Cek log hari ini saja
grep "Print Bundle" storage/logs/laravel-$(date +%Y-%m-%d).log

# Cek error terakhir
tail -100 storage/logs/laravel.log | grep -A 5 -B 5 "Print Bundle.*Error"
```

### 3. Manual Testing di Production

Buat file test sederhana untuk mengecek fungsi getAllMedicalRecords:

```php
<?php
// test_medical_records.php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\Eklaim\PrintBundleController;
use App\Models\Eklaim\PengajuanKlaim;

$pengajuanId = $argv[1] ?? null;

if (!$pengajuanId) {
    echo "Usage: php test_medical_records.php <pengajuan_id>\n";
    exit(1);
}

echo "Testing Medical Records untuk Pengajuan ID: {$pengajuanId}\n";

try {
    $pengajuan = PengajuanKlaim::find($pengajuanId);
    if (!$pengajuan) {
        echo "❌ Pengajuan not found\n";
        exit(1);
    }
    
    echo "✅ Pengajuan found: " . $pengajuan->nomor_sep . "\n";
    
    // Test controller method
    $controller = new PrintBundleController();
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('getAllMedicalRecords');
    $method->setAccessible(true);
    
    $medicalRecords = $method->invoke($controller, $pengajuanId, $pengajuan->status_pengiriman);
    
    echo "✅ Medical Records retrieved\n";
    echo "Total types: " . count($medicalRecords) . "\n";
    echo "Available documents:\n";
    
    foreach ($medicalRecords as $type => $record) {
        $status = $record['available'] ? '✅' : '❌';
        $count = $record['count'] ?? 0;
        echo "  {$status} {$type}: {$count} records\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
```

Jalankan dengan:
```bash
php test_medical_records.php 123
```

### 4. Environment Variables Check

Pastikan environment variables database sudah benar:

```bash
# Cek .env file
grep -E "^DB_" .env

# Pastikan tidak ada variables yang kosong
grep -E "^DB_.*=$" .env
```

### 5. Kemungkinan Masalah dan Solusi

#### Problem 1: Database Connection Failed
**Gejala**: Error "Connection refused" atau "Access denied"
**Solusi**: 
- Cek kredensial database di .env
- Pastikan database server running
- Cek firewall/security groups

#### Problem 2: Table Not Found
**Gejala**: Error "Table doesn't exist"
**Solusi**:
- Jalankan migration: `php artisan migrate`
- Cek nama tabel di database vs model

#### Problem 3: Empty Medical Records
**Gejala**: List bundle kosong padahal data ada
**Solusi**:
- Cek log untuk error query
- Pastikan foreign key pengajuan_klaim_id benar
- Cek data dengan query manual

#### Problem 4: Memory/Timeout Issues
**Gejala**: Script timed out atau memory limit exceeded
**Solusi**:
- Increase PHP memory limit
- Optimize queries
- Add pagination

### 6. Manual Database Query Test

Test queries secara manual:

```sql
-- Test pengajuan klaim
SELECT COUNT(*) FROM pengajuan_klaim;

-- Test dengan ID specific
SELECT * FROM pengajuan_klaim WHERE id = 123;

-- Test related records
SELECT 
    'hasil_laboratoriums' as table_name,
    COUNT(*) as count
FROM hasil_laboratoriums 
WHERE pengajuan_klaim_id = 123

UNION ALL

SELECT 
    'hasil_radiologis' as table_name,
    COUNT(*) as count
FROM hasil_radiologis 
WHERE pengajuan_klaim_id = 123;

-- dst untuk tabel lainnya
```

### 7. Quick Fix Commands

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Re-cache config
php artisan config:cache

# Check Laravel status
php artisan about

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo()
>>> DB::table('pengajuan_klaim')->count()
```

### 8. Monitoring Commands untuk Production

Tambahkan ke crontab untuk monitoring otomatis:

```bash
# Check database connection setiap 5 menit
*/5 * * * * cd /path/to/project && php artisan db:diagnostic > /tmp/db_check.log 2>&1

# Monitor error logs
0 */6 * * * grep -c "Print Bundle.*Error" storage/logs/laravel.log > /tmp/error_count.log
```

### Kontak dan Escalation

Jika masalah masih berlanjut:
1. Kumpulkan output dari semua script di atas
2. Ambil screenshot error dari browser
3. Export log error terakhir 24 jam
4. Cek status server/hosting provider