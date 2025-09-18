import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Ruangan {
    ID: number;
    DESKRIPSI: string;
    JENIS_KUNJUNGAN: number;
}

interface KunjunganRS {
    id: number;
    NOPEN: string;
    NOMOR: string;
    RUANGAN: number;
    MASUK: string;
    KELUAR: string;
    ruangan?: Ruangan;
}

interface Pendaftaran {
    NOMOR: string;
    NORM: string;
    TANGGAL: string;
    kunjungan_rs?: KunjunganRS[];
}

interface PerencanaanRawatInap {
    kunjungan_rs?: {
        pendaftaran?: Pendaftaran;
    };
}

interface Penjamin {
    NOPEN: string;
    pendaftaran?: Pendaftaran;
    perencanaan_rawat_inap?: PerencanaanRawatInap;
}

interface PengajuanKlaim {
    id: number;
    nomor_sep: string;
    nama_pasien: string;
    norm: string;
    penjamin?: Penjamin;
}

interface KunjunganDetailModalProps {
    data: PengajuanKlaim;
}

export default function KunjunganDetailModal({ data }: KunjunganDetailModalProps) {
    const [open, setOpen] = useState(false);

    const formatDateTime = (dateString: string) => {
        if (!dateString || dateString === '0000-00-00 00:00:00' || dateString === '') return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: id });
        } catch (error) {
            return '-';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '0000-00-00' || dateString === '') return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: id });
        } catch (error) {
            return '-';
        }
    };

    // Data dari rawat jalan/IGD (relationship kedua)
    const kunjunganRawatJalan = data.penjamin?.pendaftaran?.kunjungan_rs || [];

    // Data dari rawat inap (relationship pertama - jika ada perencanaan rawat inap)
    const kunjunganRawatInap = data.penjamin?.perencanaan_rawat_inap?.kunjungan_rs?.pendaftaran?.kunjungan_rs || [];

    const hasRawatInap = data.penjamin?.perencanaan_rawat_inap && kunjunganRawatInap.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:bg-blue-50">
                    <Eye className="h-4 w-4 text-blue-500" />
                    Detail
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-7xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        Detail Kunjungan - {data.nama_pasien}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Info Pasien */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Pasien</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Nama Pasien</label>
                                    <p className="font-medium">{data.nama_pasien}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">No. SEP</label>
                                    <Badge variant="outline">{data.nomor_sep}</Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">No. RM</label>
                                    <p className="font-medium">{data.norm}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kunjungan Rawat Jalan/IGD */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-500" />
                                Kunjungan Rawat Jalan/IGD
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {kunjunganRawatJalan.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No.</TableHead>
                                                <TableHead>No. Pendaftaran</TableHead>
                                                <TableHead>No. Kunjungan</TableHead>
                                                <TableHead>Ruangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {kunjunganRawatJalan.map((kunjungan, index) => (
                                                <TableRow key={kunjungan.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{kunjungan.NOPEN || '-'}</TableCell>
                                                    <TableCell>{kunjungan.NOMOR || '-'}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {kunjungan.ruangan?.DESKRIPSI || '-'}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p>Tidak ada data kunjungan rawat jalan/IGD</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Kunjungan Rawat Inap (hanya tampil jika ada) */}
                    {hasRawatInap && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                    Kunjungan Rawat Inap
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No.</TableHead>
                                                <TableHead>No. Pendaftaran</TableHead>
                                                <TableHead>No. Kunjungan</TableHead>
                                                <TableHead>Ruangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {kunjunganRawatInap.map((kunjungan, index) => (
                                                <TableRow key={kunjungan.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{kunjungan.NOPEN || '-'}</TableCell>
                                                    <TableCell>{kunjungan.NOMOR || '-'}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {kunjungan.ruangan?.DESKRIPSI || '-'}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
