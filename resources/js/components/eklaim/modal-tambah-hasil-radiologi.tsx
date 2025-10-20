import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export interface Tindakan {
    ID: number;
    NAMA: string;
}

export interface TambahHasilRadiologiData {
    tindakanId: number;
    namaTindakan: string;
    tanggal: string;
    klinis: string;
    kesan: string;
    usul: string;
    hasil: string;
    btk: string;
}

interface ModalTambahHasilRadiologiProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TambahHasilRadiologiData) => void;
    tindakan: Tindakan[];
}

const ModalTambahHasilRadiologi = ({
    isOpen,
    onClose,
    onSubmit,
    tindakan
}: ModalTambahHasilRadiologiProps) => {
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
    const filteredTindakan = tindakan.filter(item =>
        item.NAMA.toLowerCase().includes(searchTindakan.toLowerCase())
    );

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

    useEffect(() => {
        if (isOpen && !formData.tanggal) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, tanggal: today }));
        }
    }, [isOpen, formData.tanggal]);

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

    const handleSubmit = () => {
        if (!selectedTindakan) {
            alert('Silakan pilih tindakan terlebih dahulu');
            return;
        }

        if (!formData.tanggal) {
            alert('Silakan isi tanggal terlebih dahulu');
            return;
        }

        const data: TambahHasilRadiologiData = {
            tindakanId: selectedTindakan.ID,
            namaTindakan: selectedTindakan.NAMA,
            ...formData
        };

        onSubmit(data);
        handleReset();
    };

    const handleReset = () => {
        setSelectedTindakan(null);
        setFormData({
            tanggal: '',
            klinis: '',
            kesan: '',
            usul: '',
            hasil: '',
            btk: ''
        });
        setSearchTindakan('');
        setShowTindakanList(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-lg font-semibold">
                        Tambah Hasil Radiologi
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <table
                        style={{
                            fontFamily: 'halvetica, sans-serif',
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #ddd',
                            fontSize: '14px'
                        }}
                    >
                        <tbody>
                            <tr>
                                <td
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                        width: '30%'
                                    }}
                                >
                                    Pilih Tindakan
                                </td>
                                <td
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '12px'
                                    }}
                                >
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
                                                    filteredTindakan.map((item) => (
                                                        <div
                                                            key={item.ID}
                                                            onClick={() => handleTindakanSelect(item)}
                                                            className={`px-3 py-2 cursor-pointer hover:bg-green-100 ${
                                                                selectedTindakan?.ID === item.ID ? 'bg-green-50' : ''
                                                            }`}
                                                        >
                                                            <div className="font-medium">{item.NAMA}</div>
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

                            {/* === FORM INPUTS LAIN === */}
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>Tanggal</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    <Input
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                                        className="w-full h-10"
                                        style={{ border: 'none', background: 'transparent', fontSize: '14px' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f8f9fa', fontWeight: 'bold', verticalAlign: 'top' }}>Klinis</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    <Textarea
                                        value={formData.klinis}
                                        onChange={(e) => setFormData(prev => ({ ...prev, klinis: e.target.value }))}
                                        placeholder="Masukkan data klinis..."
                                        className="w-full min-h-[60px] resize-none"
                                        style={{ border: 'none', background: 'transparent', fontSize: '14px' }}
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f8f9fa', fontWeight: 'bold', verticalAlign: 'top' }}>Kesan</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    <Textarea
                                        value={formData.kesan}
                                        onChange={(e) => setFormData(prev => ({ ...prev, kesan: e.target.value }))}
                                        placeholder="Masukkan kesan radiologi..."
                                        className="w-full min-h-[60px] resize-none"
                                        style={{ border: 'none', background: 'transparent', fontSize: '14px' }}
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f8f9fa', fontWeight: 'bold', verticalAlign: 'top' }}>Usul</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    <Textarea
                                        value={formData.usul}
                                        onChange={(e) => setFormData(prev => ({ ...prev, usul: e.target.value }))}
                                        placeholder="Masukkan usul..."
                                        className="w-full min-h-[60px] resize-none"
                                        style={{ border: 'none', background: 'transparent', fontSize: '14px' }}
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f8f9fa', fontWeight: 'bold', verticalAlign: 'top' }}>Hasil</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    <Textarea
                                        value={formData.hasil}
                                        onChange={(e) => setFormData(prev => ({ ...prev, hasil: e.target.value }))}
                                        placeholder="Masukkan hasil radiologi..."
                                        className="w-full min-h-[80px] resize-none"
                                        style={{ border: 'none', background: 'transparent', fontSize: '14px' }}
                                        rows={4}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>BTK</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    <Input
                                        value={formData.btk}
                                        onChange={(e) => setFormData(prev => ({ ...prev, btk: e.target.value }))}
                                        placeholder="Masukkan BTK..."
                                        className="w-full h-10"
                                        style={{ border: 'none', background: 'transparent', fontSize: '14px' }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClose}>Batal</Button>
                        <Button onClick={handleSubmit} disabled={!selectedTindakan || !formData.tanggal} className="bg-blue-600 hover:bg-blue-700">
                            Tambah Hasil
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModalTambahHasilRadiologi;
