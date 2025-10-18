import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [openTindakan, setOpenTindakan] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: '',
        klinis: '',
        kesan: '',
        usul: '',
        hasil: '',
        btk: ''
    });

    useEffect(() => {
        if (isOpen && !formData.tanggal) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, tanggal: today }));
        }
    }, [isOpen, formData.tanggal]);

    const handleTindakanSelect = (tindakan: Tindakan) => {
        setSelectedTindakan(tindakan);
        setOpenTindakan(false);
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
        setOpenTindakan(false);
        setHighlightedIndex(0);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!openTindakan || !tindakan.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev === tindakan.length - 1 ? 0 : prev + 1
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev === 0 ? tindakan.length - 1 : prev - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selected = tindakan[highlightedIndex];
            if (selected) handleTindakanSelect(selected);
        } else if (e.key === "Escape") {
            setOpenTindakan(false);
        }
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
                                    <Popover open={openTindakan} onOpenChange={setOpenTindakan}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openTindakan}
                                                className="w-full justify-between h-10 text-left"
                                            >
                                                <span className={selectedTindakan ? "text-black" : "text-gray-500"}>
                                                    {selectedTindakan
                                                        ? selectedTindakan.NAMA
                                                        : "Pilih tindakan radiologi..."}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Ketik untuk mencari tindakan..."
                                                    className="h-10"
                                                    onKeyDown={handleKeyDown}
                                                />
                                                <CommandEmpty>
                                                    Tidak ada tindakan ditemukan.
                                                </CommandEmpty>

                                                <CommandGroup className="max-h-48 overflow-auto">
                                                    {tindakan && tindakan.length > 0 ? (
                                                        tindakan.map((tindakanItem, index) => (
                                                            <CommandItem
                                                                key={tindakanItem.ID}
                                                                value={tindakanItem.NAMA}
                                                                onSelect={() =>
                                                                    handleTindakanSelect(tindakanItem)
                                                                }
                                                                className={cn(
                                                                    "flex items-center py-2 px-3 cursor-pointer",
                                                                    highlightedIndex === index
                                                                        ? "bg-blue-100"
                                                                        : "hover:bg-gray-100"
                                                                )}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedTindakan?.ID === tindakanItem.ID
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div>{tindakanItem.NAMA}</div>
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
