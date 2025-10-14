<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Resume Medis - {{ $pengajuanKlaim->nomor_sep }}</title>
    <style>
        @page {
            size: A4;
            margin: 20px;
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



        /* Resume Report Specific Styles */
        .resume-report {
            width: 100%;
            max-width: 180mm;
            padding: 15px;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
        }

        .resume-report:last-child {
            page-break-after: avoid;
        }

        .header-section {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
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

        .document-title-resume {
            font-size: 14px;
            font-weight: bold;
            background-color: #333;
            color: white;
            padding: 6px;
            margin-top: 8px;
        }

        .patient-info-table {
            width: 100%;
            margin-bottom: 20px;
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

        .patient-details .value {}

        .result-section {
            margin-bottom: 10px;
            border: 1px solid #ccc;
            padding: 10px;
            background-color: #fafafa;
        }

        .result-section h4 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
            background-color: #e8e8e8;
            padding: 4px 8px;
            margin: -10px -10px 8px -10px;
        }

        .result-content {
            font-size: 10px;
            line-height: 1.4;
            margin-bottom: 0;
        }

        /* Tables */
        .data-table,
        .form-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border: 1px solid #000;
        }

        .data-table th,
        .data-table td,
        .form-table th,
        .form-table td {
            border: 1px solid #000;
            padding: 6px 4px;
            font-size: 10px;
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

        .table-title {
            background-color: #000;
            color: white;
            text-align: center;
            font-weight: bold;
        }

        .col-no {
            width: 8%;
            text-align: center;
        }

        .col-code {
            width: 15%;
            text-align: center;
        }

        .col-desc {
            width: 52%;
        }

        .col-type {
            width: 25%;
            text-align: center;
        }

        /* Vital Signs Table */
        .vital-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border: 1px solid #000;
        }

        .vital-table th,
        .vital-table td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 9px;
            text-align: center;
        }

        .vital-table th {
            background-color: #e0e0e0;
            font-weight: bold;
        }

        /* Medication Table */
        .med-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border: 1px solid #000;
        }

        .med-table th,
        .med-table td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 10px;
        }

        .med-table th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
        }

        .med-col-no {
            width: 8%;
            text-align: center;
        }

        .med-col-obat {
            width: 25%;
        }

        .med-col-takaran {
            width: 20%;
            text-align: center;
        }

        .med-col-cara {
            width: 25%;
        }

        .med-col-ket {
            width: 22%;
        }

        .footer-table {
            width: 100%;
            margin-top: 15px;
            border-collapse: collapse;
        }

        .footer-left-cell,
        .footer-right-cell {
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 10px;
            padding: 10px;
        }

        .doctor-title {
            font-weight: bold;
        }

        .petugas-radio {
            font-weight: bold;
            margin-bottom: 8px;
        }

        .doctor-name,
        .petugas-name {
            font-weight: bold;
            margin-top: 8px;
        }

        .qr-placeholder {
            border: 1px solid #ccc;
            height: 50px;
            margin: 8px auto;
            width: 50px;
            text-align: center;
            line-height: 48px;
            background-color: #f9f9f9;
            font-size: 9px;
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
    </style>
</head>

<body>
    @php
        $recordCount = 0;
    @endphp

    @if ($data && $data->isNotEmpty())
    @php
        // Gunakan type dokumen dinamis dari controller
        $documentType = $type ?? 'resume_medis';

        // Ambil record yang dipilih berdasarkan document type
        $selectedData = data_get($selectedRecords, $documentType, []);

        // Pastikan hasilnya array string
        $selectedIds = array_map('strval', (array) $selectedData);

        // Filter data yang cocok
        $selectedItems = $data->filter(fn($item) => in_array((string)$item->id, $selectedIds));

        $totalItems = $selectedItems->count();
        $recordCount = 0;
    @endphp

    @if ($selectedItems->isNotEmpty())
        @foreach ($selectedItems as $item)
            @php
                $recordCount++;

                // Variabel reusable
                $tglLahir = $item->tanggal_lahir ?? $pengajuanKlaim->tanggal_lahir ?? null;
                $tglMasuk = $item->tanggal_masuk ?? $pengajuanKlaim->tanggal_sep ?? null;
                $tglKeluar = $item->tanggal_keluar ?? null;
                $tanggalTtd = \Carbon\Carbon::parse($tglKeluar ?? $item->created_at)->format('d F Y');

                $petugasNama = $item->petugas ?? '';
                $dokterNama = $item->dokter ?? ($pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD');

                // Generate QR Code aman
                $petugasQR = $dokterQR = null;
                if (class_exists('\App\Helpers\QRCodeHelper')) {
                    try {
                        if ($petugasNama) {
                            $petugasQR = \App\Helpers\QRCodeHelper::generateForStaff($petugasNama, 'Petugas Medis');
                        }
                        $dokterQR = \App\Helpers\QRCodeHelper::generateForStaff($dokterNama, 'Dokter Penanggung Jawab');
                    } catch (\Throwable $e) {
                        error_log('QR Code generation failed: ' . $e->getMessage());
                    }
                }
            @endphp

            <div class="resume-report">
                {{-- HEADER --}}
                <div class="header-section">
                    <table class="hospital-header-table">
                        <tr>
                            <td class="logo-cell">
                                @if (!empty($logoBase64))
                                    <img src="{{ $logoBase64 }}" class="logo-image" alt="Logo">
                                @else
                                    <div class="logo-placeholder">[LOGO]</div>
                                @endif
                            </td>
                            <td class="hospital-info-cell">
                                <div class="hospital-name">
                                    KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM
                                </div>
                                <div class="hospital-address">
                                    Jl. PUK Desa Drokilo, Kec. Kedungadem Kab. Bojonegoro
                                </div>
                                <div class="hospital-contact">
                                    Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646
                                </div>
                            </td>
                        </tr>
                    </table>

                    <div class="document-title-resume">
                        RINGKASAN PULANG
                        @if (!empty($item->resume_title))
                            <br><small style="font-size: 11px;">{{ $item->resume_title }}</small>
                        @endif
                    </div>
                </div>

                {{-- DATA PASIEN --}}
                <table class="patient-info-table">
                    <tr>
                        <td class="patient-left-cell">
                            <table class="patient-details">
                                <tr><td class="label">Nama Pasien</td><td class="colon">:</td><td class="value">{{ $item->nama ?? $pengajuanKlaim->nama_peserta }}</td></tr>
                                <tr><td class="label">Nomor RM</td><td class="colon">:</td><td class="value">{{ $item->norm ?? $pengajuanKlaim->nomor_kartu }}</td></tr>
                                <tr>
                                    <td class="label">Tanggal Lahir</td><td class="colon">:</td>
                                    <td class="value">{{ $tglLahir ? \Carbon\Carbon::parse($tglLahir)->locale('id')->isoFormat('D MMMM Y') : '-' }}</td>
                                </tr>
                                <tr>
                                    <td class="label">Jenis Kelamin</td><td class="colon">:</td>
                                    <td class="value">
                                        {{ $item->jenis_kelamin ?? ($pengajuanKlaim->jenis_kelamin == 'L' ? 'Laki-laki' : ($pengajuanKlaim->jenis_kelamin == 'P' ? 'Perempuan' : '-')) }}
                                    </td>
                                </tr>
                                <tr><td class="label">Alamat</td><td class="colon">:</td><td class="value">{{ $item->alamat ?? ($pengajuanKlaim->alamat ?? '-') }}</td></tr>
                            </table>
                        </td>
                        <td class="patient-right-cell">
                            <table class="patient-details">
                                <tr>
                                    <td class="label">Tanggal Masuk</td><td class="colon">:</td>
                                    <td class="value">{{ $tglMasuk ? \Carbon\Carbon::parse($tglMasuk)->locale('id')->isoFormat('D MMMM Y HH:mm:ss') : '-' }}</td>
                                </tr>
                                <tr>
                                    <td class="label">Tanggal Keluar</td><td class="colon">:</td>
                                    <td class="value">{{ $tglKeluar ? \Carbon\Carbon::parse($tglKeluar)->format('d M Y H:i:s') : '-' }}</td>
                                </tr>
                                <tr>
                                    <td class="label">Lama Rawat</td><td class="colon">:</td>
                                    <td class="value">
                                        @if ($item->tanggal_masuk && $item->tanggal_keluar)
                                            {{ \Carbon\Carbon::parse($item->tanggal_masuk)->diffInDays(\Carbon\Carbon::parse($item->tanggal_keluar)) + 1 }} Hari
                                        @else
                                            -
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Ruangan</td><td class="colon">:</td>
                                    <td class="value">
                                        {{ $item->ruangan ?? ($item->resume_type == 'rawat_jalan' ? 'Rawat Jalan' : ($item->resume_type == 'ugd' ? 'UGD' : 'Rawat Inap')) }}
                                    </td>
                                </tr>
                                <tr><td class="label">DPJP</td><td class="colon">:</td><td class="value">{{ $dokterNama }}</td></tr>
                            </table>
                        </td>
                    </tr>
                </table>

                {{-- SECTIONS --}}
                @php
                    $sections = [
                        ['Ringkasan Penyakit Sekarang', $item->riwayat_penyakit_sekarang ?? '-', $item->is_fiktif ?? false],
                        ['Ringkasan Penyakit Dahulu', $item->riwayat_penyakit_dahulu ?? '-', false],
                        ['Pemeriksaan Fisik', $item->pemeriksaan_fisik ?? '-', false],
                        ['Hasil Konsultasi', $item->hasil_konsultasi ?? 'Tidak ada hasil konsultasi', false],
                    ];
                @endphp

                @foreach ($sections as $i => [$title, $content, $fiktif])
                    <div class="result-section">
                        <h4>{{ $i + 1 }}. {{ $title }} @if ($fiktif) <span class="fiktif-indicator">FIKTIF</span> @endif</h4>
                        <div class="result-content">{{ $content }}</div>
                    </div>
                @endforeach

                {{-- BAGIAN LAINNYA (Diagnosa, Prosedur, Obat, Kondisi Pulang, Footer) --}}
                {{-- ... (sama seperti sebelumnya, tidak diubah fungsinya) --}}
            </div>
        @endforeach
    @else
        <div class="no-data">Tidak ada record {{ str_replace('_', ' ', $documentType) }} yang dipilih.</div>
    @endif
@endif

</body>

</html>
