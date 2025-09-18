<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\RawatInapPengkajianAwal;
use App\Models\Eklaim\RawatInapResumeMedis;
use App\Models\Eklaim\RawatJalanPengkajianAwal;
use App\Models\Eklaim\RawatJalanResumeMedis;
use App\Models\SIMRS\KunjunganBPJS;
use App\Models\SIMRS\Penjamin;
use App\Models\SIMRS\ResumeMedis;
use App\Models\SIMRS\Tagihan;
use App\Models\SIMRS\TagihanPendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KlaimController extends Controller
{
    public function index(PengajuanKlaim $pengajuanKlaim)
    {

        $referenceData = $this->loadReferenceData();
        $resumeMedisData = $this->loadResumeMedisData($pengajuanKlaim->id);
        $pengkajianAwalData = $this->loadPengkajianAwalData($pengajuanKlaim->id);
        $kunjunganbpjsData = $this->loadKujunganData($pengajuanKlaim->nomor_sep);
        $dataTagihan = $this->loadDataTarif($pengajuanKlaim->nomor_sep);

        return Inertia::render('eklaim/klaim/index', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'referenceData' => $referenceData,
            'resumeMedisData' => $resumeMedisData,
            'pengkajianAwalData' => $pengkajianAwalData,
            'kunjunganbpjsData' => $kunjunganbpjsData,
            'dataTagihan' => $dataTagihan,
        ]);
    }

    public function loadReferenceData()
    {
        return [
            'cara_masuk_options' => [
                ['value' => 'gp', 'label' => 'Rujukan FKTP'],
                ['value' => 'hosp-trans', 'label' => 'Rujukan FKRTL'],
                ['value' => 'mp', 'label' => 'Rujukan Spesialis'],
                ['value' => 'outp', 'label' => 'Dari Rawat Jalan'],
                ['value' => 'inp', 'label' => 'Dari Rawat Inap'],
                ['value' => 'emd', 'label' => 'Dari Rawat Darurat'],
                ['value' => 'born', 'label' => 'Lahir di RS'],
                ['value' => 'nursing', 'label' => 'Rujukan Panti Jompo'],
                ['value' => 'psych', 'label' => 'Rujukan dari RS Jiwa'],
                ['value' => 'rehab', 'label' => 'Rujukan Fasilitas Rehab'],
                ['value' => 'other', 'label' => 'Lain-lain'],
            ],
            'jenis_rawat_options' => [
                ['value' => '1', 'label' => 'Rawat Inap'],
                ['value' => '2', 'label' => 'Rawat Jalan'],
                ['value' => '3', 'label' => 'Rawat IGD'],
            ],
            'kelas_rawat_options' => [
                ['value' => '3', 'label' => 'Kelas 3'],
                ['value' => '2', 'label' => 'Kelas 2'],
                ['value' => '1', 'label' => 'Kelas 1'],
            ],
            'discharge_status_options' => [
                ['value' => '1', 'label' => 'Atas persetujuan dokter'],
                ['value' => '2', 'label' => 'Dirujuk'],
                ['value' => '3', 'label' => 'Atas permintaan sendiri'],
                ['value' => '4', 'label' => 'Meninggal'],
                ['value' => '5', 'label' => 'Lain-lain'],
            ],
            'upgrade_class_options' => [
                ['value' => 'kelas_1', 'label' => 'Naik ke Kelas 1'],
                ['value' => 'kelas_2', 'label' => 'Naik ke Kelas 2'],
                ['value' => 'vip', 'label' => 'Naik ke VIP'],
                ['value' => 'vvip', 'label' => 'Naik ke VVIP'],
            ],
            'upgrade_payor_options' => [
                ['value' => 'peserta', 'label' => 'Peserta'],
                ['value' => 'pemberi_kerja', 'label' => 'Pemberi Kerja'],
                ['value' => 'asuransi_tambahan', 'label' => 'Asuransi Tambahan'],
            ],
            'covid19_status_options' => [
                ['value' => '4', 'label' => 'Suspek'],
                ['value' => '5', 'label' => 'Probabel'],
                ['value' => '3', 'label' => 'Terkonfirmasi Positif COVID-19'],
            ],
            'nomor_kartu_t_options' => [
                ['value' => 'nik', 'label' => 'NIK'],
                ['value' => 'kitas', 'label' => 'KITAS/KITAP'],
                ['value' => 'paspor', 'label' => 'Passport'],
                ['value' => 'kartu_jkn', 'label' => 'Kartu JKN'],
                ['value' => 'kk', 'label' => 'Kartu Keluarga'],
                ['value' => 'unhcr', 'label' => 'Dokumen UNHCR'],
                ['value' => 'kelurahan', 'label' => 'Dokumen Kelurahan'],
                ['value' => 'dinsos', 'label' => 'Dokumen Dinsos'],
                ['value' => 'dinkes', 'label' => 'Dokumen Dinkes'],
                ['value' => 'sjp', 'label' => 'SJP'],
                ['value' => 'klaim_ibu', 'label' => 'Klaim Ibu'],
                ['value' => 'lainnya', 'label' => 'Lainnya'],
            ],
        ];
    }

    public function loadResumeMedisData($pengajuanKlaimId)
    {
        $data = RawatInapResumeMedis::where('pengajuan_klaim_id', $pengajuanKlaimId)->first();
        if (!$data) {
            $data = RawatJalanResumeMedis::where('pengajuan_klaim_id', $pengajuanKlaimId)->first();
        }
        return $data;
    }

    public function loadPengkajianAwalData($pengajuanKlaimId)
    {
        $data = RawatInapPengkajianAwal::where('pengajuan_klaim_id', $pengajuanKlaimId)->first();
        if (!$data) {
            $data = RawatJalanPengkajianAwal::where('pengajuan_klaim_id', $pengajuanKlaimId)->first();
        }
        return $data;
    }

    public function loadKujunganData($nomorSEP)
    {
        $data = KunjunganBPJS::where('noSEP', $nomorSEP)->first();
        return $data;
    }

    public function loadDataTarif($nomorSEP)
    {
        $dataBPJS = Penjamin::where('NOMOR', $nomorSEP)->first();
        $dataPembayaran = TagihanPendaftaran::where('PENDAFTARAN', $dataBPJS->NOPEN)->first();
        $data = Tagihan::where('ID', $dataPembayaran->TAGIHAN)->first();
        return $data;
    }
}
