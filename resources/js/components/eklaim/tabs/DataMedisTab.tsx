import React from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { Search, X, RefreshCw } from 'lucide-react';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
    referenceData: {
        discharge_status_options: Array<{ value: string; label: string }>;
        [key: string]: any;
    };
    selectedDiagnoses: { name: string; code: string }[];
    selectedProcedures: { name: string; code: string }[];
    selectedInagrouperDiagnoses: { name: string; code: string }[];
    selectedInagrouperProcedures: { name: string; code: string }[];
    handleRemoveDiagnosis: (code: string) => void;
    handleRemoveProcedure: (code: string) => void;
    handleRemoveInagrouperDiagnosis: (code: string) => void;
    handleRemoveInagrouperProcedure: (code: string) => void;
    handleSyncInagrouperDiagnoses: () => void;
    handleSyncInagrouperProcedures: () => void;
    setIsDiagnosisModalOpen: (open: boolean) => void;
    setIsProcedureModalOpen: (open: boolean) => void;
    setIsInagrouperDiagnosisModalOpen: (open: boolean) => void;
    setIsInagrouperProcedureModalOpen: (open: boolean) => void;
}

export default function DataMedisTab({
    formData,
    updateField,
    referenceData,
    selectedDiagnoses,
    selectedProcedures,
    selectedInagrouperDiagnoses,
    selectedInagrouperProcedures,
    handleRemoveDiagnosis,
    handleRemoveProcedure,
    handleRemoveInagrouperDiagnosis,
    handleRemoveInagrouperProcedure,
    handleSyncInagrouperDiagnoses,
    handleSyncInagrouperProcedures,
    setIsDiagnosisModalOpen,
    setIsProcedureModalOpen,
    setIsInagrouperDiagnosisModalOpen,
    setIsInagrouperProcedureModalOpen,
}: Props) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Data Medis</h3>
                <div className="rounded-md bg-blue-50 px-3 py-1">
                    <p className="text-xs text-blue-700">Data diambil otomatis dari Resume Medis</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Berat Lahir (gram)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.birth_weight || ''}
                        onChange={(e) => updateField('birth_weight', e.target.value)}
                        placeholder="Berat lahir dalam gram"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                        Sistole
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.sistole || ''}
                        onChange={(e) => updateField('sistole', e.target.value)}
                        placeholder="Tekanan darah sistole"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                        Diastole
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.diastole || ''}
                        onChange={(e) => updateField('diastole', e.target.value)}
                        placeholder="Tekanan darah diastole"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                        Status Pulang <span className="text-red-500">*</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <SearchableSelect
                        options={referenceData.discharge_status_options || [
                            { value: '1', label: 'Diijinkan Pulang' },
                            { value: '2', label: 'Dirujukan Ke RS Lain' },
                            { value: '3', label: 'Pulang Paksa / Lari / Pindah RS Lain' },
                            { value: '4', label: 'Meninggal / DOA' },
                            { value: '5', label: 'Masuk Rawat Inap' },
                        ]}
                        value={formData.discharge_status || ''}
                        onSelect={(value: string) => updateField('discharge_status', value)}
                        placeholder="Pilih status pulang..."
                        searchPlaceholder="Cari status pulang..."
                        className="w-full"
                    />
                </div>
            </div>

            {/* Diagnosa Sekunder */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Diagnosa
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <Button 
                        onClick={() => setIsDiagnosisModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="border-black text-black hover:bg-black hover:text-white"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Pilih Diagnosa
                    </Button>
                </div>
                <div className="space-y-2">
                    {selectedDiagnoses.map((diagnosis, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                        >
                            <div>
                                <div className="font-medium text-gray-900">{diagnosis.code}</div>
                                <div className="text-sm text-gray-600">{diagnosis.name}</div>
                            </div>
                            <Button
                                onClick={() => handleRemoveDiagnosis(diagnosis.code)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tindakan Sekunder */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Tindakan
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Auto</span>
                    </label>
                    <Button
                        onClick={() => setIsProcedureModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="border-black text-black hover:bg-black hover:text-white"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Pilih Tindakan
                    </Button>
                </div>
                <div className="space-y-2">
                    {selectedProcedures.map((procedure, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                        >
                            <div>
                                <div className="font-medium text-gray-900">{procedure.code}</div>
                                <div className="text-sm text-gray-600">{procedure.name}</div>
                            </div>
                            <Button
                                onClick={() => handleRemoveProcedure(procedure.code)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Diagnosa Inagrouper */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                        Diagnosa Inagrouper
                    </label>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSyncInagrouperDiagnoses}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            disabled={selectedDiagnoses.length === 0}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync dari Diagnosa
                        </Button>
                        <Button
                            onClick={() => setIsInagrouperDiagnosisModalOpen(true)}
                            variant="outline"
                            size="sm"
                            className="border-black text-black hover:bg-black hover:text-white"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Pilih Diagnosa
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    {selectedDiagnoses.length > 0 && selectedInagrouperDiagnoses.length === 0 && (
                        <div className="rounded-md border border-dashed border-gray-300 p-4 text-center">
                            <p className="text-sm text-gray-500">
                                Klik "Sync dari Diagnosa" untuk menyalin diagnosa ke inagrouper
                            </p>
                        </div>
                    )}
                    {selectedInagrouperDiagnoses.map((diagnosis, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                        >
                            <div>
                                <div className="font-medium text-gray-900">{diagnosis.code}</div>
                                <div className="text-sm text-gray-600">{diagnosis.name}</div>
                            </div>
                            <Button
                                onClick={() => handleRemoveInagrouperDiagnosis(diagnosis.code)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tindakan Inagrouper */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                        Tindakan Inagrouper
                    </label>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSyncInagrouperProcedures}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            disabled={selectedProcedures.length === 0}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync dari Tindakan
                        </Button>
                        <Button
                            onClick={() => setIsInagrouperProcedureModalOpen(true)}
                            variant="outline"
                            size="sm"
                            className="border-black text-black hover:bg-black hover:text-white"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Pilih Tindakan
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    {selectedProcedures.length > 0 && selectedInagrouperProcedures.length === 0 && (
                        <div className="rounded-md border border-dashed border-gray-300 p-4 text-center">
                            <p className="text-sm text-gray-500">
                                Klik "Sync dari Tindakan" untuk menyalin tindakan ke inagrouper
                            </p>
                        </div>
                    )}
                    {selectedInagrouperProcedures.map((procedure, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                        >
                            <div>
                                <div className="font-medium text-gray-900">{procedure.code}</div>
                                <div className="text-sm text-gray-600">{procedure.name}</div>
                            </div>
                            <Button
                                onClick={() => handleRemoveInagrouperProcedure(procedure.code)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}