import PengajuanKlaimModal from '@/components/eklaim/pengajuan-klaim-modal';
import GroupperModal from '@/components/eklaim/groupper-modal';
import ReeditGroupperModal from '@/components/eklaim/reedit-groupper-modal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { stat } from 'fs';

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

interface Pasien {
    NAMA: string;
    NORM: string;
    TANGGAL_LAHIR: string;
    JENIS_KELAMIN: string | number;
    ALAMAT: string;
    desa?: {
        DESKRIPSI: string;
    };
    kecamatan?: {
        DESKRIPSI: string;
    };
    kabupaten?: {
        DESKRIPSI: string;
    };
    provinsi?: {
        DESKRIPSI: string;
    };
}

interface Penjamin {
    NOMOR: string;
}

interface Ruangan {
    ID: number;
    DESKRIPSI: string;
    JENIS_KUNJUNGAN: number;
}

interface KunjunganRS {
    id: number;
    NOPEN: string;
    RUANGAN: number;
    MASUK: string;
    KELUAR: string;
    ruangan?: Ruangan;
}

interface DataGroupper {
    id: number;
    nomor_sep: string;
    cbg_code: string;
    cbg_description: string;
    cbg_tariff: string;
    sub_acute_code?: string;
    sub_acute_description?: string;
    sub_acute_tariff?: number;
    chronic_code?: string;
    chronic_description?: string;
    chronic_tariff?: number;
    kelas: string;
    add_payment_amt?: number;
    inacbg_version: string;
}

interface PengajuanKlaim {
    id: number;
    nomor_sep: string;
    nama_pasien: string;
    norm: string;
    status_pengiriman: number;
}

interface ActionMessage {
    type: 'create_claim' | 'needs_grouping' | 'ready_final';
    message: string;
    nomor_sep: string;
    pengajuan_klaim_id?: number;
    allow_resubmit?: boolean;
}

interface Stage2Options {
    type: 'stage2_or_final';
    message: string;
    nomor_sep: string;
    pengajuan_klaim_id: number;
    has_special_cmg: boolean;
    allow_resubmit?: boolean;
}

interface Props extends SharedData {
    kunjungan: string;
    kunjunganRs: KunjunganRS[];
    pasien: Pasien;
    penjamin: Penjamin;
    rincian_tagihan: RincianTagihan[];
    dataGroupper?: DataGroupper;
    pengajuanKlaim?: PengajuanKlaim;
    needsGrouping: boolean;
    actionMessage?: ActionMessage;
    stage2Options?: Stage2Options;
}

type TabType = 'semua' | 'administrasi' | 'ruang-rawat' | 'tindakan' | 'barang-obat' | 'paket' | 'oksigen';

export default function CompareBiayaIndex() {
    const props = usePage().props as any;
    const kunjungan: string = props.kunjungan;
    const kunjunganRs: KunjunganRS[] = props.kunjunganRs || [];
    const pasien: Pasien = props.pasien;
    const status_klaim: number | null = props.status_klaim || null;
    const penjamin: Penjamin = props.penjamin;
    const rincian_tagihan: RincianTagihan[] = props.rincian_tagihan || [];
    const dataGroupper: DataGroupper = props.dataGroupper;
    const pengajuanKlaim: PengajuanKlaim = props.pengajuanKlaim;
    const needsGrouping: boolean = props.needsGrouping;
    const actionMessage: ActionMessage = props.actionMessage;
    const stage2Options: Stage2Options = props.stage2Options;

    const [activeTab, setActiveTab] = useState<TabType>('semua');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Biaya',
            href: '/biaya',
        },
        {
            title: `Compare ${kunjungan}`,
            href: '#',
        },
    ];

    // Filter rincian tagihan berdasarkan jenis
    const filteredTagihan = useMemo(() => {
        switch (activeTab) {
            case 'administrasi':
                return rincian_tagihan.filter((item: RincianTagihan) => item.JENIS === 1);
            case 'ruang-rawat':
                return rincian_tagihan.filter((item: RincianTagihan) => item.JENIS === 2);
            case 'tindakan':
                return rincian_tagihan.filter((item: RincianTagihan) => item.JENIS === 3);
            case 'barang-obat':
                return rincian_tagihan.filter((item: RincianTagihan) => item.JENIS === 4);
            case 'paket':
                return rincian_tagihan.filter((item: RincianTagihan) => item.JENIS === 5);
            case 'oksigen':
                return rincian_tagihan.filter((item: RincianTagihan) => item.JENIS === 6);
            default:
                return rincian_tagihan;
        }
    }, [rincian_tagihan, activeTab]);

    // Hitung jumlah item per kategori
    const getItemCount = (jenis?: number) => {
        if (!jenis) return rincian_tagihan.length;
        return rincian_tagihan.filter((item: RincianTagihan) => item.JENIS === jenis).length;
    };

    // Fungsi untuk mendapatkan nama tarif berdasarkan jenis
    const getNamaTarif = (item: RincianTagihan): string => {
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
            case 1:
                return 'Administrasi';
            case 2:
                return 'Ruang Rawat';
            case 3:
                return 'Tindakan';
            case 4:
                return 'Barang/Obat';
            case 5:
                return 'Paket';
            case 6:
                return 'Oksigen';
            default:
                return 'Lainnya';
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

    // Fungsi untuk format tanggal Indonesia
    const formatTanggalIndo = (tanggal?: string) => {
        if (!tanggal) return '-';
        const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const [tahun, bulan, hari] = tanggal.split('-');
        if (!tahun || !bulan || !hari) return tanggal;
        return `${parseInt(hari)} ${bulanIndo[parseInt(bulan) - 1]} ${tahun}`;
    };

    // Hitung total tagihan untuk tab yang aktif
    const totalTagihan = filteredTagihan.reduce((total: number, item: RincianTagihan) => {
        const subtotal = item.JUMLAH * item.TARIF;
        const diskon = (subtotal * item.PERSENTASE_DISKON) / 100;
        return total + (subtotal - diskon);
    }, 0);



    // Helper function to get admission date from kunjungan_rs
    const getAdmissionDate = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
        if (!kunjungan_rs) return '-';
        
        // Handle both array and single object
        const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
        
        if (kunjunganArray.length === 0) return '-';
        
        // Get the first MASUK date (admission date)
        const firstKunjungan = kunjunganArray[0];
        if (!firstKunjungan?.MASUK || 
            firstKunjungan.MASUK === '' || 
            firstKunjungan.MASUK === '0000-00-00' || 
            firstKunjungan.MASUK === '0000-00-00 00:00:00') {
            return '-';
        }
        
        try {
            return new Date(firstKunjungan.MASUK).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
        } catch (error) {
            return '-';
        }
    };

      // Helper function to get raw admission date for API
        const getRawAdmissionDate = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
            if (!kunjungan_rs) return '';
            
            const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
            
            if (kunjunganArray.length === 0) return '';
            
            const firstKunjungan = kunjunganArray[0];
            if (!firstKunjungan?.MASUK || 
                firstKunjungan.MASUK === '' || 
                firstKunjungan.MASUK === '0000-00-00' || 
                firstKunjungan.MASUK === '0000-00-00 00:00:00') {
                return '';
            }
            
            try {
                return format(new Date(firstKunjungan.MASUK), 'yyyy-MM-dd');
            } catch (error) {
                return '';
            }
        };
    
        // Helper function to get raw discharge date for API
        const getRawDischargeDate = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
            if (!kunjungan_rs) return '';
            
            const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
            
            if (kunjunganArray.length === 0) return '';
            
            const firstKunjungan = kunjunganArray[0];
            if (!firstKunjungan?.KELUAR || 
                firstKunjungan.KELUAR === '' || 
                firstKunjungan.KELUAR === '0000-00-00' || 
                firstKunjungan.KELUAR === '0000-00-00 00:00:00') {
                return '';
            }
            
            try {
                return format(new Date(firstKunjungan.KELUAR), 'yyyy-MM-dd');
            } catch (error) {
                return '';
            }
        };

    // Helper function to get room names from kunjungan_rs
    const getRoomNames = (kunjungan_rs?: KunjunganRS[] | KunjunganRS) => {
        if (!kunjungan_rs) return '-';
        
        // Handle both array and single object
        const kunjunganArray = Array.isArray(kunjungan_rs) ? kunjungan_rs : [kunjungan_rs];
        
        if (kunjunganArray.length === 0) return '-';
        
        const roomNames = kunjunganArray
            .filter(krs => krs?.ruangan?.DESKRIPSI)
            .map(krs => krs.ruangan!.DESKRIPSI)
            .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
        
        return roomNames.length > 0 ? roomNames.join(', ') : '-';
    };

    // Prepare data untuk PengajuanKlaimModal
    const pengajuanKlaimData = {
        nomor_kartu: penjamin?.NOMOR || '',
        nomor_sep: penjamin?.NOMOR || '',
        nomor_rm: pasien?.NORM || '',
        nama_pasien: pasien?.NAMA || '',
        tgl_lahir: pasien?.TANGGAL_LAHIR || '',
        gender: pasien?.JENIS_KELAMIN?.toString() || '',
        tanggal_masuk: getRawAdmissionDate(kunjunganRs),
        tanggal_keluar: getRawDischargeDate(kunjunganRs),
        ruangan: getRoomNames(kunjunganRs),
        jenis_kunjungan: kunjunganRs[0]?.ruangan?.JENIS_KUNJUNGAN,
        // Data tambahan bisa ditambahkan sesuai kebutuhan
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Compare Biaya - ${kunjungan}`} />
            <div className="min-h-screen">
                <div className="mx-auto max-w-full pt-2">
                    <div className="flex">
                        {/* Sidebar Navigation */}
                        <div className="min-h-screen w-80 flex-shrink-0 border-r bg-white shadow-sm">
                            {/* Patient Info in Sidebar */}
                            <div className="border-b p-6">
                                <h3 className="mb-4 font-semibold text-gray-900">Informasi Pasien</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Nama</div>
                                        <div className="text-sm font-medium text-gray-900">{pasien?.NAMA || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">No. RM</div>
                                            <div className="text-sm text-gray-900">{pasien?.NORM || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">No. Kunjungan</div>
                                            <div className="text-sm text-gray-900">{kunjungan}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Jenis Kelamin</div>
                                        <div className="text-sm text-gray-900">
                                            {pasien?.JENIS_KELAMIN === 1 ||
                                            pasien?.JENIS_KELAMIN === '1' ||
                                            pasien?.JENIS_KELAMIN === 'L' ||
                                            pasien?.JENIS_KELAMIN === 'Laki-laki'
                                                ? 'Laki-laki'
                                                : pasien?.JENIS_KELAMIN === 2 ||
                                                    pasien?.JENIS_KELAMIN === '2' ||
                                                    pasien?.JENIS_KELAMIN === 'P' ||
                                                    pasien?.JENIS_KELAMIN === 'Perempuan'
                                                  ? 'Perempuan'
                                                  : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Alamat</div>
                                        <div className="text-sm text-gray-900">{pasien?.ALAMAT || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Desa</div>
                                            <div className="text-sm text-gray-900">{pasien?.desa?.DESKRIPSI || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Kecamatan</div>
                                            <div className="text-sm text-gray-900">{pasien?.kecamatan?.DESKRIPSI || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Klaim Section */}
                            {pengajuanKlaim && (
                                <div className="border-b p-6">
                                    <h3 className="mb-4 font-semibold text-gray-900">Status Klaim</h3>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">Status Pengiriman</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                status_klaim === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                status_klaim === 2 ? 'bg-blue-100 text-blue-800' :
                                                status_klaim === 3 ? 'bg-purple-100 text-purple-800' :
                                                status_klaim === 4 ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {status_klaim === 1 ? 'Tersimpan' :
                                                 status_klaim === 2 ? 'Grouper' :
                                                 status_klaim === 3 ? 'Stage 2' :
                                                 status_klaim === 4 ? 'Final' :
                                                 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    status_klaim === 1 ? 'bg-yellow-600 w-1/4' :
                                                    status_klaim === 2 ? 'bg-blue-600 w-2/4' :
                                                    status_klaim === 3 ? 'bg-purple-600 w-3/4' :
                                                    status_klaim === 4 ? 'bg-green-600 w-full' :
                                                    'bg-gray-600 w-0'
                                                }`}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Submit</span>
                                            <span>Grouper</span>
                                            <span>Stage 2</span>
                                            <span>Final</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Data Groupper Section */}
                            {(dataGroupper || actionMessage || stage2Options) && (
                                <div className="border-b p-6">
                                    <h3 className="mb-4 font-semibold text-gray-900">Data Groupper</h3>

                                    {/* Tampilkan Data Groupper jika ada */}
                                    {dataGroupper && (
                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Nomor SEP</div>
                                                <div className="text-sm font-medium text-gray-900">{dataGroupper.nomor_sep}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">CBG Code</div>
                                                <div className="text-sm text-gray-900">{dataGroupper.cbg_code}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">CBG Description</div>
                                                <div className="text-sm text-gray-900">{dataGroupper.cbg_description}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">CBG Tariff</div>
                                                <div className="text-sm font-semibold text-green-600">
                                                    {formatRupiah(parseInt(dataGroupper.cbg_tariff) || 0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Kelas</div>
                                                <div className="text-sm text-gray-900">{dataGroupper.kelas}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">INACBG Version</div>
                                                <div className="text-sm text-gray-900">{dataGroupper.inacbg_version}</div>
                                            </div>

                                            {/* Edit Button for Final Status */}
                                            {pengajuanKlaim && pengajuanKlaim.id && pengajuanKlaim.status_pengiriman >= 4 && (
                                                <div className="pt-3 border-t border-gray-200">
                                                    <ReeditGroupperModal
                                                        data={{
                                                            pengajuan_klaim_id: pengajuanKlaim.id,
                                                            nomor_sep: pengajuanKlaim.nomor_sep || '',
                                                            nama_pasien: pengajuanKlaim.nama_pasien || ''
                                                        }}
                                                        triggerClassName="w-full px-3 py-2 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                                        triggerText="Edit Grouping"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                                        Status: Final - Dapat diedit ulang
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tampilkan Action Message jika ada */}
                                    {actionMessage && (
                                        <div
                                            className={`rounded-lg p-4 ${
                                                actionMessage.type === 'create_claim'
                                                    ? 'border border-yellow-200 bg-yellow-50'
                                                    : actionMessage.type === 'ready_final'
                                                      ? 'border border-green-200 bg-green-50'
                                                      : 'border border-blue-200 bg-blue-50'
                                            }`}
                                        >
                                            <div
                                                className={`text-sm ${
                                                    actionMessage.type === 'create_claim' 
                                                        ? 'text-yellow-700' 
                                                        : actionMessage.type === 'ready_final'
                                                          ? 'text-green-700'
                                                          : 'text-blue-700'
                                                }`}
                                            >
                                                {actionMessage.message}
                                            </div>
                                            <div className="mt-3">
                                                {actionMessage.type === 'create_claim' ? (
                                                    <PengajuanKlaimModal
                                                        data={pengajuanKlaimData}
                                                        actionUrl="/eklaim/kunjungan/pengajuan-klaim"
                                                        triggerClassName="px-3 py-2 text-xs font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors"
                                                        triggerText="Buat Pengajuan Klaim"
                                                    />
                                                ) : actionMessage.type === 'ready_final' ? (
                                                    <div className="space-y-2">
                                                        <Button
                                                            onClick={() => {
                                                                router.post('/biaya/compare/final', {
                                                                    pengajuan_klaim_id: actionMessage.pengajuan_klaim_id,
                                                                    nomor_sep: actionMessage.nomor_sep,
                                                                });
                                                            }}
                                                            className="w-full px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <span>✅</span>
                                                            Finalisasi Klaim
                                                        </Button>

                                                        {/* Submit Klaim → Grouping Ulang untuk status 3 */}
                                                        {actionMessage.allow_resubmit && (
                                                            <GroupperModal
                                                                data={{
                                                                    pengajuan_klaim_id: actionMessage.pengajuan_klaim_id || 0,
                                                                    nomor_sep: actionMessage.nomor_sep || '',
                                                                    nama_pasien: pasien?.NAMA || ''
                                                                }}
                                                                actionUrl="/biaya/compare/resubmit-grouping"
                                                                triggerClassName="w-full rounded-md bg-orange-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-orange-700 flex items-center justify-center gap-2"
                                                                triggerText="🔄 Submit Klaim → Grouping"
                                                            />
                                                        )}

                                                        <div className="text-xs text-green-600 mt-2">
                                                            <p><strong>Final:</strong> Finalisasi klaim stage 2</p>
                                                            {actionMessage.allow_resubmit && (
                                                                <p><strong>Submit → Grouping:</strong> Submit klaim ulang lalu grouping dari awal</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <GroupperModal
                                                        data={{
                                                            pengajuan_klaim_id: actionMessage.pengajuan_klaim_id || 0,
                                                            nomor_sep: actionMessage.nomor_sep || '',
                                                            nama_pasien: pasien?.NAMA || ''
                                                        }}
                                                        actionUrl="/biaya/compare/grouping"
                                                        triggerClassName="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 flex items-center justify-center gap-2"
                                                        triggerText="Lakukan Grouping"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tampilkan Stage 2 Options untuk status 2 */}
                                    {stage2Options && (
                                        <div className="rounded-lg p-4 border border-purple-200 bg-purple-50">
                                            <div className="text-sm text-purple-700 mb-3">
                                                {stage2Options.message}
                                            </div>
                                            <div className="space-y-2">
                                                {/* Stage 2 Button - jika ada special CMG */}
                                                {stage2Options.has_special_cmg && (
                                                    <Button
                                                        onClick={() => {
                                                            router.post('/biaya/compare/stage2', {
                                                                pengajuan_klaim_id: stage2Options.pengajuan_klaim_id,
                                                                nomor_sep: stage2Options.nomor_sep,
                                                            });
                                                        }}
                                                        className="w-full px-3 py-2 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <span>🔄</span>
                                                        Grouper Stage 2
                                                    </Button>
                                                )}
                                                
                                                {/* Final Button */}
                                                <Button
                                                    onClick={() => {
                                                        router.post('/biaya/compare/final', {
                                                            pengajuan_klaim_id: stage2Options.pengajuan_klaim_id,
                                                            nomor_sep: stage2Options.nomor_sep,
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <span>✅</span>
                                                    Finalisasi Langsung
                                                </Button>

                                                {/* Submit Klaim → Grouping Ulang */}
                                                {stage2Options.allow_resubmit && (
                                                    <GroupperModal
                                                        data={{
                                                            pengajuan_klaim_id: stage2Options.pengajuan_klaim_id || 0,
                                                            nomor_sep: stage2Options.nomor_sep || '',
                                                            nama_pasien: pasien?.NAMA || ''
                                                        }}
                                                        actionUrl="/biaya/compare/resubmit-grouping"
                                                        triggerClassName="w-full rounded-md bg-orange-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-orange-700 flex items-center justify-center gap-2"
                                                        triggerText="🔄 Submit Klaim → Grouping"
                                                    />
                                                )}
                                                
                                                <div className="text-xs text-purple-600 mt-2">
                                                    {stage2Options.has_special_cmg && (
                                                        <p><strong>Stage 2:</strong> Lakukan grouping tahap 2 dengan special CMG</p>
                                                    )}
                                                    <p><strong>Final:</strong> Langsung finalisasi klaim</p>
                                                    {stage2Options.allow_resubmit && (
                                                        <p><strong>Submit → Grouping:</strong> Submit klaim ulang lalu grouping dari awal</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab Navigation */}
                            <div className="p-4">
                                <h3 className="mb-3 px-2 font-medium text-gray-900">Kategori Tagihan</h3>
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab('semua')}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-gray-50 ${
                                            activeTab === 'semua'
                                                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">📊</span>
                                            <span>Semua</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                activeTab === 'semua' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {getItemCount()}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('administrasi')}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-gray-50 ${
                                            activeTab === 'administrasi'
                                                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">📋</span>
                                            <span>Administrasi</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                activeTab === 'administrasi' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {getItemCount(1)}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('ruang-rawat')}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-gray-50 ${
                                            activeTab === 'ruang-rawat'
                                                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">🏥</span>
                                            <span>Ruang Rawat</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                activeTab === 'ruang-rawat' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {getItemCount(2)}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('tindakan')}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-gray-50 ${
                                            activeTab === 'tindakan'
                                                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">🩺</span>
                                            <span>Tindakan</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                activeTab === 'tindakan' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {getItemCount(3)}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('barang-obat')}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-gray-50 ${
                                            activeTab === 'barang-obat'
                                                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">💊</span>
                                            <span>Barang/Obat</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                activeTab === 'barang-obat' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {getItemCount(4)}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('paket')}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-gray-50 ${
                                            activeTab === 'paket'
                                                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">📦</span>
                                            <span>Paket</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                activeTab === 'paket' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {getItemCount(5)}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('oksigen')}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-gray-50 ${
                                            activeTab === 'oksigen'
                                                ? 'border-l-4 border-blue-600 bg-blue-50 font-medium text-blue-700'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">🫁</span>
                                            <span>Oksigen</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                activeTab === 'oksigen' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {getItemCount(6)}
                                        </span>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1">
                            <div className="p-6">
                                <div className="rounded-lg bg-white shadow-sm">
                                    {/* Analisis Card */}
                                    {dataGroupper && (
                                        <div className="border-b border-gray-200 p-6">
                                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                {/* Tarif RS Card */}
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-600">Tarif RS</div>
                                                            <div className="text-2xl font-bold text-blue-900">{formatRupiah(totalTagihan)}</div>
                                                        </div>
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                            <span className="text-2xl">🏥</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tarif CBG Card */}
                                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm font-medium text-green-600">Tarif CBG</div>
                                                            <div className="text-2xl font-bold text-green-900">
                                                                {formatRupiah(parseInt(dataGroupper.cbg_tariff) || 0)}
                                                            </div>
                                                            <div className="mt-1 text-xs text-green-600">{dataGroupper.cbg_code}</div>
                                                        </div>
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                                            <span className="text-2xl">💰</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Analisis Untung/Rugi Card */}
                                                {(() => {
                                                    const cbgTariff = parseInt(dataGroupper.cbg_tariff) || 0;
                                                    const selisih = cbgTariff - totalTagihan;
                                                    const isUntung = selisih >= 0;
                                                    const persentase = totalTagihan > 0 ? Math.abs((selisih / totalTagihan) * 100) : 0;

                                                    return (
                                                        <div
                                                            className={`${isUntung ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'} rounded-lg border p-4`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div
                                                                        className={`text-sm font-medium ${isUntung ? 'text-emerald-600' : 'text-red-600'}`}
                                                                    >
                                                                        {isUntung ? 'Keuntungan' : 'Kerugian'}
                                                                    </div>
                                                                    <div
                                                                        className={`text-2xl font-bold ${isUntung ? 'text-emerald-900' : 'text-red-900'}`}
                                                                    >
                                                                        {formatRupiah(Math.abs(selisih))}
                                                                    </div>
                                                                    <div className={`text-xs ${isUntung ? 'text-emerald-600' : 'text-red-600'} mt-1`}>
                                                                        {persentase.toFixed(1)}% dari tarif RS
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={`h-12 w-12 ${isUntung ? 'bg-emerald-100' : 'bg-red-100'} flex items-center justify-center rounded-full`}
                                                                >
                                                                    <span className="text-2xl">{isUntung ? '📈' : '📉'}</span>
                                                                </div>
                                                            </div>

                                                            {/* Progress Bar */}
                                                            <div className="mt-3">
                                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                                    <span className={`${isUntung ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                        {isUntung ? 'Margin Positif' : 'Margin Negatif'}
                                                                    </span>
                                                                    <span className="text-gray-500">{Math.min(persentase, 100).toFixed(0)}%</span>
                                                                </div>
                                                                <div className="h-2 w-full rounded-full bg-gray-200">
                                                                    <div
                                                                        className={`h-2 rounded-full ${isUntung ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${Math.min(persentase, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Analisis Detail */}
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <h4 className="mb-2 font-medium text-gray-900">Analisis Finansial</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                    <div>
                                                        <span className="text-gray-600">Efisiensi Biaya:</span>
                                                        <span className="ml-2 font-medium">
                                                            {totalTagihan > 0
                                                                ? ((totalTagihan / (parseInt(dataGroupper.cbg_tariff) || 1)) * 100).toFixed(1)
                                                                : 0}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Status:</span>
                                                        <span
                                                            className={`ml-2 font-medium ${
                                                                (parseInt(dataGroupper.cbg_tariff) || 0) >= totalTagihan
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }`}
                                                        >
                                                            {(parseInt(dataGroupper.cbg_tariff) || 0) >= totalTagihan
                                                                ? 'Dalam Batas CBG'
                                                                : 'Melebihi CBG'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Kelas Rawat:</span>
                                                        <span className="ml-2 font-medium">{dataGroupper.kelas}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">INACBG Version:</span>
                                                        <span className="ml-2 font-medium">{dataGroupper.inacbg_version}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Header */}
                                    <div className="border-b border-gray-200 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-medium text-gray-900">
                                                    {activeTab === 'semua'
                                                        ? 'Semua Rincian Tagihan'
                                                        : activeTab === 'administrasi'
                                                          ? 'Administrasi'
                                                          : activeTab === 'ruang-rawat'
                                                            ? 'Ruang Rawat'
                                                            : activeTab === 'tindakan'
                                                              ? 'Tindakan'
                                                              : activeTab === 'barang-obat'
                                                                ? 'Barang/Obat'
                                                                : activeTab === 'paket'
                                                                  ? 'Paket'
                                                                  : 'Oksigen'}
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-500">{filteredTagihan.length} item ditemukan</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">Subtotal</div>
                                                <div className="text-lg font-semibold text-gray-900">{formatRupiah(totalTagihan)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CBG Comparison Table */}
                                    {dataGroupper && (
                                        <div className="border-b border-gray-200 bg-green-50 px-6 py-4">
                                            <h3 className="mb-4 text-lg font-medium text-gray-900">Perbandingan Tarif</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-300">
                                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jenis Tarif</th>
                                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Tarif RS</th>
                                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Tarif CBG</th>
                                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Selisih</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b border-gray-200">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                CBG - {dataGroupper.cbg_code}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                                {formatRupiah(totalTagihan)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                                                                {formatRupiah(parseInt(dataGroupper.cbg_tariff) || 0)}
                                                            </td>
                                                            <td
                                                                className={`px-4 py-3 text-right text-sm font-semibold ${
                                                                    (parseInt(dataGroupper.cbg_tariff) || 0) - totalTagihan >= 0
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600'
                                                                }`}
                                                            >
                                                                {formatRupiah(Math.abs((parseInt(dataGroupper.cbg_tariff) || 0) - totalTagihan))}
                                                                {(parseInt(dataGroupper.cbg_tariff) || 0) - totalTagihan >= 0
                                                                    ? ' (Untung)'
                                                                    : ' (Rugi)'}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Body */}
                                    <div className="p-6">
                                        {filteredTagihan.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-200">
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                No
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Nama Tarif
                                                            </th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Qty
                                                            </th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Harga Satuan
                                                            </th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Diskon
                                                            </th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Subtotal
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {filteredTagihan.map((item: RincianTagihan, index: number) => {
                                                            const subtotal = item.JUMLAH * item.TARIF;
                                                            const diskon = (subtotal * item.PERSENTASE_DISKON) / 100;
                                                            const total = subtotal - diskon;

                                                            return (
                                                                <tr key={`${item.JENIS}-${item.TARIF_ID}-${index}`} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-500">
                                                                        {index + 1}
                                                                    </td>
                                                                    <td className="px-4 py-4">
                                                                        <div className="text-sm font-medium text-gray-900">{getNamaTarif(item)}</div>
                                                                        <div className="mt-1 text-xs text-gray-500">
                                                                            {getKategoriTarif(item.JENIS)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                                                                        {item.JUMLAH}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                                                                        {formatRupiah(item.TARIF)}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-center text-sm text-gray-900">
                                                                        {item.PERSENTASE_DISKON}%
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                                                                        {formatRupiah(total)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <div className="text-sm text-gray-400">
                                                    Tidak ada data untuk kategori {activeTab.replace('-', ' ')}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rekomendasi Card */}
                                    {dataGroupper && (
                                        <div className="border-t border-gray-200 bg-amber-50 px-6 py-4">
                                            {(() => {
                                                const cbgTariff = parseInt(dataGroupper.cbg_tariff) || 0;
                                                const selisih = cbgTariff - totalTagihan;
                                                const isUntung = selisih >= 0;
                                                const persentaseSelisih = totalTagihan > 0 ? Math.abs((selisih / totalTagihan) * 100) : 0;

                                                return (
                                                    <div>
                                                        <h4 className="mb-3 flex items-center font-medium text-amber-800">
                                                            <span className="mr-2">💡</span>
                                                            Rekomendasi & Insight
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            {isUntung ? (
                                                                <div className="flex items-start space-x-2">
                                                                    <span className="mt-0.5 text-green-500">✅</span>
                                                                    <div>
                                                                        <span className="font-medium text-green-700">Posisi Menguntungkan:</span>
                                                                        <span className="ml-1 text-gray-700">
                                                                            Tarif RS lebih rendah {formatRupiah(Math.abs(selisih))} dari CBG.
                                                                            {persentaseSelisih > 20 &&
                                                                                ' Margin sangat baik untuk optimalisasi layanan.'}
                                                                            {persentaseSelisih <= 20 &&
                                                                                persentaseSelisih > 10 &&
                                                                                ' Margin cukup untuk pengembangan.'}
                                                                            {persentaseSelisih <= 10 && ' Margin tipis, perlu monitoring ketat.'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-start space-x-2">
                                                                    <span className="mt-0.5 text-red-500">⚠️</span>
                                                                    <div>
                                                                        <span className="font-medium text-red-700">Perlu Evaluasi:</span>
                                                                        <span className="ml-1 text-gray-700">
                                                                            Tarif RS melebihi CBG sebesar {formatRupiah(Math.abs(selisih))}.
                                                                            {persentaseSelisih > 30 &&
                                                                                ' Diperlukan review menyeluruh terhadap komponen biaya.'}
                                                                            {persentaseSelisih <= 30 &&
                                                                                persentaseSelisih > 15 &&
                                                                                ' Perlu optimalisasi efisiensi operasional.'}
                                                                            {persentaseSelisih <= 15 &&
                                                                                ' Selisih masih dalam batas wajar untuk monitoring.'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Breakdown by category with highest cost */}
                                                            {(() => {
                                                                const categoryTotals = [1, 2, 3, 4, 5, 6]
                                                                    .map((jenis) => {
                                                                        const items = rincian_tagihan.filter((item) => item.JENIS === jenis);
                                                                        const total = items.reduce((sum, item) => {
                                                                            const subtotal = item.JUMLAH * item.TARIF;
                                                                            const diskon = (subtotal * item.PERSENTASE_DISKON) / 100;
                                                                            return sum + (subtotal - diskon);
                                                                        }, 0);
                                                                        return { jenis, total, nama: getKategoriTarif(jenis) };
                                                                    })
                                                                    .filter((cat) => cat.total > 0)
                                                                    .sort((a, b) => b.total - a.total);

                                                                const topCategory = categoryTotals[0];
                                                                const topPercentage =
                                                                    totalTagihan > 0 ? (topCategory?.total / totalTagihan) * 100 : 0;

                                                                return (
                                                                    topCategory && (
                                                                        <div className="flex items-start space-x-2">
                                                                            <span className="mt-0.5 text-blue-500">📊</span>
                                                                            <div>
                                                                                <span className="font-medium text-blue-700">Komponen Terbesar:</span>
                                                                                <span className="ml-1 text-gray-700">
                                                                                    {topCategory.nama} ({topPercentage.toFixed(1)}% -{' '}
                                                                                    {formatRupiah(topCategory.total)})
                                                                                    {topPercentage > 50 && ' - Dominan, perlu perhatian khusus.'}
                                                                                    {topPercentage <= 50 &&
                                                                                        topPercentage > 30 &&
                                                                                        ' - Signifikan dalam total biaya.'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                );
                                                            })()}

                                                            <div className="flex items-start space-x-2">
                                                                <span className="mt-0.5 text-purple-500">🎯</span>
                                                                <div>
                                                                    <span className="font-medium text-purple-700">Target CBG:</span>
                                                                    <span className="ml-1 text-gray-700">
                                                                        Untuk mencapai break-even, perlu {isUntung ? 'mempertahankan' : 'mengurangi'}{' '}
                                                                        biaya
                                                                        {!isUntung && ` sebesar ${formatRupiah(Math.abs(selisih))}`}
                                                                        {isUntung && ' pada level saat ini'}.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Footer Summary */}
                                    {filteredTagihan.length > 0 && (
                                        <div className="rounded-b-lg border-t border-gray-200 bg-gray-50 px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                    Total {filteredTagihan.length} item dalam kategori {activeTab.replace('-', ' ')}
                                                </div>
                                                <div className="text-lg font-bold text-gray-900">{formatRupiah(totalTagihan)}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
