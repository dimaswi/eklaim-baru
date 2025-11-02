<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\UGDPengkajianAwal;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UGDPengkajianAwalController extends Controller
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
        $savedData = UGDPengkajianAwal::where('pengajuan_klaim_id', $pengajuan->id)
            ->first();

        return Inertia::render('eklaim/medicalrecord/ugd/pengkajian-awal', [
            'pengajuan' => $pengajuan,
            'kunjungan' => $kunjungan,
            'kop' => $imageBase64,
            'savedData' => $savedData,
        ]);
    }

    public function getPengkajianAwalData(KunjunganRS $kunjungan)
    {
        $dataPendaftaran = Pendaftaran::where('NOMOR', $kunjungan->NOPEN)->first();

        $dataPasien = Pasien::where('NORM', $dataPendaftaran->NORM)->first();

        $kunjungan->load([
            'anamnesis',
            'rpp',
            'ruangan',
            'order_resep_pulang.order_resep_detil.nama_obat',
            'anamnesis_diperoleh',
            'keluhan_utama',
            'riwayat_penyakit_keluarga',
            'faktor_resiko',
            'tanda_vital',
            'penilaian_nyeri.metode',
            'edukasi_pasien',
            'diagnosa',
            'rencana_terapi',
            'dokter.pegawai',
        ]);

        return response()->json([
            'kunjungan' => $kunjungan,
            'pasien' => $dataPasien,
        ]);
    }

    public function store(Request $request)
    {
        // Debug: Log incoming request data
        Log::info('UGD Pengkajian Awal Store Request', [
            'request_data_keys' => array_keys($request->all()),
            'request_method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'has_token' => $request->has('_token'),
            'pengajuan_klaim_id' => $request->get('pengajuan_klaim_id')
        ]);

        $validated = $request->validate([
            'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
            'kunjungan_nomor' => 'nullable|string',
            
            // Identitas Pasien
            'nama' => 'nullable|string',
            'norm' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string',
            'tanggal_masuk' => 'nullable|date',
            'tanggal_keluar' => 'nullable|date',
            'alamat' => 'nullable|string',
            'ruangan' => 'nullable|string',
            
            // Anamnesis
            'autoanamnesis' => 'nullable|string',
            'alloanamnesis' => 'nullable|string',
            'anamnesis_dari' => 'nullable|string',
            'keluhan_utama' => 'nullable|string',
            'riwayat_penyakit_sekarang' => 'nullable|string',
            'riwayat_penyakit_dahulu' => 'nullable|string',
            'faktor_resiko' => 'nullable|string',
            
            // Tanda Vital
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
            
            // Pemeriksaan Fisik
            'mata' => 'nullable|string',
            'pupil' => 'nullable|string',
            'ikterus' => 'nullable|string',
            'diameter_pupil' => 'nullable|string',
            'udem_palpebrae' => 'nullable|string',
            'tht' => 'nullable|string',
            'faring' => 'nullable|string',
            'tongsil' => 'nullable|string',
            'lidah' => 'nullable|string',
            'bibir' => 'nullable|string',
            'leher' => 'nullable|string',
            'jvp' => 'nullable|string',
            'limfe' => 'nullable|string',
            'kaku_kuduk' => 'nullable|string',
            'thoraks' => 'nullable|string',
            'cor' => 'nullable|string',
            's1s2' => 'nullable|string',
            'mur_mur' => 'nullable|string',
            'pulmo' => 'nullable|string',
            'ronchi' => 'nullable|string',
            'wheezing' => 'nullable|string',
            'peristaltik' => 'nullable|string',
            'abdomen' => 'nullable|string',
            'meteorismus' => 'nullable|string',
            'asites' => 'nullable|string',
            'nyeri_tekan' => 'nullable|string',
            'hepar' => 'nullable|string',
            'lien' => 'nullable|string',
            'extremitas' => 'nullable|string',
            'udem' => 'nullable|string',
            'defeksesi' => 'nullable|string',
            'urin' => 'nullable|string',
            'kelainan' => 'nullable|string',
            'lainnya' => 'nullable|string',
            
            // Riwayat Alergi
            'riwayat_alergi' => 'nullable|string',
            
            // Penilaian Nyeri
            'nyeri' => 'nullable|string',
            'onset' => 'nullable|string',
            'pencetus' => 'nullable|string',
            'lokasi_nyeri' => 'nullable|string',
            'gambaran_nyeri' => 'nullable|string',
            'durasi_nyeri' => 'nullable|string',
            'skala_nyeri' => 'nullable|string',
            'metode_nyeri' => 'nullable|string',
            
            // Medical
            'masalah_medis' => 'nullable|string',
            'diagnosis_medis' => 'nullable|string',
            'rencana_terapi' => 'nullable|string',
            'selected_diagnosa' => 'nullable|string',
            
            // Dokter dan Petugas
            'dokter' => 'nullable|string',
            'petugas' => 'nullable|string',
            
            // Frontend boolean fields akan digroupkan dalam store method - specific validation removed
        ]);

        // Group related fields into JSON - handle all request data
        $statusPsikologi = [];
        $statusMentalHubungan = [];
        $tempatTinggal = [];
        $spiritual = [];
        $ekonomi = [];
        $edukasi = [];

        foreach($request->all() as $key => $value) {
            // Skip CSRF and other system fields
            if(in_array($key, ['_token', '_method'])) {
                continue;
            }
            
            if(str_starts_with($key, 'status_psikologi_')) {
                $statusPsikologi[$key] = $value;
            } elseif(str_starts_with($key, 'status_mental_') || str_starts_with($key, 'hubungan_keluarga_')) {
                $statusMentalHubungan[$key] = $value;
            } elseif(str_starts_with($key, 'tempat_tinggal_')) {
                $tempatTinggal[$key] = $value;
            } elseif(str_starts_with($key, 'spiritual_')) {
                $spiritual[$key] = $value;
            } elseif(str_starts_with($key, 'ekonomi_') || str_starts_with($key, 'pengambilan_keputusan_')) {
                $ekonomi[$key] = $value;
            } elseif(str_starts_with($key, 'edukasi_')) {
                $edukasi[$key] = $value;
            }
        }

        // Start with all request data and filter out grouped fields
        $filteredData = collect($request->all())->reject(function($value, $key) {
            return in_array($key, ['_token', '_method']) ||
                   str_starts_with($key, 'status_psikologi_') ||
                   str_starts_with($key, 'status_mental_') ||
                   str_starts_with($key, 'hubungan_keluarga_') ||
                   str_starts_with($key, 'tempat_tinggal_') ||
                   str_starts_with($key, 'spiritual_') ||
                   str_starts_with($key, 'ekonomi_') ||
                   str_starts_with($key, 'pengambilan_keputusan_') ||
                   str_starts_with($key, 'edukasi_');
        })->toArray();

        $filteredData['status_psikologi'] = $statusPsikologi;
        $filteredData['status_mental_hubungan'] = $statusMentalHubungan;
        $filteredData['tempat_tinggal'] = $tempatTinggal;
        $filteredData['spiritual'] = $spiritual;
        $filteredData['ekonomi'] = $ekonomi;
        $filteredData['edukasi'] = $edukasi;

        // Handle selected_diagnosa JSON string
        if (isset($filteredData['selected_diagnosa']) && is_string($filteredData['selected_diagnosa'])) {
            $filteredData['selected_diagnosa'] = json_decode($filteredData['selected_diagnosa'], true);
        }

        // Debug: Log final data before save
        Log::info('UGD Final Data Before Save', [
            'filtered_data_keys' => array_keys($filteredData),
            'has_pengajuan_klaim_id' => isset($filteredData['pengajuan_klaim_id']),
            'status_psikologi_count' => count($statusPsikologi),
            'status_psikologi_data' => $statusPsikologi,
            'edukasi_count' => count($edukasi),
            'edukasi_data' => $edukasi,
            'spiritual_count' => count($spiritual),
            'ekonomi_count' => count($ekonomi)
        ]);

        // Check if record exists, update or create
        $pengkajianAwal = UGDPengkajianAwal::updateOrCreate(
            ['pengajuan_klaim_id' => $filteredData['pengajuan_klaim_id']],
            $filteredData
        );

        Log::info('UGD Data Saved Successfully', [
            'id' => $pengkajianAwal->id,
            'pengajuan_klaim_id' => $pengkajianAwal->pengajuan_klaim_id
        ]);

        return redirect()->back()->with('success', 'Data pengkajian awal UGD berhasil disimpan');
    }

    public function update(Request $request, $id)
    {
        $pengkajianAwal = UGDPengkajianAwal::findOrFail($id);

        $validated = $request->validate([
            'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
            'kunjungan_nomor' => 'nullable|string',
            
            // Identitas Pasien
            'nama' => 'nullable|string',
            'norm' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string',
            'tanggal_masuk' => 'nullable|date',
            'tanggal_keluar' => 'nullable|date',
            'alamat' => 'nullable|string',
            'ruangan' => 'nullable|string',
            
            // Anamnesis
            'autoanamnesis' => 'nullable|string',
            'alloanamnesis' => 'nullable|string',
            'anamnesis_dari' => 'nullable|string',
            'keluhan_utama' => 'nullable|string',
            'riwayat_penyakit_sekarang' => 'nullable|string',
            'riwayat_penyakit_dahulu' => 'nullable|string',
            'faktor_resiko' => 'nullable|string',
            
            // Tanda Vital
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
            
            // Pemeriksaan Fisik
            'mata' => 'nullable|string',
            'pupil' => 'nullable|string',
            'ikterus' => 'nullable|string',
            'diameter_pupil' => 'nullable|string',
            'udem_palpebrae' => 'nullable|string',
            'tht' => 'nullable|string',
            'faring' => 'nullable|string',
            'tongsil' => 'nullable|string',
            'lidah' => 'nullable|string',
            'bibir' => 'nullable|string',
            'leher' => 'nullable|string',
            'jvp' => 'nullable|string',
            'limfe' => 'nullable|string',
            'kaku_kuduk' => 'nullable|string',
            'thoraks' => 'nullable|string',
            'cor' => 'nullable|string',
            's1s2' => 'nullable|string',
            'mur_mur' => 'nullable|string',
            'pulmo' => 'nullable|string',
            'ronchi' => 'nullable|string',
            'wheezing' => 'nullable|string',
            'peristaltik' => 'nullable|string',
            'abdomen' => 'nullable|string',
            'meteorismus' => 'nullable|string',
            'asites' => 'nullable|string',
            'nyeri_tekan' => 'nullable|string',
            'hepar' => 'nullable|string',
            'lien' => 'nullable|string',
            'extremitas' => 'nullable|string',
            'udem' => 'nullable|string',
            'defeksesi' => 'nullable|string',
            'urin' => 'nullable|string',
            'kelainan' => 'nullable|string',
            'lainnya' => 'nullable|string',
            
            // Riwayat Alergi
            'riwayat_alergi' => 'nullable|string',
            
            // Penilaian Nyeri
            'nyeri' => 'nullable|string',
            'onset' => 'nullable|string',
            'pencetus' => 'nullable|string',
            'lokasi_nyeri' => 'nullable|string',
            'gambaran_nyeri' => 'nullable|string',
            'durasi_nyeri' => 'nullable|string',
            'skala_nyeri' => 'nullable|string',
            'metode_nyeri' => 'nullable|string',
            
            // Medical
            'masalah_medis' => 'nullable|string',
            'diagnosis_medis' => 'nullable|string',
            'rencana_terapi' => 'nullable|string',
            'selected_diagnosa' => 'nullable|string',
            
            // Frontend boolean fields akan digroupkan dalam update method
            'status_psikologi_*' => 'nullable|boolean',
            'status_mental_*' => 'nullable|boolean',  
            'hubungan_keluarga_*' => 'nullable|boolean',
            'tempat_tinggal_*' => 'nullable|boolean',
            'spiritual_*' => 'nullable|boolean',
            'ekonomi_*' => 'nullable|boolean',
            'pengambilan_keputusan_*' => 'nullable|boolean',
            'edukasi_*' => 'nullable|boolean',
        ]);

        // Group related fields into JSON
        $statusPsikologi = [];
        $statusMentalHubungan = [];
        $tempatTinggal = [];
        $spiritual = [];
        $ekonomi = [];
        $edukasi = [];

        foreach($request->all() as $key => $value) {
            if(str_starts_with($key, 'status_psikologi_')) {
                $statusPsikologi[$key] = $value;
            } elseif(str_starts_with($key, 'status_mental_') || str_starts_with($key, 'hubungan_keluarga_')) {
                $statusMentalHubungan[$key] = $value;
            } elseif(str_starts_with($key, 'tempat_tinggal_')) {
                $tempatTinggal[$key] = $value;
            } elseif(str_starts_with($key, 'spiritual_')) {
                $spiritual[$key] = $value;
            } elseif(str_starts_with($key, 'ekonomi_') || str_starts_with($key, 'pengambilan_keputusan_')) {
                $ekonomi[$key] = $value;
            } elseif(str_starts_with($key, 'edukasi_')) {
                $edukasi[$key] = $value;
            }
        }

        // Remove grouped fields from validated data and add JSON groups
        $filteredData = collect($validated)->reject(function($value, $key) {
            return str_starts_with($key, 'status_psikologi_') ||
                   str_starts_with($key, 'status_mental_') ||
                   str_starts_with($key, 'hubungan_keluarga_') ||
                   str_starts_with($key, 'tempat_tinggal_') ||
                   str_starts_with($key, 'spiritual_') ||
                   str_starts_with($key, 'ekonomi_') ||
                   str_starts_with($key, 'pengambilan_keputusan_') ||
                   str_starts_with($key, 'edukasi_');
        })->toArray();

        $filteredData['status_psikologi'] = $statusPsikologi;
        $filteredData['status_mental_hubungan'] = $statusMentalHubungan;
        $filteredData['tempat_tinggal'] = $tempatTinggal;
        $filteredData['spiritual'] = $spiritual;
        $filteredData['ekonomi'] = $ekonomi;
        $filteredData['edukasi'] = $edukasi;

        // Handle selected_diagnosa JSON string
        if (isset($filteredData['selected_diagnosa']) && is_string($filteredData['selected_diagnosa'])) {
            $filteredData['selected_diagnosa'] = json_decode($filteredData['selected_diagnosa'], true);
        }

        $pengkajianAwal->update($filteredData);

        return redirect()->back()->with('success', 'Data pengkajian awal UGD berhasil diperbarui');
    }
}
