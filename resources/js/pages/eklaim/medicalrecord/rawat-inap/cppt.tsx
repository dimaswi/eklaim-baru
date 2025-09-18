import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { set } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Download, Loader, Save, Trash, Plus, Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TambahCPPTModal from '@/components/eklaim/tambah-cppt-modal';

interface CPPTItem {
    id?: number;
    tanggal: string;
    profesi: string;
    subyektif: string;
    obyektif: string;
    assesment: string;
    planning: string;
    instruksi: string;
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

export default function CPPTPage() {
    const { pengajuan, kunjungan, kop, petugas, savedData } = usePage<Props>().props;
    const [loading, setLoading] = useState<'load' | 'simpan' | 'hapus' | null>(null);
    const [cpptData, setCpptData] = useState<CPPTItem[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRowData, setNewRowData] = useState<CPPTItem>({
        tanggal: new Date().toISOString().split('T')[0],
        profesi: '',
        subyektif: '',
        obyektif: '',
        assesment: '',
        planning: '',
        instruksi: '',
        nama_petugas: ''
    });

    // Load savedData saat komponen pertama kali dimuat
    useEffect(() => {
        if (savedData && savedData.cppt_data) {
            const savedCpptData = savedData.cppt_data.cppt || [];
            if (Array.isArray(savedCpptData) && savedCpptData.length > 0) {
                setCpptData(savedCpptData);
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
            title: `CPPT ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

    const handleLoadCPPT = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/rawat-inap/cppt/${kunjungan.NOMOR}`);
            const data = await response.json();
            
            // Set data CPPT yang dimuat dari API dengan mapping manual
            if (data.kunjungan && data.kunjungan.cppt && Array.isArray(data.kunjungan.cppt)) {
                const cpptMapped = data.kunjungan.cppt.map((item: any) => ({
                    id: item.id || null,
                    tanggal: item.TANGGAL || item.tanggal || '',
                    profesi: stripHtmlTags(item.oleh.pegawai.profesi.DESKRIPSI || item.profesi || ''),
                    subyektif: stripHtmlTags(item.SUBYEKTIF || item.subyektif || ''),
                    obyektif: stripHtmlTags(item.OBYEKTIF || item.obyektif || ''),
                    assesment: stripHtmlTags(item.ASSESMENT || item.assesment || ''),
                    planning: stripHtmlTags(item.PLANNING || item.planning || ''),
                    instruksi: stripHtmlTags(item.INSTRUKSI || item.instruksi || ''),
                    nama_petugas: stripHtmlTags(item.oleh.NAMA || item.nama_petugas || '')
                }));
                setCpptData(cpptMapped);
            }
            
            toast.success('Data CPPT berhasil dimuat');
        } catch (error) {
            setLoading(null);
            toast.error('Gagal memuat data CPPT');
        } finally {
            setLoading(null);
        }
    };

    const handleResetData = () => {
        setCpptData([]);
        toast.success('Data CPPT berhasil direset');
    }

    const handleSimpanCPPT = async () => {
        setLoading('simpan');
        
        if (cpptData.length === 0) {
            toast.error('Tidak ada data CPPT untuk disimpan');
            setLoading(null);
            return;
        }

        try {
            const dataToSend = {
                pengajuan_klaim_id: pengajuan.id,
                kunjungan_nomor: kunjungan.NOMOR,
                cppt_data: cpptData,
            } as any;

            router.post(`/eklaim/rawat-inap/cppt/${kunjungan.NOMOR}/store`, dataToSend, {
                onSuccess: () => {
                    toast.success('Data CPPT berhasil disimpan');
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
            console.error('Error saving CPPT:', error);
            toast.error('Gagal menyimpan data CPPT');
            setLoading(null);
        }
    };

    const handleAddNewRow = () => {
        setIsModalOpen(true);
    };

    const handleSaveNewCPPT = (data: CPPTItem) => {
        setCpptData([...cpptData, data]);
    };

    const handleEditRow = (index: number) => {
        setEditingIndex(index);
        setNewRowData({ ...cpptData[index] });
    };

    const handleSaveRow = (index: number) => {
        const updatedData = [...cpptData];
        updatedData[index] = { ...newRowData };
        setCpptData(updatedData);
        setEditingIndex(null);
        toast.success('Data CPPT berhasil disimpan');
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setNewRowData({
            tanggal: new Date().toISOString().split('T')[0],
            profesi: '',
            subyektif: '',
            obyektif: '',
            assesment: '',
            planning: '',
            instruksi: '',
            nama_petugas: ''
        });
    };

    const handleDeleteRow = (index: number) => {
        const updatedData = cpptData.filter((_, i) => i !== index);
        setCpptData(updatedData);
        toast.success('Data CPPT berhasil dihapus');
    };

    const handleInputChange = (field: keyof CPPTItem, value: string) => {
        setNewRowData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`CPPT - ${pengajuan.nomor_sep}`} />
            <div className="max-w-7xl p-4">
                <div className="mb-4 flex items-center justify-end gap-2">
                    <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadCPPT}>
                        {loading === 'load' ? <Loader className="mr-2 animate-spin" /> : <Download className="mr-2 text-blue-500" />}
                        Load
                    </Button>
                    <Button variant="outline" onClick={handleAddNewRow}>
                        <Plus className="mr-2 text-green-500" />
                        Tambah CPPT
                    </Button>
                    <Button
                        variant="outline"
                        disabled={loading === 'simpan'}
                        onClick={handleSimpanCPPT}
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
                                    <h3 style={{ fontSize: 16 }}>CATATAN PERKEMBANGAN PASIEN TERINTEGRASI</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Data CPPT */}
                <div>
                    <table
                        style={{
                            fontFamily: 'Arial, sans-serif',
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #000',
                            fontSize: '12px'
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '80px' }}>Tanggal</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '80px' }}>Profesi</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Subyektif</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Obyektif</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Assessment</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Planning</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Instruksi</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '100px' }}>Nama Petugas</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '80px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cpptData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} style={{ border: '1px solid #000', padding: '20px', textAlign: 'center', color: '#666' }}>
                                        Belum ada data CPPT. Klik "Load" untuk memuat data atau "Tambah CPPT" untuk menambah data baru.
                                    </td>
                                </tr>
                            ) : (
                                cpptData.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="date"
                                                    value={newRowData.tanggal}
                                                    onChange={(e) => handleInputChange('tanggal', e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none' }}
                                                />
                                            ) : (
                                                item.tanggal
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="text"
                                                    value={newRowData.profesi}
                                                    onChange={(e) => handleInputChange('profesi', e.target.value)}
                                                    placeholder="Profesi"
                                                    style={{ width: '100%', border: 'none', outline: 'none' }}
                                                />
                                            ) : (
                                                stripHtmlTags(item.profesi)
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <textarea
                                                    value={newRowData.subyektif}
                                                    onChange={(e) => handleInputChange('subyektif', e.target.value)}
                                                    placeholder="Data Subyektif"
                                                    style={{ width: '100%', minHeight: '60px', border: 'none', outline: 'none', resize: 'vertical' }}
                                                />
                                            ) : (
                                                <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                    {stripHtmlTags(item.subyektif)}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <textarea
                                                    value={newRowData.obyektif}
                                                    onChange={(e) => handleInputChange('obyektif', e.target.value)}
                                                    placeholder="Data Obyektif"
                                                    style={{ width: '100%', minHeight: '60px', border: 'none', outline: 'none', resize: 'vertical' }}
                                                />
                                            ) : (
                                                <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                    {stripHtmlTags(item.obyektif)}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <textarea
                                                    value={newRowData.assesment}
                                                    onChange={(e) => handleInputChange('assesment', e.target.value)}
                                                    placeholder="Assessment"
                                                    style={{ width: '100%', minHeight: '60px', border: 'none', outline: 'none', resize: 'vertical' }}
                                                />
                                            ) : (
                                                <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                    {stripHtmlTags(item.assesment)}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <textarea
                                                    value={newRowData.planning}
                                                    onChange={(e) => handleInputChange('planning', e.target.value)}
                                                    placeholder="Planning"
                                                    style={{ width: '100%', minHeight: '60px', border: 'none', outline: 'none', resize: 'vertical' }}
                                                />
                                            ) : (
                                                <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                    {stripHtmlTags(item.planning)}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <textarea
                                                    value={newRowData.instruksi}
                                                    onChange={(e) => handleInputChange('instruksi', e.target.value)}
                                                    placeholder="Instruksi"
                                                    style={{ width: '100%', minHeight: '60px', border: 'none', outline: 'none', resize: 'vertical' }}
                                                />
                                            ) : (
                                                <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                    {stripHtmlTags(item.instruksi)}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="text"
                                                    value={newRowData.nama_petugas}
                                                    onChange={(e) => handleInputChange('nama_petugas', e.target.value)}
                                                    placeholder="Nama Petugas"
                                                    style={{ width: '100%', border: 'none', outline: 'none' }}
                                                />
                                            ) : (
                                                stripHtmlTags(item.nama_petugas)
                                            )}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                                            {editingIndex === index ? (
                                                <div className="flex gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleSaveRow(index)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Save className="h-3 w-3 text-green-500" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={handleCancelEdit}
                                                        className="h-6 w-6 p-0"
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
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Edit className="h-3 w-3 text-blue-500" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleDeleteRow(index)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Trash className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Tambah CPPT */}
                <TambahCPPTModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNewCPPT}
                    petugas={petugas || []}
                />
            </div>
        </AppLayout>
    );
}
