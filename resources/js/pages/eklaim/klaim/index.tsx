import DiagnosisModal from '@/components/eklaim/DiagnosisModal';
import ProcedureModal from '@/components/eklaim/ProcedureModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Import tab components
import APGARTab from '@/components/eklaim/tabs/APGARTab';
import COVIDTab from '@/components/eklaim/tabs/COVIDTab';
import DataDiriTab from '@/components/eklaim/tabs/DataDiriTab';
import DataIDRGTab from '@/components/eklaim/tabs/DataIDRGTab';
import DataMedisTab from '@/components/eklaim/tabs/DataMedisTab';
import DataRSTab from '@/components/eklaim/tabs/DataRSTab';
import HasilGrouperTab from '@/components/eklaim/tabs/HasilGrouperTab';
import ICUTab from '@/components/eklaim/tabs/ICUTab';
import LainLainTab from '@/components/eklaim/tabs/LainLainTab';
import PersalinanTab from '@/components/eklaim/tabs/PersalinanTab';
import TarifTab from '@/components/eklaim/tabs/TarifTab';
import UpgradeKelasTab from '@/components/eklaim/tabs/UpgradeKelasTab';
import VentilatorTab from '@/components/eklaim/tabs/VentilatorTab';

// Import IDRG modals
import DiagnosisIDRGModal from '@/components/eklaim/DiagnosisIDRGModal';
import IdrgLockModal from '@/components/eklaim/IdrgLockModal';
import IdrgGroupingModal from '@/components/eklaim/IdrgGroupingModal';
import ProcedureIDRGModal from '@/components/eklaim/ProcedureIDRGModal';

// Helper functions for diagnosis and procedure formatting
const formatDiagnosesToString = (diagnoses: { name: string; code: string }[]): string => {
    if (!diagnoses || diagnoses.length === 0) return '';

    // Count occurrences of each code
    const codeCount: { [key: string]: number } = {};
    diagnoses.forEach((diag) => {
        if (diag.code) {
            codeCount[diag.code] = (codeCount[diag.code] || 0) + 1;
        }
    });

    // Build formatted string
    const formattedCodes = Object.keys(codeCount).map((code) => {
        const count = codeCount[code];
        return count > 1 ? `${code}+${count}` : code;
    });

    return formattedCodes.join('#');
};

const formatProceduresToString = (procedures: { name: string; code: string }[]): string => {
    if (!procedures || procedures.length === 0) return '';

    // Count occurrences of each code
    const codeCount: { [key: string]: number } = {};
    procedures.forEach((proc) => {
        if (proc.code) {
            codeCount[proc.code] = (codeCount[proc.code] || 0) + 1;
        }
    });

    // Build formatted string
    const formattedCodes = Object.keys(codeCount).map((code) => {
        const count = codeCount[code];
        return count > 1 ? `${code}+${count}` : code;
    });

    return formattedCodes.join('#');
};

const parseStringToDiagnoses = (diagnosesString: string): { name: string; code: string }[] => {
    if (!diagnosesString) return [];

    const codes = diagnosesString.split('#').filter((code) => code.trim() !== '');
    const result: { name: string; code: string }[] = [];

    codes.forEach((codeWithCount) => {
        const [code, countStr] = codeWithCount.split('+');
        const count = countStr ? parseInt(countStr) : 1;

        // Add multiple entries for repeated diagnoses
        for (let i = 0; i < count; i++) {
            result.push({
                name: `Diagnosa ${code}`,
                code: code,
            });
        }
    });

    return result;
};

const parseStringToProcedures = (proceduresString: string): { name: string; code: string }[] => {
    if (!proceduresString) return [];

    const codes = proceduresString.split('#').filter((code) => code.trim() !== '');
    const result: { name: string; code: string }[] = [];

    codes.forEach((codeWithCount) => {
        const [code, countStr] = codeWithCount.split('+');
        const count = countStr ? parseInt(countStr) : 1;

        // Add multiple entries for repeated procedures
        for (let i = 0; i < count; i++) {
            result.push({
                name: `Procedure ${code}`,
                code: code,
            });
        }
    });

    return result;
};

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
        idrg?: string | number | null;
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
    existingDataKlaim?: any;
    resumeMedis?: {
        diagnosa: any[];
        procedure: any[];
    };
    resumeMedisData?: any;
    pengkajianAwalData?: any;
    kunjunganbpjsData?: any;
    dataTagihan?: any;
    dataGroupper?: any;
    dataGrouperStage2?: any;
}

export default function Index() {
    const {
        auth,
        referenceData,
        pengajuanKlaim,
        resumeMedisData,
        pengkajianAwalData,
        kunjunganbpjsData,
        dataTagihan,
        existingDataKlaim,
        dataGroupper,
        dataGrouperStage2,
    } = usePage<Props>().props;
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pengajuan Klaim',
            href: '/eklaim/pengajuan',
        },
        {
            title: `${pengajuanKlaim.nomor_sep}`,
            href: `/eklaim/pengajuan/${pengajuanKlaim.id}/rm`,
        },
        {
            title: `Pengisian Klaim`,
            href: `#`,
        },
    ];

    const [activeTab, setActiveTab] = useState(1);

    // Force re-render of tab counters when formData changes
    const [counterUpdateKey, setCounterUpdateKey] = useState(0);

    useEffect(() => {
        setCounterUpdateKey((prev) => prev + 1);
    }, [formData]);

    // Alert dialog states
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
    const [isConfirmKirimOpen, setIsConfirmKirimOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Loading states untuk button baru
    const [isLoadingFinal, setIsLoadingFinal] = useState(false);
    const [isLoadingGrouperUlang, setIsLoadingGrouperUlang] = useState(false);
    const [isLoadingReedit, setIsLoadingReedit] = useState(false);
    const [isLoadingKirimInacbg, setIsLoadingKirimInacbg] = useState(false);

    // Check apakah klaim sudah final (status_pengiriman = 4 atau 5)
    const isKlaimFinal = pengajuanKlaim.status_pengiriman === 4 || pengajuanKlaim.status_pengiriman === 5;

    // Check apakah IDRG grouping sudah dilakukan
    const isIdrgGroupingRequired =
        pengajuanKlaim.idrg === '0' ||
        pengajuanKlaim.idrg === 0 ||
        !pengajuanKlaim.idrg ||
        pengajuanKlaim.idrg === null ||
        pengajuanKlaim.idrg === undefined;
    
    // Check apakah IDRG grouping sudah selesai (idrg = 1)
    const isIdrgGroupingComplete = pengajuanKlaim.idrg === 1 || pengajuanKlaim.idrg === '1';
    
    // Check apakah IDRG sudah final (idrg = 2)
    const isIdrgFinal = pengajuanKlaim.idrg === 2 || pengajuanKlaim.idrg === '2';
    
    // Logika penguncian tab:
    // - idrg = 0: Semua tab dikunci
    // - idrg = 1: Hanya tab IDRG yang aktif, tab lain dikunci
    // - idrg = 2: Semua tab normal (tidak dikunci)
    const shouldLockAllTabs = isIdrgGroupingRequired; // idrg = 0
    const shouldLockNonIdrgTabs = isIdrgGroupingComplete; // idrg = 1
    
    // Helper function untuk cek apakah tab tertentu harus dikunci
    const isTabLocked = (tabId: number): boolean => {
        // Jika idrg = 0, semua tab dikunci
        if (shouldLockAllTabs) return true;
        
        // Jika idrg = 1, hanya tab IDRG (id: 0) yang tidak dikunci
        if (shouldLockNonIdrgTabs && tabId !== 0) return true;
        
        // Jika idrg = 2, tidak ada tab yang dikunci
        return false;
    };

    // Helper function untuk check apakah ada special_cmg_option dan groupper stage 1 selesai
    const hasSpecialCmgOptions = (): boolean => {
        // Check dari dataGroupper apakah ada special_cmg_option
        if (dataGroupper?.special_cmg_option && Array.isArray(dataGroupper.special_cmg_option) && dataGroupper.special_cmg_option.length > 0) {
            return true;
        }

        return false;
    };

    // Helper function untuk check apakah groupper stage 1 sudah selesai
    const isGrouperStage1Complete = (): boolean => {
        return dataGroupper !== null && dataGroupper !== undefined;
    };

    // Wrapper functions untuk button clicks
    const handleFinalClick = () => {
        handleFinal();
    };

    const handleGrouperUlangClick = () => {
        handleGrouperUlang();
    };

    // Field mappings for each tab to count filled/empty fields
    interface TabFieldMapping {
        fields: string[];
        required?: string[];
        conditional?: {
            dependsOn: string;
            value: string;
            fields: string[];
        };
    }

    const tabFieldMappings: { [key: number]: TabFieldMapping } = {
        1: {
            // Data Diri
            fields: ['nomor_sep', 'nomor_kartu', 'tgl_masuk', 'tgl_pulang', 'cara_masuk', 'jenis_rawat', 'kelas_rawat'],
            required: ['nomor_sep', 'nomor_kartu', 'tgl_masuk', 'tgl_pulang', 'cara_masuk', 'jenis_rawat', 'kelas_rawat'],
        },
        2: {
            // ICU
            fields: ['icu_indikator', 'adl_sub_acute', 'adl_chronic', 'icu_los'],
            conditional: { dependsOn: 'icu_indikator', value: '1', fields: ['adl_sub_acute', 'adl_chronic', 'icu_los'] },
        },
        3: {
            // Ventilator
            fields: ['ventilator.use_ind', 'ventilator.start_dttm', 'ventilator.stop_dttm', 'ventilator_hour'],
            conditional: {
                dependsOn: 'ventilator.use_ind',
                value: '1',
                fields: ['ventilator.start_dttm', 'ventilator.stop_dttm', 'ventilator_hour'],
            },
        },
        4: {
            // Upgrade Kelas
            fields: ['upgrade_class_ind', 'upgrade_class_class', 'upgrade_class_los', 'upgrade_class_payor', 'add_payment_pct'],
            conditional: {
                dependsOn: 'upgrade_class_ind',
                value: '1',
                fields: ['upgrade_class_class', 'upgrade_class_los', 'upgrade_class_payor', 'add_payment_pct'],
            },
        },
        5: {
            // Data Medis
            fields: [
                'birth_weight',
                'sistole',
                'diastole',
                'discharge_status',
                'nama_dokter',
                'diagnosa',
                'procedure',
                'diagnosa_inagrouper',
                'procedure_inagrouper',
            ],
            required: ['discharge_status', 'nama_dokter'],
        },
        6: {
            // Tarif
            fields: [
                'tarif_rs.prosedur_non_bedah',
                'tarif_rs.prosedur_bedah',
                'tarif_rs.konsultasi',
                'tarif_rs.tenaga_ahli',
                'tarif_rs.keperawatan',
                'tarif_rs.penunjang',
                'tarif_rs.radiologi',
                'tarif_rs.laboratorium',
                'tarif_rs.pelayanan_darah',
                'tarif_rs.rehabilitasi',
                'tarif_rs.kamar',
                'tarif_rs.rawat_intensif',
                'tarif_rs.obat',
                'tarif_rs.obat_kronis',
                'tarif_rs.obat_kemoterapi',
                'tarif_rs.alkes',
                'tarif_rs.bmhp',
                'tarif_rs.sewa_alat',
            ],
        },
        7: {
            // COVID-19
            fields: [
                'pemulasaraan_jenazah',
                'kantong_jenazah',
                'peti_jenazah',
                'plastik_erat',
                'desinfektan_jenazah',
                'mobil_jenazah',
                'desinfektan_mobil_jenazah',
                'is_covid19_suspect',
                'is_covid19_probable',
                'is_covid19_confirmed',
            ],
        },
        8: {
            // APGAR Score
            fields: [
                'apgar.appearance_1',
                'apgar.pulse_1',
                'apgar.grimace_1',
                'apgar.activity_1',
                'apgar.respiration_1',
                'apgar.appearance_5',
                'apgar.pulse_5',
                'apgar.grimace_5',
                'apgar.activity_5',
                'apgar.respiration_5',
            ],
        },
        9: {
            // Persalinan
            fields: ['persalinan.usia_kehamilan', 'persalinan.gravida', 'persalinan.partus', 'persalinan.abortus', 'persalinan.onset_kontraksi'],
        },
        10: {
            // Lain-lain
            fields: [
                'terapi_konvalesen',
                'akses_naat',
                'isoman_ind',
                'bayi_lahir_status_cd',
                'dializer_single_use',
                'kantong_darah',
                'alteplase_ind',
            ],
        },
        11: {
            // Data RS
            fields: ['tarif_poli_eks', 'nama_dokter', 'kode_tarif', 'payor_id', 'payor_cd', 'cob_cd', 'coder_nik'],
        },
        12: {
            // Hasil Groupper (read-only tab)
            fields: [],
        },
    };

    // Function to get nested field value
    const getFieldValue = (fieldPath: string): any => {
        const keys = fieldPath.split('.');
        let value = formData;
        for (const key of keys) {
            if (!value || typeof value !== 'object') return '';
            value = value[key];
        }
        return value || '';
    };

    // Function to check if a field is filled (with proper handling for different data types)
    const isFieldFilled = (fieldPath: string): boolean => {
        const value = getFieldValue(fieldPath);

        if (typeof value === 'string') {
            return value.trim() !== '' && value.trim() !== '0';
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        if (typeof value === 'boolean') {
            return true; // Boolean values are always considered "filled"
        }
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length > 0;
        }

        return value !== null && value !== undefined && value !== '';
    };

    // Special function for Data RS tab to handle auto-filled fields
    const isDataRSFieldFilled = (fieldPath: string): boolean => {
        const value = getFieldValue(fieldPath);

        // For Data RS tab, treat any non-empty string as filled (including '0', 'DS', etc.)
        if (typeof value === 'string') {
            return value.trim() !== '';
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        if (typeof value === 'boolean') {
            return true;
        }
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length > 0;
        }

        return value !== null && value !== undefined && value !== '';
    };

    // Function to count fields for a specific tab
    const getTabFieldCount = (tabId: number): { filled: number; total: number } => {
        const tabMapping = tabFieldMappings[tabId];
        if (!tabMapping) return { filled: 0, total: 0 };

        let fields = [...tabMapping.fields];
        let filledCount = 0;

        // Handle conditional fields
        if (tabMapping.conditional) {
            const { dependsOn, value: requiredValue, fields: conditionalFields } = tabMapping.conditional;
            const dependentFieldValue = getFieldValue(dependsOn);

            if (dependentFieldValue !== requiredValue) {
                // Remove conditional fields from counting if condition not met
                fields = fields.filter((field) => !conditionalFields.includes(field));
            }
        }

        // Count filled fields - use special logic for Data RS tab (tab 11)
        fields.forEach((field) => {
            if (tabId === 11) {
                // Use special Data RS field checking logic
                if (isDataRSFieldFilled(field)) {
                    filledCount++;
                }
            } else {
                // Use normal field checking for all other tabs
                if (isFieldFilled(field)) {
                    filledCount++;
                }
            }
        });

        return { filled: filledCount, total: fields.length };
    };

    // Tab configuration
    const tabs = [
        ...((isIdrgGroupingComplete || isIdrgFinal) ? [{ id: 0, name: 'Data IDRG', icon: '🔐' }] : []),
        { id: 1, name: 'Data Diri', icon: '👤' },
        { id: 2, name: 'ICU', icon: '🏥' },
        { id: 3, name: 'Ventilator', icon: '🤧' },
        { id: 4, name: 'Upgrade Kelas', icon: '⬆️' },
        { id: 5, name: 'Data Medis', icon: '🩺' },
        { id: 6, name: 'Tarif', icon: '💰' },
        { id: 7, name: 'COVID-19', icon: '🦠' },
        { id: 8, name: 'APGAR Score', icon: '👶' },
        { id: 9, name: 'Persalinan', icon: '🤱' },
        { id: 10, name: 'Lain-lain', icon: '📋' },
        { id: 11, name: 'Data RS', icon: '🏥' },
        ...(dataGroupper || dataGrouperStage2 ? [{ id: 12, name: 'Hasil Groupper', icon: '📊' }] : []),
    ];

    const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isInagrouperDiagnosisModalOpen, setIsInagrouperDiagnosisModalOpen] = useState(false);
    const [isInagrouperProcedureModalOpen, setIsInagrouperProcedureModalOpen] = useState(false);

    // IDRG Form Modal States
    const [isIdrgLockModalOpen, setIsIdrgLockModalOpen] = useState(false);
    const [isIdrgGroupingModalOpen, setIsIdrgGroupingModalOpen] = useState(false);
    const [isIdrgDiagnosisModalOpen, setIsIdrgDiagnosisModalOpen] = useState(false);
    const [isIdrgProcedureModalOpen, setIsIdrgProcedureModalOpen] = useState(false);
    const [isIdrgGroupingLoading, setIsIdrgGroupingLoading] = useState(false);

    const [selectedDiagnoses, setSelectedDiagnoses] = useState<{ name: string; code: string }[]>([]);
    const [selectedProcedures, setSelectedProcedures] = useState<{ name: string; code: string }[]>([]);
    const [selectedInagrouperDiagnoses, setSelectedInagrouperDiagnoses] = useState<{ name: string; code: string }[]>([]);
    const [selectedInagrouperProcedures, setSelectedInagrouperProcedures] = useState<{ name: string; code: string }[]>([]);

    // IDRG Selected States
    const [selectedIdrgDiagnoses, setSelectedIdrgDiagnoses] = useState<{ name: string; code: string }[]>([]);
    const [selectedIdrgProcedures, setSelectedIdrgProcedures] = useState<{ name: string; code: string }[]>([]);

    // Set active tab to IDRG tab (0) if IDRG grouping is complete on initial load
    useEffect(() => {
        if (isIdrgGroupingComplete || isIdrgFinal) {
            setActiveTab(0);
        }
    }, [isIdrgGroupingComplete, isIdrgFinal]);

    // Load data otomatis saat komponen dimuat
    useEffect(() => {
        updateField('nomor_sep', pengajuanKlaim.nomor_sep || '');
        updateField('norm', pengajuanKlaim.norm || '');
        updateField('nama_pasien', pengajuanKlaim.nama_pasien || '');
        updateField('nomor_kartu', pengajuanKlaim.nomor_kartu || '');
        updateField('tgl_masuk', toDatetimeLocal(pengajuanKlaim.tanggal_masuk) || '');
        updateField('tgl_pulang', toDatetimeLocal(pengajuanKlaim.tanggal_keluar) || '');

        // Set default values for ICU, Ventilator, and Upgrade Class
        updateField('icu_indikator', '0');
        updateField('adl_sub_acute', '0');
        updateField('adl_chronic', '0');
        updateField('icu_los', '0');
        updateNestedField('ventilator', 'use_ind', '0');
        updateField('ventilator_hour', '0');
        updateField('upgrade_class_ind', '0');

        let jenisRawat = '';
        switch (pengajuanKlaim.jenis_kunjungan) {
            case 1:
            case 'Rawat Inap':
                jenisRawat = '1';
                break;
            case 2:
            case 'Rawat Jalan':
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
        if (resumeMedisData?.cara_keluar) {
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
                    caraKeluar = '1';
            }
        }
        updateField('discharge_status', caraKeluar);
        updateField('nama_dokter', resumeMedisData?.dokter || kunjunganbpjsData?.nama_dokter || '');

        let kelas_rwt = '';
        if (kunjunganbpjsData?.klsRawat) {
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
        }
        updateField('kelas_rawat', kelas_rwt || '');
        updateField('sistole', resumeMedisData?.tanda_vital_sistolik || '');
        updateField('diastole', resumeMedisData?.tanda_vital_distolik || '');

        if (resumeMedisData?.selected_diagnosa && Array.isArray(resumeMedisData.selected_diagnosa)) {
            const diagnosaCodes = convertArrayToCodeString(resumeMedisData.selected_diagnosa, ['kode', 'code', 'kd_penyakit']);
            updateField('diagnosa', diagnosaCodes);
            updateField('diagnosa_inagrouper', diagnosaCodes); // Set juga untuk inagrouper

            const diagnosesForUI = convertArrayToUIFormat(resumeMedisData.selected_diagnosa, 'diagnosa');
            setSelectedDiagnoses(diagnosesForUI);
            setSelectedInagrouperDiagnoses(diagnosesForUI); // Set juga untuk inagrouper
        }

        if (resumeMedisData?.selected_procedure && Array.isArray(resumeMedisData.selected_procedure)) {
            const procedureCodes = convertArrayToCodeString(resumeMedisData.selected_procedure, ['kode', 'code', 'kd_tindakan']);
            updateField('procedure', procedureCodes);
            updateField('procedure_inagrouper', procedureCodes); // Set juga untuk inagrouper

            const proceduresForUI = convertArrayToUIFormat(resumeMedisData.selected_procedure, 'procedure');
            setSelectedProcedures(proceduresForUI);
            setSelectedInagrouperProcedures(proceduresForUI); // Set juga untuk inagrouper
        }

        // Handle selected_diagnosa_inagrouper jika ada data terpisah untuk inagrouper (akan override data di atas)
        if (resumeMedisData?.selected_diagnosa_inagrouper && Array.isArray(resumeMedisData.selected_diagnosa_inagrouper)) {
            const diagnosaCodes = convertArrayToCodeString(resumeMedisData.selected_diagnosa_inagrouper, ['kode', 'code', 'kd_penyakit']);
            updateField('diagnosa_inagrouper', diagnosaCodes);

            const diagnosesForUI = convertArrayToUIFormat(resumeMedisData.selected_diagnosa_inagrouper, 'diagnosa');
            setSelectedInagrouperDiagnoses(diagnosesForUI);
        }

        // Handle selected_procedure_inagrouper jika ada data terpisah untuk inagrouper (akan override data di atas)
        if (resumeMedisData?.selected_procedure_inagrouper && Array.isArray(resumeMedisData.selected_procedure_inagrouper)) {
            const procedureCodes = convertArrayToCodeString(resumeMedisData.selected_procedure_inagrouper, ['kode', 'code', 'kd_tindakan']);
            updateField('procedure_inagrouper', procedureCodes);

            const proceduresForUI = convertArrayToUIFormat(resumeMedisData.selected_procedure_inagrouper, 'procedure');
            setSelectedInagrouperProcedures(proceduresForUI);
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

        // Set default values for Data RS tab fields to ensure they're counted as filled
        updateField('kode_tarif', 'DS');
        updateField('payor_id', '00003');
        updateField('payor_cd', 'JKN');

        // Set coder_nik from current user if available
        if (auth?.user?.nik) {
            updateField('coder_nik', auth.user.nik);
        }
    }, [pengajuanKlaim, resumeMedisData, pengkajianAwalData, kunjunganbpjsData, dataTagihan, auth]);

    // Separate useEffect to ensure coder_nik is always set from current user
    useEffect(() => {
        if (auth?.user?.nik && !formData.coder_nik) {
            updateField('coder_nik', auth.user.nik);
        }
    }, [auth?.user?.nik, formData.coder_nik]);

    // Load existing data klaim if exists
    useEffect(() => {
        if (existingDataKlaim) {
            // Load all basic fields from database
            // Exclude JSON fields from general loading (they're handled separately)
            const jsonFields = ['tarif_rs', 'apgar', 'ventilator', 'persalinan', 'covid19_penunjang_pengurang'];
            Object.keys(existingDataKlaim).forEach((key) => {
                if (existingDataKlaim[key] !== null && existingDataKlaim[key] !== undefined && key !== 'id' && !jsonFields.includes(key)) {
                    updateField(key, existingDataKlaim[key]);
                }
            });

            // Load nested field: tarif_rs (parse JSON if string)
            if (existingDataKlaim.tarif_rs) {
                let tarifData = existingDataKlaim.tarif_rs;
                if (typeof tarifData === 'string') {
                    try {
                        tarifData = JSON.parse(tarifData);
                    } catch (e) {
                        console.error('Failed to parse tarif_rs JSON:', e);
                        tarifData = {};
                    }
                }
                if (typeof tarifData === 'object' && tarifData) {
                    Object.keys(tarifData).forEach((tariffKey) => {
                        updateNestedField('tarif_rs', tariffKey, tarifData[tariffKey]);
                    });
                }
            }

            // Load nested field: apgar (parse JSON if string)
            if (existingDataKlaim.apgar) {
                let apgarData = existingDataKlaim.apgar;
                if (typeof apgarData === 'string') {
                    try {
                        apgarData = JSON.parse(apgarData);
                    } catch (e) {
                        console.error('Failed to parse apgar JSON:', e);
                        apgarData = {};
                    }
                }
                if (typeof apgarData === 'object' && apgarData) {
                    Object.keys(apgarData).forEach((apgarKey) => {
                        updateNestedField('apgar', apgarKey, apgarData[apgarKey]);
                    });
                }
            }

            // Load nested field: ventilator (parse JSON if string)
            if (existingDataKlaim.ventilator) {
                let ventilatorData = existingDataKlaim.ventilator;
                if (typeof ventilatorData === 'string') {
                    try {
                        ventilatorData = JSON.parse(ventilatorData);
                    } catch (e) {
                        console.error('Failed to parse ventilator JSON:', e);
                        ventilatorData = {};
                    }
                }
                if (typeof ventilatorData === 'object' && ventilatorData) {
                    Object.keys(ventilatorData).forEach((ventilatorKey) => {
                        updateNestedField('ventilator', ventilatorKey, ventilatorData[ventilatorKey]);
                    });
                }
            }

            // Load nested field: persalinan (parse JSON if string)
            if (existingDataKlaim.persalinan) {
                let persalinanData = existingDataKlaim.persalinan;
                if (typeof persalinanData === 'string') {
                    try {
                        persalinanData = JSON.parse(persalinanData);
                    } catch (e) {
                        console.error('Failed to parse persalinan JSON:', e);
                        persalinanData = {};
                    }
                }
                if (typeof persalinanData === 'object' && persalinanData) {
                    Object.keys(persalinanData).forEach((persalinanKey) => {
                        updateNestedField('persalinan', persalinanKey, persalinanData[persalinanKey]);
                    });
                }
            }

            // Load nested field: covid19_penunjang_pengurang (parse JSON if string)
            if (existingDataKlaim.covid19_penunjang_pengurang) {
                let covidData = existingDataKlaim.covid19_penunjang_pengurang;
                if (typeof covidData === 'string') {
                    try {
                        covidData = JSON.parse(covidData);
                    } catch (e) {
                        console.error('Failed to parse covid19_penunjang_pengurang JSON:', e);
                        covidData = {};
                    }
                }
                if (typeof covidData === 'object' && covidData) {
                    Object.keys(covidData).forEach((covidKey) => {
                        updateNestedField('covid19_penunjang_pengurang', covidKey, covidData[covidKey]);
                    });
                }
            }

            // Load nested field: upgrade_class (if stored as JSON in database)
            if (existingDataKlaim.upgrade_class && typeof existingDataKlaim.upgrade_class === 'object') {
                Object.keys(existingDataKlaim.upgrade_class).forEach((upgradeKey) => {
                    updateNestedField('upgrade_class', upgradeKey, existingDataKlaim.upgrade_class[upgradeKey]);
                });
            }

            // Load diagnosa and procedures from string format (S71.0#A00.1 or S71.0+2#A00.1)
            if (existingDataKlaim.diagnosa) {
                const diagnosesForUI = parseStringToDiagnoses(existingDataKlaim.diagnosa);
                setSelectedDiagnoses(diagnosesForUI);
            }

            if (existingDataKlaim.procedure) {
                const proceduresForUI = parseStringToProcedures(existingDataKlaim.procedure);
                setSelectedProcedures(proceduresForUI);
            }

            // Set for inagrouper if data exists
            if (existingDataKlaim.diagnosa_inagrouper) {
                const diagnosesForUI = parseStringToDiagnoses(existingDataKlaim.diagnosa_inagrouper);
                setSelectedInagrouperDiagnoses(diagnosesForUI);
            } else if (existingDataKlaim.diagnosa) {
                // If no separate inagrouper data, copy from main diagnosa
                const diagnosesForUI = parseStringToDiagnoses(existingDataKlaim.diagnosa);
                setSelectedInagrouperDiagnoses(diagnosesForUI);
            }

            if (existingDataKlaim.procedure_inagrouper) {
                const proceduresForUI = parseStringToProcedures(existingDataKlaim.procedure_inagrouper);
                setSelectedInagrouperProcedures(proceduresForUI);
            } else if (existingDataKlaim.procedure) {
                // If no separate inagrouper data, copy from main procedure
                const proceduresForUI = parseStringToProcedures(existingDataKlaim.procedure);
                setSelectedInagrouperProcedures(proceduresForUI);
            }

            // Special handling for date fields to ensure correct format
            if (existingDataKlaim.tanggal_masuk) {
                updateField('tgl_masuk', toDatetimeLocal(existingDataKlaim.tanggal_masuk));
            }
            if (existingDataKlaim.tanggal_keluar) {
                updateField('tgl_pulang', toDatetimeLocal(existingDataKlaim.tanggal_keluar));
            }

            // Special handling for currency/numeric fields with proper formatting
            const currencyFields = [
                'akomodasi',
                'asuhan_keperawatan',
                'bahan_medis_habis_pakai',
                'kamar_operasi',
                'konsultasi',
                'obat',
                'pelayanan_darah',
                'penunjang',
                'prosedur_bedah',
                'prosedur_non_bedah',
                'rehabilitasi',
                'sewa_alat',
                'visite',
                'icu',
                'iccu',
                'alat_kesehatan',
                'transport_pasien',
                'lain_lain',
                'tarif_poli_eks',
            ];

            currencyFields.forEach((field) => {
                if (existingDataKlaim[field] && existingDataKlaim[field] !== '0') {
                    updateField(field, existingDataKlaim[field].toString());
                }
            });

            // Load boolean fields properly
            const booleanFields = [
                'case_death',
                'upgrade_class_ind',
                'add_payment_pct',
                'birth_weight_extreme',
                'fetal_reduction',
                'admission_weight',
                'chronic_dialysis',
                'acute_dialysis',
                'ventilator_support',
                'chemotherapy',
                'is_covid19_suspect',
                'is_covid19_probable',
                'is_covid19_confirmed',
                'is_persalinan',
            ];

            booleanFields.forEach((field) => {
                if (existingDataKlaim[field] !== null && existingDataKlaim[field] !== undefined) {
                    updateField(field, existingDataKlaim[field] ? '1' : '0');
                }
            });

            // Debug specific important fields
            const importantFields = ['sistole', 'diastole', 'nama_dokter', 'jenis_rawat', 'discharge_status'];
            importantFields.forEach((field) => {});

            // Data loaded successfully - flash message will be handled by backend if needed
        }
    }, [existingDataKlaim]);

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
        const formatted =
            num % 1 === 0 ? num.toLocaleString('id-ID') : num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

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
            'prosedur_non_bedah',
            'prosedur_bedah',
            'konsultasi',
            'tenaga_ahli',
            'keperawatan',
            'penunjang',
            'radiologi',
            'laboratorium',
            'pelayanan_darah',
            'rehabilitasi',
            'kamar',
            'rawat_intensif',
            'obat',
            'obat_kronis',
            'obat_kemoterapi',
            'alkes',
            'bmhp',
            'sewa_alat',
        ];

        let total = 0;

        // Hitung total dari tarif RS
        tarifFields.forEach((field) => {
            const value = getNestedValue('tarif_rs', field);
            const numValue = parseFloat(value) || 0;
            total += numValue;
        });

        // Tambahkan tarif tambahan
        const tarifPoliEks = parseFloat(formData.tarif_poli_eks) || 0;
        total += tarifPoliEks;

        return total;
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
        // Parse the date string
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        
        // Format to local datetime string (YYYY-MM-DD HH:mm:ss) without timezone conversion
        const pad = (n: number) => n.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
        const codes = formatDiagnosesToString(newSelected);
        updateField('diagnosa', codes);
    };

    const handleRemoveDiagnosis = (code: string) => {
        // Remove only one instance of the diagnosis
        const indexToRemove = selectedDiagnoses.findIndex((d) => d.code === code);
        if (indexToRemove > -1) {
            const newSelected = [...selectedDiagnoses];
            newSelected.splice(indexToRemove, 1);
            setSelectedDiagnoses(newSelected);
            const codes = formatDiagnosesToString(newSelected);
            updateField('diagnosa', codes);
        }
    };

    const handleSelectProcedure = (procedure: { name: string; code: string }) => {
        const newSelected = [...selectedProcedures, procedure];
        setSelectedProcedures(newSelected);
        const codes = formatProceduresToString(newSelected);
        updateField('procedure', codes);
    };

    const handleRemoveProcedure = (code: string) => {
        // Remove only one instance of the procedure
        const indexToRemove = selectedProcedures.findIndex((p) => p.code === code);
        if (indexToRemove > -1) {
            const newSelected = [...selectedProcedures];
            newSelected.splice(indexToRemove, 1);
            setSelectedProcedures(newSelected);
            const codes = formatProceduresToString(newSelected);
            updateField('procedure', codes);
        }
    };
    const handleSelectInagrouperDiagnosis = (diagnosis: { name: string; code: string }) => {
        const newSelected = [...selectedInagrouperDiagnoses, diagnosis];
        setSelectedInagrouperDiagnoses(newSelected);
        const codes = formatDiagnosesToString(newSelected);
        updateField('diagnosa_inagrouper', codes);
    };

    const handleRemoveInagrouperDiagnosis = (code: string) => {
        // Remove only one instance of the diagnosis
        const indexToRemove = selectedInagrouperDiagnoses.findIndex((d) => d.code === code);
        if (indexToRemove > -1) {
            const newSelected = [...selectedInagrouperDiagnoses];
            newSelected.splice(indexToRemove, 1);
            setSelectedInagrouperDiagnoses(newSelected);
            const codes = formatDiagnosesToString(newSelected);
            updateField('diagnosa_inagrouper', codes);
        }
    };

    const handleSelectInagrouperProcedure = (procedure: { name: string; code: string }) => {
        const newSelected = [...selectedInagrouperProcedures, procedure];
        setSelectedInagrouperProcedures(newSelected);
        const codes = formatProceduresToString(newSelected);
        updateField('procedure_inagrouper', codes);
    };

    const handleRemoveInagrouperProcedure = (code: string) => {
        // Remove only one instance of the procedure
        const indexToRemove = selectedInagrouperProcedures.findIndex((p) => p.code === code);
        if (indexToRemove > -1) {
            const newSelected = [...selectedInagrouperProcedures];
            newSelected.splice(indexToRemove, 1);
            setSelectedInagrouperProcedures(newSelected);
            const codes = formatProceduresToString(newSelected);
            updateField('procedure_inagrouper', codes);
        }
    };

    // Sync inagrouper diagnoses with main diagnoses
    const handleSyncInagrouperDiagnoses = () => {
        setSelectedInagrouperDiagnoses([...selectedDiagnoses]);
        const codes = formatDiagnosesToString(selectedDiagnoses);
        updateField('diagnosa_inagrouper', codes);
        // Sync completed - could add flash message from backend if needed
    };

    // Sync inagrouper procedures with main procedures
    const handleSyncInagrouperProcedures = () => {
        setSelectedInagrouperProcedures([...selectedProcedures]);
        const codes = formatProceduresToString(selectedProcedures);
        updateField('procedure_inagrouper', codes);
        // Sync completed - could add flash message from backend if needed
    };

    // IDRG Diagnosis handlers
    const handleSelectIdrgDiagnosis = (diagnosis: { name: string; code: string }) => {
        setSelectedIdrgDiagnoses((prev) => [...prev, diagnosis]);
    };

    const handleRemoveIdrgDiagnosis = (code: string) => {
        const indexToRemove = selectedIdrgDiagnoses.findIndex((d) => d.code === code);
        if (indexToRemove > -1) {
            const newSelected = [...selectedIdrgDiagnoses];
            newSelected.splice(indexToRemove, 1);
            setSelectedIdrgDiagnoses(newSelected);
        }
    };

    // IDRG Procedure handlers
    const handleSelectIdrgProcedure = (procedure: { name: string; code: string }) => {
        setSelectedIdrgProcedures((prev) => [...prev, procedure]);
    };

    const handleRemoveIdrgProcedure = (code: string) => {
        const indexToRemove = selectedIdrgProcedures.findIndex((p) => p.code === code);
        if (indexToRemove > -1) {
            const newSelected = [...selectedIdrgProcedures];
            newSelected.splice(indexToRemove, 1);
            setSelectedIdrgProcedures(newSelected);
        }
    };

    // IDRG Grouping handler
    const handleIdrgGrouping = async () => {
        if (selectedIdrgDiagnoses.length === 0) {
            setErrorMessage('Minimal satu diagnosis IDRG harus dipilih');
            setIsErrorDialogOpen(true);
            return;
        }

        setIsIdrgGroupingLoading(true);
        
        const requestData = {
            selectedIdrgDiagnoses: selectedIdrgDiagnoses,
            selectedIdrgProcedures: selectedIdrgProcedures, // Procedures are optional
        };

        // Pattern yang sama dengan handleSimpanResumeMedis yang BERHASIL
        router.post(`/eklaim/klaim/${pengajuanKlaim.id}/idrg-grouping`, requestData, {
            onSuccess: () => {
                // Success handled by flash message in layout via useFlashMessages hook
                setIsIdrgGroupingModalOpen(false);
                
                // Reset selections
                setSelectedIdrgDiagnoses([]);
                setSelectedIdrgProcedures([]);
            },
            onError: (errors) => {
                // Error handled by flash message in layout via useFlashMessages hook
                console.error('IDRG Grouping errors:', errors);
            },
            onFinish: () => {
                setIsIdrgGroupingLoading(false);
            }
        });
    };

    const handleSaveProgress = () => {
        try {
            setIsLoading(true);

            // Count total fields being saved
            const fieldCount = Object.keys(formData).length;
            const filledFields = Object.keys(formData).filter(
                (key) => formData[key] !== null && formData[key] !== undefined && formData[key] !== '',
            ).length;

            // For save progress, we can use original formData or transformed data
            // Using original formData for save progress to maintain flexibility
            router.post(`/eklaim/klaim/${pengajuanKlaim.id}/store-progress`, formData, {
                preserveState: true,
                onSuccess: (response) => {
                    // Show detailed success dialog
                    setIsSuccessDialogOpen(true);
                    setSuccessMessage(`Data berhasil disimpan!\n\nTotal field: ${fieldCount}\nField terisi: ${filledFields}\nStatus: Draft`);

                    // Success message handled by useFlashMessages hook
                },
                onError: (errors) => {
                    console.error('Save progress errors:', errors);

                    // Show detailed error dialog
                    setIsErrorDialogOpen(true);
                    const errorMessages = Object.entries(errors)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    setErrorMessage(`Gagal menyimpan beberapa field:\n\n${errorMessages}`);

                    // Error message handled by useFlashMessages hook
                },
            });
        } catch (error) {
            console.error('Error saving progress:', error);

            // Show generic error dialog
            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);

            // Error message handled by useFlashMessages hook
        } finally {
            setIsLoading(false);
        }
    };

    // Function to transform formData to match expected JSON structure
    // Helper function to convert datetime-local format to database format
    const formatDateTimeForDatabase = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return '';
        // Convert from '2025-07-03T21:00' to '2025-07-03 21:00:00'
        const formatted = dateTimeLocal.replace('T', ' ') + ':00';
        return formatted;
    };

    // Helper function to convert tariff to integer
    const formatTariffToInteger = (value: string | number): string => {
        if (!value || value === '0' || value === 0) return '0';
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
        return Math.floor(numValue).toString();
    };

    const transformDataForSubmission = (formData: { [key: string]: any }) => {
        const transformedData = {
            // Header/Patient Information - required for validation
            nomor_sep: formData.nomor_sep || '',
            nomor_kartu: formData.nomor_kartu || '',
            nama_pasien: formData.nama_pasien || '',
            norm: formData.norm || '',
            tgl_masuk: formatDateTimeForDatabase(formData.tgl_masuk),
            tgl_pulang: formatDateTimeForDatabase(formData.tgl_pulang),
            cara_masuk: formData.cara_masuk || '',
            jenis_rawat: formData.jenis_rawat || '',
            kelas_rawat: formData.kelas_rawat || '',

            // ICU fields
            adl_sub_acute: formData.adl_sub_acute || '0',
            adl_chronic: formData.adl_chronic || '0',
            icu_indikator: formData.icu_indikator || '0',
            icu_los: formData.icu_los || '0',

            // Ventilator fields
            ventilator_hour: formData.ventilator_hour || '0',
            ventilator: {
                use_ind: formData.ventilator?.use_ind || '0',
                start_dttm: formData.ventilator?.start_dttm || '',
                stop_dttm: formData.ventilator?.stop_dttm || '',
            },

            // Upgrade Class fields
            upgrade_class_ind: formData.upgrade_class_ind || '0',
            upgrade_class_class: formData.upgrade_class_class || '',
            upgrade_class_los: formData.upgrade_class_los || '',
            upgrade_class_payor: formData.upgrade_class_payor || '',
            add_payment_pct: formData.add_payment_pct || '',

            // Medical data
            birth_weight: formData.birth_weight || '0',
            sistole: parseInt(formData.sistole) || 0,
            diastole: parseInt(formData.diastole) || 0,
            discharge_status: formData.discharge_status || '',
            nama_dokter: formData.nama_dokter || '',

            // Diagnosis and procedures - format from selected arrays
            diagnosa: formatDiagnosesToString(selectedDiagnoses),
            procedure: formatProceduresToString(selectedProcedures),
            diagnosa_inagrouper: formatDiagnosesToString(selectedInagrouperDiagnoses),
            procedure_inagrouper: formatProceduresToString(selectedInagrouperProcedures),

            // Tarif RS structure - convert all to integer
            tarif_rs: {
                prosedur_non_bedah: formatTariffToInteger(formData.tarif_rs?.prosedur_non_bedah),
                prosedur_bedah: formatTariffToInteger(formData.tarif_rs?.prosedur_bedah),
                konsultasi: formatTariffToInteger(formData.tarif_rs?.konsultasi),
                tenaga_ahli: formatTariffToInteger(formData.tarif_rs?.tenaga_ahli),
                keperawatan: formatTariffToInteger(formData.tarif_rs?.keperawatan),
                penunjang: formatTariffToInteger(formData.tarif_rs?.penunjang),
                radiologi: formatTariffToInteger(formData.tarif_rs?.radiologi),
                laboratorium: formatTariffToInteger(formData.tarif_rs?.laboratorium),
                pelayanan_darah: formatTariffToInteger(formData.tarif_rs?.pelayanan_darah),
                rehabilitasi: formatTariffToInteger(formData.tarif_rs?.rehabilitasi),
                kamar: formatTariffToInteger(formData.tarif_rs?.kamar),
                rawat_intensif: formatTariffToInteger(formData.tarif_rs?.rawat_intensif),
                obat: formatTariffToInteger(formData.tarif_rs?.obat),
                obat_kronis: formatTariffToInteger(formData.tarif_rs?.obat_kronis),
                obat_kemoterapi: formatTariffToInteger(formData.tarif_rs?.obat_kemoterapi),
                alkes: formatTariffToInteger(formData.tarif_rs?.alkes),
                bmhp: formatTariffToInteger(formData.tarif_rs?.bmhp),
                sewa_alat: formatTariffToInteger(formData.tarif_rs?.sewa_alat),
            },

            // COVID-19 fields
            pemulasaraan_jenazah: formData.pemulasaraan_jenazah || '0',
            kantong_jenazah: formData.kantong_jenazah || '0',
            peti_jenazah: formData.peti_jenazah || '0',
            plastik_erat: formData.plastik_erat || '0',
            desinfektan_jenazah: formData.desinfektan_jenazah || '0',
            mobil_jenazah: formData.mobil_jenazah || '0',
            desinfektan_mobil_jenazah: formData.desinfektan_mobil_jenazah || '0',
            is_covid19_suspect: formData.is_covid19_suspect || '0',
            is_covid19_probable: formData.is_covid19_probable || '0',
            is_covid19_confirmed: formData.is_covid19_confirmed || '0',

            // APGAR Score structure - sesuai dengan dokumentasi JSON
            apgar: {
                menit_1: {
                    appearance: parseInt(formData.apgar?.appearance_1) || 0,
                    pulse: parseInt(formData.apgar?.pulse_1) || 0,
                    grimace: parseInt(formData.apgar?.grimace_1) || 0,
                    activity: parseInt(formData.apgar?.activity_1) || 0,
                    respiration: parseInt(formData.apgar?.respiration_1) || 0,
                },
                menit_5: {
                    appearance: parseInt(formData.apgar?.appearance_5) || 0,
                    pulse: parseInt(formData.apgar?.pulse_5) || 0,
                    grimace: parseInt(formData.apgar?.grimace_5) || 0,
                    activity: parseInt(formData.apgar?.activity_5) || 0,
                    respiration: parseInt(formData.apgar?.respiration_5) || 0,
                },
            },

            // COVID-19 Penunjang structure - sesuai dengan dokumentasi JSON
            covid19_penunjang_pengurang: {
                lab_asam_laktat: formData.covid19_penunjang?.lab_asam_laktat || '0',
                lab_procalcitonin: formData.covid19_penunjang?.lab_procalcitonin || '0',
                lab_crp: formData.covid19_penunjang?.lab_crp || '0',
                lab_kultur: formData.covid19_penunjang?.lab_kultur || '0',
                lab_d_dimer: formData.covid19_penunjang?.lab_d_dimer || '0',
                lab_pt: formData.covid19_penunjang?.lab_pt || '0',
                lab_aptt: formData.covid19_penunjang?.lab_aptt || '0',
                lab_waktu_pendarahan: formData.covid19_penunjang?.lab_waktu_pendarahan || '0',
                lab_anti_hiv: formData.covid19_penunjang?.lab_anti_hiv || '0',
                lab_analisa_gas: formData.covid19_penunjang?.lab_analisa_gas || '0',
                lab_albumin: formData.covid19_penunjang?.lab_albumin || '0',
                rad_thorax_ap_pa: formData.covid19_penunjang?.rad_thorax_ap_pa || '0',
            },

            // Fields sesuai dengan dokumentasi JSON
            episodes: formData.episodes || '',
            covid19_cc_ind: formData.covid19_cc_ind || '0',
            covid19_rs_darurat_ind: formData.covid19_rs_darurat_ind || '0',
            covid19_co_insidense_ind: formData.covid19_co_insidense_ind || '0',
            covid19_status_cd: formData.covid19_status_cd || '0',
            nomor_kartu_t: formData.nomor_kartu_t || 'nik',

            // Persalinan structure
            persalinan: {
                usia_kehamilan: formData.persalinan?.usia_kehamilan || '',
                gravida: formData.persalinan?.gravida || '',
                partus: formData.persalinan?.partus || '',
                abortus: formData.persalinan?.abortus || '',
                onset_kontraksi: formData.persalinan?.onset_kontraksi || '',
            },

            // Lain-lain fields
            terapi_konvalesen: formatTariffToInteger(formData.terapi_konvalesen),
            akses_naat: formData.akses_naat || '',
            isoman_ind: formData.isoman_ind || '0',
            bayi_lahir_status_cd: parseInt(formData.bayi_lahir_status_cd) || 0,
            dializer_single_use: parseInt(formData.dializer_single_use) || 0,
            kantong_darah: parseInt(formData.kantong_darah) || 0,
            alteplase_ind: parseInt(formData.alteplase_ind) || 0,

            // Data RS fields
            tarif_poli_eks: formatTariffToInteger(formData.tarif_poli_eks),
            kode_tarif: formData.kode_tarif || 'DS',
            payor_id: formData.payor_id || '00003',
            payor_cd: formData.payor_cd || 'JKN',
            cob_cd: formData.cob_cd || '',
            coder_nik: formData.coder_nik || auth?.user?.nik || '',
        };

        return transformedData;
    };

    const handleSubmitKlaim = async () => {
        // Show shadcn confirmation dialog instead of browser confirm
        setIsConfirmSubmitOpen(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            setIsLoading(true);
            setIsConfirmSubmitOpen(false);

            // Transform data to match expected JSON structure
            const transformedData = transformDataForSubmission(formData);

            await router.post(
                `/eklaim/klaim/${pengajuanKlaim.id}/submit`,
                transformedData, // Send direct data without wrapper
                {
                    preserveState: true,
                },
            );
        } catch (error) {
            console.error('Error submitting klaim:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat submit klaim:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);

            // Error message handled by useFlashMessages hook
        } finally {
            setIsLoading(false);
        }
    };

    const handleGroupper = async () => {
        try {
            setIsLoading(true);

            // Transform data to match expected JSON structure for groupper
            const transformedData = transformDataForSubmission(formData);

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/groupper`, transformedData, {
                preserveState: true,
            });
        } catch (error) {
            console.error('Error calling groupper:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat memanggil groupper:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler untuk Groupper Ulang (menggunakan endpoint yang sama dengan groupper)
    const handleGrouperUlang = async (nomor_sep?: string) => {
        try {
            setIsLoadingGrouperUlang(true);

            // Transform data to match expected JSON structure for groupper
            const transformedData = transformDataForSubmission(formData);

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/groupper`, transformedData, {
                preserveState: true,
            });
        } catch (error) {
            console.error('Error calling groupper ulang:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat memanggil groupper ulang:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingGrouperUlang(false);
        }
    };

    // Handler untuk Final
    const handleFinal = async (nomor_sep?: string, coder_nik?: string) => {
        try {
            setIsLoadingFinal(true);

            // Data untuk final sesuai dengan format pada gambar
            const finalData = {
                metadata: {
                    method: 'claim_final',
                },
                data: {
                    nomor_sep: nomor_sep || formData.nomor_sep || pengajuanKlaim.nomor_sep,
                    coder_nik: coder_nik || formData.coder_nik || auth?.user?.nik || '',
                },
            };

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/final`, finalData, {
                preserveState: true,
                onSuccess: (response) => {
                    // Response akan dihandle oleh backend flash messages
                    // Berdasarkan response['metadata']['message']
                },
                onError: (errors) => {
                    console.error('Final errors:', errors);
                    setIsErrorDialogOpen(true);
                    const errorMessages = Object.entries(errors)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    setErrorMessage(`Gagal memfinalisasi klaim:\n\n${errorMessages}`);
                },
            });
        } catch (error) {
            console.error('Error calling final:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat memanggil final:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingFinal(false);
        }
    };

    // Handler untuk Reedit klaim (mengubah status kembali ke 1)
    const handleReedit = async () => {
        try {
            setIsLoadingReedit(true);

            const reeditData = {
                metadata: {
                    method: 'reedit_claim',
                },
                data: {
                    nomor_sep: pengajuanKlaim.nomor_sep,
                },
            };

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/reedit`, reeditData, {
                preserveState: false, // Reload page after success
                onSuccess: (response) => {
                    // Response akan dihandle oleh backend flash messages
                    setSuccessMessage('Klaim berhasil dibuka untuk edit ulang');
                    setIsSuccessDialogOpen(true);
                    // Reload setelah 2 detik
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                },
                onError: (errors) => {
                    console.error('Reedit errors:', errors);
                    setIsErrorDialogOpen(true);
                    const errorMessages = Object.entries(errors)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    setErrorMessage(`Gagal membuka klaim untuk edit ulang:\n\n${errorMessages}`);
                },
            });
        } catch (error) {
            console.error('Error calling reedit:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat membuka klaim untuk edit ulang:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingReedit(false);
        }
    };

    // Handler untuk Batalkan IDRG Grouping
    const handleBatalkanIdrgGrouping = async () => {
        try {
            setIsLoading(true);

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/batalkan-idrg`, {}, {
                preserveState: false,
                onSuccess: (response) => {
                    // Success handled by flash message
                },
                onError: (errors) => {
                    // Error handled by flash message
                    console.error('Batalkan IDRG errors:', errors);
                },
            });
        } catch (error) {
            console.error('Error calling batalkan IDRG:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat membatalkan IDRG Grouping:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler untuk Final IDRG (mengubah idrg dari 1 ke 2)
    const handleFinalIdrg = async () => {
        try {
            setIsLoading(true);

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/final-idrg`, {}, {
                preserveState: false,
                onSuccess: (response) => {
                    // Success handled by flash message
                },
                onError: (errors) => {
                    // Error handled by flash message
                    console.error('Final IDRG errors:', errors);
                },
            });
        } catch (error) {
            console.error('Error calling final IDRG:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat finalisasi IDRG:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler untuk Edit IDRG (mengubah idrg dari 2 ke 1)
    const handleEditIdrg = async () => {
        try {
            setIsLoading(true);

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/edit-idrg`, {}, {
                preserveState: false,
                onSuccess: (response) => {
                    // Success handled by flash message
                },
                onError: (errors) => {
                    // Error handled by flash message
                    console.error('Edit IDRG errors:', errors);
                },
            });
        } catch (error) {
            console.error('Error calling edit IDRG:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat membuka edit IDRG:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler untuk menampilkan modal konfirmasi kirim INACBG
    const handleKirimInacbg = () => {
        setIsConfirmKirimOpen(true);
    };

    // Handler untuk konfirmasi kirim ke INACBG (status_pengiriman = 4 -> 5)
    const handleConfirmKirimInacbg = async () => {
        try {
            setIsLoadingKirimInacbg(true);
            setIsConfirmKirimOpen(false);

            const kirimData = {
                metadata: {
                    method: 'send_claim_individual',
                },
                data: {
                    nomor_sep: pengajuanKlaim.nomor_sep,
                },
            };

            await router.post(`/eklaim/klaim/${pengajuanKlaim.id}/kirim-inacbg`, kirimData, {
                preserveState: false, // Reload page after success
                onSuccess: (response) => {
                    // Response akan dihandle oleh backend flash messages
                    setSuccessMessage('Klaim berhasil dikirim ke INACBG! Status diubah menjadi "Selesai Proses Klaim"');
                    setIsSuccessDialogOpen(true);
                    // Reload setelah 2 detik
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                },
                onError: (errors) => {
                    console.error('Kirim INACBG errors:', errors);
                    setIsErrorDialogOpen(true);
                    const errorMessages = Object.entries(errors)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    setErrorMessage(`Gagal mengirim klaim ke INACBG:\n\n${errorMessages}`);
                },
            });
        } catch (error) {
            console.error('Error calling kirim INACBG:', error);

            setIsErrorDialogOpen(true);
            setErrorMessage(`Terjadi kesalahan saat mengirim klaim ke INACBG:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingKirimInacbg(false);
        }
    };

    // Helper function to get status label and color for modal/overlay
    const getStatusInfo = (statusPengiriman: number) => {
        switch (statusPengiriman) {
            case 0:
                return { label: 'Draft', color: 'bg-gray-100 text-gray-800' };
            case 1:
                return { label: 'Tersimpan', color: 'bg-green-100 text-green-800' };
            case 2:
                return { label: 'Grouper Stage 1 Selesai', color: 'bg-blue-100 text-blue-800' };
            case 3:
                return { label: 'Grouper Stage 2 Selesai', color: 'bg-purple-100 text-purple-800' };
            case 4:
                return { label: 'Final', color: 'bg-yellow-100 text-yellow-800' };
            case 5:
                return { label: 'Selesai Proses Klaim', color: 'bg-emerald-100 text-emerald-800' };
            default:
                return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
        }
    };

    // Helper function to get header status label and color (different from modal status)
    const getHeaderStatusInfo = (statusPengiriman: number) => {
        switch (statusPengiriman) {
            case 0:
                return { label: 'Draft', color: 'bg-gray-100 text-gray-800' };
            case 1:
                return { label: 'Tersimpan', color: 'bg-green-100 text-green-800' };
            case 2:
                return { label: 'Siap Difinalisasi', color: 'bg-blue-100 text-blue-800' };
            case 3:
                return { label: 'Siap Difinalisasi', color: 'bg-purple-100 text-purple-800' };
            case 4:
                return { label: 'Siap Dikirim', color: 'bg-yellow-100 text-yellow-800' };
            case 5:
                return { label: 'Selesai Proses Klaim', color: 'bg-emerald-100 text-emerald-800' };
            default:
                return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
        }
    };

    // Tab content renderer
    const renderTabContent = () => {
        const commonProps = {
            formData,
            updateField,
            getNestedValue,
            updateNestedField,
        };

        switch (activeTab) {
            case 0:
                return <DataIDRGTab pengajuanKlaim={pengajuanKlaim} />;
            case 1:
                return <DataDiriTab formData={formData} updateField={updateField} referenceData={referenceData} />;
            case 2:
                return <ICUTab formData={formData} updateField={updateField} />;
            case 3:
                return <VentilatorTab {...commonProps} />;
            case 4:
                return <UpgradeKelasTab formData={formData} updateField={updateField} />;
            case 5:
                return (
                    <DataMedisTab
                        formData={formData}
                        updateField={updateField}
                        referenceData={referenceData}
                        selectedDiagnoses={selectedDiagnoses}
                        selectedProcedures={selectedProcedures}
                        selectedInagrouperDiagnoses={selectedInagrouperDiagnoses}
                        selectedInagrouperProcedures={selectedInagrouperProcedures}
                        handleRemoveDiagnosis={handleRemoveDiagnosis}
                        handleRemoveProcedure={handleRemoveProcedure}
                        handleRemoveInagrouperDiagnosis={handleRemoveInagrouperDiagnosis}
                        handleRemoveInagrouperProcedure={handleRemoveInagrouperProcedure}
                        handleSyncInagrouperDiagnoses={handleSyncInagrouperDiagnoses}
                        handleSyncInagrouperProcedures={handleSyncInagrouperProcedures}
                        setIsDiagnosisModalOpen={setIsDiagnosisModalOpen}
                        setIsProcedureModalOpen={setIsProcedureModalOpen}
                        setIsInagrouperDiagnosisModalOpen={setIsInagrouperDiagnosisModalOpen}
                        setIsInagrouperProcedureModalOpen={setIsInagrouperProcedureModalOpen}
                    />
                );
            case 6:
                return (
                    <TarifTab
                        formData={formData}
                        getNestedValue={getNestedValue}
                        updateNestedField={updateNestedField}
                        calculateTotalTarif={calculateTotalTarif}
                        formatRupiah={formatRupiah}
                    />
                );
            case 7:
                return (
                    <COVIDTab formData={formData} updateField={updateField} getNestedValue={getNestedValue} updateNestedField={updateNestedField} />
                );
            case 8:
                return <APGARTab {...commonProps} />;
            case 9:
                return <PersalinanTab {...commonProps} />;
            case 10:
                return <LainLainTab formData={formData} updateField={updateField} />;
            case 11:
                return <DataRSTab formData={formData} updateField={updateField} />;
            case 12:
                return (
                    <HasilGrouperTab
                        dataGroupper={dataGroupper}
                        dataGrouperStage2={dataGrouperStage2}
                        onRequestFinal={handleFinal}
                        onRequestGrouperUlang={handleGrouperUlang}
                        isLoadingFinal={isLoadingFinal}
                        isLoadingGrouperUlang={isLoadingGrouperUlang}
                        statusPengiriman={pengajuanKlaim.status_pengiriman}
                        coderNik={formData.coder_nik || auth?.user?.nik || ''}
                        hasSpecialCmgOptions={hasSpecialCmgOptions()}
                    />
                );
            default:
                return <DataDiriTab formData={formData} updateField={updateField} referenceData={referenceData} />;
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
                                    <span>{pengajuanKlaim.nomor_sep}</span>
                                    <span className="text-gray-400">•</span>
                                    <span>{pengajuanKlaim.nomor_kartu}</span>
                                    <span className="text-gray-400">•</span>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getHeaderStatusInfo(pengajuanKlaim.status_pengiriman).color}`}
                                    >
                                        {getHeaderStatusInfo(pengajuanKlaim.status_pengiriman).label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                {/* Button Simpan Progress - muncul ketika status_pengiriman = 0 dan IDRG = 2 */}
                                {pengajuanKlaim.status_pengiriman === 0 && isIdrgFinal && (
                                    <Button
                                        onClick={handleSaveProgress}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="border-black text-black hover:bg-black hover:text-white"
                                    >
                                        {isLoading ? 'Menyimpan...' : 'Simpan Progress'}
                                    </Button>
                                )}

                                {/* Button untuk buka IDRG Lock Modal ketika IDRG diperlukan */}
                                {pengajuanKlaim.status_pengiriman === 0 && shouldLockAllTabs && (
                                    <Button
                                        onClick={() => setIsIdrgLockModalOpen(true)}
                                        disabled={isLoading}
                                        className="bg-yellow-600 text-white hover:bg-yellow-700"
                                    >
                                        <span className="mr-2">🔒</span>
                                        IDRG Grouping Diperlukan
                                    </Button>
                                )}

                                {/* Button Final IDRG ketika IDRG = 1 */}
                                {pengajuanKlaim.status_pengiriman === 0 && isIdrgGroupingComplete && (
                                    <Button
                                        onClick={handleFinalIdrg}
                                        disabled={isLoading}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <span className="mr-2">✅</span>
                                        {isLoading ? 'Memproses...' : 'Final IDRG'}
                                    </Button>
                                )}

                                {/* Button Edit IDRG ketika IDRG = 2 */}
                                {pengajuanKlaim.status_pengiriman === 0 && isIdrgFinal && (
                                    <Button
                                        onClick={handleEditIdrg}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                    >
                                        <span className="mr-2">✏️</span>
                                        {isLoading ? 'Membuka...' : 'Edit IDRG'}
                                    </Button>
                                )}

                                {/* Conditional button/indicator based on status_pengiriman */}
                                {/* Handle Untuk Sementara */}
                                {/* {pengajuanKlaim.status_pengiriman === 0 && isIdrgFinal ? ( */}
                                {pengajuanKlaim.status_pengiriman === 4 ? (
                                    <Button onClick={handleSubmitKlaim} disabled={isLoading} className="bg-black text-white hover:bg-gray-800">
                                        {isLoading ? 'Mengirim...' : 'Submit Klaim'}
                                    </Button>
                                ) : pengajuanKlaim.status_pengiriman === 1 ? (
                                    <Button onClick={handleGroupper} disabled={isLoading} className="bg-blue-600 text-white hover:bg-blue-700">
                                        {isLoading ? 'Memproses...' : 'Groupper'}
                                    </Button>
                                ) : pengajuanKlaim.status_pengiriman === 2 ? (
                                    // Status 2: Grouper Stage 1 Selesai - Siap Difinalisasi
                                    !hasSpecialCmgOptions() ? (
                                        <div className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-3 py-1">
                                            <div className="flex items-center space-x-1">
                                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
                                                <span className="text-sm font-medium text-green-700">Siap Difinalisasi</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1">
                                            <div className="flex items-center space-x-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                <span className="text-sm font-medium text-blue-700">Groupper Selesai</span>
                                            </div>
                                        </div>
                                    )
                                ) : pengajuanKlaim.status_pengiriman === 3 ? (
                                    // Status 3: Grouper Stage 2 Selesai - Siap Difinalisasi
                                    <div className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-3 py-1">
                                        <div className="flex items-center space-x-1">
                                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
                                            <span className="text-sm font-medium text-green-700">Siap Difinalisasi</span>
                                        </div>
                                    </div>
                                ) : pengajuanKlaim.status_pengiriman === 4 ? (
                                    // Status 4: Final - Siap Dikirim ke INACBG
                                    <div className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-3 py-1">
                                        <div className="flex items-center space-x-1">
                                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500"></div>
                                            <span className="text-sm font-medium text-yellow-700">Siap Dikirim</span>
                                        </div>
                                    </div>
                                ) : pengajuanKlaim.status_pengiriman === 5 ? (
                                    // Status 5: Selesai Proses Klaim
                                    <div className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1">
                                        <div className="flex items-center space-x-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-sm font-medium text-emerald-700">Proses Selesai</span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Main Layout: Sidebar + Content */}
                    <div className="relative flex gap-6">
                        {/* Sidebar - 20% */}
                        <div className="w-1/5 space-y-2" key={counterUpdateKey}>
                            {tabs.map((tab) => {
                                const fieldCount = getTabFieldCount(tab.id);
                                const completionPercentage = fieldCount.total > 0 ? Math.round((fieldCount.filled / fieldCount.total) * 100) : 0;
                                const isComplete = fieldCount.filled === fieldCount.total && fieldCount.total > 0;
                                const isEmpty = fieldCount.filled === 0;
                                const tabLocked = isTabLocked(tab.id);

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => !tabLocked && setActiveTab(tab.id)}
                                        disabled={tabLocked}
                                        className={`flex w-full items-stretch gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                                            tabLocked
                                                ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
                                                : activeTab === tab.id
                                                  ? 'bg-black text-white'
                                                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex flex-1 items-center gap-3">
                                            <span className="text-lg">{tab.icon}</span>
                                            <div className="flex-1">
                                                <div className="font-medium">{tab.name}</div>
                                                <div className={`mt-0.5 text-xs ${activeTab === tab.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {fieldCount.filled}/{fieldCount.total} field
                                                    {fieldCount.total !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-center gap-1">
                                            {/* Progress indicator */}
                                            <div
                                                className={`h-2 w-8 overflow-hidden rounded-full ${
                                                    tabLocked ? 'bg-gray-300' : activeTab === tab.id ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}
                                            >
                                                <div
                                                    className={`h-full transition-all duration-300 ${
                                                        tabLocked
                                                            ? 'bg-gray-400'
                                                            : isComplete
                                                              ? 'bg-green-500'
                                                              : isEmpty
                                                                ? 'bg-red-400'
                                                                : 'bg-blue-500'
                                                    }`}
                                                    style={{ width: `${completionPercentage}%` }}
                                                />
                                            </div>
                                            {/* Percentage */}
                                            <span
                                                className={`text-xs font-medium ${
                                                    tabLocked
                                                        ? 'text-gray-400'
                                                        : activeTab === tab.id
                                                          ? 'text-gray-300'
                                                          : isComplete
                                                            ? 'text-green-600'
                                                            : isEmpty
                                                              ? 'text-red-500'
                                                              : 'text-blue-600'
                                                }`}
                                            >
                                                {completionPercentage}%
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content Area - 80% */}
                        <div className="relative flex-1 rounded-lg border border-gray-200 bg-white p-6">
                            {/* Overlay untuk lock tabs ketika IDRG = 0 (semua tab dikunci) */}
                            {/* {shouldLockAllTabs && (
                                <div className="absolute inset-0 z-40 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-md">
                                    <div className="mx-4 max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
                                        <div className="mb-6">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                                                <span className="text-3xl">🔒</span>
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-gray-900">Tab Terkunci</h3>
                                            <p className="text-sm leading-relaxed text-gray-600">
                                                Konten form tidak dapat diakses karena IDRG Grouping belum dilakukan untuk pasien{' '}
                                                <strong>{pengajuanKlaim.nama_pasien}</strong>.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                                                <div className="flex items-center justify-between">
                                                    <span>Nomor SEP:</span>
                                                    <span className="font-medium">{pengajuanKlaim.nomor_sep}</span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <span>IDRG Status:</span>
                                                    <span className="font-medium text-red-600">Belum Dilakukan</span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => setIsIdrgLockModalOpen(true)}
                                                className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                                            >
                                                <span className="mr-2">🔄</span>
                                                Lakukan IDRG Grouping
                                            </Button>

                                            <p className="text-xs text-gray-500">Klik tombol di atas untuk memulai proses IDRG Grouping</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            */}
                            
                            {/* Overlay untuk lock tabs non-IDRG ketika IDRG = 1 (hanya tab IDRG aktif) */}
                            {shouldLockNonIdrgTabs && activeTab !== 0 && (
                                <div className="absolute inset-0 z-40 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-md">
                                    <div className="mx-4 max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
                                        <div className="mb-6">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                                <span className="text-3xl">🔐</span>
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-gray-900">Tab Terkunci</h3>
                                            <p className="text-sm leading-relaxed text-gray-600">
                                                Tab form akan dapat diakses setelah IDRG Grouping difinalisasi. Silakan lihat tab{' '}
                                                <strong>Data IDRG</strong> dan klik tombol <strong>Final IDRG</strong> untuk melanjutkan.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                                                <div className="flex items-center justify-between">
                                                    <span>IDRG Status:</span>
                                                    <span className="font-medium text-blue-600">Grouping Selesai</span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <span>Action Required:</span>
                                                    <span className="font-medium text-orange-600">Finalisasi IDRG</span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => setActiveTab(0)}
                                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                <span className="mr-2">📋</span>
                                                Buka Tab Data IDRG
                                            </Button>

                                            <p className="text-xs text-gray-500">Klik tombol di atas untuk melihat dan finalisasi data IDRG</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Jika klaim sudah final, tampilkan overlay hanya di content area */}
                            {isKlaimFinal ? (
                                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-md">
                                    <div className="mx-4 max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
                                        <div className="mb-6">
                                            <div
                                                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                                                    pengajuanKlaim.status_pengiriman === 5 ? 'bg-emerald-100' : 'bg-yellow-100'
                                                }`}
                                            >
                                                <span className="text-3xl">{pengajuanKlaim.status_pengiriman === 5 ? '✅' : '🔒'}</span>
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-gray-900">
                                                {pengajuanKlaim.status_pengiriman === 5 ? 'Klaim Selesai' : 'Tab Terkunci'}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-gray-600">
                                                {pengajuanKlaim.status_pengiriman === 5
                                                    ? `Klaim untuk nomor SEP ${pengajuanKlaim.nomor_sep} telah berhasil dikirim ke INACBG dan proses klaim sudah selesai.`
                                                    : `Konten tab ${tabs.find((tab) => tab.id === activeTab)?.name} tidak dapat diedit karena klaim sudah difinalisasi.`}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                                                <div className="flex items-center justify-between">
                                                    <span>Status Klaim:</span>
                                                    <span
                                                        className={`font-medium ${
                                                            pengajuanKlaim.status_pengiriman === 5 ? 'text-emerald-600' : 'text-yellow-600'
                                                        }`}
                                                    >
                                                        {getStatusInfo(pengajuanKlaim.status_pengiriman).label}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <span>Nomor SEP:</span>
                                                    <span className="font-medium">{pengajuanKlaim.nomor_sep}</span>
                                                </div>
                                            </div>

                                            {/* Hanya tampilkan button jika status = 4 (Final), tidak untuk status = 5 (Selesai) */}
                                            {pengajuanKlaim.status_pengiriman === 4 && (
                                                <>
                                                    <Button
                                                        onClick={handleReedit}
                                                        disabled={isLoadingReedit}
                                                        className="w-full bg-orange-600 text-white hover:bg-orange-700"
                                                    >
                                                        {isLoadingReedit ? (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                <span>Memproses...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <span>✏️</span>
                                                                <span>Edit Ulang Klaim</span>
                                                            </div>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        onClick={handleKirimInacbg}
                                                        disabled={isLoadingKirimInacbg}
                                                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                                    >
                                                        {isLoadingKirimInacbg ? (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                <span>Mengirim...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <span>📤</span>
                                                                <span>Kirim ke INACBG</span>
                                                            </div>
                                                        )}
                                                    </Button>

                                                    <p className="text-xs text-gray-500">
                                                        Klik "Edit Ulang Klaim" untuk membuka kembali semua tab untuk pengeditan, atau klik "Kirim ke
                                                        INACBG" untuk menyelesaikan proses klaim
                                                    </p>
                                                </>
                                            )}

                                            {/* Pesan untuk status = 5 (Selesai) */}
                                            {pengajuanKlaim.status_pengiriman === 5 && (
                                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-xl text-emerald-600">🎉</div>
                                                        <div>
                                                            <h4 className="mb-1 font-semibold text-emerald-900">Proses Selesai!</h4>
                                                            <p className="text-sm text-emerald-700">
                                                                Klaim telah berhasil dikirim ke INACBG dan proses pengajuan klaim sudah selesai. Tidak
                                                                ada tindakan lebih lanjut yang diperlukan.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Tab content - akan ter-blur jika final atau tab dikunci */}
                            <div
                                className={`transition-all duration-300 ${
                                    isKlaimFinal || isTabLocked(activeTab) ? 'pointer-events-none opacity-50 blur-md' : ''
                                }`}
                            >
                                {renderTabContent()}
                            </div>
                        </div>
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

            {/* Custom Confirmation Modal for Submit */}
            {isConfirmSubmitOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 duration-200 animate-in fade-in-0" onClick={() => setIsConfirmSubmitOpen(false)} />

                    {/* Modal Content */}
                    <div className="relative mx-auto w-full max-w-md rounded-lg bg-white shadow-lg duration-200 animate-in fade-in-0 zoom-in-95">
                        <div className="p-6">
                            <h2 className="mb-2 text-lg font-semibold text-gray-900">Konfirmasi Submit Klaim</h2>
                            <p className="mb-6 text-sm text-gray-600">
                                Apakah Anda yakin ingin submit klaim ini ke INACBG? Data yang sudah disubmit tidak dapat diubah lagi.
                            </p>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmSubmitOpen(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSubmit}
                                    disabled={isLoading}
                                    className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Ya, Submit Klaim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Success Modal */}
            {isSuccessDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 duration-200 animate-in fade-in-0" onClick={() => setIsSuccessDialogOpen(false)} />

                    {/* Modal Content */}
                    <div className="relative mx-auto w-full max-w-md rounded-lg bg-white shadow-lg duration-200 animate-in fade-in-0 zoom-in-95">
                        <div className="p-6">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="ml-3 text-lg font-semibold text-gray-900">Berhasil!</h2>
                            </div>
                            <p className="mb-6 text-sm whitespace-pre-line text-gray-600">{successMessage}</p>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsSuccessDialogOpen(false)}
                                    className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Error Modal */}
            {isErrorDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 duration-200 animate-in fade-in-0" onClick={() => setIsErrorDialogOpen(false)} />

                    {/* Modal Content */}
                    <div className="relative mx-auto w-full max-w-md rounded-lg bg-white shadow-lg duration-200 animate-in fade-in-0 zoom-in-95">
                        <div className="p-6">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="ml-3 text-lg font-semibold text-gray-900">Error</h2>
                            </div>
                            <p className="mb-6 text-sm whitespace-pre-line text-gray-600">{errorMessage}</p>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsErrorDialogOpen(false)}
                                    className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal for Kirim INACBG */}
            {isConfirmKirimOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 duration-200 animate-in fade-in-0" onClick={() => setIsConfirmKirimOpen(false)} />

                    {/* Modal Content */}
                    <div className="relative mx-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg duration-200 animate-in fade-in-0 zoom-in-95">
                        <div className="p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                    <span className="text-2xl">📤</span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Konfirmasi Pengiriman ke INACBG</h2>
                            </div>

                            <div className="mb-6 space-y-4">
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="mb-3 text-gray-700">Anda akan mengirim klaim individual ke sistem INACBG dengan data berikut:</p>

                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <strong className="text-gray-900">Nomor SEP:</strong>
                                                <div className="font-mono text-gray-700">{pengajuanKlaim.nomor_sep}</div>
                                            </div>
                                            <div>
                                                <strong className="text-gray-900">Nama Pasien:</strong>
                                                <div className="text-gray-700">{pengajuanKlaim.nama_pasien}</div>
                                            </div>
                                        </div>

                                        <div className="mt-3 border-t pt-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <strong className="text-gray-900">Nomor Kartu:</strong>
                                                    <div className="font-mono text-gray-700">{pengajuanKlaim.nomor_kartu}</div>
                                                </div>
                                                <div>
                                                    <strong className="text-gray-900">Status Saat Ini:</strong>
                                                    <div className="font-semibold text-yellow-600">Final</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-xl text-yellow-600">⚠️</div>
                                        <div>
                                            <h4 className="mb-2 font-semibold text-yellow-900">Perhatian Penting:</h4>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
                                                <li>Setelah dikirim ke INACBG, klaim akan berstatus "Selesai Proses Klaim"</li>
                                                <li>Proses pengiriman tidak dapat dibatalkan</li>
                                                <li>Pastikan semua data sudah benar dan final</li>
                                                <li>Klaim yang sudah dikirim tidak dapat diedit kecuali melalui proses khusus</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                    <h4 className="mb-2 font-semibold text-emerald-900">Data Request yang akan dikirim:</h4>
                                    <pre className="overflow-x-auto rounded border bg-white p-2 font-mono text-xs text-emerald-800">
                                        {`{
    "metadata": {
        "method": "send_claim_individual"
    },
    "data": {
        "nomor_sep": "${pengajuanKlaim.nomor_sep}"
    }
}`}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmKirimOpen(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmKirimInacbg}
                                    disabled={isLoadingKirimInacbg}
                                    className="rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoadingKirimInacbg ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            <span>Mengirim...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>📤</span>
                                            <span>Ya, Kirim ke INACBG</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* IDRG Lock Modal */}
            <IdrgLockModal
                isOpen={isIdrgLockModalOpen}
                onClose={() => setIsIdrgLockModalOpen(false)}
                onOpenIdrgGrouping={() => setIsIdrgGroupingModalOpen(true)}
                pengajuanKlaim={pengajuanKlaim}
            />

            {/* IDRG Grouping Modal */}
            <IdrgGroupingModal
                isOpen={isIdrgGroupingModalOpen}
                onClose={() => setIsIdrgGroupingModalOpen(false)}
                selectedIdrgDiagnoses={selectedIdrgDiagnoses}
                selectedIdrgProcedures={selectedIdrgProcedures}
                onOpenDiagnosisModal={() => setIsIdrgDiagnosisModalOpen(true)}
                onOpenProcedureModal={() => setIsIdrgProcedureModalOpen(true)}
                onRemoveDiagnosis={handleRemoveIdrgDiagnosis}
                onRemoveProcedure={handleRemoveIdrgProcedure}
                onPerformGrouping={handleIdrgGrouping}
                isLoading={isIdrgGroupingLoading}
            />



            {/* IDRG Diagnosis Modal */}
            <DiagnosisIDRGModal
                isOpen={isIdrgDiagnosisModalOpen}
                onClose={() => setIsIdrgDiagnosisModalOpen(false)}
                selectedDiagnosis={selectedIdrgDiagnoses}
                onSelectDiagnosis={handleSelectIdrgDiagnosis}
                onRemoveDiagnosis={handleRemoveIdrgDiagnosis}
            />

            {/* IDRG Procedure Modal */}
            <ProcedureIDRGModal
                isOpen={isIdrgProcedureModalOpen}
                onClose={() => setIsIdrgProcedureModalOpen(false)}
                selectedProcedures={selectedIdrgProcedures}
                onSelectProcedure={handleSelectIdrgProcedure}
                onRemoveProcedure={handleRemoveIdrgProcedure}
            />
        </AppLayout>
    );
}
