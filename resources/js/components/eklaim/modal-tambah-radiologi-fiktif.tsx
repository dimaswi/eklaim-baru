import React, { useState, useEffect } from 'react';
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
import { router } from '@inertiajs/react';
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
    onSubmit: (data: any) => void; // Tambahkan callback untuk mengirim data ke parent
}

export default function ModalTambahRadiologiFiktif({ open, onClose, tindakanList, pengajuanId, onSubmit }: Props) {
    const [selectedTindakan, setSelectedTindakan] = useState<Tindakan | null>(null);
    const [openTindakan, setOpenTindakan] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: '',
        klinis: '',
        kesan: '',
        usul: '',
        hasil: '',
        btk: ''
    });

    // Set tanggal default ketika modal dibuka
    useEffect(() => {
        if (open && !formData.tanggal) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                tanggal: today
            }));
        }
    }, [open, formData.tanggal]);

    const handleTindakanSelect = (tindakan: Tindakan) => {
        setSelectedTindakan(tindakan);
        setOpenTindakan(false);
    };

    const handleSubmit = async () => {
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

        // Kirim data ke parent component untuk ditambahkan ke tabel sementara
        onSubmit(submitData);
        
        // Tutup modal setelah berhasil
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
                                    backgroundColor: '#f0fdf4',
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
                                                />
                                                <CommandEmpty>Tidak ada tindakan ditemukan.</CommandEmpty>
                                                <CommandGroup className="max-h-48 overflow-auto">
                                                    {tindakanList && tindakanList.length > 0 ? (
                                                        tindakanList.map((tindakanItem) => (
                                                            <CommandItem
                                                                key={tindakanItem.ID}
                                                                value={tindakanItem.NAMA}
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
                                                                        selectedTindakan?.ID === tindakanItem.ID
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div>
                                                                    <div className="font-medium">{tindakanItem.NAMA}</div>
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
                                    backgroundColor: '#f0fdf4',
                                    fontWeight: 'bold'
                                }}>
                                    Tanggal
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Input
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData(prev => ({...prev, tanggal: e.target.value}))}
                                        className="w-full h-10"
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent',
                                            fontSize: '14px'
                                        }}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    backgroundColor: '#f0fdf4',
                                    fontWeight: 'bold',
                                    verticalAlign: 'top'
                                }}>
                                    Klinis
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Textarea
                                        value={formData.klinis}
                                        onChange={(e) => setFormData(prev => ({...prev, klinis: e.target.value}))}
                                        placeholder="Masukkan data klinis..."
                                        className="w-full min-h-[60px] resize-none"
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent',
                                            fontSize: '14px'
                                        }}
                                        rows={3}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    backgroundColor: '#f0fdf4',
                                    fontWeight: 'bold',
                                    verticalAlign: 'top'
                                }}>
                                    Kesan
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Textarea
                                        value={formData.kesan}
                                        onChange={(e) => setFormData(prev => ({...prev, kesan: e.target.value}))}
                                        placeholder="Masukkan kesan radiologi..."
                                        className="w-full min-h-[60px] resize-none"
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent',
                                            fontSize: '14px'
                                        }}
                                        rows={3}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    backgroundColor: '#f0fdf4',
                                    fontWeight: 'bold',
                                    verticalAlign: 'top'
                                }}>
                                    Usul
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Textarea
                                        value={formData.usul}
                                        onChange={(e) => setFormData(prev => ({...prev, usul: e.target.value}))}
                                        placeholder="Masukkan usul..."
                                        className="w-full min-h-[60px] resize-none"
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent',
                                            fontSize: '14px'
                                        }}
                                        rows={3}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    backgroundColor: '#f0fdf4',
                                    fontWeight: 'bold',
                                    verticalAlign: 'top'
                                }}>
                                    Hasil
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Textarea
                                        value={formData.hasil}
                                        onChange={(e) => setFormData(prev => ({...prev, hasil: e.target.value}))}
                                        placeholder="Masukkan hasil radiologi..."
                                        className="w-full min-h-[80px] resize-none"
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent',
                                            fontSize: '14px'
                                        }}
                                        rows={4}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    backgroundColor: '#f0fdf4',
                                    fontWeight: 'bold'
                                }}>
                                    BTK
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '12px'
                                }}>
                                    <Input
                                        value={formData.btk}
                                        onChange={(e) => setFormData(prev => ({...prev, btk: e.target.value}))}
                                        placeholder="Masukkan BTK..."
                                        className="w-full h-10"
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent',
                                            fontSize: '14px'
                                        }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Buttons */}
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
