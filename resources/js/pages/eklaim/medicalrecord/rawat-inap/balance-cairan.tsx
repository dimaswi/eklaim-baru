import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Download, Loader, Save, Trash, Plus, Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TambahBalanceCairanModal from '@/components/eklaim/tambah-balance-cairan-modal';

interface BalanceCairanItem {
    ID?: number;
    KUNJUNGAN: string;
    intake_oral: string;
    intake_ngt: string;
    konsumsi_jumlah: string;
    transfusi_produk: string;
    transfusi_produk_jumlah: string;
    output_oral: string;
    output_ngt: string;
    urine_jumlah: string;
    pendarahan_jumlah: string;
    fases_jumlah: string;
    total_intake: string;
    total_output: string;
    volume_intake: string;
    volume_output: string;
    volume_balance: string;
    suhu: string;
    waktu_pemeriksaan: string;
    tanggal: string;
    nama_petugas: string;
}

interface Kunjungan {
    id: number;
    NOMOR: string;
    NOPEN: string;
    RUANGAN: string;
}

interface Petugas {
    id: number;
    NAMA: string;
    profesi?: {
        DESKRIPSI: string;
    };
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
}

interface Props extends SharedData {
    pengajuan: PengajuanKlaim;
    kunjungan: Kunjungan;
    kop: string;
    petugas: Petugas[];
    savedData?: any;
}

export default function BalanceCairan() {
    const { pengajuan, kunjungan, kop, petugas, savedData } = usePage<Props>().props;
    const [loading, setLoading] = useState<'load' | 'simpan' | 'hapus' | null>(null);
    const [balanceCairanData, setBalanceCairanData] = useState<BalanceCairanItem[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRowData, setNewRowData] = useState<BalanceCairanItem>({
        KUNJUNGAN: kunjungan.NOMOR,
        intake_oral: '0.00',
        intake_ngt: '0.00',
        konsumsi_jumlah: '0.00',
        transfusi_produk: '',
        transfusi_produk_jumlah: '0.00',
        output_oral: '0.00',
        output_ngt: '0.00',
        urine_jumlah: '0.00',
        pendarahan_jumlah: '0.00',
        fases_jumlah: '0.00',
        total_intake: '0.00',
        total_output: '0.00',
        volume_intake: '0.00',
        volume_output: '0.00',
        volume_balance: '0.00',
        suhu: '36.50',
        waktu_pemeriksaan: new Date().toISOString().slice(0, 16),
        tanggal: new Date().toISOString().slice(0, 16),
        nama_petugas: ''
    });

    // Load savedData saat komponen pertama kali dimuat
    useEffect(() => {
        if (savedData && savedData.balance_cairan_data) {
            const savedBalanceData = savedData.balance_cairan_data.balance_cairan || [];
            if (Array.isArray(savedBalanceData) && savedBalanceData.length > 0) {
                setBalanceCairanData(savedBalanceData);
            }
        }
    }, [savedData]);

    // Fungsi untuk membersihkan HTML tags
    const stripHtmlTags = (html: string): string => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pengajuan Klaim',
            href: '/eklaim/pengajuan',
        },
        {
            title: `${pengajuan.nomor_sep}`,
            href: `/eklaim/pengajuan/${pengajuan.id}/rm`,
        },
        {
            title: `Balance Cairan ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

    const handleLoadBalanceCairan = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/rawat-inap/balance-cairan/${kunjungan.NOMOR}`);
            const data = await response.json();
            
            // Set data Balance Cairan yang dimuat dari API
            if (data.kunjungan && data.kunjungan.balance_cairan && Array.isArray(data.kunjungan.balance_cairan)) {
                const balanceMapped = data.kunjungan.balance_cairan.map((item: any) => ({
                    ID: item.ID || null,
                    KUNJUNGAN: item.KUNJUNGAN || '',
                    intake_oral: item.INTAKE_ORAL || '0.00',
                    intake_ngt: item.INTAKE_NGT || '0.00',
                    konsumsi_jumlah: item.KONSUMSI_JUMLAH || '0.00',
                    transfusi_produk: stripHtmlTags(item.TRANSFUSI_PRODUK || ''),
                    transfusi_produk_jumlah: item.TRANSFUSI_PRODUK_JUMLAH || '0.00',
                    output_oral: item.OUTPUT_ORAL || '0.00',
                    output_ngt: item.OUTPUT_NGT || '0.00',
                    urine_jumlah: item.URINE_JUMLAH || '0.00',
                    pendarahan_jumlah: item.PENDARAHAN_JUMLAH || '0.00',
                    fases_jumlah: item.FASES_JUMLAH || '0.00',
                    total_intake: item.TOTAL_INTAKE || '0.00',
                    total_output: item.TOTAL_OUTPUT || '0.00',
                    volume_intake: item.VOLUME_INTAKE || '0.00',
                    volume_output: item.VOLUME_OUTPUT || '0.00',
                    volume_balance: item.VOLUME_BALANCE || '0.00',
                    suhu: item.SUHU || '36.50',
                    waktu_pemeriksaan: item.WAKTU_PEMERIKSAAN || '',
                    tanggal: item.TANGGAL || '',
                    nama_petugas: stripHtmlTags(item.oleh?.NAMA || item.nama_petugas || '')
                }));
                setBalanceCairanData(balanceMapped);
            }
            
            toast.success('Data Balance Cairan berhasil dimuat');
        } catch (error) {
            setLoading(null);
            toast.error('Gagal memuat data Balance Cairan');
        } finally {
            setLoading(null);
        }
    };

    const handleResetData = () => {
        setBalanceCairanData([]);
        toast.success('Data Balance Cairan berhasil direset');
    };

    const handleSimpanBalanceCairan = async () => {
        setLoading('simpan');
        
        if (balanceCairanData.length === 0) {
            toast.error('Tidak ada data balance cairan untuk disimpan');
            setLoading(null);
            return;
        }

        try {
            const dataToSend = {
                pengajuan_klaim_id: pengajuan.id,
                kunjungan_nomor: kunjungan.NOMOR,
                balance_cairan_data: balanceCairanData,
            } as any;

            router.post(`/eklaim/rawat-inap/balance-cairan/${kunjungan.NOMOR}/store`, dataToSend, {
                onSuccess: () => {
                    toast.success('Data Balance Cairan berhasil disimpan');
                    setLoading(null);
                },
                onError: (errors: any) => {
                    console.error('Validation errors:', errors);
                    toast.error('Gagal menyimpan data. Periksa form dan coba lagi.');
                    setLoading(null);
                },
                onFinish: () => {
                    setLoading(null);
                }
            });
        } catch (error) {
            console.error('Error saving Balance Cairan:', error);
            toast.error('Gagal menyimpan data Balance Cairan');
            setLoading(null);
        }
    };

    const handleAddNewRow = () => {
        setIsModalOpen(true);
    };

    const handleSaveNewBalanceCairan = (data: BalanceCairanItem) => {
        setBalanceCairanData([...balanceCairanData, data]);
    };

    const handleEditRow = (index: number) => {
        setEditingIndex(index);
        setNewRowData({ ...balanceCairanData[index] });
    };

    const handleSaveRow = (index: number) => {
        const updatedData = [...balanceCairanData];
        updatedData[index] = { ...newRowData };
        setBalanceCairanData(updatedData);
        setEditingIndex(null);
        toast.success('Data Balance Cairan berhasil disimpan');
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setNewRowData({
            KUNJUNGAN: kunjungan.NOMOR,
            intake_oral: '0.00',
            intake_ngt: '0.00',
            konsumsi_jumlah: '0.00',
            transfusi_produk: '',
            transfusi_produk_jumlah: '0.00',
            output_oral: '0.00',
            output_ngt: '0.00',
            urine_jumlah: '0.00',
            pendarahan_jumlah: '0.00',
            fases_jumlah: '0.00',
            total_intake: '0.00',
            total_output: '0.00',
            volume_intake: '0.00',
            volume_output: '0.00',
            volume_balance: '0.00',
            suhu: '36.50',
            waktu_pemeriksaan: new Date().toISOString().slice(0, 16),
            tanggal: new Date().toISOString().slice(0, 16),
            nama_petugas: ''
        });
    };

    const handleDeleteRow = (index: number) => {
        const updatedData = balanceCairanData.filter((_, i) => i !== index);
        setBalanceCairanData(updatedData);
        toast.success('Data Balance Cairan berhasil dihapus');
    };

    const handleInputChange = (field: keyof BalanceCairanItem, value: string) => {
        setNewRowData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Balance Cairan - ${pengajuan.nomor_sep}`} />

            <div className="max-w-7xl p-4">
                <div className="mb-4 flex items-center justify-end gap-2">
                    <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadBalanceCairan}>
                        {loading === 'load' ? <Loader className="mr-2 animate-spin" /> : <Download className="mr-2 text-blue-500" />}
                        Load
                    </Button>
                    <Button variant="outline" onClick={handleAddNewRow}>
                        <Plus className="mr-2 text-green-500" />
                        Tambah Balance Cairan
                    </Button>
                    <Button
                        variant="outline"
                        disabled={loading === 'simpan'}
                        onClick={handleSimpanBalanceCairan}
                    >
                        {loading === 'simpan' ? <Loader className="mr-2 animate-spin" /> : <Save className="mr-2 text-blue-500" />}
                        Simpan
                    </Button>
                    <Button variant="outline" disabled={loading === 'hapus'} onClick={handleResetData}>
                        {loading === 'hapus' ? <Loader className="mr-2 animate-spin" /> : <Trash className="mr-2 text-red-500" />}
                        Hapus
                    </Button>
                </div>
                {/* KOP */}
                <div>
                    <table
                        style={{
                            fontFamily: 'halvetica, sans-serif',
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #000',
                        }}
                    >
                        <tbody>
                            <tr>
                                <td colSpan={2}>
                                    <center>
                                        <img src={kop} alt="Logo Klinik" style={{ width: 50, height: 50 }} />
                                    </center>
                                </td>
                                <td colSpan={4}>
                                    <div style={{ lineHeight: '1.2' }}>
                                        <h3 style={{ fontSize: 20, textAlign: 'left' }}>KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h3>
                                        <p style={{ fontSize: 12, textAlign: 'left' }}>
                                            Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro <br />
                                            Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646 <br />
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            <tr style={{ background: 'black', color: 'white', textAlign: 'center' }}>
                                <td colSpan={8}>
                                    <h3 style={{ fontSize: 16 }}>BALANCE CAIRAN</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* DATA BALANCE CAIRAN */}
                <div>
                    <table
                        style={{
                            fontFamily: 'Arial, sans-serif',
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #000',
                            fontSize: '11px'
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '100px' }}>Tanggal</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '60px' }}>Suhu</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Intake Oral</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Intake NGT</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Konsumsi</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Transfusi</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Output Oral</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Output NGT</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Urine</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Fases</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Total Intake</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Total Output</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Balance</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '100px' }}>Petugas</th>
                                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '70px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                return balanceCairanData.length === 0 ? (
                                    <tr>
                                        <td colSpan={15} style={{ border: '1px solid #000', padding: '20px', textAlign: 'center', color: '#666' }}>
                                            Belum ada data Balance Cairan. Klik "Load" untuk memuat data atau "Tambah Balance Cairan" untuk menambah data baru.
                                        </td>
                                    </tr>
                                ) : (
                                    balanceCairanData.map((item, index) => {
                                        return (
                                        <tr key={index}>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                                {editingIndex === index ? (
                                                    <input
                                                        type="datetime-local"
                                                        value={newRowData.tanggal}
                                                        onChange={(e) => handleInputChange('tanggal', e.target.value)}
                                                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                    />
                                                ) : (
                                                    <div style={{ fontSize: '10px' }}>
                                                        {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : 'No Date'}
                                                    </div>
                                                )}
                                            </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={newRowData.suhu}
                                                    onChange={(e) => handleInputChange('suhu', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.suhu || 'No Data'}°C</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.intake_oral}
                                                    onChange={(e) => handleInputChange('intake_oral', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.intake_oral || '0.00'}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.intake_ngt}
                                                    onChange={(e) => handleInputChange('intake_ngt', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.intake_ngt}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.konsumsi_jumlah}
                                                    onChange={(e) => handleInputChange('konsumsi_jumlah', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.konsumsi_jumlah}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Produk"
                                                        value={newRowData.transfusi_produk}
                                                        onChange={(e) => handleInputChange('transfusi_produk', e.target.value)}
                                                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '9px', marginBottom: '2px' }}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Jumlah"
                                                        value={newRowData.transfusi_produk_jumlah}
                                                        onChange={(e) => handleInputChange('transfusi_produk_jumlah', e.target.value)}
                                                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '9px' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>
                                                    {item.transfusi_produk && <div>{stripHtmlTags(item.transfusi_produk)}</div>}
                                                    <div>{item.transfusi_produk_jumlah}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.output_oral}
                                                    onChange={(e) => handleInputChange('output_oral', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.output_oral}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.output_ngt}
                                                    onChange={(e) => handleInputChange('output_ngt', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.output_ngt}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.urine_jumlah}
                                                    onChange={(e) => handleInputChange('urine_jumlah', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.urine_jumlah}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.fases_jumlah}
                                                    onChange={(e) => handleInputChange('fases_jumlah', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{item.fases_jumlah}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top', background: '#f9f9f9' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.total_intake}
                                                    onChange={(e) => handleInputChange('total_intake', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px', fontWeight: 'bold' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.total_intake}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top', background: '#f9f9f9' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.total_output}
                                                    onChange={(e) => handleInputChange('total_output', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px', fontWeight: 'bold' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.total_output}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', verticalAlign: 'top', background: '#ffffcc' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newRowData.volume_balance}
                                                    onChange={(e) => handleInputChange('volume_balance', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px', fontWeight: 'bold' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.volume_balance}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="text"
                                                    value={newRowData.nama_petugas}
                                                    onChange={(e) => handleInputChange('nama_petugas', e.target.value)}
                                                    placeholder="Nama Petugas"
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '10px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '10px' }}>{stripHtmlTags(item.nama_petugas)}</div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                                            {editingIndex === index ? (
                                                <div className="flex gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleSaveRow(index)}
                                                        className="h-5 w-5 p-0"
                                                    >
                                                        <Save className="h-3 w-3 text-green-500" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={handleCancelEdit}
                                                        className="h-5 w-5 p-0"
                                                    >
                                                        <X className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleEditRow(index)}
                                                        className="h-5 w-5 p-0"
                                                    >
                                                        <Edit className="h-3 w-3 text-blue-500" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleDeleteRow(index)}
                                                        className="h-5 w-5 p-0"
                                                    >
                                                        <Trash className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )})
                                );
                            })()}
                        </tbody>
                    </table>
                </div>

                {/* Modal Tambah Balance Cairan */}
                <TambahBalanceCairanModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNewBalanceCairan}
                    petugas={petugas || []}
                    kunjunganNomor={kunjungan.NOMOR}
                />
            </div>
        </AppLayout>
    );
}
