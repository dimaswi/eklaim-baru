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
import { Zap, Save, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

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
    const [openTindakan, setOpenTindakan] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const listRef = useRef<HTMLDivElement | null>(null);

    const [formData, setFormData] = useState({
        tanggal: '',
        klinis: '',
        kesan: '',
        usul: '',
        hasil: '',
        btk: ''
    });

    useEffect(() => {
        if (open && !formData.tanggal) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, tanggal: today }));
        }
    }, [open, formData.tanggal]);

    const handleTindakanSelect = (tindakan: Tindakan) => {
        setSelectedTindakan(tindakan);
        setOpenTindakan(false);
        setHighlightIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!openTindakan || tindakanList.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex(prev => {
                const next = (prev + 1) % tindakanList.length;
                scrollIntoView(next);
                return next;
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex(prev => {
                const next = (prev - 1 + tindakanList.length) % tindakanList.length;
                scrollIntoView(next);
                return next;
            });
        } else if (e.key === "Enter" && highlightIndex >= 0) {
            e.preventDefault();
            const tindakan = tindakanList[highlightIndex];
            if (tindakan) handleTindakanSelect(tindakan);
        }
    };

    const scrollIntoView = (index: number) => {
        if (listRef.current) {
            const item = listRef.current.querySelectorAll('.command-item')[index];
            if (item) (item as HTMLElement).scrollIntoView({ block: 'nearest' });
        }
    };

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
        setFormData({
            tanggal: '',
            klinis: '',
            kesan: '',
            usul: '',
            hasil: '',
            btk: ''
        });
        setOpenTindakan(false);
        setHighlightIndex(-1);
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
                                    <Popover open={openTindakan} onOpenChange={setOpenTindakan}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openTindakan}
                                                className="w-full justify-between h-10"
                                            >
                                                <span className={selectedTindakan ? "text-black" : "text-gray-500"}>
                                                    {selectedTindakan ? selectedTindakan.NAMA : "Pilih tindakan radiologi..."}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command onKeyDown={handleKeyDown}>
                                                <CommandInput placeholder="Ketik untuk mencari tindakan..." className="h-10" />
                                                <CommandEmpty>Tidak ada tindakan ditemukan.</CommandEmpty>
                                                <CommandGroup ref={listRef} className="max-h-48 overflow-auto">
                                                    {tindakanList.length > 0 ? (
                                                        tindakanList.map((tindakan, index) => (
                                                            <CommandItem
                                                                key={tindakan.ID}
                                                                value={tindakan.NAMA}
                                                                onSelect={() => handleTindakanSelect(tindakan)}
                                                                className={cn(
                                                                    "command-item flex items-center py-2 px-3 cursor-pointer",
                                                                    highlightIndex === index
                                                                        ? "bg-green-100"
                                                                        : "hover:bg-gray-100"
                                                                )}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedTindakan?.ID === tindakan.ID
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <span>{tindakan.NAMA}</span>
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
