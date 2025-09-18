import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search, Plus } from 'lucide-react';

interface ObatItem {
    ID: number;
    NAMA: string;
    KODE?: string;
    SATUAN?: string;
}

interface ResepItem {
    id: number;
    nama_obat: string;
    frekuensi: string;
    jumlah: number;
    cara_pemberian: string;
    kode_obat: string;
}

interface ObatModalProps {
    isOpen: boolean;
    onClose: () => void;
    obatList: ObatItem[];
    selectedResep: ResepItem[];
    onSelectObat: (obat: ObatItem) => void;
    onRemoveObat: (id: number) => void;
    onUpdateResep: (id: number, field: keyof ResepItem, value: string | number) => void;
}

export default function ObatModal({
    isOpen,
    onClose,
    obatList,
    selectedResep,
    onSelectObat,
    onRemoveObat,
    onUpdateResep,
}: ObatModalProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredObat = obatList.filter((obat) =>
        obat.NAMA.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (obat.KODE && obat.KODE.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-7xl !h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Pilih Obat untuk Resep Pulang</DialogTitle>
                    <DialogDescription>
                        Cari dan pilih obat yang akan ditambahkan ke resep pulang pasien
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col !h-[65vh] space-y-4">
                    {/* Search Input */}
                    <div className="relative flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Cari nama obat atau kode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-1 gap-4 min-h-0">
                        {/* Left Panel - Daftar Obat */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className="font-semibold mb-2 flex-shrink-0">Daftar Obat:</h3>
                            <div className="flex-1 overflow-y-auto border rounded p-2">
                                <div className="space-y-2">
                                    {filteredObat.length > 0 ? (
                                        filteredObat.map((obat) => (
                                            <div
                                                key={obat.ID}
                                                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">{obat.NAMA}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Kode: {obat.KODE || '-'}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onSelectObat(obat)}
                                                    className="text-green-600 hover:text-green-700 flex-shrink-0"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Pilih
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            {searchTerm ? 'Tidak ada obat yang sesuai dengan pencarian' : 'Tidak ada data obat'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Selected Resep */}
                        <div className="w-96 flex flex-col min-h-0">
                            <h3 className="font-semibold text-green-600 mb-2 flex-shrink-0">
                                Resep Pulang Terpilih ({selectedResep.length}):
                            </h3>
                            <div className="flex-1 overflow-y-auto border rounded p-2">
                                {selectedResep.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedResep.map((resep) => (
                                            <div key={resep.id} className="bg-green-50 p-3 rounded border">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="font-medium flex-1 pr-2">{resep.nama_obat}</div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onRemoveObat(resep.id)}
                                                        className="text-red-500 hover:text-red-700 p-1 h-auto flex-shrink-0"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center">
                                                        <label className="text-gray-600 w-16 flex-shrink-0">Frekuensi:</label>
                                                        <input
                                                            type="text"
                                                            value={resep.frekuensi}
                                                            onChange={(e) => onUpdateResep(resep.id, 'frekuensi', e.target.value)}
                                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                                            placeholder="3x1"
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <label className="text-gray-600 w-16 flex-shrink-0">Jumlah:</label>
                                                        <input
                                                            type="number"
                                                            value={resep.jumlah}
                                                            onChange={(e) => onUpdateResep(resep.id, 'jumlah', parseInt(e.target.value) || 1)}
                                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <label className="text-gray-600 w-16 flex-shrink-0">Cara:</label>
                                                        <select
                                                            value={resep.cara_pemberian}
                                                            onChange={(e) => onUpdateResep(resep.id, 'cara_pemberian', e.target.value)}
                                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                                        >
                                                            <option value="SEBELUM MAKAN">SEBELUM MAKAN</option>
                                                            <option value="SESUDAH MAKAN">SESUDAH MAKAN</option>
                                                            <option value="SAAT MAKAN">SAAT MAKAN</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Belum ada obat yang dipilih
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
                        <Button variant="outline" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
