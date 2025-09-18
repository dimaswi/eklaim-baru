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
    satuan: string;
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
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Pilih Obat untuk Resep Pulang</DialogTitle>
                    <DialogDescription>
                        Cari dan pilih obat yang akan ditambahkan ke resep pulang pasien
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Cari nama obat atau kode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Selected Resep */}
                    {selectedResep.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-green-600">Resep Pulang Terpilih:</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                                {selectedResep.map((resep) => (
                                    <div key={resep.id} className="flex items-center justify-between bg-green-50 p-2 rounded">
                                        <div className="flex-1">
                                            <div className="font-medium">{resep.nama_obat}</div>
                                            <div className="flex space-x-4 text-sm">
                                                <div>
                                                    <label className="text-gray-600">Frekuensi:</label>
                                                    <input
                                                        type="text"
                                                        value={resep.frekuensi}
                                                        onChange={(e) => onUpdateResep(resep.id, 'frekuensi', e.target.value)}
                                                        className="ml-1 w-16 px-1 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-600">Jumlah:</label>
                                                    <input
                                                        type="number"
                                                        value={resep.jumlah}
                                                        onChange={(e) => onUpdateResep(resep.id, 'jumlah', parseInt(e.target.value) || 0)}
                                                        className="ml-1 w-16 px-1 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-600">Cara:</label>
                                                    <select
                                                        value={resep.cara_pemberian}
                                                        onChange={(e) => onUpdateResep(resep.id, 'cara_pemberian', e.target.value)}
                                                        className="ml-1 px-1 border rounded"
                                                    >
                                                        <option value="SEBELUM MAKAN">SEBELUM MAKAN</option>
                                                        <option value="SESUDAH MAKAN">SESUDAH MAKAN</option>
                                                        <option value="SAAT MAKAN">SAAT MAKAN</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveObat(resep.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Obat List */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Daftar Obat:</h3>
                        <div className="grid gap-2 max-h-80 overflow-y-auto">
                            {filteredObat.length > 0 ? (
                                filteredObat.map((obat) => (
                                    <div
                                        key={obat.ID}
                                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{obat.NAMA}</div>
                                            <div className="text-sm text-gray-600">
                                                Kode: {obat.KODE || '-'} | Satuan: {obat.SATUAN || '-'}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onSelectObat(obat)}
                                            className="text-green-600 hover:text-green-700"
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

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
