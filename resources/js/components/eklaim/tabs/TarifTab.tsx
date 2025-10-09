import React from 'react';
import CurrencyInput from '../CurrencyInput';

interface Props {
    formData: { [key: string]: any };
    getNestedValue: (parent: string, field: string) => string;
    updateNestedField: (parent: string, field: string, value: any) => void;
    calculateTotalTarif: () => number;
    formatRupiah: (amount: string | number) => string;
}

export default function TarifTab({ 
    formData, 
    getNestedValue, 
    updateNestedField, 
    calculateTotalTarif, 
    formatRupiah 
}: Props) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Tarif Rumah Sakit</h3>
            
            {/* Enhanced helper message */}
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Informasi Penting</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Pastikan nominal tarif sesuai dengan layanan yang telah diberikan</li>
                                <li>Isi semua komponen tarif yang relevan dengan kondisi pasien</li>
                                <li>Total tarif akan dihitung otomatis berdasarkan input yang dimasukkan</li>
                                <li>Verifikasi kembali sebelum melakukan submit data</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CurrencyInput
                    label="Prosedur Non Bedah *"
                    value={getNestedValue('tarif_rs', 'prosedur_non_bedah') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'prosedur_non_bedah', value)}
                />
                <CurrencyInput
                    label="Prosedur Bedah *"
                    value={getNestedValue('tarif_rs', 'prosedur_bedah') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'prosedur_bedah', value)}
                />
                <CurrencyInput
                    label="Konsultasi *"
                    value={getNestedValue('tarif_rs', 'konsultasi') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'konsultasi', value)}
                />
                <CurrencyInput
                    label="Tenaga Ahli *"
                    value={getNestedValue('tarif_rs', 'tenaga_ahli') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'tenaga_ahli', value)}
                />
                <CurrencyInput
                    label="Keperawatan *"
                    value={getNestedValue('tarif_rs', 'keperawatan') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'keperawatan', value)}
                />
                <CurrencyInput
                    label="Penunjang *"
                    value={getNestedValue('tarif_rs', 'penunjang') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'penunjang', value)}
                />
                <CurrencyInput
                    label="Radiologi *"
                    value={getNestedValue('tarif_rs', 'radiologi') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'radiologi', value)}
                />
                <CurrencyInput
                    label="Laboratorium *"
                    value={getNestedValue('tarif_rs', 'laboratorium') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'laboratorium', value)}
                />
                <CurrencyInput
                    label="Pelayanan Darah *"
                    value={getNestedValue('tarif_rs', 'pelayanan_darah') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'pelayanan_darah', value)}
                />
                <CurrencyInput
                    label="Rehabilitasi *"
                    value={getNestedValue('tarif_rs', 'rehabilitasi') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'rehabilitasi', value)}
                />
                <CurrencyInput
                    label="Kamar *"
                    value={getNestedValue('tarif_rs', 'kamar') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'kamar', value)}
                />
                <CurrencyInput
                    label="Rawat Intensif *"
                    value={getNestedValue('tarif_rs', 'rawat_intensif') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'rawat_intensif', value)}
                />
                <CurrencyInput
                    label="Obat *"
                    value={getNestedValue('tarif_rs', 'obat') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'obat', value)}
                />
                <CurrencyInput
                    label="Obat Kronis *"
                    value={getNestedValue('tarif_rs', 'obat_kronis') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'obat_kronis', value)}
                />
                <CurrencyInput
                    label="Obat Kemoterapi *"
                    value={getNestedValue('tarif_rs', 'obat_kemoterapi') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'obat_kemoterapi', value)}
                />
                <CurrencyInput
                    label="Alat Kesehatan (Alkes) *"
                    value={getNestedValue('tarif_rs', 'alkes') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'alkes', value)}
                />
                <CurrencyInput
                    label="BMHP *"
                    value={getNestedValue('tarif_rs', 'bmhp') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'bmhp', value)}
                />
                <CurrencyInput
                    label="Sewa Alat *"
                    value={getNestedValue('tarif_rs', 'sewa_alat') || '0'}
                    onChange={(value) => updateNestedField('tarif_rs', 'sewa_alat', value)}
                />
            </div>
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">Total Tarif</h4>
                <p className="text-2xl font-bold text-blue-600">{formatRupiah(calculateTotalTarif())}</p>
            </div>
        </div>
    );
}