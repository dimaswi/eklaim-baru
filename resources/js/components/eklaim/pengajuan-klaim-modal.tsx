import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, User, Calendar, CreditCard, FileText, UserCheck, Info, AlertTriangle } from "lucide-react";
import { router } from "@inertiajs/react";
import { format } from "path";

interface PengajuanKlaimData {
    nomor_kartu: string;
    nomor_sep: string;
    nomor_rm: string;
    nama_pasien: string;
    tgl_lahir: string;
    gender: string;
    tanggal_masuk?: string;
    tanggal_keluar?: string;
    ruangan?: string;
    jenis_kunjungan?: number; // 1 = Rawat Inap, 2 = Rawat Jalan, 3 = Gawat Darurat
}

interface PengajuanKlaimModalProps {
    data: PengajuanKlaimData;
    disabled?: boolean;
    actionUrl?: string;
    triggerClassName?: string;
    triggerText?: string;
}

export default function PengajuanKlaimModal({ 
    data, 
    disabled = false, 
    actionUrl = '/eklaim/kunjungan/pengajuan-klaim',
    triggerClassName,
    triggerText
}: PengajuanKlaimModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '0000-00-00') return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return '-';
        }
    };

    const formatGender = (gender: string) => {
        
        if (!gender) return '-';
        
        const genderStr = gender.toString().toUpperCase();
        
        if (genderStr === 'L' || genderStr === '1' || genderStr === 'LAKI-LAKI' || genderStr === 'MALE') {
            return 'Laki-laki';
        }
        if (genderStr === 'P' || genderStr === '2' || genderStr === 'PEREMPUAN' || genderStr === 'FEMALE') {
            return 'Perempuan';
        }
        
        return gender || '-';
    };

    const formatJenisKunjungan = (jenis: number | undefined) => {
        switch (jenis) {
            case 3:
                return 'Rawat Inap';
            case 1:
                return 'Rawat Jalan';
            case 2:
                return 'Gawat Darurat';
            default:
                return '-';
        }
    }

    console.log(data.jenis_kunjungan)

    // Local editable state for tanggal masuk/keluar so user can change before submit
    const [tanggalMasuk, setTanggalMasuk] = useState<string>(data.tanggal_masuk ? String(data.tanggal_masuk).split(' ')[0] : '');
    const [tanggalKeluar, setTanggalKeluar] = useState<string>(data.tanggal_keluar ? String(data.tanggal_keluar).split(' ')[0] : '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const submitData = {
            nomor_kartu: data.nomor_kartu,
            nomor_sep: data.nomor_sep,
            nomor_rm: data.nomor_rm,
            nama_pasien: data.nama_pasien,
            tgl_lahir: data.tgl_lahir,
            gender: data.gender,
            // send edited dates (YYYY-MM-DD) if user changed them
            tanggal_masuk: tanggalMasuk || data.tanggal_masuk || null,
            tanggal_keluar: tanggalKeluar || data.tanggal_keluar || null,
            ruangan: data.ruangan,
            jenis_kunjungan: formatJenisKunjungan(data.jenis_kunjungan),
        };

        console.log('Data yang akan dikirim:', submitData);

        try {
            router.post(actionUrl, submitData, {
                onSuccess: () => {
                    setOpen(false);
                    setLoading(false);
                },
                onError: (errors) => {
                    setLoading(false);
                    
                    // Check if this is an API error (not validation error)
                    if (errors.message && !errors.errors) {
                        setErrorMessage(errors.message);
                        setShowErrorDialog(true);
                    }
                }
            });
        } catch (error) {
            setLoading(false);
        }
    };

    const handleForceSubmit = () => {
        setShowErrorDialog(false);
        setLoading(true);

        try {
            router.post(actionUrl, {
                nomor_kartu: data.nomor_kartu,
                nomor_sep: data.nomor_sep,
                nomor_rm: data.nomor_rm,
                nama_pasien: data.nama_pasien,
                tgl_lahir: data.tgl_lahir,
                gender: data.gender,
                tanggal_masuk: tanggalMasuk || data.tanggal_masuk || null,
                tanggal_keluar: tanggalKeluar || data.tanggal_keluar || null,
                ruangan: data.ruangan,
                jenis_kunjungan: formatJenisKunjungan(data.jenis_kunjungan),
                force_create: true, // Flag untuk bypass API dan langsung create ke database
            }, {
                onSuccess: () => {
                    setOpen(false);
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                }
            });
        } catch (error) {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerClassName ? (
                    <button
                        disabled={disabled}
                        className={triggerClassName}
                    >
                        {triggerText || 'Buat Pengajuan Klaim'}
                    </button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        className={disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50"}
                    >
                        <Send className={`h-4 w-4 ${disabled ? 'text-red-400' : 'text-green-400'}`} />
                        {disabled ? 'Selesai' : 'Ajukan'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="!max-w-7xl !top-[35%] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-green-500" />
                        Pengajuan Klaim BPJS
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Data Pasien
                            </CardTitle>
                            <CardDescription>
                                Informasi pasien yang akan diajukan klaim
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Nomor Kartu BPJS
                                    </Label>
                                    <Input
                                        value={data.nomor_kartu || '-'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Nomor SEP
                                    </Label>
                                    <Input
                                        value={data.nomor_sep || '-'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Nomor Rekam Medis
                                    </Label>
                                    <Input
                                        value={data.nomor_rm || '-'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Nama Pasien
                                    </Label>
                                    <Input
                                        value={data.nama_pasien || '-'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Lahir
                                    </Label>
                                    <Input
                                        value={formatDate(data.tgl_lahir)}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        Jenis Kelamin
                                    </Label>
                                    <div className="flex items-center h-10">
                                        <Badge variant="outline" className="px-3 py-1">
                                            {formatGender(data.gender)}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Masuk
                                    </Label>
                                    <Input
                                        type="date"
                                        value={tanggalMasuk}
                                        onChange={(e) => setTanggalMasuk(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Keluar
                                    </Label>
                                    <Input
                                        type="date"
                                        value={tanggalKeluar}
                                        onChange={(e) => setTanggalKeluar(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Ruangan
                                    </Label>
                                    <Input
                                        value={data.ruangan || '-'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm flex items-center text-red-500">
                            <Info className="h-4 w-4 mr-2" />
                            Pastikan semua data sudah benar sebelum mengajukan klaim
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Mengajukan...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Ajukan Klaim
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
            
            {/* Error Confirmation Dialog */}
            <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Gagal Menghubungi API INACBG
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p className="text-sm">
                                Terjadi kesalahan saat mengirim data ke API INACBG:
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700 font-medium">
                                    {errorMessage}
                                </p>
                            </div>
                            <p className="text-sm">
                                Apakah Anda ingin tetap menyimpan data pengajuan klaim ini ke database tanpa mengirim ke API INACBG? 
                                Anda dapat mencoba mengirim ulang nanti setelah masalah API teratasi.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            onClick={() => setShowErrorDialog(false)}
                            disabled={loading}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleForceSubmit}
                            disabled={loading}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                'Ya, Simpan ke Database'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}
