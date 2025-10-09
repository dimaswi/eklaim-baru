import React from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
    getNestedValue: (parent: string, field: string) => string;
    updateNestedField: (parent: string, field: string, value: any) => void;
}

export default function COVIDTab({ formData, updateField, getNestedValue, updateNestedField }: Props) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi COVID-19</h3>
            
            {/* Jenazah Information */}
            <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-4 text-md font-semibold text-gray-800">Informasi Jenazah</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Pemulasaraan Jenazah
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.pemulasaraan_jenazah || ''}
                            onChange={(e) => updateField('pemulasaraan_jenazah', e.target.value)}
                            placeholder="Jumlah pemulasaraan jenazah"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Kantong Jenazah
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.kantong_jenazah || ''}
                            onChange={(e) => updateField('kantong_jenazah', e.target.value)}
                            placeholder="Jumlah kantong jenazah"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Peti Jenazah
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.peti_jenazah || ''}
                            onChange={(e) => updateField('peti_jenazah', e.target.value)}
                            placeholder="Jumlah peti jenazah"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Plastik Erat
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.plastik_erat || ''}
                            onChange={(e) => updateField('plastik_erat', e.target.value)}
                            placeholder="Jumlah plastik erat"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Desinfektan Jenazah
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.desinfektan_jenazah || ''}
                            onChange={(e) => updateField('desinfektan_jenazah', e.target.value)}
                            placeholder="Jumlah desinfektan jenazah"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Mobil Jenazah
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.mobil_jenazah || ''}
                            onChange={(e) => updateField('mobil_jenazah', e.target.value)}
                            placeholder="Jumlah mobil jenazah"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Desinfektan Mobil Jenazah
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.desinfektan_mobil_jenazah || ''}
                            onChange={(e) => updateField('desinfektan_mobil_jenazah', e.target.value)}
                            placeholder="Jumlah desinfektan mobil jenazah"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* COVID-19 Status Information */}
            <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-4 text-md font-semibold text-gray-800">Status COVID-19</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            COVID-19 Status Code
                        </label>
                        <SearchableSelect
                            options={[
                                { value: '1', label: 'ODP (Orang Dalam Pemantauan)' },
                                { value: '2', label: 'PDP (Pasien Dalam Pengawasan)' },
                                { value: '3', label: 'Terkonfirmasi Positif COVID-19' },
                                { value: '4', label: 'Suspek' },
                                { value: '5', label: 'Probabel' },
                            ]}
                            value={formData.covid19_status_cd || ''}
                            onSelect={(value: string) => updateField('covid19_status_cd', value)}
                            placeholder="Pilih status COVID-19..."
                            searchPlaceholder="Cari status COVID-19..."
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nomor Kartu T
                        </label>
                        <SearchableSelect
                            options={[
                                { value: 'nik', label: 'NIK (Nomor Induk Kependudukan)' },
                                { value: 'kitas', label: 'KITAS/KITAP' },
                                { value: 'paspor', label: 'Nomor Passport (WNA)' },
                                { value: 'kartu_jkn', label: 'Nomor Kartu Peserta JKN (BPJS)' },
                                { value: 'kk', label: 'Nomor Kartu Keluarga' },
                                { value: 'unhcr', label: 'Dokumen UNHCR' },
                                { value: 'kelurahan', label: 'Dokumen Kelurahan' },
                                { value: 'dinsos', label: 'Dokumen Dinas Sosial' },
                                { value: 'dinkes', label: 'Dokumen Dinas Kesehatan' },
                                { value: 'sjp', label: 'Surat Jaminan Perawatan (SJP)' },
                                { value: 'klaim_ibu', label: 'Klaim Ibu (Bayi Baru Lahir)' },
                                { value: 'lainnya', label: 'Identitas Lainnya' },
                            ]}
                            value={formData.nomor_kartu_t || ''}
                            onSelect={(value: string) => updateField('nomor_kartu_t', value)}
                            placeholder="Pilih tipe nomor kartu..."
                            searchPlaceholder="Cari tipe nomor kartu..."
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Episodes
                        </label>
                        <input
                            type="text"
                            value={formData.episodes || ''}
                            onChange={(e) => updateField('episodes', e.target.value)}
                            placeholder="Format: 1;12#2;3#6;5 (ruangan;hari#ruangan;hari)"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Format: jenis_ruangan;lama_rawat#jenis_ruangan;lama_rawat<br/>
                            Jenis ruangan: 1-12 (ICU, Isolasi, dll)
                        </p>
                    </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="covid19_cc_ind"
                            checked={!!formData.covid19_cc_ind}
                            onChange={(e) => updateField('covid19_cc_ind', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="covid19_cc_ind" className="text-sm font-medium text-gray-700">
                            COVID-19 CC Indicator
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="covid19_rs_darurat_ind"
                            checked={!!formData.covid19_rs_darurat_ind}
                            onChange={(e) => updateField('covid19_rs_darurat_ind', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="covid19_rs_darurat_ind" className="text-sm font-medium text-gray-700">
                            COVID-19 RS Darurat Indicator
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="covid19_co_insidense_ind"
                            checked={!!formData.covid19_co_insidense_ind}
                            onChange={(e) => updateField('covid19_co_insidense_ind', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="covid19_co_insidense_ind" className="text-sm font-medium text-gray-700">
                            COVID-19 Co-insidence Indicator
                        </label>
                    </div>
                </div>
            </div>

            {/* COVID-19 Penunjang Pengurang */}
            <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-4 text-md font-semibold text-gray-800">COVID-19 Penunjang Pengurang</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab Asam Laktat
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_asam_laktat') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_asam_laktat', e.target.value)}
                            placeholder="Nilai lab asam laktat"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab Procalcitonin
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_procalcitonin') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_procalcitonin', e.target.value)}
                            placeholder="Nilai lab procalcitonin"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab CRP
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_crp') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_crp', e.target.value)}
                            placeholder="Nilai lab CRP"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab Kultur
                        </label>
                        <input
                            type="text"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_kultur') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_kultur', e.target.value)}
                            placeholder="Hasil lab kultur"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab D-Dimer
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_d_dimer') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_d_dimer', e.target.value)}
                            placeholder="Nilai lab D-Dimer"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab PT
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_pt') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_pt', e.target.value)}
                            placeholder="Nilai lab PT"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab APTT
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_aptt') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_aptt', e.target.value)}
                            placeholder="Nilai lab APTT"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab Waktu Pendarahan
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_waktu_pendarahan') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_waktu_pendarahan', e.target.value)}
                            placeholder="Nilai lab waktu pendarahan"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab Anti HIV
                        </label>
                        <input
                            type="text"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_anti_hiv') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_anti_hiv', e.target.value)}
                            placeholder="Hasil lab anti HIV"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab Analisa Gas
                        </label>
                        <input
                            type="text"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_analisa_gas') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_analisa_gas', e.target.value)}
                            placeholder="Hasil lab analisa gas"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lab Albumin
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={getNestedValue('covid19_penunjang_pengurang', 'lab_albumin') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'lab_albumin', e.target.value)}
                            placeholder="Nilai lab albumin"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Radiologi Thorax AP/PA
                        </label>
                        <input
                            type="text"
                            value={getNestedValue('covid19_penunjang_pengurang', 'rad_thorax_ap_pa') || ''}
                            onChange={(e) => updateNestedField('covid19_penunjang_pengurang', 'rad_thorax_ap_pa', e.target.value)}
                            placeholder="Hasil radiologi thorax AP/PA"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}