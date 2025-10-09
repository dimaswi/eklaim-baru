<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\HasilRadiologi;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\Pendaftaran;
use App\Models\SIMRS\Tindakan;
use App\Models\SIMRS\Pegawai;
use App\Models\SIMRS\Dokter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HasilRadiologiController extends Controller
{
    public function index(PengajuanKlaim $pengajuan, KunjunganRS $kunjungan)
    {
        $imagePath = public_path('images/kop.png');
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath));
        $imageBase64 = 'data:image/png;base64,' . $imageData;

        $tindakan = Tindakan::where('JENIS', 7)
        ->get();

        // Load data yang sudah disimpan sebelumnya (data asli dari SIMRS)
        $savedData = HasilRadiologi::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('kunjungan_nomor', $kunjungan->NOMOR)
            ->where('is_fiktif', false)
            ->first();

        // Load data fiktif untuk pengajuan klaim ini
        $dataFiktif = HasilRadiologi::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('is_fiktif', true)
            ->get();

        // Load data SIMRS untuk auto-populate
        $kunjungan->load([
            'tindakan_medis.hasil_radiologi',
            'tindakan_medis.nama_tindakan'
        ]);

        // Load data pegawai dan dokter untuk modal selection
        $pegawaiList = Pegawai::where('STATUS', 1)->get();
        $dokterList = Dokter::with('pegawai')->get();

        return Inertia::render('eklaim/medicalrecord/radiologi/hasil', [
            'pengajuan' => $pengajuan,
            'kunjungan' => $kunjungan,
            'kop' => $imageBase64,
            'tindakan' => $tindakan,
            'savedData' => $savedData,
            'dataFiktif' => $dataFiktif,
            'pegawaiList' => $pegawaiList,
            'dokterList' => $dokterList,
        ]);
    }

    public function getHasilRadiologiData(KunjunganRS $kunjungan)
    {
        $pendaftaran = Pendaftaran::where('NOMOR', $kunjungan->NOPEN)->first();
        $pasien = Pasien::where('NORM', $pendaftaran->NORM)->first();

        $kunjungan->load([
            'tindakan_medis.hasil_radiologi',
            'tindakan_medis.nama_tindakan'
        ]);

        return response()->json([
            'kunjungan' => $kunjungan,
            'pasien' => $pasien,
        ]);
    }

    public function store(Request $request, KunjunganRS $kunjungan)
    {
        try {
            $validated = $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'kunjungan_nomor' => 'required|string',
                'hasil_radiologi' => 'required|array',
                'tanggal_pemeriksaan' => 'nullable|string',
                'jenis_pemeriksaan' => 'nullable|string',
                'kesan' => 'nullable|string',
                'saran' => 'nullable|string',
                'dokter_radiologi' => 'nullable|string',
                'dokter_pengirim' => 'nullable|string',
                'petugas_medis_id' => 'nullable|string',
                'petugas_medis_nama' => 'nullable|string',
                'dokter_penanggung_jawab_id' => 'nullable|string',
                'dokter_penanggung_jawab_nama' => 'nullable|string',
            ]);

            DB::beginTransaction();

            // Hapus data lama untuk pengajuan dan kunjungan ini
            HasilRadiologi::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
                ->where('kunjungan_nomor', $validated['kunjungan_nomor'])
                ->where('is_fiktif', false)
                ->delete();

            // Prepare data sesuai dengan struktur database
            $tindakanMedisData = [
                'hasil_radiologi' => $validated['hasil_radiologi'],
                'petugas_medis_id' => $validated['petugas_medis_id'] ?? null,
                'petugas_medis_nama' => $validated['petugas_medis_nama'] ?? null,
                'dokter_penanggung_jawab_id' => $validated['dokter_penanggung_jawab_id'] ?? null,
                'dokter_penanggung_jawab_nama' => $validated['dokter_penanggung_jawab_nama'] ?? null,
                'tanggal_pemeriksaan' => $validated['tanggal_pemeriksaan'] ?? now()->toDateString(),
            ];

            // Get pasien data
            $pendaftaran = Pendaftaran::where('NOMOR', $kunjungan->NOPEN)->first();
            $pasien = Pasien::where('NORM', $pendaftaran->NORM ?? '')->first();
            
            $pasienData = $pasien ? [
                'nama' => $pasien->NAMA,
                'norm' => $pasien->NORM,
                'tanggal_lahir' => $pasien->TANGGAL_LAHIR,
                'jenis_kelamin' => $pasien->JENIS_KELAMIN,
            ] : null;

            // Ambil data individual dari hasil_radiologi array untuk field terpisah
            $firstRadiologi = $validated['hasil_radiologi'][0] ?? [];

            // Simpan data sesuai struktur model
            HasilRadiologi::create([
                'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                'kunjungan_nomor' => $validated['kunjungan_nomor'],
                'tindakan_medis_data' => $tindakanMedisData,
                'pasien_data' => $pasienData,
                'tanggal_pemeriksaan' => $validated['tanggal_pemeriksaan'] ?? now()->toDateString(),
                'jenis_pemeriksaan' => $validated['jenis_pemeriksaan'] ?? 'Radiologi',
                'klinis' => $firstRadiologi['klinis'] ?? '-',
                'kesan' => $validated['kesan'] ?? '-',
                'usul' => $firstRadiologi['usul'] ?? '-',
                'hasil' => $firstRadiologi['hasil_edited'] ?? '-',
                'btk' => $firstRadiologi['btk'] ?? '-',
                'saran' => $validated['saran'] ?? '-',
                'dokter_radiologi' => $validated['dokter_radiologi'] ?? '-',
                'dokter_pengirim' => $validated['dokter_pengirim'] ?? '-',
                'hasil_radiologi' => $validated['hasil_radiologi'],
                'tindakan_id' => $firstRadiologi['TINDAKAN'] ?? null,
                'nama_tindakan' => json_encode($firstRadiologi['nama_tindakan'] ?? []),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Data hasil radiologi berhasil disimpan');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error menyimpan hasil radiologi: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyimpan data hasil radiologi: ' . $e->getMessage());
        }
    }

    public function storeFiktif(Request $request)
    {
        try {
            $validated = $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'hasil_radiologi' => 'required|array',
                'tanggal_pemeriksaan' => 'nullable|string',
                'jenis_pemeriksaan' => 'nullable|string',
                'kesan' => 'nullable|string',
                'saran' => 'nullable|string',
                'dokter_radiologi' => 'nullable|string',
                'dokter_pengirim' => 'nullable|string',
                'petugas_medis_id' => 'nullable|string',
                'petugas_medis_nama' => 'nullable|string',
                'dokter_penanggung_jawab_id' => 'nullable|string',
                'dokter_penanggung_jawab_nama' => 'nullable|string',
            ]);

            DB::beginTransaction();

            $pengajuanKlaim = PengajuanKlaim::findOrFail($validated['pengajuan_klaim_id']);

            // Generate nomor kunjungan fiktif unik dengan timestamp dan uniqid untuk setiap record baru
            $nomorKunjunganFiktif = 'FIKTIF-RAD-' . $validated['pengajuan_klaim_id'] . '-' . time() . '-' . uniqid();

            // TIDAK menghapus data fiktif lama - biarkan tetap ada untuk menambah record baru
            // HasilRadiologi::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
            //     ->where('is_fiktif', true)
            //     ->delete();

            // Prepare data sesuai dengan struktur database (sama persis dengan store asli)
            $tindakanMedisData = [
                'hasil_radiologi' => $validated['hasil_radiologi'],
                'petugas_medis_id' => $validated['petugas_medis_id'] ?? null,
                'petugas_medis_nama' => $validated['petugas_medis_nama'] ?? null,
                'dokter_penanggung_jawab_id' => $validated['dokter_penanggung_jawab_id'] ?? null,
                'dokter_penanggung_jawab_nama' => $validated['dokter_penanggung_jawab_nama'] ?? null,
                'tanggal_pemeriksaan' => $validated['tanggal_pemeriksaan'] ?? now()->toDateString(),
            ];

            // Data pasien dari pengajuan klaim (sama struktur dengan store asli)
            $pasienData = [
                'nama' => $pengajuanKlaim->nama_pasien,
                'norm' => $pengajuanKlaim->norm,
                'tanggal_lahir' => $pengajuanKlaim->tgl_lahir,
                'jenis_kelamin' => $pengajuanKlaim->gender,
            ];

            // Ambil data individual dari hasil_radiologi array untuk field terpisah
            $firstRadiologi = $validated['hasil_radiologi'][0] ?? [];

            // Simpan data sebagai record baru (tidak replace yang lama)
            HasilRadiologi::create([
                'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                'kunjungan_nomor' => $nomorKunjunganFiktif,
                'tindakan_medis_data' => $tindakanMedisData,
                'pasien_data' => $pasienData,
                'tanggal_pemeriksaan' => $validated['tanggal_pemeriksaan'] ?? now()->toDateString(),
                'jenis_pemeriksaan' => $validated['jenis_pemeriksaan'] ?? 'Radiologi',
                'klinis' => $firstRadiologi['klinis'] ?? 'Klinis radiologi fiktif',
                'kesan' => $firstRadiologi['kesan'] ?? 'Kesan radiologi fiktif',
                'usul' => $firstRadiologi['usul'] ?? 'Usul radiologi fiktif',
                'hasil' => $firstRadiologi['hasil'] ?? 'Hasil radiologi fiktif',
                'btk' => $firstRadiologi['btk'] ?? 'BTK radiologi fiktif',
                'saran' => $validated['saran'] ?? 'Saran radiologi fiktif',
                'dokter_radiologi' => $validated['dokter_radiologi'] ?? 'Dokter Radiologi Fiktif',
                'dokter_pengirim' => $validated['dokter_pengirim'] ?? 'Dokter Pengirim',
                'hasil_radiologi' => $validated['hasil_radiologi'],
                'tindakan_id' => $firstRadiologi['tindakanId'] ?? null,
                'nama_tindakan' => json_encode(['NAMA' => $firstRadiologi['namaTindakan'] ?? 'Tindakan Fiktif']),
                'is_fiktif' => true,
                'nomor_kunjungan_fiktif' => $nomorKunjunganFiktif,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Data radiologi fiktif berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error menyimpan radiologi fiktif: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyimpan data: ' . $e->getMessage());
        }
    }

    public function deleteFiktif(Request $request, $id)
    {
        try {
            $hasilRadiologi = HasilRadiologi::findOrFail($id);
            
            // Pastikan hanya data fiktif yang bisa dihapus
            if (!$hasilRadiologi->is_fiktif) {
                return redirect()->back()->with('error', 'Hanya data fiktif yang dapat dihapus');
            }

            $hasilRadiologi->delete();

            return redirect()->back()->with('success', 'Data radiologi fiktif berhasil dihapus');

        } catch (\Exception $e) {
            Log::error('Error menghapus radiologi fiktif: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
