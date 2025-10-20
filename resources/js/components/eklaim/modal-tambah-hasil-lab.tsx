import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
    if (open && !tanggal) {
      setTanggal(getCurrentDateTime());
    }
  }, [open]);

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
    setSearchTindakan('');
    setShowTindakanList(false);
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
                              <div className="font-medium">{tindakan.NAMA}
                              {tindakan.parameter_tindakan_lab && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Parameter: {tindakan.parameter_tindakan_lab.length} item
                                </div>
                              )}
                              </div>
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
