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
use Illuminate\Support\Facades\Log;

class PrintBundleController extends Controller
{
    public function index($pengajuanId)
    {
        try {
            // Get pengajuan klaim data
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            // Get all related medical records data
            $medicalRecords = $this->getAllMedicalRecords($pengajuanId, $pengajuanKlaim->status_pengiriman);
            
            return Inertia::render('eklaim/print-bundle/index', [
                'pengajuanKlaim' => $pengajuanKlaim,
                'medicalRecords' => $medicalRecords,
                'csrf_token' => csrf_token(), // Add CSRF token
            ]);
        } catch (\Exception $e) {
            Log::error('Print Bundle Index Error: ' . $e->getMessage());
            return redirect()->route('eklaim.pengajuan.index')
                ->with('error', 'Terjadi kesalahan saat memuat data print bundle');
        }
    }
    
    private function getAllMedicalRecords($pengajuanId, $statusPengiriman = null)
    {
        try {
            // Get laboratorium data - each row is one record
            $labData = HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->get();
            
            // Get radiologi data - each row is one record
            $radioData = HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->get();
            
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
            ];
            
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
                ];
            }
            
            // Always include all medical records
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
                ],
                
                // CPPT - Rawat Inap - Multiple records per pengajuan
                'rawat_inap_cppt' => [
                    'title' => 'CPPT Rawat Inap',
                    'icon' => '📝',
                    'type' => 'multiple',
                    'data' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->get(),
                    'records' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->orderBy('tanggal', 'asc')->get(),
                    'count' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->count(),
                    'available' => RawatInapCPPT::where('pengajuan_klaim_id', $pengajuanId)->exists(),
                    'priority' => 3,
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
                ],
            ]);
            
            return $medicalRecords;
        } catch (\Exception $e) {
            Log::error('Get Medical Records Error: ' . $e->getMessage());
            return [];
        }
    }
    
    public function generatePreview(Request $request, $pengajuanId)
    {
        try {
            Log::info('Generate Preview Request', [
                'pengajuan_id' => $pengajuanId,
                'document_type' => $request->get('type'),
                'method' => $request->method(),
                'session_id' => session()->getId(),
                'has_session' => session()->isStarted(),
            ]);

            $documentType = $request->get('type');
            $selectedRecords = $request->input('selected_records', []);
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
            $data = $this->getDocumentData($documentType, $pengajuanId);
            
            if (!$data || $data->isEmpty()) {
                Log::warning('No data found', ['type' => $documentType, 'pengajuan_id' => $pengajuanId]);
                return response()->json(['error' => 'No data found for this document type'], 404);
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
            
            // Return HTML preview using same Blade template as PDF
            return view("pdf.templates.{$documentType}", array_merge([
                'pengajuanKlaim' => $pengajuanKlaim,
                'data' => $data,
                'selectedRecords' => $selectedRecords,
                'logoBase64' => $logoBase64,
            ], $qrData));
            
        } catch (\Exception $e) {
            Log::error('Generate Preview Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'document_type' => $request->get('type'),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Terjadi kesalahan saat generate preview: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function generatePDF(Request $request, $pengajuanId)
    {
        try {
            Log::info('Generate PDF Request', [
                'pengajuan_id' => $pengajuanId,
                'document_type' => $request->get('type'),
                'method' => $request->method(),
                'session_id' => session()->getId(),
            ]);

            $documentType = $request->get('type');
            $selectedRecords = $request->input('selected_records', []);
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            // Validate document type
            if (!$this->isValidDocumentType($documentType)) {
                Log::error('Invalid document type for PDF', ['type' => $documentType]);
                return response()->json(['error' => 'Invalid document type'], 400);
            }
            
            // Get data based on document type
            $data = $this->getDocumentData($documentType, $pengajuanId);
            
            if (!$data || $data->isEmpty()) {
                Log::warning('No data found for PDF', ['type' => $documentType, 'pengajuan_id' => $pengajuanId]);
                return response()->json(['error' => 'No data found for this document type'], 404);
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
            
            // Get base64 encoded logo (BPJS for SEP, regular for others)
            $logoBase64 = ($documentType === 'sep') ? $this->getBpjsLogoBase64() : $this->getLogoBase64();
            
            // Get QR codes for signatures
            $qrData = $this->generateQRCodes($pengajuanKlaim, $data, $documentType);
            
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
            ], $qrData))->setPaper('a4', 'portrait');
            
            Log::info('PDF generated successfully', ['document_type' => $documentType]);
            
            // NEW: Return all PDFs as base64 JSON for frontend merging
            $pdfContent = $pdf->output();
            $base64Pdf = base64_encode($pdfContent);
            
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
            Log::info('Generate Bundle Request - Frontend PDF Merging Approach', [
                'pengajuan_id' => $pengajuanId,
                'document_types' => $request->input('document_types', []),
                'selected_records' => $request->input('selected_records', []),
            ]);

            $documentTypes = $request->input('document_types', []);
            $selectedRecords = $request->input('selected_records', []);
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            if (empty($documentTypes)) {
                return response()->json(['error' => 'No document types selected'], 400);
            }
            
            // Validate all document types
            foreach ($documentTypes as $type) {
                if (!$this->isValidDocumentType($type)) {
                    return response()->json(['error' => "Invalid document type: {$type}"], 400);
                }
            }
            
            // NEW APPROACH: Generate all PDFs as base64 and send to frontend for merging
            $pdfDocuments = [];
            
            foreach ($documentTypes as $type) {
                try {
                    $data = $this->getDocumentData($type, $pengajuanId);
                    
                    if (!$data || $data->isEmpty()) {
                        Log::warning("No data found for bundle document type: {$type}", [
                            'pengajuan_id' => $pengajuanId,
                            'document_type' => $type
                        ]);
                        continue; // Skip if no data
                    }
                    
                    // Special handling for berkas_klaim from INACBG API
                    if ($type === 'berkas_klaim') {
                        $berkasData = $data->first();
                        
                        if ($berkasData && isset($berkasData->is_api_data) && $berkasData->is_api_data && isset($berkasData->pdf_data)) {
                            Log::info('Adding berkas_klaim PDF data to bundle array', [
                                'document_type' => $type,
                                'pengajuan_id' => $pengajuanId,
                                'pdf_data_length' => strlen($berkasData->pdf_data)
                            ]);
                            
                            // Add berkas_klaim base64 PDF data to documents array
                            $pdfDocuments[] = [
                                'type' => $type,
                                'title' => 'Berkas Klaim',
                                'filename' => 'berkas-klaim-' . $pengajuanKlaim->nomor_sep . '.pdf',
                                'data' => $berkasData->pdf_data, // Already base64
                                'source' => 'inacbg_api'
                            ];
                            continue;
                        }
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
            
            if (empty($pdfDocuments)) {
                return response()->json(['error' => 'No valid documents found for bundle generation'], 400);
            }
            
            Log::info('Bundle PDF generation completed', [
                'pengajuan_id' => $pengajuanId,
                'document_count' => count($pdfDocuments),
                'documents' => array_column($pdfDocuments, 'type')
            ]);
            
            // Return JSON with all PDF documents as base64 for frontend merging
            return response()->json([
                'type' => 'bundle_base64',
                'documents' => $pdfDocuments,
                'bundle_filename' => 'medical-records-' . $pengajuanKlaim->nomor_sep . '-' . date('Y-m-d-H-i-s') . '.pdf',
                'patient_info' => [
                    'nomor_sep' => $pengajuanKlaim->nomor_sep,
                    'nama_pasien' => $pengajuanKlaim->nama_pasien,
                    'pengajuan_id' => $pengajuanId
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Generate Bundle Error: ' . $e->getMessage(), [
                'pengajuan_id' => $pengajuanId,
                'selected_types' => $request->input('document_types', []),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Terjadi kesalahan saat generate bundle: ' . $e->getMessage()
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
                $qrData['perawatQR'] = QRCodeHelper::generateDataURL($triageData->petugas);
            }
            if ($triageData && $triageData->dokter) {
                $qrData['dokterTriageQR'] = QRCodeHelper::generateDataURL($triageData->dokter);
            }
        }
        
        return $qrData;
    }
    
    private function getDocumentData($type, $pengajuanId)
    {
        return match($type) {
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
    }
    
    private function getResumeMedisData($pengajuanId)
    {
        $resumeData = collect();
        
        // Check for Rawat Inap Resume Medis
        $rawatInapResume = RawatInapResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first();
        if ($rawatInapResume) {
            $rawatInapResume->resume_type = 'rawat_inap';
            $rawatInapResume->resume_title = 'Resume Medis Rawat Inap';
            $resumeData->push($rawatInapResume);
        }
        
        // Check for Rawat Jalan Resume Medis
        $rawatJalanResume = RawatJalanResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first();
        if ($rawatJalanResume) {
            $rawatJalanResume->resume_type = 'rawat_jalan';
            $rawatJalanResume->resume_title = 'Resume Medis Rawat Jalan';
            $resumeData->push($rawatJalanResume);
        }
        
        // Check for UGD Resume Medis
        $ugdResume = UGDResumeMedis::where('pengajuan_klaim_id', $pengajuanId)->first();
        if ($ugdResume) {
            $ugdResume->resume_type = 'ugd';
            $ugdResume->resume_title = 'Resume Medis UGD';
            $resumeData->push($ugdResume);
        }
        
        return $resumeData;
    }
    
    private function getPengkajianAwalData($pengajuanId)
    {
        $pengkajianData = collect();
        
        // Check for Rawat Inap Pengkajian Awal
        $rawatInapPengkajian = RawatInapPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first();
        if ($rawatInapPengkajian) {
            $rawatInapPengkajian->pengkajian_type = 'rawat_inap';
            $rawatInapPengkajian->pengkajian_title = 'Pengkajian Awal Rawat Inap';
            $pengkajianData->push($rawatInapPengkajian);
        }
        
        // Check for Rawat Jalan Pengkajian Awal
        $rawatJalanPengkajian = RawatJalanPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first();
        if ($rawatJalanPengkajian) {
            $rawatJalanPengkajian->pengkajian_type = 'rawat_jalan';
            $rawatJalanPengkajian->pengkajian_title = 'Pengkajian Awal Rawat Jalan';
            $pengkajianData->push($rawatJalanPengkajian);
        }
        
        // Check for UGD Pengkajian Awal
        $ugdPengkajian = UGDPengkajianAwal::where('pengajuan_klaim_id', $pengajuanId)->first();
        if ($ugdPengkajian) {
            $ugdPengkajian->pengkajian_type = 'ugd';
            $ugdPengkajian->pengkajian_title = 'Pengkajian Awal UGD';
            $pengkajianData->push($ugdPengkajian);
        }
        
        return $pengkajianData;
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
            
            // Hit INACBG API
            $response = InacbgHelper::hitApi($requestData);
            
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


}
