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
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

interface BalanceCairanItem {
    ID?: number;
    KUNJUNGAN: string;
    intake_oral: string;
    intake_ngt: string;
    konsumsi_jumlah: string;
    transfusi_produk: string;
    transfusi_produk_jumlah: string;
    output_oral: string;
    output_ngt: string;
    urine_jumlah: string;
    pendarahan_jumlah: string;
    fases_jumlah: string;
    total_intake: string;
    total_output: string;
    volume_intake: string;
    volume_output: string;
    volume_balance: string;
    suhu: string;
    waktu_pemeriksaan: string;
    tanggal: string;
    nama_petugas: string;
}

interface Petugas {
    id: number;
    NAMA: string;
    profesi?: {
        DESKRIPSI: string;
    };
}

interface TambahBalanceCairanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: BalanceCairanItem) => void;
    petugas: Petugas[];
    kunjunganNomor: string;
}

export default function TambahBalanceCairanModal({ 
    isOpen, 
    onClose, 
    onSave, 
    petugas, 
    kunjunganNomor 
}: TambahBalanceCairanModalProps) {
    const [formData, setFormData] = useState<BalanceCairanItem>({
        KUNJUNGAN: kunjunganNomor,
        intake_oral: '0.00',
        intake_ngt: '0.00',
        konsumsi_jumlah: '0.00',
        transfusi_produk: '',
        transfusi_produk_jumlah: '0.00',
        output_oral: '0.00',
        output_ngt: '0.00',
        urine_jumlah: '0.00',
        pendarahan_jumlah: '0.00',
        fases_jumlah: '0.00',
        total_intake: '0.00',
        total_output: '0.00',
        volume_intake: '0.00',
        volume_output: '0.00',
        volume_balance: '0.00',
        suhu: '36.50',
        waktu_pemeriksaan: new Date().toISOString().slice(0, 16),
        tanggal: new Date().toISOString().slice(0, 16),
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

    const handleInputChange = (field: keyof BalanceCairanItem, value: string) => {
        setFormData(prev => {
            const updated = {
                ...prev,
                [field]: value
            };

            // Auto calculate totals when intake/output values change
            if (['intake_oral', 'intake_ngt', 'konsumsi_jumlah', 'transfusi_produk_jumlah'].includes(field)) {
                const totalIntake = (
                    parseFloat(updated.intake_oral || '0') +
                    parseFloat(updated.intake_ngt || '0') +
                    parseFloat(updated.konsumsi_jumlah || '0') +
                    parseFloat(updated.transfusi_produk_jumlah || '0')
                ).toFixed(2);
                updated.total_intake = totalIntake;
                updated.volume_intake = totalIntake;
            }

            if (['output_oral', 'output_ngt', 'urine_jumlah', 'pendarahan_jumlah', 'fases_jumlah'].includes(field)) {
                const totalOutput = (
                    parseFloat(updated.output_oral || '0') +
                    parseFloat(updated.output_ngt || '0') +
                    parseFloat(updated.urine_jumlah || '0') +
                    parseFloat(updated.pendarahan_jumlah || '0') +
                    parseFloat(updated.fases_jumlah || '0')
                ).toFixed(2);
                updated.total_output = totalOutput;
                updated.volume_output = totalOutput;
            }

            // Calculate balance
            const balance = (
                parseFloat(updated.total_intake || '0') - parseFloat(updated.total_output || '0')
            ).toFixed(2);
            updated.volume_balance = balance;

            return updated;
        });
    };

    const handleSave = () => {
        // Validasi form
        if (!formData.tanggal) {
            toast.error('Tanggal harus diisi');
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
            KUNJUNGAN: kunjunganNomor,
            intake_oral: '0.00',
            intake_ngt: '0.00',
            konsumsi_jumlah: '0.00',
            transfusi_produk: '',
            transfusi_produk_jumlah: '0.00',
            output_oral: '0.00',
            output_ngt: '0.00',
            urine_jumlah: '0.00',
            pendarahan_jumlah: '0.00',
            fases_jumlah: '0.00',
            total_intake: '0.00',
            total_output: '0.00',
            volume_intake: '0.00',
            volume_output: '0.00',
            volume_balance: '0.00',
            suhu: '36.50',
            waktu_pemeriksaan: new Date().toISOString().slice(0, 16),
            tanggal: new Date().toISOString().slice(0, 16),
            nama_petugas: ''
        });
        setSearchTerm('');
        
        onClose();
        toast.success('Data Balance Cairan berhasil ditambahkan');
    };

    const handleCancel = () => {
        // Reset form
        setFormData({
            KUNJUNGAN: kunjunganNomor,
            intake_oral: '0.00',
            intake_ngt: '0.00',
            konsumsi_jumlah: '0.00',
            transfusi_produk: '',
            transfusi_produk_jumlah: '0.00',
            output_oral: '0.00',
            output_ngt: '0.00',
            urine_jumlah: '0.00',
            pendarahan_jumlah: '0.00',
            fases_jumlah: '0.00',
            total_intake: '0.00',
            total_output: '0.00',
            volume_intake: '0.00',
            volume_output: '0.00',
            volume_balance: '0.00',
            suhu: '36.50',
            waktu_pemeriksaan: new Date().toISOString().slice(0, 16),
            tanggal: new Date().toISOString().slice(0, 16),
            nama_petugas: ''
        });
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Tambah Balance Cairan Baru</DialogTitle>
                    <DialogDescription>
                        Isi form di bawah untuk menambahkan data Balance Cairan baru.
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
                            Form Input Balance Cairan
                        </div>

                        {/* Row 1: Tanggal, Suhu, Nama Petugas - Horizontal */}
                        <div style={{ display: 'flex', border: '1px solid #000' }}>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                borderRight: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px',
                                minWidth: '200px'
                            }}>
                                <Label htmlFor="tanggal" className="text-sm font-medium">Tanggal & Waktu *</Label>
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
                                flex: '1', 
                                padding: '8px',
                                borderRight: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px',
                                minWidth: '150px'
                            }}>
                                <Label htmlFor="suhu" className="text-sm font-medium">Suhu (°C) *</Label>
                                <Input
                                    id="suhu"
                                    type="number"
                                    step="0.1"
                                    placeholder="36.5"
                                    value={formData.suhu}
                                    onChange={(e) => handleInputChange('suhu', e.target.value)}
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

                        {/* Row 2: INTAKE - Horizontal */}
                        <div style={{ display: 'flex' }}>
                            <div style={{ 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#e8f4fd',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                minWidth: '120px'
                            }}>
                                INTAKE CAIRAN
                            </div>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="intake_oral" className="text-sm font-medium">Oral (ml)</Label>
                                <Input
                                    id="intake_oral"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.intake_oral}
                                    onChange={(e) => handleInputChange('intake_oral', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="intake_ngt" className="text-sm font-medium">NGT (ml)</Label>
                                <Input
                                    id="intake_ngt"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.intake_ngt}
                                    onChange={(e) => handleInputChange('intake_ngt', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="konsumsi_jumlah" className="text-sm font-medium">Konsumsi (ml)</Label>
                                <Input
                                    id="konsumsi_jumlah"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.konsumsi_jumlah}
                                    onChange={(e) => handleInputChange('konsumsi_jumlah', e.target.value)}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Row 3: TRANSFUSI - Horizontal */}
                        <div style={{ display: 'flex' }}>
                            <div style={{ 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#fff2cc',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                minWidth: '120px'
                            }}>
                                TRANSFUSI
                            </div>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="transfusi_produk" className="text-sm font-medium">Produk Transfusi</Label>
                                <Input
                                    id="transfusi_produk"
                                    type="text"
                                    placeholder="Contoh: WB, PRC, FFP, dll"
                                    value={formData.transfusi_produk}
                                    onChange={(e) => handleInputChange('transfusi_produk', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="transfusi_produk_jumlah" className="text-sm font-medium">Jumlah (ml)</Label>
                                <Input
                                    id="transfusi_produk_jumlah"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.transfusi_produk_jumlah}
                                    onChange={(e) => handleInputChange('transfusi_produk_jumlah', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#e8f5e8',
                                fontSize: '12px'
                            }}>
                                <Label className="text-sm font-medium">Total Intake</Label>
                                <div style={{ 
                                    marginTop: '4px',
                                    padding: '8px',
                                    background: '#fff',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}>
                                    {formData.total_intake} ml
                                </div>
                            </div>
                        </div>

                        {/* Row 4: OUTPUT - Horizontal */}
                        <div style={{ display: 'flex' }}>
                            <div style={{ 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#ffe6e6',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                minWidth: '120px'
                            }}>
                                OUTPUT CAIRAN
                            </div>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="output_oral" className="text-sm font-medium">Oral (ml)</Label>
                                <Input
                                    id="output_oral"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.output_oral}
                                    onChange={(e) => handleInputChange('output_oral', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="output_ngt" className="text-sm font-medium">NGT (ml)</Label>
                                <Input
                                    id="output_ngt"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.output_ngt}
                                    onChange={(e) => handleInputChange('output_ngt', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="urine_jumlah" className="text-sm font-medium">Urine (ml)</Label>
                                <Input
                                    id="urine_jumlah"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.urine_jumlah}
                                    onChange={(e) => handleInputChange('urine_jumlah', e.target.value)}
                                    className="mt-1 text-sm"
                                    style={{ 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Row 5: OUTPUT Lanjutan - Horizontal */}
                        <div style={{ display: 'flex' }}>
                            <div style={{ 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#ffe6e6',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                minWidth: '120px'
                            }}>
                                OUTPUT LAIN
                            </div>
                            <div style={{ 
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="pendarahan_jumlah" className="text-sm font-medium">Pendarahan (ml)</Label>
                                <Input
                                    id="pendarahan_jumlah"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.pendarahan_jumlah}
                                    onChange={(e) => handleInputChange('pendarahan_jumlah', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#f9f9f9',
                                fontSize: '12px'
                            }}>
                                <Label htmlFor="fases_jumlah" className="text-sm font-medium">Fases (ml)</Label>
                                <Input
                                    id="fases_jumlah"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.fases_jumlah}
                                    onChange={(e) => handleInputChange('fases_jumlah', e.target.value)}
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
                                flex: '1', 
                                padding: '8px', 
                                border: '1px solid #000',
                                background: '#ffe6e6',
                                fontSize: '12px'
                            }}>
                                <Label className="text-sm font-medium">Total Output</Label>
                                <div style={{ 
                                    marginTop: '4px',
                                    padding: '8px',
                                    background: '#fff',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}>
                                    {formData.total_output} ml
                                </div>
                            </div>
                        </div>

                        {/* Row 6: BALANCE - Full Width */}
                        <div style={{ 
                            padding: '12px', 
                            border: '1px solid #000',
                            background: '#ffffcc',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            <Label className="text-lg font-bold">BALANCE CAIRAN</Label>
                            <div style={{ 
                                marginTop: '8px',
                                padding: '12px',
                                background: '#fff',
                                border: '2px solid #000',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                color: parseFloat(formData.volume_balance) >= 0 ? '#00aa00' : '#aa0000'
                            }}>
                                {formData.volume_balance} ml
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    (Intake - Output)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Batal
                    </Button>
                    <Button onClick={handleSave}>
                        Simpan Balance Cairan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
