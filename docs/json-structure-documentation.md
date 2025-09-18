# E-Klaim Data Structure Documentation

## Overview
This document describes the JSON data structure for E-Klaim (Electronic Claim) system and provides guidance for implementing it as React TSX form fields.

## Main Data Structure

### Basic Patient Information
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `nomor_sep` | string | "0901R001TEST0001" | Nomor Surat Eligibilitas Peserta | Input (text, readonly) |
| `nomor_kartu` | string | "233333" | Nomor Kartu BPJS | Input (text) |
| `tgl_masuk` | string | "2023-01-25 12:55:00" | Tanggal dan waktu masuk RS | DateTimePicker |
| `tgl_pulang` | string | "2023-01-31 09:55:00" | Tanggal dan waktu pulang RS | DateTimePicker |

### Treatment Information
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `cara_masuk` | string | "gp" | Cara masuk RS (gp=through GP) | Select Options |
| `jenis_rawat` | string | "1" | Jenis rawat (1=rawat inap, 2=rawat jalan) | Radio Button |
| `kelas_rawat` | string | "1" | Kelas rawat (1=kelas 1, 2=kelas 2, 3=kelas 3) | Select Dropdown |

### ADL (Activities of Daily Living) Scores
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `adl_sub_acute` | string | "15" | Skor ADL Sub Acute (0-23) | Number Input (0-23) |
| `adl_chronic` | string | "12" | Skor ADL Chronic (0-23) | Number Input (0-23) |

### ICU Information
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `icu_indikator` | string | "1" | Indikator ICU (0=tidak, 1=ya) | Checkbox |
| `icu_los` | string | "2" | Length of Stay ICU (hari) | Number Input |

### Ventilator Information
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `ventilator_hour` | string | "5" | Total jam penggunaan ventilator | Number Input |

#### Ventilator Object
```json
{
  "use_ind": "1",
  "start_dttm": "2023-01-26 12:55:00",
  "stop_dttm": "2023-01-26 17:50:00"
}
```

| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `ventilator.use_ind` | string | "1" | Indikator penggunaan ventilator | Checkbox |
| `ventilator.start_dttm` | string | "2023-01-26 12:55:00" | Waktu mulai ventilator | DateTimePicker |
| `ventilator.stop_dttm` | string | "2023-01-26 17:50:00" | Waktu selesai ventilator | DateTimePicker |

### Class Upgrade Information
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `upgrade_class_ind` | string | "1" | Indikator naik kelas | Checkbox |
| `upgrade_class_class` | string | "vip" | Kelas yang dituju | Select Dropdown |
| `upgrade_class_los` | string | "5" | Lama naik kelas (hari) | Number Input |
| `upgrade_class_payor` | string | "peserta" | Pembayar naik kelas | Select Options |
| `add_payment_pct` | string | "35" | Persentase tambahan bayar (%) | Number Input (0-100) |

### Vital Signs & Birth
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `birth_weight` | string | "0" | Berat lahir (gram) | Number Input |
| `sistole` | number | 120 | Tekanan darah sistole | Number Input |
| `diastole` | number | 70 | Tekanan darah diastole | Number Input |
| `discharge_status` | string | "1" | Status pulang | Select Dropdown |

### Medical Codes
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `diagnosa` | string | "S71.0#A00.1" | Kode diagnosa (separator #) | Text Area + ICD-10 Picker |
| `procedure` | string | "81.52#88.38#86.22" | Kode prosedur (separator #) | Text Area + ICD-9 Picker |
| `diagnosa_inagrouper` | string | "S71.0#A00.1" | Diagnosa untuk grouper | Text Area |
| `procedure_inagrouper` | string | "81.52#88.38#86.22+3#86.22" | Prosedur untuk grouper | Text Area |

## Hospital Tariff Structure

### Tariff RS Object
```json
{
  "prosedur_non_bedah": "300000",
  "prosedur_bedah": "20000000",
  "konsultasi": "300000",
  // ... etc
}
```

| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `tarif_rs.prosedur_non_bedah` | string | "300000" | Tarif prosedur non bedah | Currency Input |
| `tarif_rs.prosedur_bedah` | string | "20000000" | Tarif prosedur bedah | Currency Input |
| `tarif_rs.konsultasi` | string | "300000" | Tarif konsultasi | Currency Input |
| `tarif_rs.tenaga_ahli` | string | "200000" | Tarif tenaga ahli | Currency Input |
| `tarif_rs.keperawatan` | string | "80000" | Tarif keperawatan | Currency Input |
| `tarif_rs.penunjang` | string | "1000000" | Tarif penunjang | Currency Input |
| `tarif_rs.radiologi` | string | "500000" | Tarif radiologi | Currency Input |
| `tarif_rs.laboratorium` | string | "600000" | Tarif laboratorium | Currency Input |
| `tarif_rs.pelayanan_darah` | string | "150000" | Tarif pelayanan darah | Currency Input |
| `tarif_rs.rehabilitasi` | string | "100000" | Tarif rehabilitasi | Currency Input |
| `tarif_rs.kamar` | string | "6000000" | Tarif kamar | Currency Input |
| `tarif_rs.rawat_intensif` | string | "2500000" | Tarif rawat intensif | Currency Input |
| `tarif_rs.obat` | string | "100000" | Tarif obat | Currency Input |
| `tarif_rs.obat_kronis` | string | "1000000" | Tarif obat kronis | Currency Input |
| `tarif_rs.obat_kemoterapi` | string | "5000000" | Tarif obat kemoterapi | Currency Input |
| `tarif_rs.alkes` | string | "500000" | Tarif alat kesehatan | Currency Input |
| `tarif_rs.bmhp` | string | "400000" | Tarif BMHP | Currency Input |
| `tarif_rs.sewa_alat` | string | "210000" | Tarif sewa alat | Currency Input |

## Death Management (Pemulasaraan Jenazah)
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `pemulasaraan_jenazah` | string | "1" | Indikator pemulasaraan jenazah | Checkbox |
| `kantong_jenazah` | string | "1" | Jumlah kantong jenazah | Number Input |
| `peti_jenazah` | string | "1" | Jumlah peti jenazah | Number Input |
| `plastik_erat` | string | "1" | Jumlah plastik erat | Number Input |
| `desinfektan_jenazah` | string | "1" | Jumlah desinfektan jenazah | Number Input |
| `mobil_jenazah` | string | "0" | Indikator mobil jenazah | Checkbox |
| `desinfektan_mobil_jenazah` | string | "0" | Jumlah desinfektan mobil | Number Input |

## COVID-19 Related Fields
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `covid19_status_cd` | string | "1" | Status COVID-19 | Select Dropdown |
| `nomor_kartu_t` | string | "nik" | Tipe nomor kartu | Select Options |
| `episodes` | string | "1;12#2;3#6;5" | Episode perawatan | Text Input |
| `covid19_cc_ind` | string | "1" | Indikator complication/comorbidity | Checkbox |
| `covid19_rs_darurat_ind` | string | "1" | Indikator RS darurat COVID | Checkbox |
| `covid19_co_insidense_ind` | string | "1" | Indikator co-insidence | Checkbox |

### COVID-19 Supporting Tests
```json
{
  "lab_asam_laktat": "1",
  "lab_procalcitonin": "1",
  "lab_crp": "1",
  // ... etc
}
```

| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `covid19_penunjang_pengurang.lab_asam_laktat` | string | "1" | Lab asam laktat | Checkbox |
| `covid19_penunjang_pengurang.lab_procalcitonin` | string | "1" | Lab procalcitonin | Checkbox |
| `covid19_penunjang_pengurang.lab_crp` | string | "1" | Lab CRP | Checkbox |
| `covid19_penunjang_pengurang.lab_kultur` | string | "1" | Lab kultur | Checkbox |
| `covid19_penunjang_pengurang.lab_d_dimer` | string | "1" | Lab D-Dimer | Checkbox |
| `covid19_penunjang_pengurang.lab_pt` | string | "1" | Lab PT | Checkbox |
| `covid19_penunjang_pengurang.lab_aptt` | string | "1" | Lab APTT | Checkbox |
| `covid19_penunjang_pengurang.lab_waktu_pendarahan` | string | "1" | Lab waktu pendarahan | Checkbox |
| `covid19_penunjang_pengurang.lab_anti_hiv` | string | "1" | Lab anti HIV | Checkbox |
| `covid19_penunjang_pengurang.lab_analisa_gas` | string | "1" | Lab analisa gas | Checkbox |
| `covid19_penunjang_pengurang.lab_albumin` | string | "1" | Lab albumin | Checkbox |
| `covid19_penunjang_pengurang.rad_thorax_ap_pa` | string | "0" | Radiologi thorax AP/PA | Checkbox |

## Special Treatments
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `terapi_konvalesen` | string | "1000000" | Biaya terapi konvalesen | Currency Input |
| `akses_naat` | string | "C" | Akses NAAT | Select Options |
| `isoman_ind` | string | "0" | Indikator isolasi mandiri | Checkbox |
| `bayi_lahir_status_cd` | number | 1 | Status bayi lahir | Select Dropdown |
| `dializer_single_use` | number | 0 | Indikator dializer single use | Checkbox |
| `kantong_darah` | number | 1 | Jumlah kantong darah | Number Input |
| `alteplase_ind` | number | 0 | Indikator alteplase | Checkbox |

## APGAR Score (Newborn Assessment)
```json
{
  "menit_1": {
    "appearance": 1,
    "pulse": 2,
    "grimace": 1,
    "activity": 1,
    "respiration": 1
  },
  "menit_5": {
    "appearance": 2,
    "pulse": 2,
    "grimace": 2,
    "activity": 2,
    "respiration": 2
  }
}
```

| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `apgar.menit_1.appearance` | number | 1 | Appearance score menit 1 (0-2) | Number Input (0-2) |
| `apgar.menit_1.pulse` | number | 2 | Pulse score menit 1 (0-2) | Number Input (0-2) |
| `apgar.menit_1.grimace` | number | 1 | Grimace score menit 1 (0-2) | Number Input (0-2) |
| `apgar.menit_1.activity` | number | 1 | Activity score menit 1 (0-2) | Number Input (0-2) |
| `apgar.menit_1.respiration` | number | 1 | Respiration score menit 1 (0-2) | Number Input (0-2) |
| `apgar.menit_5.*` | number | 2 | Similar structure for menit 5 | Number Input (0-2) |

## Persalinan (Delivery Information)
```json
{
  "usia_kehamilan": "22",
  "gravida": "2",
  "partus": "4",
  "abortus": "2",
  "onset_kontraksi": "induksi",
  "delivery": [...]
}
```

| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `persalinan.usia_kehamilan` | string | "22" | Usia kehamilan (minggu) | Number Input |
| `persalinan.gravida` | string | "2" | Gravida | Number Input |
| `persalinan.partus` | string | "4" | Partus | Number Input |
| `persalinan.abortus` | string | "2" | Abortus | Number Input |
| `persalinan.onset_kontraksi` | string | "induksi" | Onset kontraksi | Select Options |

### Delivery Array
Each delivery object contains:

| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `delivery_sequence` | string | "1" | Urutan kelahiran | Number Input |
| `delivery_method` | string | "vaginal" | Metode persalinan | Select Options |
| `delivery_dttm` | string | "2023-01-21 17:01:33" | Waktu persalinan | DateTimePicker |
| `letak_janin` | string | "kepala" | Letak janin | Select Options |
| `kondisi` | string | "livebirth" | Kondisi bayi | Select Options |
| `use_manual` | string | "1" | Penggunaan manual | Checkbox |
| `use_forcep` | string | "0" | Penggunaan forcep | Checkbox |
| `use_vacuum` | string | "1" | Penggunaan vacuum | Checkbox |
| `shk_spesimen_ambil` | string | "ya" | Ambil spesimen SHK | Radio Button |
| `shk_lokasi` | string | "tumit" | Lokasi spesimen SHK | Select Options |
| `shk_spesimen_dttm` | string | "2023-01-21 18:11:33" | Waktu ambil spesimen | DateTimePicker |
| `shk_alasan` | string | "akses-sulit" | Alasan tidak ambil spesimen | Select Options |

## Final Information
| Field | Type | Value | Description | Form Field Type |
|-------|------|-------|-------------|----------------|
| `tarif_poli_eks` | string | "100000" | Tarif poli eksekutif | Currency Input |
| `nama_dokter` | string | "RUDY, DR" | Nama dokter | Text Input |
| `kode_tarif` | string | "AP" | Kode tarif | Text Input |
| `payor_id` | string | "3" | ID pembayar | Select Dropdown |
| `payor_cd` | string | "JKN" | Kode pembayar | Text Input |
| `cob_cd` | string | "0001" | Kode COB | Text Input |
| `coder_nik` | string | "123123123123" | NIK coder | Text Input |

## Implementation Notes for React TSX

### Form Sections Suggestion:
1. **Patient Information** - Basic patient and admission info
2. **Treatment Details** - Treatment type, class, ICU, ventilator
3. **Medical Codes** - Diagnosis and procedure codes
4. **Hospital Tariffs** - All tariff-related fields (collapsible section)
5. **COVID-19 Information** - COVID-related fields (conditional rendering)
6. **Death Management** - Death-related fields (conditional rendering)
7. **APGAR Scores** - Newborn assessment (conditional rendering)
8. **Delivery Information** - Obstetric information (conditional rendering)
9. **Final Information** - Doctor, coder, and payment info

### Field Validation Rules:
- **Date fields**: Must be valid dates, discharge date > admission date
- **Number fields**: Min/max values as specified
- **Required fields**: Based on jenis_rawat and other conditions
- **Conditional fields**: Show/hide based on other field values
- **Array fields**: Dynamic add/remove functionality for delivery array

### State Management:
- Use `useState` for form data
- Use `useForm` from react-hook-form for validation
- Consider using `zustand` or `redux` for complex state management
- Implement auto-save functionality for large forms

### Penjelasan
- tgl_masuk : Tanggal masuk pasien untuk episode perawatan yang diklaim
- tgl_pulang : Tanggal pulang
- cara_masuk : gp = Rujukan FKTP, hosp-trans = Rujukan FKRTL,
 mp = Rujukan Spesialis, outp = Dari Rawat Jalan,
 inp = Dari Rawat Inap, emd = Dari Rawat Darurat,
 born = Lahir di RS, nursing = Rujukan Panti Jompo,
 psych = Rujukan dari RS Jiwa, rehab = Rujukan Fasilitas
 Rehab, other = Lain-lain
- jenis_rawat : 1 = rawat inap, 2 = rawat jalan, 3 = rawat igd
- kelas_rawat : 3 = Kelas 3, 2 = Kelas 2, 1 = Kelas 1
- adl_sub_acute : ADL = Activities of Daily Living Score untuk pasien sub acute, nilainya 12 s/d 60
- adl_chronic : Activities of Daily Living Score untuk pasien chronic nilainya 12 s/d 60
- icu_indicator : Jika pasien masuk ICU selama dalam episode perawatan maka diisi "1" (satu). Jika tidak ada perawatan ICU maka diisi "0" (nol).
- icu_los : Jumlah hari rawat di ICU
- ventilator_hour : Jumlah jam pemakaian ventilator jika di ICU Tambahan element ventilator: use_ind: 1 = ada pemakaian, 0 = tidak ada pemakaian
- start_dttm: waktu mulai, format yyyy-mm-dd hh:mm:ss (VENTILATOR)
- stop_dttm: waktu selesai, format yyyy-mm-dd hh:mm:ss (VENTILATOR) Tambahan element ventilator ini tidak menghilangkan element ventilator_hour sebelumnya untuk backward compatibility
- upgrade_class_ind, upgrade_class_class, upgrade_class_los, dan
add_payment_pct dijelaskan sebagai berikut: Untuk naik kelas, gunakan
parameter upgrade_class_ind = "1" (satu) jika ada naik kelas, dan "0"
(nol) jika tidak ada naik kelas. Untuk kenaikan kelas yang dituju gunakan
parameter upgrade_class_class:
kelas_1 = naik ke kelas 1
kelas_2 = naik ke kelas 2
vip = naik ke kelas vip
vvip = naik ke kelas vvip
Untuk lama hari rawat yang naik kelas gunakan parameter
upgrade_class_los, diisi dalam format integer lama hari rawat yang naik
kelas. Parameter add_payment_pct adalah koefisien tambahan biaya khusus
jika pasien naik ke kelas VIP (diatas Kelas 1). Parameter
upgrade_class_payor diisi dengan "peserta" atau "pemberi_kerja" atau
"asuransi_tambahan". Untuk penggunaan parameter upgrade_class_ind,
upgrade_class_class, upgrade_class_los dan add_payment_pct,
upgrade_class_payor harus disertakan 5 parameter tersebut secara
bersamaan.
- payor_id : biar saya handle, berikan searchable dropdown saja
- payor_cd : biar saya handle, berikan searchable dropdown saja
- coder_nik : dari user login Auth::user()->nik
- discharge_status : Cara pulang didefinisikan sebagai berikut:
 1 = Atas persetujuan dokter
 2 = Dirujuk
 3 = Atas permintaan sendiri
 4 = Meninggal
 5 = Lain-lain
- diagnosa : untuk diagnosa ambil data dari resume medis yang sudah diinput, gunakan # sebagai separator jika lebih dari 1 diagnosa contohnya: "S71.0#A00.1" namun ada kondisi jiak S71.0 muncul dua kali begitu juga A00.1 maka format menjadi "S71.0+2#A00.1" artinya S71.0 muncul 2 kali
- procedure : untuk procedure ambil data dari resume medis yang sudah diinput, gunakan # sebagai separator jika lebih dari 1 procedure contohnya: "81.52#88.38#86.22" namun ada kondisi jika 86.22 muncul dua kali maka format menjadi "81.52#88.38#86.22+2" artinya 86.22 muncul 2 kali
- diagnosa_inagrouper : sama dengan diagnosa
- procedure_inagrouper : sama dengan procedure
- sistole & diastole: Tekanan darah, dalam mmHg
- dializer_single_use: Hhusus untuk hemodialisa, diisi:
 "1" = single use
 "0" = multiple use
- apgar score: Terdiri dari dua bagian yaitu menit pertama (menit_1) dan menit kelima (menit_5), yang masing-masing bagian memiliki element: appareance, pulse, grimace, activity dan respiration. Untuk setiap element diisi nilai antara 0,1,atau 2
- persalinan:
  1. usia_kehamilan: diisi angka dalam minggu
  2. gravida: jumlah kehamilan, diisi angka
  3. partus: jumlah kelahiran, diisi angka
  4. abortus: jumlah keguguran, diisi angka
  5. onset_kontraksi: diisi pilihan: spontan, induksi,
     non_spontan_non_induksi
- delivery: berupa array object sebagai berikut:
  1. delivery_sequence: urutan kelahiran (jika lahir lebih dari satubayi dalam satu kali perawatan), diisi angka dimulai dari 1
  2. delivery_method: diisi pilihan: vaginal, atau sc
  3. delivery_dttm: waktu kelahiran, format yyyy-mm-dd hh:mm:ss
  4. letak_janin: letak janin, diisi pilihan: kepala, sungsang, lintang
  5. kondisi: kondisi bayi waktu lahir, pilihan: livebirth, stillbirth
  6. use_manual: lahir dengan bantuan manual, diisi 0 = tidak, 1 = ya
  7. use_forcep: penggunaan forcep, diisi 0 = tidak, 1 = ya
  8. use_vacuum: penggunaan vacuum, diisi 0 = tidak, 1 = ya
  9. shk_spesimen_ambil: diisi "ya", "tidak"
  10. shk_lokasi: diisi "tumit", "vena"
  11. shk_alasan: diisi "tidak-dapat", "akses-sulit"
  12. shk_spesimen_dttm: waktu pengambilan, format yyyy-mm-dd hh:mm:ss
- kantong_darah: Diisi dengan jumlah kantong darah yang diberikan kepada
 pasien. Parameter ini digunakan berdampingan dengan
 parameter pelayanan_darah pada tarif_rs.
- alteplase_ind: Diisi 1 jika ada pemberian alteplase, 0 jika tidak.
 pilihan alteplase hanya dimunculkan ketika kode INACBG
 adalah G-4-14-* KECEDERAAN PEMBULUH DARAH OTAK DENGAN
 INFARK, semua level, baik RINGAN, SEDANG, dan BERAT.

- tarif_rs : Untuk parameter tarif_rs disediakan parameter breakdown
 seperti tersebut pada json diatas. Nilai tarif_rs sendiri akan
 dihitung berdasarkan jumlah dari breakdown tersebut yaitu:
 prosedur_non_bedah, prosedur_bedah, konsultasi, tenaga_ahli,
 keperawatan, penunjang, radiologi, laboratorium, pelayanan_darah, rehabilitasi, kamar, rawat_intensif, obat,
 obat_kronis, obat_kemoterapi, alkes, bmhp, dan sewa_alat.
 Masing-masing diisi dengan nilai integer.

- Untuk pasien COVID-19 yang meninggal dunia, disediakan parameter untuk
mencatat pemakaian tambahan klaim untuk rangkaian pemulasaraan jenazah
sebagai berikut: 
 1. pemulasaraan_jenazah, 
 2. kantong_jenazah, 
 3. peti_jenazah,
 4. plastik_erat, 
 5. desinfektan_jenazah, 
 6. mobil_jenazah, dan
 7. desinfektan_mobil_jenazah.
Paramer tersebut diisi dengan nilai 1 jika ada pemakaian, 0 jika tidak
ada pemakaian.
- nomor_kartu_t : Untuk tambahan khusus pasien Jaminan COVID-19,
 parameter ini membedakan nilai yang tersebut didalam
 parameter nomor_kartu. Isinya dengan pilihan:
 nik = untuk Nomor Induk Kependudukan
 kitas = untuk KITAS/KITAP
 KITAS : Kartu Ijin Tinggal Terbatas
 KITAP : Kartu Ijin Tinggal Tetap
 paspor = untuk Nomor Passport, jika WNA.
 kartu_jkn = untuk Nomor Kartu Peserta JKN (BPJS)
 kk = untuk nomor pada Kartu Keluarga
 unhcr = untuk nomor pada dokumen dari UNHCR
 kelurahan = untuk nomor pada dokumen dari kelurahan
 dinsos = untuk nomor pada dokumen dari Dinas Sosial
 dinkes = untuk nomor pada dokumen dari Dinas Kesehatan
 sjp = untuk nomor Surat Jaminan Perawatan (SJP)
 klaim_ibu = mandatori untuk jaminan bayi baru lahir.
 lainnya = untuk nomor identitas lainnya yang dapat
 dipertanggungjawabkan oleh rumah sakit
 dan lembaga yang berwenang lainnya
- covid19_status_cd : Untuk tambahan khusus pasien Jaminan COVID-19,
 parameter ini berisi status ODP/PDP/Terkonfirmasi.
 Yang valid diisi dengan nilai sebagai berikut:
 1 = untuk ODP
 2 = untuk PDP
 3 = untuk pasien terkonfirmasi positif COVID-19
 Terhitung mulai 15 Agustus 2020, maka parameter ini
 valid jika diisi dengan nilai:
 4 = untuk suspek
 5 = untuk probabel
 3 = untuk pasien terkonfirmasi positif COVID-19
 Terhitung mulai 1 Oktober 2021 parameter ini tidak
 diperlukan
- episodes : Untuk tambahan khusus pasien Jaminan COVID-19 yang rawat inap,
 paramter ini berisi lama rawat masing-masing episode ruangan
 perawatan yang dijalani oleh pasien selama rawat inap. Format
 pengisiannya dapat melihat contoh diatas sebagai berikut:
 "episodes": "1;12#2;3#6;5"
 Penjelasannya adalah setiap episode dibatasi (delimited by)
 tanda hash (#), kemudian masing-masing episode dinotasikan
 dengan jenis ruangan + titik koma + lama rawat.
 Jenis ruangan didefinisikan sebagai berikut:
 1 = ICU dengan ventilator
 2 = ICU tanpa ventilator
 3 = Isolasi tekanan negatif dengan ventilator
 4 = Isolasi tekanan negatif tanpa ventilator
 5 = Isolasi non tekanan negatif dengan ventilator
 6 = Isolasi non tekanan negatif tanpa ventilator
 Terhitung mulai tanggal masuk pasien 20 April 2021, maka
 definisi jenis ruangan sebagai berikut:
 7 = ICU tekanan negatif dengan ventilator
 8 = ICU tekanan negatif tanpa ventilator
 9 = ICU tanpa tekanan negatif dengan ventilator
 10 = ICU tanpa tekanan negatif tanpa ventilator
 11 = Isolasi tekanan negatif
 12 = Isolasi tanpa tekanan negatif
 Sebagai contoh tersebut diatas, artinya adalah:
 episode pertama: ICU dengan ventilator selama 12 hari
 episode kedua : ICU tanpa ventilator selama 3 hari
 episode ketiga : Isolasi non tekanan negatif tanpa
 ventilator 5 hari
 Perhatian: Bahwa jumlah total hari dalam episode ini harus
 sama dengan jumlah lama rawat berdasarkan tanggal
 masuk dan tanggal keluar. Jika tidak sama maka akan
 error

- covid19_cc_ind : Indikator kalau ada cc (comorbidity/complexity). Nilai
 diisi 1 kalau ada cc, 0 kalau tidak ada cc.
- covid19_rs_darurat_ind : 1 = Indikator kalau pasien dirawat di lokasi
 rs darurat atau rs lapangan.
 0 = Indikator kalau pasien tidak dirawat di
 lokasi rs darurat atau rs lapangan.
- covid19_co_insidense_ind : Indikator kalau ada kasus co-insidense.
 Per 1 Oktober 2021 hanya berlaku untuk JKN,
 payor_id = 3.
- covid19_no_sep : Nomor klaim COVID-19 untuk kasus co-insidense
 pada klaim JKN.
- covid19_penunjang_pengurang : Parameter ini berisi penanda jika ada
 pemeriksaan penunjang tersebut dibawah yang tidak diberikan selama
 masa perawatan.
 Detail parameter sebagai berikut:
 lab_asam_laktat : Pemeriksaan Lab. Asam Laktat
 lab_procalcitonin : Pemeriksaan Lab. Procalcitonin
 lab_crp : Pemeriksaan Lab. CRP
 lab_kultur : Pemeriksaan Lab. Kultur MO
 (aerob) dengan resistansi
 lab_d_dimer : Pemeriksaan Lab. D Dimer
 lab_pt : Pemeriksaan Lab. PT
 lab_aptt : Pemeriksaan Lab. APTT
 lab_waktu_pendarahan : Pemeriksaan Lab. Waktu Pendarahan
 lab_anti_hiv : Pemeriksaan Lab. Anti HIV
 lab_analisa_gas : Pemeriksaan Lab. Analisa Gas
 lab_albumin : Pemeriksaan Lab. Albumin
 rad_thorax_ap_pa : Pemeriksaan Radiologi Thorax AP / PA
 Parameter ini diisi dengan angka 0 = jika dilakukan atau
 angka 1 = jika tidak dilakukan.
 Parameter ini tidak berlaku pada pasien masuk 1 Oktober 2021.
- terapi_konvalesen : Parameter ini diisi dengan nilai tambahan untuk terapi plasma konvalesen.  Sebelum 1 Oktober 2021 diisi dengan nilai rupiah, setelah 1 Oktober 2021 diisi dengan jumlah kantong.
- akses_naat : Parameter ini diisi dengan nilai kode kategori akses NAAT
 yaitu A, B atau C. Tidak diperlukan per 1 Oktober 2021.
- isoman_ind : Parameter ini diisi 0 jika bukan isolasi mandiri,
 atau diisi 1 jika isolasi mandiri.
- bayi_lahir_status_cd : Diisi hanya jika payor_id = 73 (Jaminan Bayi Baru
 Lahir) dengan nilai acuan sebagai berikut:
 1 = Tanpa Kelainan
 2 = Dengan Kelainan