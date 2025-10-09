<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\RawatJalanResumeMedis;
use App\Models\SIMRS\Barang;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\PemeriksaanFisik;
use App\Models\SIMRS\Pendaftaran;
use App\Models\SIMRS\ResumeMedis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RawatJalanResumeMedisController extends Controller
{
    public function index(PengajuanKlaim $pengajuan, KunjunganRS $kunjungan)
    {
        $imagePath = public_path('images/kop.png');
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath));
        $imageBase64 = 'data:image/png;base64,' . $imageData;

        $listObat = Barang::all();

        // Load data yang sudah disimpan sebelumnya
        $savedData = RawatJalanResumeMedis::where('pengajuan_klaim_id', $pengajuan->id)
            ->first();

        return Inertia::render('eklaim/medicalrecord/rawat-jalan/resume-medis', [
            'pengajuan' => $pengajuan,
            'kunjungan' => $kunjungan,
            'kop' => $imageBase64,
            'obat' => $listObat,
            'savedData' => $savedData,
        ]);
    }

    public function getResumeMedisData(KunjunganRS $kunjungan)
    {
        try {
            $resume = ResumeMedis::where('NOPEN', $kunjungan->NOPEN)
            ->with([
                'rpp',
                'anamnesis',
                'diagnosis',
                'procedures',
                'jadwal_kontrol',
                'jadwal_kontrol.ruangan',
            ])
            ->latest('TANGGAL')
            ->first();

            $dataPendaftaran = Pendaftaran::where('NOMOR', $kunjungan->NOPEN)->first();

            $dataPasien = Pasien::where('NORM', $dataPendaftaran->NORM)->first();

            $kunjungan->load([
                'ruangan',
                'penjamin.nama_penjamin',
                'tanda_vital',
                'pasien_pulang.keadaan_pulang',
                'pasien_pulang.cara_pulang',
                'order_resep_pulang.order_resep_detil.nama_obat',
                'order_resep_pulang.order_resep_detil.frekuensi',
                'dokter.pegawai',
                'keluhan_utama',
                'anamnesis',
                'jadwal_kontrol.ruangan',
                'rpp',
                'diagnosa',
                'procedures',
                'dokter.pegawai',
            ]);

            $pemeriksaanFisik = PemeriksaanFisik::where('KUNJUNGAN', $kunjungan->NOMOR)->first();

            return response()->json([
                'resume' => $resume,
                'kunjungan' => $kunjungan,
                'pasien' => $dataPasien,
                'pemeriksaan_fisik' => $pemeriksaanFisik,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // Debug log untuk melihat data yang diterima
        Log::info('Data yang diterima di backend:', [
            'tanda_vital_keadaan_umum' => $request->get('tanda_vital_keadaan_umum'),
            'tanda_vital_kesadaran' => $request->get('tanda_vital_kesadaran'),
            'tanda_vital_sistolik' => $request->get('tanda_vital_sistolik'),
            'tanda_vital_distolik' => $request->get('tanda_vital_distolik'),
            'tanda_vital_frekuensi_nadi' => $request->get('tanda_vital_frekuensi_nadi'),
            'tanda_vital_frekuensi_nafas' => $request->get('tanda_vital_frekuensi_nafas'),
            'tanda_vital_suhu' => $request->get('tanda_vital_suhu'),
            'tanda_vital_saturasi_o2' => $request->get('tanda_vital_saturasi_o2'),
            'tanda_vital_eye' => $request->get('tanda_vital_eye'),
            'tanda_vital_motorik' => $request->get('tanda_vital_motorik'),
            'tanda_vital_verbal' => $request->get('tanda_vital_verbal'),
            'tanda_vital_gcs' => $request->get('tanda_vital_gcs'),
            'all_request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'pengajuan_klaim_id' => 'required|exists:pengajuan_klaim,id',
            'kunjungan_nomor' => 'required|string',
            'tanggal_masuk' => 'nullable|string',
            'tanggal_keluar' => 'nullable|string',
            'lama_rawat' => 'nullable|integer',
            'nama' => 'nullable|string',
            'norm' => 'nullable',
            'tanggal_lahir' => 'nullable|string',
            'jenis_kelamin' => 'nullable',
            'ruangan' => 'nullable|string',
            'penanggung_jawab' => 'nullable|string',
            'indikasi_rawat_inap' => 'nullable|string',
            'riwayat_penyakit_sekarang' => 'nullable|string',
            'riwayat_penyakit_dahulu' => 'nullable|string',
            'riwayat_pengobatan' => 'nullable|string',
            'riwayat_penyakit_keluarga' => 'nullable|string',
            'pemeriksaan_fisik' => 'nullable|string',
            'pemeriksaan_penunjang' => 'nullable|string',
            'hasil_konsultasi' => 'nullable|string',
            'tanda_vital_keadaan_umum' => 'nullable|string',
            'tanda_vital_kesadaran' => 'nullable|string',
            'tanda_vital_sistolik' => 'nullable|string',
            'tanda_vital_distolik' => 'nullable|string',
            'tanda_vital_frekuensi_nadi' => 'nullable|string',
            'tanda_vital_frekuensi_nafas' => 'nullable|string',
            'tanda_vital_suhu' => 'nullable|string',
            'tanda_vital_saturasi_o2' => 'nullable|string',
            'tanda_vital_eye' => 'nullable|string',
            'tanda_vital_motorik' => 'nullable|string',
            'tanda_vital_verbal' => 'nullable|string',
            'tanda_vital_gcs' => 'nullable|string',
            'cara_keluar' => 'nullable|string',
            'keadaan_keluar' => 'nullable|string',
            'jadwal_kontrol_tanggal' => 'nullable|string',
            'jadwal_kontrol_jam' => 'nullable|string',
            'jadwal_kontrol_tujuan' => 'nullable|string',
            'jadwal_kontrol_nomor_bpjs' => 'nullable|string',
            'dokter' => 'nullable|string',
            'petugas' => 'nullable|string',
            'selected_diagnosa' => 'nullable|array',
            'selected_procedures' => 'nullable|array',
            'resep_pulang' => 'nullable|array',
        ]);

        // Clean up date/time fields that contain invalid values
        $cleanedData = $validated;
        
        // Handle invalid date/time values
        $invalidDateValues = ['Tidak Ada', 'Tidak Diketahui', '-', ''];
        
        if (isset($cleanedData['jadwal_kontrol_tanggal']) && in_array($cleanedData['jadwal_kontrol_tanggal'], $invalidDateValues)) {
            $cleanedData['jadwal_kontrol_tanggal'] = null;
        }
        
        if (isset($cleanedData['jadwal_kontrol_jam']) && in_array($cleanedData['jadwal_kontrol_jam'], $invalidDateValues)) {
            $cleanedData['jadwal_kontrol_jam'] = null;
        }
        
        if (isset($cleanedData['tanggal_masuk']) && in_array($cleanedData['tanggal_masuk'], $invalidDateValues)) {
            $cleanedData['tanggal_masuk'] = null;
        }
        
        if (isset($cleanedData['tanggal_keluar']) && in_array($cleanedData['tanggal_keluar'], $invalidDateValues)) {
            $cleanedData['tanggal_keluar'] = null;
        }

        // Debug log setelah validation dan cleaning
        Log::info('Data setelah validation dan cleaning:', [
            'tanda_vital_fields' => [
                'tanda_vital_keadaan_umum' => $cleanedData['tanda_vital_keadaan_umum'] ?? null,
                'tanda_vital_kesadaran' => $cleanedData['tanda_vital_kesadaran'] ?? null,
                'tanda_vital_sistolik' => $cleanedData['tanda_vital_sistolik'] ?? null,
                'tanda_vital_distolik' => $cleanedData['tanda_vital_distolik'] ?? null,
                'tanda_vital_frekuensi_nadi' => $cleanedData['tanda_vital_frekuensi_nadi'] ?? null,
                'tanda_vital_frekuensi_nafas' => $cleanedData['tanda_vital_frekuensi_nafas'] ?? null,
                'tanda_vital_suhu' => $cleanedData['tanda_vital_suhu'] ?? null,
                'tanda_vital_saturasi_o2' => $cleanedData['tanda_vital_saturasi_o2'] ?? null,
                'tanda_vital_eye' => $cleanedData['tanda_vital_eye'] ?? null,
                'tanda_vital_motorik' => $cleanedData['tanda_vital_motorik'] ?? null,
                'tanda_vital_verbal' => $cleanedData['tanda_vital_verbal'] ?? null,
                'tanda_vital_gcs' => $cleanedData['tanda_vital_gcs'] ?? null,
            ]
        ]);

        // Gunakan updateOrCreate untuk update data jika sudah ada
        $resumeMedis = RawatJalanResumeMedis::updateOrCreate(
            [
                'pengajuan_klaim_id' => $cleanedData['pengajuan_klaim_id'],
                'kunjungan_nomor' => $cleanedData['kunjungan_nomor']
            ],
            $cleanedData
        );

        Log::info('Data berhasil disimpan:', [
            'id' => $resumeMedis->id,
            'tanda_vital_tersimpan' => [
                'tanda_vital_keadaan_umum' => $resumeMedis->tanda_vital_keadaan_umum,
                'tanda_vital_kesadaran' => $resumeMedis->tanda_vital_kesadaran,
                'tanda_vital_sistolik' => $resumeMedis->tanda_vital_sistolik,
                'tanda_vital_distolik' => $resumeMedis->tanda_vital_distolik,
                'tanda_vital_frekuensi_nadi' => $resumeMedis->tanda_vital_frekuensi_nadi,
                'tanda_vital_frekuensi_nafas' => $resumeMedis->tanda_vital_frekuensi_nafas,
                'tanda_vital_suhu' => $resumeMedis->tanda_vital_suhu,
                'tanda_vital_saturasi_o2' => $resumeMedis->tanda_vital_saturasi_o2,
                'tanda_vital_eye' => $resumeMedis->tanda_vital_eye,
                'tanda_vital_motorik' => $resumeMedis->tanda_vital_motorik,
                'tanda_vital_verbal' => $resumeMedis->tanda_vital_verbal,
                'tanda_vital_gcs' => $resumeMedis->tanda_vital_gcs,
            ]
        ]);

        return redirect()->back()->with('success', 'Data resume medis rawat jalan berhasil disimpan');
    }
}
