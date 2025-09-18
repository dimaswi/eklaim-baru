import ModalTambahHasilLab from '@/components/eklaim/modal-tambah-hasil-lab';
import ModalTambahLabFiktif from '@/components/eklaim/modal-tambah-lab-fiktif';
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
import { Download, Loader, Plus, Save, TestTube, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useFlashMessages } from '@/hooks/use-flash-messages';

interface HasilLaboratorium {
    ID: number;
    PARAMETER: string;
    HASIL: string;
    SATUAN: string;
    NILAI_RUJUKAN?: string;
    parameter_tindakan_lab: {
        PARAMETER: string;
        NILAI_RUJUKAN?: string;
    };
}

interface TindakanMedis {
    ID: number;
    TANGGAL: string;
    nama_tindakan: {
        NAMA: string;
    };
    hasil_laboratorium: HasilLaboratorium[];
}

interface Tindakan {
    ID: number;
    NAMA: string;
    parameter_tindakan_lab?:
        | {
              PARAMETER: string;
              SATUAN: string;
              NILAI_RUJUKAN?: string;
              satuan?: {
                  DESKRIPSI: string;
              };
          }[]
        | null;
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
    pegawaiList: Pegawai[];
    dokterList: Dokter[];
}

interface TambahHasilLabData {
    tindakanId: number;
    namaTindakan: string;
    tanggal: string;
}

export default function HasilLaboratoriumPage() {
    const { pengajuan, kunjungan, kop, tindakan, savedData, dataFiktif, pegawaiList, dokterList } = usePage<Props>().props;
    
    // Use flash messages hook untuk menangani pesan dari backend
    useFlashMessages();
    
    // Debug log untuk melihat struktur dataFiktif
    useEffect(() => {
        console.log('dataFiktif:', dataFiktif);
        console.log('dataFiktif length:', dataFiktif?.length);
    }, [dataFiktif]);
    
    const [loading, setLoading] = useState<'load' | 'simpan' | 'hapus' | null>(null);
    const [kunjunganData, setKunjunganData] = useState<Kunjungan | null>(null);
    const [pasienData, setPasienData] = useState<any>(null);
    const [showModalTambah, setShowModalTambah] = useState(false);
    const [showModalTambahFiktif, setShowModalTambahFiktif] = useState(false);
    const [editingHasil, setEditingHasil] = useState<{ [key: string]: string }>({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tindakanToDelete, setTindakanToDelete] = useState<string | null>(null);
    const [tindakanFiktif, setTindakanFiktif] = useState<any[]>([]);
    const [showModalPetugasDokter, setShowModalPetugasDokter] = useState(false);
    const [petugasDokterData, setPetugasDokterData] = useState<{
        petugasMedisId: string;
        petugasMedisNama: string;
        dokterPenanggungJawabId: string;
        dokterPenanggungJawabNama: string;
    }>({
        petugasMedisId: '',
        petugasMedisNama: '',
        dokterPenanggungJawabId: '',
        dokterPenanggungJawabNama: '',
    });
    const [pendingSaveData, setPendingSaveData] = useState<any>(null);

    // Handler untuk menambah tindakan fiktif dari modal ke tabel
    const handleTambahTindakanFiktif = (data: any) => {
        const newTindakan = {
            id: `fiktif_${Date.now()}`,
            tindakanId: data.tindakanId,
            namaTindakan: data.namaTindakan,
            tanggal: data.tanggal,
            parameters: data.parameters,
            is_fiktif: true,
        };

        setTindakanFiktif((prev) => [...prev, newTindakan]);
    };

    // Handler untuk menyimpan tindakan fiktif ke database
    const handleSimpanTindakanFiktif = async () => {
        if (!tindakanFiktif || tindakanFiktif.length === 0) {
            toast.error('Tidak ada tindakan fiktif untuk disimpan');
            return;
        }

        // Simpan data fiktif yang akan disimpan
        setPendingSaveData({
            pengajuan_klaim_id: pengajuan.id,
            hasil_laboratorium: tindakanFiktif,
            tanggal_pemeriksaan: tindakanFiktif[0]?.tanggal || new Date().toISOString().split('T')[0],
        });

        // Tampilkan modal untuk memilih petugas dan dokter
        setShowModalPetugasDokter(true);
    };

    // Load savedData saat komponen pertama kali dimuat
    useEffect(() => {
        if (savedData) {
            // Konversi savedData ke format yang sesuai untuk ditampilkan
            const tindakanMedisData = savedData.tindakan_medis_data?.hasil_laboratorium || [];

            if (tindakanMedisData.length > 0) {
                setKunjunganData({
                    ...kunjungan,
                    tindakan_medis: tindakanMedisData,
                } as any);

                // Set editing hasil dari savedData
                const editingData: { [key: string]: string } = {};
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
            title: `Hasil Laboratorium ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

    const handleLoadDataHasilLaboratorium = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/laboratorium/hasil/${kunjungan.NOMOR}`);
            const data = await response.json();

            // Set kunjungan data secara manual
            setKunjunganData({
                id: data.kunjungan?.id || 0,
                NOMOR: data.kunjungan?.NOMOR || '',
                NOPEN: data.kunjungan?.NOPEN || '',
                RUANGAN: data.kunjungan?.RUANGAN || '',
                tindakan_medis: data.kunjungan?.tindakan_medis || [],
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

    const handleSimpanHasilLaboratorium = async () => {
        if (!kunjunganData || !pasienData) {
            toast.error('Tidak ada data untuk disimpan');
            return;
        }

        // Load existing petugas dokter data from savedData if available
        if (savedData?.tindakan_medis_data) {
            setPetugasDokterData({
                petugasMedisId: savedData.tindakan_medis_data.petugas_medis_id || '',
                petugasMedisNama: savedData.tindakan_medis_data.petugas_medis_nama || '',
                dokterPenanggungJawabId: savedData.tindakan_medis_data.dokter_penanggung_jawab_id || '',
                dokterPenanggungJawabNama: savedData.tindakan_medis_data.dokter_penanggung_jawab_nama || '',
            });
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
                endpoint = route('eklaim.laboratorium.fiktif.store');
            } else {
                // Data normal
                dataToSend = {
                    pengajuan_klaim_id: pengajuan.id,
                    kunjungan_nomor: kunjungan.NOMOR,
                    hasil_laboratorium:
                        kunjunganData?.tindakan_medis?.map((tm) => ({
                            ...tm,
                            hasil_edited: editingHasil[tm.ID] || tm.hasil_laboratorium?.[0]?.HASIL || '',
                        })) || [],
                    tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
                    petugas_medis_id: data.petugasMedisId,
                    petugas_medis_nama: data.petugasMedisNama,
                    dokter_penanggung_jawab_id: data.dokterPenanggungJawabId,
                    dokter_penanggung_jawab_nama: data.dokterPenanggungJawabNama,
                };
                endpoint = `/eklaim/laboratorium/hasil/${kunjungan.NOMOR}/store`;
            }

            router.post(endpoint, dataToSend, {
                onSuccess: () => {
                    if (pendingSaveData) {
                        toast.success('Data laboratorium fiktif berhasil disimpan');
                        setTindakanFiktif([]); // Reset tindakan fiktif setelah berhasil disimpan
                        setPendingSaveData(null);
                    } else {
                        toast.success('Data hasil laboratorium berhasil disimpan');
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

    const handleTambahHasilLab = (data: TambahHasilLabData) => {
        // Cari tindakan yang dipilih dari tindakan untuk mendapatkan parameter
        const selectedTindakan = tindakan?.find((t) => t.ID === data.tindakanId);

        if (selectedTindakan && selectedTindakan.parameter_tindakan_lab) {
            // Buat hasil lab kosong untuk setiap parameter
            const newHasilLabArray = selectedTindakan.parameter_tindakan_lab.map((param, index) => ({
                ID: Date.now() + index, // temporary ID
                PARAMETER: param.PARAMETER,
                HASIL: '', // kosong untuk diisi di tabel
                SATUAN: param.satuan?.DESKRIPSI || param.SATUAN || '-', // Gunakan nama satuan dari relasi, fallback ke ID
                NILAI_RUJUKAN: param.NILAI_RUJUKAN || '',
                parameter_tindakan_lab: {
                    PARAMETER: param.PARAMETER,
                    NILAI_RUJUKAN: param.NILAI_RUJUKAN || '',
                },
            }));

            // Jika belum ada kunjunganData, buat yang baru
            const currentKunjunganData = kunjunganData || {
                id: 0,
                NOMOR: '',
                NOPEN: '',
                RUANGAN: '',
                tindakan_medis: [],
            };

            const updatedTindakanMedis = [...currentKunjunganData.tindakan_medis];

            // Cari atau buat tindakan baru
            let targetTindakan = updatedTindakanMedis.find((t) => t.nama_tindakan?.NAMA === data.namaTindakan);

            if (targetTindakan) {
                // Tambahkan parameter baru jika belum ada
                newHasilLabArray.forEach((newHasil) => {
                    const existingParam = targetTindakan!.hasil_laboratorium.find((h) => h.PARAMETER === newHasil.PARAMETER);
                    if (!existingParam) {
                        targetTindakan!.hasil_laboratorium.push(newHasil);
                    }
                });
                targetTindakan.TANGGAL = data.tanggal;
            } else {
                // Buat tindakan baru
                const newTindakan = {
                    ID: data.tindakanId,
                    TANGGAL: data.tanggal,
                    nama_tindakan: {
                        NAMA: data.namaTindakan,
                    },
                    hasil_laboratorium: newHasilLabArray,
                };
                updatedTindakanMedis.push(newTindakan);
            }

            const updatedKunjunganData = {
                ...currentKunjunganData,
                tindakan_medis: updatedTindakanMedis,
            };

            setKunjunganData(updatedKunjunganData);
        } else {
            toast.error('Tindakan tidak ditemukan atau tidak memiliki parameter');
            return;
        }

        setShowModalTambah(false);
        toast.success('Tindakan laboratorium berhasil ditambahkan');
    };

    const handleEditHasil = (hasilId: number, newValue: string) => {
        setEditingHasil((prev) => ({
            ...prev,
            [hasilId]: newValue,
        }));

        // Update data di state
        if (kunjunganData) {
            const updatedTindakanMedis = kunjunganData.tindakan_medis.map((tindakan) => ({
                ...tindakan,
                hasil_laboratorium: tindakan.hasil_laboratorium.map((hasil) => (hasil.ID === hasilId ? { ...hasil, HASIL: newValue } : hasil)),
            }));

            setKunjunganData({
                ...kunjunganData,
                tindakan_medis: updatedTindakanMedis,
            });
        }
    };

    const handleRemoveTindakan = (namaTindakan: string) => {
        setTindakanToDelete(namaTindakan);
        setShowDeleteDialog(true);
    };

    const confirmRemoveTindakan = () => {
        if (!kunjunganData || !tindakanToDelete) return;

        const updatedTindakanMedis = kunjunganData.tindakan_medis.filter((tindakan) => tindakan.nama_tindakan?.NAMA !== tindakanToDelete);

        setKunjunganData({
            ...kunjunganData,
            tindakan_medis: updatedTindakanMedis,
        });

        // Bersihkan editingHasil yang terkait dengan tindakan yang dihapus
        const relatedHasilIds = kunjunganData.tindakan_medis
            .filter((t) => t.nama_tindakan?.NAMA === tindakanToDelete)
            .flatMap((t) => t.hasil_laboratorium.map((h) => h.ID.toString()));

        setEditingHasil((prev) => {
            const updated = { ...prev };
            relatedHasilIds.forEach((id) => delete updated[id]);
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

    // Fungsi untuk mengelompokkan data fiktif berdasarkan ID dan nama tindakan
    const getGroupedFiktifData = () => {
        if (!dataFiktif || dataFiktif.length === 0) {
            return [];
        }

        const grouped: { [key: string]: { 
            namaTindakan: string; 
            tanggalTindakan: string; 
            hasilLab: any[];
            fiktifId: number;
            groupColor: string;
            groupIndex: number;
        } } = {};

        // Warna untuk setiap grup data fiktif
        const colors = [
            '#e3f2fd', // Light Blue
            '#f3e5f5', // Light Purple
            '#e8f5e8', // Light Green
            '#fff3e0', // Light Orange
            '#fce4ec', // Light Pink
            '#f1f8e9', // Light Lime
            '#e0f2f1', // Light Teal
            '#fff8e1', // Light Yellow
        ];

        dataFiktif.forEach((item: any, dataIndex: number) => {
            const fiktifId = item.id;
            const groupColor = colors[dataIndex % colors.length];
            
            item.tindakan_medis_data?.hasil_laboratorium?.forEach((tindakan: any) => {
                const namaTindakan = tindakan.namaTindakan || 'Tindakan Tidak Diketahui';
                const tanggalTindakan = tindakan.tanggal || item.tindakan_medis_data?.tanggal_pemeriksaan || '';
                const groupKey = `${fiktifId}_${namaTindakan}`;

                if (!grouped[groupKey]) {
                    grouped[groupKey] = {
                        namaTindakan,
                        tanggalTindakan,
                        hasilLab: [],
                        fiktifId,
                        groupColor,
                        groupIndex: dataIndex + 1,
                    };
                }

                // Convert parameters to hasil lab format
                if (tindakan.parameters) {
                    tindakan.parameters.forEach((param: any) => {
                        grouped[groupKey].hasilLab.push({
                            ID: `fiktif_${fiktifId}_${Date.now()}_${Math.random()}`,
                            PARAMETER: param.PARAMETER,
                            HASIL: param.HASIL || '',
                            SATUAN: param.SATUAN,
                            NILAI_RUJUKAN: param.NILAI_RUJUKAN || '',
                            parameter_tindakan_lab: {
                                PARAMETER: param.PARAMETER,
                                NILAI_RUJUKAN: param.NILAI_RUJUKAN || '',
                            },
                            fiktifId,
                        });
                    });
                }
            });
        });

        return Object.values(grouped);
    };

    // Fungsi untuk mengelompokkan data laboratorium berdasarkan nama tindakan
    const getGroupedLabData = () => {
        if (!kunjunganData?.tindakan_medis) {
            return [];
        }

        const grouped: { [key: string]: { namaTindakan: string; tanggalTindakan: string; hasilLab: HasilLaboratorium[] } } = {};

        kunjunganData.tindakan_medis.forEach((tindakan) => {
            if (tindakan.hasil_laboratorium && tindakan.hasil_laboratorium.length > 0) {
                const namaTindakan = tindakan.nama_tindakan?.NAMA || 'Tindakan Tidak Diketahui';
                const tanggalTindakan = tindakan.TANGGAL || '';

                if (!grouped[namaTindakan]) {
                    grouped[namaTindakan] = {
                        namaTindakan,
                        tanggalTindakan,
                        hasilLab: [],
                    };
                }

                grouped[namaTindakan].hasilLab.push(...tindakan.hasil_laboratorium);
            }
        });

        return Object.values(grouped);
    };

    // Fungsi untuk format tanggal
    const formatTanggal = (tanggal: string) => {
        if (!tanggal) return '-';

        try {
            const date = new Date(tanggal);
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            };
            return date.toLocaleDateString('id-ID', options).replace(',', ' ');
        } catch (error) {
            return tanggal; // Return original if formatting fails
        }
    };

    const groupedLabData = getGroupedLabData();
    const groupedFiktifData = getGroupedFiktifData();

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
                                    <h3 style={{ fontSize: 16 }}>HASIL LABORATORIUM</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* DATA PASIEN */}
                <div>
                    <table
                        style={{
                            fontFamily: 'halvetica, sans-serif',
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #000',
                            marginTop: '5px',
                        }}
                    >
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Nama Pasien : <br />
                                    <b>{pasienData?.NAMA || '-'}</b>
                                </td>
                                <td style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    No. RM : <br />
                                    <b>{pasienData?.NORM || '-'}</b>
                                </td>
                                <td style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Tanggal Lahir : <br />
                                    <b>{formatTanggalIndo(pasienData?.TANGGAL_LAHIR) || '-'}</b>
                                </td>
                                <td style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Jenis Kelamin : <br />
                                    <b>{pasienData?.JENIS_KELAMIN === 1 ? 'Laki-laki' : pasienData?.JENIS_KELAMIN === 2 ? 'Perempuan' : '-'}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* HASIL LABORATORIUM */}
                <div
                    style={{
                        fontFamily: 'halvetica, sans-serif',
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid #000',
                        marginTop: '10px',
                    }}
                >
                    <div
                        style={{
                            background: '#f8f9fa',
                            border: '1px solid #000',
                            padding: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>HASIL LABORATORIUM</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadDataHasilLaboratorium}>
                                {loading === 'load' ? <Loader className="mr-2 animate-spin" /> : <Download className="mr-2 text-blue-500" />}
                                Load
                            </Button>
                            <Button variant="outline" onClick={() => setShowModalTambah(true)}>
                                <Plus className="mr-2 text-green-500" />
                                Tambah
                            </Button>
                            <Button variant="outline" disabled={loading === 'simpan'} onClick={handleSimpanHasilLaboratorium}>
                                {loading === 'simpan' ? <Loader className="mr-2 animate-spin" /> : <Save className="mr-2 text-blue-500" />}
                                Simpan
                            </Button>
                            <Button variant="outline" disabled={loading === 'hapus'} onClick={handleResetData}>
                                {loading === 'hapus' ? <Loader className="mr-2 animate-spin" /> : <Trash className="mr-2 text-red-500" />}
                                Hapus
                            </Button>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #000', padding: '15px' }}>
                        {groupedLabData.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '12px',
                                    }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '13%',
                                                }}
                                            >
                                                Nama Tindakan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '10%',
                                                }}
                                            >
                                                Tanggal
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '18%',
                                                }}
                                            >
                                                Parameter
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '13%',
                                                }}
                                            >
                                                Hasil
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '16%',
                                                }}
                                            >
                                                Nilai Rujukan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '15%',
                                                }}
                                            >
                                                Satuan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '15%',
                                                }}
                                            >
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedLabData.map((group, groupIndex) =>
                                            group.hasilLab.map((hasil, hasilIndex) => (
                                                <tr key={`${groupIndex}-${hasilIndex}`}>
                                                    <td
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '6px',
                                                            verticalAlign: 'top',
                                                        }}
                                                    >
                                                        {hasilIndex === 0 ? (
                                                            <b>{group.namaTindakan}</b>
                                                        ) : (
                                                            // Row kosong untuk parameter selanjutnya dari tindakan yang sama
                                                            ''
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '6px',
                                                            verticalAlign: 'top',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {hasilIndex === 0 ? (
                                                            <b>{formatTanggal(group.tanggalTindakan)}</b>
                                                        ) : (
                                                            // Row kosong untuk parameter selanjutnya dari tindakan yang sama
                                                            ''
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '6px',
                                                        }}
                                                    >
                                                        {hasil.parameter_tindakan_lab?.PARAMETER || hasil.PARAMETER || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Input
                                                            value={editingHasil[hasil.ID] !== undefined ? editingHasil[hasil.ID] : hasil.HASIL || ''}
                                                            onChange={(e) => handleEditHasil(hasil.ID, e.target.value)}
                                                            className="border-none bg-transparent p-0 text-center text-sm font-bold focus:border-none focus:ring-0"
                                                            style={{
                                                                boxShadow: 'none',
                                                                border: 'none',
                                                                outline: 'none',
                                                            }}
                                                        />
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {hasil.parameter_tindakan_lab?.NILAI_RUJUKAN || hasil.NILAI_RUJUKAN || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {hasil.SATUAN || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #000',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {hasilIndex === 0 ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemoveTindakan(group.namaTindakan)}
                                                                className="h-7 w-7 p-0 hover:border-red-300 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        ) : (
                                                            // Row kosong untuk parameter selanjutnya dari tindakan yang sama
                                                            ''
                                                        )}
                                                    </td>
                                                </tr>
                                            )),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    fontStyle: 'italic',
                                    color: '#6c757d',
                                }}
                            >
                                {kunjunganData ? 'Tidak ada data hasil laboratorium' : 'Klik tombol Load untuk memuat data hasil laboratorium'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Fiktif Section */}
                <div
                    style={{
                        background: '#fff',
                        border: '2px solid #3b82f6',
                        borderRadius: '8px',
                        margin: '20px 0',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '6px 6px 0 0',
                            borderBottom: '1px solid #2563eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontSize: '14px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <TestTube style={{ width: '16px', height: '16px' }} />
                            HASIL LABORATORIUM FIKTIF ({dataFiktif?.length || 0} data)
                        </h3>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setShowModalTambahFiktif(true)}
                                style={{
                                    backgroundColor: 'white',
                                    color: '#3b82f6',
                                    border: 'none',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                }}
                            >
                                <Plus style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                                Tambah Lab Fiktif
                            </Button>
                            <Button
                                onClick={() => handleSimpanTindakanFiktif()}
                                disabled={loading === 'simpan'}
                                style={{
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                }}
                            >
                                {loading === 'simpan' ? (
                                    <Loader className="mr-2 animate-spin" />
                                ) : (
                                    <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                )}
                                Simpan Semua Tindakan
                            </Button>
                        </div>
                    </div>

                    {/* Legend untuk grup data fiktif */}
                    {groupedFiktifData && groupedFiktifData.length > 0 && (
                        <div style={{ 
                            padding: '10px 15px', 
                            backgroundColor: '#f8fafc',
                            borderLeft: '1px solid #3b82f6',
                            borderRight: '1px solid #3b82f6',
                            fontSize: '11px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                                Legenda Grup Data Fiktif:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {Array.from(new Set(groupedFiktifData.map(g => g.groupIndex))).map(groupIndex => {
                                    const group = groupedFiktifData.find(g => g.groupIndex === groupIndex);
                                    return (
                                        <div key={groupIndex} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: group?.groupColor,
                                                borderRadius: '2px',
                                                border: '1px solid #d1d5db'
                                            }}></div>
                                            <span>Data Fiktif #{groupIndex}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ border: '1px solid #3b82f6', padding: '15px' }}>
                        {groupedFiktifData && groupedFiktifData.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '12px',
                                    }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: '#eff6ff' }}>
                                            <th
                                                style={{
                                                    border: '1px solid #3b82f6',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#1d4ed8',
                                                    width: '13%',
                                                }}
                                            >
                                                Nama Tindakan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #3b82f6',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#1d4ed8',
                                                    width: '10%',
                                                }}
                                            >
                                                Tanggal
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #3b82f6',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#1d4ed8',
                                                    width: '18%',
                                                }}
                                            >
                                                Parameter
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #3b82f6',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#1d4ed8',
                                                    width: '13%',
                                                }}
                                            >
                                                Hasil
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #3b82f6',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#1d4ed8',
                                                    width: '16%',
                                                }}
                                            >
                                                Nilai Rujukan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #3b82f6',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#1d4ed8',
                                                    width: '15%',
                                                }}
                                            >
                                                Satuan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #3b82f6',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#1d4ed8',
                                                    width: '15%',
                                                }}
                                            >
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedFiktifData.map((group, groupIndex) =>
                                            group.hasilLab.map((hasil, hasilIndex) => (
                                                <tr 
                                                    key={`fiktif-${groupIndex}-${hasilIndex}`}
                                                    style={{
                                                        backgroundColor: group.groupColor,
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            border: '1px solid #3b82f6',
                                                            padding: '6px',
                                                            verticalAlign: 'top',
                                                        }}
                                                    >
                                                        {hasilIndex === 0 ? (
                                                            <div>
                                                                <b>{group.namaTindakan}</b>
                                                                <div style={{
                                                                    fontSize: '10px',
                                                                    color: '#666',
                                                                    marginTop: '2px',
                                                                    padding: '2px 6px',
                                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                                    borderRadius: '4px',
                                                                    display: 'inline-block'
                                                                }}>
                                                                    Data Fiktif #{group.groupIndex}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #3b82f6',
                                                            padding: '6px',
                                                            verticalAlign: 'top',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {hasilIndex === 0 ? (
                                                            <b>{formatTanggal(group.tanggalTindakan)}</b>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #3b82f6',
                                                            padding: '6px',
                                                        }}
                                                    >
                                                        {hasil.parameter_tindakan_lab?.PARAMETER || hasil.PARAMETER || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #3b82f6',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {hasil.HASIL || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #3b82f6',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {hasil.parameter_tindakan_lab?.NILAI_RUJUKAN || hasil.NILAI_RUJUKAN || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #3b82f6',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {hasil.SATUAN || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #3b82f6',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {hasilIndex === 0 ? (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    if (confirm(`Yakin ingin menghapus Data Fiktif #${group.groupIndex} - ${group.namaTindakan}?`)) {
                                                                        router.delete(
                                                                            route('eklaim.laboratorium.fiktif.delete', {
                                                                                id: group.fiktifId,
                                                                            }),
                                                                            {
                                                                                onSuccess: () => toast.success(`Data Fiktif #${group.groupIndex} berhasil dihapus`),
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                                style={{ color: '#dc2626', padding: '4px' }}
                                                            >
                                                                <Trash style={{ width: '12px', height: '12px' }} />
                                                            </Button>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </td>
                                                </tr>
                                            )),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                Belum ada data laboratorium fiktif
                            </div>
                        )}
                    </div>

                    {/* Tabel untuk tindakan fiktif yang baru ditambahkan */}
                    {tindakanFiktif && tindakanFiktif.length > 0 && (
                        <div style={{ border: '1px solid #10b981', padding: '15px', marginTop: '15px' }}>
                            <h4
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#059669',
                                    marginBottom: '10px',
                                }}
                            >
                                Tindakan Laboratorium Baru Ditambahkan ({tindakanFiktif.length} tindakan)
                            </h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '12px',
                                    }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: '#ecfdf5' }}>
                                            <th
                                                style={{
                                                    border: '1px solid #10b981',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    width: '13%',
                                                }}
                                            >
                                                Nama Tindakan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #10b981',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    width: '10%',
                                                }}
                                            >
                                                Tanggal
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #10b981',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    width: '18%',
                                                }}
                                            >
                                                Parameter
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #10b981',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    width: '13%',
                                                }}
                                            >
                                                Hasil
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #10b981',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    width: '16%',
                                                }}
                                            >
                                                Nilai Rujukan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #10b981',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    width: '15%',
                                                }}
                                            >
                                                Satuan
                                            </th>
                                            <th
                                                style={{
                                                    border: '1px solid #10b981',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    width: '15%',
                                                }}
                                            >
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tindakanFiktif.map((tindakan, tindakanIndex) =>
                                            tindakan.parameters.map((param: any, paramIndex: number) => (
                                                <tr
                                                    key={`${tindakan.id}-${paramIndex}`}
                                                    style={{ backgroundColor: tindakanIndex % 2 === 0 ? '#f0fdf4' : '#ffffff' }}
                                                >
                                                    <td
                                                        style={{
                                                            border: '1px solid #10b981',
                                                            padding: '6px',
                                                            verticalAlign: 'top',
                                                        }}
                                                    >
                                                        {paramIndex === 0 ? (
                                                            <b>{tindakan.namaTindakan}</b>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #10b981',
                                                            padding: '6px',
                                                            verticalAlign: 'top',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {paramIndex === 0 ? (
                                                            <b>{formatTanggal(tindakan.tanggal)}</b>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #10b981',
                                                            padding: '6px',
                                                        }}
                                                    >
                                                        {param.PARAMETER}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #10b981',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Input
                                                            value={param.HASIL}
                                                            onChange={(e) => {
                                                                const newTindakanFiktif = [...tindakanFiktif];
                                                                newTindakanFiktif[tindakanIndex].parameters[paramIndex].HASIL = e.target.value;
                                                                setTindakanFiktif(newTindakanFiktif);
                                                            }}
                                                            placeholder="Masukkan hasil..."
                                                            className="border-none bg-transparent p-0 text-center text-sm font-bold focus:border-none focus:ring-0"
                                                            style={{
                                                                boxShadow: 'none',
                                                                border: 'none',
                                                                outline: 'none',
                                                                fontSize: '12px',
                                                            }}
                                                        />
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #10b981',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {param.NILAI_RUJUKAN || '-'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #10b981',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {param.SATUAN || '-'}
                                                        {
                                                            console.log('param satuan', param)
                                                        }
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: '1px solid #10b981',
                                                            padding: '6px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {paramIndex === 0 ? (
                                                            <Button
                                                                onClick={() => {
                                                                    const newTindakanFiktif = tindakanFiktif.filter((t) => t.id !== tindakan.id);
                                                                    setTindakanFiktif(newTindakanFiktif);
                                                                }}
                                                                variant="ghost"
                                                                size="sm"
                                                                style={{ color: '#dc2626', padding: '4px' }}
                                                            >
                                                                <Trash style={{ width: '12px', height: '12px' }} />
                                                            </Button>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </td>
                                                </tr>
                                            )),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Tambah Hasil Lab */}
                <ModalTambahHasilLab
                    open={showModalTambah}
                    onClose={() => setShowModalTambah(false)}
                    onSubmit={handleTambahHasilLab}
                    tindakanList={tindakan || []}
                />

                {/* Modal Tambah Lab Fiktif */}
                <ModalTambahLabFiktif
                    open={showModalTambahFiktif}
                    onClose={() => setShowModalTambahFiktif(false)}
                    onSubmit={handleTambahTindakanFiktif}
                    tindakanList={tindakan || []}
                />

                {/* Modal Petugas dan Dokter */}
                <ModalPetugasDokter
                    open={showModalPetugasDokter}
                    onClose={() => setShowModalPetugasDokter(false)}
                    onSubmit={handleSubmitPetugasDokter}
                    pegawaiList={pegawaiList || []}
                    dokterList={dokterList || []}
                />

                {/* Alert Dialog untuk konfirmasi hapus tindakan */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <X className="h-5 w-5 text-red-500" />
                                Hapus Tindakan Laboratorium
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2 text-left">
                                <p>
                                    Apakah Anda yakin ingin menghapus tindakan <strong>"{tindakanToDelete}"</strong>?
                                </p>
                                <div className="rounded border-l-4 border-red-400 bg-red-50 p-3">
                                    <p className="text-sm text-red-700">
                                        ⚠️ <strong>Peringatan:</strong> Semua parameter dan hasil laboratorium untuk tindakan ini akan ikut terhapus
                                        secara permanen.
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelRemoveTindakan}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRemoveTindakan} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                                Ya, Hapus Tindakan
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
