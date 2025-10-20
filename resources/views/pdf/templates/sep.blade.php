<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>SEP - {{ $pengajuanKlaim->nomor_sep }}</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.2;
            color: #000;
            margin: 0;
            padding: 0;
            width: 100%;
        }

        .sep-container {
            width: 100%;
            border: 2px solid #000;
            padding: 8px;
            box-sizing: border-box;
        }

        .header-section {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }

        .logo-container {
            display: table-cell;
            width: 100px;
            vertical-align: top;
            padding-right: 15px;
        }

        .logo-container img {
            width: 85mm;
            height: 14mm;
        }

        .header-text {
            display: table-cell;
            vertical-align: top;
            text-align: left;
        }

        .header-title {
            font-size: 12px;
            font-weight: bold;
            color: #2c5aa0;
            margin: 0;
            margin-bottom: 2px;
        }

        .header-subtitle {
            font-size: 10px;
            margin: 0;
            color: #000;
        }

        .patient-info-section {
            margin-bottom: 8px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
            font-size: 9px;
        }

        .info-table td {
            padding: 1px 3px;
            vertical-align: top;
            border: none;
            line-height: 1.3;
        }

        .info-label {
            width: 90px;
            font-weight: normal;
        }

        .info-colon {
            width: 8px;
            text-align: left;
        }

        .info-value {
            font-weight: normal;
        }

        .right-info {
            padding-left: 30px;
            font-weight: normal;
        }

        .separator-line {
            border-top: 1px solid #000;
            margin: 8px 0;
        }

        .notes-section {
            margin-top: 8px;
            font-size: 8px;
            line-height: 1.1;
        }

        .notes-section p {
            margin: 1px 0;
        }

        .footer-section {
            margin-top: 8px;
            text-align: right;
            font-size: 9px;
        }

        .print-info {
            font-size: 8px;
            color: #000;
            margin-top: 5px;
        }

        /* Specific styling for BPJS format */
        .bpjs-green {
            color: #0066cc;
        }

        .form-header {
            background-color: #f0f0f0;
            padding: 5px;
            font-weight: bold;
            text-align: center;
            border: 1px solid #000;
            margin-bottom: 10px;
        }

        .patient-type {
            display: inline-block;
            margin-right: 20px;
        }

        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            margin-right: 5px;
            text-align: center;
            line-height: 10px;
        }

        .checkbox.checked {
            background-color: #000;
            color: #fff;
        }

        .diagnosis-section {
            margin: 10px 0;
            border: 1px solid #000;
            padding: 8px;
        }

        .diagnosis-header {
            font-weight: bold;
            margin-bottom: 5px;
        }
    </style>
</head>

<body>
    @if($data && $data->count() > 0)
        @foreach($data as $index => $sepData)
        <div class="sep-container">
            <!-- Header Section with BPJS Logo -->
            <div class="header-section">
                <div class="logo-container">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" alt="BPJS Kesehatan Logo">
                    @else
                        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('bpjs.png'))) }}" alt="BPJS Kesehatan Logo">
                    @endif
                </div>
                <div class="header-text">
                    <h1 class="header-title">SURAT ELEGIBILITAS PESERTA</h1>
                    <p class="header-subtitle">Klinik Rawat Inap Utama Muhammadiyah Kedungadem</p>
                </div>
            </div>

            <!-- Patient Information Section -->
            <div class="patient-info-section">
                <table class="info-table">
                    <tr>
                        <td class="info-label">No. SEP</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $pengajuanKlaim->nomor_sep ?? '018910720239000011' }}</td>
                        <td class="right-info"></td>
                    </tr>
                    <tr>
                        <td class="info-label">Tgl. SEP</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $pengajuanKlaim->tanggal_sep ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_sep)->format('Y-m-d') : '2023-02-28' }}</td>
                        <td class="right-info">Peserta : {{ $pengajuanKlaim->jenis_peserta ?? 'PBI (APBD)' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">No. Kartu</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $pengajuanKlaim->nomor_kartu ?? '0002061917007 ( MR. B100000008) PRB' }}</td>
                        <td class="right-info"></td>
                    </tr>
                    <tr>
                        <td class="info-label">Nama Peserta</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $pengajuanKlaim->nama_pasien ?? '-' }}</td>
                        <td class="right-info">Jns. Rawat : {{ $pengajuanKlaim->jenis_kunjungan ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Tgl. Lahir</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $pengajuanKlaim->tanggal_lahir ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_lahir)->format('Y-m-d') : '1942-07-01' }} Kelamin : {{ $pengajuanKlaim->jenis_kelamin ?? 'Perempuan' }}</td>
                        <td class="right-info">Jns. Kunjungan : {{ $pengajuanKlaim->jenis_kunjungan ?? 'Normal' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">No. Telepon</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $pengajuanKlaim->no_telepon ?? '-' }}</td>
                        <td class="right-info">: -</td>
                    </tr>
                    <tr>
                        <td class="info-label">Sub/Spesialis</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $dataKunjungan->poliTujuan ?? 'IGD' }}</td>
                        <td class="right-info">Poli Perujuk :</td>
                    </tr>
                    <tr>
                        <td class="info-label">Dokter</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $dataKunjungan->user ?? '-' }}</td>
                        <td class="right-info">Kls. Hak : {{ $dataKunjungan->klsRawat ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Faskes Perujuk</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $pengajuanKlaim->faskes_perujuk ?? 'R10 - Abdominal and pelvic pain' }}</td>
                        <td class="right-info">Kls. Rawat : {{ $dataKunjungan->klsRawat ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Diagnosa Awal</td>
                        <td class="info-colon">:</td>
                        <td class="info-value">{{ $dataKunjungan->diagAwal ?? '-' }}</td>
                        <td class="right-info">Penjamin :</td>
                    </tr>
                    <tr>
                        <td class="info-label">Catatan</td>
                        <td class="info-colon">:</td>
                        <td class="info-value" colspan="2">{{ $pengajuanKlaim->catatan ?? '' }}</td>
                    </tr>
                </table>
            </div>

            <div class="separator-line"></div>

            <!-- Additional Information -->
            <div style="text-align: right; margin-bottom: 5px; font-size: 9px;">
                Pasien/Keluarga Pasien
            </div>

            <!-- Notes Section -->
            <div class="notes-section">
                <p>* Saya menyetujui BPJS Kesehatan menggunakan informasi Medis Pasien jika diperlukan.</p>
                <p>* SEP bukan sebagai bukti penjaminan semua pelayanan yang tercantum didalamnya, SEP</p>
                <p>bukan sebagai bukti penjaminan semua pelayanan yang tercantum didalamnya.</p>
                <p>* Dengan adanya SEP ini, Peserta rawat inap telah mendapatkan informasi dan memahami</p>
                <p>kelas rawat sesuai hak kelas nya (perseorangan) kelas rawat penuh adalah kelas sesuai aturan yang berlaku</p>
            </div>

            <!-- Footer with Print Information -->
            <div class="footer-section">
                <div class="print-info">
                    <p>Klinik Rawat Inap Utama Muhammadiyah Kedungadem</p>
                    <p>Cetak ke {{ $index + 1 }} / {{ \Carbon\Carbon::parse($pengajuanKlaim->tanggal_sep ?? now())->format('Y-m-d H:i:s') }}</p>
                </div>
            </div>
        </div>
        @endforeach
    @else
        <div class="sep-container">
            <div class="header-section">
                <div class="logo-container">
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('bpjs.png'))) }}" alt="BPJS Kesehatan Logo">
                </div>
                <div class="header-text">
                    <h1 class="header-title">SURAT ELEGIBILITAS PESERTA</h1>
                    <p class="header-subtitle">Klinik Rawat Inap Utama Muhammadiyah Kedungadem</p>
                </div>
            </div>
            
            <div style="text-align: center; margin: 50px 0; color: #666;">
                <h3>⚠️ Data SEP Tidak Tersedia</h3>
                <p>Belum ada data SEP untuk pengajuan ini.</p>
            </div>
        </div>
    @endif
</body>
</html>