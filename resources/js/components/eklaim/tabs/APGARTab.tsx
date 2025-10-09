import React from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface Props {
    formData: { [key: string]: any };
    getNestedValue: (parent: string, field: string) => string;
    updateNestedField: (parent: string, field: string, value: any) => void;
}

export default function APGARTab({ formData, getNestedValue, updateNestedField }: Props) {
    const apgarOptions = [
        { value: '0', label: '0' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">APGAR Score (Penilaian Bayi Baru Lahir)</h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* APGAR 1 Menit */}
                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-800">APGAR 1 Menit</h4>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Appearance (Warna Kulit)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_1', 'appearance') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_1', 'appearance', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Pulse (Denyut Jantung)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_1', 'pulse') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_1', 'pulse', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Grimace (Respon Rangsang)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_1', 'grimace') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_1', 'grimace', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Activity (Tonus Otot)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_1', 'activity') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_1', 'activity', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Respiration (Usaha Bernapas)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_1', 'respiration') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_1', 'respiration', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* APGAR 5 Menit */}
                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-800">APGAR 5 Menit</h4>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Appearance (Warna Kulit)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_5', 'appearance') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_5', 'appearance', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Pulse (Denyut Jantung)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_5', 'pulse') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_5', 'pulse', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Grimace (Respon Rangsang)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_5', 'grimace') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_5', 'grimace', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Activity (Tonus Otot)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_5', 'activity') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_5', 'activity', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Respiration (Usaha Bernapas)
                            </label>
                            <SearchableSelect
                                options={apgarOptions}
                                value={getNestedValue('apgar.menit_5', 'respiration') || ''}
                                onSelect={(value: string) => updateNestedField('apgar.menit_5', 'respiration', value)}
                                placeholder="Pilih skor..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}