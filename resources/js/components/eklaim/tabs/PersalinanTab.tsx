import React, { useState, useEffect } from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface DeliveryEntry {
    delivery_sequence: string;
    delivery_method: string;
    delivery_dttm: string;
    letak_janin: string;
    kondisi: string;
    use_manual: boolean;
    use_forcep: boolean;
    use_vacuum: boolean;
    shk_spesimen_ambil: string;
    shk_lokasi?: string;
    shk_spesimen_dttm?: string;
    shk_alasan?: string;
}

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
    getNestedValue: (parent: string, field: string) => string;
    updateNestedField: (parent: string, field: string, value: any) => void;
}

export default function PersalinanTab({ formData, updateField, getNestedValue, updateNestedField }: Props) {
    const [deliveryEntries, setDeliveryEntries] = useState<DeliveryEntry[]>([]);

    // Initialize delivery entries from formData or create default entry
    useEffect(() => {
        const existingDeliveries = formData.persalinan?.delivery;
        if (existingDeliveries && Array.isArray(existingDeliveries) && existingDeliveries.length > 0) {
            setDeliveryEntries(existingDeliveries);
        } else {
            // Create default first entry
            const defaultEntry: DeliveryEntry = {
                delivery_sequence: '1',
                delivery_method: '',
                delivery_dttm: '',
                letak_janin: '',
                kondisi: '',
                use_manual: false,
                use_forcep: false,
                use_vacuum: false,
                shk_spesimen_ambil: '',
                shk_lokasi: '',
                shk_spesimen_dttm: ''
            };
            setDeliveryEntries([defaultEntry]);
        }
    }, []);

    // Update formData whenever delivery entries change
    useEffect(() => {
        updateNestedField('persalinan', 'delivery', deliveryEntries);
    }, [deliveryEntries]);

    const addDeliveryEntry = () => {
        const newEntry: DeliveryEntry = {
            delivery_sequence: (deliveryEntries.length + 1).toString(),
            delivery_method: '',
            delivery_dttm: '',
            letak_janin: '',
            kondisi: '',
            use_manual: false,
            use_forcep: false,
            use_vacuum: false,
            shk_spesimen_ambil: '',
            shk_alasan: ''
        };
        setDeliveryEntries([...deliveryEntries, newEntry]);
    };

    const removeDeliveryEntry = (index: number) => {
        if (deliveryEntries.length > 1) {
            const updatedEntries = deliveryEntries.filter((_, i) => i !== index);
            // Update sequence numbers
            const resequenced = updatedEntries.map((entry, i) => ({
                ...entry,
                delivery_sequence: (i + 1).toString()
            }));
            setDeliveryEntries(resequenced);
        }
    };

    const updateDeliveryEntry = (index: number, field: keyof DeliveryEntry, value: any) => {
        const updatedEntries = [...deliveryEntries];
        updatedEntries[index] = { ...updatedEntries[index], [field]: value };
        setDeliveryEntries(updatedEntries);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Persalinan</h3>
            
            {/* Basic Persalinan Information */}
            <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-4 text-md font-semibold text-gray-800">Data Dasar Persalinan</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Usia Kehamilan (minggu)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={getNestedValue('persalinan', 'usia_kehamilan') || ''}
                            onChange={(e) => updateNestedField('persalinan', 'usia_kehamilan', e.target.value)}
                            placeholder="Usia kehamilan dalam minggu"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Gravida
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={getNestedValue('persalinan', 'gravida') || ''}
                            onChange={(e) => updateNestedField('persalinan', 'gravida', e.target.value)}
                            placeholder="Jumlah kehamilan"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Partus
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={getNestedValue('persalinan', 'partus') || ''}
                            onChange={(e) => updateNestedField('persalinan', 'partus', e.target.value)}
                            placeholder="Jumlah persalinan"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Abortus
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={getNestedValue('persalinan', 'abortus') || ''}
                            onChange={(e) => updateNestedField('persalinan', 'abortus', e.target.value)}
                            placeholder="Jumlah abortus"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Onset Kontraksi
                        </label>
                        <SearchableSelect
                            options={[
                                { value: 'spontan', label: 'Spontan' },
                                { value: 'induksi', label: 'Induksi' },
                                { value: 'non_spontan_non_induksi', label: 'Non Spontan Non Induksi' },
                            ]}
                            value={getNestedValue('persalinan', 'onset_kontraksi') || ''}
                            onSelect={(value: string) => updateNestedField('persalinan', 'onset_kontraksi', value)}
                            placeholder="Pilih onset kontraksi..."
                            searchPlaceholder="Cari onset kontraksi..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Delivery Entries */}
            <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-800">Detail Persalinan</h4>
                    <Button
                        onClick={addDeliveryEntry}
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Persalinan
                    </Button>
                </div>

                <div className="space-y-6">
                    {deliveryEntries.map((delivery, index) => (
                        <div key={index} className="rounded-lg border border-gray-100 p-4 bg-gray-50">
                            <div className="mb-3 flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-700">
                                    Persalinan ke-{delivery.delivery_sequence}
                                </h5>
                                {deliveryEntries.length > 1 && (
                                    <Button
                                        onClick={() => removeDeliveryEntry(index)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Metode Persalinan
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'vaginal', label: 'Vaginal' },
                                            { value: 'sc', label: 'SC (Sectio Caesarea)' },
                                        ]}
                                        value={delivery.delivery_method || ''}
                                        onSelect={(value: string) => updateDeliveryEntry(index, 'delivery_method', value)}
                                        placeholder="Pilih metode persalinan..."
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Tanggal & Waktu Persalinan
                                    </label>
                                    <DateTimeInput
                                        value={delivery.delivery_dttm || ''}
                                        onChange={(value) => updateDeliveryEntry(index, 'delivery_dttm', value)}
                                        placeholder="dd/mm/yyyy hh:mm:ss"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Letak Janin
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'kepala', label: 'Kepala/Vertex' },
                                            { value: 'sungsang', label: 'Sungsang/Breech' },
                                            { value: 'lintang', label: 'Lintang/Transverse' },
                                        ]}
                                        value={delivery.letak_janin || ''}
                                        onSelect={(value: string) => updateDeliveryEntry(index, 'letak_janin', value)}
                                        placeholder="Pilih letak janin..."
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Kondisi Bayi
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'livebirth', label: 'Livebirth' },
                                            { value: 'stillbirth', label: 'Stillbirth' },
                                        ]}
                                        value={delivery.kondisi || ''}
                                        onSelect={(value: string) => updateDeliveryEntry(index, 'kondisi', value)}
                                        placeholder="Pilih kondisi bayi..."
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        SHK Spesimen Ambil
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'ya', label: 'Ya' },
                                            { value: 'tidak', label: 'Tidak' },
                                        ]}
                                        value={delivery.shk_spesimen_ambil || ''}
                                        onSelect={(value: string) => updateDeliveryEntry(index, 'shk_spesimen_ambil', value)}
                                        placeholder="Pilih SHK spesimen..."
                                        className="w-full"
                                    />
                                </div>
                                {index === 0 && delivery.shk_spesimen_ambil === 'ya' && (
                                    <>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                SHK Lokasi
                                            </label>
                                            <SearchableSelect
                                                options={[
                                                    { value: 'tumit', label: 'Tumit' },
                                                    { value: 'vena', label: 'Vena' },
                                                ]}
                                                value={delivery.shk_lokasi || ''}
                                                onSelect={(value: string) => updateDeliveryEntry(index, 'shk_lokasi', value)}
                                                placeholder="Pilih lokasi spesimen..."
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                SHK Spesimen Tanggal & Waktu
                                            </label>
                                            <DateTimeInput
                                                value={delivery.shk_spesimen_dttm || ''}
                                                onChange={(value) => updateDeliveryEntry(index, 'shk_spesimen_dttm', value)}
                                                placeholder="dd/mm/yyyy hh:mm:ss"
                                            />
                                        </div>
                                    </>
                                )}
                                {index === 1 && delivery.shk_spesimen_ambil === 'ya' && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            SHK Alasan
                                        </label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'tidak-dapat', label: 'Tidak Dapat' },
                                                { value: 'akses-sulit', label: 'Akses Sulit' },
                                            ]}
                                            value={delivery.shk_alasan || ''}
                                            onSelect={(value: string) => updateDeliveryEntry(index, 'shk_alasan', value)}
                                            placeholder="Pilih alasan..."
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Manual Assistance Options */}
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Bantuan Manual
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'tidak', label: 'Tidak' },
                                            { value: 'ya', label: 'Ya' },
                                        ]}
                                        value={delivery.use_manual ? 'ya' : 'tidak'}
                                        onSelect={(value: string) => updateDeliveryEntry(index, 'use_manual', value === 'ya')}
                                        placeholder="Pilih bantuan manual..."
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Bantuan Forcep
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'tidak', label: 'Tidak' },
                                            { value: 'ya', label: 'Ya' },
                                        ]}
                                        value={delivery.use_forcep ? 'ya' : 'tidak'}
                                        onSelect={(value: string) => updateDeliveryEntry(index, 'use_forcep', value === 'ya')}
                                        placeholder="Pilih bantuan forcep..."
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Bantuan Vacuum
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'tidak', label: 'Tidak' },
                                            { value: 'ya', label: 'Ya' },
                                        ]}
                                        value={delivery.use_vacuum ? 'ya' : 'tidak'}
                                        onSelect={(value: string) => updateDeliveryEntry(index, 'use_vacuum', value === 'ya')}
                                        placeholder="Pilih bantuan vacuum..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}