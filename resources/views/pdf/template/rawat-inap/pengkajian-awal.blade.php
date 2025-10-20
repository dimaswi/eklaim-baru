<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pengkajian Awal - {{ $pengajuan->nomor_sep ?? '' }}</title>
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
                    <h3>PENGKAJIAN AWAL</h3>
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
                    Jam Masuk :<br />
                    <span class="bold">{{ $savedData->tanggal_masuk ? \Carbon\Carbon::parse($savedData->tanggal_masuk)->locale('id')->isoFormat('D MMMM Y HH:mm') : '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Jam Keluar :<br />
                    <span class="bold">{{ $savedData->tanggal_keluar ? \Carbon\Carbon::parse($savedData->tanggal_keluar)->locale('id')->isoFormat('D MMMM Y HH:mm') : '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Alamat :<br />
                    <span class="bold">{{ $savedData->alamat ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Ruangan :<br />
                    <span class="bold">{{ $savedData->ruangan ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Anamnesa :
                </td>
                <td colspan="2" style="width: 200px;">
                    <div class="checkbox {{ ($savedData->autoanamnesis ?? false) ? 'checked' : '' }}"></div>
                    <span class="bold">Autoanamnesis</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    <div class="checkbox {{ ($savedData->alloanamnesis ?? false) ? 'checked' : '' }}"></div>
                    <span class="bold">Alloanamnesis</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Dari :<br />
                    <span class="bold">{{ $savedData->anamnesis_dari ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Keluhan Utama :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->keluhan_utama ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Riwayat Penyakit Sekarang :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->riwayat_penyakit_sekarang ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Faktor Resiko :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->faktor_resiko ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Riwayat Penyakit Keluarga :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->riwayat_penyakit_keluarga ?? '-' }}</span>
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

    <!-- Pemeriksaan Fisik -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>PEMERIKSAAN FISIK</h3>
                </td>
            </tr>
            <tr>
                <td colspan="8">
                    <table style="width: 100%; border: none;">
                        <tr>
                            <td style="width: 25%; border: none; padding: 3px;">
                                Mata: <br />
                                <span class="bold">{{ $savedData->mata ?? '-' }}</span>
                            </td>
                            <td style="width: 25%; border: none; padding: 3px;">
                                Pupil: <br />
                                <span class="bold">{{ $savedData->pupil ?? '-' }}</span>
                            </td>
                            <td style="width: 25%; border: none; padding: 3px;">
                                Ikterus: <br />
                                <span class="bold">{{ $savedData->ikterus ?? '-' }}</span>
                            </td>
                            <td style="width: 25%; border: none; padding: 3px;">
                                Diameter Pupil: <br />
                                <span class="bold">{{ $savedData->diameter_pupil ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                Udem Palpebrae: <br />
                                <span class="bold">{{ $savedData->udem_palpebrae ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                THT: <br />
                                <span class="bold">{{ $savedData->tht ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Faring: <br />
                                <span class="bold">{{ $savedData->faring ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Tongsil: <br />
                                <span class="bold">{{ $savedData->tongsil ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                Lidah: <br />
                                <span class="bold">{{ $savedData->lidah ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Bibir: <br />
                                <span class="bold">{{ $savedData->bibir ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Leher: <br />
                                <span class="bold">{{ $savedData->leher ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                JVP: <br />
                                <span class="bold">{{ $savedData->jvp ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                Limfe: <br />
                                <span class="bold">{{ $savedData->limfe ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Kaku Kuduk: <br />
                                <span class="bold">{{ $savedData->kaku_kuduk ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Thoraks: <br />
                                <span class="bold">{{ $savedData->thoraks ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Cor: <br />
                                <span class="bold">{{ $savedData->cor ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                S1S2: <br />
                                <span class="bold">{{ $savedData->s1s2 ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Murmur: <br />
                                <span class="bold">{{ $savedData->mur_mur ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Pulmo: <br />
                                <span class="bold">{{ $savedData->pulmo ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Ronchi: <br />
                                <span class="bold">{{ $savedData->ronchi ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                Wheezing: <br />
                                <span class="bold">{{ $savedData->wheezing ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Peristaltik: <br />
                                <span class="bold">{{ $savedData->peristaltik ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Abdomen: <br />
                                <span class="bold">{{ $savedData->abdomen ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Meteorismus: <br />
                                <span class="bold">{{ $savedData->meteorismus ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                Asites: <br />
                                <span class="bold">{{ $savedData->asites ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Nyeri Tekan: <br />
                                <span class="bold">{{ $savedData->nyeri_tekan ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Hepar: <br />
                                <span class="bold">{{ $savedData->hepar ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Lien: <br />
                                <span class="bold">{{ $savedData->lien ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                Extremitas: <br />
                                <span class="bold">{{ $savedData->extremitas ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Udem: <br />
                                <span class="bold">{{ $savedData->udem ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Defekasi: <br />
                                <span class="bold">{{ $savedData->defeksesi ?? '-' }}</span>
                            </td>
                            <td style="border: none; padding: 3px;">
                                Urin: <br />
                                <span class="bold">{{ $savedData->urin ?? '-' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 3px;">
                                Kelainan: <br />
                                <span class="bold">{{ $savedData->kelainan ?? '-' }}</span>
                            </td>
                            <td colspan="3" style="border: none; padding: 3px;">
                                Lainnya: <br />
                                <span class="bold">{{ $savedData->lainnya ?? '-' }}</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Riwayat Alergi -->
    <table>
        <tbody>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Riwayat Alergi :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->riwayat_alergi ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Status Psikososial Spiritual -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>STATUS PSIKOSOSIAL SPIRITUAL</h3>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Status Psikologi :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->status_psikologi_tidak_ada_kelainan ?? false) ? 'checked' : '' }}"></div> Tidak ada kelainan
                    <div class="checkbox {{ ($savedData->status_psikologi_cemas ?? false) ? 'checked' : '' }}"></div> Cemas
                    <div class="checkbox {{ ($savedData->status_psikologi_takut ?? false) ? 'checked' : '' }}"></div> Takut<br />
                    <div class="checkbox {{ ($savedData->status_psikologi_marah ?? false) ? 'checked' : '' }}"></div> Marah
                    <div class="checkbox {{ ($savedData->status_psikologi_sedih ?? false) ? 'checked' : '' }}"></div> Sedih
                    <div class="checkbox {{ ($savedData->status_psikologi_kecenderungan_bunuh_diri ?? false) ? 'checked' : '' }}"></div> Kecenderungan Bunuh Diri<br />
                    <div class="checkbox {{ ($savedData->status_psikologi_lainnya ?? false) ? 'checked' : '' }}"></div> Lainnya: {{ $savedData->status_psikologi_lainnya_text ?? '-' }}
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Status Mental :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->status_mental_sadar_orientasi_baik ?? false) ? 'checked' : '' }}"></div> Sadar, Orientasi baik
                    <div class="checkbox {{ ($savedData->status_mental_ada_masalah_perilaku ?? false) ? 'checked' : '' }}"></div> Ada masalah perilaku<br />
                    Perilaku kekerasan: <span class="bold">{{ $savedData->status_mental_perilaku_kekerasan ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Hubungan dengan Keluarga :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->hubungan_keluarga_baik ?? false) ? 'checked' : '' }}"></div> Baik
                    <div class="checkbox {{ ($savedData->hubungan_keluarga_tidak_baik ?? false) ? 'checked' : '' }}"></div> Tidak baik
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Tempat Tinggal :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->tempat_tinggal_rumah ?? false) ? 'checked' : '' }}"></div> Rumah
                    <div class="checkbox {{ ($savedData->tempat_tinggal_panti ?? false) ? 'checked' : '' }}"></div> Panti
                    <div class="checkbox {{ ($savedData->tempat_tinggal_lainnya ?? false) ? 'checked' : '' }}"></div> Lainnya: {{ $savedData->tempat_tinggal_lainnya_text ?? '-' }}
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Agama :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->spiritual_agama_islam ?? false) ? 'checked' : '' }}"></div> Islam
                    <div class="checkbox {{ ($savedData->spiritual_agama_katolik ?? false) ? 'checked' : '' }}"></div> Katolik
                    <div class="checkbox {{ ($savedData->spiritual_agama_protestan ?? false) ? 'checked' : '' }}"></div> Protestan<br />
                    <div class="checkbox {{ ($savedData->spiritual_agama_hindu ?? false) ? 'checked' : '' }}"></div> Hindu
                    <div class="checkbox {{ ($savedData->spiritual_agama_budha ?? false) ? 'checked' : '' }}"></div> Buddha
                    <div class="checkbox {{ ($savedData->spiritual_agama_konghucu ?? false) ? 'checked' : '' }}"></div> Konghucu
                    <div class="checkbox {{ ($savedData->spiritual_agama_lain_lain ?? false) ? 'checked' : '' }}"></div> Lain-lain
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Kebiasaan Ibadah :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->spiritual_kebiasaan_berbadah_teratur_ya ?? false) ? 'checked' : '' }}"></div> Ya, teratur
                    <div class="checkbox {{ ($savedData->spiritual_kebiasaan_berbadah_teratur_tidak ?? false) ? 'checked' : '' }}"></div> Tidak teratur
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Nilai Kepercayaan :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->spiritual_nilai_kepercayaan_tidak_ada ?? false) ? 'checked' : '' }}"></div> Tidak ada masalah
                    <div class="checkbox {{ ($savedData->spiritual_nilai_kepercayaan_ada ?? false) ? 'checked' : '' }}"></div> Ada konflik
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Pengambilan Keputusan :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->pengambilan_keputusan_keluarga ?? false) ? 'checked' : '' }}"></div> Keluarga terlibat dalam pengambilan keputusan
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Ekonomi :
                </td>
                <td colspan="6" style="width: 600px;"></td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    - Pekerjaan :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_asn ?? false) ? 'checked' : '' }}"></div> ASN
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_wiraswasta ?? false) ? 'checked' : '' }}"></div> Wiraswasta
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_tni_polri ?? false) ? 'checked' : '' }}"></div> TNI/POLRI
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_lain_lain ?? false) ? 'checked' : '' }}"></div> Lain-lain: {{ $savedData->ekonomi_pekerjaan_lain_lain_text ?? '-' }}
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    - Penghasilan per bulan :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->ekonomi_penghasilan_kurang_5jt ?? false) ? 'checked' : '' }}"></div> < Rp 5 juta
                    <div class="checkbox {{ ($savedData->ekonomi_penghasilan_5_10jt ?? false) ? 'checked' : '' }}"></div> Rp 5-10 juta
                    <div class="checkbox {{ ($savedData->ekonomi_penghasilan_lebih_10jt ?? false) ? 'checked' : '' }}"></div> > Rp 10 juta
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Ekonomi - Pekerjaan :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_asn ?? false) ? 'checked' : '' }}"></div> ASN
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_wiraswasta ?? false) ? 'checked' : '' }}"></div> Wiraswasta
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_tni_polri ?? false) ? 'checked' : '' }}"></div> TNI/POLRI<br />
                    <div class="checkbox {{ ($savedData->ekonomi_pekerjaan_lain_lain ?? false) ? 'checked' : '' }}"></div> Lain-lain: {{ $savedData->ekonomi_pekerjaan_lain_lain_text ?? '-' }}
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Penghasilan :
                </td>
                <td colspan="6" style="width: 600px;">
                    <div class="checkbox {{ ($savedData->ekonomi_penghasilan_kurang_5jt ?? false) ? 'checked' : '' }}"></div> < 5 Juta
                    <div class="checkbox {{ ($savedData->ekonomi_penghasilan_5_10jt ?? false) ? 'checked' : '' }}"></div> 5-10 Juta
                    <div class="checkbox {{ ($savedData->ekonomi_penghasilan_lebih_10jt ?? false) ? 'checked' : '' }}"></div> > 10 Juta
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Penilaian Nyeri -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>PENILAIAN NYERI</h3>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Nyeri :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->nyeri ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Onset :
                </td>
                <td colspan="2" style="width: 200px;">
                    <span class="bold">{{ $savedData->onset ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Pencetus: <span class="bold">{{ $savedData->pencetus ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Lokasi: <span class="bold">{{ $savedData->lokasi_nyeri ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Gambaran Nyeri :
                </td>
                <td colspan="2" style="width: 200px;">
                    <span class="bold">{{ $savedData->gambaran_nyeri ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Durasi: <span class="bold">{{ $savedData->durasi_nyeri ?? '-' }}</span>
                </td>
                <td colspan="2" style="width: 200px;">
                    Skala: <span class="bold">{{ $savedData->skala_nyeri ?? '-' }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Metode Nyeri :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->metode_nyeri ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Edukasi -->
    <table>
        <tbody>
            <tr>
                <td colspan="8" class="header-row">
                    <h3>EDUKASI YANG DIBERIKAN</h3>
                </td>
            </tr>
            <tr>
                <td colspan="8">
                    <div class="checkbox {{ ($savedData->edukasi_hak_berpartisipasi ?? false) ? 'checked' : '' }}"></div> Hak untuk berpartisipasi dalam proses pelayanan<br />
                    <div class="checkbox {{ ($savedData->edukasi_prosedure_penunjang ?? false) ? 'checked' : '' }}"></div> Prosedur pemeriksaan penunjang<br />
                    <div class="checkbox {{ ($savedData->edukasi_diagnosa ?? false) ? 'checked' : '' }}"></div> Diagnosa<br />
                    <div class="checkbox {{ ($savedData->edukasi_pemberian_informed_consent ?? false) ? 'checked' : '' }}"></div> Pemberian informed consent<br />
                    <div class="checkbox {{ ($savedData->edukasi_penundaan_pelayanan ?? false) ? 'checked' : '' }}"></div> Penundaan pelayanan dan pengobatan<br />
                    <div class="checkbox {{ ($savedData->edukasi_kelambatan_pelayanan ?? false) ? 'checked' : '' }}"></div> Kelambatan pelayanan<br />
                    <div class="checkbox {{ ($savedData->edukasi_cuci_tangan ?? false) ? 'checked' : '' }}"></div> Cuci tangan<br />
                    <div class="checkbox {{ ($savedData->edukasi_obat ?? false) ? 'checked' : '' }}"></div> Obat-obatan<br />
                    <div class="checkbox {{ ($savedData->edukasi_bahaya_merokok ?? false) ? 'checked' : '' }}"></div> Bahaya merokok<br />
                    <div class="checkbox {{ ($savedData->edukasi_rujukan_pasien ?? false) ? 'checked' : '' }}"></div> Rujukan pasien<br />
                    <div class="checkbox {{ ($savedData->edukasi_nutrisi ?? false) ? 'checked' : '' }}"></div> Nutrisi<br />
                    <div class="checkbox {{ ($savedData->edukasi_rehab_medik ?? false) ? 'checked' : '' }}"></div> Rehabilitasi medik<br />
                    <div class="checkbox {{ ($savedData->edukasi_nyeri ?? false) ? 'checked' : '' }}"></div> Nyeri<br />
                    <div class="checkbox {{ ($savedData->edukasi_perencanaan_pulang ?? false) ? 'checked' : '' }}"></div> Perencanaan pulang<br />
                    <div class="checkbox {{ ($savedData->edukasi_penggunaan_alat ?? false) ? 'checked' : '' }}"></div> Penggunaan alat
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Masalah Medis -->
    <table>
        <tbody>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Masalah Medis :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->masalah_medis ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Rencana Terapi -->
    <table>
        <tbody>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Rencana Terapi :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->rencana_terapi ?? '-' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Diagnosis Medis -->
    <table>
        <tbody>
            <tr>
                <td colspan="2" style="width: 200px;">
                    Diagnosis Medis :
                </td>
                <td colspan="6" style="width: 600px;">
                    <span class="bold">{{ $savedData->diagnosis_medis ?? '-' }}</span>
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