<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\RawatInapCPPT;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RawatInapCPPTController extends Controller
{

    public function index(PengajuanKlaim $pengajuan, KunjunganRS $kunjungan)
    {
        $imagePath = public_path('images/kop.png');
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath));
        $imageBase64 = 'data:image/png;base64,' . $imageData;

        $petugas = Pegawai::all();

        // Load data yang sudah disimpan sebelumnya
        $savedData = RawatInapCPPT::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('kunjungan_nomor', $kunjungan->NOMOR)
            ->get(); // Ambil semua data, bukan first()

        return Inertia::render('eklaim/medicalrecord/rawat-inap/cppt', [
            'pengajuan' => $pengajuan,
            'kunjungan' => $kunjungan,
            'kop' => $imageBase64,
            'petugas' => $petugas,
            'savedData' => ['cppt_data' => ['cppt' => $savedData]], // Format sesuai dengan useEffect
        ]);
    }

    public function getCPPTData(KunjunganRS $kunjungan)
    {
        $kunjungan->load([
            'cppt',
            'cppt.oleh.pegawai.profesi',
        ]);

        return response()->json([
            'kunjungan' => $kunjungan
        ]);
    }

    public function store(Request $request, KunjunganRS $kunjungan = null)
    {
        try {
            $validated = $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'kunjungan_nomor' => 'required|string',
                'cppt_data' => 'required|array',
                'cppt_data.*.tanggal' => 'required|string',
                'cppt_data.*.profesi' => 'required|string',
                'cppt_data.*.subyektif' => 'nullable|string',
                'cppt_data.*.obyektif' => 'nullable|string',
                'cppt_data.*.assesment' => 'nullable|string',
                'cppt_data.*.planning' => 'nullable|string',
                'cppt_data.*.instruksi' => 'nullable|string',
                'cppt_data.*.nama_petugas' => 'required|string',
            ]);

            DB::beginTransaction();

            // Hapus data lama untuk pengajuan dan kunjungan ini
            RawatInapCPPT::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
                ->where('kunjungan_nomor', $validated['kunjungan_nomor'])
                ->delete();

            // Simpan data baru
            foreach ($validated['cppt_data'] as $cpptData) {
                RawatInapCPPT::create([
                    'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                    'kunjungan_nomor' => $validated['kunjungan_nomor'],
                    'tanggal' => $cpptData['tanggal'],
                    'profesi' => $cpptData['profesi'],
                    'subyektif' => $cpptData['subyektif'],
                    'obyektif' => $cpptData['obyektif'],
                    'assesment' => $cpptData['assesment'],
                    'planning' => $cpptData['planning'],
                    'instruksi' => $cpptData['instruksi'],
                    'nama_petugas' => $cpptData['nama_petugas'],
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Data CPPT berhasil disimpan ke sistem E-Klaim');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error menyimpan data CPPT E-Klaim: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Gagal menyimpan data CPPT: ' . $e->getMessage());
        }
    }
}
