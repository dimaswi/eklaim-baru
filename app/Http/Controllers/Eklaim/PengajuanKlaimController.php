<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PengajuanKlaimController extends Controller
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
        $hasQuery = $request->get('has_query', '');

        // Get list of ruangan for filter dropdown
        $ruangan_list = \App\Models\SIMRS\Ruangan::whereIn('JENIS_KUNJUNGAN', [1, 2, 3])
            ->where('JENIS', 5)
            ->orderBy('DESKRIPSI')
            ->get(['ID', 'DESKRIPSI', 'JENIS_KUNJUNGAN']);

        // If no query has been made (initial page load), return empty data
        if (empty($hasQuery)) {
            return Inertia::render('eklaim/pengajuan/index', [
                'pengajuan_klaim' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                ],
                'ruangan_list' => $ruangan_list,
                'filters' => [
                    'search' => $search,
                    'perPage' => $perPage,
                    'status' => $status,
                    'ruangan' => $ruangan,
                    'date_type' => $dateType,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'hasQuery' => false,
            ]);
        }

        $query = PengajuanKlaim::query()
        ->with([
            'penjamin.perencanaan_rawat_inap.kunjungan_rs.pendaftaran.kunjungan_rs.ruangan', 
            'penjamin.pendaftaran.kunjungan_rs.ruangan', 
            'penjamin.kunjungan_bpjs'
        ]);

        // Search filter
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('nama_pasien', 'like', '%' . $search . '%')
                  ->orWhere('nomor_sep', 'like', '%' . $search . '%')
                  ->orWhere('norm', 'like', '%' . $search . '%');
            });
        }

        // Status filter
        if (!empty($status) && $status !== 'all') {
            $query->where('status_pengiriman', $status);
        }

        // Ruangan filter
        if (!empty($ruangan) && $ruangan !== 'all') {
            $query->where('ruangan', 'like', '%' . $ruangan . '%');
        }

        // Date range filter
        if (!empty($startDate) || !empty($endDate)) {
            $dateColumn = $dateType === 'keluar' ? 'tanggal_keluar' : 'tanggal_masuk';
            
            if (!empty($startDate)) {
                $query->whereDate($dateColumn, '>=', $startDate);
            }
            if (!empty($endDate)) {
                $query->whereDate($dateColumn, '<=', $endDate);
            }
        }

        $pengajuan_klaim = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Append query parameters to pagination links
        $pengajuan_klaim->appends($request->query());

        return Inertia::render('eklaim/pengajuan/index', [
            'pengajuan_klaim' => $pengajuan_klaim,
            'ruangan_list' => $ruangan_list,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'status' => $status,
                'ruangan' => $ruangan,
                'date_type' => $dateType,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'hasQuery' => true,
        ]);
    }

    public function show($id)
    {
        $pengajuan_klaim = PengajuanKlaim::with([
            'penjamin.perencanaan_rawat_inap.kunjungan_rs.pendaftaran.kunjungan_rs.ruangan',
            'penjamin.perencanaan_rawat_inap.kunjungan_rs.pendaftaran.kunjungan_rs.pasien_pulang.cara_pulang',
            'penjamin.pendaftaran.kunjungan_rs.ruangan',
            'penjamin.pendaftaran.kunjungan_rs.pasien_pulang.cara_pulang'
        ])->findOrFail($id);

        return Inertia::render('eklaim/pengajuan/rm', [
            'pengajuan_klaim' => $pengajuan_klaim
        ]);
    }
}
