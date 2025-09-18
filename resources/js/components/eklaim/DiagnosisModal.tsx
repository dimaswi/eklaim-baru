import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface Diagnosa {
    name: string;
    code: string;
}

interface DiagnosisModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDiagnosa: Diagnosa[];
    onSelectDiagnosis: (diagnosis: Diagnosa) => void;
    onRemoveDiagnosis: (code: string) => void;
}

export default function DiagnosisModal({
    isOpen,
    onClose,
    selectedDiagnosa,
    onSelectDiagnosis,
    onRemoveDiagnosis
}: DiagnosisModalProps) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<Diagnosa[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleSearchDiagnosis = async (keyword: string) => {
        if (!keyword || keyword.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await fetch(`/eklaim/referensi/diagnosis?keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            
            if (data.metadata?.code === 200 && data.response?.data) {
                const diagnoses = data.response.data.map((item: [string, string]) => ({
                    name: item[0],
                    code: item[1]
                }));
                setSearchResults(diagnoses);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            setSearchResults([]);
            toast.error('Tidak ada data diagnosis');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectDiagnosis = (diagnosis: Diagnosa) => {
        const isAlreadySelected = selectedDiagnosa.some(d => d.code === diagnosis.code);
        if (!isAlreadySelected) {
            onSelectDiagnosis(diagnosis);
        }
    };

    const handleRemoveDiagnosis = (code: string) => {
        onRemoveDiagnosis(code);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-7xl max-h-[90vh] w-[90vw] top-[35%] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Pencarian Diagnosis ICD-10</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Masukkan keyword untuk mencari diagnosis (minimal 3 karakter)..."
                        value={searchKeyword}
                        onChange={(e) => {
                            setSearchKeyword(e.target.value);
                            handleSearchDiagnosis(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchDiagnosis(searchKeyword);
                            }
                        }}
                    />
                    
                    {searchLoading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Mencari diagnosis...</span>
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-2 font-semibold text-sm border-b">
                                Hasil Pencarian ({searchResults.length} ditemukan)
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="text-left p-2 border-b">Kode</th>
                                            <th className="text-left p-2 border-b">Nama Diagnosis</th>
                                            <th className="text-center p-2 border-b">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((diagnosis, index) => (
                                            <tr
                                                key={diagnosis.code}
                                                className={`hover:bg-gray-50 ${
                                                    selectedDiagnosa.some(d => d.code === diagnosis.code) 
                                                        ? 'bg-blue-50' 
                                                        : index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                                }`}
                                            >
                                                <td className="p-2 border-b font-mono text-xs">
                                                    {diagnosis.code}
                                                </td>
                                                <td className="p-2 border-b">
                                                    {diagnosis.name}
                                                </td>
                                                <td className="p-2 border-b text-center">
                                                    <Button
                                                        size="sm"
                                                        variant={selectedDiagnosa.some(d => d.code === diagnosis.code) ? "secondary" : "outline"}
                                                        onClick={() => handleSelectDiagnosis(diagnosis)}
                                                        disabled={selectedDiagnosa.some(d => d.code === diagnosis.code)}
                                                        className="text-xs"
                                                    >
                                                        {selectedDiagnosa.some(d => d.code === diagnosis.code) ? 'Dipilih' : 'Pilih'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {searchKeyword.length >= 3 && !searchLoading && searchResults.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>Tidak ada diagnosis ditemukan untuk "{searchKeyword}"</p>
                        </div>
                    )}

                    {selectedDiagnosa.length > 0 && (
                        <div className="border-t pt-4">
                            <p className="font-semibold mb-2">Diagnosis Dipilih ({selectedDiagnosa.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedDiagnosa.map((diagnosis) => (
                                    <Badge
                                        key={diagnosis.code}
                                        variant="default"
                                        className="text-xs px-3 py-1"
                                    >
                                        {diagnosis.code} - {diagnosis.name}
                                        <button
                                            type="button"
                                            className="ml-2 h-3 w-3 cursor-pointer hover:text-red-500 inline-flex items-center justify-center"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemoveDiagnosis(diagnosis.code);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
