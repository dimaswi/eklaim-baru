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
use Illuminate\Support\Facades\Log;

class PrintBundleController extends Controller
{
    public function index($pengajuanId)
    {
        try {
            // Get pengajuan klaim data
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            // Get all related medical records data
            $medicalRecords = $this->getAllMedicalRecords($pengajuanId);
            
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
    
    private function getAllMedicalRecords($pengajuanId)
    {
        try {
            // Get laboratorium data - each row is one record
            $labData = HasilLaboratorium::where('pengajuan_klaim_id', $pengajuanId)->get();
            
            // Get radiologi data - each row is one record
            $radioData = HasilRadiologi::where('pengajuan_klaim_id', $pengajuanId)->get();
            
            return [
                // Laboratorium Data - Count based on database rows, not JSON tindakan_medis_data
                'laboratorium' => [
                    'title' => 'Hasil Laboratorium',
                    'icon' => '🧪',
                    'type' => 'multiple',
                    'data' => $labData,
                    'records' => $labData, // Each database row is a record
                    'count' => $labData->count(),
                    'available' => $labData->count() > 0,
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
                ],
                
                // Pengkajian Awal - Unified untuk semua jenis (Rawat Inap, Rawat Jalan, UGD) - MULTIPLE RECORDS
                'pengkajian_awal' => [
                    'title' => 'Pengkajian Awal Keperawatan',
                    'icon' => '📋',
                    'type' => 'multiple',
                    'data' => $this->getPengkajianAwalData($pengajuanId),
                    'count' => $this->getPengkajianAwalData($pengajuanId)->count(),
                    'available' => $this->getPengkajianAwalData($pengajuanId)->count() > 0,
                ],
                
                // Triage UGD - Single record per pengajuan
                'ugd_triage' => [
                    'title' => 'Triage UGD',
                    'icon' => '🔴',
                    'type' => 'single',
                    'data' => UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->first(),
                    'count' => UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->exists() ? 1 : 0,
                    'available' => UGDTriage::where('pengajuan_klaim_id', $pengajuanId)->exists(),
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
                ],
                
                // Tagihan - Single record per pengajuan
                'tagihan' => [
                    'title' => 'Tagihan',
                    'icon' => '💰',
                    'type' => 'single',
                    'data' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->first(),
                    'count' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->exists() ? 1 : 0,
                    'available' => Tagihan::where('pengajuan_klaim_id', $pengajuanId)->exists(),
                ],
            ];
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
                $availableDocuments = $this->getAllMedicalRecords($pengajuanId);
                
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
            
            // Get base64 encoded logo
            $logoBase64 = $this->getLogoBase64();
            
            // Get QR codes for signatures (if available)
            $qrData = $this->generateQRCodes($pengajuanKlaim, $data, $documentType);
            
            Log::info('Preview generated successfully', [
                'document_type' => $documentType,
                'data_count' => $data->count(),
                'has_logo' => !is_null($logoBase64)
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
            
            // Get base64 encoded logo
            $logoBase64 = $this->getLogoBase64();
            
            // Get QR codes for signatures
            $qrData = $this->generateQRCodes($pengajuanKlaim, $data, $documentType);
            
            Log::info('PDF generation started', [
                'document_type' => $documentType,
                'data_count' => $data->count()
            ]);
            
            // Generate PDF using DomPDF with same Blade template
            $pdf = Pdf::loadView("pdf.templates.{$documentType}", array_merge([
                'pengajuanKlaim' => $pengajuanKlaim,
                'data' => $data,
                'selectedRecords' => $selectedRecords,
                'logoBase64' => $logoBase64,
            ], $qrData))->setPaper('a4', 'portrait');
            
            Log::info('PDF generated successfully', ['document_type' => $documentType]);
            
            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $documentType . '-' . $pengajuanId . '.pdf"'
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
            $selectedTypes = $request->input('document_types', []);
            $selectedRecords = $request->input('selected_records', []); 
            $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
            
            if (empty($selectedTypes)) {
                return response()->json(['error' => 'No documents selected'], 400);
            }
            
            // Validate all document types
            foreach ($selectedTypes as $type) {
                if (!$this->isValidDocumentType($type)) {
                    return response()->json(['error' => "Invalid document type: {$type}"], 400);
                }
            }
            
            // Generate combined PDF using exact same templates as individual PDFs
            return response()->streamDownload(function() use ($selectedTypes, $selectedRecords, $pengajuanId, $pengajuanKlaim) {
                
                $combinedHtml = '';
                
                foreach ($selectedTypes as $index => $type) {
                    try {
                        $data = $this->getDocumentData($type, $pengajuanId);
                        
                        if (!$data || $data->isEmpty()) {
                            continue; // Skip if no data
                        }
                        
                        // Get base64 encoded logo
                        $logoBase64 = $this->getLogoBase64();
                        
                        // Generate QR codes for this document type
                        $qrData = $this->generateQRCodes($pengajuanKlaim, $data, $type);
                        
                        // Render the exact same Blade template used for individual PDFs
                        $documentHtml = view("pdf.templates.{$type}", array_merge([
                            'pengajuanKlaim' => $pengajuanKlaim,
                            'data' => $data,
                            'selectedRecords' => $selectedRecords,
                            'logoBase64' => $logoBase64,
                        ], $qrData))->render();
                        
                        $combinedHtml .= $documentHtml;
                        
                        // Add page break between documents (except for the last one)
                        if ($index < count($selectedTypes) - 1) {
                            $combinedHtml .= '<div style="page-break-after: always;"></div>';
                        }
                        
                    } catch (\Exception $e) {
                        Log::error("Bundle Generation Error for type {$type}: " . $e->getMessage());
                        continue; // Skip this document and continue with others
                    }
                }
                
                if (empty($combinedHtml)) {
                    throw new \Exception('No documents could be generated');
                }
                
                // Generate single PDF from combined templates
                $pdf = Pdf::loadHTML($combinedHtml)->setPaper('a4', 'portrait');
                echo $pdf->output();
                
            }, 'medical-records-' . $pengajuanKlaim->nomor_sep . '-' . date('Y-m-d-H-i-s') . '.pdf');
            
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
            'ugd_pengkajian', 'ugd_triage', 'rawat_inap_balance', 'tagihan'
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
    
    private function getLogoBase64()
    {
        $logoPath = public_path('1.png');
        
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $base64 = base64_encode($imageData);
            $mimeType = mime_content_type($logoPath);
            return "data:{$mimeType};base64,{$base64}";
        }
        
        return null;
    }
}
