import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

interface CPPTItem {
    id?: number;
    tanggal: string;
    profesi: string;
    subyektif: string;
    obyektif: string;
    assesment: string;
    planning: string;
    instruksi: string;
    nama_petugas: string;
}

interface Petugas {
    id: number;
    NAMA: string;
    profesi?: {
        DESKRIPSI: string;
    };
}

interface TambahCPPTModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CPPTItem) => void;
    petugas: Petugas[];
}

export default function TambahCPPTModal({ isOpen, onClose, onSave, petugas }: TambahCPPTModalProps) {
    const [formData, setFormData] = useState<CPPTItem>({
        tanggal: new Date().toISOString().split('T')[0],
        profesi: '',
        subyektif: '',
        obyektif: '',
        assesment: '',
        planning: '',
        instruksi: '',
        nama_petugas: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

    // Filter petugas berdasarkan search term
    const filteredPetugas = useMemo(() => {
        if (!petugas || !Array.isArray(petugas)) return [];
        if (!searchTerm) return petugas;
        return petugas.filter(p => 
            p.NAMA.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.profesi?.DESKRIPSI || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [petugas, searchTerm]);

    const handleInputChange = (field: keyof CPPTItem, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // Validasi form
        if (!formData.tanggal) {
            toast.error('Tanggal harus diisi');
            return;
        }
        if (!formData.profesi) {
            toast.error('Profesi harus diisi');
            return;
        }
        if (!formData.nama_petugas) {
            toast.error('Nama Petugas harus diisi');
            return;
        }

        // Simpan data
        onSave(formData);
        
        // Reset form
        setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            profesi: '',
            subyektif: '',
            obyektif: '',
            assesment: '',
            planning: '',
            instruksi: '',
            nama_petugas: ''
        });
        setSearchTerm('');
        
        onClose();
        toast.success('Data CPPT berhasil ditambahkan');
    };

    const handleCancel = () => {
        // Reset form
        setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            profesi: '',
            subyektif: '',
            obyektif: '',
            assesment: '',
            planning: '',
            instruksi: '',
            nama_petugas: ''
        });
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Tambah CPPT Baru</DialogTitle>
                    <DialogDescription>
                        Isi form di bawah untuk menambahkan Catatan Perkembangan Pasien Terintegrasi baru.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Form dalam style tabel horizontal */}
                    <div 
                        style={{
                            fontFamily: 'Arial, sans-serif',
                            border: '1px solid #000',
                            borderCollapse: 'collapse',
                            width: '100%'
                        }}
                    >
                        {/* Header */}
                        <div 
                            style={{
                                background: '#f0f0f0',
                                border: '1px solid #000',
                                padding: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            Form Input CPPT
                        </div>

                        {/* Row 1: Tanggal, Profesi, Nama Petugas - Horizontal */}
                        <div style={{ display: 'flex', border: '1px solid #000' }}>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                borderRight: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px',
                                minWidth: '200px'
                            }}>
                                <Label htmlFor="tanggal" className="text-sm font-medium">Tanggal *</Label>
                                <Input
                                    id="tanggal"
                                    type="datetime-local"
                                    value={formData.tanggal}
                                    onChange={(e) => handleInputChange('tanggal', e.target.value)}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div style={{ 
                                flex: '1.5', 
                                padding: '8px',
                                borderRight: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px',
                                minWidth: '250px'
                            }}>
                                <Label htmlFor="profesi" className="text-sm font-medium">Profesi *</Label>
                                <Input
                                    id="profesi"
                                    type="text"
                                    placeholder="Contoh: Dokter, Perawat, dll"
                                    value={formData.profesi}
                                    onChange={(e) => handleInputChange('profesi', e.target.value)}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div style={{ 
                                flex: '2', 
                                padding: '8px',
                                background: '#f9f9f9',
                                fontSize: '12px',
                                minWidth: '300px'
                            }}>
                                <Label htmlFor="nama_petugas" className="text-sm font-medium">Nama Petugas *</Label>
                                <div className="relative mt-1">
                                    <Input
                                        placeholder="Cari nama petugas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="text-sm"
                                        style={{ 
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            padding: '6px',
                                            width: '100%'
                                        }}
                                    />
                                    {searchTerm && filteredPetugas.length > 0 && (
                                        <div 
                                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto"
                                            style={{
                                                border: '1px solid #ccc',
                                                backgroundColor: 'white',
                                                maxHeight: '160px',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            {filteredPetugas.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    onClick={() => {
                                                        handleInputChange('nama_petugas', p.NAMA);
                                                        handleInputChange('profesi', p.profesi?.DESKRIPSI || '');
                                                        setSearchTerm('');
                                                    }}
                                                    style={{
                                                        padding: '8px 12px',
                                                        fontSize: '12px',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>{p.NAMA}</div>
                                                    {p.profesi?.DESKRIPSI && (
                                                        <div style={{ color: '#666', fontSize: '11px' }}>
                                                            {p.profesi.DESKRIPSI}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {formData.nama_petugas && (
                                        <div className="text-xs text-green-600 mt-1">
                                            Dipilih: {formData.nama_petugas}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Subyektif dan Obyektif - Horizontal */}
                        <div style={{ display: 'flex' }}>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="subyektif" className="text-sm font-medium">Data Subyektif</Label>
                                <Textarea
                                    id="subyektif"
                                    placeholder="Keluhan pasien, riwayat penyakit, dll"
                                    value={formData.subyektif}
                                    onChange={(e) => handleInputChange('subyektif', e.target.value)}
                                    rows={5}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        fontSize: '12px',
                                        lineHeight: '1.4',
                                        width: '100%',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="obyektif" className="text-sm font-medium">Data Obyektif</Label>
                                <Textarea
                                    id="obyektif"
                                    placeholder="Hasil pemeriksaan fisik, vital sign, dll"
                                    value={formData.obyektif}
                                    onChange={(e) => handleInputChange('obyektif', e.target.value)}
                                    rows={5}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        fontSize: '12px',
                                        lineHeight: '1.4',
                                        width: '100%',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Row 3: Assessment dan Planning - Horizontal */}
                        <div style={{ display: 'flex' }}>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="assesment" className="text-sm font-medium">Assessment</Label>
                                <Textarea
                                    id="assesment"
                                    placeholder="Diagnosa, analisis kondisi pasien"
                                    value={formData.assesment}
                                    onChange={(e) => handleInputChange('assesment', e.target.value)}
                                    rows={5}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        fontSize: '12px',
                                        lineHeight: '1.4',
                                        width: '100%',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="planning" className="text-sm font-medium">Planning</Label>
                                <Textarea
                                    id="planning"
                                    placeholder="Rencana tindakan, terapi, dll"
                                    value={formData.planning}
                                    onChange={(e) => handleInputChange('planning', e.target.value)}
                                    rows={5}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        fontSize: '12px',
                                        lineHeight: '1.4',
                                        width: '100%',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Row 4: Instruksi - Full Width */}
                        <div style={{ 
                            padding: '8px', 
                            border: '1px solid #000',
                            background: '#f9f9f9',
                            fontSize: '12px'
                        }}>
                            <Label htmlFor="instruksi" className="text-sm font-medium">Instruksi</Label>
                            <Textarea
                                id="instruksi"
                                placeholder="Instruksi khusus untuk pasien atau perawatan"
                                value={formData.instruksi}
                                onChange={(e) => handleInputChange('instruksi', e.target.value)}
                                rows={4}
                                className="mt-1 text-sm"
                                style={{ 
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '6px',
                                    fontSize: '12px',
                                    lineHeight: '1.4',
                                    width: '100%',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Batal
                    </Button>
                    <Button onClick={handleSave}>
                        Simpan CPPT
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
