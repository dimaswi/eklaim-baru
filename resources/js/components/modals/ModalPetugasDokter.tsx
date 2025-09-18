import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Users, Stethoscope } from 'lucide-react';

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

export default function ModalPetugasDokter({
    open,
    onClose,
    onSubmit,
    pegawaiList,
    dokterList,
    initialData
}: Props) {
    const [formData, setFormData] = useState<PetugasDokterData>({
        petugasMedisId: '',
        petugasMedisNama: '',
        dokterPenanggungJawabId: '',
        dokterPenanggungJawabNama: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                petugasMedisId: initialData.petugasMedisId || '',
                petugasMedisNama: initialData.petugasMedisNama || '',
                dokterPenanggungJawabId: initialData.dokterPenanggungJawabId || '',
                dokterPenanggungJawabNama: initialData.dokterPenanggungJawabNama || '',
            });
        }
    }, [initialData, open]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.petugasMedisId.trim()) {
            newErrors.petugasMedisId = 'Petugas medis harus dipilih';
        }

        if (!formData.dokterPenanggungJawabId.trim()) {
            newErrors.dokterPenanggungJawabId = 'Dokter penanggung jawab harus dipilih';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
            onClose();
        }
    };

    const handleClose = () => {
        setFormData({
            petugasMedisId: '',
            petugasMedisNama: '',
            dokterPenanggungJawabId: '',
            dokterPenanggungJawabNama: '',
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
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
                            options={pegawaiList.map(petugas => ({
                                value: petugas.NIP,
                                label: petugas.NAMA,
                                sublabel: `NIP: ${petugas.NIP}`
                            }))}
                            value={formData.petugasMedisId}
                            onSelect={(value, label) => {
                                setFormData(prev => ({
                                    ...prev,
                                    petugasMedisId: value,
                                    petugasMedisNama: label
                                }));
                                if (errors.petugasMedisId) {
                                    setErrors(prev => ({ ...prev, petugasMedisId: '' }));
                                }
                            }}
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
                        <Label htmlFor="dokterPenanggungJawab" className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Dokter Penanggung Jawab
                        </Label>
                        <SearchableSelect
                            options={dokterList.map(dokter => ({
                                value: dokter.NIP,
                                label: dokter.pegawai?.NAMA || dokter.NAMA,
                                sublabel: `NIP: ${dokter.NIP}${dokter.SPESIALISASI ? ` - ${dokter.SPESIALISASI}` : ''}`
                            }))}
                            value={formData.dokterPenanggungJawabId}
                            onSelect={(value, label) => {
                                setFormData(prev => ({
                                    ...prev,
                                    dokterPenanggungJawabId: value,
                                    dokterPenanggungJawabNama: label
                                }));
                                if (errors.dokterPenanggungJawabId) {
                                    setErrors(prev => ({ ...prev, dokterPenanggungJawabId: '' }));
                                }
                            }}
                            placeholder="Pilih dokter penanggung jawab..."
                            searchPlaceholder="Cari nama dokter..."
                            emptyText="Tidak ada dokter ditemukan"
                            className={errors.dokterPenanggungJawabId ? 'border-red-500' : ''}
                        />
                        {errors.dokterPenanggungJawabId && (
                            <p className="text-sm text-red-500">{errors.dokterPenanggungJawabId}</p>
                        )}
                        {formData.dokterPenanggungJawabNama && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                Dipilih: <strong>{formData.dokterPenanggungJawabNama}</strong>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                        Lanjutkan Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
