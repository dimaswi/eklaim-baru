<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\DataKlaim;
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

        return Inertia::render('eklaim/klaim/index', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'referenceData' => $referenceData,
            'resumeMedisData' => $resumeMedisData,
            'pengkajianAwalData' => $pengkajianAwalData,
            'kunjunganbpjsData' => $kunjunganbpjsData,
            'dataTagihan' => $dataTagihan,
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
            $data['status'] = 'draft';
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

            return response()->json([
                'success' => true,
                'message' => 'Progress berhasil disimpan',
                'data' => [
                    'id' => $dataKlaim->id,
                    'total_fields' => count($data),
                    'saved_fields' => count($nonNullFields),
                    'operation' => $dataKlaim->wasRecentlyCreated ? 'created' : 'updated'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('Error saving data klaim progress', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan progress: ' . $e->getMessage(),
                'error_details' => [
                    'message' => $e->getMessage(),
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Prepare data for storage by mapping request data to database fields
     */
    private function prepareDataForStorage($requestData, $pengajuanKlaim)
    {
        $data = [
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'pengajuan_klaim_id' => $pengajuanKlaim->id,
        ];

        // Header Information
        $headerFields = [
            'nomor_kartu', 'nomor_rm', 'nama_pasien', 'jenis_kelamin', 'tanggal_lahir',
            'nik', 'nomor_telepon', 'alamat', 'kelurahan', 'kecamatan', 'kabupaten',
            'provinsi', 'kode_pos', 'nomor_rujukan', 'faskes_rujukan', 'ppk_pelayanan',
            'tanggal_sep', 'tanggal_masuk', 'tanggal_keluar', 'cara_masuk', 'keluhan',
            'kelas_rawat', 'nomor_registrasi', 'nomor_kamar', 'ruangan', 'naik_kelas',
            'jenis_rawat', 'nama_dokter', 'discharge_status'
        ];

        foreach ($headerFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $requestData[$field];
            }
        }

        // Map frontend field names to database field names
        $fieldMapping = [
            'tgl_masuk' => 'tanggal_masuk',
            'tgl_pulang' => 'tanggal_keluar',
            'norm' => 'nomor_rm'
        ];

        foreach ($fieldMapping as $frontendField => $dbField) {
            if (isset($requestData[$frontendField])) {
                $data[$dbField] = $requestData[$frontendField];
            }
        }

        // Special handling for alergi (JSON field)
        if (isset($requestData['alergi'])) {
            $data['alergi'] = is_array($requestData['alergi']) ? $requestData['alergi'] : json_decode($requestData['alergi'], true);
        }

        // Vital Signs
        $vitalFields = [
            'sistole', 'diastole', 'berat_badan', 'tinggi_badan', 'nadi', 'suhu', 'pernapasan'
        ];

        foreach ($vitalFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $requestData[$field];
            }
        }

        // Map sistole/diastole to tekanan_darah for compatibility
        if (isset($requestData['sistole']) && isset($requestData['diastole'])) {
            $data['tekanan_darah'] = $requestData['sistole'] . '/' . $requestData['diastole'];
        }

        // ICD Data - Handle both direct fields and code strings
        $icdFields = [
            'kode_icd10_primer', 'diagnosa_primer', 'kode_icd9_primer', 'tindakan_primer',
            'diagnosa', 'procedure', 'diagnosa_inagrouper', 'procedure_inagrouper'
        ];

        foreach ($icdFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $requestData[$field];
            }
        }

        // Handle diagnosa and procedure codes from frontend
        if (isset($requestData['diagnosa'])) {
            // Store the full string for frontend compatibility
            $data['diagnosa'] = $requestData['diagnosa'];
            
            // Primary diagnosis from first code
            $diagnosaCodes = explode('#', $requestData['diagnosa']);
            if (!empty($diagnosaCodes[0])) {
                $data['kode_icd10_primer'] = $diagnosaCodes[0];
            }
            // Secondary diagnoses as JSON
            if (count($diagnosaCodes) > 1) {
                $secondaryDiagnoses = array_slice($diagnosaCodes, 1);
                $data['diagnosa_sekunder'] = array_map(function($code) {
                    return ['code' => $code, 'name' => 'Diagnosa ' . $code];
                }, $secondaryDiagnoses);
            }
        }

        if (isset($requestData['procedure'])) {
            // Store the full string for frontend compatibility
            $data['procedure'] = $requestData['procedure'];
            
            // Primary procedure from first code
            $procedureCodes = explode('#', $requestData['procedure']);
            if (!empty($procedureCodes[0])) {
                $data['kode_icd9_primer'] = $procedureCodes[0];
            }
            // Secondary procedures as JSON
            if (count($procedureCodes) > 1) {
                $secondaryProcedures = array_slice($procedureCodes, 1);
                $data['tindakan_sekunder'] = array_map(function($code) {
                    return ['code' => $code, 'name' => 'Tindakan ' . $code];
                }, $secondaryProcedures);
            }
        }

        // Tariff Information - Handle nested tarif_rs structure
        if (isset($requestData['tarif_rs']) && is_array($requestData['tarif_rs'])) {
            $tarifMapping = [
                'prosedur_non_bedah' => 'prosedur_non_bedah',
                'prosedur_bedah' => 'prosedur_bedah',
                'konsultasi' => 'konsultasi',
                'tenaga_ahli' => 'visite',
                'keperawatan' => 'asuhan_keperawatan',
                'penunjang' => 'penunjang',
                'radiologi' => 'penunjang',
                'laboratorium' => 'penunjang',
                'pelayanan_darah' => 'pelayanan_darah',
                'rehabilitasi' => 'rehabilitasi',
                'kamar' => 'akomodasi',
                'rawat_intensif' => 'icu',
                'obat' => 'obat',
                'obat_kronis' => 'obat',
                'obat_kemoterapi' => 'obat',
                'alkes' => 'alat_kesehatan',
                'bmhp' => 'bahan_medis_habis_pakai',
                'sewa_alat' => 'sewa_alat'
            ];

            foreach ($tarifMapping as $frontendField => $dbField) {
                if (isset($requestData['tarif_rs'][$frontendField])) {
                    $value = $requestData['tarif_rs'][$frontendField];
                    $data[$dbField] = $this->parseCurrencyValue($value);
                }
            }
        }

        // Direct tariff fields (if any)
        $directTariffFields = [
            'akomodasi', 'asuhan_keperawatan', 'bahan_medis_habis_pakai', 'kamar_operasi',
            'konsultasi', 'obat', 'pelayanan_darah', 'penunjang', 'prosedur_bedah',
            'prosedur_non_bedah', 'rehabilitasi', 'sewa_alat', 'visite', 'icu', 'iccu',
            'alat_kesehatan', 'transport_pasien', 'lain_lain', 'total_tarif', 'tarif_poli_eks'
        ];

        foreach ($directTariffFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $this->parseCurrencyValue($requestData[$field]);
            }
        }

        // APGAR Scores - Handle nested structure
        if (isset($requestData['apgar']) && is_array($requestData['apgar'])) {
            $data['apgar'] = $requestData['apgar'];
            
            // Store individual APGAR fields for database queries
            $apgarFields = [
                'appearance_1' => 'apgar_appearance_1',
                'pulse_1' => 'apgar_pulse_1',
                'grimace_1' => 'apgar_grimace_1',
                'activity_1' => 'apgar_activity_1',
                'respiration_1' => 'apgar_respiration_1',
                'appearance_5' => 'apgar_appearance_5',
                'pulse_5' => 'apgar_pulse_5',
                'grimace_5' => 'apgar_grimace_5',
                'activity_5' => 'apgar_activity_5',
                'respiration_5' => 'apgar_respiration_5'
            ];
            
            foreach ($apgarFields as $frontendField => $dbField) {
                if (isset($requestData['apgar'][$frontendField])) {
                    $data[$dbField] = (int) $requestData['apgar'][$frontendField];
                }
            }
        }

        // Ventilator Data - Handle nested structure
        if (isset($requestData['ventilator']) && is_array($requestData['ventilator'])) {
            $data['ventilator'] = $requestData['ventilator'];
            
            $ventilatorFields = [
                'start_date' => 'ventilator_start_date',
                'end_date' => 'ventilator_end_date',
                'duration' => 'ventilator_duration'
            ];
            
            foreach ($ventilatorFields as $frontendField => $dbField) {
                if (isset($requestData['ventilator'][$frontendField])) {
                    $data[$dbField] = $requestData['ventilator'][$frontendField];
                }
            }
        }

        // Upgrade Class - Handle nested structure
        if (isset($requestData['upgrade_class']) && is_array($requestData['upgrade_class'])) {
            $data['upgrade_class'] = $requestData['upgrade_class'];
            
            $upgradeFields = [
                'indication' => 'upgrade_class_indication',
                'care_class' => 'upgrade_class_care_class',
                'care_los' => 'upgrade_class_care_los',
                'payor_detail' => 'upgrade_class_payor_detail'
            ];
            
            foreach ($upgradeFields as $frontendField => $dbField) {
                if (isset($requestData['upgrade_class'][$frontendField])) {
                    $data[$dbField] = $requestData['upgrade_class'][$frontendField];
                }
            }
        }

        // Funeral Preparation Fields
        $funeralFields = [
            'deceased_date', 'deceased_time', 'deceased_location', 'funeral_method',
            'funeral_name', 'funeral_nik', 'funeral_family_card'
        ];

        foreach ($funeralFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $requestData[$field];
            }
        }

        // Case Information
        $caseFields = [
            'tipe_discharge', 'case_death', 'adl_score', 'upgrade_class_ind',
            'los_icu', 'ventilator_hour', 'upgrade_class_class', 'upgrade_class_los',
            'upgrade_class_payor', 'birth_weight', 'los', 'birth_weight_grams',
            'gestational_age'
        ];

        foreach ($caseFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $requestData[$field];
            }
        }

        // Boolean Checkbox Fields
        $checkboxFields = [
            'add_payment_pct', 'birth_weight_extreme', 'fetal_reduction', 'admission_weight',
            'chronic_dialysis', 'acute_dialysis', 'ventilator_support', 'chemotherapy',
            'is_covid19_suspect', 'is_covid19_probable', 'is_covid19_confirmed',
            'case_death', 'upgrade_class_ind', 'is_persalinan'
        ];

        foreach ($checkboxFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = (bool) $requestData[$field];
            }
        }

        // COVID-19 Fields
        if (isset($requestData['covid_19_status'])) {
            $data['covid_19_status'] = $requestData['covid_19_status'];
        }

        if (isset($requestData['covid_19_cc'])) {
            $data['covid_19_cc'] = is_array($requestData['covid_19_cc']) 
                ? $requestData['covid_19_cc'] 
                : json_decode($requestData['covid_19_cc'], true);
        }

        if (isset($requestData['covid_19_pcare'])) {
            $data['covid_19_pcare'] = is_array($requestData['covid_19_pcare']) 
                ? $requestData['covid_19_pcare'] 
                : json_decode($requestData['covid_19_pcare'], true);
        }

        // Additional Medical Information
        $medicalFields = [
            'pemeriksaan_penunjang', 'cara_pulang', 'kondisi_pulang', 'penyebab_kematian',
            'riwayat_alergi', 'riwayat_penyakit', 'diet_nutrisi', 'treatment_history',
            'medication_allergy', 'food_allergy', 'other_allergy', 'treatment_plan',
            'nursing_care_plan', 'special_procedures'
        ];

        foreach ($medicalFields as $field) {
            if (isset($requestData[$field])) {
                $data[$field] = $requestData[$field];
            }
        }

        // Handle JSON arrays for medical procedures and medications
        if (isset($requestData['prosedur_medis'])) {
            $data['prosedur_medis'] = is_array($requestData['prosedur_medis']) 
                ? $requestData['prosedur_medis'] 
                : json_decode($requestData['prosedur_medis'], true);
        }

        if (isset($requestData['obat_dikonsumsi'])) {
            $data['obat_dikonsumsi'] = is_array($requestData['obat_dikonsumsi']) 
                ? $requestData['obat_dikonsumsi'] 
                : json_decode($requestData['obat_dikonsumsi'], true);
        }

        // Persalinan Data
        if (isset($requestData['persalinan_data'])) {
            $data['persalinan_data'] = is_array($requestData['persalinan_data']) 
                ? $requestData['persalinan_data'] 
                : json_decode($requestData['persalinan_data'], true);
        }

        // Additional metadata
        if (isset($requestData['metadata'])) {
            $data['metadata'] = is_array($requestData['metadata']) 
                ? $requestData['metadata'] 
                : json_decode($requestData['metadata'], true);
        }

        return $data;
    }

    /**
     * Parse currency value from frontend format to decimal
     */
    private function parseCurrencyValue($value)
    {
        if ($value === null || $value === '' || $value === '0') {
            return null;
        }
        
        if (is_string($value)) {
            // Remove currency formatting (Rp, dots, spaces)
            $value = str_replace(['Rp', '.', ' '], '', $value);
            // Replace comma with dot for decimal
            $value = str_replace(',', '.', $value);
        }
        
        return $value ? (float) $value : null;
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
     * Test storage functionality with sample data
     */
    public function testStorage(PengajuanKlaim $pengajuanKlaim)
    {
        try {
            // Create comprehensive test data covering all field types
            $testData = [
                // Basic info
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'nama_pasien' => 'Test Patient',
                'jenis_rawat' => '1',
                'discharge_status' => '1',
                'nama_dokter' => 'Dr. Test',
                'sistole' => '120',
                'diastole' => '80',
                
                // Tarif RS nested structure
                'tarif_rs' => [
                    'prosedur_bedah' => '1000000',
                    'prosedur_non_bedah' => '500000',
                    'konsultasi' => '200000',
                    'kamar' => '300000',
                    'obat' => '150000'
                ],
                
                // Additional tarif
                'tarif_poli_eks' => '100000',
                
                // APGAR scores
                'apgar' => [
                    'appearance_1' => 2,
                    'pulse_1' => 2,
                    'grimace_1' => 1,
                    'activity_1' => 2,
                    'respiration_1' => 2,
                    'appearance_5' => 2,
                    'pulse_5' => 2,
                    'grimace_5' => 2,
                    'activity_5' => 2,
                    'respiration_5' => 2
                ],
                
                // Ventilator data
                'ventilator' => [
                    'start_date' => '2025-09-22 08:00',
                    'end_date' => '2025-09-22 16:00',
                    'duration' => '8'
                ],
                
                // Boolean fields
                'add_payment_pct' => true,
                'birth_weight_extreme' => false,
                'chronic_dialysis' => true,
                'is_covid19_suspect' => false,
                
                // Diagnosis codes
                'diagnosa' => 'A00.1#B00.2#C00.3',
                'procedure' => 'P01.1#P02.2',
                
                // Other fields
                'berat_badan' => '70',
                'tinggi_badan' => '170',
                'los' => '5'
            ];
            
            Log::info('=== TEST STORAGE START ===', [
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'test_data_keys' => array_keys($testData)
            ]);
            
            // Test field mapping
            $preparedData = $this->prepareDataForStorage($testData, $pengajuanKlaim);
            $validation = $this->validateFieldMapping($testData, $preparedData);
            
            // Test database insertion
            $dataKlaim = DataKlaim::updateOrCreate(
                ['nomor_sep' => $pengajuanKlaim->nomor_sep],
                array_merge($preparedData, [
                    'status' => 'draft',
                    'is_saved_as_progress' => true
                ])
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Test storage completed successfully',
                'results' => [
                    'test_data_count' => count($testData),
                    'prepared_data_count' => count($preparedData),
                    'validation_results' => $validation,
                    'data_klaim_id' => $dataKlaim->id,
                    'operation' => $dataKlaim->wasRecentlyCreated ? 'created' : 'updated'
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Test storage failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'details' => [
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine()
                ]
            ], 500);
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
