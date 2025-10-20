import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
} from '@/components/ui/dialog';
import { Zap, Save, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface Tindakan {
    ID: number;
    NAMA: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    tindakanList: Tindakan[];
    pengajuanId: number;
    onSubmit: (data: any) => void;
}

export default function ModalTambahRadiologiFiktif({ open, onClose, tindakanList, pengajuanId, onSubmit }: Props) {
    const [selectedTindakan, setSelectedTindakan] = useState<Tindakan | null>(null);
    const [searchTindakan, setSearchTindakan] = useState('');
    const [showTindakanList, setShowTindakanList] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const [formData, setFormData] = useState({
        tanggal: '',
        klinis: '',
        kesan: '',
        usul: '',
        hasil: '',
        btk: ''
    });

    // Filter tindakan berdasarkan pencarian
    const filteredTindakan = tindakanList.filter(tindakan =>
        tindakan.NAMA.toLowerCase().includes(searchTindakan.toLowerCase())
    );

    useEffect(() => {
        if (open && !formData.tanggal) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, tanggal: today }));
        }
    }, [open, formData.tanggal]);

    const handleTindakanSelect = (tindakan: Tindakan) => {
        setSelectedTindakan(tindakan);
        setSearchTindakan(tindakan.NAMA);
        setShowTindakanList(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTindakan(e.target.value);
        setShowTindakanList(true);
        if (!e.target.value) {
            setSelectedTindakan(null);
        }
    };

    const clearTindakan = () => {
        setSelectedTindakan(null);
        setSearchTindakan('');
        setShowTindakanList(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowTindakanList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = () => {
        if (!selectedTindakan) {
            toast.error('Pilih tindakan radiologi terlebih dahulu');
            return;
        }
        if (!formData.tanggal) {
            toast.error('Silakan isi tanggal terlebih dahulu');
            return;
        }

        const submitData = {
            tindakanId: selectedTindakan.ID,
            namaTindakan: selectedTindakan.NAMA,
            ...formData
        };

        onSubmit(submitData);
        handleClose();
        toast.success('Data radiologi fiktif berhasil ditambahkan ke tabel');
    };

    const handleReset = () => {
        setSelectedTindakan(null);
        setSearchTindakan('');
        setShowTindakanList(false);
        setFormData({
            tanggal: '',
            klinis: '',
            kesan: '',
            usul: '',
            hasil: '',
            btk: ''
        });
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-green-600">
                        <Zap className="h-5 w-5" />
                        Tambah Radiologi Fiktif
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <table className="w-full border border-gray-300 text-sm border-collapse">
                        <tbody>
                            <tr>
                                <td className="bg-green-50 border border-gray-300 font-semibold p-3 w-1/3">
                                    Pilih Tindakan
                                </td>
                                <td className="border border-gray-300 p-3">
                                    <div className="relative" ref={dropdownRef}>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={searchTindakan}
                                                onChange={handleSearchChange}
                                                onFocus={() => setShowTindakanList(true)}
                                                placeholder="Ketik untuk mencari tindakan radiologi..."
                                                className="w-full h-10 pr-10"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                {searchTindakan ? (
                                                    <button
                                                        type="button"
                                                        onClick={clearTindakan}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <Search className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {showTindakanList && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                                                {filteredTindakan.length > 0 ? (
                                                    filteredTindakan.map((tindakan) => (
                                                        <div
                                                            key={tindakan.ID}
                                                            onClick={() => handleTindakanSelect(tindakan)}
                                                            className={`px-3 py-2 cursor-pointer hover:bg-green-100 ${
                                                                selectedTindakan?.ID === tindakan.ID ? 'bg-green-50' : ''
                                                            }`}
                                                        >
                                                            <div className="font-medium">{tindakan.NAMA}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2 text-gray-500 text-center">
                                                        Tidak ada tindakan ditemukan
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>

                            {/* Field lainnya */}
                            <tr>
                                <td className="bg-green-50 border border-gray-300 font-semibold p-3">
                                    Tanggal
                                </td>
                                <td className="border border-gray-300 p-3">
                                    <Input
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                                        className="w-full h-10"
                                    />
                                </td>
                            </tr>

                            {["klinis", "kesan", "usul", "hasil"].map((field, i) => (
                                <tr key={i}>
                                    <td className="bg-green-50 border border-gray-300 font-semibold p-3 align-top capitalize">
                                        {field}
                                    </td>
                                    <td className="border border-gray-300 p-3">
                                        <Textarea
                                            value={(formData as any)[field]}
                                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                            placeholder={`Masukkan ${field}...`}
                                            className="w-full min-h-[60px] resize-none"
                                        />
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <td className="bg-green-50 border border-gray-300 font-semibold p-3">BTK</td>
                                <td className="border border-gray-300 p-3">
                                    <Input
                                        value={formData.btk}
                                        onChange={(e) => setFormData(prev => ({ ...prev, btk: e.target.value }))}
                                        placeholder="Masukkan BTK..."
                                        className="w-full h-10"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClose}>
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedTindakan || !formData.tanggal}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Tambah ke Tabel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
