import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  tindakanList: Tindakan[];
}

export default function ModalTambahLabFiktif({
  open,
  onClose,
  onSubmit,
  tindakanList,
}: Props) {
  const [selectedTindakan, setSelectedTindakan] = useState<Tindakan | null>(null);
  const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState('');
  const [openTindakan, setOpenTindakan] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const listRef = useRef<HTMLDivElement | null>(null);

  // Set tanggal default ketika modal dibuka
  useEffect(() => {
    if (open && !tanggalPemeriksaan) {
      setTanggalPemeriksaan(getCurrentDateTime());
    }
  }, [open, tanggalPemeriksaan]);

  const handleTindakanSelect = (tindakan: Tindakan) => {
    setSelectedTindakan(tindakan);
    setOpenTindakan(false);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTindakan) {
      toast.error('Pilih tindakan laboratorium terlebih dahulu');
      return;
    }

    if (!selectedTindakan.parameter_tindakan_lab || selectedTindakan.parameter_tindakan_lab.length === 0) {
      toast.error('Tindakan tidak memiliki parameter yang terdefinisi');
      return;
    }

    const tindakanData = {
      tindakanId: selectedTindakan.ID,
      namaTindakan: selectedTindakan.NAMA,
      tanggal: tanggalPemeriksaan,
      parameters: selectedTindakan.parameter_tindakan_lab.map(param => ({
        PARAMETER: param.PARAMETER,
        SATUAN: param.satuan?.DESKRIPSI || param.SATUAN || '-',
        NILAI_RUJUKAN: param.NILAI_RUJUKAN || '',
        HASIL: '',
      })),
    };

    onSubmit(tindakanData);
    handleClose();
    toast.success('Tindakan laboratorium berhasil ditambahkan ke tabel');
  };

  const handleReset = () => {
    setSelectedTindakan(null);
    setTanggalPemeriksaan('');
    setOpenTindakan(false);
    setHighlightIndex(-1);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!openTindakan || tindakanList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev + 1) % tindakanList.length);
      scrollIntoView((highlightIndex + 1) % tindakanList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev - 1 + tindakanList.length) % tindakanList.length);
      scrollIntoView((highlightIndex - 1 + tindakanList.length) % tindakanList.length);
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      const tindakan = tindakanList[highlightIndex];
      if (tindakan) handleTindakanSelect(tindakan);
    }
  };

  const scrollIntoView = (index: number) => {
    if (listRef.current) {
      const item = listRef.current.querySelectorAll('.command-item')[index];
      if (item) {
        (item as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">
            Tambah Tindakan Laboratorium Fiktif
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <table className="w-full border-collapse text-sm border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 bg-gray-50 font-semibold w-1/3 p-3">
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
                          {selectedTindakan
                            ? selectedTindakan.NAMA
                            : "Pilih tindakan laboratorium..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command onKeyDown={handleKeyDown}>
                        <CommandInput placeholder="Ketik untuk mencari tindakan..." className="h-10" />
                        <CommandEmpty>Tidak ada tindakan ditemukan.</CommandEmpty>
                        <CommandGroup ref={listRef} className="max-h-48 overflow-auto">
                          {tindakanList.map((tindakan, index) => (
                            <CommandItem
                              key={tindakan.ID}
                              value={tindakan.NAMA}
                              onSelect={() => handleTindakanSelect(tindakan)}
                              className={cn(
                                "command-item flex items-center py-2 px-3 cursor-pointer",
                                highlightIndex === index
                                  ? "bg-blue-100"
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
                              <div>
                                <div className="font-medium">{tindakan.NAMA}</div>
                                {tindakan.parameter_tindakan_lab && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {tindakan.parameter_tindakan_lab.length} parameter
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>

              <tr>
                <td className="border border-gray-300 bg-gray-50 font-semibold p-3">
                  Tanggal & Waktu
                </td>
                <td className="border border-gray-300 p-3">
                  <Input
                    type="datetime-local"
                    value={tanggalPemeriksaan}
                    onChange={(e) => setTanggalPemeriksaan(e.target.value)}
                    className="w-full h-10"
                  />
                </td>
              </tr>

              {selectedTindakan && selectedTindakan.parameter_tindakan_lab && (
                <tr>
                  <td className="border border-gray-300 bg-gray-50 font-semibold p-3 align-top">
                    Parameter yang akan ditambahkan
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedTindakan.parameter_tindakan_lab.map((param, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm"
                        >
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedTindakan || !tanggalPemeriksaan}
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
