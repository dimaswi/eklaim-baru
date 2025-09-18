import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Download, Loader, Save, Trash, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AddItemModal from '@/components/tagihan/AddItemModal';

interface RincianTagihan {
    ID: number;
    TAGIHAN: string;
    JENIS: number;
    TARIF_ID: number;
    JUMLAH: number;
    TARIF: number;
    PERSENTASE_DISKON: number;
    DISKON: number;
    STATUS: number;
    COA: number;
    // Additional fields for manual items
    nama_item?: string;
    is_manual?: boolean;
    tarif_administrasi?: {
        nama_tarif?: {
            DESKRIPSI: string;
        };
    };
    tarif_ruang_rawat?: {
        DESKRIPSI: string;
    };
    tarif_tindakan?: {
        nama_tindakan?: {
            NAMA: string;
        };
    };
    tarif_harga_barang?: {
        nama_barang?: {
            NAMA: string;
        };
    };
    tarif_paket?: {
        DESKRIPSI: string;
    };
    tarif_o2?: {
        DESKRIPSI: string;
    };
}

interface Kunjungan {
    id: number;
    NOMOR: string;
    NOPEN: string;
    RUANGAN: string;
}

interface Tindakan {
    KODE: string;
    NAMA: string;
    TARIF: number;
}

interface Obat {
    KODE: string;
    NAMA: string;
    HARGA_JUAL: number;
    SATUAN: string;
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

interface SavedTagihan {
    id: number;
    pengajuan_klaim_id: number;
    nomor_kunjungan: string;
    data_pasien: {
        nama?: string;
        norm?: string;
        tanggal_lahir?: string;
        jenis_kelamin?: string | number;
        alamat?: string;
        desa?: string;
        kecamatan?: string;
        nomor_tagihan?: string;
    };
    rincian_tagihan: RincianTagihan[];
    total_tagihan: number;
    nama_petugas: string;
    created_at: string;
    updated_at: string;
}

interface Props extends SharedData {
    pengajuan: PengajuanKlaim;
    kunjungan: Kunjungan;
    kop: string;
    savedTagihan?: SavedTagihan;
    tindakan: Tindakan[];
    obat: Obat[];
}

export default function TagihanPage() {
    const { pengajuan, kunjungan, kop, savedTagihan, tindakan = [], obat = [] } = usePage<Props>().props;
    const [loading, setLoading] = useState<'load' | 'simpan' | 'hapus' | null>(null);
    const [manualItems, setManualItems] = useState<RincianTagihan[]>([]);
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
            title: `Tagihan ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

    const [pasien, setPasien] = useState<{
        nama?: string;
        norm?: string;
        tanggal_lahir?: string;
        jenis_kelamin?: string | number;
        alamat?: string;
        desa?: string;
        kecamatan?: string;
        nomor_tagihan?: string;
        nama_petugas?: string;
    } | null>(null);

    const [rincianTagihan, setRincianTagihan] = useState<RincianTagihan[]>([]);

    // Load data yang sudah disimpan saat komponen di-mount
    useEffect(() => {
        if (savedTagihan) {
            setPasien(savedTagihan.data_pasien);
            
            // Separate manual and regular items
            const regularItems = savedTagihan.rincian_tagihan.filter(item => !item.is_manual);
            const manualItemsFromSaved = savedTagihan.rincian_tagihan.filter(item => item.is_manual);
            
            setRincianTagihan(regularItems);
            setManualItems(manualItemsFromSaved);
        }
    }, [savedTagihan]);

    const handleLoadDataTagihan = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/tagihan/${kunjungan.NOMOR}`);
            const data = await response.json();
            setPasien({
                nama: data.pasien?.NAMA || 'Tidak ada',
                norm: data.pasien?.NORM || 'Tidak ada',
                tanggal_lahir: data.pasien?.TANGGAL_LAHIR || 'Tidak ada',
                jenis_kelamin: data.pasien?.JENIS_KELAMIN ?? '',
                alamat: data.pasien?.ALAMAT || 'Tidak ada',
                desa: data.pasien?.desa?.DESKRIPSI || 'Tidak ada',
                kecamatan: data.pasien?.kecamatan?.DESKRIPSI || 'Tidak ada',
                nomor_tagihan: data.kunjungan?.NOPEN || 'Tidak ada',
                nama_petugas: data.nama_petugas || 'Tidak ada',
            });
            setRincianTagihan(data.rincian_tagihan || []);
            setManualItems([]); // Reset manual items when loading from SIMRS
            toast.success('Data berhasil dimuat');
        } catch (error) {
            setLoading(null);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(null);
        }
    };

    const handleResetData = () => {
        setLoading('hapus');
        try {
            setPasien(null);
            setRincianTagihan([]);
            setManualItems([]);
            toast.success('Data berhasil direset');
        } catch (error) {
            setLoading(null);
            toast.error('Gagal mereset data');
        } finally {
            setLoading(null);
        }
    };

    const handleSimpanData = async () => {
        const allItems = [...rincianTagihan, ...manualItems];
        
        if (!pasien || allItems.length === 0) {
            toast.error('Tidak ada data untuk disimpan');
            return;
        }

        setLoading('simpan');
        
        // Hitung total tagihan dari semua items
        const calculatedTotal = allItems.reduce((total, item) => {
            const subtotal = item.JUMLAH * item.TARIF;
            const diskon = (subtotal * item.PERSENTASE_DISKON) / 100;
            return total + (subtotal - diskon);
        }, 0);

        router.post(`/eklaim/pengajuan/${pengajuan.id}/tagihan/store`, {
            nomor_kunjungan: kunjungan.NOMOR,
            data_pasien: JSON.stringify(pasien),
            rincian_tagihan: JSON.stringify(allItems),
            total_tagihan: calculatedTotal,
            nama_petugas: pasien.nama_petugas || '-',
        }, {
            onSuccess: (page) => {
                toast.success('Data tagihan berhasil disimpan');
            },
            onError: (errors) => {
                console.error('Error saving tagihan:', errors);
                const errorMessage = Object.values(errors).flat().join(', ') || 'Gagal menyimpan data tagihan';
                toast.error(errorMessage);
            },
            onFinish: () => {
                setLoading(null);
            }
        });
    };

    const handleAddManualItem = (item: RincianTagihan) => {
        try {
            setManualItems(prev => [...prev, item]);
            toast.success('Item berhasil ditambahkan ke tagihan');
        } catch (error) {
            console.error('Error adding manual item:', error);
            toast.error('Gagal menambahkan item');
        }
    };

    const handleRemoveManualItem = (itemId: number) => {
        try {
            setManualItems(prev => prev.filter(item => item.ID !== itemId));
            toast.success('Item berhasil dihapus');
        } catch (error) {
            console.error('Error removing manual item:', error);
            toast.error('Gagal menghapus item');
        }
    };

    function formatTanggalIndo(tanggal?: string) {
        if (!tanggal) return '-';

        // Extract date part if it's a datetime string (YYYY-MM-DD HH:mm:ss)
        let dateOnly = tanggal;
        if (tanggal.includes(' ')) {
            dateOnly = tanggal.split(' ')[0];
        }

        const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const [tahun, bulan, hari] = dateOnly.split('-');
        if (!tahun || !bulan || !hari) return tanggal;
        return `${parseInt(hari)} ${bulanIndo[parseInt(bulan) - 1]} ${tahun}`;
    }

    function formatTanggalIndoDateTime(datetime?: string) {
        if (!datetime) return '-';
        // format: YYYY-MM-DD HH:mm:ss
        const [tanggal, waktu] = datetime.split(' ');
        if (!tanggal || !waktu) return datetime;
        const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const [tahun, bulan, hari] = tanggal.split('-');
        if (!tahun || !bulan || !hari) return datetime;
        const [jam, menit] = waktu.split(':');
        return `${parseInt(hari)} ${bulanIndo[parseInt(bulan) - 1]} ${tahun} ${jam}:${menit}`;
    }

    // Fungsi untuk mendapatkan nama tarif berdasarkan jenis
    const getNamaTarif = (item: RincianTagihan): string => {
        // If it's a manual item, use the stored name
        if (item.is_manual && item.nama_item) {
            return item.nama_item;
        }

        switch (item.JENIS) {
            case 1:
                return item.tarif_administrasi?.nama_tarif?.DESKRIPSI || 'Tarif Administrasi';
            case 2:
                return item.tarif_ruang_rawat?.DESKRIPSI || 'Tarif Ruang Rawat';
            case 3:
                return item.tarif_tindakan?.nama_tindakan?.NAMA || 'Tarif Tindakan';
            case 4:
                return item.tarif_harga_barang?.nama_barang?.NAMA || 'Tarif Barang';
            case 5:
                return item.tarif_paket?.DESKRIPSI || 'Tarif Paket';
            case 6:
                return item.tarif_o2?.DESKRIPSI || 'Tarif Oksigen';
            default:
                return 'Tidak Diketahui';
        }
    };

    // Fungsi untuk mendapatkan kategori berdasarkan jenis
    const getKategoriTarif = (jenis: number): string => {
        switch (jenis) {
            case 1: return 'Administrasi';
            case 2: return 'Ruang Rawat';
            case 3: return 'Tindakan';
            case 4: return 'Barang/Obat';
            case 5: return 'Paket';
            case 6: return 'Oksigen';
            default: return 'Lainnya';
        }
    };

    // Fungsi untuk format rupiah
    const formatRupiah = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Hitung total tagihan dari semua items (SIMRS + Manual)
    const allRincianTagihan = [...rincianTagihan, ...manualItems];
    const totalTagihan = allRincianTagihan.reduce((total, item) => {
        const subtotal = item.JUMLAH * item.TARIF;
        const diskon = (subtotal * item.PERSENTASE_DISKON) / 100;
        return total + (subtotal - diskon);
    }, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tagihan - ${pengajuan.nomor_sep}`} />
            <div className="max-w-7xl p-4">
                {/* Status Indicator */}
                {savedTagihan && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-green-700">
                                <strong>Data tersimpan:</strong> Terakhir disimpan pada {formatTanggalIndoDateTime(savedTagihan.updated_at)}
                                {manualItems.length > 0 && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                        {manualItems.length} item manual
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-green-600">
                                Total: {formatRupiah(savedTagihan.total_tagihan)}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mb-4 flex items-center justify-end gap-2">
                    <AddItemModal 
                        tindakan={tindakan} 
                        obat={obat} 
                        onAddItem={handleAddManualItem}
                    >
                        <Button variant="outline">
                            <Plus className="mr-2 text-green-500" />
                            Tambah Item
                        </Button>
                    </AddItemModal>
                    <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadDataTagihan} title="Muat ulang data dari SIMRS">
                        {loading === 'load' ? <Loader className="mr-2 animate-spin" /> : <Download className="mr-2 text-blue-500" />}
                        Load dari SIMRS
                    </Button>
                    <Button
                        variant="outline"
                        disabled={loading === 'simpan'}
                        onClick={handleSimpanData}
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
                                    <h3 style={{ fontSize: 16 }}>TAGIHAN</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

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
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Nama Pasien : <br />
                                    <b>{pasien?.nama || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    No. RM : <br />
                                    <b>{pasien?.norm || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Tanggal Lahir : <br />
                                    <b>{formatTanggalIndo(pasien?.tanggal_lahir)}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Jenis Kelamin : <br />
                                    <b>{pasien?.jenis_kelamin === 1 || pasien?.jenis_kelamin === '1' || pasien?.jenis_kelamin === 'L' || pasien?.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 
                                        pasien?.jenis_kelamin === 2 || pasien?.jenis_kelamin === '2' || pasien?.jenis_kelamin === 'P' || pasien?.jenis_kelamin === 'Perempuan' ? 'Perempuan' : '-'}</b>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Alamat : <br />
                                    <b>{pasien?.alamat || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Desa : <br />
                                    <b>{pasien?.desa || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Kecamatan : <br />
                                    <b>{pasien?.kecamatan || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Nomor Pendaftaran : <br />
                                    <b>{pasien?.nomor_tagihan || '-'}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* RINCIAN TAGIHAN */}
                <div style={{ 
                    fontFamily: 'halvetica, sans-serif',
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #000',
                    marginTop: '10px'
                }}>
                    <div style={{ 
                        background: '#f8f9fa', 
                        border: '1px solid #000', 
                        padding: '10px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                            RINCIAN TAGIHAN
                        </h3>
                    </div>
                    
                    <div style={{ border: '1px solid #000', padding: '15px' }}>
                        {allRincianTagihan.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    fontSize: '12px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '5%'
                                            }}>No</th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '12%'
                                            }}>Kategori</th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '30%'
                                            }}>Nama Tarif</th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '8%'
                                            }}>Qty</th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '13%'
                                            }}>Harga Satuan</th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '8%'
                                            }}>Diskon (%)</th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '13%'
                                            }}>Subtotal</th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                width: '5%'
                                            }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allRincianTagihan.map((item, index) => {
                                            const subtotal = item.JUMLAH * item.TARIF;
                                            const diskon = (subtotal * item.PERSENTASE_DISKON) / 100;
                                            const total = subtotal - diskon;

                                            return (
                                                <tr key={`${item.is_manual ? 'manual' : 'simrs'}-${item.JENIS}-${item.TARIF_ID || item.ID}-${index}`}>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px', 
                                                        textAlign: 'center'
                                                    }}>
                                                        {index + 1}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px'
                                                    }}>
                                                        {getKategoriTarif(item.JENIS)}
                                                        {item.is_manual && (
                                                            <span style={{ 
                                                                backgroundColor: '#e3f2fd', 
                                                                color: '#1565c0',
                                                                fontSize: '9px',
                                                                padding: '1px 4px',
                                                                borderRadius: '3px',
                                                                marginLeft: '5px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                MANUAL
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px'
                                                    }}>
                                                        {getNamaTarif(item)}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px', 
                                                        textAlign: 'center'
                                                    }}>
                                                        {item.JUMLAH}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px', 
                                                        textAlign: 'right'
                                                    }}>
                                                        {formatRupiah(item.TARIF)}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px', 
                                                        textAlign: 'center'
                                                    }}>
                                                        {item.PERSENTASE_DISKON}%
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px', 
                                                        textAlign: 'right',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {formatRupiah(total)}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '6px', 
                                                        textAlign: 'center'
                                                    }}>
                                                        {item.is_manual && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveManualItem(item.ID)}
                                                                style={{
                                                                    padding: '4px',
                                                                    height: 'auto',
                                                                    color: '#dc3545'
                                                                }}
                                                                title="Hapus item manual"
                                                            >
                                                                <X style={{ width: '12px', height: '12px' }} />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ backgroundColor: '#e9ecef' }}>
                                            <td colSpan={7} style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'right',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}>
                                                TOTAL TAGIHAN:
                                            </td>
                                            <td style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'right',
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                backgroundColor: '#28a745',
                                                color: '#fff'
                                            }}>
                                                {formatRupiah(totalTagihan)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '20px',
                                fontStyle: 'italic',
                                color: '#6c757d'
                            }}>
                                {pasien ? 'Tidak ada data rincian tagihan' : 
                                 savedTagihan ? 'Data tagihan tersimpan kosong' :
                                 'Klik tombol "Load dari SIMRS" untuk memuat data tagihan atau "Tambah Item" untuk menambah item manual'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
