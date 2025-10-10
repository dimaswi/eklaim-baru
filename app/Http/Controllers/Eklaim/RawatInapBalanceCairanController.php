<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\RawatInapBalanceCairan;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RawatInapBalanceCairanController extends Controller
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
        $savedData = RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('kunjungan_nomor', $kunjungan->NOMOR)
            ->get(); // Ambil semua data, bukan first()

        return Inertia::render('eklaim/medicalrecord/rawat-inap/balance-cairan', [
            'pengajuan' => $pengajuan,
            'kunjungan' => $kunjungan,
            'kop' => $imageBase64,
            'petugas' => $petugas,
            'savedData' => ['balance_cairan_data' => ['balance_cairan' => $savedData]], // Format sesuai dengan useEffect
        ]);
    }

    public function getBalanceCairanData(KunjunganRS $kunjungan)
    {
        $kunjungan->load([
            'balance_cairan',
            'balance_cairan.oleh.pegawai.profesi',
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
                'balance_cairan_data' => 'required|array',
                'balance_cairan_data.*.intake_oral' => 'required|string',
                'balance_cairan_data.*.intake_ngt' => 'required|string',
                'balance_cairan_data.*.konsumsi_jumlah' => 'required|string',
                'balance_cairan_data.*.transfusi_produk' => 'nullable|string',
                'balance_cairan_data.*.transfusi_produk_jumlah' => 'required|string',
                'balance_cairan_data.*.output_oral' => 'required|string',
                'balance_cairan_data.*.output_ngt' => 'required|string',
                'balance_cairan_data.*.urine_jumlah' => 'required|string',
                'balance_cairan_data.*.pendarahan_jumlah' => 'required|string',
                'balance_cairan_data.*.fases_jumlah' => 'required|string',
                'balance_cairan_data.*.total_intake' => 'required|string',
                'balance_cairan_data.*.total_output' => 'required|string',
                'balance_cairan_data.*.volume_intake' => 'required|string',
                'balance_cairan_data.*.volume_output' => 'required|string',
                'balance_cairan_data.*.volume_balance' => 'required|string',
                'balance_cairan_data.*.suhu' => 'required|string',
                'balance_cairan_data.*.waktu_pemeriksaan' => 'required|string',
                'balance_cairan_data.*.tanggal' => 'required|string',
                'balance_cairan_data.*.nama_petugas' => 'required|string',
            ]);

            DB::beginTransaction();

            // Hapus data lama untuk pengajuan dan kunjungan ini
            RawatInapBalanceCairan::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
                ->where('kunjungan_nomor', $validated['kunjungan_nomor'])
                ->delete();

            // Simpan data baru
            foreach ($validated['balance_cairan_data'] as $balanceData) {
                RawatInapBalanceCairan::create([
                    'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                    'kunjungan_nomor' => $validated['kunjungan_nomor'],
                    'intake_oral' => $balanceData['intake_oral'],
                    'intake_ngt' => $balanceData['intake_ngt'],
                    'konsumsi_jumlah' => $balanceData['konsumsi_jumlah'],
                    'transfusi_produk' => $balanceData['transfusi_produk'],
                    'transfusi_produk_jumlah' => $balanceData['transfusi_produk_jumlah'],
                    'output_oral' => $balanceData['output_oral'],
                    'output_ngt' => $balanceData['output_ngt'],
                    'urine_jumlah' => $balanceData['urine_jumlah'],
                    'pendarahan_jumlah' => $balanceData['pendarahan_jumlah'],
                    'fases_jumlah' => $balanceData['fases_jumlah'],
                    'total_intake' => $balanceData['total_intake'],
                    'total_output' => $balanceData['total_output'],
                    'volume_intake' => $balanceData['volume_intake'],
                    'volume_output' => $balanceData['volume_output'],
                    'volume_balance' => $balanceData['volume_balance'],
                    'suhu' => $balanceData['suhu'],
                    'waktu_pemeriksaan' => $balanceData['waktu_pemeriksaan'],
                    'tanggal' => $balanceData['tanggal'],
                    'nama_petugas' => $balanceData['nama_petugas'],
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Data Balance Cairan berhasil disimpan ke sistem E-Klaim');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error menyimpan data Balance Cairan E-Klaim: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Gagal menyimpan data Balance Cairan: ' . $e->getMessage());
        }
    }
}
