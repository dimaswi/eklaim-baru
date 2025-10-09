import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Tindakan {
    KODE: string;
    NAMA: string;
    TARIF: number;
    tarif_tindakan?: {
        TARIF: number;
    };
}

interface Obat {
    KODE: string;
    NAMA: string;
    HARGA_JUAL: number;
    SATUAN: string;
    harga_barang?: {
        HARGA_JUAL: number;
    };
}

interface RincianTagihan {
    ID: number;
    TAGIHAN: string;
    JENIS: number;
    TARIF_ID: number;
    JUMLAH: number;
    TARIF: number;
    PERSENTASE_DISKON: number;
    DISKON: number;
    STATUS: number;
    COA: number;
    nama_item?: string;
    is_manual?: boolean;
    tarif_tindakan?: {
        nama_tindakan?: {
            NAMA: string;
        };
    };
    tarif_harga_barang?: {
        nama_barang?: {
            NAMA: string;
        };
    };
}

interface AddItemModalProps {
    tindakan: Tindakan[];
    obat: Obat[];
    onAddItem: (item: RincianTagihan) => void;
    children: React.ReactNode;
}

export default function AddItemModal({ tindakan = [], obat = [], onAddItem, children }: AddItemModalProps) {
    const [open, setOpen] = useState(false);
    const [itemType, setItemType] = useState<'tindakan' | 'obat'>('tindakan');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<Tindakan | Obat | null>(null);
    const [jumlah, setJumlah] = useState<number>(1);
    const [harga, setHarga] = useState<number>(0);
    const [persentaseDiskon, setPersentaseDiskon] = useState<number>(0);


    // Filter items
    const currentItems = itemType === 'tindakan' ? tindakan : obat;
    const filteredItems = currentItems.filter(item => 
        item?.NAMA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.KODE?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedItem(null);
            setSearchTerm('');
            setJumlah(1);
            setHarga(0);
            setPersentaseDiskon(0);
        }
    }, [open]);

    // Auto-set price when item selected
    useEffect(() => {
        if (selectedItem) {
            if (itemType === 'tindakan') {
                setHarga((selectedItem as any).tarif_tindakan?.TARIF || (selectedItem as Tindakan).TARIF || 0);
            } else {
                setHarga((selectedItem as any).harga_barang?.HARGA_JUAL || (selectedItem as Obat).HARGA_JUAL || 0);
            }
        }
    }, [selectedItem, itemType]);

    const handleSelectItem = (item: Tindakan | Obat) => {
        setSelectedItem(item);
        setSearchTerm(item.NAMA);
    };

    const handleAddToTable = () => {
        if (!selectedItem || jumlah <= 0 || harga <= 0) {
            toast.error('Mohon lengkapi semua field');
            return;
        }

        const subtotal = jumlah * harga;
        const diskon = (subtotal * persentaseDiskon) / 100;

        const newItem: RincianTagihan = {
            ID: Date.now(),
            TAGIHAN: 'MANUAL',
            JENIS: itemType === 'tindakan' ? 3 : 4,
            TARIF_ID: 0,
            JUMLAH: jumlah,
            TARIF: harga,
            PERSENTASE_DISKON: persentaseDiskon,
            DISKON: diskon,
            STATUS: 0,
            COA: 0,
            nama_item: selectedItem.NAMA,
            is_manual: true,
        };

        if (itemType === 'tindakan') {
            newItem.tarif_tindakan = {
                nama_tindakan: { NAMA: selectedItem.NAMA }
            };
        } else {
            newItem.tarif_harga_barang = {
                nama_barang: { NAMA: selectedItem.NAMA }
            };
        }

        onAddItem(newItem);
        setOpen(false);
        toast.success('Item berhasil ditambahkan ke tagihan');
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {children}
            </div>

            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Tambah Item Tagihan</h2>
                            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
                            {/* Item Type */}
                            <div>
                                <Label>Jenis Item</Label>
                                {/* Fallback HTML Select for testing */}
                                <select 
                                    value={itemType}
                                    onChange={(e) => {
                                        setItemType(e.target.value as 'tindakan' | 'obat');
                                        setSelectedItem(null);
                                        setSearchTerm('');
                                        setHarga(0);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                                >
                                    <option value="tindakan">🏥 Tindakan Medis</option>
                                    <option value="obat">💊 Obat/Barang</option>
                                </select>
                                
                                {/* Original shadcn Select - commented for now
                                <Select 
                                    value={itemType} 
                                    onValueChange={(value) => {
                                        setItemType(value as 'tindakan' | 'obat');
                                        setSelectedItem(null);
                                        setSearchTerm('');
                                        setHarga(0);
                                    }}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih jenis item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tindakan">🏥 Tindakan Medis</SelectItem>
                                        <SelectItem value="obat">💊 Obat/Barang</SelectItem>
                                    </SelectContent>
                                </Select>
                                */}
                            </div>

                            {/* Search */}
                            <div>
                                <Label>Cari {itemType === 'tindakan' ? 'Tindakan' : 'Obat'}</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder={`Ketik untuk mencari ${itemType}...`}
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setSelectedItem(null);
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Items List */}
                            {searchTerm && !selectedItem && (
                                <div className="border rounded-lg max-h-48 overflow-y-auto">
                                    {filteredItems.length > 0 ? (
                                        filteredItems.slice(0, 20).map((item, index) => (
                                            <div
                                                key={`${itemType}-${item.KODE || 'unknown'}-${index}`}
                                                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                                onClick={() => handleSelectItem(item)}
                                            >
                                                <div className="font-medium">{item.NAMA}</div>
                                                <div className="text-sm text-gray-600">
                                                    Kode: {item.KODE} | Harga: Rp {new Intl.NumberFormat('id-ID').format(
                                                        itemType === 'tindakan' ? 
                                                            ((item as any).tarif_tindakan?.TARIF || (item as Tindakan).TARIF || 0) : 
                                                            ((item as any).harga_barang?.HARGA_JUAL || (item as Obat).HARGA_JUAL || 0)
                                                    )}
                                                    {itemType === 'obat' && ` / ${(item as Obat).SATUAN}`}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">Tidak ada hasil ditemukan</div>
                                    )}
                                </div>
                            )}

                            {/* Selected Item & Form */}
                            {selectedItem && (
                                <div className="space-y-4">
                                    {/* Selected Item Display */}
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-green-800">
                                                    {itemType === 'tindakan' ? '🏥' : '💊'} {selectedItem.NAMA}
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    Kode: {selectedItem.KODE} | Harga: Rp {new Intl.NumberFormat('id-ID').format(
                                                        itemType === 'tindakan' ? 
                                                            ((selectedItem as any).tarif_tindakan?.TARIF || (selectedItem as Tindakan).TARIF || 0) : 
                                                            ((selectedItem as any).harga_barang?.HARGA_JUAL || (selectedItem as Obat).HARGA_JUAL || 0)
                                                    )}
                                                </div>
                                            </div>
                                            <Check className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Jumlah</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={jumlah}
                                                onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Harga Satuan (Rp)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={harga}
                                                onChange={(e) => setHarga(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Diskon (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={persentaseDiskon}
                                                onChange={(e) => setPersentaseDiskon(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>Rp {new Intl.NumberFormat('id-ID').format(jumlah * harga)}</span>
                                            </div>
                                            {persentaseDiskon > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>Diskon ({persentaseDiskon}%):</span>
                                                    <span>- Rp {new Intl.NumberFormat('id-ID').format((jumlah * harga * persentaseDiskon) / 100)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-lg border-t pt-1">
                                                <span>Total:</span>
                                                <span className="text-green-600">
                                                    Rp {new Intl.NumberFormat('id-ID').format(jumlah * harga - ((jumlah * harga * persentaseDiskon) / 100))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button 
                                onClick={handleAddToTable}
                                disabled={!selectedItem || jumlah <= 0 || harga <= 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah ke Tagihan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}