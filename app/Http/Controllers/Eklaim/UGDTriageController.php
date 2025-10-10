<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\UGDTriage;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UGDTriageController extends Controller
{
    public function index(PengajuanKlaim $pengajuan, KunjunganRS $kunjungan)
    {
        $imagePath = public_path('images/kop.png');
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath));
        $imageBase64 = 'data:image/png;base64,' . $imageData;

        // Load data yang sudah disimpan sebelumnya
        $savedData = UGDTriage::where('pengajuan_klaim_id', $pengajuan->id)
            ->where('kunjungan_nomor', $kunjungan->NOMOR)
            ->first();

        return Inertia::render('eklaim/medicalrecord/ugd/triage', [
            'pengajuan' => $pengajuan,
            'kunjungan' => $kunjungan,
            'kop' => $imageBase64,
            'savedData' => $savedData,
        ]);
    }

    public function getTriageData(KunjunganRS $kunjungan)
    {
        try {
            $dataPendaftaran = Pendaftaran::where('NOMOR', $kunjungan->NOPEN)->first();

            $dataPasien = Pasien::where('NORM', $dataPendaftaran->NORM)->first();

            $kunjungan->load([
                'triage.pengguna.pegawai'
            ]);

            return response()->json([
                'kunjungan' => $kunjungan,
                'pasien' => $dataPasien,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function store(Request $request, KunjunganRS $kunjungan)
    {
        try {
            $validated = $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'pasien.nama' => 'required|string',
                'pasien.norm' => 'required|string',
                'pasien.tanggal_lahir' => 'required|string',
                'pasien.jenis_kelamin' => 'required',
                'pasien.dokter' => 'nullable|string',
                'pasien.petugas' => 'nullable|string',
                'pasien.kedatangan_datang_sendiri' => 'nullable|boolean',
                'pasien.kedatangan_pengantar' => 'nullable|string',
                'pasien.kedatangan_alat_transportasi' => 'nullable|string',
                'pasien.kedatangan_polisi' => 'nullable|boolean',
                'pasien.kedatangan_asal_rujukan' => 'nullable|string',
                'pasien.kasus_jenis_kasus' => 'nullable|boolean',
                'pasien.kasus_laka_lantas' => 'nullable|boolean',
                'pasien.kasus_kecelakaan_kerja' => 'nullable|boolean',
                'pasien.kasus_lokasi' => 'nullable|string',
                'pasien.anamnese_terpimpin' => 'nullable|string',
                'pasien.anamnese_keluhan_utama' => 'nullable|string',
                'pasien.tanda_vital_tekanan_darah' => 'nullable|string',
                'pasien.tanda_vital_suhu' => 'nullable|string',
                'pasien.tanda_vital_nadi' => 'nullable|string',
                'pasien.tanda_vital_pernafasan' => 'nullable|string',
                'pasien.tanda_vital_skala_nyeri' => 'nullable|string',
                'pasien.tanda_vital_metode_ukur' => 'nullable|string',
                'pasien.triage_resusitasi' => 'nullable|boolean',
                'pasien.triage_emergency' => 'nullable|boolean',
                'pasien.triage_urgent' => 'nullable|boolean',
                'pasien.triage_less_urgent' => 'nullable|boolean',
                'pasien.triage_non_urgent' => 'nullable|boolean',
                'pasien.triage_doa' => 'nullable|boolean',
                'selectedTriage' => 'nullable|string',
            ]);

            DB::beginTransaction();

            // Hapus data lama untuk pengajuan dan kunjungan ini
            UGDTriage::where('pengajuan_klaim_id', $validated['pengajuan_klaim_id'])
                ->where('kunjungan_nomor', $kunjungan->NOMOR)
                ->delete();

            // Simpan data baru
            UGDTriage::create([
                'pengajuan_klaim_id' => $validated['pengajuan_klaim_id'],
                'kunjungan_nomor' => $kunjungan->NOMOR,
                'nama' => $validated['pasien']['nama'],
                'norm' => $validated['pasien']['norm'],
                'tanggal_lahir' => $validated['pasien']['tanggal_lahir'],
                'jenis_kelamin' => $validated['pasien']['jenis_kelamin'],
                'dokter' => $validated['pasien']['dokter'] ?? null,
                'petugas' => $validated['pasien']['petugas'] ?? null,
                'kedatangan_datang_sendiri' => $validated['pasien']['kedatangan_datang_sendiri'] ?? false,
                'kedatangan_pengantar' => $validated['pasien']['kedatangan_pengantar'] ?? null,
                'kedatangan_alat_transportasi' => $validated['pasien']['kedatangan_alat_transportasi'] ?? null,
                'kedatangan_polisi' => $validated['pasien']['kedatangan_polisi'] ?? false,
                'kedatangan_asal_rujukan' => $validated['pasien']['kedatangan_asal_rujukan'] ?? null,
                'kasus_jenis_kasus' => $validated['pasien']['kasus_jenis_kasus'] ?? false,
                'kasus_laka_lantas' => $validated['pasien']['kasus_laka_lantas'] ?? false,
                'kasus_kecelakaan_kerja' => $validated['pasien']['kasus_kecelakaan_kerja'] ?? false,
                'kasus_lokasi' => $validated['pasien']['kasus_lokasi'] ?? null,
                'anamnese_terpimpin' => $validated['pasien']['anamnese_terpimpin'] ?? null,
                'anamnese_keluhan_utama' => $validated['pasien']['anamnese_keluhan_utama'] ?? null,
                'tanda_vital_tekanan_darah' => $validated['pasien']['tanda_vital_tekanan_darah'] ?? null,
                'tanda_vital_suhu' => $validated['pasien']['tanda_vital_suhu'] ?? null,
                'tanda_vital_nadi' => $validated['pasien']['tanda_vital_nadi'] ?? null,
                'tanda_vital_pernafasan' => $validated['pasien']['tanda_vital_pernafasan'] ?? null,
                'tanda_vital_skala_nyeri' => $validated['pasien']['tanda_vital_skala_nyeri'] ?? null,
                'tanda_vital_metode_ukur' => $validated['pasien']['tanda_vital_metode_ukur'] ?? null,
                'triage_resusitasi' => $validated['pasien']['triage_resusitasi'] ?? false,
                'triage_emergency' => $validated['pasien']['triage_emergency'] ?? false,
                'triage_urgent' => $validated['pasien']['triage_urgent'] ?? false,
                'triage_less_urgent' => $validated['pasien']['triage_less_urgent'] ?? false,
                'triage_non_urgent' => $validated['pasien']['triage_non_urgent'] ?? false,
                'triage_doa' => $validated['pasien']['triage_doa'] ?? false,
                'kategori_triage' => $validated['selectedTriage'] ?? null,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Data Triage berhasil disimpan ke sistem E-Klaim');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error menyimpan data Triage E-Klaim: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Gagal menyimpan data Triage: ' . $e->getMessage());
        }
    }
}
