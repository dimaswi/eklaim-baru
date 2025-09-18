<?php

namespace App\Http\Controllers;

use App\Models\Eklaim\HasilLaboratorium;
use App\Models\Eklaim\HasilRadiologi;
use App\Models\Eklaim\PengajuanKlaim;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KunjunganFiktifController extends Controller
{
    public function laboratorium($pengajuanKlaimId)
    {
        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanKlaimId);
        
        return Inertia::render('eklaim/kunjungan-fiktif/laboratorium', [
            'pengajuanKlaim' => $pengajuanKlaim,
        ]);
    }

    public function radiologi($pengajuanKlaimId)
    {
        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanKlaimId);
        
        return Inertia::render('eklaim/kunjungan-fiktif/radiologi', [
            'pengajuanKlaim' => $pengajuanKlaim,
        ]);
    }

    public function storeLaboratorium(Request $request, $pengajuanKlaimId)
    {
        $request->validate([
            'nomor_kunjungan_fiktif' => 'required|string',
            'template_data' => 'required|array',
        ]);

        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanKlaimId);

        // Buat template data laboratorium kosong
        $templateData = [
            'jenis_pemeriksaan' => $request->template_data['jenis_pemeriksaan'] ?? '',
            'hasil_normal' => $request->template_data['hasil_normal'] ?? '',
            'hasil_abnormal' => $request->template_data['hasil_abnormal'] ?? '',
            'catatan_dokter' => $request->template_data['catatan_dokter'] ?? '',
            'tanggal_pemeriksaan' => $request->template_data['tanggal_pemeriksaan'] ?? now()->format('Y-m-d'),
            'dokter_pemeriksa' => $request->template_data['dokter_pemeriksa'] ?? '',
        ];

        // Data pasien dari pengajuan klaim
        $pasienData = [
            'norm' => $pengajuanKlaim->norm,
            'nama' => $pengajuanKlaim->nama_pasien,
            'tanggal_lahir' => $pengajuanKlaim->tanggal_lahir,
            'jenis_kelamin' => $pengajuanKlaim->jenis_kelamin,
            'alamat' => $pengajuanKlaim->alamat,
        ];

        // Simpan ke tabel hasil_laboratoriums
        HasilLaboratorium::updateOrCreate(
            [
                'pengajuan_klaim_id' => $pengajuanKlaimId,
                'nomor_kunjungan_fiktif' => $request->nomor_kunjungan_fiktif,
                'is_fiktif' => true,
            ],
            [
                'kunjungan_nomor' => $request->nomor_kunjungan_fiktif,
                'tindakan_medis_data' => [$templateData],
                'pasien_data' => $pasienData,
                'template_data' => $templateData,
            ]
        );

        return redirect()->back()->with('success', 'Kunjungan fiktif laboratorium berhasil dibuat');
    }

    public function storeRadiologi(Request $request, $pengajuanKlaimId)
    {
        $request->validate([
            'nomor_kunjungan_fiktif' => 'required|string',
            'template_data' => 'required|array',
        ]);

        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanKlaimId);

        // Buat template data radiologi kosong
        $templateData = [
            'jenis_pemeriksaan' => $request->template_data['jenis_pemeriksaan'] ?? '',
            'hasil_radiologi' => $request->template_data['hasil_radiologi'] ?? '',
            'kesan' => $request->template_data['kesan'] ?? '',
            'saran' => $request->template_data['saran'] ?? '',
            'tanggal_pemeriksaan' => $request->template_data['tanggal_pemeriksaan'] ?? now()->format('Y-m-d'),
            'dokter_radiologi' => $request->template_data['dokter_radiologi'] ?? '',
            'dokter_pengirim' => $request->template_data['dokter_pengirim'] ?? '',
        ];

        // Data pasien dari pengajuan klaim
        $pasienData = [
            'norm' => $pengajuanKlaim->norm,
            'nama' => $pengajuanKlaim->nama_pasien,
            'tanggal_lahir' => $pengajuanKlaim->tanggal_lahir,
            'jenis_kelamin' => $pengajuanKlaim->jenis_kelamin,
            'alamat' => $pengajuanKlaim->alamat,
        ];

        // Simpan ke tabel hasil_radiologis dengan struktur yang sama seperti laboratorium
        HasilRadiologi::updateOrCreate(
            [
                'pengajuan_klaim_id' => $pengajuanKlaimId,
                'nomor_kunjungan_fiktif' => $request->nomor_kunjungan_fiktif,
                'is_fiktif' => true,
            ],
            [
                'kunjungan_nomor' => $request->nomor_kunjungan_fiktif,
                'tindakan_medis_data' => [$templateData],
                'pasien_data' => $pasienData,
                'template_data' => $templateData,
            ]
        );

        return redirect()->back()->with('success', 'Kunjungan fiktif radiologi berhasil dibuat');
    }

    public function hapusLaboratorium($pengajuanKlaimId, $id)
    {
        HasilLaboratorium::where([
            'pengajuan_klaim_id' => $pengajuanKlaimId,
            'id' => $id,
            'is_fiktif' => true,
        ])->delete();

        return redirect()->back()->with('success', 'Kunjungan fiktif laboratorium berhasil dihapus');
    }

    public function hapusRadiologi($pengajuanKlaimId, $id)
    {
        HasilRadiologi::where([
            'pengajuan_klaim_id' => $pengajuanKlaimId,
            'id' => $id,
            'is_fiktif' => true,
        ])->delete();

        return redirect()->back()->with('success', 'Kunjungan fiktif radiologi berhasil dihapus');
    }

    public function daftarKunjunganFiktif($pengajuanKlaimId)
    {
        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanKlaimId);

        $laboratorium = HasilLaboratorium::where([
            'pengajuan_klaim_id' => $pengajuanKlaimId,
            'is_fiktif' => true,
        ])->get();

        $radiologi = HasilRadiologi::where([
            'pengajuan_klaim_id' => $pengajuanKlaimId,
            'is_fiktif' => true,
        ])->get();

        return Inertia::render('eklaim/kunjungan-fiktif/daftar', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'laboratorium' => $laboratorium,
            'radiologi' => $radiologi,
        ]);
    }
}
