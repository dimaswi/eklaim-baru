<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Helpers\DateHelper;
use App\Models\Eklaim\DataKlaim;
use App\Models\Eklaim\DataGroupper;
use App\Models\Eklaim\DataGrouperStage2;
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
use Illuminate\Support\Facades\Validator;
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
        
        // Load existing data klaim if exists - try by pengajuan_klaim_id first, then by nomor_sep
        $existingDataKlaim = DataKlaim::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
        if (!$existingDataKlaim) {
            $existingDataKlaim = DataKlaim::where('nomor_sep', $pengajuanKlaim->nomor_sep)->first();
        }

        // Load existing groupper data if exists
        $dataGroupper = DataGroupper::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
        
        // Load existing groupper stage 2 data if exists
        $dataGrouperStage2 = DataGrouperStage2::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();

        return Inertia::render('eklaim/klaim/index', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'referenceData' => $referenceData,
            'resumeMedisData' => $resumeMedisData,
            'pengkajianAwalData' => $pengkajianAwalData,
            'kunjunganbpjsData' => $kunjunganbpjsData,
            'dataTagihan' => $dataTagihan,
            'dataGroupper' => $dataGroupper,
            'dataGrouperStage2' => $dataGrouperStage2,
            'existingDataKlaim' => $existingDataKlaim,
        ]);
    }

    /**
     * Store progress data klaim (save as draft)
     */
    public function storeProgress(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        try {
            DB::beginTransaction();

            // Log received data for debugging
            Log::info('=== STORE PROGRESS START ===', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'user_id' => Auth::id(),
                'request_data_count' => count($request->all()),
                'request_data_keys' => array_keys($request->all()),
            ]);

            // Log specific data structures
            Log::info('Tarif RS data received', [
                'tarif_rs' => $request->get('tarif_rs'),
                'tarif_poli_eks' => $request->get('tarif_poli_eks')
            ]);

            Log::info('Medical data received', [
                'sistole' => $request->get('sistole'),
                'diastole' => $request->get('diastole'),
                'discharge_status' => $request->get('discharge_status'),
                'jenis_rawat' => $request->get('jenis_rawat'),
                'nama_dokter' => $request->get('nama_dokter')
            ]);

            // Prepare data for storage
            $data = $this->prepareDataForStorage($request->all(), $pengajuanKlaim);
            $data['is_saved_as_progress'] = true;

            // Validate field mapping
            $validation = $this->validateFieldMapping($request->all(), $data);

            Log::info('Prepared data for storage', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'prepared_data_count' => count($data),
                'prepared_data_keys' => array_keys($data),
                'sample_prepared_data' => array_slice($data, 0, 20, true),
                'field_mapping_issues' => $validation
            ]);

            // Count non-null fields
            $nonNullFields = array_filter($data, function($value) {
                return $value !== null && $value !== '';
            });

            Log::info('Data analysis', [
                'total_fields' => count($data),
                'non_null_fields' => count($nonNullFields),
                'null_fields' => count($data) - count($nonNullFields)
            ]);

            // Update or create data klaim
            $dataKlaim = DataKlaim::updateOrCreate(
                ['nomor_sep' => $pengajuanKlaim->nomor_sep],
                $data
            );

            DB::commit();

            Log::info('Data klaim progress saved successfully', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'user_id' => Auth::id(),
                'data_klaim_id' => $dataKlaim->id,
                'saved_fields_count' => count($nonNullFields),
                'operation' => $dataKlaim->wasRecentlyCreated ? 'created' : 'updated'
            ]);

            return back()->with('success', 'Progress berhasil disimpan');

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('Error saving data klaim progress', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return back()->with('error', 'Gagal menyimpan progress: ' . $e->getMessage());
        }
    }

    /**
     * Prepare data for storage - simple direct mapping
     */
    private function prepareDataForStorage($requestData, $pengajuanKlaim)
    {
        $data = [
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'pengajuan_klaim_id' => $pengajuanKlaim->id,
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
        // Also format datetime fields inside nested objects
        $jsonFields = ['tarif_rs', 'apgar', 'ventilator', 'persalinan', 'covid19_penunjang_pengurang'];
        foreach ($jsonFields as $field) {
            if (isset($requestData[$field]) && is_array($requestData[$field])) {
                // Format datetime fields inside nested objects
                $processedData = $this->processNestedDateFields($requestData[$field]);
                $data[$field] = json_encode($processedData);
            }
        }

        return $data;
    }

    /**
     * Process nested date fields in array structures
     */
    private function processNestedDateFields($data)
    {
        if (!is_array($data)) {
            return $data;
        }

        $dateFields = ['start_dttm', 'stop_dttm', 'delivery_dttm', 'shk_spesimen_dttm'];
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // Recursively process nested arrays (like delivery array in persalinan)
                $data[$key] = $this->processNestedDateFields($value);
            } elseif (in_array($key, $dateFields) && !empty($value)) {
                // Format datetime fields
                $data[$key] = $this->formatDateForDatabase($value) ?? $value;
            }
        }

        return $data;
    }

    /**
     * Prepare data for INACBG API submission (set_claim_data)
     */
    private function prepareDataForInacbg($requestData, $pengajuanKlaim)
    {
        // Base metadata for INACBG API
        $metadata = [
            'method' => 'set_claim_data',
            'nomor_sep' => $pengajuanKlaim->nomor_sep
        ];

        // Process ventilator data with date formatting
        $ventilatorData = $requestData['ventilator'] ?? [
            'use_ind' => '0',
            'start_dttm' => '',
            'stop_dttm' => ''
        ];
        if (is_array($ventilatorData)) {
            if (!empty($ventilatorData['start_dttm'])) {
                $ventilatorData['start_dttm'] = $this->formatDateForInacbg($ventilatorData['start_dttm']);
            }
            if (!empty($ventilatorData['stop_dttm'])) {
                $ventilatorData['stop_dttm'] = $this->formatDateForInacbg($ventilatorData['stop_dttm']);
            }
        }

        // Process persalinan data with date formatting
        $persalinanData = $requestData['persalinan'] ?? [];
        if (is_array($persalinanData) && isset($persalinanData['delivery']) && is_array($persalinanData['delivery'])) {
            foreach ($persalinanData['delivery'] as $index => $delivery) {
                if (!empty($delivery['delivery_dttm'])) {
                    $persalinanData['delivery'][$index]['delivery_dttm'] = $this->formatDateForInacbg($delivery['delivery_dttm']);
                }
                if (!empty($delivery['shk_spesimen_dttm'])) {
                    $persalinanData['delivery'][$index]['shk_spesimen_dttm'] = $this->formatDateForInacbg($delivery['shk_spesimen_dttm']);
                }
            }
        }

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
            'adl_sub_acute' => $requestData['adl_sub_acute'] ?? '0',
            'adl_chronic' => $requestData['adl_chronic'] ?? '0',
            'icu_indikator' => $requestData['icu_indikator'] ?? '0',
            'icu_los' => $requestData['icu_los'] ?? '0',
            
            // Ventilator data (already formatted)
            'ventilator_hour' => $requestData['ventilator_hour'] ?? '0',
            'ventilator' => $ventilatorData,
            
            // Upgrade class data
            'upgrade_class_ind' => $requestData['upgrade_class_ind'] ?? '0',
            'upgrade_class_class' => $requestData['upgrade_class_class'] ?? '',
            'upgrade_class_los' => $requestData['upgrade_class_los'] ?? '0',
            'upgrade_class_payor' => $requestData['upgrade_class_payor'] ?? '',
            'add_payment_pct' => $requestData['add_payment_pct'] ?? '0',
            
            // Medical data
            'birth_weight' => $requestData['birth_weight'] ?? '0',
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
            'pemulasaraan_jenazah' => $requestData['pemulasaraan_jenazah'] ?? '0',
            'kantong_jenazah' => $requestData['kantong_jenazah'] ?? '0',
            'peti_jenazah' => $requestData['peti_jenazah'] ?? '0',
            'plastik_erat' => $requestData['plastik_erat'] ?? '0',
            'desinfektan_jenazah' => $requestData['desinfektan_jenazah'] ?? '0',
            'mobil_jenazah' => $requestData['mobil_jenazah'] ?? '0',
            'desinfektan_mobil_jenazah' => $requestData['desinfektan_mobil_jenazah'] ?? '0',
            'covid19_status_cd' => $requestData['covid19_status_cd'] ?? '',
            'nomor_kartu_t' => $requestData['nomor_kartu_t'] ?? '',
            'episodes' => $requestData['episodes'] ?? '',
            'covid19_cc_ind' => $requestData['covid19_cc_ind'] ?? '0',
            'covid19_rs_darurat_ind' => $requestData['covid19_rs_darurat_ind'] ?? '0',
            'covid19_co_insidense_ind' => $requestData['covid19_co_insidense_ind'] ?? '0',
            'covid19_penunjang_pengurang' => $requestData['covid19_penunjang_pengurang'] ?? [],
            
            // Other data
            'terapi_konvalesen' => $requestData['terapi_konvalesen'] ?? '0',
            'akses_naat' => $requestData['akses_naat'] ?? '',
            'isoman_ind' => $requestData['isoman_ind'] ?? '0',
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
            
            // Persalinan data (already formatted with dates)
            'persalinan' => $persalinanData,
            
            // RS data
            'tarif_poli_eks' => $requestData['tarif_poli_eks'] ?? '0',
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

    /**
     * Format tariff data for INACBG (ensure all values are strings)
     */
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
     * Prepare data for INACBG Groupper API submission
     */
    private function prepareDataForGroupper($requestData, $pengajuanKlaim)
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

    /**
     * Format date for INACBG API (YYYY-MM-DD HH:mm:ss)
     * Supports multiple input formats including dd/mm/yyyy hh:mm:ss
     */
    private function formatDateForInacbg($dateTimeString)
    {
        return DateHelper::formatForInacbg($dateTimeString);
    }

    /**
     * Parse currency value from frontend format to integer
     */
    private function parseCurrencyValue($value)
    {
        if ($value === null || $value === '' || $value === '0') {
            return 0;
        }
        
        if (is_string($value)) {
            // Remove currency formatting (Rp, dots, spaces)
            $value = str_replace(['Rp', '.', ' '], '', $value);
            // Replace comma with dot for decimal
            $value = str_replace(',', '.', $value);
        }
        
        // Convert to integer (floor the value)
        return $value ? (int) floor((float) $value) : 0;
    }

    /**
     * Format date from frontend datetime-local format to database format
     * Supports multiple input formats including dd/mm/yyyy hh:mm:ss
     */
    private function formatDateForDatabase($dateTimeString)
    {
        return DateHelper::formatForDatabase($dateTimeString);
    }

    /**
     * Validate field mapping and identify missing fields
     */
    private function validateFieldMapping($requestData, $preparedData)
    {
        $modelFillableFields = (new DataKlaim())->getFillable();
        $requestFields = array_keys($requestData);
        $preparedFields = array_keys($preparedData);
        
        // Find fields in request but not in model
        $missingInModel = array_diff($requestFields, $modelFillableFields);
        
        // Find fields lost during preparation
        $lostDuringPreparation = array_diff($requestFields, $preparedFields);
        
        Log::info('Field mapping analysis', [
            'request_fields_count' => count($requestFields),
            'prepared_fields_count' => count($preparedFields),
            'model_fillable_count' => count($modelFillableFields),
            'missing_in_model' => $missingInModel,
            'lost_during_preparation' => $lostDuringPreparation,
            'sample_request_fields' => array_slice($requestFields, 0, 20),
            'sample_prepared_fields' => array_slice($preparedFields, 0, 20)
        ]);
        
        return [
            'missing_in_model' => $missingInModel,
            'lost_during_preparation' => $lostDuringPreparation
        ];
    }

    /**
     * Submit final klaim data (not just progress save)
     */
    public function submitKlaim(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        try {
            // Log incoming request data for debugging
            Log::info('Submit Klaim - Incoming Data', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'tgl_masuk' => $request->input('tgl_masuk'),
                'tgl_pulang' => $request->input('tgl_pulang'),
                'nama_dokter' => $request->input('nama_dokter'),
                'jenis_rawat' => $request->input('jenis_rawat'),
                'discharge_status' => $request->input('discharge_status'),
            ]);

            // Validate required fields for final submission
            $this->validateSubmissionData($request);

            // Transform the request data to match expected structure
            $requestData = $request->all();
            
            // Prepare data for storage with proper JSON structure handling
            $preparedData = $this->prepareDataForStorage($requestData, $pengajuanKlaim);
            
            // Additional validation for submission
            $this->validateFinalSubmission($preparedData);

            // Prepare data for INACBG API submission
            $inacbgData = $this->prepareDataForInacbg($requestData, $pengajuanKlaim);
            
            // Submit to INACBG API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');
            
            Log::info('INACBG Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['status_code'] ?? 'undefined',
                'response' => $inacbgResponse['response'] ?? null,
                'error' => $inacbgResponse['error'] ?? null
            ]);
            
            // Jika response code bukan 200 (API error)
            if ($inacbgResponse['metadata']['code'] != 200) {
                $errorMessage = $inacbgResponse['metadata']['message'] ?? 'Unknown error';
                
                // Simpan data klaim untuk kasus API error
                $dataKlaim = DataKlaim::updateOrCreate(
                    ['nomor_sep' => $pengajuanKlaim->nomor_sep],
                    array_merge($preparedData, [
                        'is_saved_as_progress' => false,
                        'rejection_reason' => $errorMessage,
                        'submitted_at' => now(),
                    ])
                );

                // Update pengajuan klaim dengan status error
                $pengajuanKlaim->update([
                    'status_pengiriman' => PengajuanKlaim::STATUS_DEFAULT,
                    'response_message' => $errorMessage,
                    'response_data' => $inacbgResponse,
                ]);

                return redirect()->back()->with('error', 'Gagal submit klaim: ' . $errorMessage);
            }

            // Jika response code 200 (sukses)
            if ($inacbgResponse['metadata']['code'] == 200) {
                // Store/update the klaim data dengan status submitted
                $dataKlaim = DataKlaim::updateOrCreate(
                    ['nomor_sep' => $pengajuanKlaim->nomor_sep],
                    array_merge($preparedData, [
                        'is_saved_as_progress' => false,
                        'rejection_reason' => null, // Clear rejection reason jika ada
                        'submitted_at' => now(),
                    ])
                );

                // Update pengajuan klaim status
                // Untuk sementara set status ke 0
                $pengajuanKlaim->update([
                    'status_pengiriman' => PengajuanKlaim::STATUS_DEFAULT,
                    'response_message' => $inacbgResponse['metadata']['message'],
                    'response_data' => $inacbgResponse,
                ]);

                return back()->with('success', 'Klaim berhasil disubmit ke INACBG: ' . $inacbgResponse['metadata']['message']);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Submit klaim validation failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'errors' => $e->errors()
            ]);

            // Simpan data klaim dengan validation error
            try {
                $preparedData = $this->prepareDataForStorage($request->all(), $pengajuanKlaim);
                DataKlaim::updateOrCreate(
                    ['nomor_sep' => $pengajuanKlaim->nomor_sep],
                    array_merge($preparedData, [
                        'is_saved_as_progress' => false,
                        'rejection_reason' => 'Validasi gagal: ' . implode(', ', collect($e->errors())->flatten()->toArray()),
                        'submitted_at' => now(),
                    ])
                );
            } catch (\Exception $saveException) {
                Log::error('Failed to save data during validation error', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'save_error' => $saveException->getMessage()
                ]);
            }

            return back()->withErrors($e->errors())->with('error', 'Data tidak valid');

        } catch (\Exception $e) {
            Log::error('Submit klaim failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Simpan data klaim dengan system error
            try {
                $preparedData = $this->prepareDataForStorage($request->all(), $pengajuanKlaim);
                DataKlaim::updateOrCreate(
                    ['nomor_sep' => $pengajuanKlaim->nomor_sep],
                    array_merge($preparedData, [
                        'is_saved_as_progress' => false,
                        'rejection_reason' => 'System error: ' . $e->getMessage(),
                        'submitted_at' => now(),
                    ])
                );
            } catch (\Exception $saveException) {
                Log::error('Failed to save data during system error', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'save_error' => $saveException->getMessage()
                ]);
            }

            return back()->with('error', 'Gagal submit klaim: ' . $e->getMessage());
        }
    }

    /**
     * Submit klaim data to INACBG Groupper
     */
    public function groupper(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        try {
            // Validate required fields for groupper submission
            $this->validateSubmissionData($request);

            // Transform the request data to match expected structure
            $requestData = $request->all();
            
            // Prepare data for storage with proper JSON structure handling
            $preparedData = $this->prepareDataForStorage($requestData, $pengajuanKlaim);
            
            // Additional validation for submission
            $this->validateFinalSubmission($preparedData);

            // Prepare data for INACBG Groupper API submission
            $inacbgData = $this->prepareDataForGroupper($requestData, $pengajuanKlaim);

            // Submit to INACBG Groupper API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');

            
            // Jika response code bukan 200 (API error)
            if ($inacbgResponse['metadata']['code'] != 200) {
                $errorMessage = $inacbgResponse['metadata']['message'] ?? 'Unknown error';

                return redirect()->back()->with('error', 'Gagal memanggil groupper: ' . $errorMessage);
            }

            // Jika response code 200 (sukses)
            if ($inacbgResponse['metadata']['code'] == 200) {
                // Save groupper response to database
                $dataGroupper = $this->saveGrouperResponse($pengajuanKlaim, $inacbgResponse);
                
                // Check if there are special_cmg_option for stage 2
                $specialCmgOptions = $inacbgResponse['response']['special_cmg_option'] ?? [];
                
                if (!empty($specialCmgOptions) && $dataGroupper !== null) {
                    // Automatically proceed to groupper stage 2
                    $stage2Response = $this->processGrouperStage2($pengajuanKlaim, $dataGroupper, $specialCmgOptions);
                    
                    if ($stage2Response) {
                        // Update status to STAGE_2_COMPLETED (3)
                        $pengajuanKlaim->update([
                            'status_pengiriman' => 3, // Stage 2 completed
                            'response_message' => 'Groupper Stage 2 completed',
                            'response_data' => $stage2Response,
                        ]);
                        
                        return back()->with('success', 'Groupper Stage 1 & 2 berhasil dijalankan. Data special CMG tersedia.');
                    }
                }
                
                // Update pengajuan klaim status to GROUPER (stage 1 only)
                $pengajuanKlaim->update([
                    'status_pengiriman' => PengajuanKlaim::STATUS_GROUPER,
                    'response_message' => $inacbgResponse['metadata']['message'],
                    'response_data' => $inacbgResponse,
                ]);

                Log::info('Groupper completed successfully', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'inacbg_message' => $inacbgResponse['metadata']['message']
                ]);

                return back()->with('success', 'Groupper berhasil dijalankan: ' . $inacbgResponse['metadata']['message']);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Groupper validation failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'errors' => $e->errors()
            ]);

            return back()->withErrors($e->errors())->with('error', 'Data tidak valid untuk groupper');

        } catch (\Exception $e) {
            Log::error('Groupper failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Gagal menjalankan groupper: ' . $e->getMessage());
        }
    }

    /**
     * Validate submission data for required fields
     */
    private function validateSubmissionData(Request $request)
    {
        $rules = [
            'nama_dokter' => 'required|string',
            'jenis_rawat' => 'required|string',
            'discharge_status' => 'required|string',
            'tgl_masuk' => 'required|string',
            'tgl_pulang' => 'required|string',
        ];

        $messages = [
            'nama_dokter.required' => 'Nama dokter harus diisi',
            'jenis_rawat.required' => 'Jenis rawat harus dipilih',
            'discharge_status.required' => 'Status discharge harus dipilih',
            'tgl_masuk.required' => 'Tanggal masuk harus diisi',
            'tgl_pulang.required' => 'Tanggal keluar harus diisi',
        ];

        $request->validate($rules, $messages);
    }

    /**
     * Additional validation for final submission
     */
    private function validateFinalSubmission($preparedData)
    {
        // Simple validation - only check absolutely required fields
        $requiredFields = ['jenis_rawat', 'discharge_status', 'nama_dokter'];
        
        foreach ($requiredFields as $field) {
            if (empty($preparedData[$field])) {
                throw new \Exception("Field {$field} tidak boleh kosong untuk submit klaim");
            }
        }
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
        
        if ($data && $data->dpjpLayan) {
            // Get dokter name from regonline.dokter table
            $dokter = DB::connection('regonline')
                ->table('dokter')
                ->where('KODE', $data->dpjpLayan)
                ->first();
            
            if ($dokter) {
                $data->nama_dokter = $dokter->NAMA;
            }
        }
        
        return $data;
    }

    public function loadDataTarif($nomorSEP)
    {
        $dataBPJS = Penjamin::where('NOMOR', $nomorSEP)->first();
        $dataPembayaran = TagihanPendaftaran::where('PENDAFTARAN', $dataBPJS->NOPEN)->first();
        $data = Tagihan::where('ID', $dataPembayaran->TAGIHAN)->first();
        return $data;
    }

    /**
     * Save groupper response to database
     */
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

            // Prepare data for stage 2 groupper
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
            
            // Create or update data groupper stage 2
            $dataGrouperStage2 = DataGrouperStage2::updateOrCreate(
                [
                    'pengajuan_klaim_id' => $pengajuanKlaim->id,
                    'data_groupper_id' => $dataGroupper->id,
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                ],
                [
                    'selected_special_cmg' => $selectedCmg,
                    
                    // Metadata
                    'metadata_code' => $responseData['metadata']['code'] ?? null,
                    'metadata_message' => $responseData['metadata']['message'] ?? null,
                    
                    // CBG Data
                    'cbg_code' => $cbg['code'] ?? null,
                    'cbg_description' => $cbg['description'] ?? null,
                    'cbg_tariff' => $cbg['tariff'] ?? null,
                    
                    // Special CMG Data
                    'special_cmg' => $specialCmg,
                    
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
                ]
            );
            
            Log::info('Groupper Stage 2 response saved successfully', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'selected_cmg' => $selectedCmg,
                'cbg_code' => $cbg['code'] ?? 'N/A',
            ]);
            
            return $dataGrouperStage2;
            
        } catch (\Exception $e) {
            Log::error('Failed to save groupper stage 2 response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'selected_cmg' => $selectedCmg,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Finalisasi klaim dengan format data sesuai API INACBG
     */
    public function final(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'metadata.method' => 'required|string|in:claim_final',
            'data.nomor_sep' => 'required|string',
            'data.coder_nik' => 'required|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $requestData = $request->input('data');
            
            // Log the request
            Log::info('Final klaim request', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $requestData['nomor_sep'],
                'coder_nik' => $requestData['coder_nik'],
                'user_id' => Auth::id()
            ]);

            // Pastikan ada data groupper sebelum finalisasi
            $dataGroupper = DataGroupper::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
            if (!$dataGroupper) {
                throw new \Exception('Data groupper tidak ditemukan. Harap jalankan groupper terlebih dahulu.');
            }

            // Prepare data for INACBG claim_final API
            $inacbgData = [
                'metadata' => $request->input('metadata'),
                'data' => $requestData
            ];

            // Submit to INACBG claim_final API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');
            
            Log::info('INACBG Final Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['status_code'] ?? 'undefined',
                'response' => $inacbgResponse['response'] ?? null,
                'error' => $inacbgResponse['error'] ?? null
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
                    'coder_nik' => $requestData['coder_nik'],
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            // Return success response
            return redirect()->back()->with('success', $inacbgResponse['metadata']['message']);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to finalize klaim', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $request->input('data.nomor_sep'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Gagal memfinalisasi klaim: ' . $e->getMessage());
        }
    }

    /**
     * Reedit klaim yang sudah final (mengubah status kembali ke 1)
     */
    public function reedit(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'metadata.method' => 'required|string|in:reedit_claim',
            'data.nomor_sep' => 'required|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $requestData = $request->input('data');
            
            // Log the request
            Log::info('Reedit klaim request', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $requestData['nomor_sep'],
                'user_id' => Auth::id()
            ]);

            // Pastikan klaim memang sudah final sebelum bisa reedit
            if ($pengajuanKlaim->status_pengiriman !== 4) {
                throw new \Exception('Klaim harus dalam status final untuk dapat di-reedit.');
            }

            // Prepare data for INACBG reedit_claim API
            $inacbgData = [
                'metadata' => $request->input('metadata'),
                'data' => $requestData
            ];

            // Submit to INACBG reedit_claim API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');
            
            Log::info('INACBG Reedit Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['status_code'] ?? 'undefined',
                'response' => $inacbgResponse['response'] ?? null,
                'error' => $inacbgResponse['error'] ?? null
            ]);
            
            // Check API response
            if ($inacbgResponse['metadata']['code'] != 200) {
                $errorMessage = $inacbgResponse['metadata']['message'] ?? 'Unknown error';
                throw new \Exception('API Error: ' . $errorMessage);
            }

            // Update status pengajuan klaim kembali ke 2 (Grouper Stage 1 Selesai)
            $pengajuanKlaim->update([
                'status_pengiriman' => 2, // Status grouper stage 1 selesai untuk bisa di-edit ulang
                'response_message' => $inacbgResponse['metadata']['message'],
                'response_data' => $inacbgResponse,
                'updated_at' => now()
            ]);

            DB::commit();

            // Return success response
            return redirect()->back()->with('success', $inacbgResponse['metadata']['message']);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to reedit klaim', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $request->input('data.nomor_sep'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Gagal membuka klaim untuk edit ulang: ' . $e->getMessage());
        }
    }

    public function kirimInacbg(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'metadata.method' => 'required|string|in:send_claim_individual',
            'data.nomor_sep' => 'required|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $requestData = $request->input('data');
            
            // Log the request
            Log::info('Kirim INACBG klaim request', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $requestData['nomor_sep'],
                'user_id' => Auth::id()
            ]);

            // Pastikan klaim memang sudah final sebelum bisa dikirim ke INACBG
            if ($pengajuanKlaim->status_pengiriman !== 4) {
                throw new \Exception('Klaim harus dalam status final untuk dapat dikirim ke INACBG.');
            }

            // Prepare data for INACBG send_claim_individual API
            $inacbgData = [
                'metadata' => $request->input('metadata'),
                'data' => $requestData
            ];

            // Submit to INACBG send_claim_individual API
            $inacbgResponse = \App\Helpers\InacbgHelper::hitApi($inacbgData, 'POST');
            
            Log::info('INACBG Kirim Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_code' => $inacbgResponse['status_code'] ?? 'undefined',
                'response' => $inacbgResponse['response'] ?? null,
                'error' => $inacbgResponse['error'] ?? null
            ]);
            
            // Check API response
            if ($inacbgResponse['metadata']['code'] != 200) {
                $errorMessage = $inacbgResponse['metadata']['message'] ?? 'Unknown error';
                throw new \Exception('API Error: ' . $errorMessage);
            }

            // Update status pengajuan klaim ke 5 (Selesai Proses Klaim)
            $pengajuanKlaim->update([
                'status_pengiriman' => 5, // Status selesai proses klaim
                'response_message' => $inacbgResponse['metadata']['message'],
                'response_data' => $inacbgResponse,
                'tanggal_kirim' => now(), // Tambahan timestamp kapan dikirim
                'updated_at' => now()
            ]);

            DB::commit();

            // Return success response
            return redirect()->back()->with('success', $inacbgResponse['metadata']['message']);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to kirim klaim ke INACBG', [
                'pengajuan_klaim_id' => $pengajuanKlaim->id,
                'nomor_sep' => $request->input('data.nomor_sep'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Gagal mengirim klaim ke INACBG: ' . $e->getMessage());
        }
    }


    /**
     * Complete IDRG Grouping workflow: Set diagnosis, set procedure (optional), then groupper
     */
    public function idrgGrouping(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'selectedIdrgDiagnoses' => 'required|array|min:1',
            'selectedIdrgDiagnoses.*.code' => 'required|string',
            'selectedIdrgDiagnoses.*.name' => 'required|string',
            'selectedIdrgProcedures' => 'nullable|array',
            'selectedIdrgProcedures.*.code' => 'required_with:selectedIdrgProcedures|string',
            'selectedIdrgProcedures.*.name' => 'required_with:selectedIdrgProcedures|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        try {
            // Parse diagnosis from frontend format
            $selectedDiagnoses = $request->input('selectedIdrgDiagnoses', []);
            $selectedProcedures = $request->input('selectedIdrgProcedures', []);

            // Step 1: Set IDRG Diagnosis (required)
            if (empty($selectedDiagnoses)) {
                return redirect()->back()->with('error', 'Daftar diagnosis IDRG tidak boleh kosong.');
            }

            $diagnosisString = $this->formatDiagnosesToString($selectedDiagnoses);
            
            $diagnosisData = [
                'metadata' => [
                    'method' => 'idrg_diagnosa_set',
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                ],
                'data' => [
                    'diagnosa' => $diagnosisString,
                ]
            ];

            $diagnosisResponse = \App\Helpers\InacbgHelper::hitApi($diagnosisData, 'POST');

            Log::info('IDRG Diagnosis Set Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'diagnosis_string' => $diagnosisString,
                'response' => $diagnosisResponse ?? null,
            ]);
            
            if ($diagnosisResponse['metadata']['code'] != 200) {
                return redirect()->back()->with('error', 'Gagal set diagnosa IDRG: ' . ($diagnosisResponse['metadata']['message'] ?? 'Unknown error'));
            }

            // Step 2: Set IDRG Procedure (optional)
            $procedureResponse = null;
            if (!empty($selectedProcedures)) {
                $procedureString = $this->formatProceduresToString($selectedProcedures);
                
                $procedureData = [
                    'metadata' => [
                        'method' => 'idrg_prosedur_set',
                        'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    ],
                    'data' => [
                        'prosedur' => $procedureString,
                    ]
                ];

                $procedureResponse = \App\Helpers\InacbgHelper::hitApi($procedureData, 'POST');

                Log::info('IDRG Procedure Set Response', [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'procedure_string' => $procedureString,
                    'response' => $procedureResponse ?? null,
                ]);
                
                if ($procedureResponse['metadata']['code'] != 200) {
                    return redirect()->back()->with('error', 'Gagal set prosedur IDRG: ' . ($procedureResponse['metadata']['message'] ?? 'Unknown error'));
                }
            }

            // Step 3: Run IDRG Groupper
            $groupperData = [
                'metadata' => [
                    'method' => 'grouper',
                    'stage' => '1',
                    'groupper' => 'idrg',
                ],
                'data' => [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                ]
            ];

            $groupperResponse = \App\Helpers\InacbgHelper::hitApi($groupperData, 'POST');

            Log::info('IDRG Groupper Response', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'response' => $groupperResponse ?? null,
            ]);
            
            if ($groupperResponse['metadata']['code'] != 200) {
                return redirect()->back()->with('error', 'Gagal menjalankan IDRG grouping: ' . ($groupperResponse['metadata']['message'] ?? 'Unknown error'));
            }

            // Update pengajuan klaim dengan IDRG value dari response
            // Store the IDRG code from the response - if no specific IDRG field exists, use status
            $idrgCode = $groupperResponse['response']['cbg']['code'] ?? null;
            
            // Update the IDRG status - assume 1 means grouping completed successfully
            $pengajuanKlaim->update(['idrg' => 1]);
            
            // Log the IDRG code for reference
            Log::info('IDRG Grouping completed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'idrg_code' => $idrgCode,
                'idrg_status' => 1
            ]);

            return redirect()->back()->with('success', 'IDRG Grouping berhasil dijalankan: ' . $groupperResponse['metadata']['message']);

        } catch (\Exception $e) {
            Log::error('IDRG Grouping failed', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Gagal menjalankan IDRG grouping: ' . $e->getMessage());
        }
    }

    /**
     * Format diagnosis array to string format expected by INACBG
     */
    private function formatDiagnosesToString($diagnoses)
    {
        if (empty($diagnoses)) {
            return '';
        }

        // Count occurrences of each code
        $codeCount = [];
        foreach ($diagnoses as $diagnosis) {
            if (isset($diagnosis['code'])) {
                $code = $diagnosis['code'];
                $codeCount[$code] = ($codeCount[$code] ?? 0) + 1;
            }
        }

        // Build formatted string
        $formattedCodes = [];
        foreach ($codeCount as $code => $count) {
            $formattedCodes[] = $count > 1 ? "{$code}+{$count}" : $code;
        }

        return implode('#', $formattedCodes);
    }

    /**
     * Format procedures array to string format expected by INACBG
     */
    private function formatProceduresToString($procedures)
    {
        if (empty($procedures)) {
            return '';
        }

        // Count occurrences of each code
        $codeCount = [];
        foreach ($procedures as $procedure) {
            if (isset($procedure['code'])) {
                $code = $procedure['code'];
                $codeCount[$code] = ($codeCount[$code] ?? 0) + 1;
            }
        }

        // Build formatted string
        $formattedCodes = [];
        foreach ($codeCount as $code => $count) {
            $formattedCodes[] = $count > 1 ? "{$code}+{$count}" : $code;
        }

        return implode('#', $formattedCodes);
    }
}
