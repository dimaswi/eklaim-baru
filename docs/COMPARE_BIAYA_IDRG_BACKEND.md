# Backend Implementation - Compare Biaya IDRG Integration

## Overview
Dokumentasi ini menjelaskan implementasi backend untuk integrasi IDRG di halaman Compare Biaya.

## Alur Proses

```
1. User buka halaman Compare Biaya
   ↓
2. Jika belum ada pengajuan_klaim → Tampilkan modal buat pengajuan klaim
   ↓
3. Setelah pengajuan_klaim dibuat (idrg default = 0)
   ↓
4. Tampilkan modal IDRG Grouping
   ↓
5. User pilih diagnosis & procedure IDRG
   ↓
6. Submit IDRG → Backend:
   - Save idrg_diagnosa & idrg_procedure
   - Set idrg = 2 (langsung final)
   - Trigger INACBG Grouping otomatis
   ↓
7. Tampilkan hasil INACBG Grouping (dataGroupper)
   ↓
8. User lanjut ke stage2/final seperti biasa
```

## Required Backend Routes

### 1. Endpoint IDRG Grouping + INACBG Grouping (Kombinasi)

**Route:**
```php
Route::post('/biaya/compare/{id}/idrg-grouping-and-inacbg', [CompareController::class, 'idrgGroupingAndInacbg']);
```

**Request Body:**
```json
{
    "idrg_diagnosa": "A01#B02+2#C03",
    "idrg_procedure": "P01+3#P02",
    "pengajuan_klaim_id": 123,
    "nomor_sep": "0301R0010123K000001"
}
```

**Controller Method:**
```php
public function idrgGroupingAndInacbg(Request $request, $id)
{
    try {
        DB::beginTransaction();
        
        // 1. Validate request
        $validated = $request->validate([
            'idrg_diagnosa' => 'required|string',
            'idrg_procedure' => 'nullable|string',
            'pengajuan_klaim_id' => 'required|integer',
            'nomor_sep' => 'required|string',
        ]);
        
        // 2. Update pengajuan klaim dengan IDRG data
        $pengajuanKlaim = PengajuanKlaim::findOrFail($validated['pengajuan_klaim_id']);
        $pengajuanKlaim->update([
            'idrg' => 2, // Langsung set ke final (skip status 1)
            'idrg_diagnosa' => $validated['idrg_diagnosa'],
            'idrg_procedure' => $validated['idrg_procedure'],
        ]);
        
        // 3. Parse IDRG diagnoses untuk grouping
        $diagnoses = $this->parseIdrgDiagnoses($validated['idrg_diagnosa']);
        $procedures = $validated['idrg_procedure'] 
            ? $this->parseIdrgProcedures($validated['idrg_procedure']) 
            : [];
        
        // 4. Persiapkan data untuk INACBG Grouping
        $groupingData = [
            'nomor_sep' => $validated['nomor_sep'],
            'diagnoses' => $diagnoses, // Array of diagnosis codes
            'procedures' => $procedures, // Array of procedure codes
            // Data lain yang diperlukan untuk grouping (dari kunjungan_rs, dll)
        ];
        
        // 5. Call INACBG Grouping service
        $inacbgService = app(InacbgService::class);
        $grouperResult = $inacbgService->performGrouping($groupingData);
        
        // 6. Save grouper result
        $dataGroupper = DataGroupper::create([
            'pengajuan_klaim_id' => $pengajuanKlaim->id,
            'nomor_sep' => $validated['nomor_sep'],
            'cbg_code' => $grouperResult['cbg_code'],
            'cbg_description' => $grouperResult['cbg_description'],
            'cbg_tariff' => $grouperResult['cbg_tariff'],
            'kelas' => $grouperResult['kelas'],
            'inacbg_version' => $grouperResult['inacbg_version'],
            // Fields lain...
        ]);
        
        // 7. Update status pengajuan klaim
        $pengajuanKlaim->update([
            'status_pengiriman' => 2, // Status grouper selesai
        ]);
        
        DB::commit();
        
        return redirect()
            ->back()
            ->with('success', 'IDRG dan INACBG Grouping berhasil dilakukan!');
            
    } catch (\Exception $e) {
        DB::rollBack();
        
        return redirect()
            ->back()
            ->withErrors(['error' => 'Gagal melakukan grouping: ' . $e->getMessage()]);
    }
}

/**
 * Parse IDRG diagnoses string ke array
 * Format: "A01#B02+2#C03" → ["A01", "B02", "B02", "C03"]
 */
private function parseIdrgDiagnoses(string $diagnosesString): array
{
    $result = [];
    $codes = explode('#', $diagnosesString);
    
    foreach ($codes as $codeWithCount) {
        if (strpos($codeWithCount, '+') !== false) {
            [$code, $count] = explode('+', $codeWithCount);
            for ($i = 0; $i < (int)$count; $i++) {
                $result[] = $code;
            }
        } else {
            $result[] = $codeWithCount;
        }
    }
    
    return $result;
}

/**
 * Parse IDRG procedures string ke array
 * Format sama dengan diagnoses
 */
private function parseIdrgProcedures(string $proceduresString): array
{
    return $this->parseIdrgDiagnoses($proceduresString);
}
```

## Database Schema Requirements

### Table: `pengajuan_klaim`

Pastikan tabel memiliki kolom:
```sql
ALTER TABLE pengajuan_klaim ADD COLUMN IF NOT EXISTS idrg TINYINT DEFAULT 0;
ALTER TABLE pengajuan_klaim ADD COLUMN IF NOT EXISTS idrg_diagnosa TEXT NULL;
ALTER TABLE pengajuan_klaim ADD COLUMN IF NOT EXISTS idrg_procedure TEXT NULL;
ALTER TABLE pengajuan_klaim ADD COLUMN IF NOT EXISTS idrg_response JSON NULL;
```

**Status IDRG:**
- `0` = Belum IDRG Grouping
- `1` = IDRG Grouping selesai (tidak digunakan di compare biaya)
- `2` = IDRG Final (di compare biaya langsung ke status ini)

## Controller Method yang Diperlukan

### CompareController.php

```php
<?php

namespace App\Http\Controllers\Biaya;

use App\Http\Controllers\Controller;
use App\Models\PengajuanKlaim;
use App\Models\DataGroupper;
use App\Services\InacbgService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompareController extends Controller
{
    public function index($kunjungan)
    {
        // Load data kunjungan, pasien, tagihan, dll
        // ...
        
        // Load pengajuan klaim jika ada
        $pengajuanKlaim = PengajuanKlaim::where('kunjungan', $kunjungan)->first();
        
        // Load data groupper jika ada dan IDRG sudah final (idrg = 2)
        $dataGroupper = null;
        if ($pengajuanKlaim && $pengajuanKlaim->idrg == 2) {
            $dataGroupper = DataGroupper::where('pengajuan_klaim_id', $pengajuanKlaim->id)
                ->first();
        }
        
        return Inertia::render('biaya/compare/index', [
            'kunjungan' => $kunjungan,
            'pengajuanKlaim' => $pengajuanKlaim,
            'dataGroupper' => $dataGroupper,
            // ... data lainnya
        ]);
    }
    
    public function idrgGroupingAndInacbg(Request $request, $id)
    {
        // Implementation seperti di atas
    }
}
```

## Testing Checklist

- [ ] Halaman compare biaya dapat diakses tanpa error
- [ ] Jika belum ada pengajuan klaim, tampil warning dan tombol buat pengajuan klaim
- [ ] Setelah buat pengajuan klaim (idrg = 0), tampil section IDRG dengan tombol "IDRG Grouping Diperlukan"
- [ ] Klik tombol IDRG membuka modal lock IDRG
- [ ] Klik "Lanjutkan" di modal lock membuka modal IDRG Grouping
- [ ] Dapat memilih diagnosis IDRG dari modal
- [ ] Dapat memilih procedure IDRG dari modal (opsional)
- [ ] Submit IDRG berhasil:
  - Data tersimpan di database
  - idrg berubah menjadi 2
  - INACBG Grouping otomatis terpanggil
  - Data groupper muncul di sidebar
- [ ] Data IDRG (diagnosis & procedure) tampil di section "Data IDRG"
- [ ] Data Groupper INACBG tampil dengan informasi CBG
- [ ] Dapat melanjutkan ke stage2/final seperti biasa

## Error Handling

### Possible Errors:

1. **IDRG Grouping Gagal**
   - Diagnosis tidak valid
   - Response: Error message, tetap di modal

2. **INACBG Grouping Gagal setelah IDRG**
   - Service INACBG error
   - Response: Rollback IDRG data, tampilkan error
   - User bisa retry

3. **Pengajuan Klaim Tidak Ditemukan**
   - ID tidak valid
   - Response: 404 error

## API Integration Notes

### INACBG Grouping Service

Pastikan service dapat menerima data:
```php
$inacbgService->performGrouping([
    'nomor_sep' => '...',
    'diagnoses' => ['A01', 'B02', 'B02', 'C03'],
    'procedures' => ['P01', 'P01', 'P01', 'P02'],
    'tanggal_masuk' => '2024-01-01',
    'tanggal_keluar' => '2024-01-05',
    'kelas_rawat' => '3',
    // ... data lain yang diperlukan
]);
```

## Migration File

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pengajuan_klaim', function (Blueprint $table) {
            if (!Schema::hasColumn('pengajuan_klaim', 'idrg')) {
                $table->tinyInteger('idrg')->default(0)->after('status_pengiriman');
            }
            if (!Schema::hasColumn('pengajuan_klaim', 'idrg_diagnosa')) {
                $table->text('idrg_diagnosa')->nullable()->after('idrg');
            }
            if (!Schema::hasColumn('pengajuan_klaim', 'idrg_procedure')) {
                $table->text('idrg_procedure')->nullable()->after('idrg_diagnosa');
            }
            if (!Schema::hasColumn('pengajuan_klaim', 'idrg_response')) {
                $table->json('idrg_response')->nullable()->after('idrg_procedure');
            }
        });
    }

    public function down()
    {
        Schema::table('pengajuan_klaim', function (Blueprint $table) {
            $table->dropColumn(['idrg', 'idrg_diagnosa', 'idrg_procedure', 'idrg_response']);
        });
    }
};
```

## Notes

1. **Perbedaan dengan E-Klaim:**
   - E-Klaim: IDRG manual (0→1→2) dengan tombol batalkan, final, edit
   - Compare Biaya: IDRG otomatis (0→2) langsung trigger INACBG grouping

2. **Keuntungan Pendekatan Ini:**
   - User experience lebih smooth
   - Tidak perlu multiple step manual
   - Satu kali submit langsung selesai

3. **Backend Responsibility:**
   - Validasi data IDRG
   - Parse format string ke array
   - Call INACBG service dengan data yang benar
   - Handle error dan rollback jika gagal
   - Return data groupper untuk ditampilkan

## Summary

Frontend sudah siap dengan alur:
1. Check pengajuan klaim → jika belum ada, tampilkan modal buat
2. Check IDRG status → jika 0, tampilkan modal IDRG
3. Submit IDRG → endpoint `/biaya/compare/{id}/idrg-grouping-and-inacbg`
4. Tampilkan hasil groupper setelah success

Backend perlu implementasi:
- Route dan controller method untuk IDRG + INACBG grouping
- Parser untuk format IDRG string
- Integration dengan INACBG service
- Proper error handling dan rollback
