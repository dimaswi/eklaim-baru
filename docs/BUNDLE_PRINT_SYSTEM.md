# 📦 Medical Record Bundle Print System

## 🎯 Overview
Sistem bundle print yang memungkinkan user memilih dan mengurutkan dokumen medis dari satu pengajuan klaim untuk dicetak dalam urutan yang diinginkan.

## 📊 Data Structure

### Database Tables
```sql
-- Main reference table
pengajuan_klaim (
    id,
    nomor_sep,
    nama_pasien,
    norm,
    tanggal_masuk,
    tanggal_keluar,
    ruangan
)

-- Document tables (all linked by pengajuan_klaim_id)
rawat_jalan_pengkajian_awal
rawat_inap_pengkajian_awal  
ugd_pengkajian_awal
rawat_jalan_resume_medis
rawat_inap_resume_medis
ugd_resume_medis
ugd_triage
rawat_inap_balance_cairan
rawat_inap_cppt
hasil_laboratorium
hasil_radiologi
tagihans
```

### Document Categories
| Category | Documents | Type | Model Class |
|----------|-----------|------|-------------|
| **Pengkajian Awal** | Rawat Jalan | Single | `RawatJalanPengkajianAwal` |
| | Rawat Inap | Single | `RawatInapPengkajianAwal` |
| | UGD | Single | `UGDPengkajianAwal` |
| **Resume Medis** | Rawat Jalan | Single | `RawatJalanResumeMedis` |
| | Rawat Inap | Single | `RawatInapResumeMedis` |
| | UGD | Single | `UGDResumeMedis` |
| **Monitoring** | Triage | Single | `UGDTriage` |
| | Balance Cairan | Multiple | `RawatInapBalanceCairan` |
| | CPPT | Multiple | `RawatInapCPPT` |
| **Penunjang** | Lab Results | Multiple | `HasilLaboratorium` |
| | Radiology | Multiple | `HasilRadiologi` |
| **Finansial** | Tagihan | Single | `Tagihan` |

## 🏗️ System Architecture

### Backend Structure
```
app/Http/Controllers/
├── Eklaim/
│   └── BundlePrintController.php
├── Models/
│   └── BundleDocument.php
├── Services/
│   ├── DocumentCollectorService.php
│   └── PDFBundleService.php
└── Resources/
    └── Views/
        └── bundle-print/
            ├── cover.blade.php
            ├── document-template.blade.php
            └── index.blade.php
```

### Frontend Structure
```
resources/js/pages/eklaim/
├── bundle/
│   ├── index.tsx
│   ├── select.tsx
│   └── preview.tsx
└── components/
    ├── BundleDocumentSelector.tsx
    ├── OrderInput.tsx
    └── DocumentPreview.tsx
```

## 🔧 Implementation

### 1. Backend Implementation

#### Controller: `BundlePrintController.php`
```php
<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Services\DocumentCollectorService;
use App\Services\PDFBundleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BundlePrintController extends Controller
{
    protected $documentCollector;
    protected $pdfService;

    public function __construct(
        DocumentCollectorService $documentCollector,
        PDFBundleService $pdfService
    ) {
        $this->documentCollector = $documentCollector;
        $this->pdfService = $pdfService;
    }

    /**
     * Show bundle selection page
     */
    public function index()
    {
        $pengajuanList = PengajuanKlaim::with([
            'rawatJalanPengkajianAwal',
            'rawatInapPengkajianAwal',
            'ugdPengkajianAwal',
            'rawatJalanResumeMedis',
            'rawatInapResumeMedis',
            'ugdResumeMedis',
            'ugdTriage',
            'rawatInapBalanceCairan',
            'rawatInapCPPT',
            'hasilLaboratorium',
            'hasilRadiologi',
            'tagihan'
        ])->paginate(20);

        return Inertia::render('eklaim/bundle/index', [
            'pengajuanList' => $pengajuanList
        ]);
    }

    /**
     * Get available documents for specific pengajuan
     */
    public function getDocuments(PengajuanKlaim $pengajuan)
    {
        $documents = $this->documentCollector->getAvailableDocuments($pengajuan->id);
        
        return Inertia::render('eklaim/bundle/select', [
            'pengajuan' => $pengajuan,
            'documents' => $documents
        ]);
    }

    /**
     * Generate bundle based on selected documents and order
     */
    public function generateBundle(Request $request)
    {
        $request->validate([
            'pengajuan_klaim_id' => 'required|exists:pengajuan_klaim,id',
            'selected_documents' => 'required|array|min:1',
            'selected_documents.*.id' => 'required|string',
            'selected_documents.*.order' => 'required|integer|min:1',
            'options' => 'array'
        ]);

        $bundleFile = $this->pdfService->generateBundle(
            $request->pengajuan_klaim_id,
            $request->selected_documents,
            $request->options ?? []
        );

        return response()->download($bundleFile);
    }
}
```

#### Service: `DocumentCollectorService.php`
```php
<?php

namespace App\Services;

use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\RawatJalanPengkajianAwal;
use App\Models\Eklaim\RawatInapPengkajianAwal;
use App\Models\Eklaim\UGDPengkajianAwal;
use App\Models\Eklaim\RawatJalanResumeMedis;
use App\Models\Eklaim\RawatInapResumeMedis;
use App\Models\Eklaim\UGDResumeMedis;
use App\Models\Eklaim\UGDTriage;
use App\Models\Eklaim\RawatInapBalanceCairan;
use App\Models\Eklaim\RawatInapCPPT;
use App\Models\Eklaim\HasilLaboratorium;
use App\Models\Eklaim\HasilRadiologi;
use App\Models\Eklaim\Tagihan;

class DocumentCollectorService
{
    /**
     * Get all available documents for a pengajuan klaim
     */
    public function getAvailableDocuments($pengajuanKlaimId)
    {
        $documents = [];

        // Pengkajian Awal
        $documents[] = $this->checkDocument(
            'pengkajian_rawat_jalan',
            'Pengkajian Awal Rawat Jalan',
            'pengkajian',
            RawatJalanPengkajianAwal::class,
            $pengajuanKlaimId
        );

        $documents[] = $this->checkDocument(
            'pengkajian_rawat_inap',
            'Pengkajian Awal Rawat Inap',
            'pengkajian',
            RawatInapPengkajianAwal::class,
            $pengajuanKlaimId
        );

        $documents[] = $this->checkDocument(
            'pengkajian_ugd',
            'Pengkajian Awal UGD',
            'pengkajian',
            UGDPengkajianAwal::class,
            $pengajuanKlaimId
        );

        // Resume Medis
        $documents[] = $this->checkDocument(
            'resume_rawat_jalan',
            'Resume Medis Rawat Jalan',
            'resume',
            RawatJalanResumeMedis::class,
            $pengajuanKlaimId
        );

        $documents[] = $this->checkDocument(
            'resume_rawat_inap',
            'Resume Medis Rawat Inap',
            'resume',
            RawatInapResumeMedis::class,
            $pengajuanKlaimId
        );

        $documents[] = $this->checkDocument(
            'resume_ugd',
            'Resume Medis UGD',
            'resume',
            UGDResumeMedis::class,
            $pengajuanKlaimId
        );

        // Monitoring
        $documents[] = $this->checkDocument(
            'triage',
            'Triage UGD',
            'monitoring',
            UGDTriage::class,
            $pengajuanKlaimId
        );

        $documents[] = $this->checkDocument(
            'balance_cairan',
            'Balance Cairan',
            'monitoring',
            RawatInapBalanceCairan::class,
            $pengajuanKlaimId,
            true // multiple records
        );

        $documents[] = $this->checkDocument(
            'cppt',
            'CPPT',
            'monitoring',
            RawatInapCPPT::class,
            $pengajuanKlaimId,
            true // multiple records
        );

        // Penunjang
        $documents[] = $this->checkDocument(
            'hasil_lab',
            'Hasil Laboratorium',
            'penunjang',
            HasilLaboratorium::class,
            $pengajuanKlaimId,
            true // multiple records
        );

        $documents[] = $this->checkDocument(
            'hasil_radiologi',
            'Hasil Radiologi',
            'penunjang',
            HasilRadiologi::class,
            $pengajuanKlaimId,
            true // multiple records
        );

        // Finansial
        $documents[] = $this->checkDocument(
            'tagihan',
            'Tagihan',
            'finansial',
            Tagihan::class,
            $pengajuanKlaimId
        );

        return array_filter($documents); // Remove null values
    }

    /**
     * Check if document exists and return document info
     */
    private function checkDocument($id, $name, $category, $modelClass, $pengajuanKlaimId, $multiple = false)
    {
        $query = $modelClass::where('pengajuan_klaim_id', $pengajuanKlaimId);
        
        if ($multiple) {
            $data = $query->get();
            $status = $data->count() > 0 ? 'available' : 'empty';
            $count = $data->count();
            $lastUpdate = $data->max('updated_at');
        } else {
            $data = $query->first();
            $status = $data ? 'available' : 'empty';
            $count = $data ? 1 : 0;
            $lastUpdate = $data ? $data->updated_at : null;
        }

        return [
            'id' => $id,
            'name' => $name,
            'category' => $category,
            'status' => $status,
            'count' => $count,
            'last_update' => $lastUpdate,
            'data' => $data,
            'multiple' => $multiple
        ];
    }

    /**
     * Get document data by ID and pengajuan klaim ID
     */
    public function getDocumentData($documentId, $pengajuanKlaimId)
    {
        $modelMap = [
            'pengkajian_rawat_jalan' => RawatJalanPengkajianAwal::class,
            'pengkajian_rawat_inap' => RawatInapPengkajianAwal::class,
            'pengkajian_ugd' => UGDPengkajianAwal::class,
            'resume_rawat_jalan' => RawatJalanResumeMedis::class,
            'resume_rawat_inap' => RawatInapResumeMedis::class,
            'resume_ugd' => UGDResumeMedis::class,
            'triage' => UGDTriage::class,
            'balance_cairan' => RawatInapBalanceCairan::class,
            'cppt' => RawatInapCPPT::class,
            'hasil_lab' => HasilLaboratorium::class,
            'hasil_radiologi' => HasilRadiologi::class,
            'tagihan' => Tagihan::class,
        ];

        $multipleDocuments = ['balance_cairan', 'cppt', 'hasil_lab', 'hasil_radiologi'];

        if (!isset($modelMap[$documentId])) {
            return null;
        }

        $modelClass = $modelMap[$documentId];
        $query = $modelClass::where('pengajuan_klaim_id', $pengajuanKlaimId);

        if (in_array($documentId, $multipleDocuments)) {
            return $query->get();
        } else {
            return $query->first();
        }
    }
}
```

### 2. Frontend Implementation

#### Main Bundle Page: `index.tsx`
```tsx
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { FileText, Users, Calendar, Building } from 'lucide-react';

interface PengajuanKlaim {
    id: number;
    nomor_sep: string;
    nama_pasien: string;
    norm: string;
    tanggal_masuk: string;
    tanggal_keluar: string;
    ruangan: string;
    document_count: number;
}

interface Props extends SharedData {
    pengajuanList: {
        data: PengajuanKlaim[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function BundleIndexPage() {
    const { pengajuanList } = usePage<Props>().props;
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bundle Print', href: '/eklaim/bundle' }
    ];

    const formatTanggal = (tanggal: string) => {
        return new Date(tanggal).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bundle Print Medical Record" />
            
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Bundle Print Medical Record
                    </h1>
                    <p className="text-gray-600">
                        Pilih pengajuan klaim untuk membuat bundle print dokumen medis
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-600">Total Pengajuan</p>
                                <p className="text-2xl font-bold text-blue-900">{pengajuanList.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pengajuan List */}
                <div className="bg-white shadow-sm rounded-lg border">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Pengajuan Klaim</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nomor SEP
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pasien
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Periode Rawat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ruangan
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pengajuanList.data.map((pengajuan) => (
                                    <tr key={pengajuan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {pengajuan.nomor_sep}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        RM: {pengajuan.norm}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Users className="h-5 w-5 text-gray-400 mr-2" />
                                                <div className="text-sm font-medium text-gray-900">
                                                    {pengajuan.nama_pasien}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm text-gray-900">
                                                        {formatTanggal(pengajuan.tanggal_masuk)}
                                                    </div>
                                                    {pengajuan.tanggal_keluar && (
                                                        <div className="text-sm text-gray-500">
                                                            s/d {formatTanggal(pengajuan.tanggal_keluar)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Building className="h-5 w-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{pengajuan.ruangan}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Link
                                                href={`/eklaim/bundle/${pengajuan.id}/select`}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                Pilih Dokumen
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pengajuanList.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Menampilkan halaman {pengajuanList.current_page} dari {pengajuanList.last_page}
                            </div>
                            <div className="flex space-x-2">
                                {/* Pagination buttons would go here */}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
```

#### Document Selection Page: `select.tsx`
```tsx
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
    FileText, 
    Activity, 
    TestTube, 
    DollarSign, 
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Loader
} from 'lucide-react';

interface DocumentItem {
    id: string;
    name: string;
    category: string;
    status: 'available' | 'empty';
    count: number;
    last_update: string | null;
    multiple: boolean;
}

interface PengajuanKlaim {
    id: number;
    nomor_sep: string;
    nama_pasien: string;
    norm: string;
    tanggal_masuk: string;
    tanggal_keluar: string;
    ruangan: string;
}

interface SelectedDocument {
    id: string;
    order: number;
}

interface Props extends SharedData {
    pengajuan: PengajuanKlaim;
    documents: DocumentItem[];
}

export default function BundleSelectPage() {
    const { pengajuan, documents } = usePage<Props>().props;
    const [selectedDocs, setSelectedDocs] = useState<SelectedDocument[]>([]);
    const [loading, setLoading] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bundle Print', href: '/eklaim/bundle' },
        { title: `Select Documents - ${pengajuan.nomor_sep}`, href: '#' }
    ];

    const categoryIcons = {
        pengkajian: FileText,
        resume: FileText,
        monitoring: Activity,
        penunjang: TestTube,
        finansial: DollarSign
    };

    const categoryColors = {
        pengkajian: 'bg-blue-50 border-blue-200 text-blue-700',
        resume: 'bg-green-50 border-green-200 text-green-700',
        monitoring: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        penunjang: 'bg-purple-50 border-purple-200 text-purple-700',
        finansial: 'bg-red-50 border-red-200 text-red-700'
    };

    const handleDocumentToggle = (docId: string, checked: boolean) => {
        if (checked) {
            const nextOrder = Math.max(...selectedDocs.map(d => d.order), 0) + 1;
            setSelectedDocs(prev => [...prev, { id: docId, order: nextOrder }]);
        } else {
            setSelectedDocs(prev => {
                const filtered = prev.filter(d => d.id !== docId);
                return filtered.map((doc, index) => ({ ...doc, order: index + 1 }));
            });
        }
    };

    const handleOrderChange = (docId: string, newOrder: number) => {
        if (newOrder < 1 || newOrder > selectedDocs.length) return;

        setSelectedDocs(prev => {
            const updated = prev.map(doc => {
                if (doc.id === docId) {
                    return { ...doc, order: newOrder };
                }
                if (doc.order >= newOrder && doc.id !== docId) {
                    return { ...doc, order: doc.order + 1 };
                }
                return doc;
            });

            return updated.sort((a, b) => a.order - b.order)
                          .map((doc, index) => ({ ...doc, order: index + 1 }));
        });
    };

    const generateBundle = () => {
        if (selectedDocs.length === 0) {
            toast.error('Pilih minimal 1 dokumen');
            return;
        }

        setLoading(true);
        router.post('/eklaim/bundle/generate', {
            pengajuan_klaim_id: pengajuan.id,
            selected_documents: selectedDocs,
            options: {
                output_format: 'pdf',
                include_header: true,
                include_signature: true
            }
        }, {
            onSuccess: () => {
                toast.success('Bundle berhasil di-generate');
            },
            onError: (errors) => {
                console.error('Error generating bundle:', errors);
                toast.error('Gagal generate bundle');
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const getSelectedDoc = (docId: string) => {
        return selectedDocs.find(d => d.id === docId);
    };

    const getOrderedDocuments = () => {
        return selectedDocs
            .sort((a, b) => a.order - b.order)
            .map(sel => documents.find(doc => doc.id === sel.id))
            .filter(Boolean);
    };

    const formatTanggal = (tanggal: string) => {
        return new Date(tanggal).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const groupedDocuments = documents.reduce((acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, DocumentItem[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bundle Print - ${pengajuan.nomor_sep}`} />
            
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Pilih & Urutkan Dokumen
                            </h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {pengajuan.nama_pasien}
                                </span>
                                <span className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {pengajuan.nomor_sep}
                                </span>
                                <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatTanggal(pengajuan.tanggal_masuk)}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedDocs([])}
                                disabled={selectedDocs.length === 0}
                            >
                                Reset Pilihan
                            </Button>
                            <Button
                                onClick={generateBundle}
                                disabled={selectedDocs.length === 0 || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Generate Bundle ({selectedDocs.length})
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Document Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Dokumen Tersedia
                                </h2>
                                
                                {Object.entries(groupedDocuments).map(([category, docs]) => {
                                    const Icon = categoryIcons[category as keyof typeof categoryIcons];
                                    const colorClass = categoryColors[category as keyof typeof categoryColors];
                                    
                                    return (
                                        <div key={category} className="mb-6">
                                            <div className={`p-3 rounded-lg border ${colorClass} mb-3`}>
                                                <div className="flex items-center">
                                                    <Icon className="h-5 w-5 mr-2" />
                                                    <h3 className="font-medium capitalize">
                                                        {category.replace('_', ' ')}
                                                    </h3>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 ml-4">
                                                {docs.map((doc) => {
                                                    const selectedDoc = getSelectedDoc(doc.id);
                                                    const isSelected = !!selectedDoc;
                                                    
                                                    return (
                                                        <div
                                                            key={doc.id}
                                                            className={`flex items-center justify-between p-3 rounded border ${
                                                                isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                {/* Order Input */}
                                                                {isSelected ? (
                                                                    <div className="flex items-center">
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max={selectedDocs.length}
                                                                            value={selectedDoc.order}
                                                                            onChange={(e) => {
                                                                                const newOrder = parseInt(e.target.value);
                                                                                if (newOrder >= 1 && newOrder <= selectedDocs.length) {
                                                                                    handleOrderChange(doc.id, newOrder);
                                                                                }
                                                                            }}
                                                                            className="w-12 h-8 text-center border rounded text-sm"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-8 flex items-center justify-center text-gray-400 text-sm">
                                                                        [ _ ]
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Checkbox */}
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => handleDocumentToggle(doc.id, e.target.checked)}
                                                                    disabled={doc.status === 'empty'}
                                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                                                />
                                                                
                                                                {/* Document Info */}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className={`text-sm font-medium ${
                                                                            doc.status === 'empty' ? 'text-gray-400' : 'text-gray-900'
                                                                        }`}>
                                                                            {doc.name}
                                                                        </span>
                                                                        {doc.status === 'available' ? (
                                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                                        )}
                                                                    </div>
                                                                    {doc.multiple && doc.count > 0 && (
                                                                        <div className="text-xs text-gray-500">
                                                                            {doc.count} entries
                                                                        </div>
                                                                    )}
                                                                    {doc.last_update && (
                                                                        <div className="text-xs text-gray-500">
                                                                            Update: {formatTanggal(doc.last_update)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border sticky top-6">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Urutan Terpilih ({selectedDocs.length})
                                </h3>
                                
                                {selectedDocs.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Belum ada dokumen yang dipilih</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {getOrderedDocuments().map((doc, index) => (
                                            <div
                                                key={doc?.id}
                                                className="flex items-center space-x-3 p-2 rounded bg-blue-50 border border-blue-200"
                                            >
                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 text-sm text-gray-900">
                                                    {doc?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
```

### 3. Routes
```php
// routes/eklaim.php
Route::middleware('auth')->group(function () {
    // Bundle Print routes
    Route::get('/eklaim/bundle', [BundlePrintController::class, 'index'])
        ->name('eklaim.bundle.index')
        ->middleware('permission:pengajuan-klaim.view');
        
    Route::get('/eklaim/bundle/{pengajuan}/select', [BundlePrintController::class, 'getDocuments'])
        ->name('eklaim.bundle.select')
        ->middleware('permission:pengajuan-klaim.view');
        
    Route::post('/eklaim/bundle/generate', [BundlePrintController::class, 'generateBundle'])
        ->name('eklaim.bundle.generate')
        ->middleware('permission:pengajuan-klaim.view');
});
```

## 🎯 Features

### ✅ Implemented Features
- **Document Discovery**: Automatically scan all document types for each pengajuan klaim
- **Status Indicators**: Show available/empty status for each document type  
- **Dynamic Ordering**: User can select documents and assign custom order numbers
- **Real-time Preview**: Show selected documents in order before generating
- **Category Grouping**: Documents grouped by category (Pengkajian, Resume, Monitoring, etc.)
- **Multiple Document Support**: Handle documents with multiple entries (CPPT, Lab Results, etc.)

### 🔄 Workflow
1. **Select Pengajuan**: Choose from list of pengajuan klaims
2. **Pick Documents**: Check available documents and select desired ones
3. **Set Order**: Assign order numbers to selected documents  
4. **Preview**: Review the final order before generating
5. **Generate**: Create PDF bundle in specified order
6. **Download**: Download the generated bundle

### 📋 Next Steps
1. Implement PDF generation service (`PDFBundleService`)
2. Add document templates for consistent formatting
3. Create ZIP bundle option for separate files
4. Add Excel export for summary data
5. Implement bundle history and re-download feature

## 🚀 Ready for Implementation

The system architecture and data flow are now ready. Would you like me to proceed with implementing the PDF generation service or any other specific component?

---

## 🖨️ Bundle Print Output Examples

### Cover Page Template
```html
<div style="font-family: 'Helvetica', sans-serif; page-break-after: always;">
    <!-- Header/KOP -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
        <tbody>
            <tr>
                <td colspan="2" style="text-align: center; padding: 10px;">
                    <img src="[KOP_IMAGE_BASE64]" alt="Logo Klinik" style="width: 60px; height: 60px;" />
                </td>
                <td colspan="4" style="padding: 10px;">
                    <div style="line-height: 1.2;">
                        <h2 style="font-size: 18px; margin: 0; text-align: left;">
                            KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM
                        </h2>
                        <p style="font-size: 12px; margin: 5px 0; text-align: left;">
                            Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro<br />
                            Email: klinik.muh.kedungadem@gmail.com | WA: 082242244646
                        </p>
                    </div>
                </td>
            </tr>
            <tr style="background: black; color: white; text-align: center;">
                <td colspan="6" style="padding: 10px;">
                    <h2 style="font-size: 16px; margin: 0;">BUNDLE MEDICAL RECORD</h2>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Patient Info -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
        <tbody>
            <tr>
                <td style="border: 1px solid #000; padding: 8px; width: 25%; font-weight: bold;">
                    Nomor SEP
                </td>
                <td style="border: 1px solid #000; padding: 8px; width: 25%;">
                    [NOMOR_SEP]
                </td>
                <td style="border: 1px solid #000; padding: 8px; width: 25%; font-weight: bold;">
                    Nama Pasien
                </td>
                <td style="border: 1px solid #000; padding: 8px; width: 25%;">
                    [NAMA_PASIEN]
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">
                    No. RM
                </td>
                <td style="border: 1px solid #000; padding: 8px;">
                    [NORM]
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">
                    Tanggal Masuk
                </td>
                <td style="border: 1px solid #000; padding: 8px;">
                    [TANGGAL_MASUK]
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">
                    Ruangan
                </td>
                <td style="border: 1px solid #000; padding: 8px;">
                    [RUANGAN]
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">
                    Tanggal Keluar
                </td>
                <td style="border: 1px solid #000; padding: 8px;">
                    [TANGGAL_KELUAR]
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Document List -->
    <div style="margin-bottom: 20px;">
        <h3 style="background: #f0f0f0; padding: 10px; border: 1px solid #000; margin: 0;">
            DAFTAR DOKUMEN DALAM BUNDLE
        </h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">No</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Nama Dokumen</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Kategori</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Halaman</th>
                </tr>
            </thead>
            <tbody>
                <!-- Dynamic document list -->
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">1</td>
                    <td style="border: 1px solid #000; padding: 8px;">Pengkajian Awal Rawat Inap</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">Pengkajian</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">2-3</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">2</td>
                    <td style="border: 1px solid #000; padding: 8px;">CPPT</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">Monitoring</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">4-8</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">3</td>
                    <td style="border: 1px solid #000; padding: 8px;">Hasil Laboratorium</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">Penunjang</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">9-11</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">4</td>
                    <td style="border: 1px solid #000; padding: 8px;">Resume Medis Rawat Inap</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">Resume</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">12-13</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">5</td>
                    <td style="border: 1px solid #000; padding: 8px;">Tagihan</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">Finansial</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">14</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Footer -->
    <div style="margin-top: 40px;">
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%; text-align: center;">
                    <div style="margin-top: 60px; border-top: 1px solid #000; padding-top: 5px;">
                        Petugas Rekam Medis
                    </div>
                </td>
                <td style="width: 50%; text-align: center;">
                    <div>
                        Bojonegoro, [TANGGAL_CETAK]<br />
                        Kepala Klinik
                    </div>
                    <div style="margin-top: 60px; border-top: 1px solid #000; padding-top: 5px;">
                        Dr. [NAMA_DOKTER]
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>
```

### Document Page Template
```html
<div style="font-family: 'Helvetica', sans-serif; page-break-before: always;">
    <!-- Mini Header -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 15px;">
        <tbody>
            <tr>
                <td style="padding: 5px; text-align: center; width: 80px;">
                    <img src="[KOP_IMAGE_BASE64]" alt="Logo" style="width: 40px; height: 40px;" />
                </td>
                <td style="padding: 5px;">
                    <div style="line-height: 1.1;">
                        <h4 style="font-size: 14px; margin: 0;">KLINIK MUHAMMADIYAH KEDUNGADEM</h4>
                        <p style="font-size: 10px; margin: 2px 0;">Jl. PUK Desa Drokilo, Kedungadem, Bojonegoro</p>
                    </div>
                </td>
                <td style="padding: 5px; text-align: right; width: 150px;">
                    <div style="font-size: 10px;">
                        <strong>SEP:</strong> [NOMOR_SEP]<br />
                        <strong>RM:</strong> [NORM]<br />
                        <strong>Hal:</strong> [PAGE_NUMBER]
                    </div>
                </td>
            </tr>
            <tr style="background: #e9ecef;">
                <td colspan="3" style="padding: 8px; text-align: center;">
                    <h3 style="font-size: 14px; margin: 0; text-transform: uppercase;">
                        [DOCUMENT_TITLE]
                    </h3>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Document Content -->
    <div style="margin-bottom: 20px;">
        [DOCUMENT_CONTENT]
    </div>

    <!-- Page Footer -->
    <div style="position: fixed; bottom: 20px; width: 100%; text-align: center; font-size: 10px; color: #666;">
        Bundle Medical Record - [NAMA_PASIEN] - [NOMOR_SEP] - Halaman [PAGE_NUMBER]
    </div>
</div>
```

### Summary Page Template
```html
<div style="font-family: 'Helvetica', sans-serif; page-break-before: always;">
    <!-- Header -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
        <tbody>
            <tr>
                <td colspan="2" style="text-align: center; padding: 10px;">
                    <img src="[KOP_IMAGE_BASE64]" alt="Logo Klinik" style="width: 50px; height: 50px;" />
                </td>
                <td colspan="4" style="padding: 10px;">
                    <div style="line-height: 1.2;">
                        <h2 style="font-size: 16px; margin: 0;">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h2>
                        <p style="font-size: 11px; margin: 5px 0;">
                            Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro<br />
                            Email: klinik.muh.kedungadem@gmail.com | WA: 082242244646
                        </p>
                    </div>
                </td>
            </tr>
            <tr style="background: black; color: white;">
                <td colspan="6" style="padding: 10px; text-align: center;">
                    <h2 style="font-size: 14px; margin: 0;">RINGKASAN MEDICAL RECORD</h2>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Summary Content -->
    <div style="margin-bottom: 20px;">
        <h3 style="background: #f0f0f0; padding: 8px; border: 1px solid #000; margin: 0 0 10px 0;">
            RINGKASAN PERAWATAN
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
                <td style="padding: 5px; width: 25%; font-weight: bold;">Diagnosis Masuk:</td>
                <td style="padding: 5px; width: 75%;">[DIAGNOSIS_MASUK]</td>
            </tr>
            <tr>
                <td style="padding: 5px; font-weight: bold;">Diagnosis Keluar:</td>
                <td style="padding: 5px;">[DIAGNOSIS_KELUAR]</td>
            </tr>
            <tr>
                <td style="padding: 5px; font-weight: bold;">Tindakan Utama:</td>
                <td style="padding: 5px;">[TINDAKAN_UTAMA]</td>
            </tr>
            <tr>
                <td style="padding: 5px; font-weight: bold;">Lama Rawat:</td>
                <td style="padding: 5px;">[LAMA_RAWAT] hari</td>
            </tr>
            <tr>
                <td style="padding: 5px; font-weight: bold;">Kondisi Keluar:</td>
                <td style="padding: 5px;">[KONDISI_KELUAR]</td>
            </tr>
        </table>
    </div>

    <!-- Document Checklist -->
    <div style="margin-bottom: 20px;">
        <h3 style="background: #f0f0f0; padding: 8px; border: 1px solid #000; margin: 0 0 10px 0;">
            KELENGKAPAN DOKUMEN
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 11px;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="border: 1px solid #000; padding: 6px; text-align: left;">Jenis Dokumen</th>
                    <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 80px;">Status</th>
                    <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 100px;">Tanggal</th>
                    <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 80px;">Halaman</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000; padding: 6px;">Pengkajian Awal</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">✓ Ada</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">[TANGGAL]</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">2-3</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 6px;">CPPT</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">✓ Ada</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">[TANGGAL]</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">4-8</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 6px;">Balance Cairan</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">✗ Kosong</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">-</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">-</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 6px;">Hasil Lab</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">✓ Ada</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">[TANGGAL]</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">9-11</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 6px;">Resume Medis</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">✓ Ada</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">[TANGGAL]</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">12-13</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 6px;">Tagihan</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">✓ Ada</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">[TANGGAL]</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">14</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Total Summary -->
    <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
                <td style="width: 70%;"></td>
                <td style="width: 30%; border: 2px solid #000; padding: 10px; text-align: center; background: #f8f9fa;">
                    <strong>Total Halaman: [TOTAL_PAGES]</strong><br />
                    <strong>Total Dokumen: [TOTAL_DOCUMENTS]</strong>
                </td>
            </tr>
        </table>
    </div>

    <!-- Verification -->
    <div style="margin-top: 40px;">
        <table style="width: 100%; font-size: 11px;">
            <tr>
                <td style="width: 33%; text-align: center;">
                    <div>
                        Diperiksa oleh:<br />
                        Petugas RM
                    </div>
                    <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 5px;">
                        [NAMA_PETUGAS]
                    </div>
                </td>
                <td style="width: 33%; text-align: center;">
                    <div>
                        Diverifikasi oleh:<br />
                        Kepala RM
                    </div>
                    <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 5px;">
                        [NAMA_KEPALA_RM]
                    </div>
                </td>
                <td style="width: 33%; text-align: center;">
                    <div>
                        Bojonegoro, [TANGGAL_CETAK]<br />
                        Direktur Klinik
                    </div>
                    <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 5px;">
                        Dr. [NAMA_DIREKTUR]
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- QR Code for verification -->
    <div style="position: absolute; bottom: 20px; right: 20px;">
        <img src="[QR_CODE_BASE64]" alt="QR Verification" style="width: 60px; height: 60px;" />
        <div style="text-align: center; font-size: 8px; margin-top: 2px;">
            Bundle ID: [BUNDLE_ID]
        </div>
    </div>
</div>
```

### PDF Generation Service Implementation
```php
<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PDFBundleService
{
    protected $documentCollector;

    public function __construct(DocumentCollectorService $documentCollector)
    {
        $this->documentCollector = $documentCollector;
    }

    public function generateBundle($pengajuanKlaimId, $selectedDocuments, $options = [])
    {
        $pengajuan = \App\Models\Eklaim\PengajuanKlaim::find($pengajuanKlaimId);
        $bundleId = 'BDL-' . date('Ymd') . '-' . Str::random(6);
        
        // Sort documents by order
        usort($selectedDocuments, function($a, $b) {
            return $a['order'] <=> $b['order'];
        });

        $htmlContent = '';
        $pageNumber = 1;
        $documentList = [];

        // Get KOP image as base64
        $kopImagePath = public_path('images/kop.png');
        $kopBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($kopImagePath));

        // Generate cover page
        $htmlContent .= $this->generateCoverPage($pengajuan, $selectedDocuments, $kopBase64, $bundleId);
        $pageNumber++;

        // Generate each document
        foreach ($selectedDocuments as $index => $selectedDoc) {
            $documentData = $this->documentCollector->getDocumentData($selectedDoc['id'], $pengajuanKlaimId);
            
            if ($documentData) {
                $documentHtml = $this->generateDocumentPage(
                    $selectedDoc['id'], 
                    $documentData, 
                    $pengajuan, 
                    $kopBase64, 
                    $pageNumber
                );
                
                $htmlContent .= $documentHtml;
                
                // Calculate pages for this document
                $documentPages = $this->estimateDocumentPages($selectedDoc['id'], $documentData);
                $documentList[] = [
                    'order' => $index + 1,
                    'name' => $this->getDocumentName($selectedDoc['id']),
                    'category' => $this->getDocumentCategory($selectedDoc['id']),
                    'start_page' => $pageNumber,
                    'end_page' => $pageNumber + $documentPages - 1
                ];
                
                $pageNumber += $documentPages;
            }
        }

        // Generate summary page
        $htmlContent .= $this->generateSummaryPage($pengajuan, $documentList, $kopBase64, $bundleId);

        // Generate PDF
        $pdf = Pdf::loadHTML($htmlContent);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif'
        ]);

        // Save to storage
        $fileName = "bundle-{$bundleId}-{$pengajuan->nomor_sep}.pdf";
        $filePath = storage_path("app/public/bundles/{$fileName}");
        
        // Ensure directory exists
        if (!is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        $pdf->save($filePath);

        return $filePath;
    }

    private function generateCoverPage($pengajuan, $selectedDocuments, $kopBase64, $bundleId)
    {
        $documentListHtml = '';
        $pageCounter = 2; // Start after cover page

        foreach ($selectedDocuments as $index => $doc) {
            $docName = $this->getDocumentName($doc['id']);
            $category = $this->getDocumentCategory($doc['id']);
            $pages = $this->estimateDocumentPages($doc['id'], null);
            
            $documentListHtml .= "
                <tr>
                    <td style='border: 1px solid #000; padding: 8px; text-align: center;'>" . ($index + 1) . "</td>
                    <td style='border: 1px solid #000; padding: 8px;'>{$docName}</td>
                    <td style='border: 1px solid #000; padding: 8px; text-align: center;'>{$category}</td>
                    <td style='border: 1px solid #000; padding: 8px; text-align: center;'>{$pageCounter}" . 
                    ($pages > 1 ? "-" . ($pageCounter + $pages - 1) : "") . "</td>
                </tr>";
            
            $pageCounter += $pages;
        }

        return view('bundle-print.cover', [
            'pengajuan' => $pengajuan,
            'kopBase64' => $kopBase64,
            'bundleId' => $bundleId,
            'documentList' => $documentListHtml,
            'tanggalCetak' => now()->format('d F Y')
        ])->render();
    }

    private function generateDocumentPage($documentId, $documentData, $pengajuan, $kopBase64, $pageNumber)
    {
        $documentTitle = $this->getDocumentName($documentId);
        
        // Get the original document content based on document type
        $documentContent = $this->renderDocumentContent($documentId, $documentData, $pengajuan);

        return view('bundle-print.document-template', [
            'pengajuan' => $pengajuan,
            'kopBase64' => $kopBase64,
            'documentTitle' => $documentTitle,
            'documentContent' => $documentContent,
            'pageNumber' => $pageNumber
        ])->render();
    }

    private function generateSummaryPage($pengajuan, $documentList, $kopBase64, $bundleId)
    {
        return view('bundle-print.summary', [
            'pengajuan' => $pengajuan,
            'kopBase64' => $kopBase64,
            'bundleId' => $bundleId,
            'documentList' => $documentList,
            'totalPages' => array_sum(array_column($documentList, 'end_page')) - array_sum(array_column($documentList, 'start_page')) + count($documentList) + 2, // +2 for cover and summary
            'totalDocuments' => count($documentList),
            'tanggalCetak' => now()->format('d F Y')
        ])->render();
    }

    private function renderDocumentContent($documentId, $documentData, $pengajuan)
    {
        // This would render the actual document content
        // Similar to how individual medical records are currently rendered
        switch ($documentId) {
            case 'pengkajian_rawat_inap':
                return view('eklaim.medicalrecord.rawat-inap.pengkajian-awal-print', [
                    'data' => $documentData,
                    'pengajuan' => $pengajuan
                ])->render();
                
            case 'resume_rawat_inap':
                return view('eklaim.medicalrecord.rawat-inap.resume-medis-print', [
                    'data' => $documentData,
                    'pengajuan' => $pengajuan
                ])->render();
                
            case 'tagihan':
                return view('eklaim.tagihan.print', [
                    'data' => $documentData,
                    'pengajuan' => $pengajuan
                ])->render();
                
            // Add other document types...
            default:
                return '<p>Document content not available</p>';
        }
    }

    private function getDocumentName($documentId)
    {
        $names = [
            'pengkajian_rawat_jalan' => 'Pengkajian Awal Rawat Jalan',
            'pengkajian_rawat_inap' => 'Pengkajian Awal Rawat Inap',
            'pengkajian_ugd' => 'Pengkajian Awal UGD',
            'resume_rawat_jalan' => 'Resume Medis Rawat Jalan',
            'resume_rawat_inap' => 'Resume Medis Rawat Inap',
            'resume_ugd' => 'Resume Medis UGD',
            'triage' => 'Triage UGD',
            'balance_cairan' => 'Balance Cairan',
            'cppt' => 'CPPT',
            'hasil_lab' => 'Hasil Laboratorium',
            'hasil_radiologi' => 'Hasil Radiologi',
            'tagihan' => 'Tagihan',
        ];

        return $names[$documentId] ?? 'Unknown Document';
    }

    private function getDocumentCategory($documentId)
    {
        $categories = [
            'pengkajian_rawat_jalan' => 'Pengkajian',
            'pengkajian_rawat_inap' => 'Pengkajian',
            'pengkajian_ugd' => 'Pengkajian',
            'resume_rawat_jalan' => 'Resume',
            'resume_rawat_inap' => 'Resume',
            'resume_ugd' => 'Resume',
            'triage' => 'Monitoring',
            'balance_cairan' => 'Monitoring',
            'cppt' => 'Monitoring',
            'hasil_lab' => 'Penunjang',
            'hasil_radiologi' => 'Penunjang',
            'tagihan' => 'Finansial',
        ];

        return $categories[$documentId] ?? 'Lainnya';
    }

    private function estimateDocumentPages($documentId, $documentData)
    {
        // Estimate pages based on document type and content
        $estimates = [
            'pengkajian_rawat_jalan' => 2,
            'pengkajian_rawat_inap' => 3,
            'pengkajian_ugd' => 2,
            'resume_rawat_jalan' => 1,
            'resume_rawat_inap' => 2,
            'resume_ugd' => 1,
            'triage' => 1,
            'balance_cairan' => 2,
            'cppt' => 3,
            'hasil_lab' => 2,
            'hasil_radiologi' => 1,
            'tagihan' => 1,
        ];

        return $estimates[$documentId] ?? 1;
    }
}
```

### Blade Templates

#### `resources/views/bundle-print/cover.blade.php`
```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 20px; }
        .page-break { page-break-after: always; }
        table { border-collapse: collapse; }
    </style>
</head>
<body>
    <div class="page-break">
        <!-- Cover page content using the HTML template above -->
        <!-- Replace placeholders with actual data -->
        {!! str_replace([
            '[KOP_IMAGE_BASE64]',
            '[NOMOR_SEP]',
            '[NAMA_PASIEN]',
            '[NORM]',
            '[TANGGAL_MASUK]',
            '[TANGGAL_KELUAR]',
            '[RUANGAN]',
            '[TANGGAL_CETAK]'
        ], [
            $kopBase64,
            $pengajuan->nomor_sep,
            $pengajuan->nama_pasien,
            $pengajuan->norm,
            $pengajuan->tanggal_masuk,
            $pengajuan->tanggal_keluar,
            $pengajuan->ruangan,
            $tanggalCetak
        ], $documentList) !!}
    </div>
</body>
</html>
```

## 📋 Individual Document KOP Headers

### 🎯 KOP Header Preservation
Setiap dokumen dalam bundle mempertahankan KOP header asli mereka, bukan menggunakan satu KOP cover page yang sama. Ini memastikan setiap dokumen tetap memiliki identitas dan format aslinya.

### 📑 Format KOP Per Dokumen

#### Pengkajian Awal UGD
```html
<table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
    <tbody>
        <tr>
            <td colspan="6" style="text-align: center; padding: 10px;">
                <img src="[KOP_IMAGE_BASE64]" alt="Logo Klinik" style="width: 60px; height: 60px;" />
                <h2 style="font-size: 18px; margin: 5px 0;">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h2>
                <p style="font-size: 12px; margin: 0;">Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro</p>
            </td>
        </tr>
        <tr style="background: #f0f0f0; text-align: center;">
            <td colspan="6" style="padding: 10px;">
                <h3 style="font-size: 16px; margin: 0;">PENGKAJIAN AWAL UGD</h3>
            </td>
        </tr>
    </tbody>
</table>
```

#### Pengkajian Awal Rawat Inap
```html
<table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
    <tbody>
        <tr>
            <td colspan="6" style="text-align: center; padding: 10px;">
                <img src="[KOP_IMAGE_BASE64]" alt="Logo Klinik" style="width: 60px; height: 60px;" />
                <h2 style="font-size: 18px; margin: 5px 0;">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h2>
                <p style="font-size: 12px; margin: 0;">Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro</p>
            </td>
        </tr>
        <tr style="background: #e6f3ff; text-align: center;">
            <td colspan="6" style="padding: 10px;">
                <h3 style="font-size: 16px; margin: 0;">PENGKAJIAN AWAL RAWAT INAP</h3>
            </td>
        </tr>
    </tbody>
</table>
```

#### Resume Medis
```html
<table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
    <tbody>
        <tr>
            <td colspan="6" style="text-align: center; padding: 10px;">
                <img src="[KOP_IMAGE_BASE64]" alt="Logo Klinik" style="width: 60px; height: 60px;" />
                <h2 style="font-size: 18px; margin: 5px 0;">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h2>
                <p style="font-size: 12px; margin: 0;">Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro</p>
            </td>
        </tr>
        <tr style="background: #fff2e6; text-align: center;">
            <td colspan="6" style="padding: 10px;">
                <h3 style="font-size: 16px; margin: 0;">RESUME MEDIS</h3>
            </td>
        </tr>
    </tbody>
</table>
```

#### CPPT (Catatan Perkembangan Pasien Terintegrasi)
```html
<table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
    <tbody>
        <tr>
            <td colspan="6" style="text-align: center; padding: 10px;">
                <img src="[KOP_IMAGE_BASE64]" alt="Logo Klinik" style="width: 60px; height: 60px;" />
                <h2 style="font-size: 18px; margin: 5px 0;">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h2>
                <p style="font-size: 12px; margin: 0;">Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro</p>
            </td>
        </tr>
        <tr style="background: #f0fff0; text-align: center;">
            <td colspan="6" style="padding: 10px;">
                <h3 style="font-size: 16px; margin: 0;">CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT)</h3>
            </td>
        </tr>
    </tbody>
</table>
```

### 🔧 Implementation dalam Bundle Print Service

```php
class BundlePrintService
{
    private function generateDocumentKOP($documentType, $kopBase64)
    {
        $headers = [
            'pengkajian_awal_ugd' => [
                'title' => 'PENGKAJIAN AWAL UGD',
                'background' => '#f0f0f0'
            ],
            'pengkajian_awal_rawat_inap' => [
                'title' => 'PENGKAJIAN AWAL RAWAT INAP',
                'background' => '#e6f3ff'
            ],
            'resume_medis' => [
                'title' => 'RESUME MEDIS',
                'background' => '#fff2e6'
            ],
            'cppt' => [
                'title' => 'CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT)',
                'background' => '#f0fff0'
            ],
            'balance_cairan' => [
                'title' => 'BALANCE CAIRAN',
                'background' => '#ffe6f0'
            ],
            'triage_ugd' => [
                'title' => 'TRIAGE UGD',
                'background' => '#ffeeee'
            ],
            'laboratorium' => [
                'title' => 'HASIL LABORATORIUM',
                'background' => '#f5f5f5'
            ],
            'radiologi' => [
                'title' => 'HASIL RADIOLOGI',
                'background' => '#e6ffe6'
            ]
        ];

        $header = $headers[$documentType] ?? [
            'title' => 'DOKUMEN MEDIS',
            'background' => '#ffffff'
        ];

        return $this->generateKOPTemplate($kopBase64, $header['title'], $header['background']);
    }

    private function generateKOPTemplate($kopBase64, $title, $backgroundColor)
    {
        return "
        <table style='width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;'>
            <tbody>
                <tr>
                    <td colspan='6' style='text-align: center; padding: 10px;'>
                        <img src='{$kopBase64}' alt='Logo Klinik' style='width: 60px; height: 60px;' />
                        <h2 style='font-size: 18px; margin: 5px 0;'>KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h2>
                        <p style='font-size: 12px; margin: 0;'>Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro</p>
                    </td>
                </tr>
                <tr style='background: {$backgroundColor}; text-align: center;'>
                    <td colspan='6' style='padding: 10px;'>
                        <h3 style='font-size: 16px; margin: 0;'>{$title}</h3>
                    </td>
                </tr>
            </tbody>
        </table>";
    }
}
```

### 📊 Keuntungan Individual KOP Headers

1. **Identitas Dokumen**: Setiap dokumen mudah diidentifikasi tanpa melihat cover page
2. **Format Asli**: Mempertahankan tampilan asli setiap jenis dokumen medis
3. **Standar Medis**: Mengikuti standar dokumentasi medis yang berlaku
4. **Kemudahan Audit**: Auditor dapat langsung mengidentifikasi jenis dokumen
5. **Fleksibilitas Print**: Dokumen bisa dicetak individual tanpa kehilangan identitas

## 📋 Implementation Benefits

### ✅ Professional Output
- **Individual Branding**: Each document maintains its original KOP header and identity
- **Professional Layout**: Clean, medical-grade formatting per document type
- **Document Integrity**: Page numbers, headers, and verification elements per document

### ✅ Comprehensive Content
- **Cover Page**: Complete document index with page references
- **Individual Documents**: Full content with mini-headers for context
- **Summary Page**: Document checklist and verification signatures

### ✅ Practical Features
- **Custom Ordering**: Documents appear in user-specified sequence
- **Page Management**: Automatic page numbering and references
- **Verification**: QR codes and signature blocks for authenticity
- **File Management**: Organized storage with unique bundle IDs
