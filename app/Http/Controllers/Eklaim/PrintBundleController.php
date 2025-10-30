<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\HasilLaboratorium;
use App\Models\Eklaim\HasilRadiologi;
use App\Models\Eklaim\RawatInapResumeMedis;
use App\Models\Eklaim\RawatJalanResumeMedis;
use App\Models\Eklaim\UGDResumeMedis;
use App\Models\Eklaim\RawatInapCPPT;
use App\Models\Eklaim\RawatInapPengkajianAwal;
use App\Models\Eklaim\RawatJalanPengkajianAwal;
use App\Models\Eklaim\UGDPengkajianAwal;
use App\Models\Eklaim\UGDTriage;
use App\Models\Eklaim\RawatInapBalanceCairan;
use App\Models\Eklaim\Tagihan;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;
use App\Helpers\QRCodeHelper;
use App\Helpers\InacbgHelper;
use App\Models\SIMRS\KunjunganBPJS;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\SIMRS\DokterBPJS;

class PrintBundleController extends Controller
{
    public function index($pengajuanId)
    {
        try {
            Log::info('Print Bundle Index Request', [
                'pengajuan_id' => $pengajuanId,
                'request_url' => request()->url(),
                'request_method' => request()->method(),
                'server_environment' => app()->environment(),
                'current_time' => now()->toDateTimeString()
            ]);

            // Test database connections first
            $connectionStatus = $this->testDatabaseConnections();
            Log::info('Database Connection Status', $connectionStatus);

            // Get pengajuan klaim data
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            Log::info('Pengajuan Klaim Found', [
                'pengajuan_id' => $pengajuanId,
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'status_pengiriman' => $pengajuanKlaim->status_pengiriman,
                'nama_pasien' => $pengajuanKlaim->nama_pasien,
                'database_connection' => $pengajuanKlaim->getConnectionName()
            ]);
            
            // Get all related medical records data
            $medicalRecords = $this->getAllMedicalRecords($pengajuanId, $pengajuanKlaim->status_pengiriman);
            
            // Apply saved default order if available
            $savedOrder = $this->loadSavedDefaultOrder($pengajuanId);
            if ($savedOrder) {
                $medicalRecords = $this->applyCustomDefaultOrder($medicalRecords, $savedOrder);
            }
            
            Log::info('Medical Records Retrieved', [
                'pengajuan_id' => $pengajuanId,
                'medical_records_count' => count($medicalRecords),
                'available_types' => array_keys($medicalRecords),
                'available_documents' => array_filter($medicalRecords, function($record) {
                    return $record['available'] ?? false;
                }),
                'available_count' => count(array_filter($medicalRecords, function($record) {
                    return $record['available'] ?? false;
                })),
                'total_types' => count($medicalRecords),
                'has_custom_defaults' => $savedOrder !== null
            ]);
            
            return Inertia::render('eklaim/print-bundle/index', [
                'pengajuanKlaim' => $pengajuanKlaim,
                'medicalRecords' => $medicalRecords,
                'csrf_token' => csrf_token(), // Add CSRF token
            ]);
        } catch (\Exception $e) {
            Log::error('Print Bundle Index Error', [
                'pengajuan_id' => $pengajuanId,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'server_environment' => app()->environment()
            ]);
            
            return redirect()->route('eklaim.pengajuan.index')
                ->with('error', 'Terjadi kesalahan saat memuat data print bundle: ' . $e->getMessage());
        }
    }
    
    private function getAllMedicalRecords($pengajuanId, $statusPengiriman = null)
    {
        try {
            Log::info('Getting medical records', [
                'pengajuan_id' => $pengajuanId,
                'status_pengiriman' => $statusPengiriman,
                'server_environment' => app()->environment()
            ]);

            // Run database diagnostics untuk troubleshooting production
            if (app()->environment('production')) {
                $diagnostics = $this->runDatabaseDiagnostics($pengajuanId);
                Log::info('Production Database Diagnostics', $diagnostics);
            }

            // Get laboratorium data dengan detailed error handling
            try {
                $labData = HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->get();
                Log::info('Lab data retrieved', [
                    'count' => $labData->count(),
                    'connection' => (new HasilLaboratorium())->getConnectionName(),
                    'table' => (new HasilLaboratorium())->getTable()
                ]);
            } catch (\Exception $e) {
                Log::error('Lab data query failed', [
                    'error' => $e->getMessage(),
                    'code' => $e->getCode(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'connection' => (new HasilLaboratorium())->getConnectionName()
                ]);
                $labData = collect([]);
            }
            
            // Get radiologi data dengan detailed error handling
            try {
                $radioData = HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->get();
                Log::info('Radio data retrieved', [
                    'count' => $radioData->count(),
                    'connection' => (new HasilRadiologi())->getConnectionName(),
                    'table' => (new HasilRadiologi())->getTable()
                ]);
            } catch (\Exception $e) {
                Log::error('Radio data query failed', [
                    'error' => $e->getMessage(),
                    'code' => $e->getCode(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'connection' => (new HasilRadiologi())->getConnectionName()
                ]);
                $radioData = collect([]);
            }
            
            // Base medical records array
            $medicalRecords = [];
            
            // Add SEP - Always available since it's based on pengajuan_klaim data
            $medicalRecords['sep'] = [
                'title' => 'Surat Elegibilitas Peserta (SEP)',
                'icon' => '📋',
                'type' => 'single',
                'data' => (object)['status' => 'available'],
                'count' => 1,
                'available' => true,
                'description' => 'Surat Elegibilitas Peserta BPJS Kesehatan',
                'priority' => 0, // Highest priority to show first
                'default_order' => 1, // Default ordering position
                'is_default_selected' => true, // Auto-select by default
            ];
            Log::info('SEP record added to medical records', [
                'pengajuan_id' => $pengajuanId,
                'sep_status' => 'always_available'
            ]);
            
            // Add Berkas Klaim if status_pengiriman >= 4
            if ($statusPengiriman >= 4) {
                $medicalRecords['berkas_klaim'] = [
                    'title' => 'Berkas Klaim',
                    'icon' => '📁',
                    'type' => 'bundle',
                    'data' => (object)['status' => 'final'],
                    'count' => 1,
                    'available' => true,
                    'description' => 'Berkas lengkap klaim yang telah difinalisasi',
                    'priority' => 1, // High priority to show first
                    'default_order' => 2, // Default ordering position
                    'is_default_selected' => true, // Auto-select by default
                ];
                Log::info('Berkas Klaim added to medical records', [
                    'pengajuan_id' => $pengajuanId,
                    'status_pengiriman' => $statusPengiriman,
                    'berkas_klaim_status' => 'available'
                ]);
            } else {
                Log::info('Berkas Klaim not added - status pengiriman too low', [
                    'pengajuan_id' => $pengajuanId,
                    'status_pengiriman' => $statusPengiriman,
                    'required_status' => '>= 4'
                ]);
            }
            
            // Always include all medical records with default ordering
            $medicalRecords = array_merge($medicalRecords, [
                // Laboratorium Data - Count based on database rows, not JSON tindakan_medis_data
                'laboratorium' => [
                    'title' => 'Hasil Laboratorium',
                    'icon' => '🧪',
                    'type' => 'multiple',
                    'data' => $labData,
                    'records' => $labData, // Each database row is a record
                    'count' => $labData->count(),
                    'available' => $labData->count() > 0,
                    'priority' => 2,
                    'default_order' => 3,
                    'is_default_selected' => $labData->count() > 0,
                ],
                
                // Radiologi Data - Count based on database rows
                'radiologi' => [
                    'title' => 'Hasil Radiologi',
                    'icon' => '📸',
                    'type' => 'multiple',
                    'data' => $radioData,
                    'records' => $radioData, // Each database row is a record
                    'count' => $radioData->count(),
                    'available' => $radioData->count() > 0,
                    'priority' => 2,
                    'default_order' => 4,
                    'is_default_selected' => $radioData->count() > 0,
                ],
                
                // Resume Medis - Unified for all types (Rawat Inap, Rawat Jalan, UGD)
                'resume_medis' => [
                    'title' => 'Resume Medis',
                    'icon' => '📋',
                    'type' => 'multiple',
                    'data' => $this->getResumeMedisData($pengajuanId),
                    'records' => $this->getResumeMedisData($pengajuanId),
                    'count' => $this->getResumeMedisData($pengajuanId)->count(),
                    'available' => $this->getResumeMedisData($pengajuanId)->count() > 0,
                    'priority' => 2,
                    'default_order' => 5,
                    'is_default_selected' => $this->getResumeMedisData($pengajuanId)->count() > 0,
                ],
                
                // CPPT - Rawat Inap - Multiple records per pengajuan
                'rawat_inap_cppt' => [
                    'title' => 'CPPT Rawat Inap',
                    'icon' => '📝',
                    'type' => 'multiple',
                    'data' => $this->safeQuery(function() use ($pengajuanId) {
                        return RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->get();
                    }, 'rawat_inap_cppt', $pengajuanId),
                    'records' => $this->safeQuery(function() use ($pengajuanId) {
                        return RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->get();
                    }, 'rawat_inap_cppt', $pengajuanId),
                    'count' => $this->safeQuery(function() use ($pengajuanId) {
                        return RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->count();
                    }, 'rawat_inap_cppt_count', $pengajuanId, 0),
                    'available' => $this->safeQuery(function() use ($pengajuanId) {
                        return RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->exists();
                    }, 'rawat_inap_cppt_exists', $pengajuanId, false),
                    'priority' => 3,
                    'default_order' => 6,
                    'is_default_selected' => false, // Not selected by default
                ],
                
                // Pengkajian Awal - Unified untuk semua jenis (Rawat Inap, Rawat Jalan, UGD) - MULTIPLE RECORDS
                'pengkajian_awal' => [
                    'title' => 'Pengkajian Awal Keperawatan',
                    'icon' => '📋',
                    'type' => 'multiple',
                    'data' => $this->getPengkajianAwalData($pengajuanId),
                    'count' => $this->getPengkajianAwalData($pengajuanId)->count(),
                    'available' => $this->getPengkajianAwalData($pengajuanId)->count() > 0,
                    'priority' => 3,
                    'default_order' => 7,
                    'is_default_selected' => false, // Not selected by default
                ],
                
                // Triage UGD - Single record per pengajuan
                'ugd_triage' => [
                    'title' => 'Triage UGD',
                    'icon' => '🔴',
                    'type' => 'single',
                    'data' => UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->first(),
                    'count' => UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->exists() ? 1 : 0,
                    'available' => UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->exists(),
                    'priority' => 4,
                    'default_order' => 8,
                    'is_default_selected' => false, // Not selected by default
                ],
                
                // Balance Cairan - Rawat Inap - Multiple records per pengajuan
                'rawat_inap_balance' => [
                    'title' => 'Balance Cairan Rawat Inap',
                    'icon' => '💧',
                    'type' => 'multiple',
                    'data' => RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->orderBy('waktu_pemeriksaan', 'asc')->get(),
                    'records' => RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->orderBy('waktu_pemeriksaan', 'asc')->get(),
                    'count' => RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuanId)->count(),
                    'available' => RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuanId)->exists(),
                    'priority' => 4,
                    'default_order' => 9,
                    'is_default_selected' => false, // Not selected by default
                ],
                
                // Tagihan - Single record per pengajuan
                'tagihan' => [
                    'title' => 'Tagihan',
                    'icon' => '💰',
                    'type' => 'single',
                    'data' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->first(),
                    'count' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->exists() ? 1 : 0,
                    'available' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->exists(),
                    'priority' => 5,
                    'default_order' => 10,
                    'is_default_selected' => false, // Not selected by default
                ],
            ]);
            
            // Load saved default order and apply it to medical records
            $savedOrder = $this->loadSavedDefaultOrder($pengajuanId);
            if ($savedOrder) {
                $medicalRecords = $this->applyCustomDefaultOrder($medicalRecords, $savedOrder);
                Log::info('Applied saved default order to medical records', [
                    'pengajuan_id' => $pengajuanId,
                    'saved_order_count' => count($savedOrder)
                ]);
            }

            Log::info('All medical records compiled', [
                'total_types' => count($medicalRecords),
                'available_count' => count(array_filter($medicalRecords, function($record) {
                    return $record['available'] ?? false;
                })),
                'has_saved_order' => !is_null($savedOrder)
            ]);

            return $medicalRecords;
        } catch (\Exception $e) {
            Log::error('Get Medical Records Error', [
                'pengajuan_id' => $pengajuanId,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'server_environment' => app()->environment(),
                'connection_test' => $this->quickConnectionTest()
            ]);
            
            // Return minimal SEP record even if other queries fail
            Log::warning('Returning fallback medical records due to error', [
                'pengajuan_id' => $pengajuanId,
                'fallback_records' => ['sep']
            ]);
            
            return [
                'sep' => [
                    'title' => 'Surat Elegibilitas Peserta (SEP)',
                    'icon' => '📋',
                    'type' => 'single',
                    'data' => (object)['status' => 'available'],
                    'count' => 1,
                    'available' => true,
                    'description' => 'Surat Elegibilitas Peserta BPJS Kesehatan',
                    'priority' => 0,
                    'error_fallback' => true,
                    'error_message' => 'Sebagian data tidak dapat dimuat karena masalah koneksi database'
                ]
            ];
        }
    }
    
    public function generatePreview(Request $request, $pengajuanId)
    {

        
        try {
            // Handle potential CSRF token issues for POST requests
            if ($request->isMethod('POST')) {
                // Check if CSRF token is valid
                $tokenValid = $request->session()->token() === $request->input('_token');
                
                if (!$tokenValid && !$request->ajax()) {
                    
                    // For POST requests without valid CSRF, redirect to GET with query params
                    if ($request->has('type')) {
                        return redirect()->route('eklaim.print-bundle.preview', [
                            'pengajuan' => $pengajuanId,
                            'type' => $request->get('type')
                        ]);
                    }
                }
            }

            $documentType = $request->get('type');
            
            // Try different ways to get selected_records data
            $selectedRecords = $request->input('selected_records', []);
            $jsonInput = $request->json('selected_records', []);
            $rawJsonBody = $request->getContent();
            $decodedJson = json_decode($rawJsonBody, true);
            

            
            // Use the correct source for selected_records
            if (!empty($decodedJson['selected_records'])) {
                $selectedRecords = $decodedJson['selected_records'];
            } elseif (!empty($jsonInput)) {
                $selectedRecords = $jsonInput;
            }
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            // If no document type specified (GET request), find first available document
            if (!$documentType) {
                $availableDocuments = $this->getAllMedicalRecords($pengajuanId, $pengajuanKlaim->status_pengiriman);
                
                foreach ($availableDocuments as $type => $doc) {
                    if ($doc['available']) {
                        $documentType = $type;
                        break;
                    }
                }
                
                if (!$documentType) {
                    return redirect()->route('eklaim.print-bundle.index', $pengajuanId)
                        ->with('error', 'Tidak ada dokumen yang tersedia untuk preview');
                }
            }
            
            // Validate document type
            if (!$this->isValidDocumentType($documentType)) {
                Log::error('Invalid document type', ['type' => $documentType]);
                return response()->json(['error' => 'Invalid document type'], 400);
            }
            
            // Get data based on document type
            $data = $this->getDocumentData($documentType, $pengajuanId, $selectedRecords);
            
            if (!$data || $data->isEmpty()) {
                // Check if document type requires record selection
                $requiresRecordSelection = ['laboratorium', 'radiologi', 'resume_medis', 'pengkajian_awal'];
                
                if (in_array($documentType, $requiresRecordSelection)) {
                    $hasSelectedRecords = !empty($selectedRecords[$documentType]);
                    
                    if (!$hasSelectedRecords) {
                        Log::warning('No records selected for document type that requires selection', [
                            'type' => $documentType, 
                            'pengajuan_id' => $pengajuanId,
                            'requires_selection' => true
                        ]);
                        
                        $documentTitles = [
                            'laboratorium' => 'Hasil Laboratorium',
                            'radiologi' => 'Hasil Radiologi',
                            'resume_medis' => 'Resume Medis',
                            'pengkajian_awal' => 'Pengkajian Awal Keperawatan'
                        ];
                        
                        return response()->json([
                            'error' => "Silakan pilih minimal satu record untuk {$documentTitles[$documentType]} terlebih dahulu.",
                            'error_type' => 'no_records_selected',
                            'document_type' => $documentType
                        ], 400);
                    }
                }
                
                Log::warning('No data found', [
                    'type' => $documentType, 
                    'pengajuan_id' => $pengajuanId,
                    'selected_records' => $selectedRecords,
                    'has_selected_records' => !empty($selectedRecords),
                    'selected_records_for_type' => $selectedRecords[$documentType] ?? 'none'
                ]);
                return response()->json(['error' => 'No data found for selected records'], 404);
            }
            
            // Special handling for berkas_klaim from INACBG API
            if ($documentType === 'berkas_klaim') {
                $berkasData = $data->first();
                
                if ($berkasData && isset($berkasData->is_api_data) && $berkasData->is_api_data && isset($berkasData->pdf_data)) {
                    Log::info('Returning base64 PDF data to frontend for berkas_klaim preview', [
                        'document_type' => $documentType,
                        'pengajuan_id' => $pengajuanId,
                        'pdf_data_length' => strlen($berkasData->pdf_data)
                    ]);
                    
                    // Return JSON with base64 data - let frontend handle the decoding
                    return response()->json([
                        'type' => 'pdf_base64',
                        'data' => $berkasData->pdf_data,
                        'filename' => 'berkas-klaim-' . $pengajuanKlaim->nomor_sep . '.pdf',
                        'nomor_sep' => $pengajuanKlaim->nomor_sep,
                        'nama_pasien' => $pengajuanKlaim->nama_pasien
                    ]);
                } else {
                    // If API data is not available, show info message
                    $html = "
                    <html>
                    <head>
                        <title>Berkas Klaim - {$pengajuanKlaim->nomor_sep}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                            .container { max-width: 600px; margin: 0 auto; }
                            .error-box { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <h2>Berkas Klaim</h2>
                            <div class='error-box'>
                                <h3>⚠️ Berkas Klaim Tidak Tersedia</h3>
                                <p><strong>No. SEP:</strong> {$pengajuanKlaim->nomor_sep}</p>
                                <p><strong>Nama Pasien:</strong> {$pengajuanKlaim->nama_pasien}</p>
                                <hr>
                                <p>Data berkas klaim tidak dapat diambil dari API INACBG.</p>
                                <p>Silakan coba lagi nanti atau hubungi administrator sistem.</p>
                            </div>
                        </div>
                    </body>
                    </html>";
                    
                    return response($html)->header('Content-Type', 'text/html');
                }
            }
            
            // Get base64 encoded logo (BPJS for SEP, regular for others)
            $logoBase64 = ($documentType === 'sep') ? $this->getBpjsLogoBase64() : $this->getLogoBase64();
            
            // Get QR codes for signatures (if available)
            $qrData = $this->generateQRCodes($pengajuanKlaim, $data, $documentType);
            
            Log::info('Preview generated successfully', [
                'document_type' => $documentType,
                'data_count' => $data->count(),
                'has_logo' => !is_null($logoBase64),
                'logo_type' => ($documentType === 'sep') ? 'bpjs' : 'regular'
            ]);

            // Skip template rendering for document types that don't have templates
            if ($documentType === 'berkas_klaim') {
                // Berkas klaim already handled above with API data
                return response()->json(['error' => 'Berkas klaim data not available from API'], 404);
            }

            $dataKunjungan = KunjunganBPJS::where('noSEP', $pengajuanKlaim->nomor_sep)->first();
            
            //Get Nama Dokter
            $namaDokter = DokterBPJS::where('KODE', $dataKunjungan->dpjpSKDP)->first();

            // Return HTML preview using same Blade template as PDF
            return view("pdf.templates.{$documentType}", array_merge([
                'pengajuanKlaim' => $pengajuanKlaim,
                'dataKunjungan' => $dataKunjungan,
                'namaDokter' => $namaDokter ?? '',
                'data' => $data,
                'selectedRecords' => $selectedRecords,
                'logoBase64' => $logoBase64,
                'documentType' => $documentType,
            ], $qrData));
            
        } catch (\Exception $e) {
            Log::error('Generate Preview Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'document_type' => $request->get('type'),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->with('error', 'Error generate pdf');
        }
    }
    
    public function generatePDF(Request $request, $pengajuanId)
    {
        try {
            // Set memory and execution limits from config
            $memoryLimit = config('print-bundle.memory_limit', '512M');
            $executionTime = config('print-bundle.single_pdf_execution_time', 120);
            
            ini_set('memory_limit', $memoryLimit);
            set_time_limit($executionTime);
            
            // Handle potential CSRF token issues for POST requests
            if ($request->isMethod('POST')) {
                // Check if CSRF token is valid
                $tokenValid = $request->session()->token() === $request->input('_token');
                
                if (!$tokenValid && !$request->ajax()) {

                    
                    // Return error response for AJAX calls
                    if ($request->expectsJson()) {
                        return response()->json([
                            'error' => 'CSRF token mismatch. Please refresh the page and try again.',
                            'csrf_error' => true,
                            'new_token' => csrf_token()
                        ], 419);
                    }
                    
                    // For regular POST requests, redirect to GET with query params
                    if ($request->has('type')) {
                        return redirect()->route('eklaim.print-bundle.pdf', [
                            'pengajuan' => $pengajuanId,
                            'type' => $request->get('type')
                        ]);
                    }
                }
            }

            $documentType = $request->get('type');
            
            // Try different ways to get selected_records data
            $selectedRecords = $request->input('selected_records', []);
            $jsonInput = $request->json('selected_records', []);
            $rawJsonBody = $request->getContent();
            $decodedJson = json_decode($rawJsonBody, true);
            

            
            // Use the correct source for selected_records
            if (!empty($decodedJson['selected_records'])) {
                $selectedRecords = $decodedJson['selected_records'];
            } elseif (!empty($jsonInput)) {
                $selectedRecords = $jsonInput;
            }
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            // Validate document type
            if (!$this->isValidDocumentType($documentType)) {
                Log::error('Invalid document type for PDF', ['type' => $documentType]);
                return response()->json(['error' => 'Invalid document type'], 400);
            }
            
            // Get data based on document type
            $data = $this->getDocumentData($documentType, $pengajuanId, $selectedRecords);
            
            if (!$data || $data->isEmpty()) {
                Log::warning('No data found for PDF', [
                    'type' => $documentType, 
                    'pengajuan_id' => $pengajuanId,
                    'selected_records' => $selectedRecords
                ]);
                return response()->json(['error' => 'No data found for selected records'], 404);
            }
            
            // Special handling for berkas_klaim from INACBG API
            if ($documentType === 'berkas_klaim') {
                $berkasData = $data->first();
                
                if ($berkasData && isset($berkasData->is_api_data) && $berkasData->is_api_data && isset($berkasData->pdf_data)) {
                    Log::info('Returning base64 PDF data to frontend for berkas_klaim', [
                        'document_type' => $documentType,
                        'pengajuan_id' => $pengajuanId,
                        'pdf_data_length' => strlen($berkasData->pdf_data)
                    ]);
                    
                    // Return JSON with base64 data for berkas_klaim
                    return response()->json([
                        'type' => 'pdf_base64',
                        'data' => $berkasData->pdf_data,
                        'filename' => 'berkas-klaim-' . $pengajuanKlaim->nomor_sep . '.pdf',
                        'document_type' => $documentType,
                        'nomor_sep' => $pengajuanKlaim->nomor_sep,
                        'nama_pasien' => $pengajuanKlaim->nama_pasien
                    ]);
                }
            }
            
            // Skip template-based PDF generation for API-based documents
            if ($documentType === 'berkas_klaim') {
                // Berkas klaim already handled above with API data
                return response()->json(['error' => 'Berkas klaim data not available from API'], 404);
            }

            // Get base64 encoded logo (BPJS for SEP, regular for others)
            $logoBase64 = ($documentType === 'sep') ? $this->getBpjsLogoBase64() : $this->getLogoBase64();
            
            // Get QR codes for signatures
            $qrData = $this->generateQRCodes($pengajuanKlaim, $data, $documentType);

            //Get Nama Dokter
            $getKunjunganBPJS = KunjunganBPJS::where('noSEP', $pengajuanKlaim->nomor_sep)->first();
            $namaDokter = DokterBPJS::where('KODE', $getKunjunganBPJS->dpjpSKDP)->first();
            
            Log::info('PDF generation started', [
                'document_type' => $documentType,
                'data_count' => $data->count(),
                'logo_type' => ($documentType === 'sep') ? 'bpjs' : 'regular'
            ]);
            
            // Generate PDF using DomPDF with same Blade template
            $pdf = Pdf::loadView("pdf.templates.{$documentType}", array_merge([
                'pengajuanKlaim' => $pengajuanKlaim,
                'data' => $data,
                'selectedRecords' => $selectedRecords,
                'logoBase64' => $logoBase64,
                'documentType' => $documentType,
                'namaDokter' => $namaDokter ?? '',                            
            ], $qrData))->setPaper('a4', 'portrait');
            
            Log::info('PDF generated successfully', ['document_type' => $documentType]);
            
            // NEW: Return all PDFs as base64 JSON for frontend merging
            $pdfContent = $pdf->output();
            
            // Log memory usage before base64 encoding
            Log::info('PDF Memory Usage Before Base64', [
                'pdf_size' => strlen($pdfContent),
                'memory_usage' => memory_get_usage(true),
                'memory_peak' => memory_get_peak_usage(true)
            ]);
            
            $base64Pdf = base64_encode($pdfContent);
            
            // Clear PDF content from memory immediately after encoding
            unset($pdfContent);
            gc_collect_cycles();
            
            // Return JSON with base64 data - let frontend handle everything
            return response()->json([
                'type' => 'pdf_base64',
                'data' => $base64Pdf,
                'filename' => $documentType . '-' . $pengajuanKlaim->nomor_sep . '.pdf',
                'document_type' => $documentType,
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'nama_pasien' => $pengajuanKlaim->nama_pasien
            ]);
            
        } catch (\Exception $e) {
            Log::error('Generate PDF Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'document_type' => $request->get('type'),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Terjadi kesalahan saat generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function generateBundle(Request $request, $pengajuanId)
    {
        try {
            // Set memory and execution limits from config - NORMAL SETTINGS
            $memoryLimit = config('print-bundle.memory_limit', '2048M');
            $executionTime = config('print-bundle.execution_time', 300); // Normal 5 minutes
            
            // Set normal timeout configurations
            ini_set('memory_limit', $memoryLimit);
            ini_set('max_execution_time', $executionTime);
            set_time_limit($executionTime);
            
            // Enable garbage collection
            gc_enable();
            
            // Force ignore user abort to prevent timeout issues
            ignore_user_abort(true);
            
            // Log initial memory usage and timeout settings
            Log::info('Bundle Generation Started - Enhanced Timeout Settings', [
                'pengajuan_id' => $pengajuanId,
                'memory_usage' => memory_get_usage(true) / 1024 / 1024 . 'MB',
                'memory_limit' => $memoryLimit,
                'execution_time' => $executionTime,
                'max_execution_time' => ini_get('max_execution_time'),
                'max_input_time' => ini_get('max_input_time'),
                'default_socket_timeout' => ini_get('default_socket_timeout'),
                'request_data' => [
                    'documents' => count($request->input('document_types', [])),
                    'has_selected_records' => !empty($request->input('selected_records', []))
                ],
                'production_mode' => config('print-bundle.production_mode', false),
                'start_time' => now()->toDateTimeString()
            ]);
            
            // Handle CSRF token validation for bundle generation
            $tokenValid = $request->session()->token() === $request->input('_token');
            
            if (!$tokenValid && !$request->ajax()) {
                
                // Return proper error response for AJAX calls
                return response()->json([
                    'error' => 'CSRF token mismatch. Please refresh the page and try again.',
                    'csrf_error' => true,
                    'new_token' => csrf_token(),
                    'redirect_url' => route('eklaim.print-bundle.index', $pengajuanId)
                ], 419);
            }

            Log::info('Generate Bundle Request - Frontend PDF Merging Approach', [
                'pengajuan_id' => $pengajuanId,
                'document_types' => $request->input('document_types', []),
                'selected_records' => $request->input('selected_records', []),
                'csrf_token_valid' => $request->hasValidSignature() ? 'valid' : 'invalid'
            ]);

            $documentTypes = $request->input('document_types', []);
            $selectedRecords = $request->input('selected_records', []);
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            if (empty($documentTypes)) {
                return response()->json(['error' => 'No document types selected'], 400);
            }
            
            // Process all selected documents - no artificial limits
            Log::info('Processing all selected documents', [
                'requested_count' => count($documentTypes),
                'document_types' => $documentTypes,
                'execution_time_limit' => $executionTime . 's'
            ]);
            
            // Validate all document types
            foreach ($documentTypes as $type) {
                if (!$this->isValidDocumentType($type)) {
                    return response()->json(['error' => "Invalid document type: {$type}"], 400);
                }
            }
            
            // NEW APPROACH: Generate all PDFs as base64 and send to frontend for merging
            $pdfDocuments = [];
            
            // Process documents in chunks to prevent memory overflow
            $chunkSize = config('print-bundle.chunk_size', 3);
            $documentChunks = array_chunk($documentTypes, $chunkSize);
            
            $startTime = time();
            $totalDocuments = count($documentTypes);
            $processedCount = 0;
            
            // Use normal chunk size for processing
            $chunkSize = config('print-bundle.chunk_size', 3);
            $documentChunks = array_chunk($documentTypes, $chunkSize);
            
            Log::info('Starting normal document processing', [
                'total_documents' => $totalDocuments,
                'chunk_size' => $chunkSize,
                'total_chunks' => count($documentChunks),
                'execution_time_limit' => $executionTime . 's'
            ]);
            
            foreach ($documentChunks as $chunkIndex => $chunk) {
                // Check elapsed time for progress tracking
                $elapsedTime = time() - $startTime;
                
                Log::info('Processing Document Chunk', [
                    'chunk_index' => $chunkIndex + 1,
                    'total_chunks' => count($documentChunks),
                    'chunk_size' => count($chunk),
                    'documents_in_chunk' => $chunk,
                    'memory_before_chunk' => memory_get_usage(true) / 1024 / 1024 . 'MB',
                    'elapsed_time' => $elapsedTime . 's',
                    'estimated_completion' => round((($chunkIndex + 1) / count($documentChunks)) * 100, 1) . '%'
                ]);
                
                foreach ($chunk as $type) {
                try {
                    // Track progress for each document
                    $currentElapsed = time() - $startTime;
                    $progressPercent = round(($processedCount / $totalDocuments) * 100, 1);
                    $data = $this->getDocumentData($type, $pengajuanId, $selectedRecords);
                    
                    if (!$data || $data->isEmpty()) {
                        Log::warning("No data found for bundle document type: {$type}", [
                            'pengajuan_id' => $pengajuanId,
                            'document_type' => $type,
                            'selected_records' => $selectedRecords[$type] ?? 'none'
                        ]);
                        continue; // Skip if no data
                    }
                    
                    // Special handling for berkas_klaim from INACBG API - WITH TIMEOUT
                    if ($type === 'berkas_klaim') {
                        $berkasStartTime = time();
                        $berkasData = $data->first();
                        
                        if ($berkasData && isset($berkasData->is_api_data) && $berkasData->is_api_data && isset($berkasData->pdf_data)) {
                            $berkasProcessTime = time() - $berkasStartTime;
                            Log::info('Adding berkas_klaim PDF data to bundle array', [
                                'document_type' => $type,
                                'pengajuan_id' => $pengajuanId,
                                'pdf_data_length' => strlen($berkasData->pdf_data),
                                'process_time' => $berkasProcessTime . 's'
                            ]);
                            
                            // Add berkas_klaim base64 PDF data to documents array
                            $pdfDocuments[] = [
                                'type' => $type,
                                'title' => 'Berkas Klaim',
                                'filename' => 'berkas-klaim-' . $pengajuanKlaim->nomor_sep . '.pdf',
                                'data' => $berkasData->pdf_data, // Already base64
                                'source' => 'inacbg_api'
                            ];
                            
                            $processedCount++;
                            $progressPercent = round(($processedCount / $totalDocuments) * 100, 1);
                            Log::info('Document processed successfully (API)', [
                                'document_type' => $type,
                                'progress' => $progressPercent . '%',
                                'processed_count' => $processedCount,
                                'total_documents' => $totalDocuments,
                                'elapsed_time' => (time() - $startTime) . 's'
                            ]);
                            continue;
                        }
                    }
                    
                    // Skip template-based documents for API-only document types
                    if ($type === 'berkas_klaim') {
                        Log::warning("Berkas klaim skipped in bundle - should be handled by API", [
                            'document_type' => $type,
                            'pengajuan_id' => $pengajuanId
                        ]);
                        continue;
                    }
                    
                    // For regular documents, generate PDF and convert to base64
                    // Get base64 encoded logo (BPJS for SEP, regular for others)
                    $logoBase64 = ($type === 'sep') ? $this->getBpjsLogoBase64() : $this->getLogoBase64();
                    
                    // Generate QR codes for this document type
                    $qrData = $this->generateQRCodes($pengajuanKlaim, $data, $type);
                    
                    Log::info('Generating PDF for bundle document', [
                        'document_type' => $type,
                        'data_count' => $data->count(),
                        'logo_type' => ($type === 'sep') ? 'bpjs' : 'regular'
                    ]);
                    
                    // Generate PDF using DomPDF with same Blade template
                    $pdf = Pdf::loadView("pdf.templates.{$type}", array_merge([
                        'pengajuanKlaim' => $pengajuanKlaim,
                        'data' => $data,
                        'selectedRecords' => $selectedRecords,
                        'logoBase64' => $logoBase64,
                        'documentType' => $type,
                    ], $qrData))->setPaper('a4', 'portrait');
                    
                    $pdfContent = $pdf->output();
                    $base64Pdf = base64_encode($pdfContent);
                    
                    // Add to documents array
                    $pdfDocuments[] = [
                        'type' => $type,
                        'title' => $this->getDocumentTitle($type),
                        'filename' => $type . '-' . $pengajuanKlaim->nomor_sep . '.pdf',
                        'data' => $base64Pdf,
                        'source' => 'template_generated'
                    ];
                    
                    $processedCount++;
                    $progressPercent = round(($processedCount / $totalDocuments) * 100, 1);
                    Log::info('Document processed successfully (Template)', [
                        'document_type' => $type,
                        'progress' => $progressPercent . '%',
                        'processed_count' => $processedCount,
                        'total_documents' => $totalDocuments,
                        'elapsed_time' => (time() - $startTime) . 's',
                        'pdf_size' => round(strlen($base64Pdf) / 1024, 2) . 'KB'
                    ]);
                    
                    Log::info('Successfully generated PDF for bundle document', [
                        'document_type' => $type,
                        'pdf_size' => strlen($pdfContent),
                        'base64_size' => strlen($base64Pdf)
                    ]);
                    
                } catch (\Exception $e) {
                    Log::error("Bundle PDF Generation Error for type {$type}: " . $e->getMessage(), [
                        'pengajuan_id' => $pengajuanId,
                        'document_type' => $type,
                        'trace' => $e->getTraceAsString()
                    ]);
                    continue; // Skip this document and continue with others
                }
                }
                
                // Force garbage collection after each chunk if enabled
                if (config('print-bundle.enable_garbage_collection', true)) {
                    gc_collect_cycles();
                }
                
                Log::info('Chunk Processed', [
                    'chunk_index' => $chunkIndex,
                    'memory_after_chunk' => memory_get_usage(true),
                    'memory_peak' => memory_get_peak_usage(true),
                    'documents_in_chunk' => count($chunk),
                    'gc_enabled' => config('print-bundle.enable_garbage_collection', true)
                ]);
            }
            
            if (empty($pdfDocuments)) {
                return response()->json(['error' => 'No valid documents found for bundle generation'], 400);
            }
            
            $totalElapsedTime = time() - $startTime;
            $finalProgress = round(($processedCount / $totalDocuments) * 100, 1);
            $memoryUsed = memory_get_usage(true) / 1024 / 1024;
            
            Log::info('Bundle PDF generation completed successfully', [
                'pengajuan_id' => $pengajuanId,
                'total_documents_requested' => $totalDocuments,
                'documents_successfully_processed' => count($pdfDocuments),
                'final_progress' => $finalProgress . '%',
                'total_elapsed_time' => $totalElapsedTime . 's',
                'memory_used' => round($memoryUsed, 2) . 'MB',
                'documents' => array_column($pdfDocuments, 'type'),
                'performance_metrics' => [
                    'avg_time_per_document' => round($totalElapsedTime / max(1, count($pdfDocuments)), 2) . 's',
                    'execution_time_limit' => $executionTime . 's',
                    'total_elapsed_time' => $totalElapsedTime . 's'
                ]
            ]);
            
            // Return JSON with all PDF documents as base64 for frontend merging
            $responseData = [
                'type' => 'bundle_base64',
                'documents' => $pdfDocuments,
                'bundle_filename' => $pengajuanKlaim->nomor_sep .'.pdf',
                'patient_info' => [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'nama_pasien' => $pengajuanKlaim->nama_pasien,
                    'pengajuan_id' => $pengajuanId
                ],
                'processing_stats' => [
                    'total_requested' => $totalDocuments,
                    'successfully_processed' => count($pdfDocuments),
                    'completion_rate' => $finalProgress . '%',
                    'elapsed_time' => $totalElapsedTime . 's',
                    'timeout_optimized' => $processedCount < $totalDocuments
                ]
            ];
            
            // Add success message
            if ($processedCount === $totalDocuments) {
                $responseData['success_message'] = "Semua {$totalDocuments} dokumen berhasil diproses dalam {$totalElapsedTime} detik.";
            } else {
                $skippedCount = $totalDocuments - $processedCount;
                $responseData['warning'] = "Berhasil memproses {$processedCount} dari {$totalDocuments} dokumen yang dipilih.";
                $responseData['skipped_documents'] = $skippedCount;
            }
            
            return response()->json($responseData);
            
        } catch (\Exception $e) {
            // Clean up memory
            gc_collect_cycles();
            
            Log::error('Generate Bundle Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'selected_types' => $request->input('document_types', []),
                'memory_usage' => memory_get_usage(true) / 1024 / 1024 . 'MB',
                'memory_peak' => memory_get_peak_usage(true) / 1024 / 1024 . 'MB',
                'error_type' => get_class($e),
                'error_code' => $e->getCode(),
                'error_line' => $e->getLine(),
                'error_file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return detailed error for debugging
            $errorMessage = 'Bundle generation failed';
            if (config('app.debug')) {
                $errorMessage .= ': ' . $e->getMessage() . ' (Line: ' . $e->getLine() . ')';
            }
            
            return response()->json([
                'error' => $errorMessage,
                'debug_info' => config('app.debug') ? [
                    'memory_usage' => memory_get_usage(true) / 1024 / 1024 . 'MB',
                    'memory_peak' => memory_get_peak_usage(true) / 1024 / 1024 . 'MB',
                    'error_type' => get_class($e),
                    'error_line' => $e->getLine(),
                    'pengajuan_id' => $pengajuanId
                ] : null
            ], 500);
        }
    }
    
    private function isValidDocumentType($type)
    {
        $validTypes = [
            'laboratorium', 'radiologi', 'resume_medis', 'pengkajian_awal',
            'rawat_inap_resume', 'rawat_jalan_resume', 'ugd_resume',
            'rawat_inap_cppt', 'rawat_inap_pengkajian', 'rawat_jalan_pengkajian',
            'ugd_pengkajian', 'ugd_triage', 'rawat_inap_balance', 'tagihan',
            'berkas_klaim', 'sep'
        ];
        
        return in_array($type, $validTypes);
    }
    
    private function generateQRCodes($pengajuanKlaim, $data, $documentType)
    {
        $defaultDokter = $pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD';
        $qrData = [
            'dokterQR' => QRCodeHelper::generateDataURL($defaultDokter),
            'keluargaQR' => QRCodeHelper::generateDataURL('Keluarga Pasien'),
            'perawatQR' => null,
            'dokterTriageQR' => null,
        ];
        
        // Get dokter/petugas from the actual data if available
        if ($data && $data->count() > 0) {
            $firstItem = $data->first();
            
            // Use dokter from data if available, otherwise use default
            if (!empty($firstItem->dokter)) {
                $qrData['dokterQR'] = QRCodeHelper::generateDataURL($firstItem->dokter);
            }
            
            // Generate perawat QR if petugas data is available
            if (!empty($firstItem->petugas)) {
                $qrData['perawatQR'] = QRCodeHelper::generateDataURL($firstItem->petugas);
            }
        }
        
        // Special handling for UGD triage
        if ($documentType === 'ugd_triage' && $data && $data->count() > 0) {
            $triageData = $data->first();
            if ($triageData && $triageData->petugas) {
                $qrData['dokterTriageQR'] = QRCodeHelper::generateDataURL($triageData->petugas);
            }
            if ($triageData && $triageData->dokter) {
                $qrData['dokterQR'] = QRCodeHelper::generateDataURL($triageData->dokter);
            }
        }
        
        return $qrData;
    }
    
    private function getDocumentData($type, $pengajuanId, $selectedRecords = [])
    {
        // Log query start for performance monitoring
        $queryStart = microtime(true);
        
        // Jika ada selected records, filter berdasarkan ID yang dipilih
        if (!empty($selectedRecords) && isset($selectedRecords[$type])) {
            $selectedIds = $selectedRecords[$type];
            
            // First check if data exists without filtering
            $allData = match($type) {
                'laboratorium' => HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->get(),
                'radiologi' => HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->get(),
                'resume_medis' => $this->getResumeMedisData($pengajuanId),
                'pengkajian_awal' => $this->getPengkajianAwalData($pengajuanId),
                'rawat_inap_resume' => collect([RawatInapResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'rawat_jalan_resume' => collect([RawatJalanResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'ugd_resume' => collect([UGDResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'rawat_inap_cppt' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->get(),
                'rawat_inap_pengkajian' => collect([RawatInapPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'rawat_jalan_pengkajian' => collect([RawatJalanPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'ugd_pengkajian' => collect([UGDPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'ugd_triage' => collect([UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'rawat_inap_balance' => RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->orderBy('waktu_pemeriksaan', 'asc')->get(),
                'tagihan' => collect([Tagihan::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
                'berkas_klaim' => $this->getBerkasKlaimData($pengajuanId),
                'sep' => $this->getSepData($pengajuanId),
                default => collect([]),
            };
            
            Log::info('Filtering data by selected records', [
                'type' => $type,
                'selected_ids' => $selectedIds,
                'pengajuan_id' => $pengajuanId,
                'all_data_count' => $allData->count(),
                'all_data_ids' => $allData->pluck('id')->toArray(),
                'all_data_available' => !$allData->isEmpty()
            ]);
            
            return match($type) {
                'laboratorium' => HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->get(),
                'radiologi' => HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->get(),
                'resume_medis' => $this->getResumeMedisDataFiltered($pengajuanId, $selectedIds),
                'pengkajian_awal' => $this->getPengkajianAwalDataFiltered($pengajuanId, $selectedIds),
                'rawat_inap_resume' => collect([RawatInapResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'rawat_jalan_resume' => collect([RawatJalanResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'ugd_resume' => collect([UGDResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'rawat_inap_cppt' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->orderBy('tanggal', 'asc')->get(),
                'rawat_inap_pengkajian' => collect([RawatInapPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'rawat_jalan_pengkajian' => collect([RawatJalanPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'ugd_pengkajian' => collect([UGDPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'ugd_triage' => collect([UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'rawat_inap_balance' => RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->orderBy('tanggal', 'asc')->orderBy('waktu_pemeriksaan', 'asc')->get(),
                'tagihan' => collect([Tagihan::where('pengajuan_klaim_id', $pengajuanId)->whereIn('id', $selectedIds)->first()])->filter(),
                'berkas_klaim' => $this->getBerkasKlaimData($pengajuanId),
                'sep' => $this->getSepData($pengajuanId),
                default => collect([]),
            };
        }
        
        // Fallback: ambil semua data jika tidak ada selected records
        $result = match($type) {
            'laboratorium' => HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->get(),
            'radiologi' => HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->get(),
            'resume_medis' => $this->getResumeMedisData($pengajuanId),
            'pengkajian_awal' => $this->getPengkajianAwalData($pengajuanId),
            'rawat_inap_resume' => collect([RawatInapResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'rawat_jalan_resume' => collect([RawatJalanResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'ugd_resume' => collect([UGDResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'rawat_inap_cppt' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->get(),
            'rawat_inap_pengkajian' => collect([RawatInapPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'rawat_jalan_pengkajian' => collect([RawatJalanPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'ugd_pengkajian' => collect([UGDPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'ugd_triage' => collect([UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'rawat_inap_balance' => RawatInapBalanceCairan::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->orderBy('waktu_pemeriksaan', 'asc')->get(),
            'tagihan' => collect([Tagihan::where('pengajuan_klaim_id', $pengajuanId)->first()])->filter(),
            'berkas_klaim' => $this->getBerkasKlaimData($pengajuanId),
            'sep' => $this->getSepData($pengajuanId),
            default => collect([]),
        };
        
        // Log query performance
        $queryTime = microtime(true) - $queryStart;
        Log::info('Document Data Query Performance', [
            'type' => $type,
            'pengajuan_id' => $pengajuanId,
            'query_time' => round($queryTime * 1000, 2) . 'ms',
            'result_count' => $result ? $result->count() : 0,
            'memory_usage' => memory_get_usage(true)
        ]);
        
        return $result;
    }
    
    private function getResumeMedisData($pengajuanId, $selectedIds = [])
    {
        $resumeData = collect();
        
        try {
            // Check for Rawat Inap Resume Medis
            $query = RawatInapResumeMedis::where('pengajuan_klaim_id', $pengajuanId);
            if (!empty($selectedIds)) {
                $query->whereIn('id', $selectedIds);
            }
            $rawatInapResume = $query->first();
            if ($rawatInapResume) {
                $rawatInapResume->resume_type = 'rawat_inap';
                $rawatInapResume->resume_title = 'Resume Medis Rawat Inap';
                $resumeData->push($rawatInapResume);
            }
        } catch (\Exception $e) {
            Log::error('Error getting Rawat Inap Resume Medis', [
                'pengajuan_id' => $pengajuanId,
                'selected_ids' => $selectedIds,
                'error' => $e->getMessage()
            ]);
        }
        
        try {
            // Check for Rawat Jalan Resume Medis
            $query = RawatJalanResumeMedis::where('pengajuan_klaim_id', $pengajuanId);
            if (!empty($selectedIds)) {
                $query->whereIn('id', $selectedIds);
            }
            $rawatJalanResume = $query->first();
            if ($rawatJalanResume) {
                $rawatJalanResume->resume_type = 'rawat_jalan';
                $rawatJalanResume->resume_title = 'Resume Medis Rawat Jalan';
                $resumeData->push($rawatJalanResume);
            }
        } catch (\Exception $e) {
            Log::error('Error getting Rawat Jalan Resume Medis', [
                'pengajuan_id' => $pengajuanId,
                'selected_ids' => $selectedIds,
                'error' => $e->getMessage()
            ]);
        }
        
        try {
            // Check for UGD Resume Medis
            $query = UGDResumeMedis::where('pengajuan_klaim_id', $pengajuanId);
            if (!empty($selectedIds)) {
                $query->whereIn('id', $selectedIds);
            }
            $ugdResume = $query->first();
            if ($ugdResume) {
                $ugdResume->resume_type = 'ugd';
                $ugdResume->resume_title = 'Resume Medis UGD';
                $resumeData->push($ugdResume);
            }
        } catch (\Exception $e) {
            Log::error('Error getting UGD Resume Medis', [
                'pengajuan_id' => $pengajuanId,
                'selected_ids' => $selectedIds,
                'error' => $e->getMessage()
            ]);
        }
        
        return $resumeData;
    }
    
    private function getPengkajianAwalData($pengajuanId, $selectedIds = [])
    {
        $pengkajianData = collect();
        
        try {
            // Check for Rawat Inap Pengkajian Awal
            $query = RawatInapPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId);
            if (!empty($selectedIds)) {
                $query->whereIn('id', $selectedIds);
            }
            $rawatInapPengkajian = $query->first();
            if ($rawatInapPengkajian) {
                $rawatInapPengkajian->pengkajian_type = 'rawat_inap';
                $rawatInapPengkajian->pengkajian_title = 'Pengkajian Awal Rawat Inap';
                $pengkajianData->push($rawatInapPengkajian);
            }
        } catch (\Exception $e) {
            Log::error('Error getting Rawat Inap Pengkajian Awal', [
                'pengajuan_id' => $pengajuanId,
                'selected_ids' => $selectedIds,
                'error' => $e->getMessage()
            ]);
        }
        
        try {
            // Check for Rawat Jalan Pengkajian Awal
            $query = RawatJalanPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId);
            if (!empty($selectedIds)) {
                $query->whereIn('id', $selectedIds);
            }
            $rawatJalanPengkajian = $query->first();
            if ($rawatJalanPengkajian) {
                $rawatJalanPengkajian->pengkajian_type = 'rawat_jalan';
                $rawatJalanPengkajian->pengkajian_title = 'Pengkajian Awal Rawat Jalan';
                $pengkajianData->push($rawatJalanPengkajian);
            }
        } catch (\Exception $e) {
            Log::error('Error getting Rawat Jalan Pengkajian Awal', [
                'pengajuan_id' => $pengajuanId,
                'selected_ids' => $selectedIds,
                'error' => $e->getMessage()
            ]);
        }
        
        try {
            // Check for UGD Pengkajian Awal
            $query = UGDPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId);
            if (!empty($selectedIds)) {
                $query->whereIn('id', $selectedIds);
            }
            $ugdPengkajian = $query->first();
            if ($ugdPengkajian) {
                $ugdPengkajian->pengkajian_type = 'ugd';
                $ugdPengkajian->pengkajian_title = 'Pengkajian Awal UGD';
                $pengkajianData->push($ugdPengkajian);
            }
        } catch (\Exception $e) {
            Log::error('Error getting UGD Pengkajian Awal', [
                'pengajuan_id' => $pengajuanId,
                'selected_ids' => $selectedIds,
                'error' => $e->getMessage()
            ]);
        }
        
        return $pengkajianData;
    }
    
    private function getResumeMedisDataFiltered($pengajuanId, $selectedIds = [])
    {
        // Get all available resume medis data first
        $allData = $this->getResumeMedisData($pengajuanId);
        
        Log::info('Resume Medis Data Filtering', [
            'pengajuan_id' => $pengajuanId,
            'selected_ids' => $selectedIds,
            'all_data_count' => $allData->count(),
            'all_data_ids' => $allData->pluck('id')->toArray(),
            'all_data_types' => $allData->pluck('resume_type')->toArray()
        ]);
        
        if (empty($selectedIds)) {
            return $allData;
        }
        
        // Filter by selected IDs
        $filteredData = $allData->filter(function ($item) use ($selectedIds) {
            return in_array($item->id, $selectedIds);
        });
        
        Log::info('Resume Medis Data After Filtering', [
            'filtered_count' => $filteredData->count(),
            'filtered_ids' => $filteredData->pluck('id')->toArray()
        ]);
        
        return $filteredData;
    }
    
    private function getPengkajianAwalDataFiltered($pengajuanId, $selectedIds = [])
    {
        $pengkajianData = collect();
        
        // Get all available pengkajian awal data first
        $allData = $this->getPengkajianAwalData($pengajuanId);
        
        if (empty($selectedIds)) {
            return $allData;
        }
        
        // Filter by selected IDs
        return $allData->filter(function ($item) use ($selectedIds) {
            return in_array($item->id, $selectedIds);
        });
    }
    
    private function getSuratEligibilitasData($pengajuanId)
    {
        // Get pengajuan klaim data for eligibility letter
        $pengajuanKlaim = PengajuanKlaim::find($pengajuanId);
        
        if (!$pengajuanKlaim) {
            return collect([]);
        }
        
        // Create a collection with eligibility data
        $eligibilityData = (object)[
            'pengajuan_klaim_id' => $pengajuanId,
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'nomor_kartu' => $pengajuanKlaim->nomor_kartu,
            'nama_pasien' => $pengajuanKlaim->nama_pasien,
            'tanggal_sep' => $pengajuanKlaim->tanggal_sep,
            'poli_tujuan' => $pengajuanKlaim->poli_tujuan,
            'jenis_kunjungan' => $pengajuanKlaim->jenis_kunjungan,
            'faskes' => $pengajuanKlaim->faskes ?? 'RSU Bhakti Rahayu',
            'status' => 'eligible',
            'generated_at' => now(),
        ];
        
        return collect([$eligibilityData]);
    }
    
    private function getSepData($pengajuanId)
    {
        // Get pengajuan klaim data for SEP
        $pengajuanKlaim = PengajuanKlaim::find($pengajuanId);
        
        if (!$pengajuanKlaim) {
            return collect([]);
        }
        
        // Create a collection with SEP data based on pengajuan klaim
        $sepData = (object)[
            'pengajuan_klaim_id' => $pengajuanId,
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'tanggal_sep' => $pengajuanKlaim->tanggal_sep,
            'nomor_kartu' => $pengajuanKlaim->nomor_kartu,
            'nama_pasien' => $pengajuanKlaim->nama_pasien,
            'tanggal_lahir' => $pengajuanKlaim->tanggal_lahir,
            'jenis_kelamin' => $pengajuanKlaim->jenis_kelamin,
            'no_telepon' => $pengajuanKlaim->no_telepon,
            'sub_spesialis' => $pengajuanKlaim->sub_spesialis,
            'nama_dpjp' => $pengajuanKlaim->nama_dpjp,
            'faskes_perujuk' => $pengajuanKlaim->faskes_perujuk,
            'diagnosa_awal' => $pengajuanKlaim->diagnosa_awal,
            'catatan' => $pengajuanKlaim->catatan,
            'jenis_peserta' => $pengajuanKlaim->jenis_peserta,
            'jenis_rawat' => $pengajuanKlaim->jenis_rawat,
            'jenis_kunjungan' => $pengajuanKlaim->jenis_kunjungan,
            'kelas_hak' => $pengajuanKlaim->kelas_hak,
            'poli_tujuan' => $pengajuanKlaim->poli_tujuan,
            'faskes' => 'Klinik Rawat Inap Utama Muhammadiyah Kedungadem',
            'status' => 'active',
            'generated_at' => now(),
        ];
        
        return collect([$sepData]);
    }
    
    private function getBerkasKlaimData($pengajuanId)
    {
        try {
            // Set normal timeout for API call
            $apiTimeout = config('print-bundle.inacbg_timeout', 60); // Normal API timeout
            
            // Get pengajuan klaim data
            $pengajuanKlaim = PengajuanKlaim::find($pengajuanId);
            
            if (!$pengajuanKlaim) {
                return collect([]);
            }
            
            // Prepare data for INACBG API call
            $requestData = [
                "metadata" => [
                    "method" => "claim_print"
                ],
                "data" => [
                    "nomor_sep" => $pengajuanKlaim->nomor_sep
                ]
            ];
            
            Log::info('INACBG API Request for Berkas Klaim', [
                'pengajuan_id' => $pengajuanId,
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'request_data' => $requestData
            ]);
            
            // Hit INACBG API with timeout handling
            $apiStart = microtime(true);
            $response = null;
            
            try {
                // Use shorter timeout specifically for API call
                $response = InacbgHelper::hitApi($requestData, $apiTimeout);
            } catch (\Exception $apiException) {
                $apiTime = microtime(true) - $apiStart;
                Log::error('INACBG API Timeout/Error - FALLBACK TO LOCAL DATA', [
                    'pengajuan_id' => $pengajuanId,
                    'api_time' => round($apiTime, 2) . 's',
                    'timeout_limit' => $apiTimeout . 's',
                    'error' => $apiException->getMessage(),
                    'fallback_strategy' => 'using_local_data'
                ]);
                
                // Return fallback data immediately if API times out
                return $this->getBerkasKlaimFallbackData($pengajuanId, $pengajuanKlaim);
            }
            
            $apiTime = microtime(true) - $apiStart;
            Log::info('INACBG API Call Completed', [
                'pengajuan_id' => $pengajuanId,
                'api_time' => round($apiTime, 2) . 's'
            ]);
            
            Log::info('INACBG API Response for Berkas Klaim', [
                'pengajuan_id' => $pengajuanId,
                'response_structure' => [
                    'has_metadata' => isset($response['metadata']),
                    'metadata_code' => $response['metadata']['code'] ?? 'not_set',
                    'has_data' => isset($response['data']),
                    'data_type' => isset($response['data']) ? gettype($response['data']) : 'not_set',
                    'data_length' => isset($response['data']) && is_string($response['data']) ? strlen($response['data']) : 0
                ]
            ]);
            
            // Check if API response is successful
            if (!$response || !isset($response['metadata']) || $response['metadata']['code'] !== 200) {
                Log::error('INACBG API Error for Berkas Klaim', [
                    'pengajuan_id' => $pengajuanId,
                    'response' => $response
                ]);
                
                // Return fallback data if API fails
                return $this->getBerkasKlaimFallbackData($pengajuanId, $pengajuanKlaim);
            }
            
            // Process successful API response
            $claimData = $response['data'] ?? null;
            
            // Log detailed response untuk debugging
            Log::info('INACBG API Response Details', [
                'pengajuan_id' => $pengajuanId,
                'has_data' => !empty($claimData),
                'data_type' => gettype($claimData),
                'data_length' => is_string($claimData) ? strlen($claimData) : 0,
                'data_sample' => is_string($claimData) ? substr($claimData, 0, 100) : $claimData,
                'starts_with_pdf' => is_string($claimData) ? (substr($claimData, 0, 4) === '%PDF') : false,
                'is_base64_format' => is_string($claimData) ? $this->isValidBase64($claimData) : false
            ]);
            
            if (!$claimData) {
                Log::warning('Empty claim data from INACBG API', [
                    'pengajuan_id' => $pengajuanId,
                    'response' => $response
                ]);
                
                return $this->getBerkasKlaimFallbackData($pengajuanId, $pengajuanKlaim);
            }
            
            // Validate if data is valid base64 or already PDF content
            $isValidBase64 = $this->isValidBase64($claimData);
            $isPdfContent = $this->isPdfContent($claimData);
            
            if (!$isValidBase64 && !$isPdfContent) {
                Log::error('Data is neither valid base64 nor PDF content', [
                    'pengajuan_id' => $pengajuanId,
                    'data_sample' => is_string($claimData) ? substr($claimData, 0, 100) : $claimData,
                    'data_length' => is_string($claimData) ? strlen($claimData) : 0,
                    'data_type' => gettype($claimData),
                    'is_base64' => $isValidBase64,
                    'is_pdf' => $isPdfContent
                ]);
                
                return $this->getBerkasKlaimFallbackData($pengajuanId, $pengajuanKlaim);
            }
            
            // The API returns base64 encoded PDF data
            // Create berkas klaim data object with API response
            $berkasKlaimData = (object)[
                'pengajuan_klaim_id' => $pengajuanId,
                'nomor_sep' => $pengajuanKlaim->nomor_sep,
                'nama_pasien' => $pengajuanKlaim->nama_pasien,
                'status_pengiriman' => $pengajuanKlaim->status_pengiriman,
                'tanggal_final' => $pengajuanKlaim->updated_at,
                
                // INACBG API response data (base64 encoded PDF)
                'pdf_data' => $claimData,
                'is_api_data' => true,
                'api_response_time' => now(),
                
                // Include counts of available documents for reference
                'laboratorium_count' => HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->count(),
                'radiologi_count' => HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->count(),
                'resume_medis_count' => $this->getResumeMedisData($pengajuanId)->count(),
                'cppt_count' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->count(),
                'pengkajian_count' => $this->getPengkajianAwalData($pengajuanId)->count(),
                'tagihan_available' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->exists(),
                
                'status' => 'final',
                'source' => 'inacbg_api',
                'generated_at' => now(),
            ];
            
            return collect([$berkasKlaimData]);
            
        } catch (\Exception $e) {
            Log::error('Error getting Berkas Klaim data from INACBG API', [
                'pengajuan_id' => $pengajuanId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return fallback data on exception
            $pengajuanKlaim = PengajuanKlaim::find($pengajuanId);
            return $this->getBerkasKlaimFallbackData($pengajuanId, $pengajuanKlaim);
        }
    }
    
    private function getBerkasKlaimFallbackData($pengajuanId, $pengajuanKlaim)
    {
        if (!$pengajuanKlaim) {
            return collect([]);
        }
        
        // Fallback data when API is not available
        $berkasKlaimData = (object)[
            'pengajuan_klaim_id' => $pengajuanId,
            'nomor_sep' => $pengajuanKlaim->nomor_sep,
            'nama_pasien' => $pengajuanKlaim->nama_pasien,
            'status_pengiriman' => $pengajuanKlaim->status_pengiriman,
            'tanggal_final' => $pengajuanKlaim->updated_at,
            
            // Include counts of available documents
            'laboratorium_count' => HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->count(),
            'radiologi_count' => HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->count(),
            'resume_medis_count' => $this->getResumeMedisData($pengajuanId)->count(),
            'cppt_count' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->count(),
            'pengkajian_count' => $this->getPengkajianAwalData($pengajuanId)->count(),
            'tagihan_available' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->exists(),
            
            'status' => 'fallback',
            'source' => 'local_data',
            'is_api_data' => false,
            'generated_at' => now(),
        ];
        
        return collect([$berkasKlaimData]);
    }
    
    private function isValidBase64($data)
    {
        // Check if string is valid base64
        if (!is_string($data)) {
            return false;
        }
        
        // Clean the data first (remove whitespace)
        $cleanedData = preg_replace('/\s+/', '', $data);
        
        // Check if it's already PDF content (starts with %PDF)
        if (substr($cleanedData, 0, 4) === '%PDF') {
            return false; // This is already decoded PDF content
        }
        
        // Check basic base64 pattern
        if (!preg_match('/^[A-Za-z0-9+\/]*={0,2}$/', $cleanedData)) {
            return false;
        }
        
        // Try decode
        $decoded = base64_decode($cleanedData, true);
        if ($decoded === false) {
            return false;
        }
        
        // For large data, don't re-encode (too expensive), just check if decode worked
        if (strlen($cleanedData) > 1000) {
            return true;
        }
        
        // For small data, validate by re-encoding
        return base64_encode($decoded) === $cleanedData;
    }
    
    private function isPdfContent($content)
    {
        // Check if content starts with PDF signature
        if (!is_string($content) || strlen($content) < 4) {
            return false;
        }
        
        // PDF files start with %PDF
        return substr($content, 0, 4) === '%PDF';
    }
    
    private function getDocumentTitle($type)
    {
        return match($type) {
            'laboratorium' => 'Hasil Laboratorium',
            'radiologi' => 'Hasil Radiologi', 
            'resume_medis' => 'Resume Medis',
            'pengkajian_awal' => 'Pengkajian Awal Keperawatan',
            'rawat_inap_resume' => 'Resume Medis Rawat Inap',
            'rawat_jalan_resume' => 'Resume Medis Rawat Jalan',
            'ugd_resume' => 'Resume Medis UGD',
            'rawat_inap_cppt' => 'CPPT Rawat Inap',
            'rawat_inap_pengkajian' => 'Pengkajian Awal Rawat Inap',
            'rawat_jalan_pengkajian' => 'Pengkajian Awal Rawat Jalan',
            'ugd_pengkajian' => 'Pengkajian Awal UGD',
            'ugd_triage' => 'Triage UGD',
            'rawat_inap_balance' => 'Balance Cairan Rawat Inap',
            'tagihan' => 'Tagihan',
            'berkas_klaim' => 'Berkas Klaim',
            'sep' => 'Surat Elegibilitas Peserta (SEP)',
            default => ucfirst(str_replace('_', ' ', $type)),
        };
    }

    private function getLogoBase64()
    {
        // Regular logo for other templates
        $logoPath = public_path('1.png');
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $base64 = base64_encode($imageData);
            $mimeType = mime_content_type($logoPath);
            return "data:{$mimeType};base64,{$base64}";
        }
        
        return null;
    }
    
    private function getBpjsLogoBase64()
    {
        // BPJS logo specifically for SEP documents
        $bpjsLogoPath = public_path('bpjs.png');
        if (file_exists($bpjsLogoPath)) {
            $imageData = file_get_contents($bpjsLogoPath);
            $base64 = base64_encode($imageData);
            $mimeType = mime_content_type($bpjsLogoPath);
            return "data:{$mimeType};base64,{$base64}";
        }
        
        return null;
    }

    private function safeQuery(callable $query, string $queryName, $pengajuanId, $defaultValue = null)
    {
        try {
            $result = $query();
            Log::debug("Safe query executed successfully", [
                'query_name' => $queryName,
                'pengajuan_id' => $pengajuanId,
                'result_type' => gettype($result),
                'result_count' => is_countable($result) ? count($result) : 'not_countable'
            ]);
            return $result;
        } catch (\Exception $e) {
            Log::error('Safe query failed', [
                'query_name' => $queryName,
                'pengajuan_id' => $pengajuanId,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);
            
            // Return appropriate default value
            if ($defaultValue !== null) {
                return $defaultValue;
            }
            
            // Return empty collection by default
            return collect([]);
        }
    }

    /**
     * Test database connections untuk memastikan semua koneksi yang dibutuhkan tersedia
     */
    private function testDatabaseConnections()
    {
        $connectionStatus = [];
        
        // Test koneksi utama 'app' yang digunakan oleh model Eklaim
        try {
            DB::connection('app')->getPdo();
            $connectionStatus['app'] = [
                'status' => 'connected',
                'message' => 'Connection successful'
            ];
            
            // Test dengan query sederhana
            $count = DB::connection('app')->table('pengajuan_klaim')->count();
            $connectionStatus['app']['pengajuan_klaim_count'] = $count;
            
        } catch (\Exception $e) {
            $connectionStatus['app'] = [
                'status' => 'failed',
                'message' => $e->getMessage(),
                'error_code' => $e->getCode()
            ];
            
            Log::error('Database connection test failed for app', [
                'connection' => 'app',
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ]);
        }
        
        // Test tabel-tabel yang digunakan dalam getAllMedicalRecords
        $tables = [
            'hasil_laboratoriums',
            'hasil_radiologis', 
            'rawat_inap_resume_medis',
            'rawat_jalan_resume_medis',
            'ugd_resume_medis',
            'rawat_inap_cpptes',
            'rawat_inap_pengkajian_awals',
            'rawat_jalan_pengkajian_awals',
            'ugd_pengkajian_awals',
            'ugd_triages',
            'rawat_inap_balance_cairans',
            'tagihans'
        ];
        
        foreach ($tables as $table) {
            try {
                $exists = DB::connection('app')->getSchemaBuilder()->hasTable($table);
                $connectionStatus['tables'][$table] = [
                    'exists' => $exists,
                    'status' => $exists ? 'found' : 'missing'
                ];
                
                if ($exists) {
                    try {
                        $count = DB::connection('app')->table($table)->count();
                        $connectionStatus['tables'][$table]['count'] = $count;
                    } catch (\Exception $e) {
                        $connectionStatus['tables'][$table]['count_error'] = $e->getMessage();
                    }
                }
                
            } catch (\Exception $e) {
                $connectionStatus['tables'][$table] = [
                    'exists' => false,
                    'status' => 'error',
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $connectionStatus;
    }

    /**
     * Detailed database diagnostics untuk production troubleshooting
     */
    private function runDatabaseDiagnostics($pengajuanId)
    {
        $diagnostics = [
            'pengajuan_id' => $pengajuanId,
            'timestamp' => now()->toDateTimeString(),
            'environment' => app()->environment(),
            'php_version' => phpversion(),
            'laravel_version' => app()->version()
        ];
        
        // Check database configuration
        $diagnostics['database_config'] = [
            'default_connection' => config('database.default'),
            'app_connection' => config('database.connections.app', 'not_configured')
        ];
        
        // Test specific model queries
        try {
            $pengajuanKlaim = PengajuanKlaim::find($pengajuanId);
            $diagnostics['pengajuan_test'] = [
                'found' => !is_null($pengajuanKlaim),
                'nomor_sep' => $pengajuanKlaim?->nomor_sep,
                'status_pengiriman' => $pengajuanKlaim?->status_pengiriman
            ];
        } catch (\Exception $e) {
            $diagnostics['pengajuan_test'] = [
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ];
        }
        
        // Test each model used in getAllMedicalRecords
        $models = [
            'HasilLaboratorium' => HasilLaboratorium::class,
            'HasilRadiologi' => HasilRadiologi::class,
            'RawatInapResumeMedis' => RawatInapResumeMedis::class,
            'RawatJalanResumeMedis' => RawatJalanResumeMedis::class,
            'UGDResumeMedis' => UGDResumeMedis::class,
            'RawatInapCPPT' => RawatInapCPPT::class,
            'RawatInapPengkajianAwal' => RawatInapPengkajianAwal::class,
            'RawatJalanPengkajianAwal' => RawatJalanPengkajianAwal::class,
            'UGDPengkajianAwal' => UGDPengkajianAwal::class,
            'UGDTriage' => UGDTriage::class,
            'RawatInapBalanceCairan' => RawatInapBalanceCairan::class,
            'Tagihan' => Tagihan::class,
        ];
        
        foreach ($models as $modelName => $modelClass) {
            try {
                $count = $modelClass::where('pengajuan_klaim_id', $pengajuanId)->count();
                $diagnostics['model_tests'][$modelName] = [
                    'status' => 'success',
                    'count' => $count,
                    'table' => (new $modelClass)->getTable(),
                    'connection' => (new $modelClass)->getConnectionName()
                ];
            } catch (\Exception $e) {
                $diagnostics['model_tests'][$modelName] = [
                    'status' => 'error',
                    'error' => $e->getMessage(),
                    'code' => $e->getCode(),
                    'table' => 'unknown',
                    'connection' => 'unknown'
                ];
            }
        }
        
        Log::info('Database Diagnostics Complete', $diagnostics);
        
        return $diagnostics;
    }

    /**
     * Quick connection test untuk error reporting
     */
    private function quickConnectionTest()
    {
        try {
            DB::connection('app')->getPdo();
            return 'app_connection_ok';
        } catch (\Exception $e) {
            return 'app_connection_failed: ' . $e->getMessage();
        }
    }

    /**
     * Get default document order settings
     */
    public function getDefaultOrder(Request $request, $pengajuanId)
    {
        try {
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            $medicalRecords = $this->getAllMedicalRecords($pengajuanId, $pengajuanKlaim->status_pengiriman);
            
            // Get default ordering from database or use predefined defaults
            $defaultOrder = $this->getDefaultDocumentOrder($medicalRecords);
            
            return response()->json([
                'default_order' => $defaultOrder,
                'available_documents' => array_keys(array_filter($medicalRecords, function($record) {
                    return $record['available'];
                }))
            ]);
            
        } catch (\Exception $e) {
            Log::error('Get Default Order Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to get default order'], 500);
        }
    }

    /**
     * Update default document order settings
     */
    public function updateDefaultOrder(Request $request, $pengajuanId)
    {
        try {
            // Set limits for save operation
            ini_set('memory_limit', '256M');
            set_time_limit(60);
            
            Log::info('Update Default Order Request Started', [
                'pengajuan_id' => $pengajuanId,
                'request_size' => strlen(json_encode($request->all()))
            ]);

            $request->validate([
                'document_order' => 'required|array',
                'document_order.*.id' => 'required|string',
                'document_order.*.order' => 'required|integer|min:1',
                'document_order.*.is_default_selected' => 'required|boolean',
            ]);

            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            $documentOrder = $request->input('document_order');
            
            // Save default order settings (text file storage only)
            try {
                $this->saveDefaultDocumentOrder($pengajuanId, $documentOrder);
                $saveSuccess = true;
            } catch (\Exception $saveError) {
                Log::error('Failed to save to text file', [
                    'pengajuan_id' => $pengajuanId,
                    'save_error' => $saveError->getMessage()
                ]);
                $saveSuccess = false;
            }
            
            Log::info('Default order update attempt completed', [
                'pengajuan_id' => $pengajuanId,
                'document_order_count' => count($documentOrder),
                'user_id' => Auth::id(),
                'save_success' => $saveSuccess
            ]);
            
            if ($saveSuccess) {
                return response()->json([
                    'message' => 'Default order updated successfully',
                    'document_order' => $documentOrder,
                    'saved_to_file' => true,
                    'storage_method' => 'text_file_only'
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to save settings to file',
                    'saved_to_file' => false
                ], 500);
            }
            
        } catch (\Exception $e) {
            Log::error('Update Default Order Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to update default order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear saved settings for a specific pengajuan
     */
    public function clearDefaultOrder(Request $request, $pengajuanId)
    {
        try {
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            // Clear from text file only
            $cleared = $this->clearTextFileSettings($pengajuanId);
            
            Log::info('Default order cleared', [
                'pengajuan_id' => $pengajuanId,
                'user_id' => Auth::id(),
                'cleared_from_file' => $cleared
            ]);
            
            return response()->json([
                'message' => 'Default order cleared successfully',
                'pengajuan_id' => $pengajuanId,
                'cleared_from_file' => $cleared
            ]);
            
        } catch (\Exception $e) {
            Log::error('Clear Default Order Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to clear default order'], 500);
        }
    }

    /**
     * Get all saved settings (admin/debug endpoint)
     */
    public function getAllSavedSettingsApi(Request $request)
    {
        try {
            $settings = $this->getAllSavedSettings();
            
            return response()->json([
                'settings' => $settings,
                'count' => count($settings),
                'file_path' => base_path('print_bundle_settings.txt')
            ]);
            
        } catch (\Exception $e) {
            Log::error('Get All Saved Settings Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to get saved settings'], 500);
        }
    }

    /**
     * Get default document ordering based on medical records
     */
    private function getDefaultDocumentOrder($medicalRecords)
    {
        $defaultOrder = [];
        
        // Sort by default_order if available, otherwise by priority
        $sortedRecords = collect($medicalRecords)
            ->filter(function($record) { return $record['available']; })
            ->sortBy(function($record) {
                return $record['default_order'] ?? $record['priority'] ?? 999;
            });
            
        foreach ($sortedRecords as $key => $record) {
            $defaultOrder[] = [
                'id' => $key,
                'title' => $record['title'],
                'icon' => $record['icon'],
                'order' => $record['default_order'] ?? count($defaultOrder) + 1,
                'is_default_selected' => $record['is_default_selected'] ?? false,
                'available' => $record['available'],
                'count' => $record['count']
            ];
        }
        
        return $defaultOrder;
    }

    /**
     * Save default document order settings
     * Uses text file storage only
     */
    private function saveDefaultDocumentOrder($pengajuanId, $documentOrder)
    {
        // Save to text file for persistence
        $this->saveToTextFile($pengajuanId, $documentOrder);
        
        // Optional: Save to database table for global defaults
        // DB::table('print_bundle_settings')->updateOrInsert(
        //     ['pengajuan_klaim_id' => $pengajuanId],
        //     ['document_order' => json_encode($documentOrder), 'updated_at' => now()]
        // );
    }

    /**
     * Load saved default document order settings
     * Uses text file storage only
     */
    private function loadSavedDefaultOrder($pengajuanId)
    {
        // Load directly from text file
        $savedOrder = $this->loadFromTextFile($pengajuanId);
        
        // Optional: Load from database
        // if (!$savedOrder) {
        //     $saved = DB::table('print_bundle_settings')
        //         ->where('pengajuan_klaim_id', $pengajuanId)
        //         ->first();
        //     $savedOrder = $saved ? json_decode($saved->document_order, true) : null;
        // }
        
        return $savedOrder;
    }

    /**
     * Apply custom default order to medical records
     */
    private function applyCustomDefaultOrder($medicalRecords, $savedOrder)
    {
        foreach ($savedOrder as $orderItem) {
            $documentId = $orderItem['id'];
            if (isset($medicalRecords[$documentId])) {
                $medicalRecords[$documentId]['default_order'] = $orderItem['order'];
                $medicalRecords[$documentId]['is_default_selected'] = $orderItem['is_default_selected'];
            }
        }
        
        return $medicalRecords;
    }

    /**
     * Save document order settings to text file
     */
    private function saveToTextFile($pengajuanId, $documentOrder)
    {
        try {
            $filePath = base_path('print_bundle_settings.txt');
            $settings = [];
            
            // Load existing settings if file exists
            if (file_exists($filePath)) {
                $existingContent = file_get_contents($filePath);
                if (!empty($existingContent)) {
                    $existingSettings = json_decode($existingContent, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $settings = $existingSettings;
                        Log::info('Loaded existing settings from text file', [
                            'pengajuan_id' => $pengajuanId,
                            'existing_settings_count' => count($settings)
                        ]);
                    } else {
                        Log::warning('Invalid JSON in existing settings file, starting fresh', [
                            'pengajuan_id' => $pengajuanId,
                            'json_error' => json_last_error_msg()
                        ]);
                    }
                }
            } else {
                Log::info('Creating new print bundle settings file', [
                    'pengajuan_id' => $pengajuanId,
                    'file_path' => $filePath
                ]);
            }
            
            // Update or add settings for this pengajuan
            $settings[$pengajuanId] = [
                'document_order' => $documentOrder,
                'updated_at' => now()->toDateTimeString(),
                'user_id' => Auth::id() ?? 'system'
            ];
            
            // Save back to file
            $jsonContent = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $bytesWritten = file_put_contents($filePath, $jsonContent);
            
            if ($bytesWritten === false) {
                throw new \Exception('Failed to write to file');
            }
            
            Log::info('Document order successfully saved to text file', [
                'pengajuan_id' => $pengajuanId,
                'file_path' => $filePath,
                'document_count' => count($documentOrder),
                'total_settings' => count($settings),
                'bytes_written' => $bytesWritten,
                'user_id' => Auth::id() ?? 'system'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to save document order to text file', [
                'pengajuan_id' => $pengajuanId,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Rethrow the exception so the calling method knows it failed
            throw $e;
        }
    }

    /**
     * Load document order settings from text file
     */
    private function loadFromTextFile($pengajuanId)
    {
        try {
            $filePath = base_path('print_bundle_settings.txt');
            
            if (!file_exists($filePath)) {
                Log::info('Print bundle settings file not found, creating new one', [
                    'file_path' => $filePath,
                    'pengajuan_id' => $pengajuanId
                ]);
                return null;
            }
            
            $content = file_get_contents($filePath);
            if (empty($content)) {
                Log::info('Print bundle settings file is empty', [
                    'file_path' => $filePath,
                    'pengajuan_id' => $pengajuanId
                ]);
                return null;
            }
            
            $settings = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to parse print bundle settings JSON', [
                    'file_path' => $filePath,
                    'pengajuan_id' => $pengajuanId,
                    'json_error' => json_last_error_msg(),
                    'content_sample' => substr($content, 0, 200)
                ]);
                return null;
            }
            
            if (!isset($settings[$pengajuanId])) {
                Log::info('No settings found for pengajuan_id in text file', [
                    'pengajuan_id' => $pengajuanId,
                    'available_ids' => array_keys($settings),
                    'total_settings' => count($settings)
                ]);
                return null;
            }
            
            $documentOrder = $settings[$pengajuanId]['document_order'] ?? null;
            
            Log::info('Document order successfully loaded from text file', [
                'pengajuan_id' => $pengajuanId,
                'file_path' => $filePath,
                'document_count' => is_array($documentOrder) ? count($documentOrder) : 0,
                'last_updated' => $settings[$pengajuanId]['updated_at'] ?? 'unknown',
                'user_id' => $settings[$pengajuanId]['user_id'] ?? 'unknown'
            ]);
            
            return $documentOrder;
            
        } catch (\Exception $e) {
            Log::error('Failed to load document order from text file', [
                'pengajuan_id' => $pengajuanId,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Get all saved settings from text file (for debugging/management)
     */
    private function getAllSavedSettings()
    {
        try {
            $filePath = base_path('print_bundle_settings.txt');
            
            if (!file_exists($filePath)) {
                return [];
            }
            
            $content = file_get_contents($filePath);
            if (empty($content)) {
                return [];
            }
            
            $settings = json_decode($content, true);
            return $settings ?? [];
            
        } catch (\Exception $e) {
            Log::error('Failed to get all saved settings', [
                'error' => $e->getMessage()
            ]);
            
            return [];
        }
    }

    /**
     * Clear settings for a specific pengajuan (cleanup method)
     */
    private function clearTextFileSettings($pengajuanId)
    {
        try {
            $filePath = base_path('print_bundle_settings.txt');
            
            if (!file_exists($filePath)) {
                return true;
            }
            
            $content = file_get_contents($filePath);
            if (empty($content)) {
                return true;
            }
            
            $settings = json_decode($content, true) ?? [];
            
            if (isset($settings[$pengajuanId])) {
                unset($settings[$pengajuanId]);
                
                // Save updated settings back to file
                $jsonContent = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                file_put_contents($filePath, $jsonContent);
                
                Log::info('Settings cleared for pengajuan_id', [
                    'pengajuan_id' => $pengajuanId,
                    'remaining_count' => count($settings)
                ]);
            }
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to clear settings for pengajuan_id', [
                'pengajuan_id' => $pengajuanId,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }


}
