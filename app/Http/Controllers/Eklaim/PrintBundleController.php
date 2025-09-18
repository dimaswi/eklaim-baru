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

class PrintBundleController extends Controller
{
    public function index($pengajuanId)
    {
        // Get pengajuan klaim data
        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
        
        // Get all related medical records data
        $medicalRecords = $this->getAllMedicalRecords($pengajuanId);
        
        return Inertia::render('eklaim/print-bundle/index', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'medicalRecords' => $medicalRecords,
        ]);
    }
    
    private function getAllMedicalRecords($pengajuanId)
    {
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
    }
    
    public function generatePreview(Request $request, $pengajuanId)
    {
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
        
        // Get data based on document type
        $data = $this->getDocumentData($documentType, $pengajuanId);
        
        // Get base64 encoded logo
        $logoBase64 = $this->getLogoBase64();
        
        // Get QR codes for signatures (if available)
        $defaultDokter = $pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD';
        $dokterQR = QRCodeHelper::generateDataURL($defaultDokter);
        $keluargaQR = QRCodeHelper::generateDataURL('Keluarga Pasien');
        
        // Additional QR codes for Triage UGD and other documents
        $perawatQR = null;
        $dokterTriageQR = null;
        
        // Get dokter/petugas from the actual data if available
        if ($data && $data->count() > 0) {
            $firstItem = $data->first();
            
            // Use dokter from data if available, otherwise use default
            if (!empty($firstItem->dokter)) {
                $dokterQR = QRCodeHelper::generateDataURL($firstItem->dokter);
            }
            
            // Generate perawat QR if petugas data is available
            if (!empty($firstItem->petugas)) {
                $perawatQR = QRCodeHelper::generateDataURL($firstItem->petugas);
            }
        }
        
        // Special handling for UGD triage
        if ($documentType === 'ugd_triage' && $data && $data->count() > 0) {
            $triageData = $data->first();
            if ($triageData && $triageData->petugas) {
                $perawatQR = QRCodeHelper::generateDataURL($triageData->petugas);
            }
            if ($triageData && $triageData->dokter) {
                $dokterTriageQR = QRCodeHelper::generateDataURL($triageData->dokter);
            }
        }
        
        // Return HTML preview using same Blade template as PDF
        return view("pdf.templates.{$documentType}", [
            'pengajuanKlaim' => $pengajuanKlaim,
            'data' => $data,
            'selectedRecords' => $selectedRecords,
            'logoBase64' => $logoBase64,
            'dokterQR' => $dokterQR,
            'keluargaQR' => $keluargaQR,
            'perawatQR' => $perawatQR,
            'dokterTriageQR' => $dokterTriageQR,
        ]);
    }
    
    public function generatePDF(Request $request, $pengajuanId)
    {
        $documentType = $request->get('type');
        $selectedRecords = $request->input('selected_records', []);
        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
        
        // Get data based on document type
        $data = $this->getDocumentData($documentType, $pengajuanId);
        
        // Get base64 encoded logo
        $logoBase64 = $this->getLogoBase64();
        
        // Get QR codes for signatures (if available)
        $defaultDokter = $pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD';
        $dokterQR = QRCodeHelper::generateDataURL($defaultDokter);
        $keluargaQR = QRCodeHelper::generateDataURL('Keluarga Pasien');
        
        // Additional QR codes for Triage UGD and other documents
        $perawatQR = null;
        $dokterTriageQR = null;
        
        // Get dokter/petugas from the actual data if available
        if ($data && $data->count() > 0) {
            $firstItem = $data->first();
            
            // Use dokter from data if available, otherwise use default
            if (!empty($firstItem->dokter)) {
                $dokterQR = QRCodeHelper::generateDataURL($firstItem->dokter);
            }
            
            // Generate perawat QR if petugas data is available
            if (!empty($firstItem->petugas)) {
                $perawatQR = QRCodeHelper::generateDataURL($firstItem->petugas);
            }
        }
        
        // Special handling for UGD triage
        if ($documentType === 'ugd_triage' && $data && $data->count() > 0) {
            $triageData = $data->first();
            if ($triageData && $triageData->petugas) {
                $perawatQR = QRCodeHelper::generateDataURL($triageData->petugas);
            }
            if ($triageData && $triageData->dokter) {
                $dokterTriageQR = QRCodeHelper::generateDataURL($triageData->dokter);
            }
        }
        
        // Generate PDF using DomPDF with same Blade template
        $pdf = Pdf::loadView("pdf.templates.{$documentType}", [
            'pengajuanKlaim' => $pengajuanKlaim,
            'data' => $data,
            'selectedRecords' => $selectedRecords,
            'logoBase64' => $logoBase64,
            'dokterQR' => $dokterQR,
            'keluargaQR' => $keluargaQR,
            'perawatQR' => $perawatQR,
            'dokterTriageQR' => $dokterTriageQR,
        ])->setPaper('a4', 'portrait');
        
        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $documentType . '-' . $pengajuanId . '.pdf"'
        ]);
    }
    
    public function generateBundle(Request $request, $pengajuanId)
    {
        $selectedTypes = $request->input('document_types', []);
        $selectedRecords = $request->input('selected_records', []); 
        $pengajuanKlaim = PengajuanKlaim::findOrFail($pengajuanId);
        
        if (empty($selectedTypes)) {
            return response()->json(['error' => 'No documents selected'], 400);
        }
        
        // Generate combined PDF using exact same templates as individual PDFs
        return response()->streamDownload(function() use ($selectedTypes, $selectedRecords, $pengajuanId, $pengajuanKlaim) {
            
            $combinedHtml = '';
            
            foreach ($selectedTypes as $index => $type) {
                $data = $this->getDocumentData($type, $pengajuanId);
                
                // Get base64 encoded logo
                $logoBase64 = $this->getLogoBase64();
                
                // Prepare QR codes for this document type
                $defaultDokter = $pengajuanKlaim->nama_dpjp ?? 'dr. ILHAM MUNANIDAR, Sp.PD';
                $dokterQR = QRCodeHelper::generateDataURL($defaultDokter);
                $keluargaQR = QRCodeHelper::generateDataURL('Keluarga Pasien');
                $perawatQR = null;
                $dokterTriageQR = null;
                
                // Get dokter/petugas from the actual data if available
                if ($data && $data->count() > 0) {
                    $firstItem = $data->first();
                    
                    // Use dokter from data if available, otherwise use default
                    if (!empty($firstItem->dokter)) {
                        $dokterQR = QRCodeHelper::generateDataURL($firstItem->dokter);
                    }
                    
                    // Generate perawat QR if petugas data is available
                    if (!empty($firstItem->petugas)) {
                        $perawatQR = QRCodeHelper::generateDataURL($firstItem->petugas);
                    }
                }
                
                // Special handling for UGD triage
                if ($type === 'ugd_triage' && $data && $data->count() > 0) {
                    $triageData = $data->first();
                    if ($triageData && $triageData->petugas) {
                        $perawatQR = QRCodeHelper::generateDataURL($triageData->petugas);
                    }
                    if ($triageData && $triageData->dokter) {
                        $dokterTriageQR = QRCodeHelper::generateDataURL($triageData->dokter);
                    }
                }
                
                // Render the exact same Blade template used for individual PDFs
                $documentHtml = view("pdf.templates.{$type}", [
                    'pengajuanKlaim' => $pengajuanKlaim,
                    'data' => $data,
                    'selectedRecords' => $selectedRecords,
                    'logoBase64' => $logoBase64,
                    'dokterQR' => $dokterQR,
                    'keluargaQR' => $keluargaQR,
                    'perawatQR' => $perawatQR,
                    'dokterTriageQR' => $dokterTriageQR,
                ])->render();
                
                $combinedHtml .= $documentHtml;
            }
            
            // Generate single PDF from combined templates
            $pdf = Pdf::loadHTML($combinedHtml)->setPaper('a4', 'portrait');
            echo $pdf->output();
            
        }, 'medical-records-' . $pengajuanKlaim->nomor_sep . '-' . date('Y-m-d-H-i-s') . '.pdf');
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
