import DiagnosisModal from '@/components/eklaim/DiagnosisModal';
import ProcedureModal from '@/components/eklaim/ProcedureModal';
import { SearchableSelect } from '@/components/ui/searchable-select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'E-Klaim',
        href: '/eklaim',
    },
    {
        title: 'Pengajuan Klaim',
        href: '/eklaim/pengajuan',
    },
    {
        title: 'Entry Klaim',
        href: '#',
    },
];

interface Props extends SharedData {
    pengajuanKlaim: {
        id: number;
        nomor_sep: string;
        norm: string;
        nama_pasien: string;
        nomor_kartu: string;
        tanggal_sep: string;
        jenis_rawat: string;
        kelas_rawat: string;
        [key: string]: any;
    };
    referenceData: {
        cara_masuk_options: Array<{ value: string; label: string }>;
        jenis_rawat_options: Array<{ value: string; label: string }>;
        kelas_rawat_options: Array<{ value: string; label: string }>;
        discharge_status_options: Array<{ value: string; label: string }>;
        [key: string]: any;
    };
    existingKlaim?: any;
    resumeMedis?: {
        diagnosa: any[];
        procedure: any[];
    };
    resumeMedisData?: any;
    pengkajianAwalData?: any;
    kunjunganbpjsData?: any;
    dataTagihan?: any;
}

export default function Index() {
    const { referenceData, pengajuanKlaim, resumeMedisData, pengkajianAwalData, kunjunganbpjsData, dataTagihan } = usePage<Props>().props;
    console.log(dataTagihan);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isInagrouperDiagnosisModalOpen, setIsInagrouperDiagnosisModalOpen] = useState(false);
    const [isInagrouperProcedureModalOpen, setIsInagrouperProcedureModalOpen] = useState(false);

    const [selectedDiagnoses, setSelectedDiagnoses] = useState<{ name: string; code: string }[]>([]);
    const [selectedProcedures, setSelectedProcedures] = useState<{ name: string; code: string }[]>([]);
    const [selectedInagrouperDiagnoses, setSelectedInagrouperDiagnoses] = useState<{ name: string; code: string }[]>([]);
    const [selectedInagrouperProcedures, setSelectedInagrouperProcedures] = useState<{ name: string; code: string }[]>([]);

    // Load data otomatis saat komponen dimuat
    useEffect(() => {
        updateField('nomor_sep', pengajuanKlaim.nomor_sep || '');
        updateField('norm', pengajuanKlaim.norm || '');
        updateField('nama_pasien', pengajuanKlaim.nama_pasien || '');
        updateField('nomor_kartu', pengajuanKlaim.nomor_kartu || '');
        updateField('tgl_masuk', toDatetimeLocal(pengajuanKlaim.tanggal_masuk) || '');
        updateField('tgl_pulang', toDatetimeLocal(pengajuanKlaim.tanggal_keluar) || '');

        let jenisRawat = '';
        switch (pengajuanKlaim.jenis_kunjungan) {
            case 1:
            case 'Rawat Inap':
                jenisRawat = '1';
                break;
            case 2:
            case 'Rawata Jalan':
                jenisRawat = '2';
                break;
            case 3:
            case 'Gawat Darurat':
                jenisRawat = '3';
                break;
            default:
                jenisRawat = '';
        }
        updateField('jenis_rawat', jenisRawat);

        let caraKeluar = '';
        switch (resumeMedisData.cara_keluar) {
            case 1:
            case 'Diijinkan Pulang':
                caraKeluar = '1';
                break;
            case 2:
            case 'Pulang Paksa + Alasan':
                caraKeluar = '3';
                break;
            case 3:
            case 'Dirujukan Ke RS Lain':
                caraKeluar = '2';
                break;
            case 4:
            case 'Lari':
                caraKeluar = '3';
                break;
            case 5:
            case 'Pindah RS Lain':
                caraKeluar = '3';
                break;
            case 6:
            case 'Meninggal':
                caraKeluar = '4';
                break;
            case 7:
            case 'DOA':
                caraKeluar = '4';
                break;
            case 8:
            case 'Masuk Rawat Inap':
                caraKeluar = '5';
                break;
            default:
                caraKeluar = '';
        }
        updateField('discharge_status', caraKeluar);
        updateField('nama_dokter', resumeMedisData.dokter || '');

        let kelas_rwt = '';
        switch (kunjunganbpjsData.klsRawat) {
            case 1:
            case '1':
                kelas_rwt = '1';
                break;
            case 2:
            case '2':
                kelas_rwt = '3';
                break;
            case 3:
            case '3':
                kelas_rwt = '2';
                break;
            default:
                kelas_rwt = '';
        }
        updateField('kelas_rawat', kelas_rwt || '');
        updateField('sistole', resumeMedisData.tanda_vital_sistolik || '');
        updateField('diastole', resumeMedisData.tanda_vital_distolik || '');

        if (resumeMedisData?.selected_diagnosa && Array.isArray(resumeMedisData.selected_diagnosa)) {
            const diagnosaCodes = convertArrayToCodeString(resumeMedisData.selected_diagnosa, ['kode', 'code', 'kd_penyakit']);
            updateField('diagnosa', diagnosaCodes);
            updateField('diagnosa_inagrouper', diagnosaCodes); // Set juga untuk inagrouper

            const diagnosesForUI = convertArrayToUIFormat(resumeMedisData.selected_diagnosa, 'diagnosa');
            setSelectedDiagnoses(diagnosesForUI);
            setSelectedInagrouperDiagnoses(diagnosesForUI); // Set juga untuk inagrouper

            console.log('Loaded diagnosa from resumeMedisData:', diagnosaCodes, diagnosesForUI);
        }

        if (resumeMedisData?.selected_procedure && Array.isArray(resumeMedisData.selected_procedure)) {
            const procedureCodes = convertArrayToCodeString(resumeMedisData.selected_procedure, ['kode', 'code', 'kd_tindakan']);
            updateField('procedure', procedureCodes);
            updateField('procedure_inagrouper', procedureCodes); // Set juga untuk inagrouper

            const proceduresForUI = convertArrayToUIFormat(resumeMedisData.selected_procedure, 'procedure');
            setSelectedProcedures(proceduresForUI);
            setSelectedInagrouperProcedures(proceduresForUI); // Set juga untuk inagrouper

            console.log('Loaded procedure from resumeMedisData:', procedureCodes, proceduresForUI);
        }

        // Handle selected_diagnosa_inagrouper jika ada data terpisah untuk inagrouper (akan override data di atas)
        if (resumeMedisData?.selected_diagnosa_inagrouper && Array.isArray(resumeMedisData.selected_diagnosa_inagrouper)) {
            const diagnosaCodes = convertArrayToCodeString(resumeMedisData.selected_diagnosa_inagrouper, ['kode', 'code', 'kd_penyakit']);
            updateField('diagnosa_inagrouper', diagnosaCodes);

            const diagnosesForUI = convertArrayToUIFormat(resumeMedisData.selected_diagnosa_inagrouper, 'diagnosa');
            setSelectedInagrouperDiagnoses(diagnosesForUI);

            console.log('Loaded diagnosa inagrouper from resumeMedisData:', diagnosaCodes, diagnosesForUI);
        }

        // Handle selected_procedure_inagrouper jika ada data terpisah untuk inagrouper (akan override data di atas)
        if (resumeMedisData?.selected_procedure_inagrouper && Array.isArray(resumeMedisData.selected_procedure_inagrouper)) {
            const procedureCodes = convertArrayToCodeString(resumeMedisData.selected_procedure_inagrouper, ['kode', 'code', 'kd_tindakan']);
            updateField('procedure_inagrouper', procedureCodes);

            const proceduresForUI = convertArrayToUIFormat(resumeMedisData.selected_procedure_inagrouper, 'procedure');
            setSelectedInagrouperProcedures(proceduresForUI);

            console.log('Loaded procedure inagrouper from resumeMedisData:', procedureCodes, proceduresForUI);
        }

        // Mapping tarif RS berdasarkan data tagihan
        updateNestedField('tarif_rs', 'prosedur_non_bedah', dataTagihan?.PROSEDUR_NON_BEDAH || '');
        updateNestedField('tarif_rs', 'prosedur_bedah', dataTagihan?.PROSEDUR_BEDAH || '');
        updateNestedField('tarif_rs', 'konsultasi', dataTagihan?.KONSULTASI || '');
        updateNestedField('tarif_rs', 'tenaga_ahli', dataTagihan?.TENAGA_AHLI || '');
        updateNestedField('tarif_rs', 'keperawatan', dataTagihan?.KEPERAWATAN || '');
        updateNestedField('tarif_rs', 'penunjang', dataTagihan?.PENUNJANG || '');
        updateNestedField('tarif_rs', 'radiologi', dataTagihan?.RADIOLOGI || '');
        updateNestedField('tarif_rs', 'laboratorium', dataTagihan?.LABORATORIUM || '');
        updateNestedField('tarif_rs', 'pelayanan_darah', dataTagihan?.BANK_DARAH || '');
        updateNestedField('tarif_rs', 'rehabilitasi', dataTagihan?.REHAB_MEDIK || '');
        updateNestedField('tarif_rs', 'kamar', dataTagihan?.AKOMODASI || '');
        updateNestedField('tarif_rs', 'rawat_intensif', dataTagihan?.AKOMODASI_INTENSIF || '');
        updateNestedField('tarif_rs', 'obat', dataTagihan?.OBAT || '');
        updateNestedField('tarif_rs', 'obat_kronis', dataTagihan?.OBAT_KRONIS || '');
        updateNestedField('tarif_rs', 'obat_kemoterapi', dataTagihan?.OBAT_KEMOTERAPI || '');
        updateNestedField('tarif_rs', 'alkes', dataTagihan?.ALKES || '');
        updateNestedField('tarif_rs', 'bmhp', dataTagihan?.BMHP || '');
        updateNestedField('tarif_rs', 'sewa_alat', dataTagihan?.SEWA_ALAT || '');
    }, [pengajuanKlaim, resumeMedisData, pengkajianAwalData, kunjunganbpjsData, dataTagihan]);

    // Function untuk load diagnosa dan procedure
    const loadDiagnosaProcedure = (data: any) => {
        // Handle diagnosa jika ada
        if (data.diagnosa) {
            const diagnosaCodes = data.diagnosa.split('#').filter((code: string) => code.trim() !== '');
        }

        // Handle procedure jika ada
        if (data.procedure) {
            const procedureCodes = data.procedure.split('#').filter((code: string) => code.trim() !== '');
        }

        // Handle diagnosa inagrouper jika ada
        if (data.diagnosa_inagrouper) {
            const diagnosaCodes = data.diagnosa_inagrouper.split('#').filter((code: string) => code.trim() !== '');
        }

        // Handle procedure inagrouper jika ada
        if (data.procedure_inagrouper) {
            const procedureCodes = data.procedure_inagrouper.split('#').filter((code: string) => code.trim() !== '');
        }
    };

    // Helper function untuk mencari nilai dari berbagai key yang mungkin
    const getValueFromKeys = (item: any, keys: string[]): string | null => {
        for (const key of keys) {
            if (item[key]) return item[key];
        }
        return null;
    };

    // Helper function untuk konversi array diagnosa/procedure ke format string
    const convertArrayToCodeString = (array: any[], codeFields: string[] = ['kode', 'code', 'kd_penyakit', 'kd_tindakan']) => {
        if (!Array.isArray(array)) return '';

        return array
            .map((item: any) => {
                // Coba berbagai nama field untuk kode
                for (const field of codeFields) {
                    if (item[field]) return item[field];
                }
                // Jika item adalah string langsung
                if (typeof item === 'string') return item;
                return null;
            })
            .filter((code: string) => code && code.trim() !== '')
            .join('#');
    };

    // Helper function untuk konversi array ke format UI
    const convertArrayToUIFormat = (array: any[], type: 'diagnosa' | 'procedure' = 'diagnosa') => {
        if (!Array.isArray(array)) return [];

        const codeFields = type === 'diagnosa' ? ['kode', 'code', 'kd_penyakit'] : ['kode', 'code', 'kd_tindakan'];
        const nameFields = type === 'diagnosa' ? ['nama', 'name', 'nm_penyakit'] : ['nama', 'name', 'nm_tindakan'];

        return array
            .map((item: any) => {
                let code = '';
                let name = '';

                // Cari kode
                for (const field of codeFields) {
                    if (item[field]) {
                        code = item[field];
                        break;
                    }
                }

                // Cari nama
                for (const field of nameFields) {
                    if (item[field]) {
                        name = item[field];
                        break;
                    }
                }

                // Fallback jika item adalah string
                if (!code && typeof item === 'string') {
                    code = item;
                    name = `${type === 'diagnosa' ? 'Diagnosa' : 'Procedure'} ${item}`;
                }

                // Fallback nama jika tidak ada
                if (code && !name) {
                    name = `${type === 'diagnosa' ? 'Diagnosa' : 'Procedure'} ${code}`;
                }

                return code ? { code, name } : null;
            })
            .filter((item: any): item is { code: string; name: string } => item !== null);
    };

    // Helper function untuk format rupiah tanpa trailing zeros
    const formatRupiah = (amount: string | number) => {
        if (!amount || amount === '' || amount === '0') return 'Rp 0';
        
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
        if (isNaN(num)) return 'Rp 0';
        
        // Format dengan pemisah ribuan, tanpa desimal jika nilai bulat
        const formatted = num % 1 === 0 
            ? num.toLocaleString('id-ID')
            : num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        
        return `Rp ${formatted}`;
    };

    // Helper function untuk parse input rupiah kembali ke angka
    const parseRupiah = (rupiahString: string): string => {
        if (!rupiahString) return '';
        // Hapus semua karakter selain angka, titik, dan tanda minus
        const cleaned = rupiahString.replace(/[^\d.-]/g, '');
        return cleaned;
    };

    // Function untuk menghitung total tarif
    const calculateTotalTarif = () => {
        const tarifFields = [
            'prosedur_non_bedah', 'prosedur_bedah', 'konsultasi', 'tenaga_ahli', 'keperawatan', 'penunjang',
            'radiologi', 'laboratorium', 'pelayanan_darah', 'rehabilitasi', 'kamar', 'rawat_intensif',
            'obat', 'obat_kronis', 'obat_kemoterapi', 'alkes', 'bmhp', 'sewa_alat'
        ];
        
        let total = 0;
        
        // Hitung total dari tarif RS
        tarifFields.forEach(field => {
            const value = getNestedValue('tarif_rs', field);
            const numValue = parseFloat(value) || 0;
            total += numValue;
        });
        
        // Tambahkan tarif tambahan
        const tarifPoliEks = parseFloat(formData.tarif_poli_eks) || 0;
        total += tarifPoliEks;
        
        return total;
    };

    // Component untuk currency input
    const CurrencyInput = ({ 
        label, 
        value, 
        onChange, 
        placeholder = "0",
        showFormatted = true 
    }: {
        label: string;
        value: string | number;
        onChange: (value: string) => void;
        placeholder?: string;
        showFormatted?: boolean;
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [displayValue, setDisplayValue] = useState('');

        useEffect(() => {
            if (!isEditing) {
                setDisplayValue(value ? value.toString() : '');
            }
        }, [value, isEditing]);

        const handleFocus = () => {
            setIsEditing(true);
            setDisplayValue(value ? value.toString() : '');
        };

        const handleBlur = () => {
            setIsEditing(false);
            const parsedValue = parseRupiah(displayValue);
            onChange(parsedValue);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setDisplayValue(e.target.value);
        };

        return (
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                <div className="relative">
                    <input
                        type="text"
                        value={isEditing ? displayValue : (showFormatted && value ? formatRupiah(value) : value || '')}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
            </div>
        );
    };

    // Helper functions untuk mengelola data form
    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    function toDatetimeLocal(value: string | undefined): string {
        if (!value) return '';
        // Coba parse dan format ke yyyy-MM-ddTHH:mm
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        // Pad dengan nol jika perlu
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    const setMultipleFields = (fields: { [key: string]: any }) => {
        setFormData((prev) => ({
            ...prev,
            ...fields,
        }));
    };

    const updateNestedField = (parent: string, field: string, value: any) => {
        const keys = parent.split('.');
        setFormData((prev) => {
            const newData = { ...prev };
            let current = newData;

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (i === keys.length - 1) {
                    if (!current[key]) current[key] = {};
                    current[key][field] = value;
                } else {
                    if (!current[key]) current[key] = {};
                    current = current[key];
                }
            }
            return newData;
        });
    };

    const getNestedValue = (parent: string, field: string) => {
        const keys = parent.split('.');
        let current = formData;
        for (const key of keys) {
            if (!current || !current[key]) return '';
            current = current[key];
        }
        return current[field] || '';
    };

    const handleSelectDiagnosis = (diagnosis: { name: string; code: string }) => {
        const newSelected = [...selectedDiagnoses, diagnosis];
        setSelectedDiagnoses(newSelected);
        const codes = newSelected.map((d) => d.code).join('#');
        updateField('diagnosa', codes);
    };

    const handleRemoveDiagnosis = (code: string) => {
        const newSelected = selectedDiagnoses.filter((d) => d.code !== code);
        setSelectedDiagnoses(newSelected);
        const codes = newSelected.map((d) => d.code).join('#');
        updateField('diagnosa', codes);
    };

    const handleSelectProcedure = (procedure: { name: string; code: string }) => {
        const newSelected = [...selectedProcedures, procedure];
        setSelectedProcedures(newSelected);
        const codes = newSelected.map((p) => p.code).join('#');
        updateField('procedure', codes);
    };

    const handleRemoveProcedure = (code: string) => {
        const newSelected = selectedProcedures.filter((p) => p.code !== code);
        setSelectedProcedures(newSelected);
        const codes = newSelected.map((p) => p.code).join('#');
        updateField('procedure', codes);
    };

    const handleSelectInagrouperDiagnosis = (diagnosis: { name: string; code: string }) => {
        const newSelected = [...selectedInagrouperDiagnoses, diagnosis];
        setSelectedInagrouperDiagnoses(newSelected);
        const codes = newSelected.map((d) => d.code).join('#');
        updateField('diagnosa_inagrouper', codes);
    };

    const handleRemoveInagrouperDiagnosis = (code: string) => {
        const newSelected = selectedInagrouperDiagnoses.filter((d) => d.code !== code);
        setSelectedInagrouperDiagnoses(newSelected);
        const codes = newSelected.map((d) => d.code).join('#');
        updateField('diagnosa_inagrouper', codes);
    };

    const handleSelectInagrouperProcedure = (procedure: { name: string; code: string }) => {
        const newSelected = [...selectedInagrouperProcedures, procedure];
        setSelectedInagrouperProcedures(newSelected);
        const codes = newSelected.map((p) => p.code).join('#');
        updateField('procedure_inagrouper', codes);
    };

    const handleRemoveInagrouperProcedure = (code: string) => {
        const newSelected = selectedInagrouperProcedures.filter((p) => p.code !== code);
        setSelectedInagrouperProcedures(newSelected);
        const codes = newSelected.map((p) => p.code).join('#');
        updateField('procedure_inagrouper', codes);
    };

    const handleSaveProgress = async () => {
        try {
            setIsLoading(true);
            await router.post(
                `/eklaim/klaim/${pengajuanKlaim.id}/save-progress`,
                {
                    data: formData,
                },
                {
                    preserveState: true,
                    onSuccess: () => {
                        toast.success('Progress berhasil disimpan');
                    },
                    onError: () => {
                        toast.error('Gagal menyimpan progress');
                    },
                },
            );
        } catch (error) {
            console.error('Error saving progress:', error);
            toast.error('Terjadi kesalahan saat menyimpan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitKlaim = async () => {
        try {
            setIsLoading(true);
            await router.post(
                `/eklaim/klaim/${pengajuanKlaim.id}/submit`,
                {
                    data: formData,
                },
                {
                    onSuccess: () => {
                        toast.success('Klaim berhasil disubmit ke BPJS');
                        router.visit('/eklaim/pengajuan');
                    },
                    onError: () => {
                        toast.error('Gagal submit klaim');
                    },
                },
            );
        } catch (error) {
            console.error('Error submitting klaim:', error);
            toast.error('Terjadi kesalahan saat submit');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Entry Klaim - ${pengajuanKlaim.nama_pasien}`} />

            <div className="min-h-screen py-6">
                <div className="mx-auto max-w-7xl px-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold text-gray-900">Form E-Klaim</h1>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">{pengajuanKlaim.nama_pasien}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-medium">{pengajuanKlaim.norm}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Dasar Pasien */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Informasi Dasar Pasien</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Nomor SEP <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomor_sep || ''}
                                    onChange={(e) => updateField('nomor_sep', e.target.value)}
                                    placeholder="Masukkan nomor SEP"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Nomor Kartu BPJS <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomor_kartu || ''}
                                    onChange={(e) => updateField('nomor_kartu', e.target.value)}
                                    placeholder="Masukkan nomor kartu"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Nomor Kartu</label>
                                <SearchableSelect
                                    options={[
                                        { value: 'nik', label: 'NIK' },
                                        { value: 'noka', label: 'No Kartu' },
                                        { value: 'kitas', label: 'KITAS/KITAP' },
                                        { value: 'paspor', label: 'Passport' },
                                        { value: 'kartu_jkn', label: 'Kartu JKN' },
                                        { value: 'kk', label: 'Kartu Keluarga' },
                                        { value: 'unhcr', label: 'UNHCR' },
                                        { value: 'kelurahan', label: 'Kelurahan' },
                                        { value: 'dinsos', label: 'Dinsos' },
                                        { value: 'dinkes', label: 'Dinkes' },
                                        { value: 'sjp', label: 'SJP' },
                                        { value: 'klaim_ibu', label: 'Klaim Ibu' },
                                        { value: 'lainnya', label: 'Lainnya' },
                                    ]}
                                    value={formData.nomor_kartu_t || ''}
                                    onSelect={(value) => updateField('nomor_kartu_t', value)}
                                    placeholder="Pilih tipe kartu..."
                                    searchPlaceholder="Cari tipe kartu..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Status Bayi Lahir</label>
                                <SearchableSelect
                                    options={[
                                        { value: '1', label: 'Tanpa Kelainan' },
                                        { value: '2', label: 'Dengan Kelainan' },
                                    ]}
                                    value={formData.bayi_lahir_status_cd || ''}
                                    onSelect={(value) => updateField('bayi_lahir_status_cd', value)}
                                    placeholder="Pilih status bayi..."
                                    searchPlaceholder="Cari status bayi..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Status COVID-19</label>
                                <SearchableSelect
                                    options={[
                                        { value: '1', label: 'ODP' },
                                        { value: '2', label: 'PDP' },
                                        { value: '3', label: 'Terkonfirmasi Positif' },
                                        { value: '4', label: 'Suspek' },
                                        { value: '5', label: 'Probabel' },
                                    ]}
                                    value={formData.covid19_status_cd || ''}
                                    onSelect={(value) => updateField('covid19_status_cd', value)}
                                    placeholder="Pilih status COVID-19..."
                                    searchPlaceholder="Cari status COVID-19..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Payor ID</label>
                                <SearchableSelect
                                    options={[
                                        { value: '3', label: 'JKN' },
                                        { value: '73', label: 'Jaminan Bayi Baru Lahir' },
                                    ]}
                                    value={formData.payor_id || ''}
                                    onSelect={(value) => updateField('payor_id', value)}
                                    placeholder="Pilih payor..."
                                    searchPlaceholder="Cari payor..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Payor Code</label>
                                <input
                                    type="text"
                                    value={formData.payor_cd || ''}
                                    onChange={(e) => updateField('payor_cd', e.target.value)}
                                    placeholder="Kode payor"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">COB Code</label>
                                <input
                                    type="text"
                                    value={formData.cob_cd || ''}
                                    onChange={(e) => updateField('cob_cd', e.target.value)}
                                    placeholder="Kode COB"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Informasi Rawat */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Informasi Rawat</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Tanggal Masuk <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.tgl_masuk || ''}
                                    onChange={(e) => updateField('tgl_masuk', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Tanggal Pulang <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.tgl_pulang || ''}
                                    onChange={(e) => updateField('tgl_pulang', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Cara Masuk <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={referenceData.cara_masuk_options || []}
                                    value={formData.cara_masuk || ''}
                                    onSelect={(value) => updateField('cara_masuk', value)}
                                    placeholder="Pilih cara masuk..."
                                    searchPlaceholder="Cari cara masuk..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Jenis Rawat <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={referenceData.jenis_rawat_options || []}
                                    value={formData.jenis_rawat || ''}
                                    onSelect={(value) => updateField('jenis_rawat', value)}
                                    placeholder="Pilih jenis rawat..."
                                    searchPlaceholder="Cari jenis rawat..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Kelas Rawat <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={referenceData.kelas_rawat_options || []}
                                    value={formData.kelas_rawat || ''}
                                    onSelect={(value) => updateField('kelas_rawat', value)}
                                    placeholder="Pilih kelas rawat..."
                                    searchPlaceholder="Cari kelas rawat..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Status Pulang <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={referenceData.discharge_status_options || []}
                                    value={formData.discharge_status || ''}
                                    onSelect={(value) => updateField('discharge_status', value)}
                                    placeholder="Pilih status pulang..."
                                    searchPlaceholder="Cari status pulang..."
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Nama Dokter <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama_dokter || ''}
                                    onChange={(e) => updateField('nama_dokter', e.target.value)}
                                    placeholder="Nama dokter"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Kode Tarif</label>
                                <input
                                    type="text"
                                    value={formData.kode_tarif || ''}
                                    onChange={(e) => updateField('kode_tarif', e.target.value)}
                                    placeholder="Kode tarif"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">NIK Coder</label>
                                <input
                                    type="text"
                                    value={formData.coder_nik || ''}
                                    onChange={(e) => updateField('coder_nik', e.target.value)}
                                    placeholder="NIK Coder"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Episodes</label>
                                <input
                                    type="text"
                                    value={formData.episodes || ''}
                                    onChange={(e) => updateField('episodes', e.target.value)}
                                    placeholder="1;12#2;3#6;5"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Medis & Vital Signs */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Data Medis & Vital Signs</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Berat Badan (kg)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.birth_weight || ''}
                                    onChange={(e) => updateField('birth_weight', e.target.value)}
                                    placeholder="0.0"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Sistole (mmHg) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={formData.sistole || ''}
                                    onChange={(e) => updateField('sistole', e.target.value)}
                                    placeholder="120"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Diastole (mmHg) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={formData.diastole || ''}
                                    onChange={(e) => updateField('diastole', e.target.value)}
                                    placeholder="80"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">ADL Sub Acute</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={formData.adl_sub_acute || ''}
                                    onChange={(e) => updateField('adl_sub_acute', e.target.value)}
                                    placeholder="15"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">ADL Chronic</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={formData.adl_chronic || ''}
                                    onChange={(e) => updateField('adl_chronic', e.target.value)}
                                    placeholder="12"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Kantong Darah</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.kantong_darah || ''}
                                    onChange={(e) => updateField('kantong_darah', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Ventilator Hour</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.ventilator_hour || ''}
                                    onChange={(e) => updateField('ventilator_hour', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">ICU LOS (hari)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.icu_los || ''}
                                    onChange={(e) => updateField('icu_los', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="dializer_single_use"
                                    checked={formData.dializer_single_use === '1' || formData.dializer_single_use === true}
                                    onChange={(e) => updateField('dializer_single_use', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="dializer_single_use" className="ml-2 text-sm text-gray-700">
                                    Dializer Single Use
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="alteplase_ind"
                                    checked={formData.alteplase_ind === '1' || formData.alteplase_ind === true}
                                    onChange={(e) => updateField('alteplase_ind', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="alteplase_ind" className="ml-2 text-sm text-gray-700">
                                    Alteplase
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="icu_indikator"
                                    checked={formData.icu_indikator === '1' || formData.icu_indikator === true}
                                    onChange={(e) => updateField('icu_indikator', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="icu_indikator" className="ml-2 text-sm text-gray-700">
                                    ICU Indikator
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="upgrade_class_ind"
                                    checked={formData.upgrade_class_ind === '1' || formData.upgrade_class_ind === true}
                                    onChange={(e) => updateField('upgrade_class_ind', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="upgrade_class_ind" className="ml-2 text-sm text-gray-700">
                                    Naik Kelas
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="covid19_cc_ind"
                                    checked={formData.covid19_cc_ind === '1' || formData.covid19_cc_ind === true}
                                    onChange={(e) => updateField('covid19_cc_ind', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="covid19_cc_ind" className="ml-2 text-sm text-gray-700">
                                    COVID-19 Indikator
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="covid19_rs_darurat_ind"
                                    checked={formData.covid19_rs_darurat_ind === '1' || formData.covid19_rs_darurat_ind === true}
                                    onChange={(e) => {
                                        updateField('covid19_rs_darurat_ind', e.target.checked ? '1' : '0');
                                        // Show/hide COVID details
                                        const covidDetails = document.getElementById('covid-details');
                                        if (covidDetails) {
                                            covidDetails.style.display = e.target.checked ? 'block' : 'none';
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="covid19_rs_darurat_ind" className="ml-2 text-sm text-gray-700">
                                    COVID-19 RS Darurat
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="covid19_co_insidense_ind"
                                    checked={formData.covid19_co_insidense_ind === '1' || formData.covid19_co_insidense_ind === true}
                                    onChange={(e) => updateField('covid19_co_insidense_ind', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="covid19_co_insidense_ind" className="ml-2 text-sm text-gray-700">
                                    COVID-19 Co-Insidense
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isoman_ind"
                                    checked={formData.isoman_ind === '1' || formData.isoman_ind === true}
                                    onChange={(e) => updateField('isoman_ind', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isoman_ind" className="ml-2 text-sm text-gray-700">
                                    Isolasi Mandiri
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* COVID-19 & Special Fields */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">COVID-19 & Special Fields</h3>

                        {/* COVID-19 RS Darurat Indicator */}
                        <div className="mb-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="covid19_rs_darurat_ind"
                                    checked={formData.covid19_rs_darurat_ind === '1'}
                                    onChange={(e) => {
                                        updateField('covid19_rs_darurat_ind', e.target.checked ? '1' : '0');
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="covid19_rs_darurat_ind" className="text-sm font-medium text-gray-700">
                                    Pasien dirawat di RS darurat/lapangan COVID-19
                                </label>
                            </div>
                        </div>

                        {/* COVID-19 Details - Show only if RS darurat indicator is checked */}
                        {formData.covid19_rs_darurat_ind === '1' && (
                            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <h4 className="mb-4 font-semibold text-gray-900">Detail COVID-19</h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Status COVID-19</label>
                                        <SearchableSelect
                                            options={[
                                                { value: '1', label: 'ODP' },
                                                { value: '2', label: 'PDP' },
                                                { value: '3', label: 'Terkonfirmasi Positif' },
                                                { value: '4', label: 'Suspek' },
                                                { value: '5', label: 'Probabel' },
                                            ]}
                                            value={formData.covid19_status_cd || ''}
                                            onSelect={(value) => updateField('covid19_status_cd', value)}
                                            placeholder="Pilih status COVID-19..."
                                            searchPlaceholder="Cari status COVID-19..."
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Tipe Nomor Kartu</label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'nik', label: 'NIK' },
                                                { value: 'noka', label: 'No Kartu' },
                                                { value: 'kitas', label: 'KITAS/KITAP' },
                                                { value: 'paspor', label: 'Passport' },
                                                { value: 'kartu_jkn', label: 'Kartu JKN' },
                                                { value: 'kk', label: 'Kartu Keluarga' },
                                                { value: 'unhcr', label: 'UNHCR' },
                                                { value: 'kelurahan', label: 'Kelurahan' },
                                                { value: 'dinsos', label: 'Dinsos' },
                                                { value: 'dinkes', label: 'Dinkes' },
                                                { value: 'sjp', label: 'SJP' },
                                                { value: 'klaim_ibu', label: 'Klaim Ibu' },
                                                { value: 'lainnya', label: 'Lainnya' },
                                            ]}
                                            value={formData.nomor_kartu_t || ''}
                                            onSelect={(value) => updateField('nomor_kartu_t', value)}
                                            placeholder="Pilih tipe kartu..."
                                            searchPlaceholder="Cari tipe kartu..."
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Episodes Perawatan</label>
                                        <input
                                            type="text"
                                            value={formData.episodes || ''}
                                            onChange={(e) => updateField('episodes', e.target.value)}
                                            placeholder="1;12#2;3#6;5"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Format: jenis_ruangan;lama_hari#... (contoh: 1;12#2;3)</p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Akses NAAT</label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'A', label: 'Kategori A' },
                                                { value: 'B', label: 'Kategori B' },
                                                { value: 'C', label: 'Kategori C' },
                                            ]}
                                            value={formData.akses_naat || ''}
                                            onSelect={(value) => updateField('akses_naat', value)}
                                            placeholder="Pilih kategori NAAT..."
                                            searchPlaceholder="Cari kategori..."
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Terapi Konvalesen</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.terapi_konvalesen || ''}
                                            onChange={(e) => updateField('terapi_konvalesen', e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Sebelum 1 Okt 2021: nilai rupiah, setelah: jumlah kantong</p>
                                    </div>
                                </div>

                                {/* COVID-19 Checkboxes */}
                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="covid19_cc_ind"
                                            checked={formData.covid19_cc_ind === '1'}
                                            onChange={(e) => updateField('covid19_cc_ind', e.target.checked ? '1' : '0')}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="covid19_cc_ind" className="text-sm text-gray-700">
                                            Ada Comorbidity/Complexity
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="covid19_co_insidense_ind"
                                            checked={formData.covid19_co_insidense_ind === '1'}
                                            onChange={(e) => updateField('covid19_co_insidense_ind', e.target.checked ? '1' : '0')}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="covid19_co_insidense_ind" className="text-sm text-gray-700">
                                            Kasus Co-Insidence
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isoman_ind"
                                            checked={formData.isoman_ind === '1'}
                                            onChange={(e) => updateField('isoman_ind', e.target.checked ? '1' : '0')}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isoman_ind" className="text-sm text-gray-700">
                                            Isolasi Mandiri
                                        </label>
                                    </div>
                                </div>

                                {/* COVID-19 NO SEP for Co-Insidence */}
                                {formData.covid19_co_insidense_ind === '1' && (
                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Nomor Klaim COVID-19 Co-Insidence</label>
                                        <input
                                            type="text"
                                            value={formData.covid19_no_sep || ''}
                                            onChange={(e) => updateField('covid19_no_sep', e.target.value)}
                                            placeholder="Nomor klaim COVID-19"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Other Special Fields */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Status Bayi Lahir</label>
                                <SearchableSelect
                                    options={[
                                        { value: '1', label: 'Tanpa Kelainan' },
                                        { value: '2', label: 'Dengan Kelainan' },
                                    ]}
                                    value={formData.bayi_lahir_status_cd || ''}
                                    onSelect={(value) => updateField('bayi_lahir_status_cd', value)}
                                    placeholder="Pilih status bayi..."
                                    searchPlaceholder="Cari status bayi..."
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Kantong Darah</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.kantong_darah || ''}
                                    onChange={(e) => updateField('kantong_darah', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="dializer_single_use"
                                    checked={formData.dializer_single_use === '1'}
                                    onChange={(e) => updateField('dializer_single_use', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="dializer_single_use" className="text-sm text-gray-700">
                                    Dializer Single Use (Hemodialisa)
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="alteplase_ind"
                                    checked={formData.alteplase_ind === '1'}
                                    onChange={(e) => updateField('alteplase_ind', e.target.checked ? '1' : '0')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="alteplase_ind" className="text-sm text-gray-700">
                                    Pemberian Alteplase
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Pemulasaraan Jenazah */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Pemulasaraan Jenazah</h3>

                        {/* Pemulasaraan Jenazah Indicator */}
                        <div className="mb-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="pemulasaraan_jenazah"
                                    checked={formData.pemulasaraan_jenazah === '1'}
                                    onChange={(e) => {
                                        updateField('pemulasaraan_jenazah', e.target.checked ? '1' : '0');
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="pemulasaraan_jenazah" className="text-sm font-medium text-gray-700">
                                    Ada pemakaian tambahan pemulasaraan jenazah (Pasien COVID-19 meninggal)
                                </label>
                            </div>
                        </div>

                        {/* Pemulasaraan Details - Show only if indicator is checked */}
                        {formData.pemulasaraan_jenazah === '1' && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <h4 className="mb-4 font-semibold text-gray-900">Detail Pemulasaraan Jenazah</h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Kantong Jenazah</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.kantong_jenazah || ''}
                                            onChange={(e) => updateField('kantong_jenazah', e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Peti Jenazah</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.peti_jenazah || ''}
                                            onChange={(e) => updateField('peti_jenazah', e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Plastik Erat</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.plastik_erat || ''}
                                            onChange={(e) => updateField('plastik_erat', e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Desinfektan Jenazah</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.desinfektan_jenazah || ''}
                                            onChange={(e) => updateField('desinfektan_jenazah', e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="mobil_jenazah"
                                            checked={formData.mobil_jenazah === '1'}
                                            onChange={(e) => updateField('mobil_jenazah', e.target.checked ? '1' : '0')}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="mobil_jenazah" className="text-sm text-gray-700">
                                            Mobil Jenazah
                                        </label>
                                    </div>

                                    {formData.mobil_jenazah === '1' && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Desinfektan Mobil Jenazah</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.desinfektan_mobil_jenazah || ''}
                                                onChange={(e) => updateField('desinfektan_mobil_jenazah', e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* APGAR Score */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">APGAR Score (Penilaian Bayi Baru Lahir)</h3>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* APGAR Menit 1 */}
                            <div>
                                <h4 className="mb-4 text-lg font-semibold text-gray-700">APGAR Menit 1</h4>
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Appearance (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_1', 'appearance')}
                                            onChange={(e) => updateNestedField('apgar.menit_1', 'appearance', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Pulse (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_1', 'pulse')}
                                            onChange={(e) => updateNestedField('apgar.menit_1', 'pulse', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Grimace (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_1', 'grimace')}
                                            onChange={(e) => updateNestedField('apgar.menit_1', 'grimace', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Activity (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_1', 'activity')}
                                            onChange={(e) => updateNestedField('apgar.menit_1', 'activity', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Respiration (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_1', 'respiration')}
                                            onChange={(e) => updateNestedField('apgar.menit_1', 'respiration', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* APGAR Menit 5 */}
                            <div>
                                <h4 className="mb-4 text-lg font-semibold text-gray-700">APGAR Menit 5</h4>
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Appearance (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_5', 'appearance')}
                                            onChange={(e) => updateNestedField('apgar.menit_5', 'appearance', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Pulse (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_5', 'pulse')}
                                            onChange={(e) => updateNestedField('apgar.menit_5', 'pulse', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Grimace (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_5', 'grimace')}
                                            onChange={(e) => updateNestedField('apgar.menit_5', 'grimace', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Activity (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_5', 'activity')}
                                            onChange={(e) => updateNestedField('apgar.menit_5', 'activity', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Respiration (0-2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            defaultValue={getNestedValue('apgar.menit_5', 'respiration')}
                                            onChange={(e) => updateNestedField('apgar.menit_5', 'respiration', e.target.value)}
                                            placeholder="0"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ICU & Ventilator */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">ICU & Ventilator</h3>
                        <div className="space-y-6">
                            {/* ICU Indicator Checkbox */}
                            <div className="mb-4">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="icu_indikator"
                                        checked={formData.icu_indikator === '1'}
                                        onChange={(e) => {
                                            updateField('icu_indikator', e.target.checked ? '1' : '0');
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="icu_indikator" className="text-sm font-medium text-gray-700">
                                        Pasien masuk ICU selama episode perawatan
                                    </label>
                                </div>
                            </div>

                            {/* ICU Details - Show only if ICU indicator is checked */}
                            {formData.icu_indikator === '1' && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <h4 className="mb-4 font-semibold text-gray-900">Detail ICU</h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Jumlah Hari ICU</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.icu_los || ''}
                                                onChange={(e) => updateField('icu_los', e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Ventilator Section */}
                                    <div className="mt-6">
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id="ventilator_use_ind"
                                                    checked={formData.ventilator?.use_ind === '1'}
                                                    onChange={(e) => {
                                                        updateNestedField('ventilator', 'use_ind', e.target.checked ? '1' : '0');
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <label htmlFor="ventilator_use_ind" className="text-sm font-medium text-gray-700">
                                                    Penggunaan Ventilator
                                                </label>
                                            </div>
                                        </div>

                                        {/* Ventilator Details - Show only if ventilator is used */}
                                        {formData.ventilator?.use_ind === '1' && (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Total Jam Ventilator</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.ventilator_hour || ''}
                                                        onChange={(e) => updateField('ventilator_hour', e.target.value)}
                                                        placeholder="0"
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Waktu Mulai Ventilator</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={getNestedValue('ventilator', 'start_dttm') || ''}
                                                        onChange={(e) => updateNestedField('ventilator', 'start_dttm', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Waktu Selesai Ventilator</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={getNestedValue('ventilator', 'stop_dttm') || ''}
                                                        onChange={(e) => updateNestedField('ventilator', 'stop_dttm', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Naik Kelas */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Naik Kelas</h3>
                        <div className="space-y-6">
                            {/* Upgrade Class Indicator Checkbox */}
                            <div className="mb-4">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="upgrade_class_ind"
                                        checked={formData.upgrade_class_ind === '1'}
                                        onChange={(e) => {
                                            updateField('upgrade_class_ind', e.target.checked ? '1' : '0');
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="upgrade_class_ind" className="text-sm font-medium text-gray-700">
                                        Pasien naik kelas perawatan
                                    </label>
                                </div>
                            </div>

                            {/* Upgrade Class Details - Show only if upgrade indicator is checked */}
                            {formData.upgrade_class_ind === '1' && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <h4 className="mb-4 font-semibold text-gray-900">Detail Naik Kelas</h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Kelas Yang Dituju</label>
                                            <SearchableSelect
                                                options={[
                                                    { value: 'kelas_1', label: 'Kelas 1' },
                                                    { value: 'kelas_2', label: 'Kelas 2' },
                                                    { value: 'vip', label: 'VIP' },
                                                    { value: 'vvip', label: 'VVIP' },
                                                ]}
                                                value={formData.upgrade_class_class || ''}
                                                onSelect={(value) => updateField('upgrade_class_class', value)}
                                                placeholder="Pilih kelas tujuan..."
                                                searchPlaceholder="Cari kelas..."
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Lama Hari Naik Kelas</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.upgrade_class_los || ''}
                                                onChange={(e) => updateField('upgrade_class_los', e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Pembayar Naik Kelas</label>
                                            <SearchableSelect
                                                options={[
                                                    { value: 'peserta', label: 'Peserta' },
                                                    { value: 'pemberi_kerja', label: 'Pemberi Kerja' },
                                                    { value: 'asuransi_tambahan', label: 'Asuransi Tambahan' },
                                                ]}
                                                value={formData.upgrade_class_payor || ''}
                                                onSelect={(value) => updateField('upgrade_class_payor', value)}
                                                placeholder="Pilih pembayar..."
                                                searchPlaceholder="Cari pembayar..."
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Persentase Tambahan Biaya (%) - Khusus untuk VIP/VVIP
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.add_payment_pct || ''}
                                                onChange={(e) => updateField('add_payment_pct', e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Diagnosa & Prosedur */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Diagnosa & Prosedur</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Diagnosa */}
                            <div>
                                <h4 className="mb-4 font-semibold text-gray-900">Diagnosa ICD-10</h4>
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Kode Diagnosa</label>
                                    <div
                                        className="relative min-h-[42px] w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500"
                                        onClick={() => setIsDiagnosisModalOpen(true)}
                                    >
                                        <div className="flex min-h-[26px] flex-wrap items-center gap-1">
                                            {selectedDiagnoses.length > 0 ? (
                                                selectedDiagnoses.map((diagnosis) => (
                                                    <span
                                                        key={diagnosis.code}
                                                        className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
                                                    >
                                                        {diagnosis.code} -{' '}
                                                        {diagnosis.name.length > 30 ? diagnosis.name.substring(0, 30) + '...' : diagnosis.name}
                                                        <button
                                                            type="button"
                                                            className="ml-1 inline-flex h-3 w-3 cursor-pointer items-center justify-center hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveDiagnosis(diagnosis.code);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="flex items-center text-sm text-gray-500">
                                                    <Search className="mr-2 h-4 w-4" />
                                                    Klik untuk mencari dan memilih diagnosa...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Prosedur */}
                            <div>
                                <h4 className="mb-4 font-semibold text-gray-900">Prosedur ICD-9</h4>
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Kode Prosedur</label>
                                    <div
                                        className="relative min-h-[42px] w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500"
                                        onClick={() => setIsProcedureModalOpen(true)}
                                    >
                                        <div className="flex min-h-[26px] flex-wrap items-center gap-1">
                                            {selectedProcedures.length > 0 ? (
                                                selectedProcedures.map((procedure) => (
                                                    <span
                                                        key={procedure.code}
                                                        className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs text-green-800"
                                                    >
                                                        {procedure.code} -{' '}
                                                        {procedure.name.length > 30 ? procedure.name.substring(0, 30) + '...' : procedure.name}
                                                        <button
                                                            type="button"
                                                            className="ml-1 inline-flex h-3 w-3 cursor-pointer items-center justify-center hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveProcedure(procedure.code);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="flex items-center text-sm text-gray-500">
                                                    <Search className="mr-2 h-4 w-4" />
                                                    Klik untuk mencari dan memilih prosedur...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inagrouper Section */}
                        <div className="mt-8 border-t pt-6">
                            <h4 className="mb-4 font-semibold text-gray-900">Diagnosa & Prosedur Inagrouper</h4>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Diagnosa Inagrouper */}
                                <div>
                                    <h5 className="mb-4 font-medium text-gray-700">Diagnosa Inagrouper</h5>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Kode Diagnosa</label>
                                        <div
                                            className="relative min-h-[42px] w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500"
                                            onClick={() => setIsInagrouperDiagnosisModalOpen(true)}
                                        >
                                            <div className="flex min-h-[26px] flex-wrap items-center gap-1">
                                                {selectedInagrouperDiagnoses.length > 0 ? (
                                                    selectedInagrouperDiagnoses.map((diagnosis) => (
                                                        <span
                                                            key={diagnosis.code}
                                                            className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-800"
                                                        >
                                                            {diagnosis.code} -{' '}
                                                            {diagnosis.name.length > 30 ? diagnosis.name.substring(0, 30) + '...' : diagnosis.name}
                                                            <button
                                                                type="button"
                                                                className="ml-1 inline-flex h-3 w-3 cursor-pointer items-center justify-center hover:text-red-500"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveInagrouperDiagnosis(diagnosis.code);
                                                                }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="flex items-center text-sm text-gray-500">
                                                        <Search className="mr-2 h-4 w-4" />
                                                        Klik untuk mencari dan memilih diagnosa inagrouper...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Prosedur Inagrouper */}
                                <div>
                                    <h5 className="mb-4 font-medium text-gray-700">Prosedur Inagrouper</h5>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Kode Prosedur</label>
                                        <div
                                            className="relative min-h-[42px] w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500"
                                            onClick={() => setIsInagrouperProcedureModalOpen(true)}
                                        >
                                            <div className="flex min-h-[26px] flex-wrap items-center gap-1">
                                                {selectedInagrouperProcedures.length > 0 ? (
                                                    selectedInagrouperProcedures.map((procedure) => (
                                                        <span
                                                            key={procedure.code}
                                                            className="inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs text-orange-800"
                                                        >
                                                            {procedure.code} -{' '}
                                                            {procedure.name.length > 30 ? procedure.name.substring(0, 30) + '...' : procedure.name}
                                                            <button
                                                                type="button"
                                                                className="ml-1 inline-flex h-3 w-3 cursor-pointer items-center justify-center hover:text-red-500"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveInagrouperProcedure(procedure.code);
                                                                }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="flex items-center text-sm text-gray-500">
                                                        <Search className="mr-2 h-4 w-4" />
                                                        Klik untuk mencari dan memilih prosedur inagrouper...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarif RS (Hospital Tariffs) */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Tarif Rumah Sakit</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <CurrencyInput
                                label="Prosedur Non Bedah"
                                value={getNestedValue('tarif_rs', 'prosedur_non_bedah') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'prosedur_non_bedah', value)}
                            />
                            <CurrencyInput
                                label="Prosedur Bedah"
                                value={getNestedValue('tarif_rs', 'prosedur_bedah') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'prosedur_bedah', value)}
                            />
                            <CurrencyInput
                                label="Konsultasi"
                                value={getNestedValue('tarif_rs', 'konsultasi') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'konsultasi', value)}
                            />
                            <CurrencyInput
                                label="Tenaga Ahli"
                                value={getNestedValue('tarif_rs', 'tenaga_ahli') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'tenaga_ahli', value)}
                            />
                            <CurrencyInput
                                label="Keperawatan"
                                value={getNestedValue('tarif_rs', 'keperawatan') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'keperawatan', value)}
                            />
                            <CurrencyInput
                                label="Penunjang"
                                value={getNestedValue('tarif_rs', 'penunjang') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'penunjang', value)}
                            />
                            <CurrencyInput
                                label="Radiologi"
                                value={getNestedValue('tarif_rs', 'radiologi') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'radiologi', value)}
                            />
                            <CurrencyInput
                                label="Laboratorium"
                                value={getNestedValue('tarif_rs', 'laboratorium') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'laboratorium', value)}
                            />
                            <CurrencyInput
                                label="Pelayanan Darah"
                                value={getNestedValue('tarif_rs', 'pelayanan_darah') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'pelayanan_darah', value)}
                            />
                            <CurrencyInput
                                label="Rehabilitasi"
                                value={getNestedValue('tarif_rs', 'rehabilitasi') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'rehabilitasi', value)}
                            />
                            <CurrencyInput
                                label="Kamar"
                                value={getNestedValue('tarif_rs', 'kamar') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'kamar', value)}
                            />
                            <CurrencyInput
                                label="Rawat Intensif"
                                value={getNestedValue('tarif_rs', 'rawat_intensif') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'rawat_intensif', value)}
                            />
                            <CurrencyInput
                                label="Obat"
                                value={getNestedValue('tarif_rs', 'obat') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'obat', value)}
                            />
                            <CurrencyInput
                                label="Obat Kronis"
                                value={getNestedValue('tarif_rs', 'obat_kronis') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'obat_kronis', value)}
                            />
                            <CurrencyInput
                                label="Obat Kemoterapi"
                                value={getNestedValue('tarif_rs', 'obat_kemoterapi') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'obat_kemoterapi', value)}
                            />
                            <CurrencyInput
                                label="Alat Kesehatan (Alkes)"
                                value={getNestedValue('tarif_rs', 'alkes') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'alkes', value)}
                            />
                            <CurrencyInput
                                label="BMHP"
                                value={getNestedValue('tarif_rs', 'bmhp') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'bmhp', value)}
                            />
                            <CurrencyInput
                                label="Sewa Alat"
                                value={getNestedValue('tarif_rs', 'sewa_alat') || ''}
                                onChange={(value) => updateNestedField('tarif_rs', 'sewa_alat', value)}
                            />
                        </div>

                        {/* Total Indicator */}
                        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-700">Total Tarif Rumah Sakit:</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {formatRupiah(calculateTotalTarif())}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tarif Tambahan */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Tarif Tambahan</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <CurrencyInput
                                label="Tarif Poli Eksekutif"
                                value={formData.tarif_poli_eks || ''}
                                onChange={(value) => updateField('tarif_poli_eks', value)}
                            />
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Add Payment PCT (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.add_payment_pct || ''}
                                    onChange={(e) => updateField('add_payment_pct', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Grand Total Indicator */}
                        <div className="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-semibold text-blue-800">TOTAL KESELURUHAN TARIF:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {formatRupiah(calculateTotalTarif())}
                                </span>
                            </div>
                            <div className="mt-2 text-sm text-blue-600">
                                Total mencakup semua tarif rumah sakit dan tarif tambahan
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleSaveProgress}
                            disabled={isLoading}
                            className="rounded-md bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Progress'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmitKlaim}
                            disabled={isLoading}
                            className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Mengirim...' : 'Submit Klaim'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <DiagnosisModal
                isOpen={isDiagnosisModalOpen}
                onClose={() => setIsDiagnosisModalOpen(false)}
                selectedDiagnosa={selectedDiagnoses}
                onSelectDiagnosis={handleSelectDiagnosis}
                onRemoveDiagnosis={handleRemoveDiagnosis}
            />

            <ProcedureModal
                isOpen={isProcedureModalOpen}
                onClose={() => setIsProcedureModalOpen(false)}
                selectedProcedures={selectedProcedures}
                onSelectProcedure={handleSelectProcedure}
                onRemoveProcedure={handleRemoveProcedure}
            />

            <DiagnosisModal
                isOpen={isInagrouperDiagnosisModalOpen}
                onClose={() => setIsInagrouperDiagnosisModalOpen(false)}
                selectedDiagnosa={selectedInagrouperDiagnoses}
                onSelectDiagnosis={handleSelectInagrouperDiagnosis}
                onRemoveDiagnosis={handleRemoveInagrouperDiagnosis}
            />

            <ProcedureModal
                isOpen={isInagrouperProcedureModalOpen}
                onClose={() => setIsInagrouperProcedureModalOpen(false)}
                selectedProcedures={selectedInagrouperProcedures}
                onSelectProcedure={handleSelectInagrouperProcedure}
                onRemoveProcedure={handleRemoveInagrouperProcedure}
            />
        </AppLayout>
    );
}
