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

    @if ($data && $data->count() > 0)
    @php
        // Ambil record yang dipilih
        $resumeMedis = data_get($selectedRecords, 'resume_medis', []);
        print_r($selectedRecords);
    @endphp

    @if (!empty($resumeMedis))
        @php
            // Filter data yang sesuai dengan selected resume
            $selectedItems = $data->filter(fn($item) => in_array((string)$item->id, array_map('strval', $resumeMedis)));
            $totalItems = $selectedItems->count();
            $recordCount = 0;
        @endphp

        @foreach ($selectedItems as $item)
            @php $recordCount++; @endphp

            <div class="resume-report">
                {{-- Header --}}
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
                                <div class="hospital-name">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</div>
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

                {{-- Data Pasien --}}
                <table class="patient-info-table">
                    <tr>
                        <td class="patient-left-cell">
                            <table class="patient-details">
                                <tr><td class="label">Nama Pasien</td><td class="colon">:</td><td class="value">{{ $item->nama ?? $pengajuanKlaim->nama_peserta }}</td></tr>
                                <tr><td class="label">Nomor RM</td><td class="colon">:</td><td class="value">{{ $item->norm ?? $pengajuanKlaim->nomor_kartu }}</td></tr>
                                <tr>
                                    <td class="label">Tanggal Lahir</td><td class="colon">:</td>
                                    <td class="value">
                                        @php
                                            $tglLahir = $item->tanggal_lahir ?? $pengajuanKlaim->tanggal_lahir ?? null;
                                        @endphp
                                        {{ !empty($tglLahir) ? \Carbon\Carbon::parse($tglLahir)->locale('id')->isoFormat('D MMMM Y') : '-' }}
                                    </td>
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
                                    <td class="value">
                                        @php
                                            $tglMasuk = $item->tanggal_masuk ?? $pengajuanKlaim->tanggal_sep ?? null;
                                        @endphp
                                        {{ !empty($tglMasuk) ? \Carbon\Carbon::parse($tglMasuk)->locale('id')->isoFormat('D MMMM Y HH:mm:ss') : '-' }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Tanggal Keluar</td><td class="colon">:</td>
                                    <td class="value">
                                        @php $tglKeluar = $item->tanggal_keluar ?? null; @endphp
                                        {{ !empty($tglKeluar) ? \Carbon\Carbon::parse($tglKeluar)->format('d M Y H:i:s') : '-' }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Lama Rawat</td><td class="colon">:</td>
                                    <td class="value">
                                        @if (!empty($item->tanggal_masuk) && !empty($item->tanggal_keluar))
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
                                <tr>
                                    <td class="label">DPJP</td><td class="colon">:</td>
                                    <td class="value">{{ $item->dokter ?? ($pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                {{-- Ringkasan --}}
                <div class="section-group">
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
                            <h4>{{ $i + 1 }}. {{ $title }}
                                @if ($fiktif)
                                    <span class="fiktif-indicator">FIKTIF</span>
                                @endif
                            </h4>
                            <div class="result-content">{{ $content }}</div>
                        </div>
                    @endforeach
                </div>

                {{-- Tanda Vital --}}
                <div class="result-section">
                    <h4>5. Tanda Vital</h4>
                    <table class="vital-table">
                        <tr>
                            <th>Keadaan Umum</th><th>Kesadaran</th><th>TD (mmHg)</th><th>Nadi</th><th>RR</th><th>Suhu</th><th>SpO₂</th><th>GCS</th>
                        </tr>
                        <tr>
                            <td>{{ $item->tanda_vital_keadaan_umum ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_kesadaran ?? '-' }}</td>
                            <td>{{ ($item->tanda_vital_sistolik ?? '-') . '/' . ($item->tanda_vital_distolik ?? '-') }}</td>
                            <td>{{ $item->tanda_vital_frekuensi_nadi ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_frekuensi_nafas ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_suhu ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_saturasi_o2 ?? '-' }}</td>
                            <td>
                                {{ isset($item->tanda_vital_gcs)
                                    ? $item->tanda_vital_gcs
                                    : (($item->tanda_vital_eye ?? 0) + ($item->tanda_vital_motorik ?? 0) + ($item->tanda_vital_verbal ?? 0)) }}
                            </td>
                        </tr>
                    </table>
                </div>

                {{-- Diagnosa --}}
                @php
                    $diagnosaData = collect($item->selected_diagnosa ?? json_decode($item->diagnosa_icd10 ?? '[]', true) ?? [])
                        ->filter(fn($d) => is_array($d) && !empty($d));
                    if ($diagnosaData->isEmpty()) {
                        $diagnosaData = collect([['kode' => 'I10', 'nama' => 'Essential (primary) hypertension', 'tipe' => 'Primer']]);
                    }
                @endphp

                <div class="result-section">
                    <h4>6. Diagnosa</h4>
                    <table class="data-table">
                        <tr><th>No</th><th>Kode ICD 10</th><th>Diagnosa</th><th>Tipe</th></tr>
                        @foreach ($diagnosaData as $i => $d)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>{{ $d['kode'] ?? $d['code'] ?? '-' }}</td>
                                <td>{{ $d['nama'] ?? $d['description'] ?? $d['name'] ?? '-' }}</td>
                                <td>{{ $d['tipe'] ?? $d['type'] ?? 'Primer' }}</td>
                            </tr>
                        @endforeach
                    </table>
                </div>

                {{-- Prosedur --}}
                @php
                    $prosedurData = collect($item->selected_procedures ?? json_decode($item->prosedur_icd9 ?? '[]', true) ?? []);
                @endphp

                <div class="result-section">
                    <h4>7. Prosedur</h4>
                    <table class="data-table">
                        <tr><th>No</th><th>Kode ICD 9</th><th>Nama Prosedur</th><th>Tipe</th></tr>
                        @forelse ($prosedurData as $i => $p)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>{{ $p['kode'] ?? $p['code'] ?? '-' }}</td>
                                <td>{{ $p['nama'] ?? $p['description'] ?? $p['name'] ?? '-' }}</td>
                                <td>{{ $p['tipe'] ?? $p['type'] ?? '-' }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="4" class="text-center text-muted">Tidak ada prosedur</td></tr>
                        @endforelse
                    </table>
                </div>

                {{-- Terapi Pulang --}}
                @php
                    $obatData = collect($item->resep_pulang ?? json_decode($item->obat_pulang ?? '[]', true) ?? []);
                @endphp

                <div class="result-section">
                    <h4>8. Terapi Pulang</h4>
                    <table class="med-table">
                        <tr><th>No</th><th>Nama Obat</th><th>Frekuensi</th><th>Cara Pemberian</th><th>Jumlah</th></tr>
                        @foreach ($obatData as $i => $o)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>{{ $o['nama_obat'] ?? $o['nama'] ?? $o['name'] ?? '-' }}</td>
                                <td>{{ $o['frekuensi'] ?? '-' }}</td>
                                <td>{{ $o['cara_pemberian'] ?? '-' }}</td>
                                <td>{{ $o['jumlah'] ?? '-' }}</td>
                            </tr>
                        @endforeach
                    </table>
                </div>

                {{-- Kondisi Pulang --}}
                <div class="result-section">
                    <h4>9. Kondisi Pulang</h4>
                    <table class="form-table">
                        <tr>
                            <td class="info-label">Keadaan Umum</td><td class="info-value">{{ $item->keadaan_umum_pulang ?? 'BAIK' }}</td>
                            <td class="info-label">Cara Pulang</td><td class="info-value">{{ $item->cara_pulang ?? 'Pulang atas persetujuan dokter' }}</td>
                        </tr>
                    </table>
                    <table class="form-table" style="margin-top:8px;">
                        <tr>
                            <td class="info-label" style="width:150px;">Tanda Vital Pulang</td>
                            <td class="info-value">
                                <div style="display:flex;flex-wrap:wrap;gap:15px;">
                                    <span>TD: {{ $item->td_pulang ?? '120/80' }} mmHg</span>
                                    <span>Nadi: {{ $item->nadi_pulang ?? '88' }} x/menit</span>
                                    <span>RR: {{ $item->rr_pulang ?? '20' }} x/menit</span>
                                    <span>Suhu: {{ $item->suhu_pulang ?? '36.5' }} °C</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                {{-- Footer (Petugas & Dokter) --}}
                @php
                    $tanggalTtd = \Carbon\Carbon::parse($item->tanggal_keluar ?? $item->created_at)->format('d F Y');
                    $petugasNama = $item->petugas ?? '';
                    $dokterNama = $item->dokter ?? ($pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD');
                    $petugasQR = $dokterQR = null;

                    try {
                        if (class_exists('\App\Helpers\QRCodeHelper')) {
                            if ($petugasNama) {
                                $petugasQR = \App\Helpers\QRCodeHelper::generateForStaff($petugasNama, 'Petugas Medis');
                            }
                            $dokterQR = \App\Helpers\QRCodeHelper::generateForStaff($dokterNama, 'Dokter Penanggung Jawab');
                        }
                    } catch (\Exception $e) {
                        error_log('QR Code generation failed: ' . $e->getMessage());
                    }
                @endphp

                <table class="footer-table">
                    <tr>
                        <td class="footer-left-cell">
                            <div class="date-location">BOJONEGORO, {{ $tanggalTtd }}</div>
                            <div class="petugas-radio">Petugas</div>
                            <div style="margin:40px 0 10px;">
                                @if ($petugasQR)
                                    <img src="{{ $petugasQR }}" style="width:50px;height:50px;" alt="QR Code Petugas">
                                @else
                                    <div class="qr-placeholder">[QR Code]</div>
                                @endif
                            </div>
                            <div class="petugas-name">{{ $petugasNama ?: '( ............................ )' }}</div>
                        </td>

                        <td class="footer-right-cell">
                            <div class="date-location">BOJONEGORO, {{ $tanggalTtd }}</div>
                            <div class="doctor-title">Dokter Penanggung Jawab</div>
                            <div style="margin:40px 0 10px;">
                                @if ($dokterQR)
                                    <img src="{{ $dokterQR }}" style="width:50px;height:50px;" alt="QR Code Dokter">
                                @else
                                    <div class="qr-placeholder">[QR Code]</div>
                                @endif
                            </div>
                            <div class="doctor-name">{{ $dokterNama }}</div>
                        </td>
                    </tr>
                </table>

                @if ($item->is_fiktif ?? false)
                    <div class="fiktif-watermark">DATA FIKTIF</div>
                @endif
            </div>
        @endforeach
    @else
        <div class="no-data">Tidak ada record resume medis yang dipilih.</div>
    @endif
@endif
</body>

</html>
