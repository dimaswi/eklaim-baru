import { SearchableSelect } from '@/components/ui/searchable-select';
import CurrencyInput from '../CurrencyInput';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect } from 'react';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
}

export default function DataRSTab({ formData, updateField }: Props) {
    const { auth } = usePage<SharedData>().props;
    
    // Auto-populate coder_nik with current user's NIK
    useEffect(() => {
        if (auth.user.nik && !formData.coder_nik) {
            updateField('coder_nik', auth.user.nik);
        }
    }, [auth.user.nik, formData.coder_nik, updateField]);

    // Mapping between payor_id and payor_cd
    const payorMapping = {
        '00003': 'JKN',
        '00071': 'JAMINAN COVID - 19',
        '00072': 'JAMINAN KIPI',
        '00073': 'JAMINAN BAYI BARU LAHIR',
        '00074': 'JAMINAN PERPANJANG MASA RAWAT',
        '00075': 'JAMINAN CO-INSIDENSE',
        '00076': 'JAMPERSAL',
        '00077': 'JAMINAN PEMULIHAN KESEHATAN PRIORITAS',
        '00005': 'JAMKESDA',
        '00006': 'JAMKESOS',
        '00001': 'PASIEN BAYAR',
    };

    // Reverse mapping for payor_cd to payor_id
    const payorReverseMapping = Object.fromEntries(Object.entries(payorMapping).map(([id, code]) => [code, id]));

    // Handle payor_id change and auto-fill payor_cd
    const handlePayorIdChange = (value: string) => {
        updateField('payor_id', value);
        const correspondingCode = payorMapping[value as keyof typeof payorMapping];
        if (correspondingCode) {
            updateField('payor_cd', correspondingCode);
        }
    };

    // Handle payor_cd change and auto-fill payor_id
    const handlePayorCdChange = (value: string) => {
        updateField('payor_cd', value);
        const correspondingId = payorReverseMapping[value];
        if (correspondingId) {
            updateField('payor_id', correspondingId);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Rumah Sakit</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CurrencyInput
                    label="Tarif Poli Eksekutif"
                    value={formData.tarif_poli_eks || ''}
                    onChange={(value) => updateField('tarif_poli_eks', value)}
                />
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nama Dokter <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="text"
                        value={formData.nama_dokter || ''}
                        onChange={(e) => updateField('nama_dokter', e.target.value)}
                        placeholder="Nama dokter penanggung jawab"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Kode Tarif <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="text"
                        value={formData.kode_tarif || 'DS'}
                        onChange={(e) => updateField('kode_tarif', e.target.value)}
                        placeholder="Kode tarif"
                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        readOnly
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Payor ID <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '00003', label: 'JKN' },
                            { value: '00071', label: 'JAMINAN COVID - 19' },
                            { value: '00072', label: 'JAMINAN KIPI' },
                            { value: '00073', label: 'JAMINAN BAYI BARU LAHIR' },
                            { value: '00074', label: 'JAMINAN PERPANJANG MASA RAWAT' },
                            { value: '00075', label: 'JAMINAN CO-INSIDENSE' },
                            { value: '00076', label: 'JAMPERSAL' },
                            { value: '00077', label: 'JAMINAN PEMULIHAN KESEHATAN PRIORITAS' },
                            { value: '00005', label: 'JAMKESDA' },
                            { value: '00006', label: 'JAMKESOS' },
                            { value: '00001', label: 'PASIEN BAYAR' },
                        ]}
                        value={formData.payor_id || '00003'}
                        onSelect={handlePayorIdChange}
                        placeholder="Pilih payor ID..."
                        searchPlaceholder="Cari payor ID..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Payor Code <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <SearchableSelect
                        options={[
                            { value: 'JKN', label: 'JKN' },
                            { value: 'JAMINAN COVID - 19', label: 'JAMINAN COVID - 19' },
                            { value: 'JAMINAN KIPI', label: 'JAMINAN KIPI' },
                            { value: 'JAMINAN BAYI BARU LAHIR', label: 'JAMINAN BAYI BARU LAHIR' },
                            { value: 'JAMINAN PERPANJANG MASA RAWAT', label: 'JAMINAN PERPANJANG MASA RAWAT' },
                            { value: 'JAMINAN CO-INSIDENSE', label: 'JAMINAN CO-INSIDENSE' },
                            { value: 'JAMPERSAL', label: 'JAMPERSAL' },
                            { value: 'JAMINAN PEMULIHAN KESEHATAN PRIORITAS', label: 'JAMINAN PEMULIHAN KESEHATAN PRIORITAS' },
                            { value: 'JAMKESDA', label: 'JAMKESDA' },
                            { value: 'JAMKESOS', label: 'JAMKESOS' },
                            { value: 'PASIEN BAYAR', label: 'PASIEN BAYAR' },
                        ]}
                        value={formData.payor_cd || 'JKN'}
                        onSelect={handlePayorCdChange}
                        placeholder="Pilih payor code..."
                        searchPlaceholder="Cari payor code..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">COB Code</label>
                    <input
                        type="text"
                        value={formData.cob_cd || ''}
                        onChange={(e) => updateField('cob_cd', e.target.value)}
                        placeholder="Kode COB (contoh: 0001)"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        NIK Coder <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="text"
                        value={formData.coder_nik || ''}
                        onChange={(e) => updateField('coder_nik', e.target.value)}
                        placeholder={auth.user.nik ? `Auto: ${auth.user.nik}` : "NIK belum diset pada user"}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        readOnly
                        title={auth.user.nik ? `NIK otomatis diambil dari user: ${auth.user.name}` : "User belum memiliki NIK, silakan update di profile user"}
                    />
                </div>
            </div>
        </div>
    );
}
