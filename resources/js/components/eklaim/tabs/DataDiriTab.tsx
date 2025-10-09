import React from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
    referenceData: {
        cara_masuk_options: Array<{ value: string; label: string }>;
        jenis_rawat_options: Array<{ value: string; label: string }>;
        kelas_rawat_options: Array<{ value: string; label: string }>;
        [key: string]: any;
    };
}

export default function DataDiriTab({ formData, updateField, referenceData }: Props) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Diri Pasien</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nomor SEP <span className="text-red-500 px-2">*</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="text"
                        value={formData.nomor_sep || ''}
                        onChange={(e) => updateField('nomor_sep', e.target.value)}
                        placeholder="Masukkan nomor SEP"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nomor Kartu BPJS <span className="text-red-500 px-2">*</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="text"
                        value={formData.nomor_kartu || ''}
                        onChange={(e) => updateField('nomor_kartu', e.target.value)}
                        placeholder="Masukkan nomor kartu"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Tanggal Masuk <span className="text-red-500 px-2">*</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.tgl_masuk || ''}
                        onChange={(e) => updateField('tgl_masuk', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Tanggal Pulang <span className="text-red-500 px-2">*</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.tgl_pulang || ''}
                        onChange={(e) => updateField('tgl_pulang', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Cara Masuk <span className="text-red-500 px-2">*</span>
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Manual</span>
                    </label>
                    <SearchableSelect
                        options={referenceData.cara_masuk_options || [
                            { value: 'gp', label: 'Rujukan FKTP' },
                            { value: 'hosp-trans', label: 'Rujukan FKRTL' },
                            { value: 'mp', label: 'Rujukan Spesialis' },
                            { value: 'outp', label: 'Dari Rawat Jalan' },
                            { value: 'inp', label: 'Dari Rawat Inap' },
                            { value: 'emd', label: 'Dari Rawat Darurat' },
                            { value: 'born', label: 'Lahir di RS' },
                            { value: 'nursing', label: 'Rujukan Panti Jompo' },
                            { value: 'psych', label: 'Rujukan dari RS Jiwa' },
                            { value: 'rehab', label: 'Rujukan Fasilitas Rehab' },
                            { value: 'other', label: 'Lain-lain' },
                        ]}
                        value={formData.cara_masuk || ''}
                        onSelect={(value: string) => updateField('cara_masuk', value)}
                        placeholder="Pilih cara masuk..."
                        searchPlaceholder="Cari cara masuk..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Jenis Rawat <span className="text-red-500 px-2">*</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <SearchableSelect
                        options={referenceData.jenis_rawat_options || [
                            { value: '1', label: 'Rawat Inap' },
                            { value: '2', label: 'Rawat Jalan' },
                            { value: '3', label: 'Rawat IGD' },
                        ]}
                        value={formData.jenis_rawat || ''}
                        onSelect={(value: string) => updateField('jenis_rawat', value)}
                        placeholder="Pilih jenis rawat..."
                        searchPlaceholder="Cari jenis rawat..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Kelas Rawat <span className="text-red-500 px-2">*</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <SearchableSelect
                        options={referenceData.kelas_rawat_options || [
                            { value: '3', label: 'Kelas 3' },
                            { value: '2', label: 'Kelas 2' },
                            { value: '1', label: 'Kelas 1' },
                        ]}
                        value={formData.kelas_rawat || ''}
                        onSelect={(value: string) => updateField('kelas_rawat', value)}
                        placeholder="Pilih kelas rawat..."
                        searchPlaceholder="Cari kelas rawat..."
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}