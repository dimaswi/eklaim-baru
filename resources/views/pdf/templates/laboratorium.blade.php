<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hasil Laboratorium - {{ $pengajuanKlaim->nomor_sep }}</title>
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
        
        /* Lab Report Specific Styles - Table Based Layout */
        .lab-report { 
            width: 100%; 
            max-width: 180mm;
            padding: 15px;
            margin: 0 auto 20px auto; 
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
        .document-title-lab { font-size: 14px; font-weight: bold; background-color: #333; color: white; padding: 6px; margin-top: 8px; }
        
        .patient-info-table { width: 100%; margin-bottom: 15px; }
        .patient-left-cell, .patient-right-cell { width: 50%; vertical-align: top; padding: 0 8px; }
        .patient-details { width: 100%; }
        .patient-details td { padding: 2px 0; font-size: 10px; }
        .patient-details .label { width: 90px; font-weight: bold; }
        .patient-details .colon { width: 12px; text-align: center; }
        .patient-details .value { }
        
        .lab-table { width: 100%; border-collapse: collapse; margin-bottom: 0px; font-size: 10px; }
        .lab-table th, .lab-table td { border: 1px solid #333; padding: 4px; text-align: left; vertical-align: top; }
        .lab-table th { background-color: #e0e0e0; font-weight: bold; text-align: center; font-size: 10px; }
        .category-header { background-color: #f0f0f0; font-weight: bold; text-align: center; font-size: 11px; }
        .sub-header th { background-color: #e0e0e0; font-weight: bold; text-align: center; font-size: 10px; }
        .col-tindakan { width: 25%; }
        .col-parameter { width: 30%; }
        .col-hasil { width: 15%; text-align: center; }
        .col-normal { width: 20%; text-align: center; }
        .col-satuan { width: 10%; text-align: center; }
        
        .footer-table { width: 100%; margin-top: 20px; }
        .footer-left-cell, .footer-right-cell { width: 50%; text-align: center; vertical-align: top; font-size: 10px; }
        .petugas-lab, .doctor-title { font-weight: bold; margin-bottom: 4px; }
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
        {{-- Check if we have selected records for laboratorium --}}
        @if(!empty($selectedRecords['laboratorium'] ?? []))
            @foreach ($data as $item)
                {{-- Only include if record is specifically selected --}}
                @if (in_array((string)$item->id, $selectedRecords['laboratorium'] ?? []))
                    
                    {{-- Add page break before each record (except first) --}}
                    @if ($recordCount > 0)
                        <div class="page-break"></div>
                    @endif
                
                <div class="lab-report">
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
                        <div class="document-title-lab">LABORATORIUM</div>
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
                                        <td class="value">{{ isset($item->pasien_data['tanggal_lahir']) && $item->pasien_data['tanggal_lahir'] ? \Carbon\Carbon::parse($item->pasien_data['tanggal_lahir'])->format('d M Y') : '-' }}</td>
                                    </tr>
                                </table>
                            </td>
                            <td class="patient-right-cell">
                                <table class="patient-details">
                                    <tr>
                                        <td class="label">Alamat</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ $pengajuanKlaim->alamat ?? '-' }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tanggal Masuk</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ \Carbon\Carbon::parse($pengajuanKlaim->tanggal_masuk)->locale('id')->isoFormat('D MMMM Y HH:mm:ss') }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tanggal Keluar</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ $pengajuanKlaim->tanggal_keluar ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_keluar)->locale('id')->isoFormat('D MMMM Y HH:mm:ss'): '-' }}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Ruang/Penjab</td>
                                        <td class="colon">:</td>
                                        <td class="value">{{ $pengajuanKlaim->ruangan ?? 'IGD' }}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    @if (isset($item->tindakan_medis_data['hasil_laboratorium']) && is_array($item->tindakan_medis_data['hasil_laboratorium']) && count($item->tindakan_medis_data['hasil_laboratorium']) > 0)
                        @php
                            // Get the laboratorium test results from the correct structure
                            $hasilLabArray = $item->tindakan_medis_data['hasil_laboratorium'];
                            
                            // Group lab results by tindakan (test type)
                            $groupedByTindakan = [];
                            foreach ($hasilLabArray as $tindakan) {
                                // Coba berbagai kemungkinan nama tindakan
                                $namaTindakan = $tindakan['nama_tindakan']['NAMA'] ?? 
                                              $tindakan['namaTindakan'] ?? 
                                              $tindakan['NAMA'] ?? 
                                              'Unknown Test';
                                
                                if (!isset($groupedByTindakan[$namaTindakan])) {
                                    $groupedByTindakan[$namaTindakan] = [
                                        'nama_tindakan' => $namaTindakan,
                                        'tanggal' => $tindakan['TANGGAL'] ?? $tindakan['tanggal'] ?? '',
                                        'parameters' => []
                                    ];
                                }
                                
                                // Cek berbagai kemungkinan struktur parameter
                                $parametersFound = false;
                                
                                // Kemungkinan 1: hasil_laboratorium array
                                if (isset($tindakan['hasil_laboratorium']) && is_array($tindakan['hasil_laboratorium'])) {
                                    foreach ($tindakan['hasil_laboratorium'] as $parameter) {
                                        if (!empty($parameter) && is_array($parameter)) {
                                            $groupedByTindakan[$namaTindakan]['parameters'][] = [
                                                'parameter' => $parameter['parameter_tindakan_lab']['PARAMETER'] ?? $parameter['PARAMETER'] ?? '-',
                                                'hasil' => $parameter['HASIL'] ?? $parameter['hasil'] ?? '-',
                                                'nilai_normal' => $parameter['NILAI_NORMAL'] ?? $parameter['parameter_tindakan_lab']['NILAI_RUJUKAN'] ?? $parameter['nilai_normal'] ?? '-',
                                                'satuan' => $parameter['SATUAN'] ?? $parameter['satuan'] ?? $parameter['parameter_tindakan_lab']['SATUAN'] ?? '-'
                                            ];
                                            $parametersFound = true;
                                        }
                                    }
                                }
                                
                                // Kemungkinan 2: parameters array langsung
                                if (!$parametersFound && isset($tindakan['parameters']) && is_array($tindakan['parameters'])) {
                                    foreach ($tindakan['parameters'] as $parameter) {
                                        if (!empty($parameter) && is_array($parameter)) {
                                            $groupedByTindakan[$namaTindakan]['parameters'][] = [
                                                'parameter' => $parameter['PARAMETER'] ?? $parameter['parameter'] ?? '-',
                                                'hasil' => $parameter['HASIL'] ?? $parameter['hasil'] ?? '-',
                                                'nilai_normal' => $parameter['NILAI_RUJUKAN'] ?? $parameter['nilai_normal'] ?? '-',
                                                'satuan' => $parameter['SATUAN'] ?? $parameter['satuan'] ?? '-'
                                            ];
                                            $parametersFound = true;
                                        }
                                    }
                                }
                                
                                // Kemungkinan 3: data langsung di level tindakan (untuk data fiktif atau single parameter)
                                if (!$parametersFound) {
                                    // Untuk data yang memiliki hasil langsung di level tindakan
                                    if (isset($tindakan['hasil_edited']) || isset($tindakan['HASIL'])) {
                                        $groupedByTindakan[$namaTindakan]['parameters'][] = [
                                            'parameter' => $namaTindakan,
                                            'hasil' => $tindakan['hasil_edited'] ?? $tindakan['HASIL'] ?? '-',
                                            'nilai_normal' => $tindakan['nilai_normal'] ?? $tindakan['NILAI_NORMAL'] ?? '-',
                                            'satuan' => $tindakan['satuan'] ?? $tindakan['SATUAN'] ?? '-'
                                        ];
                                        $parametersFound = true;
                                    }
                                    // Untuk tindakan yang merupakan parameter tunggal
                                    elseif (isset($tindakan['ID']) || isset($tindakan['id'])) {
                                        $groupedByTindakan[$namaTindakan]['parameters'][] = [
                                            'parameter' => $namaTindakan,
                                            'hasil' => '-', // Akan diisi nanti
                                            'nilai_normal' => '-',
                                            'satuan' => '-'
                                        ];
                                        $parametersFound = true;
                                    }
                                }
                            }
                        @endphp
                        
                        <table class="lab-table">
                            <thead>
                                <tr>
                                    <th class="col-tindakan">
                                        Tindakan
                                    </th>
                                    <th class="col-parameter">Parameter</th>
                                    <th class="col-hasil">Hasil</th>
                                    <th class="col-normal">Nilai Normal</th>
                                    <th class="col-satuan">Satuan</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($groupedByTindakan as $testName => $testData)
                                    @if (count($testData['parameters']) > 0)
                                        @foreach ($testData['parameters'] as $index => $param)
                                            {{-- Skip empty parameter arrays --}}
                                            @if (!empty($param) && is_array($param) && isset($param['parameter']))
                                                <tr>
                                                    @if ($index === 0)
                                                        <td rowspan="{{ count(array_filter($testData['parameters'], function($p) { return !empty($p) && is_array($p) && isset($p['parameter']); })) }}" style="vertical-align: top; font-weight: bold;">{{ $testName }}</td>
                                                    @endif
                                                    <td>{{ $param['parameter'] }}</td>
                                                    <td style="text-align: center;">{{ $param['hasil'] }}</td>
                                                    <td style="text-align: center;">{{ $param['nilai_normal'] }}</td>
                                                    <td style="text-align: center;">{{ $param['satuan'] }}</td>
                                                </tr>
                                            @endif
                                        @endforeach
                                    @else
                                        <tr>
                                            <td style="font-weight: bold;">{{ $testName }}</td>
                                            <td colspan="4" style="text-align: center; color: #999;">
                                                No parameters available
                                            </td>
                                        </tr>
                                    @endif
                                @endforeach
                            </tbody>
                        </table>
                    @else
                        <table class="lab-table">
                            <thead>
                                <tr>
                                    <th class="col-tindakan">
                                        Tindakan
                                    </th>
                                    <th class="col-parameter">Parameter</th>
                                    <th class="col-hasil">Hasil</th>
                                    <th class="col-normal">Nilai Normal</th>
                                    <th class="col-satuan">Satuan</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="5" class="no-data">
                                        Data laboratorium tidak tersedia untuk record ID: {{ $item->id }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    @endif
                    
                    <table class="footer-table">
                        <tr>
                            <td class="footer-left-cell">
                                <div class="petugas-lab">Petugas</div>
                                @php
                                    $petugasNama = $item->tindakan_medis_data['petugas_medis_nama'] ?? $item->tindakan_medis_data['dokter_pengirim'] ?? '-';
                                    $petugasNIP = $item->tindakan_medis_data['petugas_medis_id'] ?? '';
                                    $petugasQR = null;
                                    
                                    if ($petugasNama !== '-' && !empty($petugasNIP)) {
                                        try {
                                            if (class_exists('\App\Helpers\QRCodeHelper')) {
                                                $petugasQR = \App\Helpers\QRCodeHelper::generateForStaff($item->tindakan_medis_data['petugas_medis_nama'] ?? $item->tindakan_medis_data['dokter_pengirim'], 'Petugas Laboratorium');
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
                                <div class="date-location">BOJONEGORO, {{ \Carbon\Carbon::parse($pengajuanKlaim->tanggal_keluar ?? '-')->locale('id')->isoFormat('D MMMM Y') }}</div>
                                <div class="doctor-title">Konsulen</div>
                                
                                @php
                                    $dokterNama = $item->tindakan_medis_data['dokter_penanggung_jawab_nama'] ?? $item->tindakan_medis_data['dokter_penanggung_jawab'] ?? '-';
                                    $dokterNIP = $item->tindakan_medis_data['dokter_penanggung_jawab_id'] ?? '';
                                    $dokterQR = null;
                                    
                                    if ($dokterNama !== '-' && !empty($dokterNIP)) {
                                        try {
                                            if (class_exists('\App\Helpers\QRCodeHelper')) {
                                                $dokterQR = \App\Helpers\QRCodeHelper::generateForStaff($item->tindakan_medis_data['dokter_penanggung_jawab_nama'] ?? $item->tindakan_medis_data['dokter_penanggung_jawab'], 'Dokter Laboratorium');
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
            @if(empty($selectedRecords['laboratorium'] ?? []))
                Tidak ada record laboratorium yang dipilih.
                <br><small>Debug: Tidak ada record yang dipilih dalam selectedRecords</small>
            @else
                Tidak ditemukan data untuk record yang dipilih.
                <br><small>Debug: Selected IDs = {{ implode(',', $selectedRecords['laboratorium'] ?? []) }}</small>
                <br><small>Available IDs = {{ $data ? $data->pluck('id')->implode(',') : 'no data' }}</small>
            @endif
        </div>
    @endif
</body>
</html>
</body>
</html>
