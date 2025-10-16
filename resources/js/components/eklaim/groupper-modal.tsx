import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Calendar, FileText, UserCheck, Info, Plus, X, Search } from "lucide-react";
import { router } from "@inertiajs/react";
import DiagnosisModal from "./DiagnosisModal";
import ProcedureModal from "./ProcedureModal";

interface Diagnosa {
    name: string;
    code: string;
}

interface Procedure {
    name: string;
    code: string;
}

interface GroupperData {
    pengajuan_klaim_id: number;
    nomor_sep: string;
    nama_pasien: string;
}

interface GroupperModalProps {
    data: GroupperData;
    disabled?: boolean;
    actionUrl?: string;
    triggerClassName?: string;
    triggerText?: string;
}

export default function GroupperModal({ 
    data, 
    disabled = false, 
    actionUrl = '/eklaim/groupper',
    triggerClassName,
    triggerText = "Lakukan Grouping"
}: GroupperModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // State untuk diagnosa (multiple)
    const [selectedDiagnosa, setSelectedDiagnosa] = useState<Diagnosa[]>([]);
    
    // State untuk procedure (multiple)
    const [selectedProcedures, setSelectedProcedures] = useState<Procedure[]>([]);
    
    // State untuk modal
    const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
    const [procedureModalOpen, setProcedureModalOpen] = useState(false);

    // Fungsi untuk menangani diagnosa
    const handleSelectDiagnosis = (diagnosis: Diagnosa) => {
        setSelectedDiagnosa([...selectedDiagnosa, diagnosis]);
    };

    const handleRemoveDiagnosis = (code: string) => {
        setSelectedDiagnosa(selectedDiagnosa.filter(d => d.code !== code));
    };

    // Fungsi untuk menangani procedure
    const handleSelectProcedure = (procedure: Procedure) => {
        setSelectedProcedures([...selectedProcedures, procedure]);
    };

    const handleRemoveProcedure = (code: string) => {
        setSelectedProcedures(selectedProcedures.filter(p => p.code !== code));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Convert diagnosa and procedures to format expected by backend
        const diagnosaForBackend = selectedDiagnosa.map(d => ({
            kode: d.code,
            deskripsi: d.name
        }));

        const proceduresForBackend = selectedProcedures.map(p => ({
            kode: p.code,
            deskripsi: p.name
        }));

        try {
            router.post('/biaya/compare/grouping', {
                pengajuan_klaim_id: data.pengajuan_klaim_id,
                nomor_sep: data.nomor_sep,
                diagnosa: JSON.stringify(diagnosaForBackend),
                procedures: JSON.stringify(proceduresForBackend),
            }, {
                onSuccess: () => {
                    setOpen(false);
                    setLoading(false);
                    // Reset form
                    setSelectedDiagnosa([]);
                    setSelectedProcedures([]);
                },
                onError: (errors) => {
                    setLoading(false);
                    console.error('Error during grouping:', errors);
                }
            });
        } catch (error) {
            setLoading(false);
            console.error('Error during grouping:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerClassName ? (
                    <button
                        disabled={disabled}
                        className={triggerClassName}
                    >
                        {triggerText}
                    </button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        className="hover:bg-blue-50"
                    >
                        <Activity className="h-4 w-4 mr-2 text-blue-400" />
                        {triggerText}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="!max-w-4xl !top-[50%] !translate-y-[-50%] overflow-y-auto max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Grouping INACBG
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Pasien */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Informasi Pasien
                            </CardTitle>
                            <CardDescription>
                                Data pasien yang akan dilakukan grouping
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Nomor SEP
                                    </Label>
                                    <Input
                                        value={data.nomor_sep || '-'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Nama Pasien
                                    </Label>
                                    <Input
                                        value={data.nama_pasien || '-'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Diagnosa Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                Diagnosa
                            </CardTitle>
                            <CardDescription>
                                Pilih diagnosa ICD-10 yang sesuai dengan kondisi pasien
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDiagnosisModalOpen(true)}
                                className="w-full flex items-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Cari & Pilih Diagnosa
                            </Button>
                            
                            {selectedDiagnosa.length > 0 && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <Label className="text-sm font-medium mb-2 block">
                                        Diagnosa Dipilih ({selectedDiagnosa.length}):
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(
                                            selectedDiagnosa.reduce((acc, diagnosis) => {
                                                if (!acc[diagnosis.code]) {
                                                    acc[diagnosis.code] = { ...diagnosis, count: 0 };
                                                }
                                                acc[diagnosis.code].count++;
                                                return acc;
                                            }, {} as Record<string, Diagnosa & { count: number }>)
                                        ).map(([code, diagnosisWithCount]) => (
                                            <Badge
                                                key={code}
                                                variant="default"
                                                className="text-xs px-3 py-1"
                                            >
                                                {diagnosisWithCount.code} - {diagnosisWithCount.name}
                                                {diagnosisWithCount.count > 1 && (
                                                    <span className="ml-1 bg-white text-blue-600 px-1 rounded-full text-xs font-bold">
                                                        {diagnosisWithCount.count}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    className="ml-2 h-3 w-3 cursor-pointer hover:text-red-500 inline-flex items-center justify-center"
                                                    onClick={() => handleRemoveDiagnosis(diagnosisWithCount.code)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Procedure Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5" />
                                Procedure
                            </CardTitle>
                            <CardDescription>
                                Pilih prosedur ICD-9-CM yang dilakukan pada pasien
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setProcedureModalOpen(true)}
                                className="w-full flex items-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Cari & Pilih Prosedur
                            </Button>
                            
                            {selectedProcedures.length > 0 && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <Label className="text-sm font-medium mb-2 block">
                                        Prosedur Dipilih ({selectedProcedures.length}):
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(
                                            selectedProcedures.reduce((acc, procedure) => {
                                                if (!acc[procedure.code]) {
                                                    acc[procedure.code] = { ...procedure, count: 0 };
                                                }
                                                acc[procedure.code].count++;
                                                return acc;
                                            }, {} as Record<string, Procedure & { count: number }>)
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
                                                    onClick={() => handleRemoveProcedure(procedureWithCount.code)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm flex items-center text-blue-500">
                            <Info className="h-4 w-4 mr-2" />
                            Data diagnosa dan procedure akan dikirim ke API INACBG untuk grouping
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="h-4 w-4 mr-2" />
                                        Lakukan Grouping
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>

            {/* DiagnosisModal */}
            <DiagnosisModal
                isOpen={diagnosisModalOpen}
                onClose={() => setDiagnosisModalOpen(false)}
                selectedDiagnosa={selectedDiagnosa}
                onSelectDiagnosis={handleSelectDiagnosis}
                onRemoveDiagnosis={handleRemoveDiagnosis}
            />

            {/* ProcedureModal */}
            <ProcedureModal
                isOpen={procedureModalOpen}
                onClose={() => setProcedureModalOpen(false)}
                selectedProcedures={selectedProcedures}
                onSelectProcedure={handleSelectProcedure}
                onRemoveProcedure={handleRemoveProcedure}
            />
        </Dialog>
    );
}