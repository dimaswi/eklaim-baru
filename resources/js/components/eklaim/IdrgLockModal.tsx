import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface IdrgLockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenIdrgGrouping: () => void;
    pengajuanKlaim: {
        nomor_sep: string;
        nama_pasien: string;
        idrg?: number | string | null;
        [key: string]: any;
    };
}

export default function IdrgLockModal({ isOpen, onClose, onOpenIdrgGrouping, pengajuanKlaim }: IdrgLockModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-800">IDRG Grouping Diperlukan</h3>
                            <p className="text-sm font-normal text-gray-600">Nomor SEP: {pengajuanKlaim.nomor_sep}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-sm leading-relaxed text-yellow-700">
                            Sebelum dapat menyimpan progress atau submit klaim, Anda harus melakukan IDRG Grouping terlebih dahulu untuk pasien{' '}
                            <strong>{pengajuanKlaim.nama_pasien}</strong>.
                        </p>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-xl text-blue-600">ℹ️</div>
                            <div>
                                <h4 className="mb-1 font-semibold text-blue-900">Langkah Selanjutnya</h4>
                                <p className="mb-3 text-sm text-blue-700">
                                    Klik tombol di bawah untuk membuka form IDRG Grouping dan pilih diagnosis serta prosedur yang sesuai.
                                </p>
                                <Button
                                    onClick={() => {
                                        onClose();
                                        onOpenIdrgGrouping();
                                    }}
                                    className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                                >
                                    <span className="mr-2">🔄</span>
                                    Lakukan IDRG Grouping
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t pt-4">
                    <Button onClick={onClose} variant="outline" className="min-w-20">
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
