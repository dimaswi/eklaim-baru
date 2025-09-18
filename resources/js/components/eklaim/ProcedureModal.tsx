import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface Procedure {
    name: string;
    code: string;
}

interface ProcedureModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProcedures: Procedure[];
    onSelectProcedure: (procedure: Procedure) => void;
    onRemoveProcedure: (code: string) => void;
}

export default function ProcedureModal({
    isOpen,
    onClose,
    selectedProcedures,
    onSelectProcedure,
    onRemoveProcedure
}: ProcedureModalProps) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<Procedure[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleSearchProcedure = async (keyword: string) => {
        if (!keyword || keyword.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await fetch(`/eklaim/referensi/prosedur?keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            
            if (data.metadata?.code === 200 && data.response?.data) {
                const procedures = data.response.data.map((item: [string, string]) => ({
                    name: item[0],
                    code: item[1]
                }));
                setSearchResults(procedures);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            setSearchResults([]);
            toast.error('Tidak ada data procedure');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectProcedure = (procedure: Procedure) => {
        const isAlreadySelected = selectedProcedures.some(p => p.code === procedure.code);
        if (!isAlreadySelected) {
            onSelectProcedure(procedure);
        }
    };

    const handleRemoveProcedure = (code: string) => {
        onRemoveProcedure(code);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-7xl max-h-[90vh] w-[90vw] top-[35%] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Pencarian Prosedur ICD-9</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Masukkan keyword untuk mencari prosedur (minimal 3 karakter)..."
                        value={searchKeyword}
                        onChange={(e) => {
                            setSearchKeyword(e.target.value);
                            handleSearchProcedure(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchProcedure(searchKeyword);
                            }
                        }}
                    />
                    
                    {searchLoading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Mencari prosedur...</span>
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
                                            <th className="text-left p-2 border-b">Nama Prosedur</th>
                                            <th className="text-center p-2 border-b">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((procedure, index) => (
                                            <tr
                                                key={procedure.code}
                                                className={`hover:bg-gray-50 ${
                                                    selectedProcedures.some(p => p.code === procedure.code) 
                                                        ? 'bg-blue-50' 
                                                        : index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                                }`}
                                            >
                                                <td className="p-2 border-b font-mono text-xs">
                                                    {procedure.code}
                                                </td>
                                                <td className="p-2 border-b">
                                                    {procedure.name}
                                                </td>
                                                <td className="p-2 border-b text-center">
                                                    <Button
                                                        size="sm"
                                                        variant={selectedProcedures.some(p => p.code === procedure.code) ? "secondary" : "outline"}
                                                        onClick={() => handleSelectProcedure(procedure)}
                                                        disabled={selectedProcedures.some(p => p.code === procedure.code)}
                                                        className="text-xs"
                                                    >
                                                        {selectedProcedures.some(p => p.code === procedure.code) ? 'Dipilih' : 'Pilih'}
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
                            <p>Tidak ada prosedur ditemukan untuk "{searchKeyword}"</p>
                        </div>
                    )}

                    {selectedProcedures.length > 0 && (
                        <div className="border-t pt-4">
                            <p className="font-semibold mb-2">Prosedur Dipilih ({selectedProcedures.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedProcedures.map((procedure) => (
                                    <Badge
                                        key={procedure.code}
                                        variant="default"
                                        className="text-xs px-3 py-1"
                                    >
                                        {procedure.code} - {procedure.name}
                                        <button
                                            type="button"
                                            className="ml-2 h-3 w-3 cursor-pointer hover:text-red-500 inline-flex items-center justify-center"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemoveProcedure(procedure.code);
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
