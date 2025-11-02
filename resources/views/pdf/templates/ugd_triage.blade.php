<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Triage UGD - {{ $pengajuanKlaim->nomor_sep }}</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.2;
            color: #333;
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: 210mm;
        }

        /* Triage Report Specific Styles */
        .triage-report {
            width: 100%;
            max-width: 190mm;
            padding: 10px;
            margin: 0 auto;
            box-sizing: border-box;
        }

        .header-section {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
        }

        .hospital-header-table {
            width: 100%;
            margin-bottom: 10px;
        }

        .logo-cell {
            width: 70px;
            text-align: center;
            vertical-align: middle;
        }

        .logo-image {
            width: 50px;
            height: 50px;
        }

        .logo-placeholder {
            width: 50px;
            height: 50px;
            border: 2px solid #333;
            text-align: center;
            line-height: 46px;
            font-size: 9px;
            margin: 0 auto;
        }

        .hospital-info-cell {
            text-align: left;
            vertical-align: middle;
            padding-left: 12px;
        }

        .hospital-name {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
        }

        .hospital-address {
            font-size: 10px;
            color: #666;
            margin-bottom: 2px;
        }

        .hospital-contact {
            font-size: 9px;
            color: #666;
        }

        .document-title {
            font-size: 14px;
            font-weight: bold;
            background-color: #e74c3c;
            color: white;
            padding: 6px;
            margin-top: 8px;
        }

        .patient-info-table {
            width: 100%;
            margin-bottom: 15px;
            border: 2px solid #000;
            background-color: #f9f9f9;
        }

        .patient-left-cell,
        .patient-right-cell {
            width: 50%;
            vertical-align: top;
            padding: 10px;
            border: 1px solid #ccc;
        }

        .patient-details {
            width: 100%;
        }

        .patient-details td {
            padding: 2px 0;
            font-size: 10px;
        }

        .patient-details .label {
            width: 90px;
            font-weight: bold;
        }

        .patient-details .colon {
            width: 12px;
            text-align: center;
        }

        .section {
            margin-bottom: 10px;
            border: 1px solid #ccc;
            padding: 8px;
            background-color: #fafafa;
        }

        .section h4 {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 6px;
            color: #333;
            background-color: #e8e8e8;
            padding: 3px 6px;
            margin: -8px -8px 6px -8px;
        }

        .section-content {
            font-size: 9px;
            line-height: 1.3;
        }

        /* Tables */
        .data-table,
        .form-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            border: 1px solid #000;
        }

        .data-table th,
        .data-table td,
        .form-table th,
        .form-table td {
            border: 1px solid #000;
            padding: 4px 3px;
            font-size: 9px;
            text-align: left;
        }

        .data-table th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
        }

        .form-table .info-label {
            font-weight: bold;
            width: 120px;
            background-color: #f5f5f5;
        }

        .form-table .info-value {
            padding-left: 8px;
        }

        /* Vital Signs Table */
        .vital-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            border: 1px solid #000;
        }

        .vital-table th,
        .vital-table td {
            border: 1px solid #000;
            padding: 3px;
            font-size: 8px;
            text-align: center;
        }

        .vital-table th {
            background-color: #e0e0e0;
            font-weight: bold;
        }

        /* Triage Level Colors */
        .triage-resusitasi {
            background-color: #000 !important;
            color: white;
        }

        .triage-emergency {
            background-color: #e74c3c !important;
            color: white;
        }

        .triage-urgent {
            background-color: #f39c12 !important;
            color: white;
        }

        .triage-less-urgent {
            background-color: #27ae60 !important;
            color: white;
        }

        .triage-non-urgent {
            background-color: #3498db !important;
            color: white;
        }

        .triage-doa {
            background-color: #95a5a6 !important;
            color: white;
        }

        .footer-table {
            width: 100%;
            margin-top: 10px;
            border-collapse: collapse;
        }

        .footer-left-cell,
        .footer-right-cell {
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 9px;
            padding: 8px;
        }

        .doctor-title {
            font-weight: bold;
        }

        .doctor-name {
            font-weight: bold;
            margin-top: 8px;
        }

        .qr-placeholder {
            border: 1px solid #ccc;
            height: 40px;
            margin: 6px auto;
            width: 40px;
            text-align: center;
            line-height: 38px;
            background-color: #f9f9f9;
            font-size: 8px;
        }

        .date-location {
            font-weight: bold;
        }

        .fiktif-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 100%;
            text-align: center;
            font-size: 72px;
            font-weight: bold;
            color: rgba(255, 0, 0, 0.1);
            z-index: -1;
            transform: rotate(-45deg);
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        .fiktif-indicator {
            color: #e74c3c;
            font-weight: bold;
            background-color: #ffeaea;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 9px;
        }

        .triage-level-box {
            text-align: center;
            padding: 4px;
            margin: 2px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 9px;
        }
    </style>
</head>

<body>
    @if ($data && $data->count() > 0)
        @php
            $triageData = $data->first(); // Single record for triage
        @endphp
        
        <div class="triage-report">
            {{-- Header Section --}}
            <div class="header-section">
                <table class="hospital-header-table">
                    <tr>
                        <td class="logo-cell">
                            @if ($logoBase64)
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
                <div class="document-title">
                    FORMULIR TRIAGE - UNIT GAWAT DARURAT
                </div>
            </div>

            {{-- Patient Information --}}
            <table class="patient-info-table">
                <tr>
                    <td class="patient-left-cell">
                        <table class="patient-details">
                            <tr>
                                <td class="label">Nama Pasien</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $triageData->nama ?? $pengajuanKlaim->nama_peserta }}</td>
                            </tr>
                            <tr>
                                <td class="label">Nomor RM</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $triageData->norm ?? $pengajuanKlaim->nomor_kartu }}</td>
                            </tr>
                            <tr>
                                <td class="label">Tanggal Lahir</td>
                                <td class="colon">:</td>
                                <td class="value">
                                    {{ $triageData->tanggal_lahir ? \Carbon\Carbon::parse($triageData->tanggal_lahir)->locale('id')->isoFormat('D MMMM Y') : ($pengajuanKlaim->tanggal_lahir ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_lahir)->locale('id')->isoFormat('D MMMM Y') : '-') }}
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Jenis Kelamin</td>
                                <td class="colon">:</td>
                                <td class="value">
                                    {{ $triageData->jenis_kelamin ?? ($pengajuanKlaim->jenis_kelamin == 'L' ? 'Laki-laki' : ($pengajuanKlaim->jenis_kelamin == 'P' ? 'Perempuan' : '-')) }}
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td class="patient-right-cell">
                        <table class="patient-details">
                            <tr>
                                <td class="label">No. Kunjungan</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $triageData->kunjungan_nomor ?? $triageData->nomor_kunjungan ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="label">Tanggal Masuk</td>
                                <td class="colon">:</td>
                                <td class="value">
                                    {{ $pengajuanKlaim->tanggal_sep ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_sep)->locale('id')->isoFormat('D MMMM Y HH:mm:ss') : '-' }}
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Ruangan</td>
                                <td class="colon">:</td>
                                <td class="value">Unit Gawat Darurat</td>
                            </tr>
                            <tr>
                                <td class="label">Dokter</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $triageData->dokter ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="label">Petugas</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $triageData->petugas ?? '-' }}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            {{-- Cara Kedatangan Section --}}
            <div class="section">
                <h4>A. CARA KEDATANGAN</h4>
                <div class="section-content">
                    <table class="form-table">
                        <tr>
                            <td class="info-label">Cara Datang</td>
                            <td class="info-value">
                                {{ ($triageData->kedatangan_datang_sendiri ?? false) ? '[✓]' : '[ ]' }} Datang Sendiri<br>
                                <strong>Pengantar:</strong> {{ $triageData->kedatangan_pengantar ?? '-' }}<br>
                                <strong>Alat Transportasi:</strong> {{ $triageData->kedatangan_alat_transportasi ?? '-' }}
                            </td>
                        </tr>
                        <tr>
                            <td class="info-label">Rujukan</td>
                            <td class="info-value">
                                <strong>Rujukan Dari:</strong> {{ $triageData->kedatangan_asal_rujukan ?? '-' }}<br>
                                {{ ($triageData->kedatangan_polisi ?? false) ? '[✓]' : '[ ]' }} Rujukan Dari Polisi
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            {{-- Jenis Kasus Section --}}
            <div class="section">
                <h4>B. JENIS KASUS</h4>
                <div class="section-content">
                    <table class="form-table">
                        <tr>
                            <td class="info-label">Jenis Kasus</td>
                            <td class="info-value">
                                @if ($triageData->kasus_jenis_kasus ?? false)
                                    [✓] Trauma<br>
                                    @if ($triageData->kasus_kecelakaan_kerja ?? false)
                                        [✓] Kecelakaan Kerja<br>
                                    @endif
                                    @if ($triageData->kasus_laka_lantas ?? false)
                                        [✓] Kecelakaan Lalu Lintas<br>
                                    @endif
                                @else
                                    [✓] Non Trauma
                                @endif
                                <strong>Lokasi:</strong> {{ $triageData->kasus_lokasi ?? '-' }}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            {{-- Anamnese Section --}}
            <div class="section">
                <h4>C. ANAMNESE</h4>
                <table class="form-table">
                    <tr>
                        <td class="info-label">Anamnese Terpimpin</td>
                        <td class="info-value">{{ $triageData->anamnese_terpimpin ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Keluhan Utama</td>
                        <td class="info-value">{{ $triageData->anamnese_keluhan_utama ?? '-' }}</td>
                    </tr>
                </table>
            </div>

            {{-- Tanda Vital Section --}}
            <div class="section">
                <h4>D. TANDA-TANDA VITAL</h4>
                <table class="vital-table">
                    <tr>
                        <th>TD (mmHg)</th>
                        <th>Suhu (°C)</th>
                        <th>Nadi (x/mnt)</th>
                        <th>RR (x/mnt)</th>
                        <th>Skala Nyeri</th>
                        <th>Metode Ukur</th>
                    </tr>
                    <tr>
                        <td>{{ $triageData->tanda_vital_tekanan_darah ?? '-' }}</td>
                        <td>{{ $triageData->tanda_vital_suhu ?? '-' }}</td>
                        <td>{{ $triageData->tanda_vital_nadi ?? '-' }}</td>
                        <td>{{ $triageData->tanda_vital_pernafasan ?? '-' }}</td>
                        <td>{{ $triageData->tanda_vital_skala_nyeri ?? '-' }}/10</td>
                        <td>{{ $triageData->tanda_vital_metode_ukur ?? '-' }}</td>
                    </tr>
                </table>
            </div>

            {{-- Kategori Triage Section --}}
            <div class="section">
                <h4>E. KATEGORI TRIAGE</h4>
                <div class="section-content">
                    @php
                        // Determine selected triage based on savedData
                        $selectedTriage = null;
                        if (isset($triageData->kategori_triage)) {
                            $selectedTriage = $triageData->kategori_triage;
                        } else {
                            // Fallback to boolean fields
                            if ($triageData->triage_resusitasi ?? false) $selectedTriage = 'P1';
                            elseif ($triageData->triage_emergency ?? false) $selectedTriage = 'P2';
                            elseif ($triageData->triage_urgent ?? false) $selectedTriage = 'P3';
                            elseif ($triageData->triage_less_urgent ?? false) $selectedTriage = 'P4';
                            elseif ($triageData->triage_non_urgent ?? false) $selectedTriage = 'P5';
                            elseif ($triageData->triage_doa ?? false) $selectedTriage = 'DOA';
                        }
                        
                        $triageOptions = [
                            'P1' => ['title' => 'RESUSITASI', 'color' => '#000', 'colorName' => 'Hitam'],
                            'P2' => ['title' => 'EMERGENCY', 'color' => '#e74c3c', 'colorName' => 'Merah'],  
                            'P3' => ['title' => 'URGENT', 'color' => '#f39c12', 'colorName' => 'Kuning'],
                            'P4' => ['title' => 'LESS URGENT', 'color' => '#27ae60', 'colorName' => 'Hijau'],
                            'P5' => ['title' => 'NON URGENT', 'color' => '#3498db', 'colorName' => 'Biru'],
                            'DOA' => ['title' => 'DOA', 'color' => '#95a5a6', 'colorName' => 'Abu-abu']
                        ];
                    @endphp
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; margin-bottom: 10px;">
                        @foreach ($triageOptions as $key => $option)
                            <div class="triage-level-box" style="background-color: {{ $option['color'] }}; color: white; {{ $selectedTriage === $key ? 'font-weight: bold; border: 3px solid #000;' : '' }}">
                                {{ $selectedTriage === $key ? '[✓]' : '[ ]' }} {{ $option['title'] }} ({{ $option['colorName'] }})
                            </div>
                        @endforeach
                    </div>
                    
                    @if ($selectedTriage)
                        <table class="form-table">
                            <tr>
                                <td class="info-label">Kategori Triage Terpilih</td>
                                <td class="info-value" style="font-weight: bold; color: {{ $triageOptions[$selectedTriage]['color'] }};">
                                    {{ $triageOptions[$selectedTriage]['title'] }} ({{ $triageOptions[$selectedTriage]['colorName'] }})
                                </td>
                            </tr>
                        </table>
                    @endif
                </div>
            </div>

            {{-- Footer with Signatures --}}
            <table class="footer-table">
                <tr>
                    <td class="footer-left-cell">
                        
                    </td>
                    <td class="footer-right-cell">
                        <div class="date-location">BOJONEGORO, {{ \Carbon\Carbon::parse($pengajuanKlaim->tanggal_keluar ?? '-')->format('d F Y') }}</div>
                        <div style="font-weight: bold;">Perawat Triage</div>
                        <div style="margin: 8px 0 8px;">
                            @if (isset($perawatQR))
                                <img src="{{ $perawatQR }}" style="width: 40px; height: 40px;" alt="QR Code Perawat">
                            @else
                                <div class="qr-placeholder">[QR Code]</div>
                            @endif
                        </div>
                        <div class="doctor-name">( {{ $triageData->petugas ?? '.............................' }} )</div>
                    </td>
                </tr>
            </table>

            @if ($triageData->is_fiktif ?? false)
                <div class="fiktif-watermark">DATA FIKTIF</div>
            @endif
        </div>
    @else
        <div class="no-data">
            Tidak ada data triage yang tersedia.
        </div>
    @endif
</body>

</html>
