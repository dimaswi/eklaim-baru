import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Banknote, Calendar, ChevronDown, Clock, Eye, FileText, MapPin, Printer, User } from 'lucide-react';

interface Ruangan {
    ID: number;
    DESKRIPSI: string;
    JENIS_KUNJUNGAN: number;
}

interface CaraPulang {
    ID: number;
    DESKRIPSI: string;
}

interface PasienPulang {
    cara_pulang: CaraPulang;
}

interface KunjunganRS {
    id: number;
    NOPEN: string;
    NOMOR: string;
    RUANGAN: number;
    MASUK: string;
    KELUAR: string;
    ruangan?: Ruangan;
    pasien_pulang?: PasienPulang;
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
    nomor_kartu: string;
    norm: string;
    nama_pasien: string;
    tanggal_masuk: string;
    tanggal_keluar: string;
    ruangan: string;
    status_pengiriman: number;
    response_message?: string;
    created_at: string;
    penjamin?: Penjamin;
}

interface Props extends SharedData {
    pengajuan_klaim: PengajuanKlaim;
}

export default function RMDetail() {
    const { pengajuan_klaim } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pengajuan Klaim',
            href: '/eklaim/pengajuan',
        },
        {
            title: `${pengajuan_klaim.nomor_sep}`,
            href: `/eklaim/pengajuan/${pengajuan_klaim.id}/rm`,
        },
    ];

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

    const getStatusBadge = (status: number) => {
        const statusMap = {
            0: { label: 'Default', variant: 'secondary' as const },
            1: { label: 'Tersimpan', variant: 'outline' as const },
            2: { label: 'Grouper', variant: 'default' as const },
            3: { label: 'Grouper Stage 2', variant: 'default' as const },
            4: { label: 'Final', variant: 'default' as const },
            5: { label: 'Kirim', variant: 'destructive' as const },
        };

        const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0];
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    };

    const getDokumenMenuItems = (jenisKunjungan?: number, kunjunganNomor?: string) => {
        const baseUrl = `/eklaim/pengajuan/${pengajuan_klaim.id}/rm`;

        switch (jenisKunjungan) {
            case 5: // Radiologi
                return [
                    ['Hasil Radiologi', `${baseUrl}/radiologi/hasil/${kunjunganNomor}`],
                ];
            case 4: // Laboratorium
                return [
                    ['Hasil Laboratorium', `${baseUrl}/laboratorium/hasil/${kunjunganNomor}`],
                ];
            case 3: // Rawat Inap
                return [
                    ['Resume Medis', `${baseUrl}/rawat-inap/resume-medis/${kunjunganNomor}`],
                    ['Pengkajian Awal', `${baseUrl}/rawat-inap/pengkajian-awal/${kunjunganNomor}`],
                    ['CPPT', `${baseUrl}/rawat-inap/cppt/${kunjunganNomor}`],
                    ['Balance Cairan', `${baseUrl}/rawat-inap/balance-cairan/${kunjunganNomor}`],
                ];
            case 2: // IGD
                return [
                    ['Resume Medis', `${baseUrl}/ugd/resume-medis/${kunjunganNomor}`],
                    ['Pengkajian Awal', `${baseUrl}/ugd/pengkajian-awal/${kunjunganNomor}`],
                    ['Triage', `${baseUrl}/ugd/triage/${kunjunganNomor}`],
                ];
            case 1: // Rawat Jalan
                return [
                    ['Resume Medis', `${baseUrl}/rawat-jalan/resume-medis/${kunjunganNomor}`],
                    ['Pengkajian Awal', `${baseUrl}/rawat-jalan/pengkajian-awal/${kunjunganNomor}`],
                ];
            default:
                return [];
        }
    };

    // Ambil semua data kunjungan dari kedua sumber
    const allKunjunganFromPendaftaran = pengajuan_klaim.penjamin?.pendaftaran?.kunjungan_rs || [];
    const allKunjunganFromPerencanaan = pengajuan_klaim.penjamin?.perencanaan_rawat_inap?.kunjungan_rs?.pendaftaran?.kunjungan_rs || [];

    // Gabungkan semua data kunjungan
    const allKunjungan = [...allKunjunganFromPendaftaran, ...allKunjunganFromPerencanaan];

    // Pisahkan berdasarkan JENIS_KUNJUNGAN terlebih dahulu
    // 1 = Rawat Jalan, 2 = IGD, 3 = Rawat Inap
    const kunjunganUtama = allKunjungan.filter(
        (k) => k.ruangan?.JENIS_KUNJUNGAN === 1 || k.ruangan?.JENIS_KUNJUNGAN === 2 || k.ruangan?.JENIS_KUNJUNGAN === 3,
    );

    const kunjunganPenunjang = allKunjungan.filter(
        (k) => k.ruangan?.JENIS_KUNJUNGAN !== 1 && k.ruangan?.JENIS_KUNJUNGAN !== 2 && k.ruangan?.JENIS_KUNJUNGAN !== 3,
    );

    // Kelompokkan berdasarkan NOPEN
    const groupedByNOPEN = allKunjungan.reduce(
        (acc, kunjungan) => {
            const nopen = kunjungan.NOPEN;
            if (!acc[nopen]) {
                acc[nopen] = {
                    rawatJalan: [],
                    rawatInap: [],
                    igd: [],
                    penunjang: [],
                };
            }

            if (kunjungan.ruangan?.JENIS_KUNJUNGAN === 1) {
                acc[nopen].rawatJalan.push(kunjungan);
            } else if (kunjungan.ruangan?.JENIS_KUNJUNGAN === 2) {
                acc[nopen].igd.push(kunjungan);
            } else if (kunjungan.ruangan?.JENIS_KUNJUNGAN === 3) {
                acc[nopen].rawatInap.push(kunjungan);
            } else {
                acc[nopen].penunjang.push(kunjungan);
            }

            return acc;
        },
        {} as Record<
            string,
            {
                rawatJalan: KunjunganRS[];
                rawatInap: KunjunganRS[];
                igd: KunjunganRS[];
                penunjang: KunjunganRS[];
            }
        >,
    );

    // Gabungkan kunjungan utama dengan penunjang berdasarkan NOPEN yang sama
    const finalGroups = Object.entries(groupedByNOPEN).map(([nopen, group]) => {
        const hasRawatJalan = group.rawatJalan.length > 0;
        const hasRawatInap = group.rawatInap.length > 0;
        const hasIGD = group.igd.length > 0;

        let groupType = '';
        let allKunjunganInGroup: KunjunganRS[] = [];

        if (hasRawatInap) {
            groupType = 'Rawat Inap';
            allKunjunganInGroup = [...group.rawatInap, ...group.penunjang];
        } else if (hasRawatJalan) {
            groupType = 'Rawat Jalan';
            allKunjunganInGroup = [...group.rawatJalan, ...group.penunjang];
        } else if (hasIGD) {
            groupType = 'IGD';
            allKunjunganInGroup = [...group.igd, ...group.penunjang];
        } else {
            groupType = 'Penunjang';
            allKunjunganInGroup = [...group.penunjang];
        }

        return {
            nopen,
            groupType,
            kunjungan: allKunjunganInGroup,
        };
    });

    const rawatInap = finalGroups.filter((g) => g.groupType === 'Rawat Inap');
    const rawatJalan = finalGroups.filter((g) => g.groupType === 'Rawat Jalan');
    const igd = finalGroups.filter((g) => g.groupType === 'IGD');
    const penunjangSaja = finalGroups.filter((g) => g.groupType === 'Penunjang');

    // Check if there are any lab or radiology visits
    const hasLabVisit = allKunjungan.some((k) => k.ruangan?.JENIS_KUNJUNGAN === 4);
    const hasRadioVisit = allKunjungan.some((k) => k.ruangan?.JENIS_KUNJUNGAN === 5);

    // Get the first kunjungan NOMOR for creating new lab/radio records
    const firstKunjunganNomor = allKunjungan.length > 0 ? allKunjungan[0].NOMOR : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail RM - ${pengajuan_klaim.nama_pasien}`} />

            <div className="max-w-7xl p-4">
                <div className="space-y-6">
                    {/* Info Pasien & Pengajuan */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Info Pasien */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-500" />
                                    Informasi Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nama Pasien</label>
                                        <p className="text-lg font-medium">{pengajuan_klaim.nama_pasien}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">No. RM</label>
                                            <p className="font-medium">{pengajuan_klaim.norm}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">No. Kartu</label>
                                            <p className="font-medium">{pengajuan_klaim.nomor_kartu || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Pengajuan */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 justify-between">
                                    <div className='flex items-center gap-2'>
                                        <FileText className="h-5 w-5 text-green-500" />
                                        Informasi Pengajuan
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                router.visit(`/eklaim/klaim/${pengajuan_klaim.id}`);
                                            }}
                                        >
                                            Data Klaim
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                router.visit(`/eklaim/print-bundle/${pengajuan_klaim.id}`);
                                            } }
                                        >
                                            <Printer className="mr-2 text-blue-500" /> Bundle
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                // Navigate to the billing page
                                                router.visit(`/eklaim/pengajuan/${pengajuan_klaim.id}/rm/tagihan`);
                                            }}
                                        >
                                            <Banknote className="mr-2 text-green-500" />
                                            Tagihan
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">No. SEP</label>
                                        <Badge variant="outline" className="text-base">
                                            {pengajuan_klaim.nomor_sep}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <div className="mt-1">{getStatusBadge(pengajuan_klaim.status_pengiriman)}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Ruangan</label>
                                            <p className="font-medium">{pengajuan_klaim.ruangan}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Tgl. Masuk</label>
                                            <p className="font-medium">
                                                {pengajuan_klaim.tanggal_masuk ? formatDate(pengajuan_klaim.tanggal_masuk) : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Tgl. Keluar</label>
                                            <p className="font-medium">
                                                {pengajuan_klaim.tanggal_keluar ? formatDate(pengajuan_klaim.tanggal_keluar) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tgl. Pengajuan</label>
                                        <p className="font-medium">{formatDateTime(pengajuan_klaim.created_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {!allKunjungan.length ? (
                        <Card className="py-8 text-center">
                            <CardContent>
                                <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">Tidak ada data kunjungan</h3>
                                <p className="text-gray-500">Belum ada data kunjungan untuk pengajuan klaim ini.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Kunjungan Rawat Inap dengan Penunjang */}
                            {rawatInap.map((group) => (
                                <Card key={`rawat-inap-${group.nopen}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-blue-500" />
                                                Rawat Inap - No. Pendaftaran: {group.nopen}
                                            </div>
                                            <div className="flex gap-2">
                                                {!hasLabVisit && firstKunjunganNomor && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/eklaim/pengajuan/${pengajuan_klaim.id}/rm/laboratorium/hasil/${firstKunjunganNomor}`,
                                                            )
                                                        }
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Tambah Laboratorium
                                                    </Button>
                                                )}
                                                {!hasRadioVisit && firstKunjunganNomor && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/eklaim/pengajuan/${pengajuan_klaim.id}/rm/radiologi/hasil/${firstKunjunganNomor}`,
                                                            )
                                                        }
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Tambah Radiologi
                                                    </Button>
                                                )}
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">No.</TableHead>
                                                        <TableHead>No. Kunjungan</TableHead>
                                                        <TableHead>Ruangan</TableHead>
                                                        <TableHead>Jenis Kunjungan</TableHead>
                                                        <TableHead>Cara Pulang</TableHead>
                                                        <TableHead>Tanggal Masuk</TableHead>
                                                        <TableHead>Tanggal Keluar</TableHead>
                                                        <TableHead>Dokumen</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.kunjungan.map((kunjungan, index) => (
                                                        <TableRow key={kunjungan.id}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{kunjungan.NOMOR || '-'}</TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{kunjungan.ruangan?.DESKRIPSI || '-'}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={kunjungan.ruangan?.JENIS_KUNJUNGAN === 3 ? 'default' : 'secondary'}>
                                                                    {kunjungan.ruangan?.JENIS_KUNJUNGAN === 1
                                                                        ? 'Rawat Jalan'
                                                                        : kunjungan.ruangan?.JENIS_KUNJUNGAN === 2
                                                                          ? 'IGD'
                                                                          : kunjungan.ruangan?.JENIS_KUNJUNGAN === 3
                                                                            ? 'Rawat Inap'
                                                                            : 'Penunjang'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {kunjungan.pasien_pulang?.cara_pulang.DESKRIPSI || 'Penunjang'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.MASUK)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.KELUAR)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getDokumenMenuItems(kunjungan.ruangan?.JENIS_KUNJUNGAN, kunjungan.NOMOR).length >
                                                                0 ? (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm">
                                                                                <Eye className="mr-1 h-4 w-4" />
                                                                                Dokumen
                                                                                <ChevronDown className="ml-1 h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            {getDokumenMenuItems(
                                                                                kunjungan.ruangan?.JENIS_KUNJUNGAN,
                                                                                kunjungan.NOMOR,
                                                                            ).map(([label, url]) => (
                                                                                <DropdownMenuItem
                                                                                    key={label}
                                                                                    onClick={() => router.visit(url)}
                                                                                    className="cursor-pointer"
                                                                                >
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    {label}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" disabled>
                                                                        <Eye className="mr-1 h-4 w-4" />
                                                                        Dokumen
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Kunjungan Rawat Jalan dengan Penunjang */}
                            {rawatJalan.map((group) => (
                                <Card key={`rawat-jalan-${group.nopen}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-blue-500" />
                                                Rawat Jalan - No. Pendaftaran: {group.nopen}
                                            </div>
                                            <div className="flex gap-2">
                                                {!hasLabVisit && firstKunjunganNomor && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/eklaim/pengajuan/${pengajuan_klaim.id}/rm/laboratorium/hasil/${firstKunjunganNomor}`,
                                                            )
                                                        }
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Tambah Laboratorium
                                                    </Button>
                                                )}
                                                {!hasRadioVisit && firstKunjunganNomor && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/eklaim/pengajuan/${pengajuan_klaim.id}/rm/radiologi/hasil/${firstKunjunganNomor}`,
                                                            )
                                                        }
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Tambah Radiologi
                                                    </Button>
                                                )}
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">No.</TableHead>
                                                        <TableHead>No. Kunjungan</TableHead>
                                                        <TableHead>Ruangan</TableHead>
                                                        <TableHead>Jenis Kunjungan</TableHead>
                                                        <TableHead>Cara Pulang</TableHead>
                                                        <TableHead>Tanggal Masuk</TableHead>
                                                        <TableHead>Tanggal Keluar</TableHead>
                                                        <TableHead>Dokumen</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.kunjungan.map((kunjungan, index) => (
                                                        <TableRow key={kunjungan.id}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{kunjungan.NOMOR || '-'}</TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{kunjungan.ruangan?.DESKRIPSI || '-'}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={kunjungan.ruangan?.JENIS_KUNJUNGAN === 1 ? 'default' : 'secondary'}>
                                                                    {kunjungan.ruangan?.JENIS_KUNJUNGAN === 1
                                                                        ? 'Rawat Jalan'
                                                                        : kunjungan.ruangan?.JENIS_KUNJUNGAN === 2
                                                                          ? 'IGD'
                                                                          : kunjungan.ruangan?.JENIS_KUNJUNGAN === 3
                                                                            ? 'Rawat Inap'
                                                                            : 'Penunjang'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {kunjungan.pasien_pulang?.cara_pulang.DESKRIPSI || 'Penunjang'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.MASUK)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.KELUAR)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getDokumenMenuItems(kunjungan.ruangan?.JENIS_KUNJUNGAN, kunjungan.NOMOR).length >
                                                                0 ? (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm">
                                                                                <Eye className="mr-1 h-4 w-4" />
                                                                                Dokumen
                                                                                <ChevronDown className="ml-1 h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            {getDokumenMenuItems(
                                                                                kunjungan.ruangan?.JENIS_KUNJUNGAN,
                                                                                kunjungan.NOMOR,
                                                                            ).map(([label, url]) => (
                                                                                <DropdownMenuItem
                                                                                    key={label}
                                                                                    onClick={() => router.visit(url)}
                                                                                    className="cursor-pointer"
                                                                                >
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    {label}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" disabled>
                                                                        <Eye className="mr-1 h-4 w-4" />
                                                                        Dokumen
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Kunjungan IGD dengan Penunjang */}
                            {igd.map((group) => (
                                <Card key={`igd-${group.nopen}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-red-500" />
                                            IGD - No. Pendaftaran: {group.nopen}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">No.</TableHead>
                                                        <TableHead>No. Kunjungan</TableHead>
                                                        <TableHead>Ruangan</TableHead>
                                                        <TableHead>Jenis Kunjungan</TableHead>
                                                        <TableHead>Cara Pulang</TableHead>
                                                        <TableHead>Tanggal Masuk</TableHead>
                                                        <TableHead>Tanggal Keluar</TableHead>
                                                        <TableHead>Dokumen</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.kunjungan.map((kunjungan, index) => (
                                                        <TableRow key={kunjungan.id}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{kunjungan.NOMOR || '-'}</TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{kunjungan.ruangan?.DESKRIPSI || '-'}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={kunjungan.ruangan?.JENIS_KUNJUNGAN === 2 ? 'default' : 'secondary'}>
                                                                    {kunjungan.ruangan?.JENIS_KUNJUNGAN === 1
                                                                        ? 'Rawat Jalan'
                                                                        : kunjungan.ruangan?.JENIS_KUNJUNGAN === 2
                                                                          ? 'IGD'
                                                                          : kunjungan.ruangan?.JENIS_KUNJUNGAN === 3
                                                                            ? 'Rawat Inap'
                                                                            : 'Penunjang'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {kunjungan.pasien_pulang?.cara_pulang.DESKRIPSI || 'Penunjang'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.MASUK)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.KELUAR)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getDokumenMenuItems(kunjungan.ruangan?.JENIS_KUNJUNGAN, kunjungan.NOMOR).length >
                                                                0 ? (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm">
                                                                                <Eye className="mr-1 h-4 w-4" />
                                                                                Dokumen
                                                                                <ChevronDown className="ml-1 h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            {getDokumenMenuItems(
                                                                                kunjungan.ruangan?.JENIS_KUNJUNGAN,
                                                                                kunjungan.NOMOR,
                                                                            ).map(([label, url]) => (
                                                                                <DropdownMenuItem
                                                                                    key={label}
                                                                                    onClick={() => router.visit(url)}
                                                                                    className="cursor-pointer"
                                                                                >
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    {label}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" disabled>
                                                                        <Eye className="mr-1 h-4 w-4" />
                                                                        Dokumen
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Kunjungan Penunjang Saja (tanpa kunjungan utama) */}
                            {penunjangSaja.map((group) => (
                                <Card key={`penunjang-${group.nopen}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-orange-500" />
                                            Penunjang - No. Pendaftaran: {group.nopen}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">No.</TableHead>
                                                        <TableHead>No. Kunjungan</TableHead>
                                                        <TableHead>Ruangan</TableHead>
                                                        <TableHead>Jenis Kunjungan</TableHead>
                                                        <TableHead>Tanggal Masuk</TableHead>
                                                        <TableHead>Tanggal Keluar</TableHead>
                                                        <TableHead>Dokumen</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.kunjungan.map((kunjungan, index) => (
                                                        <TableRow key={kunjungan.id}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{kunjungan.NOMOR || '-'}</TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{kunjungan.ruangan?.DESKRIPSI || '-'}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary">Jenis {kunjungan.ruangan?.JENIS_KUNJUNGAN || '-'}</Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.MASUK)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                    {formatDateTime(kunjungan.KELUAR)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getDokumenMenuItems(kunjungan.ruangan?.JENIS_KUNJUNGAN, kunjungan.NOMOR).length >
                                                                0 ? (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm">
                                                                                <Eye className="mr-1 h-4 w-4" />
                                                                                Dokumen
                                                                                <ChevronDown className="ml-1 h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            {getDokumenMenuItems(
                                                                                kunjungan.ruangan?.JENIS_KUNJUNGAN,
                                                                                kunjungan.NOMOR,
                                                                            ).map(([label, url]) => (
                                                                                <DropdownMenuItem
                                                                                    key={label}
                                                                                    onClick={() => router.visit(url)}
                                                                                    className="cursor-pointer"
                                                                                >
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    {label}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" disabled>
                                                                        <Eye className="mr-1 h-4 w-4" />
                                                                        Dokumen
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
