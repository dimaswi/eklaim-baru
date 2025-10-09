import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ParameterTindakanLab {
    PARAMETER: string;
    SATUAN: string;
    NILAI_RUJUKAN?: string;
    satuan?: {
        DESKRIPSI: string;
    };
}

interface Tindakan {
    ID: number;
    NAMA: string;
    parameter_tindakan_lab?: ParameterTindakanLab[] | null;
}

interface TambahHasilLabData {
    tindakanId: number;
    namaTindakan: string;
    tanggal: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TambahHasilLabData) => void;
    tindakanList: Tindakan[];
}

export default function ModalTambahHasilLab({ open, onClose, onSubmit, tindakanList }: Props) {
    const [selectedTindakan, setSelectedTindakan] = useState<Tindakan | null>(null);
    const [tanggal, setTanggal] = useState('');
    const [openTindakan, setOpenTindakan] = useState(false);
    // Set tanggal default ketika modal dibuka
    useEffect(() => {
        if (open && !tanggal) {
            setTanggal(getCurrentDateTime());
        }
    }, [open]);

    const handleTindakanSelect = (tindakan: Tindakan) => {
        setSelectedTindakan(tindakan);
        setOpenTindakan(false);
    };

    const handleSubmit = () => {
        if (!selectedTindakan || !tanggal) {
            alert('Tindakan dan tanggal harus diisi!');
            return;
        }

        const data: TambahHasilLabData = {
            tindakanId: selectedTindakan.ID,
            namaTindakan: selectedTindakan.NAMA,
            tanggal
        };

        onSubmit(data);
        handleReset();
    };

    const handleReset = () => {
        setSelectedTindakan(null);
        setTanggal('');
        setOpenTindakan(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    // Format tanggal untuk input datetime-local
    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-lg font-semibold">
                        Tambah Tindakan Laboratorium
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <table style={{
                        fontFamily: 'halvetica, sans-serif',
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                    }}>
                        <tbody>
                            <tr>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 'bold',
                                    width: '30%'
                                }}>
                                    Pilih Tindakan
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Popover open={openTindakan} onOpenChange={setOpenTindakan}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openTindakan}
                                                className="w-full justify-between h-10 text-left"
                                                style={{ minHeight: '40px' }}
                                            >
                                                <span className={selectedTindakan ? "text-black" : "text-gray-500"}>
                                                    {selectedTindakan
                                                        ? selectedTindakan.NAMA
                                                        : "Pilih tindakan laboratorium..."}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput 
                                                    placeholder="Ketik untuk mencari tindakan..." 
                                                    className="h-10"
                                                />
                                                <CommandEmpty>Tidak ada tindakan ditemukan.</CommandEmpty>
                                                <CommandGroup className="max-h-48 overflow-auto">
                                                    {tindakanList && tindakanList.length > 0 ? (
                                                        tindakanList.map((tindakan) => (
                                                            <CommandItem
                                                                key={tindakan.ID}
                                                                value={tindakan.NAMA}
                                                                onSelect={(value) => {
                                                                    const selectedTind = tindakanList.find(t => t.NAMA === value);
                                                                    if (selectedTind) {
                                                                        handleTindakanSelect(selectedTind);
                                                                    }
                                                                }}
                                                                className="flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedTindakan?.ID === tindakan.ID
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div>
                                                                    <div className="font-medium">{tindakan.NAMA}</div>
                                                                    {tindakan.parameter_tindakan_lab && (
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            {tindakan.parameter_tindakan_lab.length} parameter
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CommandItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500">
                                                            Data tindakan tidak tersedia
                                                        </div>
                                                    )}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 'bold'
                                }}>
                                    Tanggal & Waktu
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Input
                                        type="datetime-local"
                                        value={tanggal}
                                        onChange={(e) => setTanggal(e.target.value)}
                                        className="w-full h-10"
                                    />
                                </td>
                            </tr>

                            {selectedTindakan && selectedTindakan.parameter_tindakan_lab && (
                                <tr>
                                    <td style={{
                                        border: '1px solid #ddd',
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                        verticalAlign: 'top'
                                    }}>
                                        Parameter yang akan ditambahkan
                                    </td>
                                    <td style={{
                                        border: '1px solid #ddd',
                                        padding: '12px'
                                    }}>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {selectedTindakan.parameter_tindakan_lab.map((param, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{param.PARAMETER}</span>
                                                        <span className="text-xs text-gray-500">
                                                            Satuan: {param.satuan?.DESKRIPSI || param.SATUAN || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs block">
                                                            Rujukan: {param.NILAI_RUJUKAN || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600">
                                            Parameter di atas akan ditambahkan ke tabel dengan hasil kosong untuk diisi
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClose}>
                            Batal
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={!selectedTindakan || !tanggal}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Tambah Tindakan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
