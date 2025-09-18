import ModalTambahHasilRadiologi from '@/components/eklaim/modal-tambah-hasil-radiologi';
import ModalTambahRadiologiFiktif from '@/components/eklaim/modal-tambah-radiologi-fiktif';
import ModalPetugasDokter from '@/components/modals/ModalPetugasDokter';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Loader, PlusCircle, Save, Trash, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface HasilRadiologi {
    ID: number;
    TANGGAL: string;
    KLINIS: string;
    KESAN: string;
    USUL: string;
    HASIL: string;
    BTK: string;
}

interface TindakanMedis {
    ID: number;
    TANGGAL: string;
    nama_tindakan: {
        NAMA: string;
    };
    hasil_radiologi: HasilRadiologi[];
}

interface Tindakan {
    ID: number;
    NAMA: string;
}

interface Pegawai {
    NIP: string;
    NAMA: string;
    PROFESI: number;
}

interface Dokter {
    NIP: string;
    NAMA: string;
    SPESIALISASI?: string;
    pegawai?: {
        NAMA: string;
    };
}

interface Kunjungan {
    id: number;
    NOMOR: string;
    NOPEN: string;
    RUANGAN: string;
    tindakan_medis: TindakanMedis[];
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
    tgl_lahir?: string;
    gender?: string;
}

interface Props extends SharedData {
    pengajuan: PengajuanKlaim;
    kunjungan: Kunjungan;
    kop: string;
    tindakan: Tindakan[];
    savedData?: any;
    dataFiktif?: any;
    pegawaiList?: Pegawai[];
    dokterList?: Dokter[];
}

interface TambahHasilRadiologiData {
    tindakanId: number;
    namaTindakan: string;
    tanggal: string;
    klinis: string;
    kesan: string;
    usul: string;
    hasil: string;
    btk: string;
}

export default function HasilRadiologiPage() {
    const { pengajuan, kunjungan, kop, tindakan, savedData, dataFiktif, pegawaiList, dokterList } = usePage<Props>().props;
    const [loading, setLoading] = useState<'load' | 'simpan' | 'hapus' | null>(null);
    const [kunjunganData, setKunjunganData] = useState<Kunjungan | null>(null);
    const [pasienData, setPasienData] = useState<any>(null);
    const [showModalTambah, setShowModalTambah] = useState(false);
    const [showModalTambahFiktif, setShowModalTambahFiktif] = useState(false);
    const [editingHasil, setEditingHasil] = useState<{ [key: string]: { [field: string]: string } }>({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tindakanToDelete, setTindakanToDelete] = useState<string | null>(null);
    const [tindakanFiktif, setTindakanFiktif] = useState<any[]>([]);
    const [showModalPetugasDokter, setShowModalPetugasDokter] = useState(false);
    const [pendingSaveData, setPendingSaveData] = useState<any>(null);

    const handleTambahTindakanFiktif = (data: any) => {
        const newTindakan = {
            id: Date.now(),
            tindakanId: data.tindakanId,
            namaTindakan: data.namaTindakan,
            tanggal: data.tanggal,
            klinis: data.klinis,
            kesan: data.kesan,
            usul: data.usul,
            hasil: data.hasil,
            btk: data.btk,
        };
        
        setTindakanFiktif((prev) => [...prev, newTindakan]);
    };

    const handleSimpanTindakanFiktif = async () => {
        if (!tindakanFiktif || tindakanFiktif.length === 0) {
            toast.error('Tidak ada data fiktif untuk disimpan');
            return;
        }

        // Simpan data fiktif yang akan disimpan
        setPendingSaveData({
            pengajuan_klaim_id: pengajuan.id,
            hasil_radiologi: tindakanFiktif,
            tanggal_pemeriksaan: tindakanFiktif[0]?.tanggal || new Date().toISOString().split('T')[0],
        });

        // Tampilkan modal untuk memilih petugas dan dokter
        setShowModalPetugasDokter(true);
    };

    // Fungsi untuk mengelompokkan data fiktif berdasarkan ID dan nama tindakan
    const getGroupedFiktifData = () => {
        if (!dataFiktif || dataFiktif.length === 0) {
            return [];
        }

        // Debug: log data yang diterima
        console.log('dataFiktif received:', dataFiktif);

        // Warna untuk setiap grup data fiktif
        const colors = [
            '#e8f5e8', // Light Green
            '#fff3e0', // Light Orange
            '#f3e5f5', // Light Purple
            '#e3f2fd', // Light Blue
            '#fce4ec', // Light Pink
            '#f1f8e9', // Light Lime
            '#e0f2f1', // Light Teal
            '#fff8e1', // Light Yellow
        ];

        const grouped = dataFiktif.map((item: any, dataIndex: number) => {
            const fiktifId = item.id;
            const groupColor = colors[dataIndex % colors.length];
            const groupIndex = dataIndex + 1;
            
            // Debug: log setiap item
            console.log(`Item ${dataIndex}:`, item);
            
            // Coba ambil nama tindakan dari berbagai sumber
            let namaTindakan = 'Tindakan Fiktif';
            
            // Coba dari tindakan_medis_data -> hasil_radiologi
            if (item.tindakan_medis_data?.hasil_radiologi?.[0]?.namaTindakan) {
                namaTindakan = item.tindakan_medis_data.hasil_radiologi[0].namaTindakan;
            }
            // Coba dari hasil_radiologi langsung
            else if (item.hasil_radiologi?.[0]?.namaTindakan) {
                namaTindakan = item.hasil_radiologi[0].namaTindakan;
            }
            // Coba dari nama_tindakan field
            else if (item.nama_tindakan) {
                try {
                    const namaTindakanObj = typeof item.nama_tindakan === 'string' ? JSON.parse(item.nama_tindakan) : item.nama_tindakan;
                    namaTindakan = namaTindakanObj?.NAMA || namaTindakan;
                } catch (e) {
                    namaTindakan = item.nama_tindakan;
                }
            }
            
            const result = {
                fiktifId,
                groupColor,
                groupIndex,
                nomorKunjunganFiktif: item.nomor_kunjungan_fiktif || item.kunjungan_nomor,
                namaTindakan: namaTindakan,
                jenisPemeriksaan: item.jenis_pemeriksaan || '-',
                tanggalPemeriksaan: item.tanggal_pemeriksaan || '-',
                klinis: item.klinis || '-',
                kesan: item.kesan || '-',
                usul: item.usul || '-',
                hasilRadiologi: item.hasil || '-',
                btk: item.btk || '-',
                dokterRadiologi: item.dokter_radiologi || '-',
                saran: item.saran || '-',
            };
            
            // Debug: log hasil mapping
            console.log(`Mapped result ${dataIndex}:`, result);
            
            return result;
        });

        return grouped;
    };

    useEffect(() => {
        if (savedData) {
            // Konversi savedData ke format yang sesuai untuk ditampilkan
            const tindakanMedisData = savedData.tindakan_medis_data?.hasil_radiologi || [];
            
            if (tindakanMedisData.length > 0) {
                setKunjunganData({
                    ...kunjungan,
                    tindakan_medis: tindakanMedisData
                } as any);
                
                // Set editing hasil dari savedData
                const editingData: { [key: string]: { [field: string]: string } } = {};
                tindakanMedisData.forEach((tm: any) => {
                    if (tm.hasil_edited) {
                        editingData[tm.ID] = tm.hasil_edited;
                    }
                });
                setEditingHasil(editingData);
            }
        }

        setPasienData({
            NAMA: pengajuan?.nama_pasien || '',
            NORM: pengajuan?.norm || '',
            TANGGAL_LAHIR: pengajuan?.tgl_lahir || '',
            JENIS_KELAMIN: pengajuan?.gender ? parseInt(pengajuan.gender) : undefined,
        });
    }, [savedData]);
    
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
            title: `Hasil Radiologi ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

    const handleLoadDataHasilRadiologi = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/radiologi/hasil/${kunjungan.NOMOR}`);
            const data = await response.json();

            // Pastikan setiap tindakan_medis memiliki array hasil_radiologi
            const processedTindakanMedis = (data.kunjungan?.tindakan_medis || []).map((tindakan: any) => {
                let hasilRadiologiArray = [];

                // Jika hasil_radiologi adalah object (bukan array), konversi ke array
                if (tindakan.hasil_radiologi) {
                    if (Array.isArray(tindakan.hasil_radiologi)) {
                        hasilRadiologiArray = tindakan.hasil_radiologi;
                    } else {
                        // Convert single object to array
                        hasilRadiologiArray = [tindakan.hasil_radiologi];
                    }
                }

                return {
                    ...tindakan,
                    hasil_radiologi: hasilRadiologiArray,
                };
            });

            // Set kunjungan data secara manual
            setKunjunganData({
                id: data.kunjungan?.id || 0,
                NOMOR: data.kunjungan?.NOMOR || '',
                NOPEN: data.kunjungan?.NOPEN || '',
                RUANGAN: data.kunjungan?.RUANGAN || '',
                tindakan_medis: processedTindakanMedis,
            });

            // Set pasien data secara manual
            setPasienData({
                NAMA: data.pasien?.NAMA || '',
                NORM: data.pasien?.NORM || '',
                TANGGAL_LAHIR: data.pasien?.TANGGAL_LAHIR || '',
                JENIS_KELAMIN: data.pasien?.JENIS_KELAMIN || null,
            });
            toast.success('Data berhasil dimuat');
        } catch (error) {
            console.log(error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(null);
        }
    };

    const handleResetData = () => {
        setLoading('hapus');
        try {
            setKunjunganData(null);
            setPasienData(null);
            setEditingHasil({});
            toast.success('Data berhasil direset');
        } catch (error) {
            toast.error('Gagal mereset data');
        } finally {
            setLoading(null);
        }
    };

    const handleSimpanHasilRadiologi = async () => {
        if (!kunjunganData || !pasienData) {
            toast.error('Tidak ada data untuk disimpan');
            return;
        }

        // Show modal for petugas and dokter selection
        setPendingSaveData(null); // Tandai bahwa ini bukan data fiktif
        setShowModalPetugasDokter(true);
    };

    const handleSubmitPetugasDokter = (data: {
        petugasMedisId: string;
        petugasMedisNama: string;
        dokterPenanggungJawabId: string;
        dokterPenanggungJawabNama: string;
    }) => {
        setLoading('simpan');
        setShowModalPetugasDokter(false);

        try {
            let dataToSend: any;
            let endpoint: string;

            // Cek apakah ini untuk data fiktif atau data normal
            if (pendingSaveData) {
                // Data fiktif
                dataToSend = {
                    ...pendingSaveData,
                    petugas_medis_id: data.petugasMedisId,
                    petugas_medis_nama: data.petugasMedisNama,
                    dokter_penanggung_jawab_id: data.dokterPenanggungJawabId,
                    dokter_penanggung_jawab_nama: data.dokterPenanggungJawabNama,
                };
                endpoint = route('eklaim.radiologi.fiktif.store');
            } else {
                // Data normal
                dataToSend = {
                    pengajuan_klaim_id: pengajuan.id,
                    kunjungan_nomor: kunjungan.NOMOR,
                    tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
                    jenis_pemeriksaan: 'Radiologi',
                    hasil_radiologi:
                        kunjunganData?.tindakan_medis?.map((tm) => ({
                            ...tm,
                            hasil_edited: editingHasil[tm.ID] || tm.hasil_radiologi?.[0]?.HASIL || '',
                        })) || [],
                    petugas_medis_id: data.petugasMedisId,
                    petugas_medis_nama: data.petugasMedisNama,
                    dokter_penanggung_jawab_id: data.dokterPenanggungJawabId,
                    dokter_penanggung_jawab_nama: data.dokterPenanggungJawabNama,
                };
                endpoint = `/eklaim/radiologi/hasil/${kunjungan.NOMOR}/store`;
            }

            router.post(endpoint, dataToSend, {
                onSuccess: () => {
                    if (pendingSaveData) {
                        toast.success('Data radiologi fiktif berhasil disimpan');
                        setTindakanFiktif([]); // Reset tindakan fiktif setelah berhasil disimpan
                        setPendingSaveData(null);
                    } else {
                        toast.success('Data hasil radiologi berhasil disimpan');
                    }
                    setLoading(null);
                },
                onError: (errors: any) => {
                    console.error('Validation errors:', errors);
                    toast.error('Gagal menyimpan data. Periksa form dan coba lagi.');
                    setLoading(null);
                },
                onFinish: () => {
                    setLoading(null);
                },
            });
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error('Gagal menyimpan data');
            setLoading(null);
        }
    };

    const handleTambahHasilRadiologi = (data: TambahHasilRadiologiData) => {
        // Cari tindakan yang dipilih dari tindakan untuk mendapatkan data
        const selectedTindakan = tindakan?.find((t) => t.ID === data.tindakanId);

        if (selectedTindakan) {
            // Buat hasil radiologi baru
            const newHasilRadiologi: HasilRadiologi = {
                ID: Date.now(), // temporary ID
                TANGGAL: data.tanggal,
                KLINIS: data.klinis,
                KESAN: data.kesan,
                USUL: data.usul,
                HASIL: data.hasil,
                BTK: data.btk,
            };

            // Jika belum ada kunjunganData, buat yang baru dengan data pasien dari pengajuan
            const currentKunjunganData = kunjunganData || {
                id: kunjungan.id,
                NOMOR: kunjungan.NOMOR,
                NOPEN: kunjungan.NOPEN,
                RUANGAN: kunjungan.RUANGAN,
                tindakan_medis: [],
            };

            const updatedTindakanMedis = [...(currentKunjunganData.tindakan_medis || [])];

            // Cari tindakan yang sudah ada dengan nama yang sama
            let targetTindakan = updatedTindakanMedis.find((t) => t.nama_tindakan?.NAMA === data.namaTindakan);

            if (targetTindakan) {
                // Jika tindakan sudah ada, tambahkan hasil radiologi baru ke array yang sudah ada
                targetTindakan.hasil_radiologi.push(newHasilRadiologi);
                // Update tanggal tindakan jika perlu
                targetTindakan.TANGGAL = data.tanggal;
            } else {
                // Jika tindakan belum ada, buat tindakan baru
                const newTindakan = {
                    ID: data.tindakanId,
                    TANGGAL: data.tanggal,
                    nama_tindakan: {
                        NAMA: data.namaTindakan,
                    },
                    hasil_radiologi: [newHasilRadiologi],
                };
                updatedTindakanMedis.push(newTindakan);
            }

            const updatedKunjunganData = {
                ...currentKunjunganData,
                tindakan_medis: updatedTindakanMedis,
            };

            setKunjunganData(updatedKunjunganData);

            // Pastikan data pasien ter-set jika belum ada
            if (!pasienData) {
                setPasienData({
                    NAMA: pengajuan?.nama_pasien || '',
                    NORM: pengajuan?.norm || '',
                    TANGGAL_LAHIR: pengajuan?.tgl_lahir || '',
                    JENIS_KELAMIN: pengajuan?.gender ? parseInt(pengajuan.gender) : undefined,
                });
            }
        } else {
            toast.error('Tindakan tidak ditemukan');
            return;
        }

        setShowModalTambah(false);
        toast.success('Hasil radiologi berhasil ditambahkan');
    };

    const handleEditHasil = (hasilId: number, field: string, newValue: string) => {
        setEditingHasil(prev => ({
            ...prev,
            [hasilId]: {
                ...prev[hasilId],
                [field]: newValue,
            },
        }));

        // Update data di state
        if (kunjunganData && kunjunganData.tindakan_medis) {
            const updatedTindakanMedis = kunjunganData.tindakan_medis.map((tindakan) => ({
                ...tindakan,
                hasil_radiologi: tindakan.hasil_radiologi.map((hasil) => 
                    hasil.ID === hasilId 
                        ? { ...hasil, [field]: newValue }
                        : hasil
                )
            }));

            setKunjunganData({
                ...kunjunganData,
                tindakan_medis: updatedTindakanMedis
            });
        }
    };

    const handleRemoveTindakan = (namaTindakan: string) => {
        setTindakanToDelete(namaTindakan);
        setShowDeleteDialog(true);
    };

    const confirmRemoveTindakan = () => {
        if (!kunjunganData || !tindakanToDelete || !kunjunganData.tindakan_medis) return;

        const updatedTindakanMedis = kunjunganData.tindakan_medis.filter((tindakan) => tindakan.nama_tindakan?.NAMA !== tindakanToDelete);

        setKunjunganData({
            ...kunjunganData,
            tindakan_medis: updatedTindakanMedis,
        });

        // Bersihkan editingHasil yang terkait dengan tindakan yang dihapus
        const relatedHasilIds = kunjunganData.tindakan_medis
            ? kunjunganData.tindakan_medis
                .filter((t) => t.nama_tindakan?.NAMA === tindakanToDelete)
                .flatMap((t) => t.hasil_radiologi.map((h) => h.ID.toString()))
            : [];

        setEditingHasil(prev => {
            const updated = { ...prev };
            relatedHasilIds.forEach(id => delete updated[id]);
            return updated;
        });

        toast.success(`Tindakan "${tindakanToDelete}" berhasil dihapus`);

        // Reset state
        setShowDeleteDialog(false);
        setTindakanToDelete(null);
    };

    const cancelRemoveTindakan = () => {
        setShowDeleteDialog(false);
        setTindakanToDelete(null);
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

    function formatDateForInput(tanggal?: string) {
        if (!tanggal) return '';

        // Handle format: "2025-09-07T00:00:00.000000Z" atau "2025-09-07 10:37:35"
        if (tanggal.includes('T') || tanggal.includes(' ')) {
            return tanggal.split('T')[0].split(' ')[0];
        }

        return tanggal;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tagihan - ${pengajuan.nomor_sep}`} />
            <div className="max-w-7xl p-4">
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
                                    <h3 style={{ fontSize: 16 }}>HASIL RADIOLOGI</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section Hasil Radiologi dengan Action Buttons */}
                <div style={{ 
                    background: '#fff', 
                    border: '1px solid #000',
                    borderRadius: '0px',
                    margin: '0px 0',
                    borderTop: 'none'
                }}>
                    <div style={{ 
                        background: '#f8f9fa', 
                        color: 'black', 
                        padding: '8px 12px',
                        borderBottom: '1px solid #000',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        <span>HASIL RADIOLOGI</span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadDataHasilRadiologi} size="sm">
                                {loading === 'load' ? <Loader className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3 text-blue-500" />}
                                Load
                            </Button>
                            <Button variant="outline" onClick={() => setShowModalTambah(true)} size="sm">
                                <PlusCircle className="mr-1 h-3 w-3 text-green-500" />
                                Tambah
                            </Button>
                            <Button variant="outline" disabled={loading === 'simpan'} onClick={handleSimpanHasilRadiologi} size="sm">
                                {loading === 'simpan' ? <Loader className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3 text-blue-500" />}
                                Simpan
                            </Button>
                            <Button variant="outline" disabled={loading === 'hapus'} onClick={handleResetData} size="sm">
                                {loading === 'hapus' ? <Loader className="mr-1 h-3 w-3 animate-spin" /> : <Trash className="mr-1 h-3 w-3 text-red-500" />}
                                Hapus
                            </Button>
                        </div>
                    </div>

                    {/* Data Pasien */}
                    <div>
                        <table
                            style={{
                                fontFamily: 'halvetica, sans-serif',
                                width: '100%',
                                borderCollapse: 'collapse',
                                border: 'none',
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                        Nama Pasien : <br />
                                        <b>{pasienData?.NAMA || '-'}</b>
                                    </td>
                                    <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                        No. RM : <br />
                                        <b>{pasienData?.NORM || '-'}</b>
                                    </td>
                                    <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                        Tanggal Lahir : <br />
                                        <b>{formatTanggalIndo(pasienData?.TANGGAL_LAHIR)}</b>
                                    </td>
                                    <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                        Jenis Kelamin : <br />
                                        <b>{(() => {
                                            const jk = String(pasienData?.JENIS_KELAMIN || '').toLowerCase();
                                            if (jk === '1' || jk === 'l' || jk === 'laki-laki') return 'Laki-laki';
                                            if (jk === '2' || jk === 'p' || jk === 'perempuan') return 'Perempuan';
                                            return '-';
                                        })()}</b>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                {/* Hasil Radiologi Table */}
                <div>
                    <table
                        style={{
                            fontFamily: 'halvetica, sans-serif',
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #000',
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'center' }}>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Nama Tindakan</th>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Tanggal</th>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Klinis</th>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Kesan</th>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Usul</th>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Hasil</th>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>BTK</th>
                                <th style={{ border: '1px solid #000', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!kunjunganData ? (
                                <tr>
                                    <td colSpan={8} style={{ border: '1px solid #000', padding: '20px', textAlign: 'center', color: '#666' }}>
                                        Tidak ada data kunjungan. Silakan muat data kunjungan terlebih dahulu
                                    </td>
                                </tr>
                            ) : (kunjunganData.tindakan_medis && kunjunganData.tindakan_medis.length === 0) ? (
                                <tr>
                                    <td colSpan={8} style={{ border: '1px solid #000', padding: '20px', textAlign: 'center', color: '#666' }}>
                                        Belum ada hasil radiologi. Klik tombol "Tambah Hasil" untuk menambah hasil radiologi
                                    </td>
                                </tr>
                            ) : (
                                (kunjunganData.tindakan_medis || []).map((tindakan, tindakanIndex) =>
                                    tindakan.hasil_radiologi && tindakan.hasil_radiologi.length > 0 ? (
                                        tindakan.hasil_radiologi.map((hasil, hasilIndex) => (
                                            <tr key={`${tindakan.ID}-${hasil.ID}`}>
                                                {hasilIndex === 0 && (
                                                    <td
                                                        rowSpan={tindakan.hasil_radiologi.length}
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '5px',
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            background: '#f8f9fa',
                                                            verticalAlign: 'top',
                                                        }}
                                                    >
                                                        {tindakan.nama_tindakan?.NAMA || 'Tindakan Tidak Diketahui'}
                                                    </td>
                                                )}
                                                <td style={{ border: '1px solid #000', padding: '2px' }}>
                                                    <Input
                                                        type="date"
                                                        value={formatDateForInput(editingHasil[hasil.ID]?.TANGGAL || hasil.TANGGAL)}
                                                        onChange={(e) => handleEditHasil(hasil.ID, 'TANGGAL', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontSize: '11px',
                                                            padding: '2px',
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ border: '1px solid #000', padding: '2px' }}>
                                                    <Input
                                                        value={(editingHasil[hasil.ID]?.KLINIS || hasil.KLINIS) || ''}
                                                        onChange={(e) => handleEditHasil(hasil.ID, 'KLINIS', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontSize: '11px',
                                                            padding: '2px',
                                                        }}
                                                        placeholder="Masukkan klinis"
                                                    />
                                                </td>
                                                <td style={{ border: '1px solid #000', padding: '2px' }}>
                                                    <Input
                                                        value={(editingHasil[hasil.ID]?.KESAN || hasil.KESAN) || ''}
                                                        onChange={(e) => handleEditHasil(hasil.ID, 'KESAN', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontSize: '11px',
                                                            padding: '2px',
                                                        }}
                                                        placeholder="Masukkan kesan"
                                                    />
                                                </td>
                                                <td style={{ border: '1px solid #000', padding: '2px' }}>
                                                    <Input
                                                        value={(editingHasil[hasil.ID]?.USUL || hasil.USUL) || ''}
                                                        onChange={(e) => handleEditHasil(hasil.ID, 'USUL', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontSize: '11px',
                                                            padding: '2px',
                                                        }}
                                                        placeholder="Masukkan usul"
                                                    />
                                                </td>
                                                <td style={{ border: '1px solid #000', padding: '2px' }}>
                                                    <Input
                                                        value={(editingHasil[hasil.ID]?.HASIL || hasil.HASIL) || ''}
                                                        onChange={(e) => handleEditHasil(hasil.ID, 'HASIL', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontSize: '11px',
                                                            padding: '2px',
                                                        }}
                                                        placeholder="Masukkan hasil"
                                                    />
                                                </td>
                                                <td style={{ border: '1px solid #000', padding: '2px' }}>
                                                    <Input
                                                        value={(editingHasil[hasil.ID]?.BTK || hasil.BTK) || ''}
                                                        onChange={(e) => handleEditHasil(hasil.ID, 'BTK', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontSize: '11px',
                                                            padding: '2px',
                                                        }}
                                                        placeholder="Masukkan BTK"
                                                    />
                                                </td>
                                                {hasilIndex === 0 && (
                                                    <td
                                                        rowSpan={tindakan.hasil_radiologi.length}
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '5px',
                                                            textAlign: 'center',
                                                            verticalAlign: 'top',
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() => handleRemoveTindakan(tindakan.nama_tindakan?.NAMA || '')}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                            style={{ fontSize: '11px', padding: '2px' }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr key={tindakan.ID}>
                                            <td
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '5px',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    background: '#f8f9fa',
                                                }}
                                            >
                                                {tindakan.nama_tindakan?.NAMA || 'Tindakan Tidak Diketahui'}
                                            </td>
                                            <td
                                                colSpan={6}
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '5px',
                                                    textAlign: 'center',
                                                    color: '#666',
                                                    fontSize: '11px',
                                                }}
                                            >
                                                Belum ada hasil radiologi
                                            </td>
                                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>
                                                <Button
                                                    onClick={() => handleRemoveTindakan(tindakan.nama_tindakan?.NAMA || '')}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    style={{ fontSize: '11px', padding: '2px' }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>
                </div>

                {/* Data Fiktif Section */}
                <div style={{ 
                    background: '#fff', 
                    border: '2px solid #16a34a',
                    borderRadius: '8px',
                    margin: '20px 0',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 
                        color: 'white', 
                        padding: '12px 20px',
                        borderRadius: '6px 6px 0 0',
                        borderBottom: '1px solid #22c55e',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ 
                            margin: 0, 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Zap style={{ width: '16px', height: '16px' }} />
                            HASIL RADIOLOGI FIKTIF ({dataFiktif?.length || 0} data)
                        </h3>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setShowModalTambahFiktif(true)}
                                style={{
                                    backgroundColor: 'white',
                                    color: '#16a34a',
                                    border: 'none',
                                    padding: '4px 8px',
                                    fontSize: '12px'
                                }}
                            >
                                <PlusCircle style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                                Tambah Fiktif
                            </Button>
                        </div>
                    </div>
                    
                    {/* Legend untuk grup data fiktif */}
                    {dataFiktif && dataFiktif.length > 0 && (
                        <div style={{ 
                            padding: '10px 15px', 
                            backgroundColor: '#f0fdf4',
                            borderLeft: '1px solid #16a34a',
                            borderRight: '1px solid #16a34a',
                            fontSize: '11px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#15803d' }}>
                                Legenda Grup Data Fiktif:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {getGroupedFiktifData().map((group: any) => (
                                    <div key={group.groupIndex} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        border: '1px solid #d1d5db'
                                    }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: group.groupColor,
                                            borderRadius: '2px',
                                            border: '1px solid #16a34a'
                                        }}></div>
                                        <span>Data Fiktif #{group.groupIndex}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ border: '1px solid #16a34a', padding: '15px' }}>
                        {dataFiktif && dataFiktif.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    fontSize: '12px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f0fdf4' }}>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>Nama Tindakan</th>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>Tanggal</th>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>Klinis</th>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>Kesan</th>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>Usul</th>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>Hasil</th>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>BTK</th>
                                            <th style={{ 
                                                border: '1px solid #16a34a', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#15803d'
                                            }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getGroupedFiktifData().map((group: any, index: number) => (
                                            <tr 
                                                key={group.fiktifId}
                                                style={{ 
                                                    backgroundColor: group.groupColor,
                                                }}
                                            >
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    <div>
                                                        {group.namaTindakan || 'Tindakan Fiktif'}
                                                        <div style={{
                                                            fontSize: '10px',
                                                            color: '#15803d',
                                                            marginTop: '2px',
                                                            padding: '2px 6px',
                                                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                                            borderRadius: '4px',
                                                            display: 'inline-block'
                                                        }}>
                                                            Data Fiktif #{group.groupIndex}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px',
                                                    textAlign: 'center'
                                                }}>
                                                    {group.tanggalPemeriksaan ? 
                                                        formatTanggalIndo(group.tanggalPemeriksaan) : '-'}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px'
                                                }}>
                                                    {group.klinis}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px'
                                                }}>
                                                    {group.kesan}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px'
                                                }}>
                                                    {group.usul}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px'
                                                }}>
                                                    {group.hasilRadiologi}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px'
                                                }}>
                                                    {group.btk}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #16a34a', 
                                                    padding: '8px',
                                                    textAlign: 'center'
                                                }}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            if (confirm(`Yakin ingin menghapus Data Fiktif #${group.groupIndex}?`)) {
                                                                router.delete(route('eklaim.radiologi.fiktif.delete', {
                                                                    id: group.fiktifId
                                                                }), {
                                                                    onSuccess: () => toast.success(`Data Fiktif #${group.groupIndex} berhasil dihapus`)
                                                                });
                                                            }
                                                        }}
                                                        style={{ color: '#dc2626', padding: '4px' }}
                                                    >
                                                        <Trash style={{ width: '12px', height: '12px' }} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tindakan Fiktif yang Belum Disimpan */}
                {tindakanFiktif && tindakanFiktif.length > 0 && (
                    <div style={{ 
                        background: '#fff', 
                        border: '2px solid #f59e0b',
                        borderRadius: '8px',
                        margin: '20px 0',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                            color: 'white', 
                            padding: '12px 20px',
                            borderRadius: '6px 6px 0 0',
                            borderBottom: '1px solid #fbbf24',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ 
                                margin: 0, 
                                fontSize: '14px', 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <PlusCircle style={{ width: '16px', height: '16px' }} />
                                TINDAKAN RADIOLOGI FIKTIF BELUM DISIMPAN ({tindakanFiktif.length} item)
                            </h3>
                            <Button
                                onClick={() => handleSimpanTindakanFiktif()}
                                disabled={loading === 'simpan'}
                                size="sm"
                                style={{
                                    backgroundColor: 'white',
                                    color: '#f59e0b',
                                    border: 'none',
                                    padding: '4px 8px',
                                    fontSize: '12px'
                                }}
                            >
                                {loading === 'simpan' ? (
                                    <Loader className="mr-2 animate-spin" />
                                ) : (
                                    <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                )}
                                Simpan Semua
                            </Button>
                        </div>
                        
                        <div style={{ border: '1px solid #f59e0b', padding: '15px' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    fontSize: '12px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#fef3c7' }}>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>No</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>Nama Tindakan</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>Tanggal</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>Klinis</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>Kesan</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>Usul</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>Hasil</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>BTK</th>
                                            <th style={{ 
                                                border: '1px solid #f59e0b', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#92400e'
                                            }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tindakanFiktif.map((item, index) => (
                                            <tr key={item.id} style={{ backgroundColor: '#fffbeb' }}>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#92400e'
                                                }}>
                                                    {index + 1}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {item.namaTindakan}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px',
                                                    textAlign: 'center'
                                                }}>
                                                    {item.tanggal}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px'
                                                }}>
                                                    {item.klinis || '-'}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px'
                                                }}>
                                                    {item.kesan || '-'}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px'
                                                }}>
                                                    {item.usul || '-'}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px'
                                                }}>
                                                    {item.hasil || '-'}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px'
                                                }}>
                                                    {item.btk || '-'}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #f59e0b', 
                                                    padding: '8px',
                                                    textAlign: 'center'
                                                }}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setTindakanFiktif(prev => prev.filter(t => t.id !== item.id));
                                                            toast.success('Tindakan berhasil dihapus dari tabel');
                                                        }}
                                                        style={{ color: '#dc2626', padding: '4px' }}
                                                    >
                                                        <X style={{ width: '12px', height: '12px' }} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Tambah Hasil Radiologi */}
                <ModalTambahHasilRadiologi
                    isOpen={showModalTambah}
                    onClose={() => setShowModalTambah(false)}
                    onSubmit={handleTambahHasilRadiologi}
                    tindakan={tindakan || []}
                />

                {/* Modal Tambah Radiologi Fiktif */}
                <ModalTambahRadiologiFiktif
                    open={showModalTambahFiktif}
                    onClose={() => setShowModalTambahFiktif(false)}
                    tindakanList={tindakan || []}
                    pengajuanId={pengajuan.id}
                    onSubmit={handleTambahTindakanFiktif}
                />

                {/* Modal Petugas dan Dokter */}
                <ModalPetugasDokter
                    open={showModalPetugasDokter}
                    onClose={() => setShowModalPetugasDokter(false)}
                    onSubmit={handleSubmitPetugasDokter}
                    pegawaiList={pegawaiList || []}
                    dokterList={dokterList || []}
                />

                {/* Dialog Konfirmasi Hapus */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus tindakan "{tindakanToDelete}"? Semua hasil radiologi yang terkait akan ikut
                                terhapus. Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelRemoveTindakan}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRemoveTindakan} className="bg-red-500 hover:bg-red-600">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
