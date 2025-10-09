import React from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
}

export default function UpgradeKelasTab({ formData, updateField }: Props) {
    // Handle upgrade class indicator change and clear related fields if disabled
    const handleUpgradeClassIndicatorChange = (value: string) => {
        updateField('upgrade_class_ind', value);
        
        // If upgrade class indicator is set to "0" (Tidak Ada Naik Kelas), clear all related fields
        if (value === '0') {
            updateField('upgrade_class_class', '');
            updateField('upgrade_class_los', '');
            updateField('upgrade_class_payor', '');
            updateField('add_payment_pct', '');
        }
    };

    const isUpgradeClassEnabled = formData.upgrade_class_ind === '1';

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Upgrade Kelas</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Indikator Naik Kelas
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '0', label: 'Tidak Ada Naik Kelas' },
                            { value: '1', label: 'Ada Naik Kelas' },
                        ]}
                        value={formData.upgrade_class_ind || '0'}
                        onSelect={handleUpgradeClassIndicatorChange}
                        placeholder="Pilih status naik kelas..."
                        searchPlaceholder="Cari status naik kelas..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Kelas Tujuan
                    </label>
                    <SearchableSelect
                        options={[
                            { value: 'kelas_1', label: 'Kelas 1' },
                            { value: 'kelas_2', label: 'Kelas 2' },
                            { value: 'vip', label: 'VIP' },
                            { value: 'vvip', label: 'VVIP' },
                        ]}
                        value={formData.upgrade_class_class || ''}
                        onSelect={(value: string) => updateField('upgrade_class_class', value)}
                        placeholder={isUpgradeClassEnabled ? "Pilih kelas tujuan..." : "Aktifkan naik kelas terlebih dahulu"}
                        searchPlaceholder="Cari kelas tujuan..."
                        className="w-full"
                        disabled={!isUpgradeClassEnabled}
                    />
                    {!isUpgradeClassEnabled && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena tidak ada naik kelas</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        LOS Naik Kelas (Hari)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.upgrade_class_los || ''}
                        onChange={(e) => updateField('upgrade_class_los', e.target.value)}
                        disabled={!isUpgradeClassEnabled}
                        placeholder={isUpgradeClassEnabled ? "Jumlah hari naik kelas" : "Aktifkan naik kelas terlebih dahulu"}
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isUpgradeClassEnabled ? 'bg-gray-50 text-gray-400' : ''}`}
                    />
                    {!isUpgradeClassEnabled && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena tidak ada naik kelas</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Pembayar Naik Kelas
                    </label>
                    <SearchableSelect
                        options={[
                            { value: 'peserta', label: 'Peserta' },
                            { value: 'pemberi_kerja', label: 'Pemberi Kerja' },
                            { value: 'asuransi_tambahan', label: 'Asuransi Tambahan' },
                        ]}
                        value={formData.upgrade_class_payor || ''}
                        onSelect={(value: string) => updateField('upgrade_class_payor', value)}
                        placeholder={isUpgradeClassEnabled ? "Pilih pembayar..." : "Aktifkan naik kelas terlebih dahulu"}
                        searchPlaceholder="Cari pembayar..."
                        className="w-full"
                        disabled={!isUpgradeClassEnabled}
                    />
                    {!isUpgradeClassEnabled && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena tidak ada naik kelas</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Persentase Tambahan Bayar
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.add_payment_pct || ''}
                        onChange={(e) => updateField('add_payment_pct', e.target.value)}
                        disabled={!isUpgradeClassEnabled}
                        placeholder={isUpgradeClassEnabled ? "Persentase tambahan bayar" : "Aktifkan naik kelas terlebih dahulu"}
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isUpgradeClassEnabled ? 'bg-gray-50 text-gray-400' : ''}`}
                    />
                    {!isUpgradeClassEnabled && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena tidak ada naik kelas</p>
                    )}
                </div>
            </div>
        </div>
    );
}