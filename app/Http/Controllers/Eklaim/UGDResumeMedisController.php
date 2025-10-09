<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\UGDResumeMedis;
use App\Models\SIMRS\Barang;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\PemeriksaanFisik;
use App\Models\SIMRS\Pendaftaran;
use App\Models\SIMRS\ResumeMedis;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UGDResumeMedisController extends Controller
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
        $savedData = UGDResumeMedis::where('pengajuan_klaim_id', $pengajuan->id)
            ->first();

        return Inertia::render('eklaim/medicalrecord/ugd/resume-medis', [
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
            'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
            
            // Identitas Pasien dari frontend
            'nama' => 'nullable|string',
            'norm' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string',
            'tanggal_masuk' => 'nullable|date',
            'tanggal_keluar' => 'nullable|date',
            'ruangan' => 'nullable|string',
            'penanggung_jawab' => 'nullable|string',
            'dokter' => 'nullable|string',
            
            // Dokter dan Petugas tambahan
            'petugas' => 'nullable|string',
            
            // Medical Data dari frontend
            'indikasi_rawat_inap' => 'nullable|string',
            'riwayat_penyakit_dahulu' => 'nullable|string',
            'riwayat_penyakit_sekarang' => 'nullable|string',
            'pemeriksaan_fisik' => 'nullable|string',
            'hasil_konsultasi' => 'nullable|string',
            
            // Tanda Vital dari frontend
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
            
            // Discharge dari frontend
            'cara_keluar' => 'nullable|string',
            'keadaan_keluar' => 'nullable|string',
            
            // Kontrol dari frontend
            'jadwal_kontrol_tanggal' => 'nullable|date',
            'jadwal_kontrol_jam' => 'nullable|string',
            'jadwal_kontrol_tujuan' => 'nullable|string',
            'jadwal_kontrol_nomor_bpjs' => 'nullable|string',
            
            // Arrays dari frontend
            'selected_diagnosa' => 'nullable|array',
            'selected_procedures' => 'nullable|array',
            'resep_pulang' => 'nullable|array',
        ]);

        $resumeMedis = UGDResumeMedis::create($validated);

        return redirect()->back()->with('success', 'Data resume medis UGD berhasil disimpan');
    }
}
