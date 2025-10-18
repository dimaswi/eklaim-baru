<?php

namespace App\Http\Controllers\Biaya;

use App\Http\Controllers\Controller;
use App\Models\SIMRS\KunjunganBPJS;
use App\Models\Eklaim\PengajuanKlaim;
use App\Helpers\InacbgHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BiayaController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $search = $request->get('search', '');
        $status = $request->get('status', '');
        $ruangan = $request->get('ruangan', '');
        $dateType = $request->get('date_type', 'masuk');
        $startDate = $request->get('start_date', '');
        $endDate = $request->get('end_date', '');

        // Build the base query with all filters using raw SQL
        $whereConditions = [];
        $queryParams = [];

        // Base conditions
        $whereConditions[] = "k.batalSEP = 0";
        $whereConditions[] = "r.JENIS_KUNJUNGAN IN (1, 2, 3)";
        $whereConditions[] = "r.JENIS = 5";

        // Search filter
        if (!empty($search)) {
            $whereConditions[] = "(k.noSEP LIKE ? OR ps.NAMA LIKE ?)";
            $queryParams[] = "%{$search}%";
            $queryParams[] = "%{$search}%";
        }

        // Status filter
        if (!empty($status) && $status !== 'all') {
            if ($status === 'active') {
                $whereConditions[] = "k.klaimStatus = 0";  // 0 = belum diklaim (aktif, bisa diajukan)
            } elseif ($status === 'completed') {
                $whereConditions[] = "k.klaimStatus = 1";  // 1 = sudah diklaim (selesai)
            }
        }

        // Ruangan filter
        if (!empty($ruangan) && $ruangan !== 'all') {
            $whereConditions[] = "kr.RUANGAN = ?";
            $queryParams[] = $ruangan;
        }

        // Date range filter
        if (!empty($startDate) || !empty($endDate)) {
            $dateColumn = $dateType === 'keluar' ? 'kr.KELUAR' : 'kr.MASUK';
            
            if (!empty($startDate)) {
                $whereConditions[] = "DATE({$dateColumn}) >= ?";
                $queryParams[] = $startDate;
            }
            if (!empty($endDate)) {
                $whereConditions[] = "DATE({$dateColumn}) <= ?";
                $queryParams[] = $endDate;
            }
        }

        $whereClause = implode(' AND ', $whereConditions);

        // Get filtered noSEP list with order column
        $dateColumn = $dateType === 'keluar' ? 'kr.KELUAR' : 'kr.MASUK';
        $validSEPs = DB::connection('bpjs')->select("
            SELECT DISTINCT k.noSEP, k.tglSEP, {$dateColumn} as orderDate
            FROM bpjs.kunjungan k
            JOIN pendaftaran.penjamin p ON k.noSEP = p.NOMOR
            JOIN pendaftaran.pendaftaran pd ON p.NOPEN = pd.NOMOR  
            JOIN pendaftaran.kunjungan kr ON pd.NOMOR = kr.NOPEN
            JOIN master.ruangan r ON kr.RUANGAN = r.ID
            JOIN master.pasien ps ON pd.NORM = ps.NORM
            WHERE {$whereClause}
            ORDER BY {$dateColumn} DESC
        ", $queryParams);
        
        $validSEPNumbers = collect($validSEPs)->pluck('noSEP')->toArray();
        
        // Get paginated results using Eloquent with the filtered noSEP list
        // Maintain the order from raw query by ordering by the position in the array
        $sepOrder = array_flip($validSEPNumbers);
        
        $query = KunjunganBPJS::query()
            ->with([
                'penjamin.pendaftaran.pasien',
                'penjamin.pendaftaran.kunjungan_rs.ruangan'
            ])
            ->whereIn('noSEP', $validSEPNumbers)
            ->orderByRaw("FIELD(noSEP, '" . implode("','", $validSEPNumbers) . "')");
        
        $kunjungan = $query->paginate($perPage);
        
        // Append query parameters to pagination links
        $kunjungan->appends($request->query());
        
        // Get list of ruangan for filter dropdown
        $ruangan_list = \App\Models\SIMRS\Ruangan::whereIn('JENIS_KUNJUNGAN', [1, 2, 3])
            ->where('JENIS', 5)
            ->orderBy('DESKRIPSI')
            ->get(['ID', 'DESKRIPSI', 'JENIS_KUNJUNGAN']);
        
        return Inertia::render('biaya/index', [
            'kunjungan' => $kunjungan,
            'ruangan_list' => $ruangan_list,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'status' => $status,
                'ruangan' => $ruangan,
                'date_type' => $dateType,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function pengajuanKlaim(Request $request)
    {
        try {
            // Debug: Log semua data yang masuk
            Log::info('Data request pengajuan klaim:', [
                'all_data' => $request->all(),
                'jenis_kunjungan' => $request->get('jenis_kunjungan'),
                'jenis_kunjungan_type' => gettype($request->get('jenis_kunjungan'))
            ]);

            // Ambil data kunjungan untuk informasi tambahan
            $kunjungan = KunjunganBPJS::with([
                'penjamin.pendaftaran.pasien',
                'penjamin.pendaftaran.kunjungan_rs.ruangan'
            ])->where('noSEP', $request->get('nomor_sep'))->first();

            // Siapkan data untuk INACBG
            $metadata = [
                'method' => 'new_claim'
            ];

            $data = [
                'metadata' => $metadata,
                'data' => [
                    'nomor_kartu' => $request->get('nomor_kartu'),
                    'nomor_sep' => $request->get('nomor_sep'),
                    'nomor_rm' => $request->get('nomor_rm'),
                    'nama_pasien' => $request->get('nama_pasien'),
                    'tgl_lahir' => $request->get('tgl_lahir'), // TIMESTAMP
                    'gender' => $request->get('gender'), // 1 = LAKI-LAKI, 2 = PEREMPUAN
                    'tanggal_masuk' => $request->get('tanggal_masuk'),
                    'tanggal_keluar' => $request->get('tanggal_keluar'),
                    'ruangan' => $request->get('ruangan'),
                ]
            ];

            // Siapkan data untuk disimpan ke database
            $pengajuanData = [
                'nomor_sep' => $request->get('nomor_sep'),
                'tanggal_pengajuan' => now()->toDateString(),
                'norm' => $request->get('nomor_rm'),
                'nomor_kartu' => $request->get('nomor_kartu'),
                'nama_pasien' => $request->get('nama_pasien'),
                'gender' => $request->get('gender'),
                'tgl_lahir' => $request->get('tgl_lahir'),
                'tanggal_masuk' => $request->get('tanggal_masuk'),
                'tanggal_keluar' => $request->get('tanggal_keluar'),
                'ruangan' => $request->get('ruangan'),
                'jenis_kunjungan' => $request->get('jenis_kunjungan'),
                'status_pengiriman' => PengajuanKlaim::STATUS_TERSIMPAN,
            ];

            // Fallback ke data kunjungan jika parameter tidak ada
            if ($kunjungan && $kunjungan->penjamin && $kunjungan->penjamin->pendaftaran) {
                $kunjunganRs = $kunjungan->penjamin->pendaftaran->kunjungan_rs;
                if ($kunjunganRs && count($kunjunganRs) > 0) {
                    $firstKunjungan = $kunjunganRs->first();
                    
                    // Gunakan data dari kunjungan jika tidak ada di request
                    if (!$request->get('tanggal_masuk') && $firstKunjungan->MASUK) {
                        $pengajuanData['tanggal_masuk'] = date('Y-m-d', strtotime($firstKunjungan->MASUK));
                    }
                    
                    if (!$request->get('tanggal_keluar') && $firstKunjungan->KELUAR) {
                        $pengajuanData['tanggal_keluar'] = date('Y-m-d', strtotime($firstKunjungan->KELUAR));
                    }
                    
                    // Ambil nama ruangan jika tidak ada di request
                    if (!$request->get('ruangan')) {
                        $ruanganNames = $kunjunganRs->map(function($kr) {
                            return $kr->ruangan ? $kr->ruangan->DESKRIPSI : null;
                        })->filter()->unique()->implode(', ');
                        
                        $pengajuanData['ruangan'] = $ruanganNames;
                    }
                }
            }

            // Check if this is a force create (bypass API)
            if ($request->get('force_create')) {

                if ($kunjungan) {
                    KunjunganBPJS::where('noSEP', $kunjungan->noSEP)
                        ->update(['klaimStatus' => 1]); // Set sebagai sudah diklaim
                }
                
                // Skip API call and directly create pengajuan klaim
                $pengajuanData['status_pengiriman'] = PengajuanKlaim::STATUS_TERSIMPAN;
                $pengajuanData['response_message'] = 'Data disimpan tanpa mengirim ke API INACBG (Force Create)';
                $pengajuanData['response_data'] = ['force_create' => true, 'timestamp' => now()];
                
                PengajuanKlaim::create($pengajuanData);

                Log::info('Force Create Pengajuan Klaim', [
                    'nomor_sep' => $request->get('nomor_sep'),
                    'message' => 'Data disimpan tanpa API call',
                    'user_action' => 'force_create'
                ]);

                return redirect()->route('biaya.index')->with('success', 
                    'Data pengajuan klaim berhasil disimpan. Anda dapat mencoba mengirim ke API INACBG nanti.');
            }

            // Submit to INACBG API
            $inacbgResponse = InacbgHelper::hitApi($data, 'POST');
            
            Log::info('INACBG Response', [
                'nomor_sep' => $request->get('nomor_sep'),
                'response_structure' => [
                    'has_metadata' => isset($inacbgResponse['metadata']),
                    'metadata_code' => $inacbgResponse['metadata']['code'] ?? 'not_set',
                    'has_response' => isset($inacbgResponse['response']),
                ],
                'response' => $inacbgResponse['response'] ?? null,
                'error' => $inacbgResponse['error'] ?? null
            ]);
            
            // Jika response code bukan 200 (API error)
            if ($inacbgResponse['metadata']['code'] != 200) {
                Log::error('INACBG API Error', [
                    'nomor_sep' => $request->get('nomor_sep'),
                    'error_code' => $inacbgResponse['metadata']['code'],
                    'error_message' => $inacbgResponse['metadata']['message'] ?? 'Unknown error',
                    'full_response' => $inacbgResponse
                ]);
                
                // Return error untuk ditangani di frontend
                return back()->withErrors([
                    'message' => $inacbgResponse['metadata']['message'] ?? 'Error from INACBG API'
                ]);
            }

            // Jika response code 200 (sukses)
            if ($inacbgResponse['metadata']['code'] == 200) {
                // Update status kunjungan
                if ($kunjungan) {
                    KunjunganBPJS::where('noSEP', $kunjungan->noSEP)
                        ->update(['klaimStatus' => 1]); // Set sebagai sudah diklaim
                }

                // Simpan data pengajuan dengan status sukses
                $pengajuanData['status_pengiriman'] = PengajuanKlaim::STATUS_TERSIMPAN;
                $pengajuanData['response_message'] = $inacbgResponse['metadata']['message'] ?? 'Klaim berhasil diajukan';
                $pengajuanData['response_data'] = $inacbgResponse;
                
                PengajuanKlaim::create($pengajuanData);

                Log::info('INACBG Claim Success', [
                    'nomor_sep' => $request->get('nomor_sep'),
                    'success_message' => $inacbgResponse['metadata']['message'] ?? 'Success',
                    'response_data' => $inacbgResponse['response'] ?? null
                ]);

                return redirect()->route('biaya.index')->with('success', 
                    'Klaim berhasil diajukan ke INACBG: ' . ($inacbgResponse['metadata']['message'] ?? 'Berhasil'));
            }

        } catch (\Exception $e) {
            // Ensure $pengajuanData is defined for exception handling
            if (!isset($pengajuanData)) {
                $pengajuanData = [
                    'nomor_sep' => $request->get('nomor_sep'),
                    'tanggal_pengajuan' => now()->toDateString(),
                    'norm' => $request->get('nomor_rm'),
                    'nomor_kartu' => $request->get('nomor_kartu'),
                    'nama_pasien' => $request->get('nama_pasien'),
                    'gender' => $request->get('gender'),
                    'tgl_lahir' => $request->get('tgl_lahir'),
                    'tanggal_masuk' => $request->get('tanggal_masuk'),
                    'tanggal_keluar' => $request->get('tanggal_keluar'),
                    'ruangan' => $request->get('ruangan'),
                    'jenis_kunjungan' => $request->get('jenis_kunjungan'),
                ];
            }
            
            // Simpan data pengajuan dengan status 0 (default)
            $pengajuanData['status_pengiriman'] = PengajuanKlaim::STATUS_TERSIMPAN;
            $pengajuanData['response_message'] = 'Exception: ' . $e->getMessage();
            $pengajuanData['response_data'] = ['exception' => $e->getMessage(), 'trace' => $e->getTraceAsString()];
            
            PengajuanKlaim::create($pengajuanData);

            Log::error('Exception in pengajuanKlaim', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'noSEP' => $request->get('nomor_sep')
            ]);

            return redirect()->route('biaya.index')->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
