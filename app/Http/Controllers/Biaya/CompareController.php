<?php

namespace App\Http\Controllers\Biaya;

use App\Http\Controllers\Controller;
use App\Models\SIMRS\KunjunganRS;
use App\Models\SIMRS\Pasien;
use App\Models\SIMRS\Pendaftaran;
use App\Models\SIMRS\Penjamin;
use App\Models\SIMRS\RincianTagihan;
use App\Models\SIMRS\TagihanPendaftaran;
use App\Models\Eklaim\DataGroupper;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\DataKlaim;
use App\Models\SIMRS\KunjunganBPJS;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CompareController extends Controller
{
    public function index($kunjungan)  {
        $kunjunganRs = KunjunganRS::where('NOPEN', $kunjungan)->with('ruangan')->get();
        $pendaftaran = Pendaftaran::where('NOMOR', $kunjungan)->first();
        $penjamin = Penjamin::where('NOPEN', $kunjungan)->first();
        $pasien = Pasien::where('NORM', $pendaftaran->NORM)
            ->with([
                'desa',
                'kecamatan',
                'kabupaten',
                'provinsi',
            ])
            ->first();

        // Cari tagihan dengan STATUS = 1, prioritas UTAMA = 1 jika ada lebih dari satu
        $tagihan_pendaftaran = TagihanPendaftaran::where('PENDAFTARAN', $kunjungan)
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

        // Logic untuk cek data groupper dan pengajuan klaim
        $dataGroupper = null;
        $pengajuanKlaim = null;
        $needsGrouping = false;
        $actionMessage = null;
        $stage2Options = null;

        if ($penjamin) {
            // Selalu cek pengajuan klaim dulu
            $pengajuanKlaim = PengajuanKlaim::where('nomor_sep', $penjamin->NOMOR)->first();
            
            // Cek apakah ada data groupper dengan nomor SEP yang sama
            $dataGroupper = DataGroupper::where('nomor_sep', $penjamin->NOMOR)->first();
            
            if (!$pengajuanKlaim) {
                // Jika tidak ada pengajuan klaim, perlu buat pengajuan klaim dulu
                $actionMessage = [
                    'type' => 'create_claim',
                    'message' => 'Belum ada pengajuan klaim untuk nomor SEP ini. Silakan buat pengajuan klaim terlebih dahulu.',
                    'nomor_sep' => $penjamin->NOMOR
                ];
            } elseif ($pengajuanKlaim->status_pengiriman == 1) {
                // Status 1: Tersimpan - perlu grouping stage 1
                $needsGrouping = true;
                $actionMessage = [
                    'type' => 'needs_grouping',
                    'message' => 'Klaim sudah tersimpan. Silakan lakukan grouping untuk mendapatkan tarif CBG.',
                    'nomor_sep' => $penjamin->NOMOR,
                    'pengajuan_klaim_id' => $pengajuanKlaim->id
                ];
            } elseif ($pengajuanKlaim->status_pengiriman == 2) {
                // Status 2: Grouper Stage 1 selesai - pilih Stage 2, Final, atau Grouping Ulang
                $stage2Options = [
                    'type' => 'stage2_or_final',
                    'message' => 'Grouping stage 1 selesai. Pilih tindakan selanjutnya.',
                    'nomor_sep' => $penjamin->NOMOR,
                    'pengajuan_klaim_id' => $pengajuanKlaim->id,
                    'has_special_cmg' => $dataGroupper && !empty($dataGroupper->special_cmg_option),
                    'allow_resubmit' => true
                ];
            } elseif ($pengajuanKlaim->status_pengiriman == 3) {
                // Status 3: Stage 2 selesai - siap final atau grouping ulang
                $actionMessage = [
                    'type' => 'ready_final',
                    'message' => 'Grouping stage 2 selesai. Siap untuk finalisasi.',
                    'nomor_sep' => $penjamin->NOMOR,
                    'pengajuan_klaim_id' => $pengajuanKlaim->id,
                    'allow_resubmit' => true
                ];
            }
            // Status 4: Final - tidak perlu action message
        }

        return Inertia::render('biaya/compare/index', [
            'kunjungan' => $kunjungan,
            'kunjunganRs' => $kunjunganRs,
            'pasien' => $pasien,
            'penjamin' => $penjamin,
            'rincian_tagihan' => $rincian_tagihan,
            'dataGroupper' => $dataGroupper,
            'pengajuanKlaim' => $pengajuanKlaim,
            'needsGrouping' => $needsGrouping,
            'actionMessage' => $actionMessage,
            'stage2Options' => $stage2Options,
            'status_klaim' => $pengajuanKlaim->status_pengiriman ?? null,
        ]);
    }

    /**
     * Melakukan grouping dengan 2 tahap: submitKlaim dan groupper
     */
    public function doGrouping(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'nomor_sep' => 'required|string',
                'diagnosa' => 'required|string',
                'procedures' => 'required|string',
            ]);

            $pengajuanKlaim = PengajuanKlaim::findOrFail($request->pengajuan_klaim_id);

            // Parse diagnosa dan procedures dari JSON
            $diagnosaList = json_decode($request->diagnosa, true) ?: [];
            $proceduresList = json_decode($request->procedures, true) ?: [];

            Log::info('Starting grouping process', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'diagnosa_count' => count($diagnosaList),
                'procedures_count' => count($proceduresList)
            ]);

            // Step 1: Submit Klaim dengan data minimal + diagnosa/procedures
            $submitResult = $this->submitKlaim($pengajuanKlaim, $diagnosaList, $proceduresList);
            
            if (!$submitResult['success']) {
                return back()->with('error', 'Gagal submit klaim: ' . $submitResult['message']);
            }

            // Step 2: Jalankan Groupper
            $groupperResult = $this->runGroupper($pengajuanKlaim);
            
            if (!$groupperResult['success']) {
                return back()->with('error', 'Gagal menjalankan groupper: ' . $groupperResult['message']);
            }

            Log::info('Complete grouping process finished successfully', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'submit_message' => $submitResult['message'],
                'groupper_message' => $groupperResult['message']
            ]);

            return back()->with('success', 'Grouping lengkap berhasil! Klaim telah difinalisasi. ' . $groupperResult['message']);

        } catch (\Exception $e) {
            Log::error('Grouping process failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Gagal melakukan grouping: ' . $e->getMessage());
        }
    }

    /**
     * Step 1: Submit klaim data ke INACBG dengan data minimal
     */
    private function submitKlaim($pengajuanKlaim, $diagnosaList, $proceduresList)
    {
        try {
            // Prepare data minimal untuk submit klaim dengan diagnosa dan procedures
            $requestData = $this->prepareMinimalKlaimData($pengajuanKlaim, $diagnosaList, $proceduresList);
            
            // Prepare data for storage
            $preparedData = $this->prepareDataForStorage($requestData, $pengajuanKlaim);
            
            // Prepare data for INACBG API submission
            $inacbgData = $this->prepareDataForInacbg($requestData, $pengajuanKlaim);
            
            // Submit to INACBG API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');
            
            Log::info('Submit Klaim Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['metadata']['code'] ?? 'undefined',
                'message' => $inacbgResponse['metadata']['message'] ?? 'No message'
            ]);
            
            if ($inacbgResponse['metadata']['code'] != 200) {
                return [
                    'success' => false,
                    'message' => $inacbgResponse['metadata']['message'] ?? 'Unknown error'
                ];
            }

            // Check if DataKlaim already exists
            $existingDataKlaim = DataKlaim::where('nomor_sep', $pengajuanKlaim->nomor_sep)->first();
            
            if ($existingDataKlaim) {
                // If data exists, only update diagnosa and procedure fields
                $existingDataKlaim->update([
                    'diagnosa' => $requestData['diagnosa'],
                    'procedure' => $requestData['procedure'],
                    'diagnosa_inagrouper' => $requestData['diagnosa_inagrouper'],
                    'procedure_inagrouper' => $requestData['procedure_inagrouper'],
                    'coder_nik' => $requestData['coder_nik'],
                    'status' => 'submitted',
                    'api_response' => json_encode($inacbgResponse),
                    'submitted_at' => now(),
                ]);
                
                Log::info('DataKlaim updated with new diagnosa/procedure', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'diagnosa' => $requestData['diagnosa'],
                    'procedure' => $requestData['procedure']
                ]);
            } else {
                // If no existing data, create new record with all data
                DataKlaim::create(array_merge($preparedData, [
                    'status' => 'submitted',
                    'api_response' => json_encode($inacbgResponse),
                    'submitted_at' => now(),
                ]));
                
                Log::info('New DataKlaim created', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep
                ]);
            }

            // Update pengajuan klaim status
            $pengajuanKlaim->update([
                'status_pengiriman' => PengajuanKlaim::STATUS_TERSIMPAN,
                'response_message' => $inacbgResponse['metadata']['message'],
                'response_data' => $inacbgResponse,
            ]);

            return [
                'success' => true,
                'message' => $inacbgResponse['metadata']['message'] ?? 'Klaim berhasil disubmit'
            ];

        } catch (\Exception $e) {
            Log::error('Submit klaim failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Step 2: Jalankan Groupper
     */
    private function runGroupper($pengajuanKlaim)
    {
        try {
            // Prepare data for INACBG Groupper API submission
            $inacbgData = $this->prepareDataForGroupper($pengajuanKlaim);

            // Submit to INACBG Groupper API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');

            Log::info('Groupper Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['metadata']['code'] ?? 'undefined',
                'message' => $inacbgResponse['metadata']['message'] ?? 'No message'
            ]);
            
            if ($inacbgResponse['metadata']['code'] != 200) {
                return [
                    'success' => false,
                    'message' => $inacbgResponse['metadata']['message'] ?? 'Unknown error'
                ];
            }

            // Save groupper response to database
            $dataGroupper = $this->saveGrouperResponse($pengajuanKlaim, $inacbgResponse);
            
            // Check if there are special_cmg_option for stage 2
            $specialCmgOptions = $inacbgResponse['response']['special_cmg_option'] ?? [];
            
            if (!empty($specialCmgOptions) && $dataGroupper !== null) {
                // Automatically proceed to groupper stage 2 (which will auto-call final)
                $stage2Response = $this->processGrouperStage2($pengajuanKlaim, $dataGroupper, $specialCmgOptions);
                if ($stage2Response) {
                    Log::info('Complete flow with stage 2: submit → groupper → stage 2 → final', [
                        'nomor_sep' => $pengajuanKlaim->nomor_sep,
                        'stage2_response' => $stage2Response
                    ]);
                }
            } else {
                // No stage 2 needed, update to GROUPER first then proceed to final
                $pengajuanKlaim->update([
                    'status_pengiriman' => PengajuanKlaim::STATUS_GROUPER,
                    'response_message' => $inacbgResponse['metadata']['message'],
                    'response_data' => $inacbgResponse,
                ]);

                // Automatically proceed to final step after stage 1 (no stage 2 needed)
                Log::info('Stage 1 completed, no stage 2 needed, proceeding to final step', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep
                ]);

                $finalResult = $this->callFinalApi($pengajuanKlaim);
                
                if ($finalResult['success']) {
                    Log::info('Complete flow successful: submit → groupper → final', [
                        'nomor_sep' => $pengajuanKlaim->nomor_sep,
                        'final_message' => $finalResult['message']
                    ]);
                } else {
                    Log::warning('Stage 1 completed but final step failed', [
                        'nomor_sep' => $pengajuanKlaim->nomor_sep,
                        'final_error' => $finalResult['message']
                    ]);
                }
            }

            return [
                'success' => true,
                'message' => $inacbgResponse['metadata']['message'] ?? 'Groupper berhasil dijalankan'
            ];

        } catch (\Exception $e) {
            Log::error('Groupper failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Prepare minimal data untuk submit klaim dengan diagnosa dan procedures
     */
    private function prepareMinimalKlaimData($pengajuanKlaim, $diagnosaList, $proceduresList)
    {
        // Format diagnosa untuk INACBG - gunakan format kode1#kode2#kode3
        $diagnosaFormatted = '';
        if (!empty($diagnosaList)) {
            $kodeDiagnosa = array_map(function($diagnosa) {
                return $diagnosa['kode'] ?? '';
            }, $diagnosaList);
            $diagnosaFormatted = implode('#', array_filter($kodeDiagnosa));
        }

        // Format procedures untuk INACBG - gunakan format kode1#kode2#kode3
        $proceduresFormatted = '';
        if (!empty($proceduresList)) {
            $kodeProcedure = array_map(function($procedure) {
                return $procedure['kode'] ?? '';
            }, $proceduresList);
            $proceduresFormatted = implode('#', array_filter($kodeProcedure));
        }
        
        // Jika tidak ada procedure, kirim "#" untuk menghapus semua data prosedur
        if (empty($proceduresFormatted)) {
            $proceduresFormatted = '#';
        }

        $getDataKunjunganBpjs = KunjunganBPJS::where('noSEP', $pengajuanKlaim->nomor_sep)->first();

        // Format jenis_rawat berdasarkan jenis_kunjungan
        $jenisRawat = '1'; // Default Rawat Inap
        if ($pengajuanKlaim->jenis_kunjungan) {
            switch ($pengajuanKlaim->jenis_kunjungan) {
                case 'Rawat Inap':
                    $jenisRawat = '1';
                    break;
                case 'Rawat Jalan':
                    $jenisRawat = '2';
                    break;
                case 'Gawat Darurat':
                case 'Rawat IGD':
                    $jenisRawat = '3';
                    break;
                default:
                    $jenisRawat = '1'; // Default ke Rawat Inap
            }
        }

        // Log format yang akan dikirim
        Log::info('Format data diagnosa dan procedure untuk API', [
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'jenis_kunjungan' => $pengajuanKlaim->jenis_kunjungan,
            'jenis_rawat_mapped' => $jenisRawat,
            'diagnosa_formatted' => $diagnosaFormatted,
            'procedure_formatted' => $proceduresFormatted,
            'diagnosa_raw' => $diagnosaList,
            'procedure_raw' => $proceduresList
        ]);

        // Return data minimal dengan diagnosa dan procedures
        return [
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'nomor_kartu' => $pengajuanKlaim->nomor_kartu,
            'tgl_masuk' => now()->format('Y-m-d H:i:s'),
            'tgl_pulang' => now()->format('Y-m-d H:i:s'),
            'cara_masuk' => 'gp',
            'jenis_rawat' => $jenisRawat,
            'kelas_rawat' => $getDataKunjunganBpjs->klsRawat,
            'adl_sub_acute' => 0,
            'adl_chronic' => 0,
            'icu_indikator' => 0,
            'icu_los' => 0,
            'ventilator_hour' => 0,
            'upgrade_class_ind' => 0,
            'upgrade_class_class' => '',
            'upgrade_class_los' => 0,
            'upgrade_class_payor' => 0,
            'add_payment_pct' => 0,
            'birth_weight' => 0,
            'sistole' => 120,
            'diastole' => 80,
            'discharge_status' => '1',
            'diagnosa' => $diagnosaFormatted,
            'procedure' => $proceduresFormatted,
            'diagnosa_inagrouper' => $diagnosaFormatted,
            'procedure_inagrouper' => $proceduresFormatted,
            'pemulasaraan_jenazah' => 0,
            'kantong_jenazah' => 0,
            'peti_jenazah' => 0,
            'plastik_erat' => 0,
            'desinfektan_jenazah' => 0,
            'mobil_jenazah' => 0,
            'desinfektan_mobil_jenazah' => 0,
            'covid19_status_cd' => '',
            'nomor_kartu_t' => '',
            'episodes' => '',
            'covid19_cc_ind' => 0,
            'covid19_rs_darurat_ind' => 0,
            'covid19_co_insidense_ind' => 0,
            'terapi_konvalesen' => 0,
            'akses_naat' => '',
            'isoman_ind' => 0,
            'bayi_lahir_status_cd' => 0,
            'dializer_single_use' => 0,
            'kantong_darah' => 0,
            'alteplase_ind' => 0,
            'tarif_poli_eks' => 0,
            'nama_dokter' => '-',
            'kode_tarif' => 'DS',
            'payor_id' => '3',
            'payor_cd' => 'JKN',
            'cob_cd' => '',
            'coder_nik' => Auth::user()->nik, // Default coder NIK untuk update diagnosa/procedure
            'ventilator' => [
                'use_ind' => '0',
                'start_dttm' => '',
                'stop_dttm' => ''
            ],
            'covid19_penunjang_pengurang' => [],
            'apgar' => [
                'menit_1' => [
                    'appearance' => 0,
                    'pulse' => 0,
                    'grimace' => 0,
                    'activity' => 0,
                    'respiration' => 0
                ],
                'menit_5' => [
                    'appearance' => 0,
                    'pulse' => 0,
                    'grimace' => 0,
                    'activity' => 0,
                    'respiration' => 0
                ]
            ],
            'persalinan' => [],
            'tarif_rs' => [
                'prosedur_non_bedah' => '0',
                'prosedur_bedah' => '0',
                'konsultasi' => '0',
                'tenaga_ahli' => '0',
                'keperawatan' => '0',
                'penunjang' => '0',
                'radiologi' => '0',
                'laboratorium' => '0',
                'pelayanan_darah' => '0',
                'rehabilitasi' => '0',
                'kamar' => '0',
                'rawat_intensif' => '0',
                'obat' => '0',
                'obat_kronis' => '0',
                'obat_kemoterapi' => '0',
                'alkes' => '0',
                'bmhp' => '0',
                'sewa_alat' => '0'
            ]
        ];
    }

    // Copy helper methods dari KlaimController
    private function prepareDataForStorage($requestData, $pengajuanKlaim)
    {
        $data = [
            'pengajuan_klaim_id' => $pengajuanKlaim->id,
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
        ];

        // Get all model fillable fields
        $fillableFields = (new DataKlaim())->getFillable();
        
        // Simple mapping - just copy fields that exist in both request and model
        foreach ($fillableFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $requestData[$field];
            }
        }

        // Handle specific date fields
        if (isset($requestData['tgl_masuk'])) {
            $data['tgl_masuk'] = $this->formatDateForDatabase($requestData['tgl_masuk']);
        }
        if (isset($requestData['tgl_pulang'])) {
            $data['tgl_pulang'] = $this->formatDateForDatabase($requestData['tgl_pulang']);
        }

        // Handle nested JSON structures as strings for database
        $jsonFields = ['tarif_rs', 'apgar', 'ventilator', 'persalinan', 'covid19_penunjang_pengurang'];
        foreach ($jsonFields as $field) {
            if (isset($requestData[$field]) && is_array($requestData[$field])) {
                $data[$field] = json_encode($requestData[$field]);
            }
        }

        // Handle numeric fields - convert empty strings to 0 for decimal fields
        $numericFields = [
            'tarif_poli_eks', 'pemulasaraan_jenazah', 'kantong_jenazah', 'peti_jenazah', 
            'plastik_erat', 'desinfektan_jenazah', 'mobil_jenazah', 'desinfektan_mobil_jenazah',
            'covid19_cc_ind', 'covid19_rs_darurat_ind', 'covid19_co_insidense_ind', 
            'terapi_konvalesen', 'isoman_ind', 'bayi_lahir_status_cd', 'dializer_single_use',
            'kantong_darah', 'alteplase_ind', 'birth_weight', 'sistole', 'diastole',
            'upgrade_class_ind', 'upgrade_class_los', 'upgrade_class_payor', 'add_payment_pct', 'ventilator_hour',
            'adl_sub_acute', 'adl_chronic', 'icu_indikator', 'icu_los'
        ];
        
        foreach ($numericFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = 0;
            }
        }

        // Handle special string fields that should remain empty string if not set
        $stringFields = ['upgrade_class_class', 'covid19_status_cd', 'nomor_kartu_t', 'episodes', 'akses_naat', 'cob_cd'];
        foreach ($stringFields as $field) {
            if (isset($data[$field]) && $data[$field] === null) {
                $data[$field] = '';
            }
        }

        return $data;
    }

    private function prepareDataForInacbg($requestData, $pengajuanKlaim)
    {
        // Base metadata for INACBG API
        $metadata = [
            'method' => 'set_claim_data',
            'nomor_sep' => $pengajuanKlaim->nomor_sep
        ];

        // Transform form data to match INACBG expected structure
        $data = [
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'nomor_kartu' => $requestData['nomor_kartu'] ?? '',
            'tgl_masuk' => $this->formatDateForInacbg($requestData['tgl_masuk'] ?? ''),
            'tgl_pulang' => $this->formatDateForInacbg($requestData['tgl_pulang'] ?? ''),
            'cara_masuk' => $requestData['cara_masuk'] ?? '',
            'jenis_rawat' => $requestData['jenis_rawat'] ?? '',
            'kelas_rawat' => $requestData['kelas_rawat'] ?? '',
            
            // ICU data
            'adl_sub_acute' => $requestData['adl_sub_acute'] ?? 0,
            'adl_chronic' => $requestData['adl_chronic'] ?? 0,
            'icu_indikator' => $requestData['icu_indikator'] ?? 0,
            'icu_los' => $requestData['icu_los'] ?? 0,
            
            // Ventilator data
            'ventilator_hour' => $requestData['ventilator_hour'] ?? 0,
            'ventilator' => $requestData['ventilator'] ?? [
                'use_ind' => '0',
                'start_dttm' => '',
                'stop_dttm' => ''
            ],
            
            // Upgrade class data
            'upgrade_class_ind' => $requestData['upgrade_class_ind'] ?? 0,
            'upgrade_class_class' => $requestData['upgrade_class_class'] ?? '',
            'upgrade_class_los' => $requestData['upgrade_class_los'] ?? 0,
            'upgrade_class_payor' => $requestData['upgrade_class_payor'] ?? 0,
            'add_payment_pct' => $requestData['add_payment_pct'] ?? 0,
            
            // Medical data
            'birth_weight' => $requestData['birth_weight'] ?? 0,
            'sistole' => (int)($requestData['sistole'] ?? 0),
            'diastole' => (int)($requestData['diastole'] ?? 0),
            'discharge_status' => $requestData['discharge_status'] ?? '',
            'diagnosa' => $requestData['diagnosa'] ?? '',
            'procedure' => $requestData['procedure'] ?? '',
            'diagnosa_inagrouper' => $requestData['diagnosa_inagrouper'] ?? '',
            'procedure_inagrouper' => $requestData['procedure_inagrouper'] ?? '',
            
            // Tarif RS - convert currency values to string format
            'tarif_rs' => $this->formatTarifForInacbg($requestData['tarif_rs'] ?? []),
            
            // COVID-19 data
            'pemulasaraan_jenazah' => $requestData['pemulasaraan_jenazah'] ?? 0,
            'kantong_jenazah' => $requestData['kantong_jenazah'] ?? 0,
            'peti_jenazah' => $requestData['peti_jenazah'] ?? 0,
            'plastik_erat' => $requestData['plastik_erat'] ?? 0,
            'desinfektan_jenazah' => $requestData['desinfektan_jenazah'] ?? 0,
            'mobil_jenazah' => $requestData['mobil_jenazah'] ?? 0,
            'desinfektan_mobil_jenazah' => $requestData['desinfektan_mobil_jenazah'] ?? 0,
            'covid19_status_cd' => $requestData['covid19_status_cd'] ?? '',
            'nomor_kartu_t' => $requestData['nomor_kartu_t'] ?? '',
            'episodes' => $requestData['episodes'] ?? '',
            'covid19_cc_ind' => $requestData['covid19_cc_ind'] ?? 0,
            'covid19_rs_darurat_ind' => $requestData['covid19_rs_darurat_ind'] ?? 0,
            'covid19_co_insidense_ind' => $requestData['covid19_co_insidense_ind'] ?? 0,
            'covid19_penunjang_pengurang' => $requestData['covid19_penunjang_pengurang'] ?? [],
            
            // Other data
            'terapi_konvalesen' => $requestData['terapi_konvalesen'] ?? 0,
            'akses_naat' => $requestData['akses_naat'] ?? '',
            'isoman_ind' => $requestData['isoman_ind'] ?? 0,
            'bayi_lahir_status_cd' => (int)($requestData['bayi_lahir_status_cd'] ?? 0),
            'dializer_single_use' => (int)($requestData['dializer_single_use'] ?? 0),
            'kantong_darah' => (int)($requestData['kantong_darah'] ?? 0),
            'alteplase_ind' => (int)($requestData['alteplase_ind'] ?? 0),
            
            // APGAR data
            'apgar' => $requestData['apgar'] ?? [
                'menit_1' => [
                    'appearance' => 0,
                    'pulse' => 0,
                    'grimace' => 0,
                    'activity' => 0,
                    'respiration' => 0
                ],
                'menit_5' => [
                    'appearance' => 0,
                    'pulse' => 0,
                    'grimace' => 0,
                    'activity' => 0,
                    'respiration' => 0
                ]
            ],
            
            // Persalinan data
            'persalinan' => $requestData['persalinan'] ?? [],
            
            // RS data
            'tarif_poli_eks' => !empty($requestData['tarif_poli_eks']) ? $requestData['tarif_poli_eks'] : 0,
            'nama_dokter' => $requestData['nama_dokter'] ?? '',
            'kode_tarif' => $requestData['kode_tarif'] ?? '',
            'payor_id' => $requestData['payor_id'] ?? '',
            'payor_cd' => $requestData['payor_cd'] ?? '',
            'cob_cd' => $requestData['cob_cd'] ?? '',
            'coder_nik' => $requestData['coder_nik'] ?? '',
        ];

        return [
            'metadata' => $metadata,
            'data' => $data
        ];
    }

    private function prepareDataForGroupper($pengajuanKlaim)
    {
        // Base metadata for INACBG Groupper API
        $metadata = [
            'method' => 'grouper',
            'stage' => '1'
        ];

        // Simplified data structure for groupper
        $data = [
            'nomor_sep' => $pengajuanKlaim->nomor_sep
        ];

        return [
            'metadata' => $metadata,
            'data' => $data
        ];
    }

    private function formatTarifForInacbg($tarifData)
    {
        $defaultTarif = [
            'prosedur_non_bedah' => '0',
            'prosedur_bedah' => '0',
            'konsultasi' => '0',
            'tenaga_ahli' => '0',
            'keperawatan' => '0',
            'penunjang' => '0',
            'radiologi' => '0',
            'laboratorium' => '0',
            'pelayanan_darah' => '0',
            'rehabilitasi' => '0',
            'kamar' => '0',
            'rawat_intensif' => '0',
            'obat' => '0',
            'obat_kronis' => '0',
            'obat_kemoterapi' => '0',
            'alkes' => '0',
            'bmhp' => '0',
            'sewa_alat' => '0'
        ];

        if (!is_array($tarifData)) {
            return $defaultTarif;
        }

        // Convert all values to string and remove currency formatting
        foreach ($defaultTarif as $key => $defaultValue) {
            if (isset($tarifData[$key])) {
                $value = $tarifData[$key];
                // Remove currency formatting and convert to string
                $cleanValue = str_replace(['Rp', '.', ' ', ','], '', (string)$value);
                $defaultTarif[$key] = $cleanValue ?: '0';
            }
        }

        return $defaultTarif;
    }

    /**
     * Format date for INACBG API (YYYY-MM-DD HH:mm:ss)
     */
    private function formatDateForInacbg($dateTimeString)
    {
        if (!$dateTimeString) {
            return '';
        }

        try {
            $date = new \DateTime($dateTimeString);
            return $date->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            Log::warning('Invalid date format for INACBG', [
                'input' => $dateTimeString,
                'error' => $e->getMessage()
            ]);
            return '';
        }
    }

    private function formatDateForDatabase($dateTimeString)
    {
        if (!$dateTimeString) {
            return null;
        }

        try {
            $date = new \DateTime($dateTimeString);
            return $date->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            Log::warning('Invalid date format received', [
                'input' => $dateTimeString,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Helper method to ensure numeric fields are not empty strings
     */
    private function ensureNumericValue($value, $defaultValue = 0)
    {
        if ($value === '' || $value === null) {
            return $defaultValue;
        }
        return $value;
    }

    private function saveGrouperResponse(PengajuanKlaim $pengajuanKlaim, array $responseData)
    {
        try {
            // Extract data from response
            // $responseData contains both metadata and response
            $response = $responseData['response'] ?? [];
            $metadata = $responseData['metadata'] ?? [];
            
            $cbg = $response['cbg'] ?? [];
            $subAcute = $response['sub_acute'] ?? [];
            $chronic = $response['chronic'] ?? [];
            $covid19Data = $responseData['covid19_data'] ?? [];
            $responseInagrouper = $responseData['response_inagrouper'] ?? [];
            $specialCmgOption = $responseData['special_cmg_option'] ?? [];
            $tarifAlt = $responseData['tarif_alt'] ?? [];
            
            // Prepare update data
            $updateData = [
                // Metadata
                'metadata_code' => $metadata['code'] ?? null,
                'metadata_message' => $metadata['message'] ?? null,
                
                // CBG Data
                'cbg_code' => $cbg['code'] ?? null,
                'cbg_description' => $cbg['description'] ?? null,
                'cbg_tariff' => $cbg['tariff'] ?? null,
                
                // Sub Acute Data
                'sub_acute_code' => $subAcute['code'] ?? null,
                'sub_acute_description' => $subAcute['description'] ?? null,
                'sub_acute_tariff' => $subAcute['tariff'] ?? null,
                
                // Chronic Data
                'chronic_code' => $chronic['code'] ?? null,
                'chronic_description' => $chronic['description'] ?? null,
                'chronic_tariff' => $chronic['tariff'] ?? null,
                
                // Additional Data
                'kelas' => $response['kelas'] ?? null,
                'add_payment_amt' => $response['add_payment_amt'] ?? null,
                'inacbg_version' => $response['inacbg_version'] ?? null,
                
                // JSON Data
                'covid19_data' => $covid19Data,
                'response_inagrouper' => $responseInagrouper,
                'special_cmg_option' => $specialCmgOption,
                'tarif_alt' => $tarifAlt,
                'full_response' => $responseData,
            ];
            
            Log::info('About to save/update DataGroupper with data', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'update_data_response_inagrouper' => $updateData['response_inagrouper'],
                'update_data_tarif_alt' => $updateData['tarif_alt'],
                'update_data_keys' => array_keys($updateData)
            ]);
            
            // Create or update data groupper
            $dataGroupper = DataGroupper::updateOrCreate(
                [
                    'pengajuan_klaim_id' => $pengajuanKlaim->id,
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                ],
                $updateData
            );
            
            // Refresh model to ensure we have the latest data from database
            $dataGroupper->refresh();
            
            Log::info('Groupper response saved successfully', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'cbg_code' => $cbg['code'] ?? 'N/A',
                'cbg_tariff' => $cbg['tariff'] ?? 'N/A',
                'saved_response_inagrouper' => $dataGroupper->response_inagrouper,
                'saved_tarif_alt' => $dataGroupper->tarif_alt,
                'data_groupper_id' => $dataGroupper->id,
                'response_inagrouper_is_null' => is_null($dataGroupper->response_inagrouper),
                'tarif_alt_is_null' => is_null($dataGroupper->tarif_alt)
            ]);
            
            return $dataGroupper;
            
        } catch (\Exception $e) {
            Log::error('Failed to save groupper response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Don't throw exception to prevent breaking the main flow
            // The main groupper operation should still succeed even if saving fails
            return null;
        }
    }

    /**
     * Process groupper stage 2 with special CMG selection
     */
    private function processGrouperStage2(PengajuanKlaim $pengajuanKlaim, DataGroupper $dataGroupper, array $specialCmgOptions)
    {
        try {
            // Select the first special CMG option for automatic processing
            // In a real scenario, user would select which one to use
            $selectedCmg = $specialCmgOptions[0]['code'] ?? null;
            
            if (!$selectedCmg) {
                Log::warning('No special CMG code found for stage 2', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'options' => $specialCmgOptions
                ]);
                return null;
            }

            Log::info('Processing groupper stage 2', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'selected_cmg' => $selectedCmg,
                'total_options' => count($specialCmgOptions)
            ]);

            // Prepare data for stage 2 API call
            $stage2Data = [
                'metadata' => [
                    'method' => 'grouper',
                    'stage' => '2'
                ],
                'data' => [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'special_cmg' => $selectedCmg
                ]
            ];

            // Call INACBG API for stage 2
            $stage2Response = \App\Helpers\InacbgHelper::hitApi($stage2Data, 'POST');
            
            Log::info('INACBG Groupper Stage 2 Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'selected_cmg' => $selectedCmg,
                'status_code' => $stage2Response['status_code'] ?? 'undefined',
                'response' => $stage2Response['response'] ?? null,
            ]);

            // Check if stage 2 was successful
            if (isset($stage2Response['status_code']) && $stage2Response['status_code'] === 200 
                && $stage2Response['response']['metadata']['code'] == 200) {
                
                // Save stage 2 response
                $this->saveGrouperStage2Response($pengajuanKlaim, $dataGroupper, $stage2Response['response'], $selectedCmg);
                
                // Update status to STAGE_2_COMPLETED (3) - no auto final
                $pengajuanKlaim->update([
                    'status_pengiriman' => 3, // Stage 2 completed
                    'response_message' => 'Groupper Stage 2 completed',
                    'response_data' => $stage2Response,
                ]);

                Log::info('Stage 2 completed successfully', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep
                ]);
                
                return $stage2Response;
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Groupper Stage 2 failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Save groupper stage 2 response to database
     */
    private function saveGrouperStage2Response(PengajuanKlaim $pengajuanKlaim, DataGroupper $dataGroupper, array $responseData, string $selectedCmg)
    {
        try {
            // Extract data from response
            $response = $responseData['response'] ?? [];
            $cbg = $response['cbg'] ?? [];
            $specialCmg = $response['special_cmg'] ?? [];
            $covid19Data = $response['covid19_data'] ?? [];
            $responseInagrouper = $response['response_inagrouper'] ?? [];
            $specialCmgOption = $response['special_cmg_option'] ?? [];
            $tarifAlt = $response['tarif_alt'] ?? [];
            
            // Update existing data groupper with stage 2 results
            $updateData = [
                // Update CBG with stage 2 results
                'cbg_code' => $cbg['code'] ?? $dataGroupper->cbg_code,
                'cbg_description' => $cbg['description'] ?? $dataGroupper->cbg_description,
                'cbg_tariff' => $cbg['tariff'] ?? $dataGroupper->cbg_tariff,
                
                // Update special CMG data
                'special_cmg_code' => $specialCmg['code'] ?? null,
                'special_cmg_description' => $specialCmg['description'] ?? null,
                'special_cmg_tariff' => $specialCmg['tariff'] ?? null,
                'selected_cmg' => $selectedCmg,
                
                // Update JSON data
                'covid19_data' => $covid19Data,
                'response_inagrouper' => $responseInagrouper,
                'special_cmg_option' => $specialCmgOption,
                'tarif_alt' => $tarifAlt,
                'stage2_response' => $responseData,
            ];
            
            $dataGroupper->update($updateData);
            
            Log::info('Stage 2 groupper response saved successfully', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'selected_cmg' => $selectedCmg,
                'special_cmg_code' => $specialCmg['code'] ?? 'N/A',
                'special_cmg_tariff' => $specialCmg['tariff'] ?? 'N/A'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to save stage 2 groupper response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Reedit klaim yang sudah final (mengubah status kembali ke 2) dengan diagnosa dan procedure baru
     */
    public function reedit(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'nomor_sep' => 'required|string',
                'diagnosa' => 'required|string',
                'procedures' => 'required|string',
            ]);

            $pengajuanKlaim = PengajuanKlaim::findOrFail($request->pengajuan_klaim_id);

            // Pastikan klaim memang sudah final sebelum bisa reedit
            if ($pengajuanKlaim->status_pengiriman !== 4) {
                return back()->with('error', 'Klaim harus dalam status final untuk dapat di-reedit.');
            }

            // Parse diagnosa dan procedures dari JSON
            $diagnosaList = json_decode($request->diagnosa, true) ?: [];
            $proceduresList = json_decode($request->procedures, true) ?: [];

            Log::info('Starting reedit process', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'diagnosa_count' => count($diagnosaList),
                'procedures_count' => count($proceduresList)
            ]);

            // Step 1: Reedit API call
            $reeditResult = $this->callReeditApi($pengajuanKlaim);
            
            if (!$reeditResult['success']) {
                return back()->with('error', 'Gagal reedit klaim: ' . $reeditResult['message']);
            }

            // Step 2: Submit Klaim dengan diagnosa/procedures baru
            $submitResult = $this->submitKlaim($pengajuanKlaim, $diagnosaList, $proceduresList);
            
            if (!$submitResult['success']) {
                return back()->with('error', 'Gagal submit klaim setelah reedit: ' . $submitResult['message']);
            }

            // Step 3: Jalankan Groupper
            $groupperResult = $this->runGroupper($pengajuanKlaim);
            
            if (!$groupperResult['success']) {
                return back()->with('error', 'Gagal menjalankan groupper setelah reedit: ' . $groupperResult['message']);
            }

            Log::info('Complete reedit process finished successfully', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'reedit_message' => $reeditResult['message'],
                'submit_message' => $submitResult['message'],
                'groupper_message' => $groupperResult['message']
            ]);

            return back()->with('success', 'Reedit dan grouping lengkap berhasil! Klaim telah difinalisasi. ' . $groupperResult['message']);

        } catch (\Exception $e) {
            Log::error('Reedit process failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Gagal melakukan reedit: ' . $e->getMessage());
        }
    }

    /**
     * Step 1: Call reedit API
     */
    private function callReeditApi($pengajuanKlaim)
    {
        try {
            // Prepare data for INACBG reedit_claim API
            $inacbgData = [
                'metadata' => [
                    'method' => 'reedit_claim'
                ],
                'data' => [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep
                ]
            ];

            // Submit to INACBG reedit_claim API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');
            
            Log::info('INACBG Reedit Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['metadata']['code'] ?? 'undefined',
                'message' => $inacbgResponse['metadata']['message'] ?? 'No message'
            ]);
            
            if ($inacbgResponse['metadata']['code'] != 200) {
                return [
                    'success' => false,
                    'message' => $inacbgResponse['metadata']['message'] ?? 'Unknown error'
                ];
            }

            // Update status pengajuan klaim kembali ke 2 (Grouper Stage 1 Selesai untuk bisa di-edit ulang)
            $pengajuanKlaim->update([
                'status_pengiriman' => PengajuanKlaim::STATUS_GROUPER,
                'response_message' => $inacbgResponse['metadata']['message'],
                'response_data' => $inacbgResponse,
            ]);

            return [
                'success' => true,
                'message' => $inacbgResponse['metadata']['message'] ?? 'Reedit berhasil'
            ];

        } catch (\Exception $e) {
            Log::error('Reedit API call failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Melakukan grouper stage 2 saja (untuk klaim dengan status 2)
     */
    public function stage2Only(Request $request)
    {
        try {
            $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'nomor_sep' => 'required|string',
            ]);

            $pengajuanKlaim = PengajuanKlaim::findOrFail($request->pengajuan_klaim_id);

            // Pastikan klaim dalam status 2 (grouper selesai)
            if ($pengajuanKlaim->status_pengiriman !== 2) {
                return back()->with('error', 'Klaim harus dalam status grouper (2) untuk melakukan stage 2.');
            }

            // Cari data groupper
            $dataGroupper = DataGroupper::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
            if (!$dataGroupper) {
                return back()->with('error', 'Data groupper tidak ditemukan.');
            }

            // Cek special_cmg_option dari response_data
            $responseData = $pengajuanKlaim->response_data;
            $specialCmgOptions = $responseData['response']['special_cmg_option'] ?? [];

            if (empty($specialCmgOptions)) {
                return back()->with('error', 'Tidak ada special CMG options untuk stage 2.');
            }

            Log::info('Starting stage 2 only process', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'special_cmg_count' => count($specialCmgOptions)
            ]);

            // Jalankan stage 2
            $stage2Response = $this->processGrouperStage2($pengajuanKlaim, $dataGroupper, $specialCmgOptions);
            
            if (!$stage2Response) {
                return back()->with('error', 'Gagal menjalankan grouper stage 2.');
            }

            // Update status ke 3 (stage 2 completed) tanpa auto final
            $pengajuanKlaim->update([
                'status_pengiriman' => 3,
                'response_message' => 'Groupper Stage 2 completed',
                'response_data' => $stage2Response,
            ]);

            Log::info('Stage 2 only process completed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep
            ]);

            return back()->with('success', 'Grouper Stage 2 berhasil dijalankan!');

        } catch (\Exception $e) {
            Log::error('Stage 2 only process failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Gagal melakukan grouper stage 2: ' . $e->getMessage());
        }
    }

    /**
     * Manual final untuk klaim dengan status 2 atau 3
     */
    public function finalOnly(Request $request)
    {
        try {
            $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'nomor_sep' => 'required|string',
            ]);

            $pengajuanKlaim = PengajuanKlaim::findOrFail($request->pengajuan_klaim_id);

            // Pastikan klaim dalam status 2 atau 3
            if (!in_array($pengajuanKlaim->status_pengiriman, [2, 3])) {
                return back()->with('error', 'Klaim harus dalam status grouper (2) atau stage 2 (3) untuk finalisasi.');
            }

            Log::info('Manual final request', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'current_status' => $pengajuanKlaim->status_pengiriman,
                'user_id' => Auth::id()
            ]);

            $finalResult = $this->callFinalApi($pengajuanKlaim);
            
            if ($finalResult['success']) {
                return back()->with('success', 'Klaim berhasil difinalisasi! ' . $finalResult['message']);
            } else {
                return back()->with('error', 'Gagal memfinalisasi klaim: ' . $finalResult['message']);
            }

        } catch (\Exception $e) {
            Log::error('Manual final failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Gagal melakukan finalisasi: ' . $e->getMessage());
        }
    }

    /**
     * Resubmit klaim dan lakukan grouping ulang untuk status 2 atau 3
     */
    public function resubmitGrouping(Request $request)
    {
        try {
            $request->validate([
                'pengajuan_klaim_id' => 'required|exists:app.pengajuan_klaim,id',
                'nomor_sep' => 'required|string',
                'diagnosa' => 'required|string',
                'procedures' => 'required|string',
            ]);

            $pengajuanKlaim = PengajuanKlaim::findOrFail($request->pengajuan_klaim_id);

            // Pastikan klaim dalam status 2 atau 3
            if (!in_array($pengajuanKlaim->status_pengiriman, [2, 3])) {
                return back()->with('error', 'Klaim harus dalam status grouper (2) atau stage 2 (3) untuk resubmit grouping.');
            }

            // Parse diagnosa dan procedures dari JSON
            $diagnosaList = json_decode($request->diagnosa, true) ?: [];
            $proceduresList = json_decode($request->procedures, true) ?: [];

            Log::info('Starting resubmit grouping process', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'current_status' => $pengajuanKlaim->status_pengiriman,
                'diagnosa_count' => count($diagnosaList),
                'procedures_count' => count($proceduresList)
            ]);

            // Step 1: Submit Klaim ulang dengan data minimal + diagnosa/procedures
            $submitResult = $this->submitKlaim($pengajuanKlaim, $diagnosaList, $proceduresList);
            
            if (!$submitResult['success']) {
                return back()->with('error', 'Gagal resubmit klaim: ' . $submitResult['message']);
            }

            // Step 2: Jalankan Groupper ulang
            $groupperResult = $this->runGroupper($pengajuanKlaim);
            
            if ($groupperResult['success']) {
                // Update status ke grouper (2) setelah grouping ulang berhasil
                $pengajuanKlaim->update(['status_pengiriman' => 2]);
                
                return back()->with('success', 'Resubmit dan grouping ulang berhasil! ' . $groupperResult['message']);
            } else {
                return back()->with('error', 'Gagal grouping ulang: ' . $groupperResult['message']);
            }

        } catch (\Exception $e) {
            Log::error('Resubmit grouping failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Gagal melakukan resubmit grouping: ' . $e->getMessage());
        }
    }

    /**
     * Finalisasi klaim dengan format data sesuai API INACBG (otomatis dipanggil setelah grouper)
     */
    private function callFinalApi($pengajuanKlaim)
    {
        try {
            DB::beginTransaction();

            Log::info('Auto final klaim request', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'user_id' => Auth::id()
            ]);

            // Pastikan ada data groupper sebelum finalisasi
            $dataGroupper = DataGroupper::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
            if (!$dataGroupper) {
                throw new \Exception('Data groupper tidak ditemukan. Harap jalankan groupper terlebih dahulu.');
            }

            // Prepare data for INACBG claim_final API
            $inacbgData = [
                'metadata' => [
                    'method' => 'claim_final'
                ],
                'data' => [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'coder_nik' => Auth::user()->nik
                ]
            ];

            // Submit to INACBG claim_final API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');
            
            Log::info('INACBG Final Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['metadata']['code'] ?? 'undefined',
                'message' => $inacbgResponse['metadata']['message'] ?? 'No message'
            ]);
            
            // Check API response
            if ($inacbgResponse['metadata']['code'] != 200) {
                $errorMessage = $inacbgResponse['metadata']['message'] ?? 'Unknown error';
                throw new \Exception('API Error: ' . $errorMessage);
            }

            // Update status pengajuan klaim
            $pengajuanKlaim->update([
                'status_pengiriman' => 4, // Status final
                'response_message' => $inacbgResponse['metadata']['message'],
                'response_data' => $inacbgResponse,
                'updated_at' => now()
            ]);

            // Update atau buat record di data_klaim jika diperlukan
            $dataKlaim = DataKlaim::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
            if ($dataKlaim) {
                $dataKlaim->update([
                    'coder_nik' => Auth::user()->nik,
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            Log::info('Klaim finalized successfully', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'final_message' => $inacbgResponse['metadata']['message']
            ]);

            return [
                'success' => true,
                'message' => $inacbgResponse['metadata']['message'] ?? 'Klaim berhasil difinalisasi'
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to finalize klaim', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Gagal memfinalisasi klaim: ' . $e->getMessage()
            ];
        }
    }
}
