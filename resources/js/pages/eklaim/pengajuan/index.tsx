import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from "react";
import { router } from '@inertiajs/core';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Search, X, Eye, FileText, Package } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { BreadcrumbItem, SharedData } from '@/types';

interface KunjunganBPJS {
    diagAwal: string;
}

interface Penjamin {
    kunjungan_bpjs: KunjunganBPJS;
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
    penjamin?: Penjamin;
    created_at: string;
}

interface PaginatedPengajuanKlaim {
    data: PengajuanKlaim[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Ruangan {
    ID: number;
    DESKRIPSI: string;
}

interface Props extends SharedData {
    pengajuan_klaim: PaginatedPengajuanKlaim;
    ruangan_list: Ruangan[];
    filters: {
        search: string;
        status?: string;
        ruangan?: string;
        date_type?: string;
        start_date?: string;
        end_date?: string;
        perPage: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Pengajuan Klaim",
        href: "/eklaim/pengajuan",
    },
];

export default function PengajuanIndex() {
    const { pengajuan_klaim, ruangan_list, filters: initialFilters } = usePage<Props>().props;
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');
    const [ruanganFilter, setRuanganFilter] = useState(initialFilters.ruangan || 'all');
    const [dateTypeFilter, setDateTypeFilter] = useState(initialFilters.date_type || 'masuk');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: initialFilters.start_date ? new Date(initialFilters.start_date) : undefined,
        to: initialFilters.end_date ? new Date(initialFilters.end_date) : undefined,
    });

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
        return (
            <Badge variant={statusInfo.variant}>
                {statusInfo.label}
            </Badge>
        );
    };

    const handleSearch = (value: string) => {
        router.get("/eklaim/pengajuan", {
            search: value,
            per_page: initialFilters.perPage,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get("/eklaim/pengajuan", {
            search: initialFilters.search,
            per_page: perPage,
            page: 1,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get("/eklaim/pengajuan", {
            search: initialFilters.search,
            per_page: initialFilters.perPage,
            page,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(search);
    };

    const handleClearSearch = () => {
        setSearch("");
        handleSearch("");
    };

    const handleResetFilter = () => {
        setSearch("");
        setStatusFilter('all');
        setRuanganFilter('all');
        setDateTypeFilter('masuk');
        setDateRange(undefined);
        router.get("/eklaim/pengajuan", {
            search: '',
            per_page: initialFilters.perPage,
            status: '',
            ruangan: '',
            date_type: 'masuk',
            start_date: '',
            end_date: '',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleApplyFilter = () => {
        router.get("/eklaim/pengajuan", {
            search: initialFilters.search,
            per_page: initialFilters.perPage,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: id });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: id });
        } catch {
            return dateString;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengajuan Klaim" />
            <div className="max-w-7xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Cari nama pasien atau No. SEP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-10 w-64"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button type="submit" variant="outline" size="sm">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Filter Section */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status-filter">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="0">Default</SelectItem>
                                    <SelectItem value="1">Tersimpan</SelectItem>
                                    <SelectItem value="2">Grouper</SelectItem>
                                    <SelectItem value="3">Grouper Stage 2</SelectItem>
                                    <SelectItem value="4">Final</SelectItem>
                                    <SelectItem value="5">Kirim</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ruangan-filter">Ruangan</Label>
                            <Select value={ruanganFilter} onValueChange={setRuanganFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih ruangan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Ruangan</SelectItem>
                                    {ruangan_list?.map((ruangan) => (
                                        <SelectItem key={ruangan.ID} value={ruangan.ID.toString()}>
                                            {ruangan.DESKRIPSI}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date-type-filter">Jenis Tanggal</Label>
                            <Select value={dateTypeFilter} onValueChange={setDateTypeFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih jenis tanggal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="masuk">Tanggal Masuk</SelectItem>
                                    <SelectItem value="keluar">Tanggal Keluar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="date-filter">
                                {dateTypeFilter === 'masuk' ? 'Tanggal Masuk' : 'Tanggal Keluar'}
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd/MM/yyyy", { locale: id })} -{" "}
                                                    {format(dateRange.to, "dd/MM/yyyy", { locale: id })}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd/MM/yyyy", { locale: id })
                                            )
                                        ) : (
                                            "Pilih rentang tanggal"
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={handleResetFilter}>
                            Reset Filter
                        </Button>
                        <Button size="sm" onClick={handleApplyFilter}>
                            Terapkan Filter
                        </Button>
                    </div>
                </div>
                
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="w-[10px]">No.</TableHead>
                                <TableHead className="w-[100px]">No. SEP</TableHead>
                                <TableHead className="w-[100px]">Nama Pasien</TableHead>
                                <TableHead className="w-[80px]">No. RM</TableHead>
                                <TableHead className="w-[80px]">Diagnosa</TableHead>
                                <TableHead className="w-[120px]">Ruangan</TableHead>
                                <TableHead className="w-[100px]">Tgl. Masuk</TableHead>
                                <TableHead className="w-[100px]">Tgl. Keluar</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[120px]">Tgl. Pengajuan</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pengajuan_klaim.data && pengajuan_klaim.data.length > 0 ? (
                                pengajuan_klaim.data.map((item: PengajuanKlaim, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{(pengajuan_klaim.current_page - 1) * pengajuan_klaim.per_page + index + 1}</TableCell>
                                        <TableCell><Badge variant="outline">{item.nomor_sep}</Badge></TableCell>
                                        <TableCell>{item.nama_pasien}</TableCell>
                                        <TableCell>{item.norm}</TableCell>
                                        <TableCell><Badge variant="outline">{item.penjamin?.kunjungan_bpjs?.diagAwal}</Badge></TableCell>
                                        <TableCell>{item.ruangan}</TableCell>
                                        <TableCell>{item.tanggal_masuk ? formatDate(item.tanggal_masuk) : '-'}</TableCell>
                                        <TableCell>{item.tanggal_keluar ? formatDate(item.tanggal_keluar) : '-'}</TableCell>
                                        <TableCell>{getStatusBadge(item.status_pengiriman)}</TableCell>
                                        <TableCell>{formatDateTime(item.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Link 
                                                    href={`/eklaim/pengajuan/${item.id}/rm`}
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-blue-50 hover:text-accent-foreground h-9 px-3"
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500 mr-1" />
                                                    Detail
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                            <span>Tidak ada data pengajuan klaim yang ditemukan</span>
                                            {initialFilters.search && (
                                                <span className="text-sm">
                                                    Coba ubah kata kunci pencarian atau hapus filter
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {pengajuan_klaim.from} - {pengajuan_klaim.to} dari {pengajuan_klaim.total} data
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Baris per halaman:</span>
                            <select
                                className="rounded border px-2 py-1 text-sm"
                                value={pengajuan_klaim.per_page}
                                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pengajuan_klaim.current_page - 1)}
                                disabled={pengajuan_klaim.current_page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {pengajuan_klaim.current_page} of {pengajuan_klaim.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pengajuan_klaim.current_page + 1)}
                                disabled={pengajuan_klaim.current_page >= pengajuan_klaim.last_page}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
