<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hasil Radiologi - {{ $pengajuanKlaim->nomor_sep }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { 
            size: A4; 
            margin: 15mm; 
        }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 11px; 
            line-height: 1.3; 
            color: #333; 
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: 210mm;
        }
        .page-break { page-break-before: always; }
        
        /* Radiologi Report Specific Styles */
        .radio-report { 
            width: 100%; 
            max-width: 180mm;
            padding: 15px;
            margin: 20px auto 20px auto; 
            border: 1px solid #000;
            box-sizing: border-box;
        }
        
        .header-section { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 12px; }
        .hospital-header-table { width: 100%; margin-bottom: 10px; }
        .logo-cell { width: 70px; text-align: center; vertical-align: middle; }
        .logo-image { width: 50px; height: 50px; }
        .logo-placeholder { width: 50px; height: 50px; border: 2px solid #333; text-align: center; line-height: 46px; font-size: 9px; margin: 0 auto; }
        .hospital-info-cell { text-align: left; vertical-align: middle; padding-left: 12px; }
        .hospital-name { font-size: 13px; font-weight: bold; color: #333; margin-bottom: 3px; }
        .hospital-address { font-size: 10px; color: #666; margin-bottom: 2px; }
        .hospital-contact { font-size: 9px; color: #666; }
        .document-title-radio { font-size: 14px; font-weight: bold; background-color: #333; color: white; padding: 6px; margin-top: 8px; }
        
        .patient-info-table { width: 100%; margin-bottom: 15px; }
        .patient-left-cell, .patient-right-cell { width: 50%; vertical-align: top; padding: 0 8px; }
        .patient-details { width: 100%; }
        .patient-details td { padding: 2px 0; font-size: 10px; }
        .patient-details .label { width: 90px; font-weight: bold; }
        .patient-details .colon { width: 12px; text-align: center; }
        .patient-details .value { }
        
        .result-section { margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; }
        .result-section h4 { font-size: 11px; font-weight: bold; margin-bottom: 8px; }
        .result-content { font-size: 10px; line-height: 1.4; margin-bottom: 5px; }
        
        .footer-table { width: 100%; margin-top: 20px; }
        .footer-left-cell, .footer-right-cell { width: 50%; text-align: center; vertical-align: top; font-size: 10px; }
        .petugas-radio, .doctor-title { font-weight: bold; margin-bottom: 4px; }
        .qr-placeholder { border: 1px solid #ccc; height: 50px; margin: 8px auto; width: 50px; text-align: center; line-height: 48px; background-color: #f9f9f9; font-size: 9px; }
        .petugas-name, .doctor-name { font-weight: bold; margin-top: 4px; }
        .date-location { font-weight: bold; margin-bottom: 8px; }
        
        .fiktif-watermark { position: fixed; top: 50%; left: 50%; width: 100%; text-align: center; font-size: 72px; font-weight: bold; color: rgba(255, 0, 0, 0.1); z-index: -1; transform: rotate(-45deg); }
        .no-data { text-align: center; padding: 40px; color: #666; }
        .fiktif-indicator { color: #e74c3c; font-weight: bold; background-color: #ffeaea; padding: 2px 5px; border-radius: 3px; font-size: 9px; }
    </style>
</head>
<body>
    @php
        $recordCount = 0;
    @endphp
    
    @if($data && $data->count() > 0)
        {{-- Check if we have selected records for radiologi --}}
        @if(!empty($selectedRecords['radiologi'] ?? []))
            @foreach ($data as $item)
                {{-- Only include if record is specifically selected --}}
                @if (in_array((string)$item->id, $selectedRecords['radiologi'] ?? []))
                    
                    {{-- Add page break before each record (except first) --}}
                    @if ($recordCount > 0)
                        <div class="page-break"></div>
                    @endif
                
                <div class="radio-report">
                    <div class="header-section">
                        <table class="hospital-header-table">
                            <tr>
                                <td class="logo-cell">
                                    @if($logoBase64)
                                        <img src="{{ $logoBase64 }}" class="logo-image" alt="Logo">
                                    @else
                                        <div class="logo-placeholder">[LOGO]</div>
                                    @endif
                                </td>
                                <td class="hospital-info-cell">
                                    <div class="hospital-name">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</div>
                                    <div class="hospital-address">Jl. PUK Desa Drokilo, Kec. Kedungadem Kab. Bojonegoro</div>
                                    <div class="hospital-contact">Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646</div>
                                </td>
                            </tr>
                        </table>
                        <div class="document-title-radio">RADIOLOGI</div>
                    </div>
                    
                    <table class="patient-info-table">
                        <tr>
                            <td class="patient-left-cell">
                                <table class="patient-details">
                                    <tr>
                                        <td class="label">Nama</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ $pengajuanKlaim->nama_pasien }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">No. RM</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ $pengajuanKlaim->norm }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Jenis Kelamin</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ isset($item->pasien_data['jenis_kelamin']) && $item->pasien_data['jenis_kelamin'] == 1 ? 'Laki-laki' : 'Perempuan' }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tanggal Lahir</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ isset($item->pasien_data['tanggal_lahir']) && $item->pasien_data['tanggal_lahir'] ? \Carbon\Carbon::parse($item->pasien_data['tanggal_lahir'])->format('d M Y') : '07 Jun 1972' }}</td>
                                    </tr>
                                </table>
                            </td>
                            <td class="patient-right-cell">
                                <table class="patient-details">
                                    <tr>
                                        <td class="label">Alamat</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ $pengajuanKlaim->alamat ?? 'DUSUN KALIKUNCI' }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tanggal Masuk</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ \Carbon\Carbon::parse($pengajuanKlaim->tanggal_masuk)->format('d M Y H:i:s') }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tanggal Keluar</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ $pengajuanKlaim->tanggal_keluar ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_keluar)->format('d M Y H:i:s') : '31 Agustus 2025 16:41:12' }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tindakan</td>
                                        <td class="colon">:</td>
                                        <td class="value">
                                            @php
                                                $namaTindakanDisplay = 'THORAX PA'; // default
                                                
                                                // Try to get from tindakan_medis_data first
                                                if (isset($item->tindakan_medis_data['hasil_radiologi']) && is_array($item->tindakan_medis_data['hasil_radiologi'])) {
                                                    // Get the first available name from any record
                                                    foreach ($item->tindakan_medis_data['hasil_radiologi'] as $radioItem) {
                                                        if (isset($radioItem['nama_tindakan']['NAMA']) && !empty($radioItem['nama_tindakan']['NAMA'])) {
                                                            $namaTindakanDisplay = $radioItem['nama_tindakan']['NAMA'];
                                                            break;
                                                        } elseif (isset($radioItem['namaTindakan']) && !empty($radioItem['namaTindakan'])) {
                                                            $namaTindakanDisplay = $radioItem['namaTindakan'];
                                                            break;
                                                        }
                                                    }
                                                }
                                                // Fallback to nama_tindakan field if not found above
                                                elseif (isset($item->nama_tindakan)) {
                                                    if (is_string($item->nama_tindakan)) {
                                                        try {
                                                            $decoded = json_decode($item->nama_tindakan, true);
                                                            $namaTindakanDisplay = $decoded['NAMA'] ?? $item->nama_tindakan;
                                                        } catch (Exception $e) {
                                                            $namaTindakanDisplay = $item->nama_tindakan;
                                                        }
                                                    } else {
                                                        $namaTindakanDisplay = $item->nama_tindakan;
                                                    }
                                                }
                                            @endphp
                                            {{ $namaTindakanDisplay }}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    @if (isset($item->tindakan_medis_data['hasil_radiologi']) && is_array($item->tindakan_medis_data['hasil_radiologi']) && count($item->tindakan_medis_data['hasil_radiologi']) > 0)
                        @php
                            // Get the radiologi examination results from the correct structure
                            $hasilRadioArray = $item->tindakan_medis_data['hasil_radiologi'];
                        @endphp
                        
                        @foreach ($hasilRadioArray as $radioData)
                            @php
                                // Get the actual hasil_radiologi data from nested structure with better handling
                                $hasilRadio = null;
                                $namaTindakan = $radioData['nama_tindakan']['NAMA'] ?? $radioData['namaTindakan'] ?? '-';
                                
                                // Try different ways to access the data
                                if (isset($radioData['hasil_radiologi']) && is_array($radioData['hasil_radiologi'])) {
                                    // Try to find the first non-empty result
                                    foreach ($radioData['hasil_radiologi'] as $hasil) {
                                        if (!empty($hasil) && is_array($hasil)) {
                                            $hasilRadio = $hasil;
                                            break;
                                        }
                                    }
                                }
                                
                                // If no nested hasil_radiologi found, check if data is directly in radioData
                                if (!$hasilRadio) {
                                    // Check if the main data has the fields directly
                                    if (isset($radioData['klinis']) || isset($radioData['KLINIS']) || 
                                        isset($radioData['hasil']) || isset($radioData['HASIL']) ||
                                        isset($radioData['hasil_edited'])) {
                                        $hasilRadio = $radioData;
                                    }
                                }
                            @endphp
                            
                            <div class="result-section">
                                <h4>
                                    {{ $loop->iteration }}. KLINIS
                                    {{-- @if($item->is_fiktif ?? false)
                                        <span class="fiktif-indicator">FIKTIF</span>
                                    @endif --}}
                                </h4>
                                
                                <div class="result-content">
                                    {{ $hasilRadio['KLINIS'] ?? $hasilRadio['klinis'] ?? $radioData['KLINIS'] ?? $radioData['klinis'] ?? '-' }}
                                </div>
                                
                                <div class="result-content">
                                    <strong>2. HASIL PEMERIKSAAN</strong><br>
                                    {{ $hasilRadio['HASIL'] ?? $hasilRadio['hasil'] ?? $radioData['HASIL'] ?? $radioData['hasil'] ?? $radioData['hasil_edited'] ?? '-' }}
                                </div>
                                
                                <div class="result-content">
                                    <strong>3. KESAN PEMERIKSAAN</strong><br>
                                    {{ $hasilRadio['KESAN'] ?? $hasilRadio['kesan'] ?? $radioData['KESAN'] ?? $radioData['kesan'] ?? '-' }}
                                </div>
                                
                                <div class="result-content">
                                    <strong>4. USUL PEMERIKSAAN</strong><br>
                                    {{ $hasilRadio['USUL'] ?? $hasilRadio['usul'] ?? $radioData['USUL'] ?? $radioData['usul'] ?? '-' }}
                                </div>
                            </div>
                        @endforeach
                    @else
                        <div class="result-section">
                            <h4>1. KLINIS</h4>
                            <div class="result-content">{{ $item->klinis ?? '-' }}</div>
                            
                            <div class="result-content">
                                <strong>2. HASIL PEMERIKSAAN</strong><br>
                                {{ $item->hasil ?? '-' }}
                            </div>
                            
                            <div class="result-content">
                                <strong>3. KESAN PEMERIKSAAN</strong><br>
                                {{ $item->kesan ?? '-' }}
                            </div>
                            
                            <div class="result-content">
                                <strong>4. USUL PEMERIKSAAN</strong><br>
                                {{ $item->usul ?? '-' }}
                            </div>
                        </div>
                    @endif
                    
                    <table class="footer-table">
                        <tr>
                            <td class="footer-left-cell">
                                <div class="petugas-radio">Petugas</div>
                                @php
                                    $petugasNama = $item->tindakan_medis_data['petugas_medis_nama'] ?? $item->tindakan_medis_data['petugas_radiologi'] ?? 'Suyoto';
                                    $petugasNIP = $item->tindakan_medis_data['petugas_medis_id'] ?? '';
                                    $petugasQR = null;
                                    
                                    if ($petugasNama !== '-' && !empty($petugasNIP)) {
                                        try {
                                            if (class_exists('\App\Helpers\QRCodeHelper')) {
                                                $petugasQR = \App\Helpers\QRCodeHelper::generateForStaff($item->tindakan_medis_data['petugas_medis_nama'] ?? $item->tindakan_medis_data['petugas_radiologi'], 'Petugas Radiologi');
                                            }
                                        } catch (\Exception $e) {
                                            // Log error dan lanjutkan tanpa QR
                                            error_log('QR Code generation failed: ' . $e->getMessage());
                                            $petugasQR = null;
                                        }
                                    }
                                @endphp
                                
                                @if($petugasQR)
                                    <div style="margin: 8px auto; width: 50px; height: 50px;">
                                        <img src="{{ $petugasQR }}" style="width: 50px; height: 50px;" alt="QR Code Petugas">
                                    </div>
                                @else
                                    <div class="qr-placeholder">[QR Code]</div>
                                @endif
                                
                                <div class="petugas-name">{{ $petugasNama }}</div>
                            </td>
                            <td class="footer-right-cell">
                                <div class="date-location">BOJONEGORO, {{ \Carbon\Carbon::parse($pengajuanKlaim->tanggal_keluar ?? '-')->format('d F Y') }}</div>
                                <div class="doctor-title">Konsulen</div>
                                
                                @php
                                    $dokterNama = $item->tindakan_medis_data['dokter_penanggung_jawab_nama'] ?? $item->tindakan_medis_data['dokter_radiologi'] ?? 'dr. Eko Ardianto Marjono, Sp. Rad';
                                    $dokterNIP = $item->tindakan_medis_data['dokter_penanggung_jawab_id'] ?? '';
                                    $dokterQR = null;
                                    
                                    if ($dokterNama !== '-' && !empty($dokterNIP)) {
                                        try {
                                            if (class_exists('\App\Helpers\QRCodeHelper')) {
                                                $dokterQR = \App\Helpers\QRCodeHelper::generateForStaff($item->tindakan_medis_data['dokter_penanggung_jawab_nama'] ?? $item->tindakan_medis_data['dokter_radiologi'], 'Dokter Radiologi');
                                            }
                                        } catch (\Exception $e) {
                                            // Log error dan lanjutkan tanpa QR
                                            error_log('QR Code generation failed: ' . $e->getMessage());
                                            $dokterQR = null;
                                        }
                                    }
                                @endphp
                                
                                @if($dokterQR)
                                    <div style="margin: 8px auto; width: 50px; height: 50px;">
                                        <img src="{{ $dokterQR }}" style="width: 50px; height: 50px;" alt="QR Code Dokter">
                                    </div>
                                @else
                                    <div class="qr-placeholder">[QR Code]</div>
                                @endif
                                
                                <div class="doctor-name">{{ $dokterNama }}</div>
                            </td>
                        </tr>
                    </table>

                    {{-- @if ($item->is_fiktif ?? false)
                        <div class="fiktif-watermark">DATA FIKTIF</div>
                    @endif --}}
                </div>
                
                    @php
                        $recordCount++;
                    @endphp
                @endif
            @endforeach
        @endif
    @endif
    
    @if ($recordCount === 0)
        <div class="no-data">
            @if(empty($selectedRecords['radiologi'] ?? []))
                Tidak ada record radiologi yang dipilih.
                <br><small>Debug: Tidak ada record yang dipilih dalam selectedRecords</small>
            @else
                Tidak ditemukan data untuk record yang dipilih.
                <br><small>Debug: Selected IDs = {{ implode(',', $selectedRecords['radiologi'] ?? []) }}</small>
                <br><small>Available IDs = {{ $data ? $data->pluck('id')->implode(',') : 'no data' }}</small>
            @endif
        </div>
    @endif
</body>
</html>
