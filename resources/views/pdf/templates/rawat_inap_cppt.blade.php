<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>CPPT Rawat Inap - {{ $pengajuanKlaim->nomor_sep }}</title>
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

        /* CPPT Specific Styles */
        .cppt-report {
            width: 100%;
            max-width: 190mm;
            padding: 10px;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
        }

        .cppt-report:last-child {
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

        .document-title-cppt {
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

        /* CPPT Table Styles */
        .cppt-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border: 2px solid #000;
            font-size: 8px;
        }

        .cppt-table th,
        .cppt-table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
        }

        .cppt-table th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
            font-size: 9px;
        }

        /* Column widths matching the image */
        .col-tanggal {
            width: 12%;
        }

        .col-profesi {
            width: 10%;
        }

        .col-subyektif {
            width: 15%;
        }

        .col-obyektif {
            width: 15%;
        }

        .col-assessment {
            width: 15%;
        }

        .col-planning {
            width: 15%;
        }

        .col-instruksi {
            width: 12%;
        }

        .col-petugas {
            width: 6%;
            text-align: center;
        }

        /* QR Code styles */
        .qr-code-cell {
            text-align: center;
            vertical-align: middle;
            padding: 2px;
        }

        .qr-image {
            width: 30px;
            height: 30px;
            margin: 0 auto;
        }

        .qr-placeholder {
            width: 30px;
            height: 30px;
            border: 1px solid #ccc;
            margin: 0 auto;
            text-align: center;
            line-height: 28px;
            background-color: #f9f9f9;
            font-size: 6px;
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
        .cppt-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .cppt-table tbody tr:hover {
            background-color: #e8f4f8;
        }

        /* Text alignment for specific columns */
        .center-text {
            text-align: center;
        }

        .justify-text {
            text-align: justify;
        }
    </style>
</head>

<body>
    @php
        $recordCount = 0;
    @endphp

    @if ($data && $data->count() > 0)
        <div class="cppt-report">
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
                <div class="document-title-cppt">CATATAN PERKEMBANGAN PASIEN TERINTEGRASI</div>
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

            {{-- CPPT Table --}}
            <table class="cppt-table">
                <thead>
                    <tr>
                        <th class="col-tanggal">Tanggal</th>
                        <th class="col-profesi">Profesi</th>
                        <th class="col-subyektif">Subyektif</th>
                        <th class="col-obyektif">Obyektif</th>
                        <th class="col-assessment">Assessment</th>
                        <th class="col-planning">Planning</th>
                        <th class="col-instruksi">Instruksi</th>
                        <th class="col-petugas">Nama Petugas</th>
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
                            <td class="col-profesi center-text">{{ $item->profesi ?? '-' }}</td>
                            <td class="col-subyektif justify-text">{{ $item->subyektif ?? '-' }}</td>
                            <td class="col-obyektif justify-text">{{ $item->obyektif ?? '-' }}</td>
                            <td class="col-assessment justify-text">{{ $item->assesment ?? '-' }}</td>
                            <td class="col-planning justify-text">{{ $item->planning ?? '-' }}</td>
                            <td class="col-instruksi justify-text">{{ $item->instruksi ?? '-' }}</td>
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
            Tidak ada data CPPT yang tersedia.
        </div>
    @endif
</body>

</html>