import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Users, Stethoscope } from 'lucide-react';

// === Interfaces ===
interface Pegawai {
  NIP: string;
  NAMA: string;
  PROFESI: number;
}

interface Dokter {
  NIP: string;
  NAMA: string;
  SPESIALISASI?: string;
  pegawai?: {
    NAMA: string;
  };
}

interface PetugasDokterData {
  petugasMedisId: string;
  petugasMedisNama: string;
  dokterPenanggungJawabId: string;
  dokterPenanggungJawabNama: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PetugasDokterData) => void;
  pegawaiList: Pegawai[];
  dokterList: Dokter[];
  initialData?: Partial<PetugasDokterData>;
}

// === Component ===
export default function ModalPetugasDokter({
  open,
  onClose,
  onSubmit,
  pegawaiList,
  dokterList,
  initialData,
}: Props) {
  const emptyForm: PetugasDokterData = useMemo(
    () => ({
      petugasMedisId: '',
      petugasMedisNama: '',
      dokterPenanggungJawabId: '',
      dokterPenanggungJawabNama: '',
    }),
    []
  );

  const [formData, setFormData] = useState<PetugasDokterData>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PetugasDokterData, string>>
  >({});

  // Load initial data saat modal dibuka
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        petugasMedisId: initialData.petugasMedisId || '',
        petugasMedisNama: initialData.petugasMedisNama || '',
        dokterPenanggungJawabId: initialData.dokterPenanggungJawabId || '',
        dokterPenanggungJawabNama: initialData.dokterPenanggungJawabNama || '',
      });
    } else if (!open) {
      // reset ketika ditutup
      setFormData(emptyForm);
      setErrors({});
    }
  }, [open, initialData, emptyForm]);

  // === Validation ===
  const validateForm = () => {
    const newErrors: Partial<Record<keyof PetugasDokterData, string>> = {};

    if (!formData.petugasMedisId.trim()) {
      newErrors.petugasMedisId = 'Petugas medis harus dipilih';
    }

    if (!formData.dokterPenanggungJawabId.trim()) {
      newErrors.dokterPenanggungJawabId = 'Dokter penanggung jawab harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === Handlers ===
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleSelectPetugas = (value: string, label: string) => {
    setFormData((prev) => ({
      ...prev,
      petugasMedisId: value,
      petugasMedisNama: label,
    }));
    if (errors.petugasMedisId) {
      setErrors((prev) => ({ ...prev, petugasMedisId: '' }));
    }
  };

  const handleSelectDokter = (value: string, label: string) => {
    setFormData((prev) => ({
      ...prev,
      dokterPenanggungJawabId: value,
      dokterPenanggungJawabNama: label,
    }));
    if (errors.dokterPenanggungJawabId) {
      setErrors((prev) => ({ ...prev, dokterPenanggungJawabId: '' }));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Pilih Petugas Medis dan Dokter Penanggung Jawab
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Petugas Medis */}
          <div className="space-y-2">
            <Label htmlFor="petugasMedis" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Petugas Medis / Petugas Laboratorium
            </Label>

            <SearchableSelect
              options={pegawaiList.map((p) => ({
                value: p.NIP,
                label: p.NAMA,
                sublabel: `NIP: ${p.NIP}`,
              }))}
              value={formData.petugasMedisId}
              onSelect={handleSelectPetugas}
              placeholder="Pilih petugas medis..."
              searchPlaceholder="Cari nama petugas..."
              emptyText="Tidak ada petugas ditemukan"
              className={errors.petugasMedisId ? 'border-red-500' : ''}
            />

            {errors.petugasMedisId && (
              <p className="text-sm text-red-500">{errors.petugasMedisId}</p>
            )}
            {formData.petugasMedisNama && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                Dipilih: <strong>{formData.petugasMedisNama}</strong>
              </div>
            )}
          </div>

          {/* Dokter Penanggung Jawab */}
          <div className="space-y-2">
            <Label
              htmlFor="dokterPenanggungJawab"
              className="flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              Dokter Penanggung Jawab
            </Label>

            <SearchableSelect
              options={dokterList.map((d) => ({
                value: d.NIP,
                label: d.pegawai?.NAMA || d.NAMA,
                sublabel: `NIP: ${d.NIP}${
                  d.SPESIALISASI ? ` - ${d.SPESIALISASI}` : ''
                }`,
              }))}
              value={formData.dokterPenanggungJawabId}
              onSelect={handleSelectDokter}
              placeholder="Pilih dokter penanggung jawab..."
              searchPlaceholder="Cari nama dokter..."
              emptyText="Tidak ada dokter ditemukan"
              className={errors.dokterPenanggungJawabId ? 'border-red-500' : ''}
            />

            {errors.dokterPenanggungJawabId && (
              <p className="text-sm text-red-500">
                {errors.dokterPenanggungJawabId}
              </p>
            )}
            {formData.dokterPenanggungJawabNama && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                Dipilih: <strong>{formData.dokterPenanggungJawabNama}</strong>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.petugasMedisId || !formData.dokterPenanggungJawabId}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Lanjutkan Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
