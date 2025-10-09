import React from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
}

export default function ICUTab({ formData, updateField }: Props) {
    // Handle ICU indicator change and clear related fields if disabled
    const handleICUIndicatorChange = (value: string) => {
        updateField('icu_indikator', value);
        
        // If ICU indicator is set to "0" (Tidak Ada ICU), clear all related fields
        if (value === '0') {
            updateField('adl_sub_acute', '');
            updateField('adl_chronic', '');
            updateField('icu_los', '');
        }
    };

    const isICUEnabled = formData.icu_indikator === '1';

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi ICU</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        ICU Indikator
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '0', label: 'Tidak Ada ICU' },
                            { value: '1', label: 'Ada ICU' },
                        ]}
                        value={formData.icu_indikator || '0'}
                        onSelect={handleICUIndicatorChange}
                        placeholder="Pilih status ICU..."
                        searchPlaceholder="Cari status ICU..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        ADL Sub Acute (12-60)
                    </label>
                    <input
                        type="number"
                        min="12"
                        max="60"
                        value={formData.adl_sub_acute || '0'}
                        onChange={(e) => updateField('adl_sub_acute', e.target.value)}
                        disabled={!isICUEnabled}
                        placeholder={isICUEnabled ? "Masukkan skor ADL Sub Acute" : "Aktifkan ICU terlebih dahulu"}
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isICUEnabled ? 'bg-gray-50 text-gray-400' : ''}`}
                    />
                    {!isICUEnabled && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena ICU tidak digunakan</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        ADL Chronic (12-60)
                    </label>
                    <input
                        type="number"
                        min="12"
                        max="60"
                        value={formData.adl_chronic || '0'}
                        onChange={(e) => updateField('adl_chronic', e.target.value)}
                        disabled={!isICUEnabled}
                        placeholder={isICUEnabled ? "Masukkan skor ADL Chronic" : "Aktifkan ICU terlebih dahulu"}
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isICUEnabled ? 'bg-gray-50 text-gray-400' : ''}`}
                    />
                    {!isICUEnabled && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena ICU tidak digunakan</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        ICU LOS (Hari)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.icu_los || '0'}
                        onChange={(e) => updateField('icu_los', e.target.value)}
                        disabled={!isICUEnabled}
                        placeholder={isICUEnabled ? "Jumlah hari rawat ICU" : "Aktifkan ICU terlebih dahulu"}
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isICUEnabled ? 'bg-gray-50 text-gray-400' : ''}`}
                    />
                    {!isICUEnabled && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena ICU tidak digunakan</p>
                    )}
                </div>
            </div>
        </div>
    );
}