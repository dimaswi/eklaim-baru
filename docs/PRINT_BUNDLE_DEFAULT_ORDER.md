# Print Bundle Default Order Feature

## Overview
Fitur ini memungkinkan pengguna untuk mengatur urutan default dokumen pada Print Bundle system, sehingga setiap kali membuka halaman print bundle, dokumen akan otomatis terseleksi dan tersusun sesuai pengaturan yang sudah disimpan.

## Features

### 1. Default Order Configuration
- **Urutan Default**: Setiap jenis dokumen memiliki urutan default yang bisa diatur
- **Auto Selection**: Dokumen tertentu bisa diatur untuk otomatis terseleksi
- **Persistent Settings**: Pengaturan disimpan dan berlaku untuk sesi berikutnya

### 2. User Interface

#### Settings Panel
- **Toggle Button**: Tombol "Configure Defaults" untuk membuka/menutup panel pengaturan
- **Quick Actions**: Tombol untuk save, load, dan reset default settings
- **Visual Feedback**: Loading indicators saat proses save/load

#### Quick Actions in Bundle Section
- **Apply Default Order**: Menerapkan urutan default yang sudah disimpan
- **Save as Default**: Menyimpan urutan dan seleksi saat ini sebagai default
- **Clear All Selection**: Membersihkan semua seleksi
- **Generate Bundle**: Generate PDF bundle sesuai urutan

### 3. Default Document Order (System)

```php
// Urutan default sistem:
1. SEP (Surat Elegibilitas Peserta) - Auto Selected
2. Berkas Klaim (jika status >= 4) - Auto Selected  
3. Hasil Laboratorium - Auto Selected (jika ada data)
4. Hasil Radiologi - Auto Selected (jika ada data)
5. Resume Medis - Auto Selected (jika ada data)
6. CPPT Rawat Inap - Not Selected
7. Pengkajian Awal Keperawatan - Not Selected
8. Triage UGD - Not Selected
9. Balance Cairan Rawat Inap - Not Selected
10. Tagihan - Not Selected
```

## Technical Implementation

### Backend (Controller)

#### New Methods Added:
1. `getDefaultOrder()` - GET endpoint untuk mengambil pengaturan default
2. `updateDefaultOrder()` - POST endpoint untuk menyimpan pengaturan
3. `getDefaultDocumentOrder()` - Helper untuk format urutan default
4. `saveDefaultDocumentOrder()` - Menyimpan ke session/database
5. `loadSavedDefaultOrder()` - Load pengaturan yang tersimpan
6. `applyCustomDefaultOrder()` - Terapkan custom order ke medical records

#### Database Schema (Optional)
```sql
-- Optional table untuk persistent storage
CREATE TABLE print_bundle_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pengajuan_klaim_id BIGINT NOT NULL,
    document_order JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pengajuan_klaim (pengajuan_klaim_id)
);
```

### Frontend (React/TypeScript)

#### New State Variables:
```typescript
const [showSettings, setShowSettings] = useState(false);
const [isLoadingSettings, setIsLoadingSettings] = useState(false);
const [isSavingSettings, setIsSavingSettings] = useState(false);
```

#### New Functions:
1. `loadDefaultSettings()` - Load saved settings dari backend
2. `saveDefaultSettings()` - Save current settings ke backend
3. `resetToDefaults()` - Reset ke system defaults

### Routes Added:
```php
// Get default order settings
Route::get('/eklaim/print-bundle/{pengajuan}/default-order', 
    [PrintBundleController::class, 'getDefaultOrder'])
    ->name('eklaim.print-bundle.default-order.get');

// Save default order settings  
Route::post('/eklaim/print-bundle/{pengajuan}/default-order', 
    [PrintBundleController::class, 'updateDefaultOrder'])
    ->name('eklaim.print-bundle.default-order.update');
```

## Usage Guide

### For Users:

1. **Mengatur Default Order**:
   - Buka halaman Print Bundle
   - Klik tombol "Configure Defaults" 
   - Atur seleksi dan urutan dokumen sesuai keinginan
   - Klik "Save Current as Default"

2. **Menggunakan Default Order**:
   - Halaman akan otomatis load dengan default settings
   - Gunakan "Apply Default Order" untuk reset ke default yang tersimpan
   - Gunakan "Save as Default" untuk update default dengan seleksi saat ini

3. **Reset ke System Default**:
   - Klik "Reset to System Defaults" di Settings Panel
   - Atau klik "Reset to System Defaults" di quick actions

### For Developers:

#### Adding New Document Types:
```php
// In getAllMedicalRecords() method
'new_document_type' => [
    'title' => 'Document Title',
    'icon' => '📄',
    'type' => 'single',
    'data' => $data,
    'count' => $count,
    'available' => $available,
    'priority' => 6,
    'default_order' => 11, // Next available order
    'is_default_selected' => false, // Auto-select or not
],
```

#### Customizing Default Behavior:
```php
// Modify default selection logic
private function getSystemDefaults($medicalRecords) {
    // Custom logic for different scenarios
    if ($scenario === 'rawat_inap') {
        return $this->getRawatInapDefaults($medicalRecords);
    }
    // ... etc
}
```

## Benefits

1. **User Experience**: Pengguna tidak perlu mengatur ulang setiap kali
2. **Efficiency**: Dokumen penting otomatis terseleksi
3. **Consistency**: Urutan yang konsisten untuk semua bundel
4. **Flexibility**: Bisa disesuaikan per kebutuhan pengguna
5. **Persistence**: Settings tersimpan untuk sesi berikutnya

## Future Enhancements

1. **Global Settings**: Default settings berlaku untuk semua pengajuan
2. **Role-based Defaults**: Default berbeda berdasarkan role user
3. **Template System**: Multiple saved templates untuk different scenarios
4. **Bulk Settings**: Terapkan settings ke multiple pengajuan sekaligus
5. **Export/Import**: Export/import default settings