import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    FileText, 
    Download, 
    Eye, 
    Package, 
    Calendar,
    User,
    MapPin,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Loader
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PengajuanKlaim {
    id: number;
    nomor_sep: string;
    nama_pasien: string;
    norm: string;
    tanggal_masuk: string;
    tanggal_keluar: string;
    ruangan: string;
    status_pengiriman: number;
}

interface MedicalRecord {
    title: string;
    icon: string;
    type: string;
    data: any[];
    records?: any[];
    count: number;
    available: boolean;
}

interface MedicalRecords {
    [key: string]: MedicalRecord;
}

interface PageProps {
    pengajuanKlaim: PengajuanKlaim;
    medicalRecords: MedicalRecords;
    [key: string]: any;
}

interface PDFDocument {
    id: string;
    type: string;
    title: string;
    icon: string;
    isSelected: boolean;
    selectionOrder: number | null;
    available: boolean;
    count: number;
    hasRecords?: boolean; // For lab and radiologi expandable rows
    selectedRecords?: string[]; // Selected individual records
}

export default function PrintBundleIndex() {
    const { pengajuanKlaim, medicalRecords } = usePage<PageProps>().props;
    
    const [documents, setDocuments] = useState<PDFDocument[]>(() => {
        return Object.entries(medicalRecords).map(([key, record]) => ({
            id: key,
            type: key,
            title: record.title,
            icon: record.icon,
            isSelected: false,
            selectionOrder: null,
            available: record.available,
            count: record.count,
            hasRecords: key === 'laboratorium' || key === 'radiologi' || key === 'resume_medis' || key === 'pengkajian_awal',
            selectedRecords: [],
        }));
    });
    
    const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<PDFDocument | null>(null);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: 'preview' | 'download' | null }>({});

    const toggleExpandRow = (docId: string) => {
        setExpandedRows(prev => 
            prev.includes(docId) 
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const toggleRecordSelection = (docId: string, recordId: string) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === docId) {
                const selectedRecords = doc.selectedRecords || [];
                const newSelectedRecords = selectedRecords.includes(recordId)
                    ? selectedRecords.filter(id => id !== recordId)
                    : [...selectedRecords, recordId];
                
                return { ...doc, selectedRecords: newSelectedRecords };
            }
            return doc;
        }));
    };

    const toggleAllRecordsForDocument = (docId: string, allRecords: any[]) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === docId) {
                const allRecordIds = allRecords.map(record => record.id.toString());
                const selectedRecords = doc.selectedRecords || [];
                const allSelected = allRecordIds.every(id => selectedRecords.includes(id));
                
                return { 
                    ...doc, 
                    selectedRecords: allSelected ? [] : allRecordIds 
                };
            }
            return doc;
        }));
    };

    const getSelectedRecordsCount = (docId: string) => {
        const doc = documents.find(d => d.id === docId);
        return doc?.selectedRecords?.length || 0;
    };

    const toggleDocument = (docId: string) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === docId) {
                if (doc.isSelected) {
                    // Unselecting - remove from order
                    setSelectionOrder(order => order.filter(id => id !== docId));
                    return { ...doc, isSelected: false, selectionOrder: null };
                } else {
                    // Selecting - add to order
                    const newOrder = selectionOrder.length + 1;
                    setSelectionOrder(order => [...order, docId]);
                    return { ...doc, isSelected: true, selectionOrder: newOrder };
                }
            }
            return doc;
        }));
    };

    const reorderDocument = (dragIndex: number, hoverIndex: number) => {
        const newOrder = [...selectionOrder];
        const draggedItem = newOrder[dragIndex];
        newOrder.splice(dragIndex, 1);
        newOrder.splice(hoverIndex, 0, draggedItem);
        setSelectionOrder(newOrder);
        
        // Update selection order numbers
        setDocuments(prev => prev.map(doc => {
            const orderIndex = newOrder.indexOf(doc.id);
            return orderIndex >= 0 ? { ...doc, selectionOrder: orderIndex + 1 } : doc;
        }));
    };

    const getSelectedDocuments = () => {
        return selectionOrder
            .map(id => documents.find(doc => doc.id === id))
            .filter(Boolean) as PDFDocument[];
    };

    const handlePreview = async (doc: PDFDocument) => {
        setLoadingStates(prev => ({ ...prev, [doc.id]: 'preview' }));
        try {
            // Prepare selected records data for this specific document
            const selectedRecordsData: { [key: string]: string[] } = {};
            if (doc.selectedRecords && doc.selectedRecords.length > 0) {
                selectedRecordsData[doc.type] = doc.selectedRecords;
            }

            const response = await fetch(`/eklaim/print-bundle/${pengajuanKlaim.id}/preview?type=${doc.type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    selected_records: selectedRecordsData,
                }),
            });
            const htmlContent = await response.text();
            
            // Open preview in new window
            const previewWindow = window.open('', '_blank', 'width=800,height=600');
            if (previewWindow) {
                previewWindow.document.write(htmlContent);
                previewWindow.document.close();
            }
        } catch (error) {
            console.error('Error loading preview:', error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [doc.id]: null }));
        }
    };

    const handleDownloadIndividual = async (doc: PDFDocument) => {
        setLoadingStates(prev => ({ ...prev, [doc.id]: 'download' }));
        try {
            // Prepare selected records data for this specific document
            const selectedRecordsData: { [key: string]: string[] } = {};
            if (doc.selectedRecords && doc.selectedRecords.length > 0) {
                selectedRecordsData[doc.type] = doc.selectedRecords;
            }

            const response = await fetch(`/eklaim/print-bundle/${pengajuanKlaim.id}/pdf?type=${doc.type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    selected_records: selectedRecordsData,
                }),
            });
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = globalThis.document.createElement('a');
            a.href = url;
            a.download = `${doc.title}-${pengajuanKlaim.nomor_sep}.pdf`;
            globalThis.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            globalThis.document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [doc.id]: null }));
        }
    };

    const handleGenerateBundle = async () => {
        if (selectionOrder.length === 0) return;
        
        setIsGenerating(true);
        try {
            // Prepare selected records data
            const selectedRecordsData: { [key: string]: string[] } = {};
            documents.forEach(doc => {
                if (doc.isSelected && doc.selectedRecords && doc.selectedRecords.length > 0) {
                    selectedRecordsData[doc.type] = doc.selectedRecords;
                }
            });

            const response = await fetch(`/eklaim/print-bundle/${pengajuanKlaim.id}/bundle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    document_types: selectionOrder,
                    selected_records: selectedRecordsData,
                }),
            });
            
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = globalThis.document.createElement('a');
            a.href = url;
            a.download = `medical-records-${pengajuanKlaim.nomor_sep}-${new Date().toISOString().slice(0, 10)}.pdf`;
            globalThis.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            globalThis.document.body.removeChild(a);
        } catch (error) {
            console.error('Error generating bundle:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getStatusBadge = (status: number) => {
        const statusMap = {
            0: { label: 'Default', className: 'bg-gray-100 text-gray-800' },
            1: { label: 'Tersimpan', className: 'bg-blue-100 text-blue-800' },
            2: { label: 'Grouper', className: 'bg-yellow-100 text-yellow-800' },
            3: { label: 'Grouper Stage 2', className: 'bg-orange-100 text-orange-800' },
            4: { label: 'Final', className: 'bg-purple-100 text-purple-800' },
            5: { label: 'Kirim', className: 'bg-green-100 text-green-800' },
        };
        
        const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0];
        return (
            <Badge className={statusInfo.className}>
                {statusInfo.label}
            </Badge>
        );
    };

    const availableDocuments = documents.filter(doc => doc.available);
    const unavailableDocuments = documents.filter(doc => !doc.available);

    return (
        <AppLayout>
            <Head title={`Print Bundle - ${pengajuanKlaim.nomor_sep}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Medical Records Print Bundle</h1>
                    <p className="text-gray-600">Select and combine medical documents into a single PDF</p>
                </div>

                {/* Patient Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Pasien
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">No. SEP</label>
                                <p className="font-semibold">{pengajuanKlaim.nomor_sep}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nama Pasien</label>
                                <p className="font-semibold">{pengajuanKlaim.nama_pasien}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">No. RM</label>
                                <p className="font-semibold">{pengajuanKlaim.norm}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="mt-1">
                                    {getStatusBadge(pengajuanKlaim.status_pengiriman)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tanggal Masuk</label>
                                <p className="font-semibold flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(pengajuanKlaim.tanggal_masuk).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tanggal Keluar</label>
                                <p className="font-semibold flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {pengajuanKlaim.tanggal_keluar ? new Date(pengajuanKlaim.tanggal_keluar).toLocaleDateString('id-ID') : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Ruangan</label>
                                <p className="font-semibold flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {pengajuanKlaim.ruangan || '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Documents - Table Format */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Available Documents ({availableDocuments.length})
                        </CardTitle>
                        <CardDescription>
                            Select documents to include in the bundle. Documents will be merged in the order you select them.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-200 p-3 text-left">
                                            <Checkbox 
                                                checked={availableDocuments.length > 0 && availableDocuments.every(doc => doc.isSelected)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        // Select all available documents
                                                        availableDocuments.forEach(doc => {
                                                            if (!doc.isSelected) {
                                                                toggleDocument(doc.id);
                                                            }
                                                        });
                                                    } else {
                                                        // Deselect all documents
                                                        setSelectionOrder([]);
                                                        setDocuments(prev => prev.map(doc => ({ 
                                                            ...doc, 
                                                            isSelected: false, 
                                                            selectionOrder: null 
                                                        })));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            Select
                                        </th>
                                        <th className="border border-gray-200 p-3 text-left">Order</th>
                                        <th className="border border-gray-200 p-3 text-left">Document Type</th>
                                        <th className="border border-gray-200 p-3 text-center">Records</th>
                                        <th className="border border-gray-200 p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableDocuments.map(doc => (
                                        <React.Fragment key={doc.id}>
                                            <tr 
                                                className={cn(
                                                    "hover:bg-gray-50 transition-colors",
                                                    doc.isSelected ? "bg-blue-50 border-blue-200" : ""
                                                )}
                                            >
                                                <td className="border border-gray-200 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox 
                                                            checked={doc.isSelected}
                                                            onCheckedChange={() => toggleDocument(doc.id)}
                                                        />
                                                        {doc.hasRecords && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleExpandRow(doc.id)}
                                                                className="p-1 h-6 w-6"
                                                            >
                                                                {expandedRows.includes(doc.id) ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="border border-gray-200 p-3 text-center">
                                                    {doc.isSelected && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            #{doc.selectionOrder}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="border border-gray-200 p-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{doc.icon}</span>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {doc.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {doc.type}
                                                            </div>
                                                            {doc.hasRecords && doc.selectedRecords && doc.selectedRecords.length > 0 && (
                                                                <div className="text-xs text-blue-600 mt-1">
                                                                    {doc.selectedRecords.length} records selected
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-200 p-3 text-center">
                                                    <Badge variant="outline" className="text-xs">
                                                        {doc.count} record{doc.count !== 1 ? 's' : ''}
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 p-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handlePreview(doc)}
                                                            className="flex items-center gap-1"
                                                            disabled={loadingStates[doc.id] === 'preview'}
                                                        >
                                                            {loadingStates[doc.id] === 'preview' ? (
                                                                <Loader className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Eye className="h-3 w-3" />
                                                            )}
                                                            Preview
                                                        </Button>
                                                        
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDownloadIndividual(doc)}
                                                            className="flex items-center gap-1"
                                                            disabled={loadingStates[doc.id] === 'download'}
                                                        >
                                                            {loadingStates[doc.id] === 'download' ? (
                                                                <Loader className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Download className="h-3 w-3" />
                                                            )}
                                                            PDF
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            
                                            {/* Expanded Row - Show individual records */}
                                            {expandedRows.includes(doc.id) && doc.hasRecords && medicalRecords[doc.type]?.data && (
                                                <tr>
                                                    <td colSpan={5} className="border border-gray-200 p-0">
                                                        <div className="bg-gray-50 p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-medium text-gray-900">Select Individual Records:</h4>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => toggleAllRecordsForDocument(doc.id, medicalRecords[doc.type].data || [])}
                                                                    className="text-xs"
                                                                >
                                                                    {(doc.selectedRecords?.length === medicalRecords[doc.type].data?.length) ? 'Deselect All' : 'Select All'}
                                                                </Button>
                                                            </div>
                                                            
                                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                {medicalRecords[doc.type].data?.map((record: any) => (
                                                                    <div key={record.id} className="flex items-start gap-3 p-2 bg-white rounded border">
                                                                        <Checkbox
                                                                            checked={doc.selectedRecords?.includes(record.id.toString()) || false}
                                                                            onCheckedChange={() => toggleRecordSelection(doc.id, record.id.toString())}
                                                                            className="mt-0.5"
                                                                        />
                                                                        <div className="flex-1 text-sm">
                                                                            {doc.type === 'laboratorium' ? (
                                                                                <div>
                                                                                    <div className="font-medium">
                                                                                        {record.kunjungan_nomor}
                                                                                        {record.is_fiktif && (
                                                                                            <Badge variant="destructive" className="ml-2 text-xs">FIKTIF</Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-gray-600">
                                                                                        Tanggal: {record.created_at ? new Date(record.created_at).toLocaleDateString('id-ID') : '-'} | 
                                                                                        Jumlah Tindakan: {record.tindakan_medis_data.hasil_laboratorium ? record.tindakan_medis_data.hasil_laboratorium.length : 0}
                                                                                    </div>
                                                                                </div>
                                                                            ) : doc.type === 'radiologi' ? (
                                                                                <div>
                                                                                    <div className="font-medium">
                                                                                        {(() => {
                                                                                            try {
                                                                                                const parsedData = JSON.parse(record.nama_tindakan || '{}');
                                                                                                return parsedData.NAMA || `Record Radiologi #${record.id}`;
                                                                                            } catch (e) {
                                                                                                return `Record Radiologi #${record.id}`;
                                                                                            }
                                                                                        })()}
                                                                                        {record.is_fiktif && (
                                                                                            <Badge variant="destructive" className="ml-2 text-xs">FIKTIF</Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-gray-600">
                                                                                        Tanggal: {record.tanggal_pemeriksaan ? new Date(record.tanggal_pemeriksaan).toLocaleDateString('id-ID') : '-'}
                                                                                    </div>
                                                                                </div>
                                                                            ) : doc.type === 'resume_medis' ? (
                                                                                <div>
                                                                                    <div className="font-medium">
                                                                                        {record.resume_title || `Resume Medis #${record.id}`}
                                                                                        {record.is_fiktif && (
                                                                                            <Badge variant="destructive" className="ml-2 text-xs">FIKTIF</Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-gray-600">
                                                                                        Pasien: {record.nama || '-'} | 
                                                                                        Tanggal: {record.tanggal_keluar ? new Date(record.tanggal_keluar).toLocaleDateString('id-ID') : (record.created_at ? new Date(record.created_at).toLocaleDateString('id-ID') : '-')} |
                                                                                        Tipe: {record.resume_type === 'rawat_inap' ? 'Rawat Inap' : record.resume_type === 'rawat_jalan' ? 'Rawat Jalan' : record.resume_type === 'ugd' ? 'UGD' : 'Unknown'}
                                                                                    </div>
                                                                                </div>
                                                                            ) : doc.type === 'pengkajian_awal' ? (
                                                                                <div>
                                                                                    <div className="font-medium">
                                                                                        {record.pengkajian_title || `Pengkajian Awal #${record.id}`}
                                                                                        {record.is_fiktif && (
                                                                                            <Badge variant="destructive" className="ml-2 text-xs">FIKTIF</Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-gray-600">
                                                                                        Pasien: {record.nama || '-'} | 
                                                                                        Tanggal: {record.created_at ? new Date(record.created_at).toLocaleDateString('id-ID') : '-'} |
                                                                                        Tipe: {record.pengkajian_type === 'rawat_inap' ? 'Rawat Inap' : record.pengkajian_type === 'rawat_jalan' ? 'Rawat Jalan' : record.pengkajian_type === 'ugd' ? 'UGD' : 'Unknown'}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div>
                                                                                    <div className="font-medium">
                                                                                        Record #{record.id}
                                                                                        {record.is_fiktif && (
                                                                                            <Badge variant="destructive" className="ml-2 text-xs">FIKTIF</Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-gray-600">
                                                                                        Tanggal: {record.created_at ? new Date(record.created_at).toLocaleDateString('id-ID') : '-'}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            
                            {availableDocuments.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No documents available for this patient</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Documents Order - Table Format */}
                {selectionOrder.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Merge Order ({selectionOrder.length} documents)
                            </CardTitle>
                            <CardDescription>
                                Documents will be merged in this order. You can reorder by dragging or remove individual items.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-200 p-3 text-center">Order</th>
                                            <th className="border border-gray-200 p-3 text-left">Document Type</th>
                                            <th className="border border-gray-200 p-3 text-center">Records</th>
                                            <th className="border border-gray-200 p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getSelectedDocuments().map((doc, index) => (
                                            <tr 
                                                key={doc.id} 
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="border border-gray-200 p-3 text-center">
                                                    <Badge variant="default">#{index + 1}</Badge>
                                                </td>
                                                <td className="border border-gray-200 p-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{doc.icon}</span>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {doc.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {doc.type}
                                                            </div>
                                                            {doc.hasRecords && doc.selectedRecords && doc.selectedRecords.length > 0 && (
                                                                <div className="text-xs text-blue-600 mt-1">
                                                                    {doc.selectedRecords.length} specific records selected
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-200 p-3 text-center">
                                                    <Badge variant="outline" className="text-xs">
                                                        {doc.hasRecords && doc.selectedRecords && doc.selectedRecords.length > 0 
                                                            ? `${doc.selectedRecords.length} selected` 
                                                            : `${doc.count} records`}
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 p-3 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        {index > 0 && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => reorderDocument(index, index - 1)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                ↑
                                                            </Button>
                                                        )}
                                                        {index < getSelectedDocuments().length - 1 && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => reorderDocument(index, index + 1)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                ↓
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => toggleDocument(doc.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="flex gap-3">
                                <Button 
                                    onClick={handleGenerateBundle}
                                    disabled={selectionOrder.length < 1 || isGenerating}
                                    className="flex items-center gap-2"
                                >
                                    {isGenerating ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Package className="h-4 w-4" />
                                    )}
                                    {isGenerating ? 'Generating...' : `Generate Bundle (${selectionOrder.length} docs)`}
                                </Button>
                                
                                <Button 
                                    variant="outline"
                                    onClick={() => {
                                        setSelectionOrder([]);
                                        setDocuments(prev => prev.map(doc => ({ 
                                            ...doc, 
                                            isSelected: false, 
                                            selectionOrder: null 
                                        })));
                                    }}
                                >
                                    Clear All Selection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Unavailable Documents */}
                {unavailableDocuments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-500">
                                Unavailable Documents ({unavailableDocuments.length})
                            </CardTitle>
                            <CardDescription>
                                These documents have no data for this patient.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {unavailableDocuments.map(doc => (
                                    <div 
                                        key={doc.id} 
                                        className="border border-gray-200 rounded-lg p-4 opacity-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl grayscale">{doc.icon}</span>
                                            <div>
                                                <h3 className="font-medium text-gray-500">{doc.title}</h3>
                                                <p className="text-sm text-gray-400">No data available</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
