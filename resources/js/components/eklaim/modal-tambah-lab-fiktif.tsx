import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [searchTindakan, setSearchTindakan] = useState('');
  const [showTindakanList, setShowTindakanList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Filter tindakan berdasarkan pencarian
  const filteredTindakan = tindakanList.filter(tindakan =>
    tindakan.NAMA.toLowerCase().includes(searchTindakan.toLowerCase())
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

  // Set tanggal default ketika modal dibuka
  useEffect(() => {
    if (open && !tanggalPemeriksaan) {
      setTanggalPemeriksaan(getCurrentDateTime());
    }
  }, [open, tanggalPemeriksaan]);

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
    setSearchTindakan('');
    setShowTindakanList(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
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
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchTindakan}
                        onChange={handleSearchChange}
                        onFocus={() => setShowTindakanList(true)}
                        placeholder="Ketik untuk mencari tindakan laboratorium..."
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
                              {tindakan.parameter_tindakan_lab && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Parameter: {tindakan.parameter_tindakan_lab.length} item
                                </div>
                              )}
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
