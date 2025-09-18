import DiagnosisModal from '@/components/eklaim/DiagnosisModal';
import ObatModal from '@/components/eklaim/ObatModal';
import ProcedureModal from '@/components/eklaim/ProcedureModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Download, Loader, Save, Trash, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Diagnosa {
    name: string;
    code: string;
}

interface Procedure {
    name: string;
    code: string;
}

interface ObatItem {
    ID: number;
    NAMA: string;
    KODE?: string;
    SATUAN?: string;
}

interface ResepItem {
    id: number;
    nama_obat: string;
    frekuensi: string;
    jumlah: number;
    cara_pemberian: string;
    kode_obat: string;
}

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
    obat: ObatItem[];
    savedData?: any;
}

export default function RawatInapResumeMedisUGD() {
    const { pengajuan, kunjungan, kop, obat, savedData } = usePage<Props>().props;
    const [loading, setLoading] = useState<'load' | 'simpan' | 'hapus' | null>(null);
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
            title: `Resume Medis ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

    const [pasien, setPasien] = useState<{
        nama?: string;
        norm?: string;
        tanggal_lahir?: string;
        jenis_kelamin?: string | number;
        tanggal_masuk?: string;
        tanggal_keluar?: string;
        ruangan?: string;
        penanggung_jawab?: string;
        indikasi_rawat_inap?: string;
        riwayat_penyakit_dahulu?: string;
        riwayat_penyakit_sekarang?: string;
        pemeriksaan_fisik?: string;
        hasil_konsultasi?: string;
        tanda_vital_keadaan_umum?: string;
        tanda_vital_kesadaran?: string;
        tanda_vital_sistolik?: string;
        tanda_vital_distolik?: string;
        tanda_vital_frekuensi_nadi?: string;
        tanda_vital_frekuensi_nafas?: string;
        tanda_vital_suhu?: string;
        tanda_vital_saturasi_o2?: string;
        tanda_vital_eye?: string;
        tanda_vital_motorik?: string;
        tanda_vital_verbal?: string;
        tanda_vital_gcs?: string;
        cara_keluar?: string;
        keadaan_keluar?: string;
        jadwal_kontrol_tanggal?: string;
        jadwal_kontrol_jam?: string;
        jadwal_kontrol_tujuan?: string;
        jadwal_kontrol_nomor_bpjs?: string;
        dokter: string;
        petugas?: string;
    } | null>(null);

    const [selectedDiagnosa, setSelectedDiagnosa] = useState<Diagnosa[]>([]);
    const [diagnosisModal, setDiagnosisModal] = useState(false);
    const [selectedProcedures, setSelectedProcedures] = useState<Procedure[]>([]);
    const [procedureModal, setProcedureModal] = useState(false);
    const [resepPulang, setResepPulang] = useState<ResepItem[]>([]);
    const [obatModal, setObatModal] = useState(false);

    // Load savedData saat komponen pertama kali dimuat
    useEffect(() => {
        if (savedData) {
            // Set data pasien dari savedData dengan struktur flat
            setPasien({
                nama: savedData.nama,
                norm: savedData.norm,
                tanggal_lahir: savedData.tanggal_lahir,
                jenis_kelamin: savedData.jenis_kelamin,
                tanggal_masuk: savedData.tanggal_masuk,
                tanggal_keluar: savedData.tanggal_keluar,
                ruangan: savedData.ruangan,
                penanggung_jawab: savedData.penanggung_jawab,
                indikasi_rawat_inap: savedData.indikasi_rawat_inap,
                riwayat_penyakit_dahulu: savedData.riwayat_penyakit_dahulu,
                riwayat_penyakit_sekarang: savedData.riwayat_penyakit_sekarang,
                pemeriksaan_fisik: savedData.pemeriksaan_fisik,
                hasil_konsultasi: savedData.hasil_konsultasi,
                tanda_vital_keadaan_umum: savedData.tanda_vital_keadaan_umum,
                tanda_vital_kesadaran: savedData.tanda_vital_kesadaran,
                tanda_vital_sistolik: savedData.tanda_vital_sistolik,
                tanda_vital_distolik: savedData.tanda_vital_distolik,
                tanda_vital_frekuensi_nadi: savedData.tanda_vital_frekuensi_nadi,
                tanda_vital_frekuensi_nafas: savedData.tanda_vital_frekuensi_nafas,
                tanda_vital_suhu: savedData.tanda_vital_suhu,
                tanda_vital_saturasi_o2: savedData.tanda_vital_saturasi_o2,
                tanda_vital_eye: savedData.tanda_vital_eye,
                tanda_vital_motorik: savedData.tanda_vital_motorik,
                tanda_vital_verbal: savedData.tanda_vital_verbal,
                tanda_vital_gcs: savedData.tanda_vital_gcs,
                cara_keluar: savedData.cara_keluar,
                keadaan_keluar: savedData.keadaan_keluar,
                jadwal_kontrol_tanggal: savedData.jadwal_kontrol_tanggal,
                jadwal_kontrol_jam: savedData.jadwal_kontrol_jam,
                jadwal_kontrol_tujuan: savedData.jadwal_kontrol_tujuan,
                jadwal_kontrol_nomor_bpjs: savedData.jadwal_kontrol_nomor_bpjs,
                dokter: savedData.dokter,
            });
            
            // Set diagnosa dari savedData
            if (savedData.selected_diagnosa) {
                setSelectedDiagnosa(savedData.selected_diagnosa);
            }
            
            // Set procedures dari savedData
            if (savedData.selected_procedures) {
                setSelectedProcedures(savedData.selected_procedures);
            }
            
            // Set resep pulang dari savedData
            if (savedData.resep_pulang) {
                setResepPulang(savedData.resep_pulang);
            }
        }
    }, [savedData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
        if (pasien) {
            setPasien({
                ...pasien,
                [field]: e.target.value,
            });
        }
    };

    // Helper function to remove .00 from numbers
    const formatNumber = (value: any): string => {
        if (value === null || value === undefined) return 'Tidak Diketahui';
        const str = String(value);
        if (str.endsWith('.00')) {
            return str.replace('.00', '');
        }
        return str;
    };

    // Helper function to format number for numeric fields
    const formatNumericValue = (value: any): number => {
        if (value === null || value === undefined) return 0;
        const numValue = Number(value);
        return isNaN(numValue) ? 0 : numValue;
    };

    const handleLoadResumeMedis = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/ugd/resume-medis/${kunjungan.NOMOR}`);
            const data = await response.json();
            setPasien({
                nama: data.pasien?.NAMA || 'Tidak Diketahui',
                norm: String(data.pasien?.NORM || 'Tidak Diketahui'),
                tanggal_lahir: data.pasien?.TANGGAL_LAHIR || 'Tidak Diketahui',
                jenis_kelamin: String(data.pasien?.JENIS_KELAMIN || ''),
                tanggal_masuk: data.kunjungan?.MASUK || 'Tidak Diketahui',
                tanggal_keluar: data.kunjungan?.KELUAR || 'Tidak Diketahui',
                ruangan: data.kunjungan?.ruangan.DESKRIPSI || 'Tidak Diketahui',
                penanggung_jawab: data.kunjungan?.penjamin.nama_penjamin?.DESKRIPSI || 'Tidak Diketahui',
                indikasi_rawat_inap: data.resume?.INDIKASI_RAWAT_INAP || 'Tidak Diketahui',
                riwayat_penyakit_sekarang: data.kunjungan?.anamnesis.DESKRIPSI || 'Tidak Diketahui',
                riwayat_penyakit_dahulu: data.kunjungan?.rpp.DESKRIPSI || 'Tidak Diketahui',
                pemeriksaan_fisik: data.pemeriksaan_fisik?.DESKRIPSI || 'Tidak Diketahui',
                hasil_konsultasi: '-',
                tanda_vital_keadaan_umum: data.kunjungan?.tanda_vital?.KEADAAN_UMUM || 'Tidak Diketahui',
                tanda_vital_kesadaran: data.kunjungan?.tanda_vital?.KESADARAN || 'Tidak Diketahui',
                tanda_vital_sistolik: formatNumber(data.kunjungan?.tanda_vital?.SISTOLIK),
                tanda_vital_distolik: formatNumber(data.kunjungan?.tanda_vital?.DISTOLIK),
                tanda_vital_frekuensi_nadi: formatNumber(data.kunjungan?.tanda_vital?.FREKUENSI_NADI),
                tanda_vital_frekuensi_nafas: formatNumber(data.kunjungan?.tanda_vital?.FREKUENSI_NAFAS),
                tanda_vital_suhu: formatNumber(data.kunjungan?.tanda_vital?.SUHU),
                tanda_vital_saturasi_o2: formatNumber(data.kunjungan?.tanda_vital?.SATURASI_O2),
                tanda_vital_eye: formatNumber(data.kunjungan?.tanda_vital?.EYE),
                tanda_vital_motorik: formatNumber(data.kunjungan?.tanda_vital?.MOTORIK),
                tanda_vital_verbal: formatNumber(data.kunjungan?.tanda_vital?.VERBAL),
                tanda_vital_gcs: formatNumber(data.kunjungan?.tanda_vital?.GCS),
                keadaan_keluar: data.kunjungan?.pasien_pulang?.keadaan_pulang.DESKRIPSI || 'Tidak Diketahui',
                cara_keluar: data.kunjungan?.pasien_pulang?.cara_pulang.DESKRIPSI || 'Tidak Diketahui',
                jadwal_kontrol_jam: data.kunjungan?.jadwal_kontrol?.JAM || 'Tidak Ada',
                jadwal_kontrol_tujuan: data.kunjungan?.jadwal_kontrol?.ruangan?.DESKRIPSI || 'Tidak Ada',
                jadwal_kontrol_nomor_bpjs: data.kunjungan?.jadwal_kontrol?.NOMOR_REFERENSI || 'Tidak Ada',
                jadwal_kontrol_tanggal: data.kunjungan?.jadwal_kontrol?.TANGGAL || '',
                dokter:
                    [
                        data.kunjungan?.dokter?.pegawai?.GELAR_DEPAN,
                        data.kunjungan?.dokter?.pegawai?.NAMA,
                        data.kunjungan?.dokter?.pegawai?.GELAR_BELAKANG,
                    ]
                        .filter(Boolean)
                        .join(' ') || 'Tidak Diketahui',
                petugas: '', // Kosong sesuai permintaan user
            });

            // Load diagnosis data dari response
            if (data.kunjungan?.diagnosa && Array.isArray(data.kunjungan?.diagnosa)) {
                const diagnosisData = data.kunjungan.diagnosa.map((diag: any) => ({
                    code: diag.KODE,
                    name: diag.DIAGNOSA || diag.KODE,
                }));
                setSelectedDiagnosa(diagnosisData);
            }

            // Load procedures data dari response
            if (data.kunjungan?.procedures && Array.isArray(data.kunjungan.procedures)) {
                const proceduresData = data.kunjungan.procedures.map((proc: any) => ({
                    code: proc.KODE,
                    name: proc.TINDAKAN || proc.KODE,
                }));
                setSelectedProcedures(proceduresData);
            }

            // Load resep pulang data dari response
            if (data.kunjungan?.order_resep_pulang && Array.isArray(data.kunjungan.order_resep_pulang)) {
                const allResepDetil: ResepItem[] = [];

                // Loop melalui setiap order_resep_pulang
                data.kunjungan.order_resep_pulang.forEach((orderResep: any) => {
                    if (orderResep.order_resep_detil && Array.isArray(orderResep.order_resep_detil)) {
                        // Tambahkan semua order_resep_detil ke array utama
                        orderResep.order_resep_detil.forEach((detil: any) => {
                            allResepDetil.push({
                                id: detil.ID || Math.random(),
                                nama_obat: detil.nama_obat?.NAMA || detil.NAMA_OBAT || 'Tidak Diketahui',
                                frekuensi: detil.frekuensi.FREKUENSI || '-',
                                jumlah: formatNumericValue(detil.JUMLAH),
                                cara_pemberian: 'SESUDAH MAKAN',
                                kode_obat: detil.KODE_OBAT || '-',
                            });
                        });
                    }
                });

                setResepPulang(allResepDetil);
            }

            setLoading(null);
            toast.success('Data berhasil dimuat');
        } catch (error) {
            setLoading(null);
            console.error(error);
            toast.error('Gagal memuat data');
        }
    };

    const handleHapusData = async () => {
        setLoading('hapus');
        try {
            setPasien(null);
            setSelectedDiagnosa([]);
            setSelectedProcedures([]);
            setResepPulang([]);
            toast.success('Data berhasil dihapus');
        } catch (error) {
            setLoading(null);
            toast.error('Gagal menghapus data');
        } finally {
            setLoading(null);
        }
    };

    const handleSimpanResumeMedis = async () => {
        setLoading('simpan');
        
        if (!pasien) {
            toast.error('Tidak ada data pasien untuk disimpan');
            setLoading(null);
            return;
        }

        try {
            // Function untuk membersihkan field tanggal
            const cleanDateField = (value: any) => {
                if (!value || value === 'Tidak ada' || value === 'Tidak Ada' || value === 'Tidak Diketahui' || value === '') {
                    return null;
                }
                return value;
            };

            // Function untuk membersihkan field string
            const cleanStringField = (value: any) => {
                if (!value || value === 'Tidak ada' || value === 'Tidak Ada' || value === 'Tidak Diketahui') {
                    return '';
                }
                return String(value);
            };

            const dataToSend = {
                pengajuan_klaim_id: pengajuan.id,
                // Identitas Pasien
                nama: cleanStringField(pasien.nama),
                norm: cleanStringField(pasien.norm),
                tanggal_lahir: cleanDateField(pasien.tanggal_lahir),
                jenis_kelamin: cleanStringField(pasien.jenis_kelamin),
                tanggal_masuk: cleanDateField(pasien.tanggal_masuk),
                tanggal_keluar: cleanDateField(pasien.tanggal_keluar),
                ruangan: cleanStringField(pasien.ruangan),
                penanggung_jawab: cleanStringField(pasien.penanggung_jawab),
                dokter: cleanStringField(pasien.dokter),
                petugas: cleanStringField(pasien.petugas),
                // Medical Data
                indikasi_rawat_inap: cleanStringField(pasien.indikasi_rawat_inap),
                riwayat_penyakit_dahulu: cleanStringField(pasien.riwayat_penyakit_dahulu),
                riwayat_penyakit_sekarang: cleanStringField(pasien.riwayat_penyakit_sekarang),
                pemeriksaan_fisik: cleanStringField(pasien.pemeriksaan_fisik),
                hasil_konsultasi: cleanStringField(pasien.hasil_konsultasi),
                // Tanda Vital
                tanda_vital_keadaan_umum: cleanStringField(pasien.tanda_vital_keadaan_umum),
                tanda_vital_kesadaran: cleanStringField(pasien.tanda_vital_kesadaran),
                tanda_vital_sistolik: cleanStringField(pasien.tanda_vital_sistolik),
                tanda_vital_distolik: cleanStringField(pasien.tanda_vital_distolik),
                tanda_vital_frekuensi_nadi: cleanStringField(pasien.tanda_vital_frekuensi_nadi),
                tanda_vital_frekuensi_nafas: cleanStringField(pasien.tanda_vital_frekuensi_nafas),
                tanda_vital_suhu: cleanStringField(pasien.tanda_vital_suhu),
                tanda_vital_saturasi_o2: cleanStringField(pasien.tanda_vital_saturasi_o2),
                tanda_vital_eye: cleanStringField(pasien.tanda_vital_eye),
                tanda_vital_motorik: cleanStringField(pasien.tanda_vital_motorik),
                tanda_vital_verbal: cleanStringField(pasien.tanda_vital_verbal),
                tanda_vital_gcs: cleanStringField(pasien.tanda_vital_gcs),
                // Discharge
                cara_keluar: cleanStringField(pasien.cara_keluar),
                keadaan_keluar: cleanStringField(pasien.keadaan_keluar),
                // Kontrol
                jadwal_kontrol_tanggal: cleanDateField(pasien.jadwal_kontrol_tanggal),
                jadwal_kontrol_jam: cleanStringField(pasien.jadwal_kontrol_jam),
                jadwal_kontrol_tujuan: cleanStringField(pasien.jadwal_kontrol_tujuan),
                jadwal_kontrol_nomor_bpjs: cleanStringField(pasien.jadwal_kontrol_nomor_bpjs),
                // Arrays
                selected_diagnosa: selectedDiagnosa,
                selected_procedures: selectedProcedures,
                resep_pulang: resepPulang,
            } as any;

            router.post(`/eklaim/ugd/resume-medis`, dataToSend, {
                onSuccess: () => {
                    toast.success('Data Resume Medis UGD berhasil disimpan');
                    setLoading(null);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Gagal menyimpan data. Periksa form dan coba lagi.');
                    setLoading(null);
                },
                onFinish: () => {
                    setLoading(null);
                }
            });
        } catch (error) {
            console.error('Error saving Resume Medis:', error);
            toast.error('Gagal menyimpan data Resume Medis');
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
        if (!datetime || datetime === 'Tidak Diketahui' || datetime === 'Tidak ada' || datetime === '-') return '-';
        
        try {
            let tanggal, waktu;
            
            // Handle different datetime formats
            if (datetime.includes(' ')) {
                // Format: YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss
                [tanggal, waktu] = datetime.replace('T', ' ').split(' ');
            } else if (datetime.includes('T')) {
                // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
                [tanggal, waktu] = datetime.split('T');
                if (waktu && waktu.includes('.')) {
                    waktu = waktu.split('.')[0]; // Remove milliseconds
                }
            } else {
                // Only date: YYYY-MM-DD
                tanggal = datetime;
                waktu = '00:00:00';
            }
            
            if (!tanggal) return datetime;
            
            const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const [tahun, bulan, hari] = tanggal.split('-');
            
            if (!tahun || !bulan || !hari) return datetime;
            
            if (!waktu) {
                // Return only date if no time
                return `${parseInt(hari)} ${bulanIndo[parseInt(bulan) - 1]} ${tahun}`;
            }
            
            const [jam, menit] = waktu.split(':');
            return `${parseInt(hari)} ${bulanIndo[parseInt(bulan) - 1]} ${tahun} ${jam}:${menit}`;
        } catch (error) {
            console.error('Error formatting datetime:', error, 'Input:', datetime);
            return datetime;
        }
    }

    function hitungLamaDirawat(masuk?: string, keluar?: string) {
        if (!masuk || !keluar || masuk === 'Tidak Diketahui' || keluar === 'Tidak Diketahui' || masuk === '-' || keluar === '-') return '-';
        
        try {
            // Handle different datetime formats and convert to standard format
            const normalizeDateTime = (datetime: string) => {
                if (datetime.includes('T')) {
                    // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DD HH:mm:ss
                    return datetime.replace('T', ' ').split('.')[0];
                }
                return datetime;
            };
            
            const normalizedMasuk = normalizeDateTime(masuk);
            const normalizedKeluar = normalizeDateTime(keluar);
            
            // Create dates from normalized strings
            const masukDate = new Date(normalizedMasuk.replace(/-/g, '/'));
            const keluarDate = new Date(normalizedKeluar.replace(/-/g, '/'));
            
            if (isNaN(masukDate.getTime()) || isNaN(keluarDate.getTime())) return '-';
            
            // Hitung selisih hari inklusif (termasuk hari masuk dan keluar)
            const tglMasuk = new Date(masukDate.getFullYear(), masukDate.getMonth(), masukDate.getDate());
            const tglKeluar = new Date(keluarDate.getFullYear(), keluarDate.getMonth(), keluarDate.getDate());
            const selisihMs = tglKeluar.getTime() - tglMasuk.getTime();
            let hari = Math.round(selisihMs / (1000 * 60 * 60 * 24)) + 1;
            
            // Ensure minimum 1 day
            if (hari < 1) hari = 1;
            
            return hari + ' hari';
        } catch (error) {
            console.error('Error calculating length of stay:', error, 'Masuk:', masuk, 'Keluar:', keluar);
            return '-';
        }
    }

    const handleSelectDiagnosis = (diagnosis: Diagnosa) => {
        const isAlreadySelected = selectedDiagnosa.some((d) => d.code === diagnosis.code);
        if (!isAlreadySelected) {
            setSelectedDiagnosa([...selectedDiagnosa, diagnosis]);
        }
    };

    const handleRemoveDiagnosis = (code: string) => {
        setSelectedDiagnosa((prev) => prev.filter((d) => d.code !== code));
    };

    const handleSelectProcedure = (procedure: Procedure) => {
        const isAlreadySelected = selectedProcedures.some((p) => p.code === procedure.code);
        if (!isAlreadySelected) {
            setSelectedProcedures([...selectedProcedures, procedure]);
        }
    };

    const handleRemoveProcedure = (code: string) => {
        setSelectedProcedures((prev) => prev.filter((p) => p.code !== code));
    };

    const handleSelectObat = (obat: ObatItem) => {
        const newResep: ResepItem = {
            id: Date.now(), // temporary ID
            nama_obat: obat.NAMA,
            frekuensi: '3x1',
            jumlah: 1,
            cara_pemberian: 'SESUDAH MAKAN',
            kode_obat: obat.KODE || '',
        };
        setResepPulang([...resepPulang, newResep]);
    };

    const handleRemoveObat = (id: number) => {
        setResepPulang((prev) => prev.filter((resep) => resep.id !== id));
    };

    const handleUpdateResep = (id: number, field: keyof ResepItem, value: string | number) => {
        setResepPulang((prev) => prev.map((resep) => (resep.id === id ? { ...resep, [field]: value } : resep)));
    };

    const handleStore = async () => {
        setLoading('simpan');
        
        if (!pasien) {
            toast.error('Data pasien tidak lengkap');
            setLoading(null);
            return;
        }

        try {
            const dataToSend = {
                pengajuan_klaim_id: pengajuan.id,
                kunjungan_nomor: kunjungan.NOMOR,
                
                // Identitas Pasien  
                nama_lengkap: pasien.nama || '',
                norm: pasien.norm || '',
                nomor_kartu: pasien.norm || '',
                nik: pasien.norm || '',
                umur: 0,
                jenis_kelamin: String(pasien.jenis_kelamin) || '',
                tanggal_lahir: pasien.tanggal_lahir || null,
                alamat: '', // tidak ada di frontend state
                berat_badan: '', // tidak ada di frontend state
                tinggi_badan: '', // tidak ada di frontend state
                
                // Vital Signs
                sistole: pasien.tanda_vital_sistolik || '',
                diastole: pasien.tanda_vital_distolik || '',
                respiratory_rate: pasien.tanda_vital_frekuensi_nafas || '',
                heart_rate: pasien.tanda_vital_frekuensi_nadi || '',
                temperature: pasien.tanda_vital_suhu || '',
                spo2: pasien.tanda_vital_saturasi_o2 || '',
                
                // Riwayat Penyakit
                riwayat_penyakit_keluarga: '', // tidak ada di frontend state
                riwayat_penyakit_dahulu: pasien.riwayat_penyakit_dahulu || '',
                riwayat_pengobatan: '', // tidak ada di frontend state
                riwayat_alergi: '', // tidak ada di frontend state
                
                // Pemeriksaan
                anamnesis: pasien.riwayat_penyakit_sekarang || '',
                pemeriksaan_fisik: pasien.pemeriksaan_fisik || '',
                
                // Diagnosis dan Prosedur
                diagnosis_primer: JSON.stringify(selectedDiagnosa || []),
                diagnosis_sekunder: JSON.stringify([]),
                prosedur_primer: JSON.stringify(selectedProcedures || []),
                prosedur_sekunder: JSON.stringify([]),
                
                // Terapi
                terapi_medis: pasien.hasil_konsultasi || '',
                obat_pulang: JSON.stringify(resepPulang || []),
                
                // Discharge
                kondisi_keluar: pasien.keadaan_keluar || '',
                cara_keluar: pasien.cara_keluar || '',
                keadaan_umum: pasien.tanda_vital_keadaan_umum || '',
                kesadaran: pasien.tanda_vital_kesadaran || '',
                
                // Dokter
                dokter_penanggung_jawab: pasien.dokter || '',
                tanggal_masuk: pasien.tanggal_masuk || null,
                tanggal_keluar: pasien.tanggal_keluar || null,
                jam_masuk: null,
                jam_keluar: null,
            };

            router.post(`/eklaim/ugd/resume-medis`, dataToSend, {
                onSuccess: () => {
                    toast.success('Data Resume Medis UGD berhasil disimpan');
                    setLoading(null);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Gagal menyimpan data. Periksa form dan coba lagi.');
                    setLoading(null);
                },
                onFinish: () => {
                    setLoading(null);
                }
            });
        } catch (error) {
            console.error('Error saving Resume Medis UGD:', error);
            toast.error('Gagal menyimpan data Resume Medis UGD');
            setLoading(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Resume Medis - ${pengajuan.nomor_sep}`} />
            <div className="max-w-7xl p-4">
                <div className="mb-4 flex items-center justify-end gap-2">
                    <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadResumeMedis}>
                        {loading === 'load' ? <Loader className="mr-2 animate-spin" /> : <Download className="mr-2 text-blue-500" />}
                        Load
                    </Button>
                    <Button
                        variant="outline"
                        disabled={loading === 'simpan'}
                        onClick={handleSimpanResumeMedis}
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
                                    <h3 style={{ fontSize: 16 }}>RINGKASAN PULANG</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Data Pasien */}
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
                                    Tanggal Masuk : <br />
                                    <b>{formatTanggalIndoDateTime(pasien?.tanggal_masuk)}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Tanggal Keluar : <br />
                                    <b>{formatTanggalIndoDateTime(pasien?.tanggal_keluar)}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Lama Dirawat : <br />
                                    <b>{hitungLamaDirawat(pasien?.tanggal_masuk, pasien?.tanggal_keluar)}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Ruang Rawat Terakhir : <br />
                                    <b>{pasien?.ruangan || '-'}</b>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4} style={{ border: '1px solid #000', padding: '5px', width: '400px' }}>
                                    Penanggung Jawab : <br />
                                    <b>{pasien?.penanggung_jawab || '-'}</b>
                                </td>
                                <td colSpan={4} style={{ border: '1px solid #000', padding: '5px', width: '400px' }}>
                                    Indikasi Rawat Inap : <br />
                                    <b>{pasien?.indikasi_rawat_inap || '-'}</b>
                                </td>
                            </tr>

                            {/* Data Medis */}
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Ringkasan Riwayat Penyakit <span className="text-red-500"> * </span> :{' '}
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    Riwayat Penyakit Sekarang : <br />
                                    <textarea
                                        value={pasien?.riwayat_penyakit_sekarang || ''}
                                        onChange={(e) => handleInputChange(e, 'riwayat_penyakit_sekarang')}
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
                                            minHeight: '60px',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                    <br />
                                    Riwayat Penyakit Dahulu : <br />
                                    <textarea
                                        value={pasien?.riwayat_penyakit_dahulu || ''}
                                        onChange={(e) => handleInputChange(e, 'riwayat_penyakit_dahulu')}
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
                                            minHeight: '60px',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Pemeriksaan Fisik <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    <textarea
                                        value={pasien?.pemeriksaan_fisik || ''}
                                        onChange={(e) => handleInputChange(e, 'pemeriksaan_fisik')}
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
                                            minHeight: '60px',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Hasil Konsultasi <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    <textarea
                                        value={pasien?.hasil_konsultasi || ''}
                                        onChange={(e) => handleInputChange(e, 'hasil_konsultasi')}
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
                                            minHeight: '60px',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Diagnosa <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    {/* Field untuk menampilkan diagnosa yang dipilih */}
                                    <div
                                        className="mb-2 min-h-[30px] cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-2 transition-colors hover:border-blue-400"
                                        onClick={() => setDiagnosisModal(true)}
                                        style={{
                                            minHeight: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: selectedDiagnosa.length > 0 ? 'flex-start' : 'center',
                                        }}
                                    >
                                        {selectedDiagnosa.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedDiagnosa.map((diagnosis) => (
                                                    <Badge
                                                        key={diagnosis.code}
                                                        variant="secondary"
                                                        className="text-xs"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            margin: '2px',
                                                            padding: '4px 8px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {diagnosis.code}
                                                        <button
                                                            type="button"
                                                            className="ml-1 inline-flex h-3 w-3 cursor-pointer items-center justify-center hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleRemoveDiagnosis(diagnosis.code);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span
                                                style={{
                                                    fontStyle: 'italic',
                                                    color: '#666',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                }}
                                            >
                                                Klik untuk memilih diagnosis...
                                            </span>
                                        )}
                                    </div>

                                    {/* Modal Component */}
                                    <DiagnosisModal
                                        isOpen={diagnosisModal}
                                        onClose={() => setDiagnosisModal(false)}
                                        selectedDiagnosa={selectedDiagnosa}
                                        onSelectDiagnosis={handleSelectDiagnosis}
                                        onRemoveDiagnosis={handleRemoveDiagnosis}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Prosedur <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    {/* Field untuk menampilkan prosedur yang dipilih */}
                                    <div
                                        className="mb-2 min-h-[30px] cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-2 transition-colors hover:border-orange-400"
                                        onClick={() => setProcedureModal(true)}
                                        style={{
                                            minHeight: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: selectedProcedures.length > 0 ? 'flex-start' : 'center',
                                        }}
                                    >
                                        {selectedProcedures.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedProcedures.map((procedure) => (
                                                    <Badge
                                                        key={procedure.code}
                                                        variant="secondary"
                                                        className="text-xs"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            margin: '2px',
                                                            padding: '4px 8px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: '#f59e0b',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {procedure.code}
                                                        <button
                                                            type="button"
                                                            className="ml-1 inline-flex h-3 w-3 cursor-pointer items-center justify-center hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleRemoveProcedure(procedure.code);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span
                                                style={{
                                                    fontStyle: 'italic',
                                                    color: '#666',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                }}
                                            >
                                                Klik untuk memilih prosedur...
                                            </span>
                                        )}
                                    </div>

                                    {/* Modal Component */}
                                    <ProcedureModal
                                        isOpen={procedureModal}
                                        onClose={() => setProcedureModal(false)}
                                        selectedProcedures={selectedProcedures}
                                        onSelectProcedure={handleSelectProcedure}
                                        onRemoveProcedure={handleRemoveProcedure}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Tanda Vital <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            Keadaan Umum : <br />
                                            <input
                                                type="text"
                                                value={pasien?.tanda_vital_keadaan_umum || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_keadaan_umum: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Kesadaran : <br />
                                            <input
                                                type="text"
                                                value={pasien?.tanda_vital_kesadaran || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_kesadaran: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Eye : <br />
                                            <input
                                                type="text"
                                                value={pasien?.tanda_vital_eye || ''}
                                                onChange={(e) => setPasien((prev) => (prev ? { ...prev, tanda_vital_eye: e.target.value } : null))}
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Motorik : <br />
                                            <input
                                                type="text"
                                                value={pasien?.tanda_vital_motorik || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_motorik: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Verbal : <br />
                                            <input
                                                type="text"
                                                value={pasien?.tanda_vital_verbal || ''}
                                                onChange={(e) => setPasien((prev) => (prev ? { ...prev, tanda_vital_verbal: e.target.value } : null))}
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            GCS : <br />
                                            <input
                                                type="text"
                                                value={pasien?.tanda_vital_gcs || ''}
                                                onChange={(e) => setPasien((prev) => (prev ? { ...prev, tanda_vital_gcs: e.target.value } : null))}
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Tekanan Darah Sistolik (mmHg) : <br />
                                            <input
                                                type="number"
                                                value={pasien?.tanda_vital_sistolik || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_sistolik: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Tekanan Darah Distolik (mmHg) : <br />
                                            <input
                                                type="number"
                                                value={pasien?.tanda_vital_distolik || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_distolik: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Frekuensi Nadi (x/Menit) : <br />
                                            <input
                                                type="number"
                                                value={pasien?.tanda_vital_frekuensi_nadi || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_frekuensi_nadi: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Frekuensi Nafas (x/Menit) : <br />
                                            <input
                                                type="number"
                                                value={pasien?.tanda_vital_frekuensi_nafas || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_frekuensi_nafas: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Suhu (°C) : <br />
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={pasien?.tanda_vital_suhu || ''}
                                                onChange={(e) => setPasien((prev) => (prev ? { ...prev, tanda_vital_suhu: e.target.value } : null))}
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                        <div>
                                            Saturasi O2 (%) : <br />
                                            <input
                                                type="number"
                                                value={pasien?.tanda_vital_saturasi_o2 || ''}
                                                onChange={(e) =>
                                                    setPasien((prev) => (prev ? { ...prev, tanda_vital_saturasi_o2: e.target.value } : null))
                                                }
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                    padding: '2px 0',
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Kondisi dan Keadaan Keluar <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    <div>
                                        Cara Keluar : <br />
                                        <input
                                            type="text"
                                            value={pasien?.cara_keluar || ''}
                                            onChange={(e) => setPasien((prev) => (prev ? { ...prev, cara_keluar: e.target.value } : null))}
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                fontFamily: 'halvetica, sans-serif',
                                                padding: '2px 0',
                                                minHeight: '20px',
                                            }}
                                            placeholder="-"
                                        />
                                    </div>
                                    <div>
                                        Keadaan Keluar : <br />
                                        <input
                                            type="text"
                                            value={pasien?.keadaan_keluar || ''}
                                            onChange={(e) => setPasien((prev) => (prev ? { ...prev, keadaan_keluar: e.target.value } : null))}
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                fontFamily: 'halvetica, sans-serif',
                                                padding: '2px 0',
                                                minHeight: '20px',
                                            }}
                                            placeholder="-"
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Resep Pulang <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    {/* Modal trigger untuk memilih obat */}
                                    <div
                                        className="mb-2 min-h-[30px] cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-2 transition-colors hover:border-green-400"
                                        onClick={() => setObatModal(true)}
                                        style={{
                                            minHeight: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: resepPulang.length > 0 ? 'flex-start' : 'center',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        {resepPulang.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {resepPulang.map((resep) => (
                                                    <Badge
                                                        key={resep.id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            margin: '2px',
                                                            padding: '4px 8px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {resep.nama_obat}
                                                        <X
                                                            className="ml-1 h-3 w-3 cursor-pointer hover:text-red-200"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveObat(resep.id);
                                                            }}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span
                                                style={{
                                                    fontStyle: 'italic',
                                                    color: '#666',
                                                    fontSize: '16px',
                                                    fontFamily: 'halvetica, sans-serif',
                                                }}
                                            >
                                                Klik untuk memilih obat...
                                            </span>
                                        )}
                                    </div>

                                    {/* Modal Component */}
                                    <ObatModal
                                        isOpen={obatModal}
                                        onClose={() => setObatModal(false)}
                                        obatList={obat}
                                        selectedResep={resepPulang}
                                        onSelectObat={handleSelectObat}
                                        onRemoveObat={handleRemoveObat}
                                        onUpdateResep={handleUpdateResep}
                                    />

                                    {/* Display resep pulang */}
                                    {resepPulang.length > 0 ? (
                                        <div>
                                            {resepPulang.map((resep, index) => (
                                                <div
                                                    key={resep.id}
                                                    style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                                        {index + 1}. {resep.nama_obat}
                                                    </div>
                                                    <div style={{ fontSize: '12px', marginLeft: '15px' }}>
                                                        Frekuensi : {resep.frekuensi} | Jumlah: {resep.jumlah} | Cara Pemberian :{' '}
                                                        {resep.cara_pemberian}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                fontStyle: 'italic',
                                                color: '#666',
                                                fontSize: '16px',
                                                fontFamily: 'halvetica, sans-serif',
                                            }}
                                        >
                                            Tidak ada resep pulang
                                        </div>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    <p>
                                        Intruksi Tidak Lanjut <span className="text-red-500"> * </span> :
                                    </p>
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px' }}>
                                    Tanggal : <b>{formatTanggalIndo(pasien?.jadwal_kontrol_tanggal) || '-'}</b> <br />
                                    Jam : <b>{pasien?.jadwal_kontrol_jam || '-'}</b> <br />
                                    Tujuan : <b>{pasien?.jadwal_kontrol_tujuan || '-'}</b> <br />
                                    Nomor BPJS : <b>{pasien?.jadwal_kontrol_nomor_bpjs || '-'}</b> <br />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex grid-cols-2 justify-between">
                        <div className="p-4">
                            <h3 className="text-center font-bold">Pasien/Keluarga</h3>
                            <div className="h-20"></div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold">Dokter Penanggung Jawab</h3>
                            <p>
                                <b>Bojonegoro</b>, {formatTanggalIndo(pasien?.tanggal_keluar) || '-'}
                            </p>
                            <div className="h-20"></div>
                            <p><b>{pasien?.dokter || '-'}</b></p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
