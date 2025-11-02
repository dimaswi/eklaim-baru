import DiagnosisModal from '@/components/eklaim/DiagnosisModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Loader, Save, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Diagnosa {
    name: string;
    code: string;
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
    savedData?: any;
}

export default function PengkajianAwalUGD() {
    const { pengajuan, kunjungan, kop, savedData } = usePage<Props>().props;
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
            title: `Pengkajian Awal ${pengajuan.nomor_sep}`,
            href: `#`,
        },
    ];

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
        
        try {
            let dateStr = datetime;
            
            // Handle ISO format (with 'T' separator)
            if (dateStr.includes('T')) {
                const isoDate = new Date(dateStr);
                if (!isNaN(isoDate.getTime())) {
                    const year = isoDate.getFullYear();
                    const month = String(isoDate.getMonth() + 1).padStart(2, '0');
                    const day = String(isoDate.getDate()).padStart(2, '0');
                    const hours = String(isoDate.getHours()).padStart(2, '0');
                    const minutes = String(isoDate.getMinutes()).padStart(2, '0');
                    dateStr = `${year}-${month}-${day} ${hours}:${minutes}:00`;
                }
            }
            
            // Handle standard datetime format (YYYY-MM-DD HH:mm:ss) or date only (YYYY-MM-DD)
            const [tanggal, waktu] = dateStr.split(' ');
            const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            
            if (tanggal) {
                const [tahun, bulan, hari] = tanggal.split('-');
                if (tahun && bulan && hari) {
                    const formattedDate = `${parseInt(hari)} ${bulanIndo[parseInt(bulan) - 1]} ${tahun}`;
                    
                    if (waktu) {
                        const [jam, menit] = waktu.split(':');
                        return `${formattedDate} ${jam}:${menit}`;
                    } else {
                        return formattedDate;
                    }
                }
            }
            
            return datetime;
        } catch (error) {
            console.error('Error formatting datetime:', error, datetime);
            return datetime || '-';
        }
    }

    const [pasien, setPasien] = useState<{
        nama?: string;
        norm?: string;
        tanggal_lahir?: string;
        jenis_kelamin?: string | number;
        tanggal_masuk?: string;
        tanggal_keluar?: string;
        alamat?: string;
        ruangan?: string;
        autoanamnesis?: string;
        alloanamnesis?: string;
        anamnesis_dari?: string;
        keluhan_utama?: string;
        riwayat_penyakit_sekarang?: string;
        riwayat_penyakit_dahulu?: string;
        faktor_resiko?: string;
        //Tanda Vital
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
        // Pemeriksaan Fisik fields
        mata?: string;
        pupil?: string;
        ikterus?: string;
        diameter_pupil?: string;
        udem_palpebrae?: string;
        tht?: string;
        faring?: string;
        tongsil?: string;
        lidah?: string;
        bibir?: string;
        leher?: string;
        jvp?: string;
        limfe?: string;
        kaku_kuduk?: string;
        thoraks?: string;
        cor?: string;
        s1s2?: string;
        mur_mur?: string;
        pulmo?: string;
        ronchi?: string;
        wheezing?: string;
        peristaltik?: string;
        abdomen?: string;
        meteorismus?: string;
        asites?: string;
        nyeri_tekan?: string;
        hepar?: string;
        lien?: string;
        extremitas?: string;
        udem?: string;
        defeksesi?: string;
        urin?: string;
        kelainan?: string;
        lainnya?: string;
        // Riwayat Alergi
        riwayat_alergi?: string;
        // Hubungan Status Psikososial Spiritual
        status_psikologi_tidak_ada_kelainan?: boolean;
        status_psikologi_cemas?: boolean;
        status_psikologi_takut?: boolean;
        status_psikologi_marah?: boolean;
        status_psikologi_sedih?: boolean;
        status_psikologi_kecenderungan_bunuh_diri?: boolean;
        status_psikologi_lainnya?: boolean;
        status_psikologi_lainnya_text?: string;
        status_mental_sadar_orientasi_baik?: boolean;
        status_mental_ada_masalah_perilaku?: boolean;
        status_mental_perilaku_kekerasan?: string;
        hubungan_keluarga_baik?: boolean;
        hubungan_keluarga_tidak_baik?: boolean;
        tempat_tinggal_rumah?: boolean;
        tempat_tinggal_panti?: boolean;
        tempat_tinggal_lainnya?: boolean;
        tempat_tinggal_lainnya_text?: string;
        spiritual_agama_islam?: boolean;
        spiritual_agama_katolik?: boolean;
        spiritual_agama_protestan?: boolean;
        spiritual_agama_hindu?: boolean;
        spiritual_agama_budha?: boolean;
        spiritual_agama_konghucu?: boolean;
        spiritual_agama_lain_lain?: boolean;
        spiritual_kebiasaan_berbadah_teratur_ya?: boolean;
        spiritual_kebiasaan_berbadah_teratur_tidak?: boolean;
        spiritual_nilai_kepercayaan_tidak_ada?: boolean;
        spiritual_nilai_kepercayaan_ada?: boolean;
        pengambilan_keputusan_keluarga?: boolean;
        ekonomi_pekerjaan_asn?: boolean;
        ekonomi_pekerjaan_wiraswasta?: boolean;
        ekonomi_pekerjaan_tni_polri?: boolean;
        ekonomi_pekerjaan_lain_lain?: boolean;
        ekonomi_pekerjaan_lain_lain_text?: string;
        ekonomi_penghasilan_kurang_5jt?: boolean;
        ekonomi_penghasilan_5_10jt?: boolean;
        ekonomi_penghasilan_lebih_10jt?: boolean;
        // Nyeri
        nyeri?: string;
        onset?: string;
        pencetus?: string;
        lokasi_nyeri?: string;
        gambaran_nyeri?: string;
        durasi_nyeri?: string;
        skala_nyeri?: string;
        metode_nyeri?: string;
        // Edukasi
        edukasi_hak_berpartisipasi?: boolean;
        edukasi_prosedure_penunjang?: boolean;
        edukasi_diagnosa?: boolean;
        edukasi_pemberian_informed_consent?: boolean;
        edukasi_penundaan_pelayanan?: boolean;
        edukasi_kelambatan_pelayanan?: boolean;
        edukasi_cuci_tangan?: boolean;
        edukasi_obat?: boolean;
        edukasi_bahaya_merokok?: boolean;
        edukasi_rujukan_pasien?: boolean;
        edukasi_nutrisi?: boolean;
        edukasi_rehab_medik?: boolean;
        edukasi_nyeri?: boolean;
        edukasi_perencanaan_pulang?: boolean;
        edukasi_penggunaan_alat?: boolean;
        //
        masalah_medis?: string;
        diagnosis_medis?: string;
        rencana_terapi?: string;
        
        // Dokter dan Petugas
        dokter?: string;
        petugas?: string;
    } | null>(null);

    const [selectedDiagnosa, setSelectedDiagnosa] = useState<Diagnosa[]>([]);
    const [diagnosisModal, setDiagnosisModal] = useState(false);
    const [anamnesisType, setAnamnesisType] = useState<'auto' | 'allo' | null>(null);
    const [faktorResikoText, setFaktorResikoText] = useState<string>('-');
    const [riwayatPenyakitKeluargaText, setRiwayatPenyakitKeluargaText] = useState<string>('-');
    // Load saved data when component mounts
    useEffect(() => {
        if (savedData) {
            // Expand JSON fields ke individual checkbox fields
            const expandedData = { ...savedData };
            
            // Expand status_psikologi JSON
            if (savedData.status_psikologi && typeof savedData.status_psikologi === 'object') {
                Object.assign(expandedData, savedData.status_psikologi);
            }
            
            // Expand status_mental_hubungan JSON
            if (savedData.status_mental_hubungan && typeof savedData.status_mental_hubungan === 'object') {
                Object.assign(expandedData, savedData.status_mental_hubungan);
            }
            
            // Expand tempat_tinggal JSON
            if (savedData.tempat_tinggal && typeof savedData.tempat_tinggal === 'object') {
                Object.assign(expandedData, savedData.tempat_tinggal);
            }
            
            // Expand spiritual JSON
            if (savedData.spiritual && typeof savedData.spiritual === 'object') {
                Object.assign(expandedData, savedData.spiritual);
            }
            
            // Expand ekonomi JSON
            if (savedData.ekonomi && typeof savedData.ekonomi === 'object') {
                Object.assign(expandedData, savedData.ekonomi);
            }
            
            // Expand edukasi JSON
            if (savedData.edukasi && typeof savedData.edukasi === 'object') {
                Object.assign(expandedData, savedData.edukasi);
            }
            
            setPasien(expandedData);

            if (savedData.autoanamnesis === '1') {
                setAnamnesisType('auto');
            } else if (savedData.alloanamnesis === '1') {
                setAnamnesisType('allo');
            }

            if (savedData.faktor_resiko) {
                setFaktorResikoText(savedData.faktor_resiko);
            }

            if (savedData.riwayat_penyakit_keluarga) {
                setRiwayatPenyakitKeluargaText(savedData.riwayat_penyakit_keluarga);
            }

            // Handle selected diagnosa from saved data
            if (savedData.selected_diagnosa) {
                try {
                    let parsedDiagnosa;

                    // Check if it's already an object/array or a JSON string
                    if (typeof savedData.selected_diagnosa === 'string') {
                        parsedDiagnosa = JSON.parse(savedData.selected_diagnosa);
                    } else {
                        parsedDiagnosa = savedData.selected_diagnosa;
                    }

                    if (Array.isArray(parsedDiagnosa)) {
                        setSelectedDiagnosa(parsedDiagnosa);
                    }
                } catch (error) {
                    console.error('Error parsing selected_diagnosa:', error);
                }
            }
        }
    }, [savedData]);

    const handleAnamnesisChange = (type: 'auto' | 'allo', checked: boolean) => {
        if (checked) {
            setAnamnesisType(type);
            // Update pasien state dengan nilai string yang sesuai
            if (pasien) {
                setPasien({
                    ...pasien,
                    autoanamnesis: type === 'auto' ? '1' : '0',
                    alloanamnesis: type === 'allo' ? '1' : '0',
                });
            }
        } else {
            setAnamnesisType(null);
            // Reset kedua field jika uncheck
            if (pasien) {
                setPasien({
                    ...pasien,
                    autoanamnesis: '0',
                    alloanamnesis: '0',
                });
            }
        }
    };

    const handleLoadPengkajianAwal = async () => {
        setLoading('load');
        try {
            const response = await fetch(`/eklaim/ugd/pengkajian-awal/${kunjungan.NOMOR}`);
            const data = await response.json();

            const autoAnamnesis = data.kunjungan?.anamnesis_diperoleh.AUTOANAMNESIS;
            const alloAnamnesis = data.kunjungan?.anamnesis_diperoleh.ALLOANAMNESIS;

            const isAutoTrue = autoAnamnesis === '1' || autoAnamnesis === 1 || autoAnamnesis === true || autoAnamnesis === 'true';
            const isAlloTrue = alloAnamnesis === '1' || alloAnamnesis === 1 || alloAnamnesis === true || alloAnamnesis === 'true';

            if (isAutoTrue && !isAlloTrue) {
                setAnamnesisType('auto');
            } else if (isAlloTrue && !isAutoTrue) {
                setAnamnesisType('allo');
            } else if (isAutoTrue && isAlloTrue) {
                setAnamnesisType('auto');
            } else {
                setAnamnesisType(null);
            }

            // Ekstrak faktor resiko yang bernilai 1
            const faktorResiko = data.kunjungan?.faktor_resiko || {};
            const aktiveFaktorResiko: string[] = [];

            // Mapping nama field ke nama yang lebih readable
            const faktorResikoMap: Record<string, string> = {
                HIPERTENSI: 'Hipertensi',
                DIABETES_MELITUS: 'Diabetes Melitus',
                PENYAKIT_JANTUNG: 'Penyakit Jantung',
                ASMA: 'Asma',
                STROKE: 'Stroke',
                LIVER: 'Liver',
                GINJAL: 'Ginjal',
                PENYAKIT_KEGANASAN_DAN_HIV: 'Penyakit Keganasan dan HIV',
                DISLIPIDEMIA: 'Dislipidemia',
                GAGAL_JANTUNG: 'Gagal Jantung',
                SERANGAN_JANTUNG: 'Serangan Jantung',
                TUBERCULOSIS_PARU: 'Tuberculosis Paru',
                ROKOK: 'Rokok',
                MINUM_ALKOHOL: 'Minum Alkohol',
                MINUMAN_ALKOHOL: 'Minuman Alkohol',
                MEROKOK: 'Merokok',
                BEGADANG: 'Begadang',
                SEKS_BEBAS: 'Seks Bebas',
                NAPZA_TANPA_RESEP_DOKTER: 'NAPZA Tanpa Resep Dokter',
                MAKAN_MANIS_BERLEBIHAN: 'Makan Manis Berlebihan',
                PERILAKU_LGBTI: 'Perilaku LGBTI',
            };

            // Loop untuk mencari faktor resiko yang bernilai 1
            Object.keys(faktorResiko).forEach((key) => {
                // Skip non-medical fields - expanded list
                if (
                    key === 'status' ||
                    key === 'id' ||
                    key === 'created_at' ||
                    key === 'updated_at' ||
                    key === 'kunjungan_id' ||
                    key === 'nomor_kunjungan' ||
                    key.toLowerCase().includes('status')
                ) {
                    return;
                }

                const value = faktorResiko[key];

                if (value === 1 || value === '1' || value === true || value === 'true') {
                    const readableName = faktorResikoMap[key] || key.replace(/_/g, ' ').toLowerCase();
                    aktiveFaktorResiko.push(readableName);
                }
            });

            const faktorResikoText = aktiveFaktorResiko.length > 0 ? aktiveFaktorResiko.join(', ') : 'Tidak ada faktor resiko yang teridentifikasi';

            setFaktorResikoText(faktorResikoText);

            // Ekstrak riwayat penyakit keluarga yang bernilai 1
            const riwayatPenyakitKeluarga = data.kunjungan?.riwayat_penyakit_keluarga || {};
            const aktiveRiwayatKeluarga: string[] = [];

            // Debug: Log the riwayat penyakit keluarga data

            // Mapping nama field ke nama yang lebih readable untuk riwayat penyakit keluarga
            const riwayatKeluargaMap: Record<string, string> = {
                HIPERTENSI: 'Hipertensi',
                DIABETES_MELITUS: 'Diabetes Melitus',
                PENYAKIT_JANTUNG: 'Penyakit Jantung',
                ASMA: 'Asma',
                STROKE: 'Stroke',
                LIVER: 'Liver',
                GINJAL: 'Ginjal',
                PENYAKIT_KEGANASAN_DAN_HIV: 'Penyakit Keganasan dan HIV',
                DISLIPIDEMIA: 'Dislipidemia',
                GAGAL_JANTUNG: 'Gagal Jantung',
                SERANGAN_JANTUNG: 'Serangan Jantung',
                TUBERCULOSIS_PARU: 'Tuberculosis Paru',
            };

            // Loop untuk mencari riwayat penyakit keluarga yang bernilai 1
            Object.keys(riwayatPenyakitKeluarga).forEach((key) => {
                // Skip non-medical fields
                if (
                    key === 'status' ||
                    key === 'id' ||
                    key === 'created_at' ||
                    key === 'updated_at' ||
                    key === 'kunjungan_id' ||
                    key === 'nomor_kunjungan' ||
                    key.toLowerCase().includes('status')
                ) {
                    return;
                }

                const value = riwayatPenyakitKeluarga[key];

                // Khusus untuk field LAINNYA, ambil value yang terisi
                if (key === 'LAINNYA' && value && value !== '' && value !== '0' && value !== 'null') {
                    aktiveRiwayatKeluarga.push(value);
                }
                // Untuk field lainnya yang bernilai 1
                else if (key !== 'LAINNYA' && (value === 1 || value === '1' || value === true || value === 'true')) {
                    const readableName = riwayatKeluargaMap[key] || key.replace(/_/g, ' ').toLowerCase();
                    aktiveRiwayatKeluarga.push(readableName);
                }
            });

            const riwayatPenyakitKeluargaText =
                aktiveRiwayatKeluarga.length > 0 ? aktiveRiwayatKeluarga.join(', ') : 'Tidak ada riwayat penyakit keluarga yang teridentifikasi';

            setRiwayatPenyakitKeluargaText(riwayatPenyakitKeluargaText);

            setPasien({
                nama: data.pasien?.NAMA || 'Tidak ada',
                norm: String(data.pasien?.NORM || 'Tidak ada'),
                tanggal_lahir: data.pasien?.TANGGAL_LAHIR || '',
                jenis_kelamin: String(data.pasien?.JENIS_KELAMIN || ''),
                tanggal_masuk: data.kunjungan?.MASUK || '',
                tanggal_keluar: data.kunjungan?.KELUAR || '',
                alamat: data.pasien?.ALAMAT || 'Tidak ada',
                ruangan: data.kunjungan?.ruangan?.DESKRIPSI || 'Tidak ada',
                autoanamnesis: isAutoTrue ? '1' : '0',
                alloanamnesis: isAlloTrue ? '1' : '0',
                anamnesis_dari: data.kunjungan?.anamnesis_diperoleh.DARI || 'Tidak ada',
                keluhan_utama: data.kunjungan?.keluhan_utama.DESKRIPSI || 'Tidak ada',
                riwayat_penyakit_sekarang: data.kunjungan?.anamnesis.DESKRIPSI || 'Tidak ada',
                tanda_vital_keadaan_umum: data.kunjungan?.tanda_vital?.KEADAAN_UMUM || 'Tidak ada',
                tanda_vital_kesadaran: data.kunjungan?.tanda_vital?.KESADARAN || 'Tidak ada',
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
                // Default values for new fields
                mata: 'Tidak ada',
                pupil: 'Tidak ada',
                ikterus: 'Tidak ada',
                diameter_pupil: 'Tidak ada',
                udem_palpebrae: 'Tidak ada',
                tht: 'Tidak ada',
                faring: 'Tidak ada',
                tongsil: 'Tidak ada',
                lidah: 'Tidak ada',
                bibir: 'Tidak ada',
                leher: 'Tidak ada',
                jvp: 'Tidak ada',
                limfe: 'Tidak ada',
                kaku_kuduk: 'Tidak ada',
                thoraks: 'Tidak ada',
                cor: 'Tidak ada',
                s1s2: 'Tidak ada',
                mur_mur: 'Tidak ada',
                pulmo: 'Tidak ada',
                ronchi: 'Tidak ada',
                wheezing: 'Tidak ada',
                peristaltik: 'Tidak ada',
                abdomen: 'Tidak ada',
                meteorismus: 'Tidak ada',
                asites: 'Tidak ada',
                nyeri_tekan: 'Tidak ada',
                hepar: 'Tidak ada',
                lien: 'Tidak ada',
                extremitas: 'Tidak ada',
                udem: 'Tidak ada',
                defeksesi: 'Tidak ada',
                urin: 'Tidak ada',
                kelainan: 'Tidak ada',
                lainnya: 'Tidak ada',
                // Riwayat Alergi
                riwayat_alergi: data.kunjungan?.riwayat_alergi?.DESKRIPSI || 'Tidak ada',
                // Hubungan Status Psikososial Spiritual
                status_psikologi_tidak_ada_kelainan: false,
                status_psikologi_cemas: false,
                status_psikologi_takut: false,
                status_psikologi_marah: false,
                status_psikologi_sedih: false,
                status_psikologi_kecenderungan_bunuh_diri: false,
                status_psikologi_lainnya: false,
                status_psikologi_lainnya_text: '',
                status_mental_sadar_orientasi_baik: false,
                status_mental_ada_masalah_perilaku: false,
                status_mental_perilaku_kekerasan: '',
                hubungan_keluarga_baik: false,
                hubungan_keluarga_tidak_baik: false,
                tempat_tinggal_rumah: false,
                tempat_tinggal_panti: false,
                tempat_tinggal_lainnya: false,
                tempat_tinggal_lainnya_text: '',
                spiritual_agama_islam: false,
                spiritual_agama_katolik: false,
                spiritual_agama_protestan: false,
                spiritual_agama_hindu: false,
                spiritual_agama_budha: false,
                spiritual_agama_konghucu: false,
                spiritual_agama_lain_lain: false,
                spiritual_kebiasaan_berbadah_teratur_ya: false,
                spiritual_kebiasaan_berbadah_teratur_tidak: false,
                spiritual_nilai_kepercayaan_tidak_ada: false,
                spiritual_nilai_kepercayaan_ada: false,
                pengambilan_keputusan_keluarga: false,
                ekonomi_pekerjaan_asn: false,
                ekonomi_pekerjaan_wiraswasta: false,
                ekonomi_pekerjaan_tni_polri: false,
                ekonomi_pekerjaan_lain_lain: false,
                ekonomi_pekerjaan_lain_lain_text: '',
                ekonomi_penghasilan_kurang_5jt: false,
                ekonomi_penghasilan_5_10jt: false,
                ekonomi_penghasilan_lebih_10jt: false,
                //Nyeri
                nyeri: data.kunjungan?.penilaian_nyeri?.NYERI == 1 ? 'Ya' : 'Tidak',
                onset: data.kunjungan?.penilaian_nyeri?.ONSET == 1 ? 'Nyeri' : 'Akut',
                pencetus: data.kunjungan?.penilaian_nyeri?.PENCETUS || '',
                lokasi_nyeri: data.kunjungan?.penilaian_nyeri?.LOKASI || '',
                gambaran_nyeri: data.kunjungan?.penilaian_nyeri?.GAMBARAN || '',
                durasi_nyeri: data.kunjungan?.penilaian_nyeri?.DURASI || '',
                skala_nyeri: data.kunjungan?.penilaian_nyeri?.SKALA || '',
                metode_nyeri: data.kunjungan?.penilaian_nyeri?.metode?.DESKIRPSI || '',
                // Edukasi
                edukasi_hak_berpartisipasi: data.kunjungan?.edukasi_pasien?.EDUKASI_HAK_BERPARTISIPASI || false,
                edukasi_prosedure_penunjang: data.kunjungan?.edukasi_pasien?.EDUKASI_PROSEDURE_PENUNJANG || false,
                edukasi_diagnosa: data.kunjungan?.edukasi_pasien?.EDUKASI_DIAGNOSA || false,
                edukasi_pemberian_informed_consent: data.kunjungan?.edukasi_pasien?.EDUKASI_PEMBERIAN_INFORMED_CONSENT || false,
                edukasi_penundaan_pelayanan: data.kunjungan?.edukasi_pasien?.EDUKASI_PENUNDAAN_PELAYANAN || false,
                edukasi_kelambatan_pelayanan: data.kunjungan?.edukasi_pasien?.EDUKASI_KELAMBATAN_PELAYANAN || false,
                edukasi_cuci_tangan: data.kunjungan?.edukasi_pasien?.EDUKASI_CUCI_TANGAN || false,
                edukasi_obat: data.kunjungan?.edukasi_pasien?.EDUKASI_OBAT || false,
                edukasi_bahaya_merokok: data.kunjungan?.edukasi_pasien?.EDUKASI_BAHAYA_MEROKO || false,
                edukasi_rujukan_pasien: data.kunjungan?.edukasi_pasien?.EDUKASI_RUJUKAN_PASIEN || false,
                edukasi_nutrisi: data.kunjungan?.edukasi_pasien?.EDUKASI_NUTRISI || false,
                edukasi_rehab_medik: data.kunjungan?.edukasi_pasien?.EDUKASI_REHAB_MEDIK || false,
                edukasi_nyeri: data.kunjungan?.edukasi_pasien?.EDUKASI_NYERI || false,
                edukasi_perencanaan_pulang: data.kunjungan?.edukasi_pasien?.EDUKASI_PERENCANAAN_PULANG || false,
                edukasi_penggunaan_alat: data.kunjungan?.edukasi_pasien?.EDUKASI_PENGGUNAAN_ALAT || false,
                //
                masalah_medis: data.kunjungan?.anamnesis?.DESKRIPSI || 'Tidak ada',
                rencana_terapi: data.kunjungan?.rencana_terapi?.DESKRIPSI || 'Tidak ada',
                
                // Dokter dan Petugas
                dokter: data.kunjungan?.dokter?.pegawai?.NAMA || '',
                petugas: '',
                
                diagnosis_medis: (() => {
                    const diagnosa = data.kunjungan?.diagnosa;
                    if (Array.isArray(diagnosa)) {
                        return (
                            diagnosa
                                .map((item) => {
                                    if (typeof item === 'string') return item;
                                    if (typeof item === 'object' && item?.KODE) return item.KODE;
                                    if (typeof item === 'object' && item?.kode) return item.kode;
                                    if (typeof item === 'object' && item?.DESKRIPSI) return item.DESKRIPSI;
                                    if (typeof item === 'object' && item?.deskripsi) return item.deskripsi;
                                    return String(item);
                                })
                                .filter(Boolean)
                                .join(', ') || 'Tidak ada'
                        );
                    }
                    if (typeof diagnosa === 'object' && diagnosa?.KODE) return diagnosa.KODE;
                    if (typeof diagnosa === 'object' && diagnosa?.kode) return diagnosa.kode;
                    if (typeof diagnosa === 'object' && diagnosa?.DESKRIPSI) return diagnosa.DESKRIPSI;
                    if (typeof diagnosa === 'object' && diagnosa?.deskripsi) return diagnosa.deskripsi;
                    if (typeof diagnosa === 'string') return diagnosa;
                    return 'Tidak ada';
                })(),
            });

            // Set selectedDiagnosa dari data yang dimuat
            const diagnosa = data.kunjungan?.diagnosa;
            const loadedDiagnosa: Diagnosa[] = [];

            if (Array.isArray(diagnosa)) {
                diagnosa.forEach((item) => {
                    if (typeof item === 'object' && (item?.KODE || item?.kode)) {
                        loadedDiagnosa.push({
                            code: item.KODE || item.kode,
                            name: item.DESKRIPSI || item.deskripsi || item.KODE || item.kode,
                        });
                    } else if (typeof item === 'string') {
                        loadedDiagnosa.push({
                            code: item,
                            name: item,
                        });
                    }
                });
            } else if (typeof diagnosa === 'object' && (diagnosa?.KODE || diagnosa?.kode)) {
                loadedDiagnosa.push({
                    code: diagnosa.KODE || diagnosa.kode,
                    name: diagnosa.DESKRIPSI || diagnosa.deskripsi || diagnosa.KODE || diagnosa.kode,
                });
            } else if (typeof diagnosa === 'string' && diagnosa !== 'Tidak ada') {
                loadedDiagnosa.push({
                    code: diagnosa,
                    name: diagnosa,
                });
            }

            setSelectedDiagnosa(loadedDiagnosa);

            toast.success('Data Pengkajian Awal berhasil dimuat');
        } catch (error) {
            setLoading(null);
            console.error('Error loading Pengkajian Awal:', error);
            toast.error('Gagal memuat data Pengkajian Awal');
        } finally {
            setLoading(null);
        }
    };

    const handleResetPengkajianAwal = async () => {
        setLoading('hapus');
        try {
            setPasien(null);
            setSelectedDiagnosa([]); // Reset selectedDiagnosa
            setAnamnesisType(null);
            setFaktorResikoText('Tidak ada faktor resiko yang teridentifikasi');
            setRiwayatPenyakitKeluargaText('Tidak ada riwayat penyakit keluarga yang teridentifikasi');
            toast.success('Data Pengkajian Awal berhasil direset');
        } catch (error) {
            toast.error('Gagal mereset data Pengkajian Awal');
            setLoading(null);
        } finally {
            setLoading(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
        if (pasien) {
            setPasien({
                ...pasien,
                [field]: e.target.value,
            });
        }
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        if (pasien) {
            setPasien({
                ...pasien,
                [field]: checked,
            });
        }
    };

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (pasien) {
            setPasien({
                ...pasien,
                [field]: e.target.value,
            });
        }
    };

    // Handler untuk diagnosis modal
    const handleSelectDiagnosis = (diagnosis: Diagnosa) => {
        const isAlreadySelected = selectedDiagnosa.some((d) => d.code === diagnosis.code);
        if (!isAlreadySelected) {
            setSelectedDiagnosa([...selectedDiagnosa, diagnosis]);
        }
    };

    const handleRemoveDiagnosis = (code: string) => {
        setSelectedDiagnosa((prev) => prev.filter((d) => d.code !== code));
    };

    const handleSimpanPengkajianAwal = async () => {
        setLoading('simpan');

        if (!pasien) {
            toast.error('Tidak ada data pasien untuk disimpan');
            setLoading(null);
            return;
        }

        try {
            const dataToSend = {
                pengajuan_klaim_id: pengajuan.id,
                kunjungan_nomor: kunjungan.NOMOR,
                ...pasien,
                // Explicit string conversion untuk field yang required sebagai string
                norm: String(pasien.norm || ''),
                jenis_kelamin: String(pasien.jenis_kelamin || ''),
                nama: String(pasien.nama || ''),
                autoanamnesis: String(pasien.autoanamnesis || ''),
                alloanamnesis: String(pasien.alloanamnesis || ''),
                anamnesis_dari: String(pasien.anamnesis_dari || ''),
                // Format tanggal dengan benar atau null jika kosong atau invalid
                tanggal_lahir:
                    pasien.tanggal_lahir && pasien.tanggal_lahir !== 'Tidak ada' && pasien.tanggal_lahir !== '' ? pasien.tanggal_lahir : null,
                tanggal_masuk:
                    pasien.tanggal_masuk && pasien.tanggal_masuk !== 'Tidak ada' && pasien.tanggal_masuk !== '' ? pasien.tanggal_masuk : null,
                tanggal_keluar:
                    pasien.tanggal_keluar && pasien.tanggal_keluar !== 'Tidak ada' && pasien.tanggal_keluar !== '' ? pasien.tanggal_keluar : null,
                selected_diagnosa: JSON.stringify(selectedDiagnosa),
            };

            router.post(`/eklaim/rawat-inap/pengkajian-awal`, dataToSend, {
                onSuccess: () => {
                    toast.success('Data Pengkajian Awal Rawat Inap berhasil disimpan');
                    setLoading(null);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Gagal menyimpan data. Periksa form dan coba lagi.');
                    setLoading(null);
                },
                onFinish: () => {
                    setLoading(null);
                },
            });
        } catch (error) {
            console.error('Error saving Pengkajian Awal:', error);
            toast.error('Gagal menyimpan data Pengkajian Awal');
            setLoading(null);
        }
    };

    // Handler untuk checkbox yang saling eksklusif dalam grup
    const handleExclusiveCheckboxChange = (field: string, checked: boolean, group: string[]) => {
        if (!pasien) {
            // Jika pasien null, buat objek pasien baru dengan nilai default
            const newPasien: any = {
                nama: '',
                norm: '',
                tanggal_lahir: '',
                jenis_kelamin: '',
                tanggal_masuk: '',
                tanggal_keluar: '',
                alamat: '',
                ruangan: '',
                autoanamnesis: '',
                alloanamnesis: '',
                anamnesis_dari: '',
                keluhan_utama: '',
                riwayat_penyakit_sekarang: '',
                riwayat_penyakit_dahulu: '',
                faktor_resiko: '',
                tanda_vital_keadaan_umum: '',
                tanda_vital_kesadaran: '',
                tanda_vital_sistolik: '',
                tanda_vital_distolik: '',
                tanda_vital_frekuensi_nadi: '',
                tanda_vital_frekuensi_nafas: '',
                tanda_vital_suhu: '',
                tanda_vital_saturasi_o2: '',
                tanda_vital_eye: '',
                tanda_vital_motorik: '',
                tanda_vital_verbal: '',
                tanda_vital_gcs: '',
                mata: '',
                pupil: '',
                ikterus: '',
                diameter_pupil: '',
                udem_palpebrae: '',
                tht: '',
                faring: '',
                tongsil: '',
                lidah: '',
                bibir: '',
                leher: '',
                jvp: '',
                limfe: '',
                kaku_kuduk: '',
                thoraks: '',
                cor: '',
                s1s2: '',
                mur_mur: '',
                pulmo: '',
                ronchi: '',
                wheezing: '',
                peristaltik: '',
                abdomen: '',
                meteorismus: '',
                asites: '',
                nyeri_tekan: '',
                hepar: '',
                lien: '',
                extremitas: '',
                udem: '',
                defeksesi: '',
                urin: '',
                kelainan: '',
                lainnya: '',
                riwayat_alergi: '',
                status_psikologi_tidak_ada_kelainan: false,
                status_psikologi_cemas: false,
                status_psikologi_takut: false,
                status_psikologi_marah: false,
                status_psikologi_sedih: false,
                status_psikologi_kecenderungan_bunuh_diri: false,
                status_psikologi_lainnya: false,
                status_psikologi_lainnya_text: '',
                status_mental_sadar_orientasi_baik: false,
                status_mental_ada_masalah_perilaku: false,
                status_mental_perilaku_kekerasan: '',
                hubungan_keluarga_baik: false,
                hubungan_keluarga_tidak_baik: false,
                tempat_tinggal_rumah: false,
                tempat_tinggal_panti: false,
                tempat_tinggal_lainnya: false,
                tempat_tinggal_lainnya_text: '',
                spiritual_agama_islam: false,
                spiritual_agama_katolik: false,
                spiritual_agama_protestan: false,
                spiritual_agama_hindu: false,
                spiritual_agama_budha: false,
                spiritual_agama_konghucu: false,
                spiritual_agama_lain_lain: false,
                spiritual_kebiasaan_berbadah_teratur_ya: false,
                spiritual_kebiasaan_berbadah_teratur_tidak: false,
                spiritual_nilai_kepercayaan_tidak_ada: false,
                spiritual_nilai_kepercayaan_ada: false,
                pengambilan_keputusan_keluarga: false,
                ekonomi_pekerjaan_asn: false,
                ekonomi_pekerjaan_wiraswasta: false,
                ekonomi_pekerjaan_tni_polri: false,
                ekonomi_pekerjaan_lain_lain: false,
                ekonomi_pekerjaan_lain_lain_text: '',
                ekonomi_penghasilan_kurang_5jt: false,
                ekonomi_penghasilan_5_10jt: false,
                ekonomi_penghasilan_lebih_10jt: false,
                // Edukasi
                edukasi_hak_berpartisipasi: false,
                edukasi_prosedure_penunjang: false,
                edukasi_diagnosa: false,
                edukasi_pemberian_informed_consent: false,
                edukasi_penundaan_pelayanan: false,
                edukasi_kelambatan_pelayanan: false,
                edukasi_cuci_tangan: false,
                edukasi_obat: false,
                edukasi_bahaya_merokok: false,
                edukasi_rujukan_pasien: false,
                edukasi_nutrisi: false,
                edukasi_rehab_medik: false,
                edukasi_nyeri: false,
                edukasi_perencanaan_pulang: false,
                edukasi_penggunaan_alat: false,
                
                // Dokter dan Petugas
                dokter: '',
                petugas: '',
            };

            if (checked) {
                // Reset semua checkbox dalam grup
                group.forEach((fieldName) => {
                    newPasien[fieldName] = false;
                });
                // Set field yang dipilih menjadi true
                newPasien[field] = true;
            }

            setPasien(newPasien);
            return;
        }

        if (checked) {
            // Reset semua checkbox dalam grup
            const resetFields: Record<string, any> = {};
            group.forEach((fieldName) => {
                resetFields[fieldName] = false;
            });
            // Set field yang dipilih menjadi true
            resetFields[field] = true;

            setPasien({
                ...pasien,
                ...resetFields,
            });
        } else {
            // Jika uncheck, set field menjadi false
            setPasien({
                ...pasien,
                [field]: false,
            });
        }
    };

    const formatNumber = (value: any): string => {
        if (value === null || value === undefined) return 'Tidak Diketahui';
        const str = String(value);
        if (str.endsWith('.00')) {
            return str.replace('.00', '');
        }
        return str;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pengkajian Awal - ${pengajuan.nomor_sep}`} />
            <div className="max-w-7xl p-4">
                <div className="mb-4 flex items-center justify-end gap-2">
                    <Button variant="outline" disabled={loading === 'load'} onClick={handleLoadPengkajianAwal}>
                        {loading === 'load' ? <Loader className="mr-2 animate-spin" /> : <Download className="mr-2 text-blue-500" />}
                        Load
                    </Button>
                    <Button variant="outline" disabled={loading === 'simpan'} onClick={handleSimpanPengkajianAwal}>
                        {loading === 'simpan' ? <Loader className="mr-2 animate-spin" /> : <Save className="mr-2 text-blue-500" />}
                        Simpan
                    </Button>
                    <Button variant="outline" disabled={loading === 'hapus'} onClick={handleResetPengkajianAwal}>
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
                                    <h3 style={{ fontSize: 16 }}>PENGKAJIAN AWAL</h3>
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
                                    <b>
                                        {pasien?.jenis_kelamin === 1 ||
                                        pasien?.jenis_kelamin === '1' ||
                                        pasien?.jenis_kelamin === 'L' ||
                                        pasien?.jenis_kelamin === 'Laki-laki'
                                            ? 'Laki-laki'
                                            : pasien?.jenis_kelamin === 2 ||
                                                pasien?.jenis_kelamin === '2' ||
                                                pasien?.jenis_kelamin === 'P' ||
                                                pasien?.jenis_kelamin === 'Perempuan'
                                              ? 'Perempuan'
                                              : '-'}
                                    </b>{' '}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Jam Masuk : <br />
                                    <b>{formatTanggalIndoDateTime(pasien?.tanggal_masuk) || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Jam Keluar : <br />
                                    <b>{formatTanggalIndoDateTime(pasien?.tanggal_keluar) || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Alamat : <br />
                                    <b>{pasien?.alamat || '-'}</b>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Ruangan : <br />
                                    <b>{pasien?.ruangan || '-'}</b>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Anamnesa :
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Checkbox
                                            id="autoanamnesis"
                                            checked={anamnesisType === 'auto'}
                                            onCheckedChange={(checked) => handleAnamnesisChange('auto', checked as boolean)}
                                        />
                                        <label htmlFor="autoanamnesis" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                                            Autoanamnesis
                                        </label>
                                    </div>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Checkbox
                                            id="alloanamnesis"
                                            checked={anamnesisType === 'allo'}
                                            onCheckedChange={(checked) => handleAnamnesisChange('allo', checked as boolean)}
                                        />
                                        <label htmlFor="alloanamnesis" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                                            Alloanamnesis
                                        </label>
                                    </div>
                                </td>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px' }}>
                                    Dari : <br />
                                    <textarea
                                        value={pasien?.anamnesis_dari || ''}
                                        onChange={(e) => handleInputChange(e, 'anamnesis_dari')}
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
                                            minHeight: '20px',
                                        }}
                                        placeholder="-"
                                        rows={1}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Keluhan Utama :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <textarea
                                        value={pasien?.keluhan_utama || ''}
                                        onChange={(e) => handleInputChange(e, 'keluhan_utama')}
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
                                            minHeight: '20px',
                                        }}
                                        placeholder="-"
                                        rows={2}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Riwayat Penyakit Sekarang :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
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
                                            minHeight: '20px',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Faktor Resiko :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <textarea
                                        value={faktorResikoText}
                                        onChange={(e) => setFaktorResikoText(e.target.value)}
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
                                            minHeight: '20px',
                                        }}
                                        placeholder="-"
                                        rows={2}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Riwayat Penyakit Keluarga :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <textarea
                                        value={riwayatPenyakitKeluargaText}
                                        onChange={(e) => setRiwayatPenyakitKeluargaText(e.target.value)}
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
                                            minHeight: '20px',
                                        }}
                                        placeholder="-"
                                        rows={2}
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
                            {/* Pemeriksaan Fisik */}
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Pemeriksaan Fisik :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            Mata : <br />
                                            <textarea
                                                value={pasien?.mata || ''}
                                                onChange={(e) => handleInputChange(e, 'mata')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Pupil : <br />
                                            <textarea
                                                value={pasien?.pupil || ''}
                                                onChange={(e) => handleInputChange(e, 'pupil')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Ikterus : <br />
                                            <textarea
                                                value={pasien?.ikterus || ''}
                                                onChange={(e) => handleInputChange(e, 'ikterus')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Ikterus : <br />
                                            <textarea
                                                value={pasien?.ikterus || ''}
                                                onChange={(e) => handleInputChange(e, 'ikterus')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Diameter Pupil : <br />
                                            <textarea
                                                value={pasien?.diameter_pupil || ''}
                                                onChange={(e) => handleInputChange(e, 'diameter_pupil')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Udem Palpebrae : <br />
                                            <textarea
                                                value={pasien?.udem_palpebrae || ''}
                                                onChange={(e) => handleInputChange(e, 'udem_palpebrae')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            THT : <br />
                                            <textarea
                                                value={pasien?.tht || ''}
                                                onChange={(e) => handleInputChange(e, 'tht')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Faring : <br />
                                            <textarea
                                                value={pasien?.faring || ''}
                                                onChange={(e) => handleInputChange(e, 'faring')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Tongsil : <br />
                                            <textarea
                                                value={pasien?.tongsil || ''}
                                                onChange={(e) => handleInputChange(e, 'tongsil')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Lidah : <br />
                                            <textarea
                                                value={pasien?.lidah || ''}
                                                onChange={(e) => handleInputChange(e, 'lidah')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Bibir : <br />
                                            <textarea
                                                value={pasien?.bibir || ''}
                                                onChange={(e) => handleInputChange(e, 'bibir')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Leher : <br />
                                            <textarea
                                                value={pasien?.leher || ''}
                                                onChange={(e) => handleInputChange(e, 'leher')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            JVP : <br />
                                            <textarea
                                                value={pasien?.jvp || ''}
                                                onChange={(e) => handleInputChange(e, 'jvp')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Limfe : <br />
                                            <textarea
                                                value={pasien?.limfe || ''}
                                                onChange={(e) => handleInputChange(e, 'limfe')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Kaku Kuduk : <br />
                                            <textarea
                                                value={pasien?.kaku_kuduk || ''}
                                                onChange={(e) => handleInputChange(e, 'kaku_kuduk')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Thoraks : <br />
                                            <textarea
                                                value={pasien?.thoraks || ''}
                                                onChange={(e) => handleInputChange(e, 'thoraks')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            COR : <br />
                                            <textarea
                                                value={pasien?.cor || ''}
                                                onChange={(e) => handleInputChange(e, 'cor')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            S1S2 : <br />
                                            <textarea
                                                value={pasien?.s1s2 || ''}
                                                onChange={(e) => handleInputChange(e, 's1s2')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Mur-Mur : <br />
                                            <textarea
                                                value={pasien?.mur_mur || ''}
                                                onChange={(e) => handleInputChange(e, 'mur_mur')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Pulmo : <br />
                                            <textarea
                                                value={pasien?.pulmo || ''}
                                                onChange={(e) => handleInputChange(e, 'pulmo')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Ronchi : <br />
                                            <textarea
                                                value={pasien?.ronchi || ''}
                                                onChange={(e) => handleInputChange(e, 'ronchi')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Wheezing : <br />
                                            <textarea
                                                value={pasien?.wheezing || ''}
                                                onChange={(e) => handleInputChange(e, 'wheezing')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Abdomen : <br />
                                            <textarea
                                                value={pasien?.abdomen || ''}
                                                onChange={(e) => handleInputChange(e, 'abdomen')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Meteorismus : <br />
                                            <textarea
                                                value={pasien?.meteorismus || ''}
                                                onChange={(e) => handleInputChange(e, 'meteorismus')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Peristaltik : <br />
                                            <textarea
                                                value={pasien?.peristaltik || ''}
                                                onChange={(e) => handleInputChange(e, 'peristaltik')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Asites : <br />
                                            <textarea
                                                value={pasien?.asites || ''}
                                                onChange={(e) => handleInputChange(e, 'asites')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Nyeri Tekan : <br />
                                            <textarea
                                                value={pasien?.nyeri_tekan || ''}
                                                onChange={(e) => handleInputChange(e, 'nyeri_tekan')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Hepar : <br />
                                            <textarea
                                                value={pasien?.hepar || ''}
                                                onChange={(e) => handleInputChange(e, 'hepar')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Lien : <br />
                                            <textarea
                                                value={pasien?.lien || ''}
                                                onChange={(e) => handleInputChange(e, 'lien')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Extremitas : <br />
                                            <textarea
                                                value={pasien?.extremitas || ''}
                                                onChange={(e) => handleInputChange(e, 'extremitas')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Udem : <br />
                                            <textarea
                                                value={pasien?.udem || ''}
                                                onChange={(e) => handleInputChange(e, 'udem')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Defeksesi : <br />
                                            <textarea
                                                value={pasien?.defeksesi || ''}
                                                onChange={(e) => handleInputChange(e, 'defeksesi')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Urin : <br />
                                            <textarea
                                                value={pasien?.urin || ''}
                                                onChange={(e) => handleInputChange(e, 'urin')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Kelainan : <br />
                                            <textarea
                                                value={pasien?.kelainan || ''}
                                                onChange={(e) => handleInputChange(e, 'kelainan')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Lainnya : <br />
                                            <textarea
                                                value={pasien?.lainnya || ''}
                                                onChange={(e) => handleInputChange(e, 'lainnya')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            {/* Riwayat Alergi */}
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Riwayat Alergi :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <div>
                                        <textarea
                                            value={pasien?.riwayat_alergi || ''}
                                            onChange={(e) => handleInputChange(e, 'riwayat_alergi')}
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
                                                minHeight: '20px',
                                            }}
                                            placeholder="-"
                                            rows={1}
                                        />
                                    </div>
                                </td>
                            </tr>
                            {/* Hubungan Status Psikososial Spiritual */}
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Hubungan Status Psikososial Spiritual :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
                                        {/* Status Psikologi */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>- Status Psikologi :</strong>
                                            <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_psikologi_tidak_ada_kelainan || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange(
                                                                    'status_psikologi_tidak_ada_kelainan',
                                                                    checked as boolean,
                                                                    [
                                                                        'status_psikologi_tidak_ada_kelainan',
                                                                        'status_psikologi_cemas',
                                                                        'status_psikologi_takut',
                                                                        'status_psikologi_marah',
                                                                        'status_psikologi_sedih',
                                                                        'status_psikologi_kecenderungan_bunuh_diri',
                                                                        'status_psikologi_lainnya',
                                                                    ],
                                                                )
                                                            }
                                                        />
                                                        Tidak ada kelainan
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_psikologi_cemas || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('status_psikologi_cemas', checked as boolean, [
                                                                    'status_psikologi_tidak_ada_kelainan',
                                                                    'status_psikologi_cemas',
                                                                    'status_psikologi_takut',
                                                                    'status_psikologi_marah',
                                                                    'status_psikologi_sedih',
                                                                    'status_psikologi_kecenderungan_bunuh_diri',
                                                                    'status_psikologi_lainnya',
                                                                ])
                                                            }
                                                        />
                                                        Cemas
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_psikologi_takut || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('status_psikologi_takut', checked as boolean, [
                                                                    'status_psikologi_tidak_ada_kelainan',
                                                                    'status_psikologi_cemas',
                                                                    'status_psikologi_takut',
                                                                    'status_psikologi_marah',
                                                                    'status_psikologi_sedih',
                                                                    'status_psikologi_kecenderungan_bunuh_diri',
                                                                    'status_psikologi_lainnya',
                                                                ])
                                                            }
                                                        />
                                                        Takut
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_psikologi_marah || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('status_psikologi_marah', checked as boolean, [
                                                                    'status_psikologi_tidak_ada_kelainan',
                                                                    'status_psikologi_cemas',
                                                                    'status_psikologi_takut',
                                                                    'status_psikologi_marah',
                                                                    'status_psikologi_sedih',
                                                                    'status_psikologi_kecenderungan_bunuh_diri',
                                                                    'status_psikologi_lainnya',
                                                                ])
                                                            }
                                                        />
                                                        Marah
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_psikologi_sedih || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('status_psikologi_sedih', checked as boolean, [
                                                                    'status_psikologi_tidak_ada_kelainan',
                                                                    'status_psikologi_cemas',
                                                                    'status_psikologi_takut',
                                                                    'status_psikologi_marah',
                                                                    'status_psikologi_sedih',
                                                                    'status_psikologi_kecenderungan_bunuh_diri',
                                                                    'status_psikologi_lainnya',
                                                                ])
                                                            }
                                                        />
                                                        Sedih
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_psikologi_kecenderungan_bunuh_diri || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange(
                                                                    'status_psikologi_kecenderungan_bunuh_diri',
                                                                    checked as boolean,
                                                                    [
                                                                        'status_psikologi_tidak_ada_kelainan',
                                                                        'status_psikologi_cemas',
                                                                        'status_psikologi_takut',
                                                                        'status_psikologi_marah',
                                                                        'status_psikologi_sedih',
                                                                        'status_psikologi_kecenderungan_bunuh_diri',
                                                                        'status_psikologi_lainnya',
                                                                    ],
                                                                )
                                                            }
                                                        />
                                                        Kecenderungan Bunuh Diri
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_psikologi_lainnya || false}
                                                            onCheckedChange={(checked) => {
                                                                handleExclusiveCheckboxChange('status_psikologi_lainnya', checked as boolean, [
                                                                    'status_psikologi_tidak_ada_kelainan',
                                                                    'status_psikologi_cemas',
                                                                    'status_psikologi_takut',
                                                                    'status_psikologi_marah',
                                                                    'status_psikologi_sedih',
                                                                    'status_psikologi_kecenderungan_bunuh_diri',
                                                                    'status_psikologi_lainnya',
                                                                ]);
                                                                // Reset text field jika uncheck
                                                                if (!checked && pasien) {
                                                                    setPasien({
                                                                        ...pasien,
                                                                        status_psikologi_lainnya_text: '',
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        Lainnya :
                                                    </label>
                                                    {pasien?.status_psikologi_lainnya && (
                                                        <input
                                                            type="text"
                                                            value={pasien?.status_psikologi_lainnya_text || ''}
                                                            onChange={(e) => handleTextInputChange(e, 'status_psikologi_lainnya_text')}
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                padding: '2px 5px',
                                                                fontSize: '14px',
                                                                borderRadius: '3px',
                                                                minWidth: '150px',
                                                            }}
                                                            placeholder="Masukkan keterangan"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Mental */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>- Status Mental :</strong>
                                            <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_mental_sadar_orientasi_baik || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange(
                                                                    'status_mental_sadar_orientasi_baik',
                                                                    checked as boolean,
                                                                    ['status_mental_sadar_orientasi_baik', 'status_mental_ada_masalah_perilaku'],
                                                                )
                                                            }
                                                        />
                                                        Sadar dan orientasi baik
                                                    </label>
                                                </div>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.status_mental_ada_masalah_perilaku || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange(
                                                                    'status_mental_ada_masalah_perilaku',
                                                                    checked as boolean,
                                                                    ['status_mental_sadar_orientasi_baik', 'status_mental_ada_masalah_perilaku'],
                                                                )
                                                            }
                                                        />
                                                        Ada masalah perilaku
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span>Perilaku kekerasan yang dialami pasien sebelumnya :</span>
                                                    <input
                                                        type="text"
                                                        value={pasien?.status_mental_perilaku_kekerasan || ''}
                                                        onChange={(e) => handleTextInputChange(e, 'status_mental_perilaku_kekerasan')}
                                                        style={{
                                                            border: '1px solid #ccc',
                                                            padding: '2px 5px',
                                                            fontSize: '14px',
                                                            borderRadius: '3px',
                                                            minWidth: '200px',
                                                        }}
                                                        placeholder="Masukkan keterangan"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sosial */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>- Sosial :</strong>
                                            <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <span>Hubungan pasien dengan anggota keluarga : </span>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginRight: '15px' }}>
                                                        <Checkbox
                                                            checked={pasien?.hubungan_keluarga_baik || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('hubungan_keluarga_baik', checked as boolean, [
                                                                    'hubungan_keluarga_baik',
                                                                    'hubungan_keluarga_tidak_baik',
                                                                ])
                                                            }
                                                        />
                                                        Baik
                                                    </label>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.hubungan_keluarga_tidak_baik || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('hubungan_keluarga_tidak_baik', checked as boolean, [
                                                                    'hubungan_keluarga_baik',
                                                                    'hubungan_keluarga_tidak_baik',
                                                                ])
                                                            }
                                                        />
                                                        Tidak baik
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                                                    <span>Tempat tinggal : </span>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '10px' }}>
                                                        <Checkbox
                                                            checked={pasien?.tempat_tinggal_rumah || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('tempat_tinggal_rumah', checked as boolean, [
                                                                    'tempat_tinggal_rumah',
                                                                    'tempat_tinggal_panti',
                                                                    'tempat_tinggal_lainnya',
                                                                ])
                                                            }
                                                        />
                                                        Rumah
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '10px' }}>
                                                        <Checkbox
                                                            checked={pasien?.tempat_tinggal_panti || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('tempat_tinggal_panti', checked as boolean, [
                                                                    'tempat_tinggal_rumah',
                                                                    'tempat_tinggal_panti',
                                                                    'tempat_tinggal_lainnya',
                                                                ])
                                                            }
                                                        />
                                                        Panti
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '10px' }}>
                                                        <Checkbox
                                                            checked={pasien?.tempat_tinggal_lainnya || false}
                                                            onCheckedChange={(checked) => {
                                                                handleExclusiveCheckboxChange('tempat_tinggal_lainnya', checked as boolean, [
                                                                    'tempat_tinggal_rumah',
                                                                    'tempat_tinggal_panti',
                                                                    'tempat_tinggal_lainnya',
                                                                ]);
                                                                // Reset text field jika uncheck
                                                                if (!checked && pasien) {
                                                                    setPasien({
                                                                        ...pasien,
                                                                        tempat_tinggal_lainnya_text: '',
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        Lainnya :
                                                    </label>
                                                    {pasien?.tempat_tinggal_lainnya && (
                                                        <input
                                                            type="text"
                                                            value={pasien?.tempat_tinggal_lainnya_text || ''}
                                                            onChange={(e) => handleTextInputChange(e, 'tempat_tinggal_lainnya_text')}
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                padding: '2px 5px',
                                                                fontSize: '14px',
                                                                borderRadius: '3px',
                                                                minWidth: '120px',
                                                            }}
                                                            placeholder="Keterangan"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Spiritual */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>- Spiritual :</strong>
                                            <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <span>Agama : </span>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            flexWrap: 'wrap',
                                                            marginTop: '3px',
                                                        }}
                                                    >
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.spiritual_agama_islam || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('spiritual_agama_islam', checked as boolean, [
                                                                        'spiritual_agama_islam',
                                                                        'spiritual_agama_katolik',
                                                                        'spiritual_agama_protestan',
                                                                        'spiritual_agama_hindu',
                                                                        'spiritual_agama_budha',
                                                                        'spiritual_agama_konghucu',
                                                                        'spiritual_agama_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            Islam
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.spiritual_agama_katolik || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('spiritual_agama_katolik', checked as boolean, [
                                                                        'spiritual_agama_islam',
                                                                        'spiritual_agama_katolik',
                                                                        'spiritual_agama_protestan',
                                                                        'spiritual_agama_hindu',
                                                                        'spiritual_agama_budha',
                                                                        'spiritual_agama_konghucu',
                                                                        'spiritual_agama_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            Katolik
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.spiritual_agama_protestan || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('spiritual_agama_protestan', checked as boolean, [
                                                                        'spiritual_agama_islam',
                                                                        'spiritual_agama_katolik',
                                                                        'spiritual_agama_protestan',
                                                                        'spiritual_agama_hindu',
                                                                        'spiritual_agama_budha',
                                                                        'spiritual_agama_konghucu',
                                                                        'spiritual_agama_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            Protestan
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.spiritual_agama_hindu || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('spiritual_agama_hindu', checked as boolean, [
                                                                        'spiritual_agama_islam',
                                                                        'spiritual_agama_katolik',
                                                                        'spiritual_agama_protestan',
                                                                        'spiritual_agama_hindu',
                                                                        'spiritual_agama_budha',
                                                                        'spiritual_agama_konghucu',
                                                                        'spiritual_agama_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            Hindu
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.spiritual_agama_budha || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('spiritual_agama_budha', checked as boolean, [
                                                                        'spiritual_agama_islam',
                                                                        'spiritual_agama_katolik',
                                                                        'spiritual_agama_protestan',
                                                                        'spiritual_agama_hindu',
                                                                        'spiritual_agama_budha',
                                                                        'spiritual_agama_konghucu',
                                                                        'spiritual_agama_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            Budha
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.spiritual_agama_konghucu || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('spiritual_agama_konghucu', checked as boolean, [
                                                                        'spiritual_agama_islam',
                                                                        'spiritual_agama_katolik',
                                                                        'spiritual_agama_protestan',
                                                                        'spiritual_agama_hindu',
                                                                        'spiritual_agama_budha',
                                                                        'spiritual_agama_konghucu',
                                                                        'spiritual_agama_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            Konghucu
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.spiritual_agama_lain_lain || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('spiritual_agama_lain_lain', checked as boolean, [
                                                                        'spiritual_agama_islam',
                                                                        'spiritual_agama_katolik',
                                                                        'spiritual_agama_protestan',
                                                                        'spiritual_agama_hindu',
                                                                        'spiritual_agama_budha',
                                                                        'spiritual_agama_konghucu',
                                                                        'spiritual_agama_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            Lain-lain
                                                        </label>
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <span>Kebiasaan beribadah, teratur : </span>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginRight: '15px' }}>
                                                        <Checkbox
                                                            checked={pasien?.spiritual_kebiasaan_berbadah_teratur_ya || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange(
                                                                    'spiritual_kebiasaan_berbadah_teratur_ya',
                                                                    checked as boolean,
                                                                    [
                                                                        'spiritual_kebiasaan_berbadah_teratur_ya',
                                                                        'spiritual_kebiasaan_berbadah_teratur_tidak',
                                                                    ],
                                                                )
                                                            }
                                                        />
                                                        Ya
                                                    </label>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.spiritual_kebiasaan_berbadah_teratur_tidak || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange(
                                                                    'spiritual_kebiasaan_berbadah_teratur_tidak',
                                                                    checked as boolean,
                                                                    [
                                                                        'spiritual_kebiasaan_berbadah_teratur_ya',
                                                                        'spiritual_kebiasaan_berbadah_teratur_tidak',
                                                                    ],
                                                                )
                                                            }
                                                        />
                                                        Tidak
                                                    </label>
                                                </div>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <span>- Nilai - Nilai Kepercayaan : </span>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginRight: '15px' }}>
                                                        <Checkbox
                                                            checked={pasien?.spiritual_nilai_kepercayaan_tidak_ada || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange(
                                                                    'spiritual_nilai_kepercayaan_tidak_ada',
                                                                    checked as boolean,
                                                                    ['spiritual_nilai_kepercayaan_tidak_ada', 'spiritual_nilai_kepercayaan_ada'],
                                                                )
                                                            }
                                                        />
                                                        Tidak ada
                                                    </label>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                        <Checkbox
                                                            checked={pasien?.spiritual_nilai_kepercayaan_ada || false}
                                                            onCheckedChange={(checked) =>
                                                                handleExclusiveCheckboxChange('spiritual_nilai_kepercayaan_ada', checked as boolean, [
                                                                    'spiritual_nilai_kepercayaan_tidak_ada',
                                                                    'spiritual_nilai_kepercayaan_ada',
                                                                ])
                                                            }
                                                        />
                                                        Ada
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pengambilan keputusan dalam keluarga */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.pengambilan_keputusan_keluarga || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange('pengambilan_keputusan_keluarga', checked as boolean)
                                                    }
                                                />
                                                <strong>- Pengambilan keputusan dalam keluarga :</strong>
                                            </label>
                                        </div>

                                        {/* EKONOMI */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>EKONOMI</strong>
                                            <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <span>- Pekerjaan : </span>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            flexWrap: 'wrap',
                                                            marginTop: '3px',
                                                        }}
                                                    >
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.ekonomi_pekerjaan_asn || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('ekonomi_pekerjaan_asn', checked as boolean, [
                                                                        'ekonomi_pekerjaan_asn',
                                                                        'ekonomi_pekerjaan_wiraswasta',
                                                                        'ekonomi_pekerjaan_tni_polri',
                                                                        'ekonomi_pekerjaan_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            ASN
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.ekonomi_pekerjaan_wiraswasta || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange(
                                                                        'ekonomi_pekerjaan_wiraswasta',
                                                                        checked as boolean,
                                                                        [
                                                                            'ekonomi_pekerjaan_asn',
                                                                            'ekonomi_pekerjaan_wiraswasta',
                                                                            'ekonomi_pekerjaan_tni_polri',
                                                                            'ekonomi_pekerjaan_lain_lain',
                                                                        ],
                                                                    )
                                                                }
                                                            />
                                                            Wiraswasta
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.ekonomi_pekerjaan_tni_polri || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('ekonomi_pekerjaan_tni_polri', checked as boolean, [
                                                                        'ekonomi_pekerjaan_asn',
                                                                        'ekonomi_pekerjaan_wiraswasta',
                                                                        'ekonomi_pekerjaan_tni_polri',
                                                                        'ekonomi_pekerjaan_lain_lain',
                                                                    ])
                                                                }
                                                            />
                                                            TNI/POLRI
                                                        </label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <Checkbox
                                                                    checked={pasien?.ekonomi_pekerjaan_lain_lain || false}
                                                                    onCheckedChange={(checked) =>
                                                                        handleExclusiveCheckboxChange(
                                                                            'ekonomi_pekerjaan_lain_lain',
                                                                            checked as boolean,
                                                                            [
                                                                                'ekonomi_pekerjaan_asn',
                                                                                'ekonomi_pekerjaan_wiraswasta',
                                                                                'ekonomi_pekerjaan_tni_polri',
                                                                                'ekonomi_pekerjaan_lain_lain',
                                                                            ],
                                                                        )
                                                                    }
                                                                />
                                                                Lain-Lain
                                                            </label>
                                                            {pasien?.ekonomi_pekerjaan_lain_lain && (
                                                                <input
                                                                    type="text"
                                                                    value={pasien?.ekonomi_pekerjaan_lain_lain_text || ''}
                                                                    onChange={(e) => handleTextInputChange(e, 'ekonomi_pekerjaan_lain_lain_text')}
                                                                    style={{
                                                                        border: '1px solid #ccc',
                                                                        padding: '2px 5px',
                                                                        fontSize: '14px',
                                                                        borderRadius: '3px',
                                                                        minWidth: '120px',
                                                                    }}
                                                                    placeholder="Sebutkan"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    <span>- Penghasilan per bulan : </span>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '15px',
                                                            flexWrap: 'wrap',
                                                            marginTop: '3px',
                                                        }}
                                                    >
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.ekonomi_penghasilan_kurang_5jt || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange(
                                                                        'ekonomi_penghasilan_kurang_5jt',
                                                                        checked as boolean,
                                                                        [
                                                                            'ekonomi_penghasilan_kurang_5jt',
                                                                            'ekonomi_penghasilan_5_10jt',
                                                                            'ekonomi_penghasilan_lebih_10jt',
                                                                        ],
                                                                    )
                                                                }
                                                            />
                                                            &lt; Rp. 5.000.000
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.ekonomi_penghasilan_5_10jt || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange('ekonomi_penghasilan_5_10jt', checked as boolean, [
                                                                        'ekonomi_penghasilan_kurang_5jt',
                                                                        'ekonomi_penghasilan_5_10jt',
                                                                        'ekonomi_penghasilan_lebih_10jt',
                                                                    ])
                                                                }
                                                            />
                                                            Rp. 5.000.000 - Rp. 10.000.000
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Checkbox
                                                                checked={pasien?.ekonomi_penghasilan_lebih_10jt || false}
                                                                onCheckedChange={(checked) =>
                                                                    handleExclusiveCheckboxChange(
                                                                        'ekonomi_penghasilan_lebih_10jt',
                                                                        checked as boolean,
                                                                        [
                                                                            'ekonomi_penghasilan_kurang_5jt',
                                                                            'ekonomi_penghasilan_5_10jt',
                                                                            'ekonomi_penghasilan_lebih_10jt',
                                                                        ],
                                                                    )
                                                                }
                                                            />
                                                            Rp. 10.000.000
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Penilianan Nyeri :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            Nyeri : <br />
                                            <textarea
                                                value={pasien?.nyeri || ''}
                                                onChange={(e) => handleInputChange(e, 'nyeri')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Onset : <br />
                                            <textarea
                                                value={pasien?.onset || ''}
                                                onChange={(e) => handleInputChange(e, 'onset')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Pencetus : <br />
                                            <textarea
                                                value={pasien?.pencetus || ''}
                                                onChange={(e) => handleInputChange(e, 'pencetus')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Lokasi Nyeri : <br />
                                            <textarea
                                                value={pasien?.lokasi_nyeri || ''}
                                                onChange={(e) => handleInputChange(e, 'lokasi_nyeri')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Gambaran Nyeri : <br />
                                            <textarea
                                                value={pasien?.gambaran_nyeri || ''}
                                                onChange={(e) => handleInputChange(e, 'gambaran_nyeri')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Durasi : <br />
                                            <textarea
                                                value={pasien?.durasi_nyeri || ''}
                                                onChange={(e) => handleInputChange(e, 'durasi_nyeri')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Skala : <br />
                                            <textarea
                                                value={pasien?.skala_nyeri || ''}
                                                onChange={(e) => handleInputChange(e, 'skala_nyeri')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            Metode : <br />
                                            <textarea
                                                value={pasien?.metode_nyeri || ''}
                                                onChange={(e) => handleInputChange(e, 'metode_nyeri')}
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
                                                    minHeight: '20px',
                                                }}
                                                placeholder="-"
                                                rows={1}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Edukasi Pasien :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
                                        {/* Edukasi Pasien Checkboxes */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_hak_berpartisipasi || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange('edukasi_hak_berpartisipasi', checked as boolean)
                                                    }
                                                />
                                                Hak untuk berpartisipasi pada pelayanan
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_prosedure_penunjang || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange('edukasi_prosedure_penunjang', checked as boolean)
                                                    }
                                                />
                                                Prosedur pemeriksaan penunjang
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_diagnosa || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_diagnosa', checked as boolean)}
                                                />
                                                Kondisi kesehatan dan diagnosa pasti dan penatalaksanaannya
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_pemberian_informed_consent || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange('edukasi_pemberian_informed_consent', checked as boolean)
                                                    }
                                                />
                                                Proses pemberian informed consent
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_penundaan_pelayanan || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange('edukasi_penundaan_pelayanan', checked as boolean)
                                                    }
                                                />
                                                Penundaan Pelayanan
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_kelambatan_pelayanan || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange('edukasi_kelambatan_pelayanan', checked as boolean)
                                                    }
                                                />
                                                Kelambatan Pelayanan
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_cuci_tangan || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_cuci_tangan', checked as boolean)}
                                                />
                                                Cuci tangan yang benar
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_obat || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_obat', checked as boolean)}
                                                />
                                                Penggunaan obat secara efektif dan efek samping interaksinya
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_bahaya_merokok || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_bahaya_merokok', checked as boolean)}
                                                />
                                                Bahaya Merokok
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_rujukan_pasien || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_rujukan_pasien', checked as boolean)}
                                                />
                                                Edukasi Rujukan Pasien
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_nutrisi || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_nutrisi', checked as boolean)}
                                                />
                                                Diet dan Nutrisi
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_rehab_medik || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_rehab_medik', checked as boolean)}
                                                />
                                                Teknik Rehabilitasi
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_nyeri || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_nyeri', checked as boolean)}
                                                />
                                                Manajemen Nyeri
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_perencanaan_pulang || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange('edukasi_perencanaan_pulang', checked as boolean)
                                                    }
                                                />
                                                Edukasi Perencanaan Pulang
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Checkbox
                                                    checked={pasien?.edukasi_penggunaan_alat || false}
                                                    onCheckedChange={(checked) => handleCheckboxChange('edukasi_penggunaan_alat', checked as boolean)}
                                                />
                                                Penggunaan alat-alat medis yang aman
                                            </label>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Masalah Medis :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <textarea
                                        value={pasien?.masalah_medis || ''}
                                        onChange={(e) => handleInputChange(e, 'masalah_medis')}
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
                                            minHeight: '20px',
                                        }}
                                        placeholder="-"
                                        rows={3}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Diagnosa Medis :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
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
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Rencana Terapi :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <textarea
                                        value={pasien?.rencana_terapi || ''}
                                        onChange={(e) => handleInputChange(e, 'rencana_terapi')}
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
                                            minHeight: '20px',
                                        }}
                                        placeholder="-"
                                        rows={6}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Dokter :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <input
                                        type="text"
                                        value={pasien?.dokter || ''}
                                        onChange={(e) => setPasien(prev => prev ? {...prev, dokter: e.target.value} : null)}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                        }}
                                        placeholder="Nama dokter"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', width: '200px', verticalAlign: 'top' }}>
                                    Petugas/Perawat :
                                </td>
                                <td colSpan={6} style={{ border: '1px solid #000', padding: '5px', width: '600px', verticalAlign: 'top' }}>
                                    <input
                                        type="text"
                                        value={pasien?.petugas || ''}
                                        onChange={(e) => setPasien(prev => prev ? {...prev, petugas: e.target.value} : null)}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            fontFamily: 'halvetica, sans-serif',
                                            padding: '2px 0',
                                        }}
                                        placeholder="Nama petugas/perawat"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
