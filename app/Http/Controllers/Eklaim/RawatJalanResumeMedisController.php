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

        $resumeMedis = RawatJalanResumeMedis::create($cleanedData);

        return redirect()->back()->with('success', 'Data resume medis rawat jalan berhasil disimpan');
    }
}
