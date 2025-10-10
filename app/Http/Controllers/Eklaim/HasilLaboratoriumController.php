<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\HasilLaboratorium;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\Pendaftaran;
use App\Models\SIMRS\Tindakan;
use App\Models\SIMRS\Pegawai;
use App\Models\SIMRS\Dokter;
use App\Helpers\QRCodeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HasilLaboratoriumController extends Controller
{
    public function index(PengajuanKlaim $pengajuan, KunjunganRS $kunjungan)
    {
        $imagePath = public_path('images/kop.png');
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath));
        $imageBase64 = 'data:image/png;base64,' . $imageData;

        $tindakan = Tindakan::where('JENIS', 8)
        ->with([
            'parameter_tindakan_lab.satuan'
        ])
        ->get();

        // Load data yang sudah disimpan sebelumnya (data asli dari SIMRS)
        $savedData = HasilLaboratorium::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('kunjungan_nomor', $kunjungan->NOMOR)
            ->where('is_fiktif', false)
            ->first();

        // Load data fiktif untuk pengajuan klaim ini
        $dataFiktif = HasilLaboratorium::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('is_fiktif', true)
            ->get();

        // Load data pegawai dan dokter untuk pilihan petugas medis dan dokter penanggung jawab
        $pegawaiList = Pegawai::whereIn('PROFESI', [1, 2, 3, 4, 5]) // Profesi medis: dokter, perawat, bidan, dll
            ->get();
        
        $dokterList = Dokter::with('pegawai')->get();

        return Inertia::render('eklaim/medicalrecord/laboratorium/hasil', [
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

    public function getHasilLaboratoriumData(KunjunganRS $kunjungan)
    {
        $pendaftaran = Pendaftaran::where('NOMOR', $kunjungan->NOPEN)->first();
        $pasien = Pasien::where('NORM', $pendaftaran->NORM)->first();
        $kunjungan->load([
            'tindakan_medis.hasil_laboratorium.parameter_tindakan_lab',
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
                'hasil_laboratorium' => 'required|array',
                'tanggal_pemeriksaan' => 'nullable|string',
                'dokter_pengirim' => 'nullable|string',
                'dokter_penanggung_jawab' => 'nullable|string',
                'petugas_medis_id' => 'nullable|string',
                'petugas_medis_nama' => 'nullable|string',
                'dokter_penanggung_jawab_id' => 'nullable|string',
                'dokter_penanggung_jawab_nama' => 'nullable|string',
            ]);

            DB::beginTransaction();

            // Hapus data lama untuk pengajuan dan kunjungan ini
            HasilLaboratorium::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
                ->where('kunjungan_nomor', $validated['kunjungan_nomor'])
                ->delete();

            // Prepare data sesuai dengan struktur database
            $tindakanMedisData = [
                'hasil_laboratorium' => $validated['hasil_laboratorium'],
                'tanggal_pemeriksaan' => $validated['tanggal_pemeriksaan'] ?? now()->toDateString(),
                'dokter_pengirim' => $validated['dokter_pengirim'] ?? '-',
                'dokter_penanggung_jawab' => $validated['dokter_penanggung_jawab'] ?? '-',
                'petugas_medis_id' => $validated['petugas_medis_id'] ?? null,
                'petugas_medis_nama' => $validated['petugas_medis_nama'] ?? null,
                'dokter_penanggung_jawab_id' => $validated['dokter_penanggung_jawab_id'] ?? null,
                'dokter_penanggung_jawab_nama' => $validated['dokter_penanggung_jawab_nama'] ?? null,
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

            // Simpan data sesuai struktur model
            HasilLaboratorium::create([
                'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                'kunjungan_nomor' => $validated['kunjungan_nomor'],
                'tindakan_medis_data' => $tindakanMedisData,
                'pasien_data' => $pasienData,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Data hasil laboratorium berhasil disimpan');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error menyimpan hasil laboratorium: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyimpan data hasil laboratorium: ' . $e->getMessage());
        }
    }

    public function storeFiktif(Request $request)
    {
        try {
            $validated = $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'hasil_laboratorium' => 'required|array',
                'tanggal_pemeriksaan' => 'nullable|string',
                'dokter_pengirim' => 'nullable|string',
                'dokter_penanggung_jawab' => 'nullable|string',
                'petugas_medis_id' => 'nullable|string',
                'petugas_medis_nama' => 'nullable|string',
                'dokter_penanggung_jawab_id' => 'nullable|string',
                'dokter_penanggung_jawab_nama' => 'nullable|string',
            ]);

            DB::beginTransaction();

            $pengajuanKlaim = PengajuanKlaim::findOrFail($validated['pengajuan_klaim_id']);

            // Generate nomor kunjungan fiktif unik dengan timestamp untuk setiap record baru
            $nomorKunjunganFiktif = 'FIKTIF-LAB-' . $validated['pengajuan_klaim_id'] . '-' . time() . '-' . uniqid();

            // TIDAK menghapus data fiktif lama - biarkan tetap ada untuk menambah record baru
            // HasilLaboratorium::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
            //     ->where('is_fiktif', true)
            //     ->delete();

            // Prepare data sesuai dengan struktur database (sama persis dengan store asli)
            $tindakanMedisData = [
                'hasil_laboratorium' => $validated['hasil_laboratorium'],
                'tanggal_pemeriksaan' => $validated['tanggal_pemeriksaan'] ?? now()->toDateString(),
                'dokter_pengirim' => $validated['dokter_pengirim'] ?? '-',
                'dokter_penanggung_jawab' => $validated['dokter_penanggung_jawab'] ?? '-',
                'petugas_medis_id' => $validated['petugas_medis_id'] ?? null,
                'petugas_medis_nama' => $validated['petugas_medis_nama'] ?? null,
                'dokter_penanggung_jawab_id' => $validated['dokter_penanggung_jawab_id'] ?? null,
                'dokter_penanggung_jawab_nama' => $validated['dokter_penanggung_jawab_nama'] ?? null,
            ];

            // Data pasien dari pengajuan klaim
            $pasienData = [
                'nama' => $pengajuanKlaim->nama_pasien,
                'norm' => $pengajuanKlaim->norm,
                'tanggal_lahir' => $pengajuanKlaim->tgl_lahir,
                'jenis_kelamin' => $pengajuanKlaim->gender,
            ];

            // Simpan data sebagai record baru (tidak replace yang lama)
            HasilLaboratorium::create([
                'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                'kunjungan_nomor' => $nomorKunjunganFiktif,
                'tindakan_medis_data' => $tindakanMedisData,
                'pasien_data' => $pasienData,
                'is_fiktif' => true,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Data laboratorium fiktif berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error menyimpan laboratorium fiktif: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyimpan data: ' . $e->getMessage());
        }
    }

    public function deleteFiktif(Request $request, $id)
    {
        try {
            $hasilLab = HasilLaboratorium::findOrFail($id);
            
            // Pastikan hanya data fiktif yang bisa dihapus
            if (!$hasilLab->is_fiktif) {
                return redirect()->back()->with('error', 'Hanya data fiktif yang dapat dihapus');
            }

            $hasilLab->delete();

            return redirect()->back()->with('success', 'Data laboratorium fiktif berhasil dihapus');

        } catch (\Exception $e) {
            Log::error('Error menghapus laboratorium fiktif: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
