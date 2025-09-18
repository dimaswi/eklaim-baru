<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Pengkajian Awal - {{ $pengajuanKlaim->nomor_sep }}</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
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

        /* Pengkajian Awal Specific Styles */
        .pengkajian-report {
            width: 100%;
            max-width: 180mm;
            padding: 15px;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
        }

        .pengkajian-report:last-child {
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

        .document-title {
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

        .section {
            margin-bottom: 15px;
            border: 1px solid #ccc;
            padding: 10px;
            background-color: #fafafa;
        }

        .section h4 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
            background-color: #e8e8e8;
            padding: 4px 8px;
            margin: -10px -10px 8px -10px;
        }

        .section-content {
            font-size: 10px;
            line-height: 1.4;
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

        /* Physical Exam Table */
        .physexam-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border: 1px solid #000;
        }

        .physexam-table th,
        .physexam-table td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 10px;
            text-align: left;
        }

        .physexam-table th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
            width: 25%;
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

        .doctor-name {
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

        .checkbox-group {
            display: inline-block;
            margin-right: 15px;
            font-size: 10px;
        }

        .checkbox {
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            display: inline-block;
            margin-right: 5px;
            text-align: center;
            line-height: 10px;
            font-size: 10px;
        }

        .checked {
            background-color: #000;
            color: white;
        }

        .two-column {
            display: table;
            width: 100%;
        }

        .left-column,
        .right-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 10px;
        }

        .right-column {
            padding-right: 0;
            padding-left: 10px;
        }

        .left-column,
        .right-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 10px;
        }

        .right-column {
            padding-right: 0;
            padding-left: 10px;
        }
    </style>
</head>

<body>
    @php
        $recordCount = 0;
    @endphp

@if ($data && $data->count() > 0 && !empty($selectedRecords['pengkajian_awal'] ?? []))
    @php
        $selectedItems = $data->filter(function($item) use ($selectedRecords) {
            return in_array((string)$item->id, $selectedRecords['pengkajian_awal'] ?? []);
        });
        $totalItems = $selectedItems->count();
        $currentIndex = 0;
    @endphp
    
    @foreach ($selectedItems as $item)
        @php 
            $currentIndex++; 
            $recordCount++; 
        @endphp
            <div class="pengkajian-report">
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
                        PENGKAJIAN AWAL KEPERAWATAN
                        @if (str_contains(get_class($item), 'RawatInap'))
                            <br><small style="font-size: 11px;">RAWAT INAP</small>
                        @elseif (str_contains(get_class($item), 'RawatJalan'))
                            <br><small style="font-size: 11px;">RAWAT JALAN</small>
                        @elseif (str_contains(get_class($item), 'UGD'))
                            <br><small style="font-size: 11px;">UNIT GAWAT DARURAT</small>
                        @endif
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
                                    <td class="value">{{ $item->nama ?? $pengajuanKlaim->nama_peserta }}</td>
                                </tr>
                                <tr>
                                    <td class="label">Nomor RM</td>
                                    <td class="colon">:</td>
                                    <td class="value">{{ $item->norm ?? $pengajuanKlaim->nomor_kartu }}</td>
                                </tr>
                                <tr>
                                    <td class="label">Tanggal Lahir</td>
                                    <td class="colon">:</td>
                                    <td class="value">
                                        {{ $item->tanggal_lahir ? \Carbon\Carbon::parse($item->tanggal_lahir)->locale('id')->isoFormat('D MMMM Y') : ($pengajuanKlaim->tanggal_lahir ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_lahir)->locale('id')->isoFormat('D MMMM Y') : '-') }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Jenis Kelamin</td>
                                    <td class="colon">:</td>
                                    <td class="value">
                                        {{ $item->jenis_kelamin ?? ($pengajuanKlaim->jenis_kelamin == 'L' ? 'Laki-laki' : ($pengajuanKlaim->jenis_kelamin == 'P' ? 'Perempuan' : '-')) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Alamat</td>
                                    <td class="colon">:</td>
                                    <td class="value">{{ $item->alamat ?? ($pengajuanKlaim->alamat ?? '-') }}</td>
                                </tr>
                            </table>
                        </td>
                        <td class="patient-right-cell">
                            <table class="patient-details">
                                <tr>
                                    <td class="label">Tanggal Masuk</td>
                                    <td class="colon">:</td>
                                    <td class="value">
                                        {{ $item->tanggal_masuk ? \Carbon\Carbon::parse($item->tanggal_masuk)->locale('id')->isoFormat('D MMMM Y HH:mm:ss') : ($pengajuanKlaim->tanggal_sep ? \Carbon\Carbon::parse($pengajuanKlaim->tanggal_sep)->locale('id')->isoFormat('D MMMM Y HH:mm:ss') : '-') }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Ruangan</td>
                                    <td class="colon">:</td>
                                    <td class="value">
                                        {{ $item->ruangan ?? (str_contains(get_class($item), 'RawatJalan') ? 'Rawat Jalan' : (str_contains(get_class($item), 'UGD') ? 'UGD' : 'Rawat Inap')) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">DPJP</td>
                                    <td class="colon">:</td>
                                    <td class="value">
                                        {{ $pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD' }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                {{-- Anamnesis Section --}}
                <div class="section">
                    <h4>A. ANAMNESIS</h4>
                    <div class="section-content">
                        <div style="margin-bottom: 10px;">
                            <strong>Diperoleh dari:</strong>
                            <div class="checkbox-group">
                                <span class="checkbox {{ ($item->autoanamnesis ?? false) ? 'checked' : '' }}">{{ ($item->autoanamnesis ?? false) ? '✓' : '' }}</span>
                                Autoanamnesis
                            </div>
                            <div class="checkbox-group">
                                <span class="checkbox {{ ($item->alloanamnesis ?? false) ? 'checked' : '' }}">{{ ($item->alloanamnesis ?? false) ? '✓' : '' }}</span>
                                Alloanamnesis dari: {{ $item->anamnesis_dari ?? '-' }}
                            </div>
                        </div>

                        <table class="form-table" style="margin-top: 10px;">
                            <tr>
                                <td class="info-label">Keluhan Utama</td>
                                <td class="info-value">{{ $item->keluhan_utama ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Riwayat Penyakit Sekarang</td>
                                <td class="info-value">{{ $item->riwayat_penyakit_sekarang ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Riwayat Penyakit Dahulu</td>
                                <td class="info-value">{{ $item->riwayat_penyakit_dahulu ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Faktor Risiko</td>
                                <td class="info-value">{{ $item->faktor_resiko ?? 'Tidak ada faktor risiko yang teridentifikasi' }}</td>
                            </tr>
                            @if (isset($item->riwayat_alergi))
                                <tr>
                                    <td class="info-label">Riwayat Alergi</td>
                                    <td class="info-value">{{ $item->riwayat_alergi ?? '-' }}</td>
                                </tr>
                            @endif
                        </table>
                    </div>
                </div>

                {{-- Tanda Vital Section --}}
                <div class="section">
                    <h4>B. TANDA-TANDA VITAL</h4>
                    <table class="vital-table">
                        <tr>
                            <th>Keadaan Umum</th>
                            <th>Kesadaran</th>
                            <th>TD (mmHg)</th>
                            <th>Nadi (x/mnt)</th>
                            <th>RR (x/mnt)</th>
                            <th>Suhu (°C)</th>
                            <th>SpO2 (%)</th>
                            <th>GCS</th>
                        </tr>
                        <tr>
                            <td>{{ $item->tanda_vital_keadaan_umum ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_kesadaran ?? '-' }}</td>
                            <td>{{ ($item->tanda_vital_sistolik ?? '-') . '/' . ($item->tanda_vital_distolik ?? '-') }}</td>
                            <td>{{ $item->tanda_vital_frekuensi_nadi ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_frekuensi_nafas ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_suhu ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_saturasi_o2 ?? '-' }}</td>
                            <td>{{ $item->tanda_vital_gcs ?? (($item->tanda_vital_eye ?? 0) + ($item->tanda_vital_motorik ?? 0) + ($item->tanda_vital_verbal ?? 0)) }}</td>
                        </tr>
                    </table>
                </div>

                {{-- Pemeriksaan Fisik Section --}}
                <div class="section">
                    <h4>C. PEMERIKSAAN FISIK</h4>
                    <table class="physexam-table">
                        <tr>
                            <th>Mata</th>
                            <td>{{ $item->mata ?? '-' }}
                                @if (isset($item->pupil))
                                    <br><strong>Pupil:</strong> {{ $item->pupil ?? '-' }}
                                @endif
                                @if (isset($item->diameter_pupil))
                                    <br><strong>Diameter:</strong> {{ $item->diameter_pupil ?? '-' }}
                                @endif
                            </td>
                            <th>THT</th>
                            <td>{{ $item->tht ?? '-' }}
                                @if (isset($item->faring))
                                    <br><strong>Faring:</strong> {{ $item->faring ?? '-' }}
                                @endif
                                @if (isset($item->tongsil))
                                    <br><strong>Tonsil:</strong> {{ $item->tongsil ?? '-' }}
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <th>Leher</th>
                            <td>{{ $item->leher ?? '-' }}
                                @if (isset($item->jvp))
                                    <br><strong>JVP:</strong> {{ $item->jvp ?? '-' }}
                                @endif
                            </td>
                            <th>Thoraks</th>
                            <td>{{ $item->thoraks ?? '-' }}</td>
                        </tr>
                        <tr>
                            <th>Cor</th>
                            <td>{{ $item->cor ?? '-' }}
                                @if (isset($item->s1s2))
                                    <br><strong>S1S2:</strong> {{ $item->s1s2 ?? '-' }}
                                @endif
                                @if (isset($item->mur_mur))
                                    <br><strong>Murmur:</strong> {{ $item->mur_mur ?? '-' }}
                                @endif
                            </td>
                            <th>Pulmo</th>
                            <td>{{ $item->pulmo ?? '-' }}
                                @if (isset($item->ronchi))
                                    <br><strong>Ronchi:</strong> {{ $item->ronchi ?? '-' }}
                                @endif
                                @if (isset($item->wheezing))
                                    <br><strong>Wheezing:</strong> {{ $item->wheezing ?? '-' }}
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <th>Abdomen</th>
                            <td>{{ $item->abdomen ?? '-' }}
                                @if (isset($item->meteorismus))
                                    <br><strong>Meteorismus:</strong> {{ $item->meteorismus ?? '-' }}
                                @endif
                                @if (isset($item->asites))
                                    <br><strong>Asites:</strong> {{ $item->asites ?? '-' }}
                                @endif
                                @if (isset($item->hepar))
                                    <br><strong>Hepar:</strong> {{ $item->hepar ?? '-' }}
                                @endif
                                @if (isset($item->lien))
                                    <br><strong>Lien:</strong> {{ $item->lien ?? '-' }}
                                @endif
                            </td>
                            <th>Extremitas</th>
                            <td>{{ $item->extremitas ?? '-' }}
                                @if (isset($item->udem))
                                    <br><strong>Udem:</strong> {{ $item->udem ?? '-' }}
                                @endif
                            </td>
                        </tr>
                        @if (isset($item->lainnya))
                            <tr>
                                <th>Lain-lain</th>
                                <td colspan="3">{{ $item->lainnya ?? '-' }}</td>
                            </tr>
                        @endif
                    </table>
                </div>

                {{-- Penilaian Nyeri Section --}}
                @if (isset($item->nyeri) || isset($item->skala_nyeri))
                    <div class="section">
                        <h4>D. PENILAIAN NYERI</h4>
                        <table class="form-table">
                            <tr>
                                <td class="info-label">Nyeri</td>
                                <td class="info-value">{{ $item->nyeri ?? '-' }}</td>
                                <td class="info-label">Skala Nyeri</td>
                                <td class="info-value">{{ $item->skala_nyeri ?? '-' }}/10</td>
                            </tr>
                            <tr>
                                <td class="info-label">Lokasi</td>
                                <td class="info-value">{{ $item->lokasi_nyeri ?? '-' }}</td>
                                <td class="info-label">Onset</td>
                                <td class="info-value">{{ $item->onset ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Pencetus</td>
                                <td class="info-value">{{ $item->pencetus ?? '-' }}</td>
                                <td class="info-label">Durasi</td>
                                <td class="info-value">{{ $item->durasi_nyeri ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Gambaran Nyeri</td>
                                <td class="info-value">{{ $item->gambaran_nyeri ?? '-' }}</td>
                                <td class="info-label">Metode</td>
                                <td class="info-value">{{ $item->metode_nyeri ?? '-' }}</td>
                            </tr>
                        </table>
                    </div>
                @endif

                {{-- Assessment Section --}}
                <div class="section">
                    <h4>E. ASSESSMENT</h4>
                    <table class="form-table">
                        <tr>
                            <td class="info-label">Masalah Medis</td>
                            <td class="info-value">{{ $item->masalah_medis ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="info-label">Diagnosis Medis</td>
                            <td class="info-value">{{ $item->diagnosis_medis ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="info-label">Rencana Terapi</td>
                            <td class="info-value">{{ $item->rencana_terapi ?? '-' }}</td>
                        </tr>
                    </table>

                    {{-- Selected Diagnosa --}}
                    @if (isset($item->selected_diagnosa))
                        @php
                            $diagnosaData = [];
                            if (is_string($item->selected_diagnosa)) {
                                $diagnosaData = json_decode($item->selected_diagnosa, true) ?? [];
                            } elseif (is_array($item->selected_diagnosa)) {
                                $diagnosaData = $item->selected_diagnosa;
                            }
                        @endphp

                        @if (!empty($diagnosaData))
                            <div style="margin-top: 10px;">
                                <strong>Diagnosa Keperawatan:</strong>
                                <table class="data-table" style="margin-top: 5px;">
                                    <tr>
                                        <th style="width: 8%;">No</th>
                                        <th style="width: 15%;">Kode</th>
                                        <th style="width: 77%;">Diagnosa</th>
                                    </tr>
                                    @foreach ($diagnosaData as $index => $diagnosa)
                                        <tr>
                                            <td style="text-align: center;">{{ $index + 1 }}</td>
                                            <td style="text-align: center;">{{ $diagnosa['code'] ?? $diagnosa['kode'] ?? '-' }}</td>
                                            <td>{{ $diagnosa['name'] ?? $diagnosa['nama'] ?? '-' }}</td>
                                        </tr>
                                    @endforeach
                                </table>
                            </div>
                        @endif
                    @endif
                </div>

                {{-- Footer with Signatures --}}
                <table class="footer-table">
                    <tr>
                        <td class="footer-left-cell">
                            <div class="date-location">BOJONEGORO, {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM Y') }}</div>
                            <div style="margin-top: 10px; font-weight: bold;">Perawat</div>
                            
                            @php
                                $petugasNama = $item->petugas ?? '';
                                $petugasQR = null;

                                if (!empty($petugasNama)) {
                                    try {
                                        if (class_exists('\App\Helpers\QRCodeHelper')) {
                                            $petugasQR = \App\Helpers\QRCodeHelper::generateForStaff(
                                                $petugasNama,
                                                'Perawat',
                                            );
                                        }
                                    } catch (\Exception $e) {
                                        // Log error dan lanjutkan tanpa QR
                                        error_log('QR Code generation failed: ' . $e->getMessage());
                                        $petugasQR = null;
                                    }
                                }
                            @endphp
                            
                            <div style="margin: 40px 0 10px;">
                                @if ($petugasQR)
                                    <img src="{{ $petugasQR }}" style="width: 50px; height: 50px;" alt="QR Code Perawat">
                                @else
                                    <div class="qr-placeholder">[QR Code]</div>
                                @endif
                            </div>
                            <div class="doctor-name">{{ $petugasNama ?: '( ............................ )' }}</div>
                        </td>
                        <td class="footer-right-cell">
                            <div class="date-location">BOJONEGORO, {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM Y') }}</div>
                            <div class="doctor-title">Dokter Penanggung Jawab</div>
                            
                            @php
                                $dokterNama = $item->dokter ?? ($pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD');
                                $dokterQR = null;

                                try {
                                    if (class_exists('\App\Helpers\QRCodeHelper')) {
                                        $dokterQR = \App\Helpers\QRCodeHelper::generateForStaff(
                                            $dokterNama,
                                            'Dokter Penanggung Jawab',
                                        );
                                    }
                                } catch (\Exception $e) {
                                    // Log error dan lanjutkan tanpa QR
                                    error_log('QR Code generation failed: ' . $e->getMessage());
                                    $dokterQR = null;
                                }
                            @endphp
                            
                            <div style="margin: 40px 0 10px;">
                                @if ($dokterQR)
                                    <img src="{{ $dokterQR }}" style="width: 50px; height: 50px;" alt="QR Code Dokter">
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
        <div class="no-data">
            Tidak ada record pengkajian awal yang dipilih.
        </div>
    @endif
</body>

</html>
