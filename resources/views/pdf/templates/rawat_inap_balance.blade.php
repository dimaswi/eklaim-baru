<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Balance Cairan Rawat Inap - {{ $pengajuanKlaim->nomor_sep }}</title>
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

        /* Balance Cairan Specific Styles */
        .balance-report {
            width: 100%;
            max-width: 190mm;
            padding: 10px;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
        }

        .balance-report:last-child {
            page-break-after: avoid;
        }

        .header-section {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
        }

        .hospital-header-table {
            width: 100%;
            margin-bottom: 8px;
        }

        .logo-cell {
            width: 60px;
            text-align: center;
            vertical-align: middle;
        }

        .logo-image {
            width: 45px;
            height: 45px;
        }

        .logo-placeholder {
            width: 45px;
            height: 45px;
            border: 2px solid #333;
            text-align: center;
            line-height: 41px;
            font-size: 8px;
            margin: 0 auto;
        }

        .hospital-info-cell {
            text-align: left;
            vertical-align: middle;
            padding-left: 10px;
        }

        .hospital-name {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            margin-bottom: 2px;
        }

        .hospital-address {
            font-size: 9px;
            color: #666;
            margin-bottom: 1px;
        }

        .hospital-contact {
            font-size: 8px;
            color: #666;
        }

        .document-title-balance {
            font-size: 13px;
            font-weight: bold;
            background-color: #333;
            color: white;
            padding: 5px;
            margin-top: 6px;
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
            padding: 8px;
            border: 1px solid #ccc;
        }

        .patient-details {
            width: 100%;
        }

        .patient-details td {
            padding: 1px 0;
            font-size: 9px;
        }

        .patient-details .label {
            width: 80px;
            font-weight: bold;
        }

        .patient-details .colon {
            width: 10px;
            text-align: center;
        }

        /* Balance Cairan Table Styles */
        .balance-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border: 2px solid #000;
            font-size: 7px;
        }

        .balance-table th,
        .balance-table td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            vertical-align: middle;
            word-wrap: break-word;
        }

        .balance-table th {
            background-color: #e0e0e0;
            font-weight: bold;
            font-size: 8px;
        }

        /* Column groups for intake and output */
        .intake-header {
            background-color: #d4e6f1;
        }

        .output-header {
            background-color: #fadbd8;
        }

        .balance-header {
            background-color: #d5f4e6;
        }

        /* Column widths */
        .col-tanggal {
            width: 8%;
        }

        .col-waktu {
            width: 6%;
        }

        .col-intake {
            width: 6%;
        }

        .col-output {
            width: 6%;
        }

        .col-balance {
            width: 8%;
        }

        .col-suhu {
            width: 6%;
        }

        .col-petugas {
            width: 8%;
        }

        /* QR Code styles */
        .qr-code-cell {
            text-align: center;
            vertical-align: middle;
            padding: 1px;
        }

        .qr-image {
            width: 25px;
            height: 25px;
            margin: 0 auto;
        }

        .qr-placeholder {
            width: 25px;
            height: 25px;
            border: 1px solid #ccc;
            margin: 0 auto;
            text-align: center;
            line-height: 23px;
            background-color: #f9f9f9;
            font-size: 5px;
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
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 8px;
        }

        /* Row styling */
        .balance-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .balance-table tbody tr:hover {
            background-color: #e8f4f8;
        }

        /* Text alignment for specific columns */
        .center-text {
            text-align: center;
        }

        .number-text {
            text-align: right;
            padding-right: 4px;
        }
    </style>
</head>

<body>
    @php
        $recordCount = 0;
    @endphp

    @if ($data && $data->count() > 0)
        <div class="balance-report">
            {{-- Header Section --}}
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
                <div class="document-title-balance">OBSERVASI BALANCE CAIRAN</div>
            </div>

            {{-- Patient Information --}}
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
                                <td class="value">{{ $pengajuanKlaim->jenis_kelamin == 1 ? 'Laki-laki' : 'Perempuan' }}</td>
                            </tr>
                            <tr>
                                <td class="label">Tanggal Lahir</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $pengajuanKlaim->tanggal_lahir ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_lahir)->format('d M Y') : '-' }}</td>
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
                                <td class="value">{{ \Carbon\Carbon::parse($pengajuanKlaim->tanggal_masuk)->format('d M Y H:i') }}</td>
                            </tr>
                            <tr>
                                <td class="label">Tanggal Keluar</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $pengajuanKlaim->tanggal_keluar ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_keluar)->format('d M Y H:i') : '-' }}</td>
                            </tr>
                            <tr>
                                <td class="label">Ruangan</td>
                                <td class="colon">:</td>
                                <td class="value">{{ $pengajuanKlaim->ruangan ?? '-' }}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            {{-- Balance Cairan Table --}}
            <table class="balance-table">
                <thead>
                    <tr>
                        <th rowspan="2" class="col-tanggal">Tanggal</th>
                        <th rowspan="2" class="col-waktu">Waktu</th>
                        <th colspan="5" class="intake-header">INTAKE (ML)</th>
                        <th colspan="5" class="output-header">OUTPUT (ML)</th>
                        <th colspan="3" class="balance-header">BALANCE</th>
                        <th rowspan="2" class="col-suhu">Suhu (°C)</th>
                        <th rowspan="2" class="col-petugas">Nama Petugas</th>
                    </tr>
                    <tr>
                        <th class="col-intake intake-header">Oral</th>
                        <th class="col-intake intake-header">NGT</th>
                        <th class="col-intake intake-header">Konsumsi</th>
                        <th class="col-intake intake-header">Transfusi</th>
                        <th class="col-intake intake-header">Total</th>
                        <th class="col-output output-header">Oral</th>
                        <th class="col-output output-header">NGT</th>
                        <th class="col-output output-header">Urine</th>
                        <th class="col-output output-header">Pendarahan</th>
                        <th class="col-output output-header">Fases</th>
                        <th class="col-balance balance-header">Total Output</th>
                        <th class="col-balance balance-header">Volume In</th>
                        <th class="col-balance balance-header">Volume Out</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data as $item)
                        @php
                            $recordCount++;
                        @endphp
                        <tr>
                            <td class="col-tanggal center-text">
                                @if($item->tanggal)
                                    {{ \Carbon\Carbon::parse($item->tanggal)->format('d-m-Y') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="col-waktu center-text">
                                @if($item->waktu_pemeriksaan)
                                    {{ \Carbon\Carbon::parse($item->waktu_pemeriksaan)->format('H:i') }}
                                @else
                                    -
                                @endif
                            </td>
                            {{-- INTAKE --}}
                            <td class="col-intake number-text">{{ $item->intake_oral ?? '-' }}</td>
                            <td class="col-intake number-text">{{ $item->intake_ngt ?? '-' }}</td>
                            <td class="col-intake number-text">{{ $item->konsumsi_jumlah ?? '-' }}</td>
                            <td class="col-intake number-text">{{ $item->transfusi_produk_jumlah ?? '-' }}</td>
                            <td class="col-intake number-text">{{ $item->total_intake ?? '-' }}</td>
                            {{-- OUTPUT --}}
                            <td class="col-output number-text">{{ $item->output_oral ?? '-' }}</td>
                            <td class="col-output number-text">{{ $item->output_ngt ?? '-' }}</td>
                            <td class="col-output number-text">{{ $item->urine_jumlah ?? '-' }}</td>
                            <td class="col-output number-text">{{ $item->pendarahan_jumlah ?? '-' }}</td>
                            <td class="col-output number-text">{{ $item->fases_jumlah ?? '-' }}</td>
                            {{-- BALANCE --}}
                            <td class="col-balance number-text">{{ $item->total_output ?? '-' }}</td>
                            <td class="col-balance number-text">{{ $item->volume_intake ?? '-' }}</td>
                            <td class="col-balance number-text">{{ $item->volume_output ?? '-' }}</td>
                            {{-- SUHU --}}
                            <td class="col-suhu center-text">{{ $item->suhu ?? '-' }}</td>
                            {{-- NAMA PETUGAS dengan QR Code --}}
                            <td class="qr-code-cell">
                                @php
                                    $petugasQR = null;
                                    if (!empty($item->nama_petugas)) {
                                        try {
                                            $petugasQR = \App\Helpers\QRCodeHelper::generateDataURL($item->nama_petugas);
                                        } catch (\Exception $e) {
                                            $petugasQR = null;
                                        }
                                    }
                                @endphp
                                
                                @if($petugasQR)
                                    <img src="{{ $petugasQR }}" class="qr-image" alt="QR Code Petugas">
                                @else
                                    <div class="qr-placeholder">[QR]</div>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            @if ($data->first() && ($data->first()->is_fiktif ?? false))
                <div class="fiktif-watermark">DATA FIKTIF</div>
            @endif
        </div>
    @else
        <div class="no-data">
            Tidak ada data Balance Cairan yang tersedia.
        </div>
    @endif
</body>

</html>