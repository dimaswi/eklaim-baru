<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\Pendaftaran;
use App\Models\SIMRS\Penjamin;
use App\Models\SIMRS\RincianTagihan;
use App\Models\SIMRS\TagihanPendaftaran;
use App\Models\Eklaim\Tagihan;
use App\Models\SIMRS\Barang;
use App\Models\SIMRS\PembayaranTagihan;
use App\Models\SIMRS\Tindakan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagihanController extends Controller
{
    public function index(PengajuanKlaim $pengajuan)
    {
        $imagePath = public_path('images/kop.png');
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath));
        $imageBase64 = 'data:image/png;base64,' . $imageData;

        $penjamin = Penjamin::where('NOMOR', $pengajuan->nomor_sep)->first();
        $kunjungan = KunjunganRS::where('NOPEN', $penjamin->NOPEN)->first();

        // Cek apakah ada data tagihan yang sudah disimpan
        $savedTagihan = null;
        if ($kunjungan) {
            $savedTagihan = Tagihan::where('pengajuan_klaim_id', $pengajuan->id)
                ->where('nomor_kunjungan', $kunjungan->NOMOR)
                ->first();
        }

        return Inertia::render('eklaim/tagihan/index', [
            'pengajuan' => $pengajuan,
            'kop' => $imageBase64,
            'kunjungan' => $kunjungan,
            'savedTagihan' => $savedTagihan,
            'tindakan' => Tindakan::with('tarif_tindakan')->get(),
            'obat' => Barang::with('harga_barang')->get()
        ]);
    }

    public function getTagihanData(KunjunganRS $kunjungan)
    {
        $pendaftaran = Pendaftaran::where('NOMOR', $kunjungan->NOPEN)->first();
        $pasien = Pasien::where('NORM', $pendaftaran->NORM)
            ->with([
                'desa',
                'kecamatan',
                'kabupaten',
                'provinsi',
            ])
            ->first();

        // Cari tagihan dengan STATUS = 1, prioritas UTAMA = 1 jika ada lebih dari satu
        $tagihan_pendaftaran = TagihanPendaftaran::where('PENDAFTARAN', $kunjungan->NOPEN)
            ->where('STATUS', 1)
            ->orderBy('UTAMA', 'DESC') // UTAMA = 1 akan diprioritaskan
            ->first();

        $rincian_tagihan = [];
        if ($tagihan_pendaftaran) {
            $rincian_tagihan = RincianTagihan::where('TAGIHAN', $tagihan_pendaftaran->TAGIHAN)
                ->with([
                    'tarif_administrasi.nama_tarif',     // JENIS = 1
                    'tarif_ruang_rawat',      // JENIS = 2
                    'tarif_tindakan.nama_tindakan',         // JENIS = 3
                    'tarif_harga_barang.nama_barang',     // JENIS = 4
                    'tarif_paket',            // JENIS = 5
                    'tarif_o2'                // JENIS = 6
                ])
                ->get();
        }

        $pembayaran_tagihan = PembayaranTagihan::where('TAGIHAN', $tagihan_pendaftaran->TAGIHAN)
            ->with([
                'transaksi_kasir.pengguna.pegawai'
            ])
            ->first();

        return response()->json([
            'kunjungan' => $kunjungan,
            'pasien' => $pasien,
            'rincian_tagihan' => $rincian_tagihan,
            'nama_petugas' => $pembayaran_tagihan->transaksi_kasir->pengguna->pegawai->NAMA ?? '-',
        ]);
    }

    public function store(Request $request, PengajuanKlaim $pengajuan)
    {
        $request->validate([
            'nomor_kunjungan' => 'required|string',
            'data_pasien' => 'required|string',
            'rincian_tagihan' => 'required|string',
            'total_tagihan' => 'required|numeric|min:0',
            'nama_petugas' => 'nullable|string',
        ]);

        // Decode JSON strings
        $dataPasien = json_decode($request->data_pasien, true);
        $rincianTagihan = json_decode($request->rincian_tagihan, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return back()->withErrors(['error' => 'Data tidak valid']);
        }

        $tagihan = Tagihan::updateOrCreate(
            [
                'pengajuan_klaim_id' => $pengajuan->id,
                'nomor_kunjungan' => $request->nomor_kunjungan,
            ],
            [
                'nama_petugas' => $request->nama_petugas,
                'data_pasien' => $dataPasien,
                'rincian_tagihan' => $rincianTagihan,
                'total_tagihan' => $request->total_tagihan,
            ]
        );

        return back()->with('success', 'Data tagihan berhasil disimpan');
    }
}
