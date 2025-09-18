import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Download, Loader, Save, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Kunjungan {
    id: number;
    NOMOR: string;
    NOPEN: string;
    RUANGAN: string;
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
    savedData?: any;
}

export default function TriagePage() {
    const { pengajuan, kunjungan, kop, obat, savedData } = usePage<Props>().props;
    const [loading, setLoading] = useState<'load' | 'simpan' | 'hapus' | null>(null);
    const [selectedTriage, setSelectedTriage] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'DOA' | null>(null);
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
            title: `Triage ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

    const [pasien, setPasien] = useState<{
        nama?: string;
        norm?: string;
        tanggal_lahir?: string;
        jenis_kelamin?: string | number;
        dokter?: string;
        petugas?: string;
        kedatangan_datang_sendiri?: boolean;
        kedatangan_pengantar?: string;
        kedatangan_alat_transportasi?: string;
        kedatangan_polisi?: boolean;
        kedatangan_asal_rujukan?: string;
        kasus_jenis_kasus?: boolean;
        kasus_laka_lantas?: boolean;
        kasus_kecelakaan_kerja?: boolean;
        kasus_lokasi?: string;
        anamnese_terpimpin?: string;
        anamnese_keluhan_utama?: string;
        tanda_vital_tekanan_darah?: string;
        tanda_vital_suhu?: string;
        tanda_vital_nadi?: string;
        tanda_vital_pernafasan?: string;
        tanda_vital_skala_nyeri?: string;
        tanda_vital_metode_ukur?: string;
        triage_resusitasi?: boolean;
        triage_emergency?: boolean;
        triage_urgent?: boolean;
        triage_less_urgent?: boolean;
        triage_non_urgent?: boolean;
        triage_doa?: boolean;
    } | null>(null);

    // Load savedData saat komponen pertama kali dimuat
    useEffect(() => {
        if (savedData) {
            // Set data pasien dari savedData
            setPasien({
                nama: savedData.nama || 'Tidak Diketahui',
                norm: savedData.norm || '',
                tanggal_lahir: savedData.tanggal_lahir || 'Tidak Diketahui',
                jenis_kelamin: savedData.jenis_kelamin || '',
                dokter: savedData.dokter || '',
                petugas: savedData.petugas || '',
                kedatangan_datang_sendiri: savedData.kedatangan_datang_sendiri || false,
                kedatangan_pengantar: savedData.kedatangan_pengantar || '',
                kedatangan_alat_transportasi: savedData.kedatangan_alat_transportasi || '',
                kedatangan_polisi: savedData.kedatangan_polisi || false,
                kedatangan_asal_rujukan: savedData.kedatangan_asal_rujukan || '',
                kasus_jenis_kasus: savedData.kasus_jenis_kasus || false,
                kasus_laka_lantas: savedData.kasus_laka_lantas || false,
                kasus_kecelakaan_kerja: savedData.kasus_kecelakaan_kerja || false,
                kasus_lokasi: savedData.kasus_lokasi || '',
                anamnese_terpimpin: savedData.anamnese_terpimpin || '',
                anamnese_keluhan_utama: savedData.anamnese_keluhan_utama || '',
                tanda_vital_tekanan_darah: savedData.tanda_vital_tekanan_darah || '',
                tanda_vital_suhu: savedData.tanda_vital_suhu || '',
                tanda_vital_nadi: savedData.tanda_vital_nadi || '',
                tanda_vital_pernafasan: savedData.tanda_vital_pernafasan || '',
                tanda_vital_skala_nyeri: savedData.tanda_vital_skala_nyeri || '',
                tanda_vital_metode_ukur: savedData.tanda_vital_metode_ukur || '',
                triage_resusitasi: savedData.triage_resusitasi || false,
                triage_emergency: savedData.triage_emergency || false,
                triage_urgent: savedData.triage_urgent || false,
                triage_less_urgent: savedData.triage_less_urgent || false,
                triage_non_urgent: savedData.triage_non_urgent || false,
                triage_doa: savedData.triage_doa || false,
            });

            // Set selectedTriage berdasarkan kategori_triage
            if (savedData.kategori_triage) {
                setSelectedTriage(savedData.kategori_triage as 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'DOA');
            } else {
                // Fallback berdasarkan boolean fields
                if (savedData.triage_resusitasi) setSelectedTriage('P1');
                else if (savedData.triage_emergency) setSelectedTriage('P2');
                else if (savedData.triage_urgent) setSelectedTriage('P3');
                else if (savedData.triage_less_urgent) setSelectedTriage('P4');
                else if (savedData.triage_non_urgent) setSelectedTriage('P5');
                else if (savedData.triage_doa) setSelectedTriage('DOA');
            }
        }
    }, [savedData]);

    const handleLoadTriage = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/ugd/triage/${kunjungan.NOMOR}`);
            const data = await response.json();
            setPasien({
                nama: data.pasien?.NAMA || 'Tidak Diketahui',
                norm: String(data.pasien?.NORM || ''),
                tanggal_lahir: data.pasien?.TANGGAL_LAHIR || 'Tidak Diketahui',
                jenis_kelamin: String(data.pasien?.JENIS_KELAMIN || ''),
                petugas: data.kunjungan.triage?.HANDOVER || '',
                dokter: data.kunjungan.triage?.pengguna?.pegawai?.NAMA || '',
                kedatangan_datang_sendiri: data.kunjungan.triage?.KEDATANGAN.JENIS || false,
                kedatangan_pengantar: data.kunjungan.triage?.KEDATANGAN.PENGANTAR || '-',
                kedatangan_alat_transportasi: data.kunjungan.triage?.KEDATANGAN.ALAT_TRANSPORTASI || '-',
                kedatangan_polisi: data.kunjungan.triage?.KEDATANGAN.POLISI || false,
                kedatangan_asal_rujukan: data.kunjungan.triage?.KEDATANGAN.ASAL_RUJUKAN || '-',
                kasus_jenis_kasus: typeof data.kunjungan.triage?.KASUS.JENIS === 'number' ? data.kunjungan.triage?.KASUS.JENIS : null,
                kasus_laka_lantas: data.kunjungan.triage?.KASUS.LAKA_LANTAS || false,
                kasus_kecelakaan_kerja: data.kunjungan.triage?.KASUS.KECELAKAAN_KERJA || false,
                anamnese_keluhan_utama: data.kunjungan.triage?.ANAMNESE.KELUHAN_UTAMA || '-',
                anamnese_terpimpin: data.kunjungan.triage?.ANAMNESE.TERPIMPIN || '-',
                tanda_vital_tekanan_darah:
                    data.kunjungan.triage?.TANDA_VITAL.SISTOLE + '/' + data.kunjungan.triage?.TANDA_VITAL.DIASTOLE + ' mmHg' || '-',
                tanda_vital_suhu: data.kunjungan.triage?.TANDA_VITAL.SUHU + ' °C' || '-',
                tanda_vital_nadi: data.kunjungan.triage?.TANDA_VITAL.FREK_NADI + ' x/Menit' || '-',
                tanda_vital_pernafasan: data.kunjungan.triage?.TANDA_VITAL.FREK_NAFAS + ' x/Menit' || '-',
                tanda_vital_metode_ukur: data.kunjungan.triage?.TANDA_VITAL.METODE_UKUR || '-',
                tanda_vital_skala_nyeri: data.kunjungan.triage?.TANDA_VITAL.SKALA_NYERI || '-',
                triage_resusitasi: data.kunjungan.triage?.RESUSITASI.CHECKED || false,
                triage_emergency: data.kunjungan.triage?.EMERGENCY.CHECKED || false,
                triage_urgent: data.kunjungan.triage?.URGENT.CHECKED || false,
                triage_less_urgent: data.kunjungan.triage?.LESS_URGENT.CHECKED || false,
                triage_non_urgent: data.kunjungan.triage?.NON_URGENT.CHECKED || false,
                triage_doa: data.kunjungan.triage?.DOA.CHECKED || false,
            });

            // Set selectedTriage based on loaded data
            if (data.kunjungan.triage?.RESUSITASI.CHECKED) {
                setSelectedTriage('P1');
            } else if (data.kunjungan.triage?.EMERGENCY.CHECKED) {
                setSelectedTriage('P2');
            } else if (data.kunjungan.triage?.URGENT.CHECKED) {
                setSelectedTriage('P3');
            } else if (data.kunjungan.triage?.LESS_URGENT.CHECKED) {
                setSelectedTriage('P4');
            } else if (data.kunjungan.triage?.NON_URGENT.CHECKED) {
                setSelectedTriage('P5');
            } else if (data.kunjungan.triage?.DOA.CHECKED) {
                setSelectedTriage('DOA');
            } else {
                setSelectedTriage(null);
            }

            toast.success('Data berhasil dimuat');
        } catch (error) {
            console.log(error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(null);
        }
    };

    const handleHapusData = async () => {
        setLoading('hapus');
        try {
            // Simulate deleting data
            setPasien(null);
            setSelectedTriage(null); // Reset triage selection
            toast.success('Data berhasil dihapus');
        } catch (error) {
            toast.error('Gagal menghapus data');
        } finally {
            setLoading(null);
        }
    };

    const handleSimpanTriage = async () => {
        setLoading('simpan');
        
        if (!pasien) {
            toast.error('Tidak ada data pasien untuk disimpan');
            setLoading(null);
            return;
        }

        try {
            // Function untuk membersihkan field string
            const cleanStringField = (value: any) => {
                if (!value || value === 'Tidak ada' || value === 'Tidak Ada' || value === 'Tidak Diketahui') {
                    return '';
                }
                return String(value);
            };

            // Function untuk field required string
            const cleanRequiredStringField = (value: any, defaultValue: string = '-') => {
                if (!value || value === 'Tidak ada' || value === 'Tidak Ada' || value === 'Tidak Diketahui') {
                    return defaultValue;
                }
                return String(value);
            };

            const dataToSend = {
                pengajuan_klaim_id: pengajuan.id,
                pasien: {
                    ...pasien,
                    // Explicit string conversion untuk field yang required sebagai string
                    nama: cleanRequiredStringField(pasien.nama, 'Nama Tidak Diketahui'),
                    norm: cleanRequiredStringField(pasien.norm, '0'),
                    jenis_kelamin: cleanStringField(pasien.jenis_kelamin),
                    tanggal_lahir: cleanStringField(pasien.tanggal_lahir),
                    // Convert selectedTriage ke boolean fields untuk setiap kategori
                    triage_resusitasi: selectedTriage === 'P1',
                    triage_emergency: selectedTriage === 'P2', 
                    triage_urgent: selectedTriage === 'P3',
                    triage_less_urgent: selectedTriage === 'P4',
                    triage_non_urgent: selectedTriage === 'P5',
                    triage_doa: selectedTriage === 'DOA',
                },
                selectedTriage: selectedTriage,
            } as any;

            router.post(`/eklaim/ugd/triage/${kunjungan.NOMOR}/store`, dataToSend, {
                onSuccess: () => {
                    toast.success('Data Triage UGD berhasil disimpan');
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
            console.error('Error saving Triage:', error);
            toast.error('Gagal menyimpan data Triage');
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

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
        if (pasien) {
            setPasien({
                ...pasien,
                [field]: e.target.value,
            });
        }
    };

    const handleTriageChange = (value: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'DOA') => {
        if (selectedTriage === value) {
            setSelectedTriage(null); // Uncheck if already selected
        } else {
            setSelectedTriage(value); // Select new value
        }
    };

    const triageData = {
        P1: {
            title: 'RESUSITASI (P1)',
            color: '#0ea5e9',
            items: [
                { category: 'JALAN NAFAS (Airway)', conditions: ['Sumbatan (Obstruction)', 'Stridor'] },
                { category: 'PERNAFASAN (Breathing)', conditions: ['Henti nafas (breathing Arrest)', 'Frek. nafas (RR) <10x/mnt', 'Sianosis'] },
                { category: 'SIRKULASI (Circulation)', conditions: ['Henti jantung (Cardiac Arrest)', 'Nadi tidak teraba (Pulseless)', 'Pucat', 'Akral Dingin'] },
                { category: 'KESADARAN (Disability)', conditions: ['GCS < 9', 'Pupil unisokor'] }
            ]
        },
        P2: {
            title: 'EMERGENCY (P2)',
            color: '#dc2626',
            items: [
                { category: 'JALAN NAFAS (Airway)', conditions: ['Sumbatan (Obstruction)', 'Stridor'] },
                { category: 'PERNAFASAN (Breathing)', conditions: ['Frek. nafas (RR) <24-32 x/mnt', 'Wheezing', 'Gurgling'] },
                { category: 'SIRKULASI (Circulation)', conditions: ['Frek Nadi (HR) >120-150', 'Frek. Nadi (HR) >100-120', 'TD Sist > 160 mmHg', 'TD Diastole > 100 mmHg'] },
                { category: 'KESADARAN (Disability)', conditions: ['GCS 9-12', 'Pupil unisokor'] }
            ]
        },
        P3: {
            title: 'URGENT (P3)',
            color: '#eab308',
            items: [
                { category: 'JALAN NAFAS (Airway)', conditions: ['Bebas (patien)'] },
                { category: 'PERNAFASAN (Breathing)', conditions: ['Frek. nafas (RR) >24-32 x/mnt', 'Wheezing'] },
                { category: 'SIRKULASI (Circulation)', conditions: ['Frek Nadi (HR) >100-120', 'TD Sist > 140 mmHg', 'TD Diastole > 90-100 mmHg'] },
                { category: 'KESADARAN (Disability)', conditions: ['GCS >12', 'GCS 15'] }
            ]
        },
        P4: {
            title: 'LESS URGENT (P4)',
            color: '#22c55e',
            items: [
                { category: 'JALAN NAFAS (Airway)', conditions: ['Bebas (patien)'] },
                { category: 'PERNAFASAN (Breathing)', conditions: ['Frek. Nafas (RR) >24-32 x/mnt'] },
                { category: 'SIRKULASI (Circulation)', conditions: ['Frek Nadi (HR) >80-100 x/mnt', 'TD Sist > 120-140 mmHg', 'TD Diastole > 80-90 mmHg'] },
                { category: 'KESADARAN (Disability)', conditions: ['GCS 15'] }
            ]
        },
        P5: {
            title: 'NON URGENT (P5)',
            color: '#f3f4f6',
            items: [
                { category: 'JALAN NAFAS (Airway)', conditions: ['Bebas (patien)'] },
                { category: 'PERNAFASAN (Breathing)', conditions: ['Frek. Nafas (RR) >24-32 x/mnt'] },
                { category: 'SIRKULASI (Circulation)', conditions: ['Frek Nadi (HR) >60-100 x/mnt', 'TD Sist > 120 mmHg', 'TD Diastole > 80 mmHg'] },
                { category: 'KESADARAN (Disability)', conditions: ['GCS 15'] }
            ]
        },
        DOA: {
            title: 'DOA',
            color: '#6b7280',
            items: [
                { category: 'KESADARAN (Disability)', conditions: ['Pupil Midriasis Total', 'Kaku Mayat'] }
            ]
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Triage - ${pengajuan.nomor_sep}`} />
            <div className="max-w-7xl p-4">
                <div className="mb-4 flex items-center justify-end gap-2">
                    <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadTriage}>
                        {loading === 'load' ? <Loader className="mr-2 animate-spin" /> : <Download className="mr-2 text-blue-500" />}
                        Load
                    </Button>
                    <Button
                        variant="outline"
                        disabled={loading === 'simpan'}
                        onClick={handleSimpanTriage}
                    >
                        {loading === 'simpan' ? <Loader className="mr-2 animate-spin" /> : <Save className="mr-2 text-blue-500" />}
                        Simpan
                    </Button>
                    <Button variant="outline" disabled={loading === 'hapus'} onClick={handleHapusData}>
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
                                    <h3 style={{ fontSize: 16 }}>TRIAGE</h3>
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
                                <td colSpan={4} style={{ border: '1px solid #000', padding: '5px', width: '400px' }}>
                                    Dokter : <br />
                                    <textarea
                                        value={pasien?.dokter || ''}
                                        onChange={(e) => handleInputChange(e, 'dokter')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                </td>
                                <td colSpan={4} style={{ border: '1px solid #000', padding: '5px', width: '400px' }}>
                                    Petugas : <br />
                                    <textarea
                                        value={pasien?.petugas || ''}
                                        onChange={(e) => handleInputChange(e, 'petugas')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Cara Datang : <br />
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    <div style={{ display: 'flex' }}>
                                        <Checkbox
                                            checked={pasien?.kedatangan_datang_sendiri || false}
                                            onCheckedChange={(checked) =>
                                                setPasien((prev) => (prev ? { ...prev, kedatangan_datang_sendiri: checked === true } : prev))
                                            }
                                        />{' '}
                                        Datang Sendiri, Pengantar :
                                        <textarea
                                            value={pasien?.kedatangan_pengantar || ''}
                                            onChange={(e) => handleInputChange(e, 'kedatangan_pengantar')}
                                            style={{
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                fontFamily: 'halvetica, sans-serif',
                                                padding: '2px 0',
                                                resize: 'none',
                                            }}
                                            placeholder="-"
                                            rows={1}
                                        />
                                        , Alat Transportasi :
                                        <textarea
                                            value={pasien?.kedatangan_alat_transportasi || ''}
                                            onChange={(e) => handleInputChange(e, 'kedatangan_alat_transportasi')}
                                            style={{
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                fontFamily: 'halvetica, sans-serif',
                                                padding: '2px 0',
                                                resize: 'none',
                                            }}
                                            placeholder="-"
                                            rows={1}
                                        />
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        Rujukan Dari :{' '}
                                        <textarea
                                            value={pasien?.kedatangan_asal_rujukan || ''}
                                            onChange={(e) => handleInputChange(e, 'kedatangan_asal_rujukan')}
                                            style={{
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                fontFamily: 'halvetica, sans-serif',
                                                padding: '2px 0',
                                                resize: 'none',
                                            }}
                                            placeholder="-"
                                            rows={1}
                                        />
                                        <Checkbox
                                            checked={pasien?.kedatangan_polisi || false}
                                            onCheckedChange={(checked) =>
                                                setPasien((prev) => (prev ? { ...prev, kedatangan_polisi: checked === true } : prev))
                                            }
                                        />{' '}
                                        Rujukan Dari Polisi
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Kasus : <br />
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    <div style={{ display: 'flex' }}>
                                        {pasien?.kasus_jenis_kasus == true ? (
                                            <>
                                                <Checkbox checked={true} /> Trauma
                                                {pasien.kasus_kecelakaan_kerja == true ? (
                                                    <>
                                                        <Checkbox checked={true} /> Kecelakaan Kerja
                                                    </>
                                                ) : null}
                                                {pasien.kasus_laka_lantas == true ? (
                                                    <>
                                                        <Checkbox checked={true} /> Kecelakaan Lalu Lintas
                                                    </>
                                                ) : null}
                                                Lokasi :
                                                <textarea
                                                    value={pasien?.kasus_lokasi || ''}
                                                    onChange={(e) => handleInputChange(e, 'kasus_lokasi')}
                                                    style={{
                                                        border: 'none',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        fontFamily: 'halvetica, sans-serif',
                                                        padding: '2px 0',
                                                        resize: 'none',
                                                    }}
                                                    placeholder="-"
                                                    rows={1}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Checkbox checked={true} /> Non Trauma
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Anamnese : <br />
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    Keluhan Utama : <br />
                                    <textarea
                                        value={pasien?.anamnese_keluhan_utama || ''}
                                        onChange={(e) => handleInputChange(e, 'anamnese_keluhan_utama')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                    <br />
                                    Terpimpin : <br />
                                    <textarea
                                        value={pasien?.anamnese_terpimpin || ''}
                                        onChange={(e) => handleInputChange(e, 'anamnese_terpimpin')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Tanda Vital : <br />
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    Tekanan Darah : <br />
                                    <textarea
                                        value={pasien?.tanda_vital_tekanan_darah || ''}
                                        onChange={(e) => handleInputChange(e, 'tanda_vital_tekanan_darah')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                    <br />
                                    Suhu : <br />
                                    <textarea
                                        value={pasien?.tanda_vital_suhu || ''}
                                        onChange={(e) => handleInputChange(e, 'tanda_vital_suhu')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                    <br />
                                    Frekuensi Nadi : <br />
                                    <textarea
                                        value={pasien?.tanda_vital_nadi || ''}
                                        onChange={(e) => handleInputChange(e, 'tanda_vital_nadi')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                    <br />
                                    Frekuensi Nafas : <br />
                                    <textarea
                                        value={pasien?.tanda_vital_pernafasan || ''}
                                        onChange={(e) => handleInputChange(e, 'tanda_vital_pernafasan')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                    <br />
                                    Nyeri : <br />
                                    <textarea
                                        value={pasien?.tanda_vital_skala_nyeri || ''}
                                        onChange={(e) => handleInputChange(e, 'tanda_vital_skala_nyeri')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                    Metode Ukur : <br />
                                    <textarea
                                        value={pasien?.tanda_vital_metode_ukur || ''}
                                        onChange={(e) => handleInputChange(e, 'tanda_vital_metode_ukur')}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                            resize: 'none',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Triage : <br />
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    {/* Triage Checkbox Row */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '10px' }}>
                                        {Object.entries(triageData).map(([key, data]) => (
                                            <div
                                                key={key}
                                                style={{
                                                    backgroundColor: data.color,
                                                    color: key === 'P5' ? '#000' : key === 'DOA' ? '#fff' : '#fff',
                                                    padding: '8px 12px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    border: selectedTriage === key ? '2px solid #000' : '1px solid #ccc',
                                                    minWidth: '120px',
                                                    justifyContent: 'center'
                                                }}
                                                onClick={() => handleTriageChange(key as 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'DOA')}
                                            >
                                                <Checkbox
                                                    checked={selectedTriage === key}
                                                    style={{ 
                                                        backgroundColor: selectedTriage === key ? '#000' : 'transparent',
                                                        border: '2px solid #000'
                                                    }}
                                                />
                                                <span>{data.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            {/* Expand Row for Selected Triage */}
                            {selectedTriage && (
                                <tr>
                                    <td colSpan={8} style={{ border: '1px solid #000', padding: '10px' }}>
                                        <div style={{ 
                                            backgroundColor: triageData[selectedTriage].color,
                                            color: selectedTriage === 'P5' ? '#000' : selectedTriage === 'DOA' ? '#fff' : '#fff',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            marginBottom: '10px'
                                        }}>
                                            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                                                {triageData[selectedTriage].title}
                                            </h3>
                                            
                                            {/* Detail kondisi untuk triage yang dipilih */}
                                            <div style={{ 
                                                backgroundColor: '#fff',
                                                color: '#000',
                                                borderRadius: '4px',
                                                padding: '15px'
                                            }}>
                                                {triageData[selectedTriage].items.map((item, index) => (
                                                    <div key={index} style={{ marginBottom: '15px' }}>
                                                        <h4 style={{ 
                                                            fontSize: '14px', 
                                                            fontWeight: 'bold', 
                                                            marginBottom: '8px',
                                                            color: triageData[selectedTriage].color,
                                                            borderBottom: `2px solid ${triageData[selectedTriage].color}`,
                                                            paddingBottom: '4px'
                                                        }}>
                                                            {item.category}
                                                        </h4>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                            {item.conditions.map((condition, condIndex) => (
                                                                <div key={condIndex} style={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '6px',
                                                                    fontSize: '12px',
                                                                    minWidth: '200px',
                                                                    padding: '4px 8px',
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #dee2e6'
                                                                }}>
                                                                    <span>• {condition}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Plan Section - tampilkan zona yang sesuai */}
                                            <div style={{ 
                                                marginTop: '15px',
                                                backgroundColor: '#fff',
                                                color: '#000',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ 
                                                    backgroundColor: '#f8f9fa',
                                                    padding: '8px',
                                                    fontWeight: 'bold',
                                                    fontSize: '12px',
                                                    textAlign: 'center'
                                                }}>
                                                    RENCANA TINDAKAN - {triageData[selectedTriage].title}
                                                </div>
                                                <div style={{ padding: '15px' }}>
                                                    {selectedTriage === 'P1' && (
                                                        <div style={{ 
                                                            backgroundColor: '#dc2626',
                                                            color: '#fff',
                                                            padding: '15px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                ZONA MERAH - RESUSITASI
                                                            </div>
                                                            <div style={{ fontSize: '12px' }}>
                                                                <div>• RUANG RESUSITASI</div>
                                                                <div>• RUANG ICU/HCU</div>
                                                                <div>• Stabilisasi segera</div>
                                                                <div>• Konsultasi dokter spesialis</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedTriage === 'P2' && (
                                                        <div style={{ 
                                                            backgroundColor: '#dc2626',
                                                            color: '#fff',
                                                            padding: '15px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                ZONA MERAH - EMERGENCY
                                                            </div>
                                                            <div style={{ fontSize: '12px' }}>
                                                                <div>• Penanganan segera</div>
                                                                <div>• Monitoring ketat</div>
                                                                <div>• Persiapan rujukan jika perlu</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedTriage === 'P3' && (
                                                        <div style={{ 
                                                            backgroundColor: '#eab308',
                                                            color: '#000',
                                                            padding: '15px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                ZONA KUNING - URGENT
                                                            </div>
                                                            <div style={{ fontSize: '12px' }}>
                                                                <div>• Pemeriksaan dalam 30 menit</div>
                                                                <div>• Monitoring berkala</div>
                                                                <div>• Tindakan sesuai protokol</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedTriage === 'P4' && (
                                                        <div style={{ 
                                                            backgroundColor: '#22c55e',
                                                            color: '#fff',
                                                            padding: '15px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                ZONA HIJAU - LESS URGENT
                                                            </div>
                                                            <div style={{ fontSize: '12px' }}>
                                                                <div>• Pemeriksaan dalam 60 menit</div>
                                                                <div>• Observasi berkala</div>
                                                                <div>• Edukasi pasien</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedTriage === 'P5' && (
                                                        <div style={{ 
                                                            backgroundColor: '#22c55e',
                                                            color: '#fff',
                                                            padding: '15px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                ZONA HIJAU - NON URGENT
                                                            </div>
                                                            <div style={{ fontSize: '12px' }}>
                                                                <div>• Pemeriksaan dalam 120 menit</div>
                                                                <div>• Dapat menunggu</div>
                                                                <div>• Konseling kesehatan</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedTriage === 'DOA' && (
                                                        <div style={{ 
                                                            backgroundColor: '#6b7280',
                                                            color: '#fff',
                                                            padding: '15px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                ZONA HITAM - DOA
                                                            </div>
                                                            <div style={{ fontSize: '12px' }}>
                                                                <div>• Tidak ada tindakan medis</div>
                                                                <div>• Dokumentasi lengkap</div>
                                                                <div>• Koordinasi dengan keluarga</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
