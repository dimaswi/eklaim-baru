import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

  // fokus otomatis ke input pencarian saat popover dibuka
  useEffect(() => {
    if (openTindakan) {
      setTimeout(() => {
        const input = document.querySelector('[cmdk-input]');
        if (input) (input as HTMLInputElement).focus();
      }, 100);
    }
  }, [openTindakan]);

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
      tanggal,
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
  const getCurrentDateTime = () => new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">Tambah Tindakan Laboratorium</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <table className="w-full border border-gray-300 text-sm">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-3 bg-gray-50 font-semibold w-1/3">
                  Pilih Tindakan
                </td>
                <td className="border border-gray-300 p-3">
                  <Popover open={openTindakan} onOpenChange={setOpenTindakan}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTindakan}
                        className="w-full justify-between h-10 text-left"
                      >
                        <span className={selectedTindakan ? 'text-black' : 'text-gray-500'}>
                          {selectedTindakan
                            ? selectedTindakan.NAMA
                            : 'Pilih tindakan laboratorium...'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command shouldFilter={true}>
                        <CommandInput
                          placeholder="Ketik untuk mencari tindakan..."
                          className="h-10"
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setOpenTindakan(false);
                            }
                          }}
                        />

                        <CommandEmpty>Tidak ada tindakan ditemukan.</CommandEmpty>

                        <CommandGroup className="max-h-48 overflow-auto">
                          {tindakanList && tindakanList.length > 0 ? (
                            tindakanList.map((tindakan, index) => (
                              <CommandItem
                                key={tindakan.ID}
                                value={tindakan.NAMA}
                                onSelect={() => handleTindakanSelect(tindakan)}
                                className={cn(
                                  'flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100',
                                  selectedTindakan?.ID === tindakan.ID && 'bg-gray-100'
                                )}
                                onKeyDown={(e) => {
                                  // ENTER untuk memilih
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleTindakanSelect(tindakan);
                                  }
                                  // PANAH BAWAH
                                  else if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const next =
                                      tindakanList[(index + 1) % tindakanList.length];
                                    setSelectedTindakan(next);
                                  }
                                  // PANAH ATAS
                                  else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    const prev =
                                      tindakanList[
                                        (index - 1 + tindakanList.length) %
                                        tindakanList.length
                                      ];
                                    setSelectedTindakan(prev);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedTindakan?.ID === tindakan.ID
                                      ? 'opacity-100'
                                      : 'opacity-0'
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
                <td className="border border-gray-300 p-3 bg-gray-50 font-semibold">
                  Tanggal & Waktu
                </td>
                <td className="border border-gray-300 p-3">
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
                  <td className="border border-gray-300 p-3 bg-gray-50 font-semibold align-top">
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

          {/* Tombol aksi */}
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
