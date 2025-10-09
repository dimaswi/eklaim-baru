import React from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import CurrencyInput from '../CurrencyInput';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
}

export default function LainLainTab({ formData, updateField }: Props) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Lain-lain</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CurrencyInput
                    label="Terapi Konvalesen"
                    value={formData.terapi_konvalesen || ''}
                    onChange={(value) => updateField('terapi_konvalesen', value)}
                />
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Akses NAAT
                    </label>
                    <SearchableSelect
                        options={[
                            { value: 'A', label: 'A' },
                            { value: 'B', label: 'B' },
                            { value: 'C', label: 'C' },
                        ]}
                        value={formData.akses_naat || ''}
                        onSelect={(value: string) => updateField('akses_naat', value)}
                        placeholder="Pilih kategori akses NAAT..."
                        searchPlaceholder="Cari kategori akses NAAT..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Isolasi Mandiri
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '0', label: 'Tidak' },
                            { value: '1', label: 'Ya' },
                        ]}
                        value={formData.isoman_ind || ''}
                        onSelect={(value: string) => updateField('isoman_ind', value)}
                        placeholder="Pilih status isolasi mandiri..."
                        searchPlaceholder="Cari status isolasi mandiri..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Status Bayi Lahir
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '1', label: 'Tanpa Kelainan' },
                            { value: '2', label: 'Dengan Kelainan' },
                        ]}
                        value={formData.bayi_lahir_status_cd || ''}
                        onSelect={(value: string) => updateField('bayi_lahir_status_cd', value)}
                        placeholder="Pilih status bayi lahir..."
                        searchPlaceholder="Cari status bayi lahir..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Dializer Single Use
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '0', label: 'Multiple Use' },
                            { value: '1', label: 'Single Use' },
                        ]}
                        value={formData.dializer_single_use || ''}
                        onSelect={(value: string) => updateField('dializer_single_use', value)}
                        placeholder="Pilih tipe dializer..."
                        searchPlaceholder="Cari tipe dializer..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Kantong Darah
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.kantong_darah || ''}
                        onChange={(e) => updateField('kantong_darah', e.target.value)}
                        placeholder="Jumlah kantong darah"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Alteplase
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '0', label: 'Tidak' },
                            { value: '1', label: 'Ya' },
                        ]}
                        value={formData.alteplase_ind || ''}
                        onSelect={(value: string) => updateField('alteplase_ind', value)}
                        placeholder="Pilih status alteplase..."
                        searchPlaceholder="Cari status alteplase..."
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}