<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Tagihan - {{ $pengajuanKlaim->nomor_sep }}</title>
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

        /* Tagihan Specific Styles */
        .tagihan-report {
            width: 100%;
            max-width: 190mm;
            padding: 10px;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
        }

        .tagihan-report:last-child {
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

        .document-title-tagihan {
            font-size: 13px;
            font-weight: bold;
            background-color: #333;
            color: white;
            padding: 5px;
            margin-top: 6px;
        }

        /* Patient Information */
        .patient-info-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }

        .patient-left-cell,
        .patient-right-cell {
            width: 50%;
            vertical-align: top;
            padding: 5px;
        }

        .patient-details {
            width: 100%;
            border-collapse: collapse;
        }

        .patient-details td.label {
            width: 35%;
            font-weight: bold;
            vertical-align: top;
            padding: 2px 5px 2px 0;
            font-size: 9px;
        }

        .patient-details td.colon {
            width: 5%;
            text-align: center;
            vertical-align: top;
            padding: 2px;
            font-size: 9px;
        }

        .patient-details td.value {
            width: 60%;
            vertical-align: top;
            padding: 2px 0 2px 5px;
            font-size: 9px;
        }

        /* Tagihan Table */
        .tagihan-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid #000;
        }

        .tagihan-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
            padding: 8px 4px;
            border: 1px solid #000;
            font-size: 9px;
            vertical-align: middle;
        }

        .tagihan-table td {
            padding: 6px 4px;
            border: 1px solid #000;
            vertical-align: top;
            font-size: 8px;
        }

        /* Column widths */
        .col-no {
            width: 4%;
            text-align: center;
        }

        .col-keterangan {
            width: 40%;
        }

        .col-tarif {
            width: 15%;
            text-align: right;
        }

        .col-jumlah {
            width: 8%;
            text-align: center;
        }

        .col-diskon {
            width: 12%;
            text-align: right;
        }

        .col-subtotal {
            width: 15%;
            text-align: right;
        }

        .col-status {
            width: 6%;
            text-align: center;
        }

        /* Text alignment classes */
        .center-text {
            text-align: center;
        }

        .right-text {
            text-align: right;
        }

        .left-text {
            text-align: left;
        }

        .number-text {
            text-align: right;
            font-family: monospace;
        }

        /* Total section */
        .total-section {
            margin-top: 20px;
            border: 2px solid #000;
            padding: 10px;
            background-color: #f9f9f9;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
        }

        .total-label {
            font-weight: bold;
        }

        .total-value {
            font-weight: bold;
            font-family: monospace;
        }

        .grand-total {
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 5px;
            font-size: 12px;
        }

        /* QR Code */
        .qr-code-cell {
            text-align: center;
            vertical-align: middle;
            padding: 5px;
            width: 60px;
        }

        .qr-image {
            width: 50px;
            height: 50px;
            border: 1px solid #ccc;
        }

        .qr-placeholder {
            width: 50px;
            height: 50px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f0f0;
            font-size: 8px;
            margin: 0 auto;
        }

        /* Watermark */
        .fiktif-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            font-weight: bold;
            color: rgba(255, 0, 0, 0.1);
            z-index: -1;
            pointer-events: none;
        }

        /* Status indicators */
        .status-paid {
            background-color: #d4edda;
            color: #155724;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7px;
            font-weight: bold;
        }

        .status-unpaid {
            background-color: #f8d7da;
            color: #721c24;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7px;
            font-weight: bold;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            font-style: italic;
            color: #666;
        }

        /* Print specific */
        @media print {
            .tagihan-report {
                page-break-after: always;
            }

            .tagihan-report:last-child {
                page-break-after: avoid;
            }
        }
    </style>
</head>

<body>
    @if($data && $data->count() > 0)
        @foreach($data as $tagihan)
            <div class="tagihan-report">
                {{-- Header --}}
                <div class="header-section">
                    <table class="hospital-header-table">
                        <tr>
                            <td class="logo-cell">
                                @if($logoBase64)
                                    <img src="{{ $logoBase64 }}" class="logo-image" alt="Logo RS">
                                @endif
                            </td>
                            <td class="hospital-info">
                                <div class="hospital-name">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</div>
                                <div class="hospital-address">Jl. PUK Desa Drokilo, Kec. Kedungadem Kab. Bojonegoro</div>
                                <div class="hospital-contact">Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646</div>
                            </td>
                        </tr>
                    </table>
                    <div class="document-title-tagihan">TAGIHAN PELAYANAN MEDIS</div>
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
                                    <td class="value">{{ $pengajuanKlaim->tanggal_lahir ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_lahir)->format('d-m-Y') : '-' }}</td>
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
                                    <td class="label">No. SEP</td>
                                    <td class="colon">:</td>
                                    <td class="value">{{ $pengajuanKlaim->nomor_sep }}</td>
                                </tr>
                                <tr>
                                    <td class="label">No. Kunjungan</td>
                                    <td class="colon">:</td>
                                    <td class="value">{{ $tagihan->nomor_kunjungan }}</td>
                                </tr>
                                <tr>
                                    <td class="label">Tanggal Tagihan</td>
                                    <td class="colon">:</td>
                                    <td class="value">{{ \Carbon\Carbon::parse($tagihan->created_at)->format('d-m-Y') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                {{-- Tagihan Details Table --}}
                <table class="tagihan-table">
                    <thead>
                        <tr>
                            <th class="col-no">No</th>
                            <th class="col-keterangan">Keterangan</th>
                            <th class="col-tarif">Tarif</th>
                            <th class="col-jumlah">Qty</th>
                            <th class="col-diskon">Diskon</th>
                            <th class="col-subtotal">Subtotal</th>
                            <th class="col-status">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php
                            $totalTagihan = 0;
                            $totalDiskon = 0;
                        @endphp
                        @foreach($tagihan->rincian_tagihan as $index => $item)
                            @php
                                $subtotal = ($item['TARIF'] ?? 0) * ($item['JUMLAH'] ?? 1) - ($item['DISKON'] ?? 0);
                                $totalTagihan += $subtotal;
                                $totalDiskon += ($item['DISKON'] ?? 0);
                                
                                // Get nama berdasarkan jenis tarif
                                $namaItem = '';
                                switch($item['JENIS']) {
                                    case 1: // Administrasi
                                        $namaItem = $item['tarif_administrasi']['nama_tarif']['DESKRIPSI'] ?? 'Tarif Administrasi';
                                        break;
                                    case 2: // Ruang Rawat
                                        $namaItem = 'Tarif Ruang Rawat';
                                        break;
                                    case 3: // Tindakan
                                        $namaItem = $item['tarif_tindakan']['nama_tindakan']['NAMA'] ?? 'Tindakan Medis';
                                        break;
                                    case 4: // Obat/Barang
                                        $namaItem = $item['tarif_harga_barang']['nama_barang']['NAMA'] ?? 'Obat/Barang';
                                        break;
                                    case 5: // Paket
                                        $namaItem = 'Paket Layanan';
                                        break;
                                    case 6: // O2
                                        $namaItem = 'Oksigen';
                                        break;
                                    default:
                                        $namaItem = 'Layanan Medis';
                                }
                            @endphp
                            <tr>
                                <td class="col-no center-text">{{ $index + 1 }}</td>
                                <td class="col-keterangan left-text">{{ $namaItem }}</td>
                                <td class="col-tarif number-text">{{ number_format($item['TARIF'] ?? 0, 0, ',', '.') }}</td>
                                <td class="col-jumlah number-text">{{ number_format($item['JUMLAH'] ?? 1, 0, ',', '.') }}</td>
                                <td class="col-diskon number-text">{{ number_format($item['DISKON'] ?? 0, 0, ',', '.') }}</td>
                                <td class="col-subtotal number-text">{{ number_format($subtotal, 0, ',', '.') }}</td>
                                <td class="col-status center-text"><span class="status-paid">LUNAS</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                {{-- Total Section --}}
                <div class="total-section">
                    <div class="total-row">
                        <span class="total-label">Subtotal:</span>
                        <span class="total-value">Rp {{ number_format($totalTagihan + $totalDiskon, 0, ',', '.') }}</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">Total Diskon:</span>
                        <span class="total-value">Rp {{ number_format($totalDiskon, 0, ',', '.') }}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span class="total-label">TOTAL TAGIHAN:</span>
                        <span class="total-value">Rp {{ number_format($tagihan->total_tagihan, 0, ',', '.') }}</span>
                    </div>
                </div>

                {{-- QR Code Signature Section --}}
                <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
                    <tr>
                        <td style="width: 60%; text-align: left; vertical-align: top; padding: 10px;">
                            <!-- Space for additional info if needed -->
                        </td>
                        <td style="width: 40%; text-align: center; vertical-align: top; padding: 10px;">
                            <div style="font-size: 10px; margin-bottom: 10px; font-weight: bold;">Petugas Kasir</div>
                            @if($perawatQR)
                                <img src="{{ $perawatQR }}" class="qr-image" alt="QR Code Petugas">
                            @else
                                <div class="qr-placeholder">[QR]</div>
                            @endif
                            <div style="font-size: 8px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; min-height: 20px;">
                                {{ $pengajuanKlaim->created_at ? \Carbon\Carbon::parse($pengajuanKlaim->created_at)->format('d-m-Y') : '' }}
                            </div>
                        </td>
                    </tr>
                </table>

                @if ($tagihan->rincian_tagihan && isset($tagihan->rincian_tagihan[0]['is_fiktif']) && $tagihan->rincian_tagihan[0]['is_fiktif'])
                    <div class="fiktif-watermark">DATA FIKTIF</div>
                @endif
            </div>
        @endforeach
    @else
        <div class="no-data">
            Tidak ada data Tagihan yang tersedia.
        </div>
    @endif
</body>

</html>