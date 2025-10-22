import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, X } from 'lucide-react';

interface IdrgGroupingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIdrgDiagnoses: { name: string; code: string }[];
    selectedIdrgProcedures: { name: string; code: string }[];
    onOpenDiagnosisModal: () => void;
    onOpenProcedureModal: () => void;
    onRemoveDiagnosis: (code: string) => void;
    onRemoveProcedure: (code: string) => void;
    onPerformGrouping: () => void;
    isLoading: boolean;
}

export default function IdrgGroupingModal({
    isOpen,
    onClose,
    selectedIdrgDiagnoses,
    selectedIdrgProcedures,
    onOpenDiagnosisModal,
    onOpenProcedureModal,
    onRemoveDiagnosis,
    onRemoveProcedure,
    onPerformGrouping,
    isLoading
}: IdrgGroupingModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">🔄</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">IDRG Grouping</h2>
                            <p className="text-sm text-gray-600 font-normal">
                                Pilih diagnosis dan prosedur IDRG untuk melakukan grouping
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                
                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="space-y-6 p-6">
                        {/* Diagnosis IDRG Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Diagnosis IDRG <span className="text-red-500">*</span>
                                </h3>
                                <Button
                                    onClick={onOpenDiagnosisModal}
                                    disabled={isLoading}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Cari Diagnosis
                                </Button>
                            </div>
                            
                            {selectedIdrgDiagnoses.length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(
                                        selectedIdrgDiagnoses.reduce((acc, diagnosis) => {
                                            if (!acc[diagnosis.code]) {
                                                acc[diagnosis.code] = { ...diagnosis, count: 0 };
                                            }
                                            acc[diagnosis.code].count++;
                                            return acc;
                                        }, {} as Record<string, { name: string; code: string; count: number }>)
                                    ).map(([code, diagnosisWithCount]) => (
                                        <div key={code} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                                            <div className="flex-1">
                                                <div className="font-medium text-blue-900">{diagnosisWithCount.code}</div>
                                                <div className="text-sm text-blue-700">{diagnosisWithCount.name}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                    {diagnosisWithCount.count}x
                                                </Badge>
                                                <Button
                                                    onClick={() => onRemoveDiagnosis(diagnosisWithCount.code)}
                                                    disabled={isLoading}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p>Belum ada diagnosis IDRG dipilih</p>
                                    <p className="text-sm">Klik "Cari Diagnosis" untuk menambahkan</p>
                                </div>
                            )}
                        </div>

                        {/* Procedure IDRG Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Prosedur IDRG</h3>
                                <Button
                                    onClick={onOpenProcedureModal}
                                    disabled={isLoading}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Cari Prosedur
                                </Button>
                            </div>
                            
                            {selectedIdrgProcedures.length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(
                                        selectedIdrgProcedures.reduce((acc, procedure) => {
                                            if (!acc[procedure.code]) {
                                                acc[procedure.code] = { ...procedure, count: 0 };
                                            }
                                            acc[procedure.code].count++;
                                            return acc;
                                        }, {} as Record<string, { name: string; code: string; count: number }>)
                                    ).map(([code, procedureWithCount]) => (
                                        <div key={code} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                                            <div className="flex-1">
                                                <div className="font-medium text-green-900">{procedureWithCount.code}</div>
                                                <div className="text-sm text-green-700">{procedureWithCount.name}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    {procedureWithCount.count}x
                                                </Badge>
                                                <Button
                                                    onClick={() => onRemoveProcedure(procedureWithCount.code)}
                                                    disabled={isLoading}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p>Belum ada prosedur IDRG dipilih</p>
                                    <p className="text-sm">Klik "Cari Prosedur" untuk menambahkan (opsional)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        <span className="text-red-500">*</span> Diagnosis IDRG wajib dipilih minimal 1
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            disabled={isLoading}
                            variant="outline"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={onPerformGrouping}
                            disabled={isLoading || selectedIdrgDiagnoses.length === 0}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Proses Grouping...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>🔄</span>
                                    <span>Lakukan IDRG Grouping</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}