import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProcedureIDRG {
    name: string;
    code: string;
    validcode?: string;
    isValid?: boolean;
}

interface ProcedureIDRGModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProcedures: ProcedureIDRG[];
    onSelectProcedure: (procedure: ProcedureIDRG) => void;
    onRemoveProcedure: (code: string) => void;
}

export default function ProcedureIDRGModal({
    isOpen,
    onClose,
    selectedProcedures,
    onSelectProcedure,
    onRemoveProcedure
}: ProcedureIDRGModalProps) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<ProcedureIDRG[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleSearchProcedure = async (keyword: string) => {
        if (!keyword || keyword.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await fetch(`/eklaim/referensi/prosedur-idrg?keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            
            if (data.metadata?.code === 200 && data.response?.data) {
                const procedures = data.response.data.map((item: any) => ({
                    name: item.description,
                    code: item.code,
                    validcode: item.validcode,
                    isValid: item.validcode !== '0'
                }));
                setSearchResults(procedures);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            setSearchResults([]);
            toast.error('Tidak ada data prosedur IDRG');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectProcedure = (procedure: ProcedureIDRG) => {
        // Allow selecting the same procedure multiple times for counting
        onSelectProcedure(procedure);
    };

    const handleRemoveProcedure = (code: string) => {
        onRemoveProcedure(code);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-7xl max-h-[90vh] w-[90vw] top-[35%] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Pencarian Prosedur IDRG</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Masukkan keyword untuk mencari prosedur IDRG (minimal 3 karakter)..."
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
                            <span className="ml-2">Mencari prosedur IDRG...</span>
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
                                                className={`${
                                                    !procedure.isValid 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : selectedProcedures.some(p => p.code === procedure.code) 
                                                            ? 'bg-blue-50 hover:bg-blue-100' 
                                                            : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-25 hover:bg-gray-50'
                                                }`}
                                            >
                                                <td className={`p-2 border-b font-mono text-xs ${!procedure.isValid ? 'text-gray-400' : ''}`}>
                                                    {procedure.code}
                                                    {!procedure.isValid && (
                                                        <span className="ml-1 text-xs text-red-500">(Tidak Valid)</span>
                                                    )}
                                                </td>
                                                <td className={`p-2 border-b ${!procedure.isValid ? 'text-gray-400 line-through' : ''}`}>
                                                    {procedure.name}
                                                </td>
                                                <td className="p-2 border-b text-center">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => procedure.isValid && handleSelectProcedure(procedure)}
                                                        disabled={!procedure.isValid}
                                                        className={`text-xs ${
                                                            !procedure.isValid 
                                                                ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400' 
                                                                : ''
                                                        }`}
                                                    >
                                                        {!procedure.isValid 
                                                            ? 'Tidak Valid'
                                                            : selectedProcedures.some(p => p.code === procedure.code) 
                                                                ? `Pilih Lagi (${selectedProcedures.filter(p => p.code === procedure.code).length})` 
                                                                : 'Pilih'
                                                        }
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
                            <p>Tidak ada prosedur IDRG ditemukan untuk "{searchKeyword}"</p>
                        </div>
                    )}

                    {selectedProcedures.length > 0 && (
                        <div className="border-t pt-4">
                            <p className="font-semibold mb-2">Prosedur IDRG Dipilih ({selectedProcedures.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {/* Group procedures by code and show count */}
                                {Object.entries(
                                    selectedProcedures.reduce((acc, procedure) => {
                                        if (!acc[procedure.code]) {
                                            acc[procedure.code] = { ...procedure, count: 0 };
                                        }
                                        acc[procedure.code].count++;
                                        return acc;
                                    }, {} as Record<string, ProcedureIDRG & { count: number }>)
                                ).map(([code, procedureWithCount]) => (
                                    <Badge
                                        key={code}
                                        variant="default"
                                        className="text-xs px-3 py-1"
                                    >
                                        {procedureWithCount.code} - {procedureWithCount.name}
                                        {procedureWithCount.count > 1 && (
                                            <span className="ml-1 bg-white text-blue-600 px-1 rounded-full text-xs font-bold">
                                                {procedureWithCount.count}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="ml-2 h-3 w-3 cursor-pointer hover:text-red-500 inline-flex items-center justify-center"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemoveProcedure(procedureWithCount.code);
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