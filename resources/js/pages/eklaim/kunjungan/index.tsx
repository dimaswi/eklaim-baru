import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, ListCheck, Send } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import AppLayout from "@/layouts/app-layout";
import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Search, X, PlusCircle } from "lucide-react";
import { BreadcrumbItem, SharedData } from "@/types";
import PengajuanKlaimModal from "@/components/eklaim/pengajuan-klaim-modal";


interface Ruangan {
    ID: number;
    DESKRIPSI: string;
    JENIS_KUNJUNGAN: number;
}

interface KunjunganRS {
    id: number;
    NOPEN: string;
    RUANGAN: number;
    MASUK: string;
    KELUAR: string;
    ruangan?: Ruangan;
}

interface Pasien {
    NORM: string;
    NAMA: string;
    TANGGAL_LAHIR: string;
    JENIS_KELAMIN: string;
}

interface Pendaftaran {
    NOMOR: string;
    NORM: string;
    TANGGAL: string;
    pasien?: Pasien;
    kunjungan_rs?: KunjunganRS[];
}

interface Penjamin {
    NOPEN: string;
    pendaftaran?: Pendaftaran;
}

interface Kunjungan {
    id: number;
    noSEP: string;
    noKartu: string;
    tglSEP: string;
    status: string;
    klaimStatus: number;
    penjamin?: Penjamin;
    created_at?: string;
    updated_at?: string;
}

interface PaginatedKunjungan {
    data: Kunjungan[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props extends SharedData {
    kunjungan: PaginatedKunjungan;
    ruangan_list: Ruangan[];
    filters: {
        search: string;
        perPage: number;
        status: string;
        start_date: string;
        end_date: string;
        month: string;
        ruangan: string;
        date_type: string;
    };
    hasQuery: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Kunjungan BPJS",
        href: "/eklaim/kunjungan",
    },
];

const CACHE_KEY = 'eklaim_kunjungan_filters';
const CACHE_EXPIRY_HOURS = 24;

interface CachedFilters {
    search: string;
    statusFilter: string;
    ruanganFilter: string;
    dateTypeFilter: string;
    dateRange: { from: string | null; to: string | null } | null;
    monthFilter: string;
    timestamp: number;
}

export default function KunjunganIndex() {
    const { kunjungan, ruangan_list, filters: initialFilters, hasQuery } = usePage<Props>().props;
    
    // Load cached filters from localStorage
    const loadCachedFilters = (): CachedFilters | null => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;
            
            const parsed: CachedFilters = JSON.parse(cached);
            const now = Date.now();
            const expiryTime = parsed.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
            
            // Check if cache is still valid
            if (now < expiryTime) {
                return parsed;
            } else {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
        } catch (error) {
            console.error('Error loading cached filters:', error);
            return null;
        }
    };

    // Initialize state with cached values if available and no query has been made yet
    const cachedFilters = !hasQuery ? loadCachedFilters() : null;
    
    const [search, setSearch] = useState(cachedFilters?.search || initialFilters.search);
    const [statusFilter, setStatusFilter] = useState(cachedFilters?.statusFilter || initialFilters.status || 'all');
    const [ruanganFilter, setRuanganFilter] = useState(cachedFilters?.ruanganFilter || initialFilters.ruangan || 'all');
    const [dateTypeFilter, setDateTypeFilter] = useState(cachedFilters?.dateTypeFilter || initialFilters.date_type || 'masuk');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (cachedFilters?.dateRange) {
            return {
                from: cachedFilters.dateRange.from ? new Date(cachedFilters.dateRange.from) : undefined,
                to: cachedFilters.dateRange.to ? new Date(cachedFilters.dateRange.to) : undefined,
            };
        }
        return {
            from: initialFilters.start_date ? new Date(initialFilters.start_date) : undefined,
            to: initialFilters.end_date ? new Date(initialFilters.end_date) : undefined,
        };
    });
    const [monthFilter, setMonthFilter] = useState(cachedFilters?.monthFilter || initialFilters.month || '');

    // Save filters to localStorage
    const saveCachedFilters = () => {
        try {
            const cacheData: CachedFilters = {
                search,
                statusFilter,
                ruanganFilter,
                dateTypeFilter,
                dateRange: dateRange ? {
                    from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
                    to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
                } : null,
                monthFilter,
                timestamp: Date.now(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving cached filters:', error);
        }
    };

    // Auto-load data if coming from other page and has cached filters
    const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
    
    if (!hasQuery && cachedFilters && !hasAutoLoaded) {
        setHasAutoLoaded(true);
        // Trigger search with cached filters
        router.get("/eklaim/kunjungan", {
            search: cachedFilters.search,
            per_page: initialFilters.perPage,
            status: cachedFilters.statusFilter === 'all' ? '' : cachedFilters.statusFilter,
            ruangan: cachedFilters.ruanganFilter === 'all' ? '' : cachedFilters.ruanganFilter,
            date_type: cachedFilters.dateTypeFilter,
            start_date: cachedFilters.dateRange?.from || '',
            end_date: cachedFilters.dateRange?.to || '',
            month: cachedFilters.monthFilter,
            has_query: '1',
        }, {
            preserveState: true,
            replace: true,
        });
    }

    // Helper function to get admission date from kunjungan_rs
    const getAdmissionDate = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
        if (!kunjungan_rs) return '-';
        
        // Handle both array and single object
        const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
        
        if (kunjunganArray.length === 0) return '-';
        
        // Get the first MASUK date (admission date)
        const firstKunjungan = kunjunganArray[0];
        if (!firstKunjungan?.MASUK || 
            firstKunjungan.MASUK === '' || 
            firstKunjungan.MASUK === '0000-00-00' || 
            firstKunjungan.MASUK === '0000-00-00 00:00:00') {
            return '-';
        }
        
        try {
            return new Date(firstKunjungan.MASUK).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
        } catch (error) {
            return '-';
        }
    };

    // Helper function to get raw admission date for API (with time)
    const getRawAdmissionDate = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
        if (!kunjungan_rs) return '';
        
        const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
        
        if (kunjunganArray.length === 0) return '';
        
        const firstKunjungan = kunjunganArray[0];
        if (!firstKunjungan?.MASUK || 
            firstKunjungan.MASUK === '' || 
            firstKunjungan.MASUK === '0000-00-00' || 
            firstKunjungan.MASUK === '0000-00-00 00:00:00') {
            return '';
        }
        
        try {
            // Return full datetime format for DateTimeInput component
            return format(new Date(firstKunjungan.MASUK), "yyyy-MM-dd'T'HH:mm:ss");
        } catch (error) {
            return '';
        }
    };

    // Helper function to get discharge date from kunjungan_rs
    const getDischargeDate = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
        if (!kunjungan_rs) return '-';
        
        // Handle both array and single object
        const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
        
        if (kunjunganArray.length === 0) return '-';
        
        // Get the first KELUAR date (discharge date)
        const firstKunjungan = kunjunganArray[0];
        if (!firstKunjungan?.KELUAR || 
            firstKunjungan.KELUAR === '' || 
            firstKunjungan.KELUAR === '0000-00-00' || 
            firstKunjungan.KELUAR === '0000-00-00 00:00:00') {
            return '-';
        }
        
        try {
            return new Date(firstKunjungan.KELUAR).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
        } catch (error) {
            return '-';
        }
    };

    // Helper function to get raw discharge date for API (with time)
    const getRawDischargeDate = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
        if (!kunjungan_rs) return '';
        
        const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
        
        if (kunjunganArray.length === 0) return '';
        
        const firstKunjungan = kunjunganArray[0];
        if (!firstKunjungan?.KELUAR || 
            firstKunjungan.KELUAR === '' || 
            firstKunjungan.KELUAR === '0000-00-00' || 
            firstKunjungan.KELUAR === '0000-00-00 00:00:00') {
            return '';
        }
        
        try {
            // Return full datetime format for DateTimeInput component
            return format(new Date(firstKunjungan.KELUAR), "yyyy-MM-dd'T'HH:mm:ss");
        } catch (error) {
            return '';
        }
    };

    // Helper function to get room names from kunjungan_rs
    const getRoomNames = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
        if (!kunjungan_rs) return '-';
        
        // Handle both array and single object
        const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
        
        if (kunjunganArray.length === 0) return '-';
        
        const roomNames = kunjunganArray
            .filter(krs => krs?.ruangan?.DESKRIPSI)
            .map(krs => krs.ruangan!.DESKRIPSI)
            .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
        
        return roomNames.length > 0 ? roomNames.join(', ') : '-';
    };

    const handleSearch = (value: string) => {
        saveCachedFilters();
        router.get("/eklaim/kunjungan", {
            search: value,
            per_page: initialFilters.perPage,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
            month: monthFilter,
            has_query: '1',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get("/eklaim/kunjungan", {
            search: initialFilters.search,
            per_page: perPage,
            page: 1,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
            month: monthFilter,
            has_query: '1',
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get("/eklaim/kunjungan", {
            search: initialFilters.search,
            per_page: initialFilters.perPage,
            page,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
            month: monthFilter,
            has_query: '1',
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
        setStatusFilter('all');
        setRuanganFilter('all');
        setDateTypeFilter('masuk');
        setDateRange(undefined);
        setMonthFilter('');
        localStorage.removeItem(CACHE_KEY);
        router.get("/eklaim/kunjungan", {
            search: '',
            per_page: initialFilters.perPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleApplyFilter = () => {
        saveCachedFilters();
        router.get("/eklaim/kunjungan", {
            search: search,
            per_page: initialFilters.perPage,
            status: statusFilter === 'all' ? '' : statusFilter,
            ruangan: ruanganFilter === 'all' ? '' : ruanganFilter,
            date_type: dateTypeFilter,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
            month: monthFilter,
            has_query: '1',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kunjungan BPJS" />
            <div className="max-w-7xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Cari nama atau No. SEP..."
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
                    
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 hover:bg-green-200"
                        onClick={() => router.visit('/eklaim/pengajuan')}
                    >
                        <ListCheck className="h-4 w-4 text-green-500" />
                        List Pengajuan
                    </Button>
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
                                    <SelectItem value="all"><Badge variant="outline" className="bg-blue-100 text-blue-900">Semua Status</Badge></SelectItem>
                                    <SelectItem value="active"><Badge variant="outline" className="bg-green-100 text-green-800">Belum Diajukan</Badge></SelectItem>
                                    <SelectItem value="completed"><Badge variant="outline" className="bg-red-100 text-red-800">Sudah Diajukan</Badge></SelectItem>
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
                        <Button size="sm" onClick={handleApplyFilter} className="bg-blue-600 hover:bg-blue-700">
                            <Search className="mr-2 h-4 w-4" />
                            Terapkan Filter & Cari Data
                        </Button>
                    </div>
                </div>
                
                {!hasQuery && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Info:</strong> Silakan gunakan form filter di atas dan klik tombol "Terapkan Filter & Cari Data" untuk menampilkan data kunjungan BPJS.
                        </p>
                    </div>
                )}
                
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="w-[10px]">No.</TableHead>
                                <TableHead className="w-[100px]">No. SEP</TableHead>
                                <TableHead className="w-[100px]">Nama Pasien</TableHead>
                                <TableHead className="w-[400px]">Nama Ruangan</TableHead>
                                <TableHead className="w-[120px]">Tgl. Masuk</TableHead>
                                <TableHead className="w-[120px]">Tgl. Keluar</TableHead>
                                <TableHead className="w-[160px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kunjungan.data && kunjungan.data.length > 0 ? (
                                kunjungan.data.map((item: Kunjungan, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{(kunjungan.current_page - 1) * kunjungan.per_page + index + 1}</TableCell>
                                        <TableCell><Badge variant="outline">{item.noSEP}</Badge></TableCell>
                                        <TableCell>{item.penjamin?.pendaftaran?.pasien?.NAMA ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px]" title={getRoomNames(item.penjamin?.pendaftaran?.kunjungan_rs)}>
                                                {getRoomNames(item.penjamin?.pendaftaran?.kunjungan_rs)}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getAdmissionDate(item.penjamin?.pendaftaran?.kunjungan_rs)}</TableCell>
                                        <TableCell>{getDischargeDate(item.penjamin?.pendaftaran?.kunjungan_rs)}</TableCell>
                                        <TableCell>
                                            <PengajuanKlaimModal
                                                data={{
                                                    nomor_kartu: item.noKartu || '',
                                                    nomor_sep: item.noSEP || '',
                                                    nomor_rm: item.penjamin?.pendaftaran?.NORM || '',
                                                    nama_pasien: item.penjamin?.pendaftaran?.pasien?.NAMA || '',
                                                    tgl_lahir: item.penjamin?.pendaftaran?.pasien?.TANGGAL_LAHIR || '',
                                                    gender: item.penjamin?.pendaftaran?.pasien?.JENIS_KELAMIN || '',
                                                    tanggal_masuk: getRawAdmissionDate(item.penjamin?.pendaftaran?.kunjungan_rs),
                                                    tanggal_keluar: getRawDischargeDate(item.penjamin?.pendaftaran?.kunjungan_rs),
                                                    ruangan: getRoomNames(item.penjamin?.pendaftaran?.kunjungan_rs),
                                                    jenis_kunjungan: item.penjamin?.pendaftaran?.kunjungan_rs?.[0]?.ruangan?.JENIS_KUNJUNGAN, // 1 = Rawat Inap, 2 = Rawat Jalan, 3 = Gawat Darurat
                                                    
                                                }}
                                                disabled={item.klaimStatus !== 0}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                            {!hasQuery ? (
                                                <>
                                                    <span className="font-semibold text-lg">Silakan Gunakan Form Filter</span>
                                                    <span className="text-sm">
                                                        Pilih filter yang diinginkan dan klik "Terapkan Filter" atau gunakan pencarian untuk menampilkan data kunjungan
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Tidak ada data kunjungan yang ditemukan</span>
                                                    {(initialFilters.search || initialFilters.status || initialFilters.ruangan) && (
                                                        <span className="text-sm">
                                                            Coba ubah kata kunci pencarian atau hapus filter
                                                        </span>
                                                    )}
                                                </>
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
                        Menampilkan {kunjungan.from} - {kunjungan.to} dari {kunjungan.total} data
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Baris per halaman:</span>
                            <select
                                className="rounded border px-2 py-1 text-sm"
                                value={kunjungan.per_page}
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
                                onClick={() => handlePageChange(kunjungan.current_page - 1)}
                                disabled={kunjungan.current_page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {kunjungan.current_page} of {kunjungan.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(kunjungan.current_page + 1)}
                                disabled={kunjungan.current_page >= kunjungan.last_page}
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