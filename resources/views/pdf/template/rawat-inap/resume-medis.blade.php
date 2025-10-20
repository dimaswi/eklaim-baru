<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resume Medis - {{ $pengajuan->nomor_sep ?? '' }}</title>
    <style>
        body {
            font-family: 'halvetica', sans-serif;
            margin: 0;
            padding: 10px;
            font-size: 14px;
            line-height: 1.4;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 10px;
        }
        
        td, th {
            border: 1px solid #000;
            padding: 5px;
            vertical-align: top;
        }
        
        .header-row {
            background: black;
            color: white;
            text-align: center;
        }
        
        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            margin-right: 5px;
            text-align: center;
            vertical-align: middle;
        }
        
        .checkbox.checked::after {
            content: '✓';
            font-weight: bold;
        }
        
        .bold {
            font-weight: bold;
        }
        
        .input-field {
            border-bottom: 1px dotted #333;
            min-height: 20px;
            display: inline-block;
            width: 100%;
        }
        
        .text-center {
            text-align: center;
        }
        
        .logo {
            width: 50px;
            height: 50px;
        }
        
        h3 {
            margin: 0;
            padding: 5px 0;
        }
        
        .clinic-info {
            line-height: 1.2;
        }
        
        .clinic-info h3 {
            font-size: 20px;
            text-align: left;
            margin: 0;
        }
        
        .clinic-info p {
            font-size: 12px;
            text-align: left;
            margin: 0;
        }
        
        .diagnosa-list {
            padding: 5px;
            border: 1px dashed #ccc;
            min-height: 40px;
            background-color: #f9f9f9;
        }
        
        .diagnosa-item {
            display: inline-block;
            background-color: #e2e8f0;
            padding: 2px 6px;
            margin: 2px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .obat-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        
        .obat-table td, .obat-table th {
            border: 1px solid #000;
            padding: 3px;
            font-size: 12px;
        }
        
        .obat-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- KOP -->
    <table>
        <tbody>
            <tr>
                <td colspan="2" class="text-center">
                    <img src="{{ $kop ?? '' }}" alt="Logo Klinik" class="logo" />
                </td>
                <td colspan="4">
                    <div class="clinic-info">
                        <h3>KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h3>
                        <p>
                            Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro<br />
                            Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646<br />
                        </p>
                    </div>
                </td>
            </tr>
            <tr class="header-row">
                <td colspan="8">
                    <h3>RINGKASAN PULANG</h3>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Data Pasien -->
    <table>
        <tbody>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Nama Pasien :<br />
                    <span class="bold">{{ $savedData->nama ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    No. RM :<br />
                    <span class="bold">{{ $savedData->norm ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Tanggal Lahir :<br />
                    <span class="bold">{{ $savedData->tanggal_lahir ? \Carbon\Carbon::parse($savedData->tanggal_lahir)->locale('id')->isoFormat('D MMMM Y') : '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Jenis Kelamin :<br />
                    <span class="bold">
                        @php
                            $jk = $savedData->jenis_kelamin ?? '';
                            if(in_array($jk, [1, '1', 'L', 'Laki-laki'])) {
                                echo 'Laki-laki';
                            } elseif(in_array($jk, [2, '2', 'P', 'Perempuan'])) {
                                echo 'Perempuan';
                            } else {
                                echo '-';
                            }
                        @endphp
                    </span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Tanggal Masuk :<br />
                    <span class="bold">{{ $savedData->tanggal_masuk ? \Carbon\Carbon::parse($savedData->tanggal_masuk)->locale('id')->isoFormat('D MMMM Y HH:mm') : '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Tanggal Keluar :<br />
                    <span class="bold">{{ $savedData->tanggal_keluar ? \Carbon\Carbon::parse($savedData->tanggal_keluar)->locale('id')->isoFormat('D MMMM Y HH:mm') : '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Lama Dirawat :<br />
                    <span class="bold">
                        @php
                            if($savedData->tanggal_masuk && $savedData->tanggal_keluar) {
                                $masuk = \Carbon\Carbon::parse($savedData->tanggal_masuk);
                                $keluar = \Carbon\Carbon::parse($savedData->tanggal_keluar);
                                $lama = $masuk->diffInDays($keluar);
                                echo $lama . ' hari';
                            } else {
                                echo '-';
                            }
                        @endphp
                    </span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Ruang Rawat Terakhir :<br />
                    <span class="bold">{{ $savedData->ruangan ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="4" style="width: 400px;">
                    Penanggung Jawab :<br />
                    <span class="bold">{{ $savedData->penanggung_jawab ?? '-' }}</span>
                </td>
                <td colspan="4" style="width: 400px;">
                    Indikasi Rawat Inap :<br />
                    <span class="bold">{{ $savedData->indikasi_rawat_inap ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Data Medis -->
    <table>
        <tbody>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Ringkasan Riwayat Penyakit <span style="color: red;">*</span> :
                </td>
                <td colspan="6" style="width: 600px;">
                    Riwayat Penyakit Sekarang :<br />
                    <span class="bold">{{ $savedData->riwayat_penyakit_sekarang ?? '-' }}</span>
                    <br /><br />
                    Riwayat Penyakit Dahulu :<br />
                    <span class="bold">{{ $savedData->riwayat_penyakit_dahulu ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Pemeriksaan Fisik <span style="color: red;">*</span> :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->pemeriksaan_fisik ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Hasil Konsultasi <span style="color: red;">*</span> :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->hasil_konsultasi ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Diagnosa <span style="color: red;">*</span> :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="diagnosa-list">
                        @if($savedData->selected_diagnosa && is_array($savedData->selected_diagnosa))
                            @foreach($savedData->selected_diagnosa as $diagnosa)
                                <span class="diagnosa-item">{{ $diagnosa['code'] ?? '' }}</span>
                            @endforeach
                        @else
                            -
                        @endif
                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Prosedur/Tindakan <span style="color: red;">*</span> :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="diagnosa-list">
                        @if($savedData->selected_procedures && is_array($savedData->selected_procedures))
                            @foreach($savedData->selected_procedures as $procedure)
                                <span class="diagnosa-item">{{ $procedure['code'] ?? '' }}</span>
                            @endforeach
                        @else
                            -
                        @endif
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Tanda Vital -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>TANDA VITAL</h3>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Keadaan Umum :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->tanda_vital_keadaan_umum ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Kesadaran :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->tanda_vital_kesadaran ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Tekanan Darah :
                </td>
                <td colspan="2" style="width: 200px;">
                    Sistole: <span class="bold">{{ $savedData->tanda_vital_sistolik ?? '-' }}</span> mmHg
                </td>
                <td colspan="2" style="width: 200px;">
                    Diastole: <span class="bold">{{ $savedData->tanda_vital_distolik ?? '-' }}</span> mmHg
                </td>
                <td colspan="2" style="width: 200px;">
                    Nadi: <span class="bold">{{ $savedData->tanda_vital_frekuensi_nadi ?? '-' }}</span> x/mnt
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Pernafasan :
                </td>
                <td colspan="2" style="width: 200px;">
                    <span class="bold">{{ $savedData->tanda_vital_frekuensi_nafas ?? '-' }}</span> x/mnt
                </td>
                <td colspan="2" style="width: 200px;">
                    Suhu: <span class="bold">{{ $savedData->tanda_vital_suhu ?? '-' }}</span> °C
                </td>
                <td colspan="2" style="width: 200px;">
                    SpO2: <span class="bold">{{ $savedData->tanda_vital_saturasi_o2 ?? '-' }}</span> %
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    GCS :
                </td>
                <td colspan="2" style="width: 200px;">
                    E: <span class="bold">{{ $savedData->tanda_vital_eye ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    M: <span class="bold">{{ $savedData->tanda_vital_motorik ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    V: <span class="bold">{{ $savedData->tanda_vital_verbal ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Total GCS :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->tanda_vital_gcs ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Keadaan Keluar -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>KEADAAN WAKTU KELUAR</h3>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Cara Keluar :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->cara_keluar ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Keadaan Keluar :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->keadaan_keluar ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Jadwal Kontrol -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>JADWAL KONTROL</h3>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Tanggal :
                </td>
                <td colspan="2" style="width: 200px;">
                    <span class="bold">{{ $savedData->jadwal_kontrol_tanggal ? \Carbon\Carbon::parse($savedData->jadwal_kontrol_tanggal)->locale('id')->isoFormat('D MMMM Y') : '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Jam :
                </td>
                <td colspan="2" style="width: 200px;">
                    <span class="bold">{{ $savedData->jadwal_kontrol_jam ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Tujuan :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->jadwal_kontrol_tujuan ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    No. BPJS :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->jadwal_kontrol_nomor_bpjs ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Resep Pulang -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>RESEP PULANG</h3>
                </td>
            </tr>
            <tr>
                <td colspan="8">
                    @if($savedData->resep_pulang && is_array($savedData->resep_pulang) && count($savedData->resep_pulang) > 0)
                        <table class="obat-table">
                            <thead>
                                <tr>
                                    <th style="width: 5%;">No</th>
                                    <th style="width: 35%;">Nama Obat</th>
                                    <th style="width: 15%;">Frekuensi</th>
                                    <th style="width: 10%;">Jumlah</th>
                                    <th style="width: 35%;">Cara Pemberian</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($savedData->resep_pulang as $index => $resep)
                                <tr>
                                    <td class="text-center">{{ $index + 1 }}</td>
                                    <td>{{ $resep['nama_obat'] ?? '-' }}</td>
                                    <td class="text-center">{{ $resep['frekuensi'] ?? '-' }}</td>
                                    <td class="text-center">{{ $resep['jumlah'] ?? '-' }}</td>
                                    <td>{{ $resep['cara_pemberian'] ?? '-' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @else
                        <div style="text-align: center; padding: 20px; font-style: italic; color: #666;">
                            Tidak ada resep pulang
                        </div>
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Petugas -->
    <table>
        <tbody>
            <tr>
                <td colspan="4" style="width: 400px; text-align: center;">
                    Dokter Penanggung Jawab<br /><br /><br /><br />
                    <span class="bold">{{ $savedData->dokter ?? '.........................' }}</span>
                </td>
                <td colspan="4" style="width: 400px; text-align: center;">
                    Petugas<br /><br /><br /><br />
                    <span class="bold">{{ $savedData->petugas ?? '.........................' }}</span>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>