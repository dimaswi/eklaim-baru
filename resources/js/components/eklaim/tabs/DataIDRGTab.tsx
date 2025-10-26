import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DataIDRGTabProps {
    pengajuanKlaim: {
        idrg?: string | number | null;
        idrg_diagnosa?: string;
        idrg_procedure?: string;
        idrg_response?: any;
        [key: string]: any;
    };
}

export default function DataIDRGTab({ pengajuanKlaim }: DataIDRGTabProps) {
    // Parse diagnosa dan procedure dari string format
    const parseDiagnoses = (diagnosesString: string): Array<{ code: string; count: number }> => {
        if (!diagnosesString) return [];
        
        const codes = diagnosesString.split('#').filter((code) => code.trim() !== '');
        return codes.map((codeWithCount) => {
            const [code, countStr] = codeWithCount.split('+');
            const count = countStr ? parseInt(countStr) : 1;
            return { code, count };
        });
    };

    const parseProcedures = (proceduresString: string): Array<{ code: string; count: number }> => {
        if (!proceduresString) return [];
        
        const codes = proceduresString.split('#').filter((code) => code.trim() !== '');
        return codes.map((codeWithCount) => {
            const [code, countStr] = codeWithCount.split('+');
            const count = countStr ? parseInt(countStr) : 1;
            return { code, count };
        });
    };

    const diagnoses = parseDiagnoses(pengajuanKlaim.idrg_diagnosa || '');
    const procedures = parseProcedures(pengajuanKlaim.idrg_procedure || '');

    // Parse IDRG response jika ada
    let idrgResponse = null;
    if (pengajuanKlaim.idrg_response) {
        try {
            idrgResponse = typeof pengajuanKlaim.idrg_response === 'string' 
                ? JSON.parse(pengajuanKlaim.idrg_response) 
                : pengajuanKlaim.idrg_response;
        } catch (e) {
            console.error('Failed to parse IDRG response:', e);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🔐</span>
                                Data IDRG Grouping
                            </CardTitle>
                            <CardDescription>
                                Informasi hasil IDRG Grouping untuk klaim ini
                            </CardDescription>
                        </div>
                        <Badge variant="default" className="h-8 px-4 bg-green-500 hover:bg-green-600 text-white">
                            <span className="mr-2">✓</span>
                            IDRG Grouping Selesai
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Status IDRG */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Status IDRG</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">IDRG Status</label>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                                    {pengajuanKlaim.idrg === 1 || pengajuanKlaim.idrg === '1' ? 'Aktif (1)' : `Status: ${pengajuanKlaim.idrg}`}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nomor SEP</label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="font-mono text-sm">{pengajuanKlaim.nomor_sep}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Diagnosa IDRG */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Diagnosa IDRG</CardTitle>
                    <CardDescription>
                        Daftar diagnosa yang digunakan untuk IDRG Grouping
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {diagnoses.length > 0 ? (
                        <div className="space-y-3">
                            {diagnoses.map((diag, index) => (
                                <div
                                    key={`${diag.code}-${index}`}
                                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-semibold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-mono font-semibold text-blue-900">{diag.code}</p>
                                            <p className="text-sm text-blue-700">Diagnosa IDRG</p>
                                        </div>
                                    </div>
                                    {diag.count > 1 && (
                                        <Badge variant="secondary" className="bg-blue-200 text-blue-900">
                                            {diag.count}x
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Tidak ada data diagnosa IDRG</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Procedure IDRG */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Procedure IDRG</CardTitle>
                    <CardDescription>
                        Daftar prosedur yang digunakan untuk IDRG Grouping (opsional)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {procedures.length > 0 ? (
                        <div className="space-y-3">
                            {procedures.map((proc, index) => (
                                <div
                                    key={`${proc.code}-${index}`}
                                    className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-semibold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-mono font-semibold text-purple-900">{proc.code}</p>
                                            <p className="text-sm text-purple-700">Prosedur IDRG</p>
                                        </div>
                                    </div>
                                    {proc.count > 1 && (
                                        <Badge variant="secondary" className="bg-purple-200 text-purple-900">
                                            {proc.count}x
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Tidak ada data prosedur IDRG</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* IDRG Response (jika ada) */}
            {idrgResponse && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Response IDRG</CardTitle>
                        <CardDescription>
                            Detail response dari sistem IDRG Grouping
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <pre className="text-xs overflow-auto max-h-96">
                                {JSON.stringify(idrgResponse, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div className="flex-1 space-y-2">
                            <p className="font-semibold text-blue-900">Informasi IDRG Grouping</p>
                            <p className="text-sm text-blue-800">
                                IDRG Grouping telah berhasil dilakukan untuk klaim ini. Data di atas menampilkan 
                                diagnosa dan prosedur yang digunakan dalam proses grouping IDRG.
                            </p>
                            <Separator className="my-2 bg-blue-200" />
                            <p className="text-xs text-blue-700">
                                <strong>Catatan:</strong> Untuk membatalkan IDRG Grouping, gunakan tombol 
                                "Batalkan IDRG Grouping" di bagian atas halaman.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
