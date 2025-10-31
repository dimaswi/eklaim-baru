<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\RawatInapResumeMedis;
use App\Models\SIMRS\Barang;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\PemeriksaanFisik;
use App\Models\SIMRS\Pendaftaran;
use App\Models\SIMRS\ResumeMedis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RawatInapResumeMedisController extends Controller
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
        $savedData = RawatInapResumeMedis::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('kunjungan_nomor', $kunjungan->NOMOR)
            ->first();

        return Inertia::render('eklaim/medicalrecord/rawat-inap/resume-medis', [
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

    public function store(Request $request, KunjunganRS $kunjungan = null)
    {
        try {
            $validated = $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'kunjungan_nomor' => 'required|string',
                'pasien.nama' => 'required|string',
                'pasien.norm' => 'required|string',
                'pasien.tanggal_lahir' => 'required|string',
                'pasien.jenis_kelamin' => 'required',
                'pasien.tanggal_masuk' => 'required|string',
                'pasien.tanggal_keluar' => 'nullable|string',
                'pasien.ruangan' => 'required|string',
                'pasien.penanggung_jawab' => 'required|string',
                'pasien.indikasi_rawat_inap' => 'nullable|string',
                'pasien.riwayat_penyakit_dahulu' => 'nullable|string',
                'pasien.riwayat_penyakit_sekarang' => 'nullable|string',
                'pasien.pemeriksaan_fisik' => 'nullable|string',
                'pasien.hasil_konsultasi' => 'nullable|string',
                'pasien.tanda_vital_keadaan_umum' => 'nullable|string',
                'pasien.tanda_vital_kesadaran' => 'nullable|string',
                'pasien.tanda_vital_sistolik' => 'nullable|string',
                'pasien.tanda_vital_distolik' => 'nullable|string',
                'pasien.tanda_vital_frekuensi_nadi' => 'nullable|string',
                'pasien.tanda_vital_frekuensi_nafas' => 'nullable|string',
                'pasien.tanda_vital_suhu' => 'nullable|string',
                'pasien.tanda_vital_saturasi_o2' => 'nullable|string',
                'pasien.tanda_vital_eye' => 'nullable|string',
                'pasien.tanda_vital_motorik' => 'nullable|string',
                'pasien.tanda_vital_verbal' => 'nullable|string',
                'pasien.tanda_vital_gcs' => 'nullable|string',
                'pasien.cara_keluar' => 'nullable|string',
                'pasien.keadaan_keluar' => 'nullable|string',
                'pasien.jadwal_kontrol_tanggal' => 'nullable|string',
                'pasien.jadwal_kontrol_jam' => 'nullable|string',
                'pasien.jadwal_kontrol_tujuan' => 'nullable|string',
                'pasien.jadwal_kontrol_nomor_bpjs' => 'nullable|string',
                'pasien.dokter' => 'required|string',
                'pasien.petugas' => 'nullable|string',
                'selectedDiagnosa' => 'nullable|array',
                'selectedDiagnosa.*.name' => 'required_with:selectedDiagnosa|string',
                'selectedDiagnosa.*.code' => 'required_with:selectedDiagnosa|string',
                'selectedProcedures' => 'nullable|array',
                'selectedProcedures.*.name' => 'required_with:selectedProcedures|string',
                'selectedProcedures.*.code' => 'required_with:selectedProcedures|string',
                'resepPulang' => 'nullable|array',
                'resepPulang.*.nama_obat' => 'required_with:resepPulang|string',
                'resepPulang.*.frekuensi' => 'required_with:resepPulang|string',
                'resepPulang.*.jumlah' => 'required_with:resepPulang|integer',
                'resepPulang.*.cara_pemberian' => 'required_with:resepPulang|string',
                // 'resepPulang.*.kode_obat' => 'required_with:resepPulang|string',
            ]);

            DB::connection('app')->beginTransaction();

            // Hapus data lama untuk pengajuan dan kunjungan ini
            RawatInapResumeMedis::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
                ->where('kunjungan_nomor', $validated['kunjungan_nomor'])
                ->delete();

            // Simpan data baru
            RawatInapResumeMedis::create([
                'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                'kunjungan_nomor' => $validated['kunjungan_nomor'],
                'nama' => $validated['pasien']['nama'],
                'norm' => $validated['pasien']['norm'],
                'tanggal_lahir' => $validated['pasien']['tanggal_lahir'],
                'jenis_kelamin' => $validated['pasien']['jenis_kelamin'],
                'tanggal_masuk' => $validated['pasien']['tanggal_masuk'],
                'tanggal_keluar' => $validated['pasien']['tanggal_keluar'],
                'ruangan' => $validated['pasien']['ruangan'],
                'penanggung_jawab' => $validated['pasien']['penanggung_jawab'],
                'indikasi_rawat_inap' => $validated['pasien']['indikasi_rawat_inap'],
                'riwayat_penyakit_dahulu' => $validated['pasien']['riwayat_penyakit_dahulu'],
                'riwayat_penyakit_sekarang' => $validated['pasien']['riwayat_penyakit_sekarang'],
                'pemeriksaan_fisik' => $validated['pasien']['pemeriksaan_fisik'],
                'hasil_konsultasi' => $validated['pasien']['hasil_konsultasi'],
                'tanda_vital_keadaan_umum' => $validated['pasien']['tanda_vital_keadaan_umum'],
                'tanda_vital_kesadaran' => $validated['pasien']['tanda_vital_kesadaran'],
                'tanda_vital_sistolik' => $validated['pasien']['tanda_vital_sistolik'],
                'tanda_vital_distolik' => $validated['pasien']['tanda_vital_distolik'],
                'tanda_vital_frekuensi_nadi' => $validated['pasien']['tanda_vital_frekuensi_nadi'],
                'tanda_vital_frekuensi_nafas' => $validated['pasien']['tanda_vital_frekuensi_nafas'],
                'tanda_vital_suhu' => $validated['pasien']['tanda_vital_suhu'],
                'tanda_vital_saturasi_o2' => $validated['pasien']['tanda_vital_saturasi_o2'],
                'tanda_vital_eye' => $validated['pasien']['tanda_vital_eye'],
                'tanda_vital_motorik' => $validated['pasien']['tanda_vital_motorik'],
                'tanda_vital_verbal' => $validated['pasien']['tanda_vital_verbal'],
                'tanda_vital_gcs' => $validated['pasien']['tanda_vital_gcs'],
                'cara_keluar' => $validated['pasien']['cara_keluar'],
                'keadaan_keluar' => $validated['pasien']['keadaan_keluar'],
                'jadwal_kontrol_tanggal' => $validated['pasien']['jadwal_kontrol_tanggal'],
                'jadwal_kontrol_jam' => $validated['pasien']['jadwal_kontrol_jam'],
                'jadwal_kontrol_tujuan' => $validated['pasien']['jadwal_kontrol_tujuan'],
                'jadwal_kontrol_nomor_bpjs' => $validated['pasien']['jadwal_kontrol_nomor_bpjs'],
                'dokter' => $validated['pasien']['dokter'],
                'petugas' => $validated['pasien']['petugas'] ?? null,
                'selected_diagnosa' => $validated['selectedDiagnosa'] ?? null,
                'selected_procedures' => $validated['selectedProcedures'] ?? null,
                'resep_pulang' => $validated['resepPulang'] ?? null,
            ]);

            DB::connection('app')->commit();

            return redirect()->back()->with('success', 'Data Resume Medis berhasil disimpan ke sistem E-Klaim');
        } catch (\Exception $e) {
            DB::connection('app')->rollBack();
            Log::error('Error menyimpan data Resume Medis E-Klaim: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Gagal menyimpan data Resume Medis: ' . $e->getMessage());
        }
    }
}
