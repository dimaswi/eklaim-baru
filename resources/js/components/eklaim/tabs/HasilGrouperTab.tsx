import React, { useState } from 'react';

interface DataGroupper {
    id: number;
    pengajuan_klaim_id: number;
    nomor_sep: string;
    metadata_code: number;
    metadata_message: string;
    cbg_code: string;
    cbg_description: string;
    cbg_tariff: string;
    sub_acute_code: string;
    sub_acute_description: string;
    sub_acute_tariff: number;
    chronic_code: string;
    chronic_description: string;
    chronic_tariff: number;
    kelas: string;
    add_payment_amt: number;
    inacbg_version: string;
    covid19_data: any;
    response_inagrouper: any;
    special_cmg_option: any[];
    tarif_alt: any[];
    full_response: any;
    created_at: string;
    updated_at: string;
}

interface DataGrouperStage2 {
    id: number;
    pengajuan_klaim_id: number;
    data_groupper_id: number;
    nomor_sep: string;
    selected_special_cmg: string;
    metadata_code: number;
    metadata_message: string;
    cbg_code: string;
    cbg_description: string;
    cbg_tariff: string;
    special_cmg: any[];
    kelas: string;
    add_payment_amt: number;
    inacbg_version: string;
    covid19_data: any;
    response_inagrouper: any;
    special_cmg_option: any[];
    tarif_alt: any[];
    full_response: any;
    created_at: string;
    updated_at: string;
}

interface Props {
    dataGroupper: DataGroupper | null;
    dataGrouperStage2?: DataGrouperStage2 | null;
    onRequestStage2?: (selectedSpecialCmg: string, nomor_sep: string) => void;
    onRequestFinal?: (nomor_sep: string, coder_nik: string) => void;
    onRequestGrouperUlang?: (nomor_sep: string) => void;
    isLoadingStage2?: boolean;
    isLoadingFinal?: boolean;
    isLoadingGrouperUlang?: boolean;
    statusPengiriman?: number;
    coderNik?: string;
    hasSpecialCmgOptions?: boolean;
}

const HasilGrouperTab: React.FC<Props> = ({
    dataGroupper,
    dataGrouperStage2,
    onRequestStage2,
    onRequestFinal,
    onRequestGrouperUlang,
    isLoadingStage2,
    isLoadingFinal,
    isLoadingGrouperUlang,
    statusPengiriman,
    coderNik,
    hasSpecialCmgOptions,
}) => {
    const [selectedSpecialCmg, setSelectedSpecialCmg] = useState<string>('');
    const [isConfirmFinalOpen, setIsConfirmFinalOpen] = useState(false);
    
    if (!dataGroupper) {
        return (
            <div className="p-6 text-center">
                <div className="rounded-lg bg-gray-50 p-8">
                    <div className="mb-2 text-lg text-gray-500">📊</div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Belum Ada Data Groupper</h3>
                    <p className="text-gray-600">Data akan muncul setelah proses groupper berhasil dijalankan</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number | string): string => {
        if (!amount || amount === 0) return 'Rp 0';
        const numAmount = typeof amount === 'string' ? parseInt(amount.replace(/[^\d]/g, '')) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numAmount);
    };

    const formatNumber = (amount: number | string): string => {
        if (!amount || amount === 0) return '0';
        const numAmount = typeof amount === 'string' ? parseInt(amount.replace(/[^\d]/g, '')) : amount;
        return new Intl.NumberFormat('id-ID').format(numAmount);
    };

    const getKelasLabel = (kelas: string): string => {
        const kelasMap: { [key: string]: string } = {
            kelas_1: 'Kelas 1',
            kelas_2: 'Kelas 2',
            kelas_3: 'Kelas 3',
        };
        return kelasMap[kelas] || kelas;
    };

    // Use stage 2 data if available, otherwise use stage 1 data
    const currentData = dataGrouperStage2 || dataGroupper;
    const covid19Data = currentData.covid19_data || {};
    const responseInagrouper = currentData.response_inagrouper || {};
    const specialCmgOptions = currentData.special_cmg_option || [];
    const tarifAlt = currentData.tarif_alt || [];
    const specialCmg = dataGrouperStage2?.special_cmg || [];

    const handleStage2Request = () => {
        if (selectedSpecialCmg && onRequestStage2 && dataGroupper) {
            onRequestStage2(selectedSpecialCmg, dataGroupper.nomor_sep);
        }
    };

    const handleFinalRequest = () => {
        setIsConfirmFinalOpen(true);
    };

    const handleConfirmFinal = () => {
        if (onRequestFinal && dataGroupper && coderNik) {
            onRequestFinal(dataGroupper.nomor_sep, coderNik);
        }
        setIsConfirmFinalOpen(false);
    };

    const handleGrouperUlangRequest = () => {
        if (onRequestGrouperUlang && dataGroupper) {
            onRequestGrouperUlang(dataGroupper.nomor_sep);
        }
    };

    const handleSpecialCmgChange = (value: string) => {
        setSelectedSpecialCmg(value);
    };

    // Check if should show Final/Groupper Ulang buttons
    const shouldShowFinalButtons = !specialCmgOptions.length && dataGroupper && !hasSpecialCmgOptions;

    return (
        <div className="space-y-6">
            {/* Hasil Groupper E-Klaim Header */}
            <div className="rounded-t-lg border border-gray-400 bg-gray-300 py-3 text-center">
                <h2 className="text-lg font-bold text-black">Hasil Groupper E-Klaim v5 (Stage 1)</h2>
            </div>

            {/* Status Information */}
            {dataGroupper && (
                <div className="rounded border border-gray-400 bg-gray-200 px-4 py-3">
                    <div className="mb-2 flex items-center gap-3">
                        <div
                            className={`h-3 w-3 rounded-full ${
                                dataGrouperStage2 ? 'bg-green-500' : specialCmgOptions.length > 0 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                        ></div>
                        <strong className="text-black">Status Groupper: 
                            {dataGrouperStage2 ? ' Stage 2 Selesai' : 
                             specialCmgOptions.length > 0 ? ' Stage 1 Selesai - Perlu Stage 2' : 
                             ' Stage 1 Selesai'}
                        </strong>
                        <span className="rounded bg-gray-300 px-2 py-1 text-xs text-gray-700">
                            {dataGrouperStage2 ? 'Selesai' : 
                             specialCmgOptions.length > 0 ? 'Pilih Special CMG' : 
                             'Siap Finalisasi'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-600">
                        Special CMG Options: {specialCmgOptions.length > 0 ? `${specialCmgOptions.length} tersedia` : 'Tidak tersedia'}
                        {coderNik && ` • Coder NIK: ${coderNik}`}
                    </div>
                </div>
            )}

            {/* Metadata Information */}
            <div className="rounded border border-gray-400 bg-gray-200 px-4 py-3">
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div className="space-y-1">
                        <div>
                            <strong className="text-black">Status:</strong>{' '}
                            <span className="text-gray-700">
                                {currentData.metadata_code} - {currentData.metadata_message}
                            </span>
                        </div>
                        <div>
                            <strong className="text-black">INA-CBG Version:</strong>{' '}
                            <span className="text-gray-700">{currentData.inacbg_version}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div>
                            <strong className="text-black">SEP:</strong> <span className="text-gray-700">{currentData.nomor_sep}</span>
                        </div>
                        <div>
                            <strong className="text-black">Kelas Rawat:</strong>{' '}
                            <span className="text-gray-700">{getKelasLabel(currentData.kelas)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Groupper Table */}
            <div className="overflow-hidden rounded-lg border border-black">
                <table className="w-full text-sm">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold">Komponen</th>
                            <th className="px-4 py-3 text-left font-bold">Deskripsi</th>
                            <th className="px-4 py-3 text-center font-bold">Kode</th>
                            <th className="px-4 py-3 text-right font-bold">Tarif</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400">
                        {/* CBG Group Row */}
                        <tr className="bg-white">
                            <td className="px-4 py-3 font-bold text-black">Group (CBG)</td>
                            <td className="px-4 py-3 text-gray-800">{currentData.cbg_description}</td>
                            <td className="border border-gray-300 bg-gray-100 px-4 py-3 text-center font-mono text-sm">{currentData.cbg_code}</td>
                            <td className="px-4 py-3 text-right font-bold text-black">{formatCurrency(currentData.cbg_tariff)}</td>
                        </tr>

                        {/* Sub Acute Row */}
                        <tr className="bg-gray-50">
                            <td className="px-4 py-3 font-bold text-black">Sub Acute</td>
                            <td className="px-4 py-3 text-gray-800">{dataGroupper?.sub_acute_description || '-'}</td>
                            <td className="border border-gray-300 bg-gray-100 px-4 py-3 text-center font-mono text-sm">
                                {dataGroupper?.sub_acute_code || '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-black">
                                {dataGroupper?.sub_acute_tariff ? formatCurrency(dataGroupper.sub_acute_tariff) : 'Rp 0'}
                            </td>
                        </tr>

                        {/* Chronic Row */}
                        <tr className="bg-white">
                            <td className="px-4 py-3 font-bold text-black">Chronic</td>
                            <td className="px-4 py-3 text-gray-800">{dataGroupper?.chronic_description || '-'}</td>
                            <td className="border border-gray-300 bg-gray-100 px-4 py-3 text-center font-mono text-sm">
                                {dataGroupper?.chronic_code || '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-black">
                                {dataGroupper?.chronic_tariff ? formatCurrency(dataGroupper.chronic_tariff) : 'Rp 0'}
                            </td>
                        </tr>

                        {/* Additional Payment Row */}
                        {currentData.add_payment_amt && currentData.add_payment_amt > 0 && (
                            <tr className="bg-gray-50">
                                <td className="px-4 py-3 font-bold text-black">Additional Payment</td>
                                <td className="px-4 py-3 text-gray-800">Pembayaran Tambahan</td>
                                <td className="px-4 py-3 text-center text-gray-600">-</td>
                                <td className="px-4 py-3 text-right font-bold text-black">{formatCurrency(currentData.add_payment_amt)}</td>
                            </tr>
                        )}

                        {/* Total Row */}
                        <tr className="border-t-2 border-black bg-black text-white">
                            <td className="px-4 py-4 text-lg font-bold" colSpan={3}>
                                TOTAL TARIF
                            </td>
                            <td className="px-4 py-4 text-right text-xl font-bold">
                                {formatCurrency(
                                    parseInt(currentData.cbg_tariff) +
                                        (dataGroupper?.sub_acute_tariff || 0) +
                                        (dataGroupper?.chronic_tariff || 0) +
                                        (currentData.add_payment_amt || 0),
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* INA Grouper Response v6 */}
            {responseInagrouper && Object.keys(responseInagrouper).length > 0 && (
                <div className="space-y-4">
                    {/* Header v6 */}
                    <div className="rounded-t-lg bg-gray-200 py-3 text-center">
                        <h2 className="text-lg font-semibold text-gray-800">Hasil Groupper E-Klaim v6</h2>
                    </div>

                    {/* Info Header v6 */}
                    <div className="bg-gray-100 px-4 py-2 text-sm text-gray-700">
                        <div className="flex flex-wrap gap-4">
                            <span>
                                <strong>Info:</strong> {responseInagrouper.mdc_description || 'N/A'}
                            </span>
                            <span>
                                <strong>Jenis Rawat:</strong> Rawat Inap (3 Hari)
                            </span>
                        </div>
                    </div>

                    {/* INA Grouper Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-300">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-200">
                                {/* MDC Row */}
                                <tr className="bg-white">
                                    <td className="w-16 px-4 py-3 font-medium text-gray-700">MDC</td>
                                    <td className="px-4 py-3 text-gray-900">{responseInagrouper.mdc_description}</td>
                                    <td className="bg-gray-50 px-4 py-3 text-center font-mono text-sm">{responseInagrouper.mdc_number}</td>
                                </tr>

                                {/* DRG Row */}
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium text-gray-700">DRG</td>
                                    <td className="px-4 py-3 text-gray-900">{responseInagrouper.drg_description}</td>
                                    <td className="bg-gray-50 px-4 py-3 text-center font-mono text-sm">{responseInagrouper.drg_code}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* INA Grouper Response */}
            {responseInagrouper && Object.keys(responseInagrouper).length > 0 && (
                <div className="space-y-4">
                    <div className="rounded border border-gray-400 bg-gray-300 py-3 text-center">
                        <h3 className="text-lg font-bold text-black">INA-Grouper Response</h3>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-black">
                        <table className="w-full text-sm">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">Komponen</th>
                                    <th className="px-4 py-3 text-left font-bold">Deskripsi</th>
                                    <th className="px-4 py-3 text-center font-bold">Kode/Nomor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-400">
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-bold text-black">MDC</td>
                                    <td className="px-4 py-3 text-gray-800">{responseInagrouper.mdc_description || 'N/A'}</td>
                                    <td className="border border-gray-300 bg-gray-100 px-4 py-3 text-center font-mono">
                                        {responseInagrouper.mdc_number || 'N/A'}
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-bold text-black">DRG</td>
                                    <td className="px-4 py-3 text-gray-800">{responseInagrouper.drg_description || 'N/A'}</td>
                                    <td className="border border-gray-300 bg-gray-100 px-4 py-3 text-center font-mono">
                                        {responseInagrouper.drg_code || 'N/A'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Special CMG Options or Final Actions */}
            {specialCmgOptions && specialCmgOptions.length > 0 ? (
                <div className="space-y-4">
                    <div className="rounded border border-gray-400 bg-gray-300 py-3 text-center">
                        <h3 className="text-lg font-bold text-black">Special CMG Options</h3>
                        <p className="mt-1 text-sm text-gray-700">Pilih salah satu untuk melanjutkan ke Grouping Stage 2</p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-black">
                        <table className="w-full text-sm">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-4 py-3 text-center font-bold">Pilih</th>
                                    <th className="px-4 py-3 text-left font-bold">Kode</th>
                                    <th className="px-4 py-3 text-left font-bold">Deskripsi</th>
                                    <th className="px-4 py-3 text-center font-bold">Tipe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-400">
                                {specialCmgOptions.map((option, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="radio"
                                                name="special_cmg_selection"
                                                value={`${option.code}#${option.type}`}
                                                checked={selectedSpecialCmg === `${option.code}#${option.type}`}
                                                onChange={(e) => handleSpecialCmgChange(e.target.value)}
                                                className="h-4 w-4 border-2 border-gray-400"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-black">{option.code}</td>
                                        <td className="px-4 py-3 text-gray-800">{option.description}</td>
                                        <td className="border border-gray-300 bg-gray-100 px-4 py-3 text-center text-gray-700">{option.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Stage 2 Action Button */}
                    <div className="py-4 text-center">
                        <button
                            onClick={handleStage2Request}
                            disabled={!selectedSpecialCmg || isLoadingStage2}
                            className={`rounded border px-6 py-3 font-bold ${
                                selectedSpecialCmg && !isLoadingStage2
                                    ? 'border-gray-400 bg-black text-white hover:bg-gray-800'
                                    : 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600'
                            }`}
                        >
                            {isLoadingStage2 ? 'Memproses...' : 'Lanjutkan ke Grouping Stage 2'}
                        </button>
                        <p className="mt-2 text-xs text-gray-600">
                            {!selectedSpecialCmg
                                ? 'Pilih salah satu Special CMG option di atas terlebih dahulu'
                                : `Akan mengirim: ${selectedSpecialCmg.split('#')[0]} (${selectedSpecialCmg.split('#')[1]})`}
                        </p>

                        {/* Stage 2 Request Format Preview */}
                        {selectedSpecialCmg && (
                            <div className="mt-4 rounded border border-gray-300 bg-gray-100 p-3 text-left">
                                <h4 className="mb-2 font-bold text-black">Request Data (Preview):</h4>
                                <pre className="font-mono text-xs text-gray-800">
                                    {`{
    "metadata": {
        "method": "grouper",
        "stage": "2"
    },
    "data": {
        "nomor_sep": "${dataGroupper?.nomor_sep || ''}",
        "special_cmg": "${selectedSpecialCmg}"
    }
}`}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            ) : shouldShowFinalButtons ? (
                <div className="space-y-4">
                    <div className="rounded border border-gray-400 bg-gray-300 py-3 text-center">
                        <h3 className="text-lg font-bold text-black">Aksi Finalisasi</h3>
                        <p className="mt-1 text-sm text-gray-700">Groupper Stage 1 Selesai - Tidak ada Special CMG Options</p>
                    </div>

                    <div className="rounded-lg border border-gray-400 bg-gray-100 p-4">
                        <div className="mb-4 flex items-start gap-3">
                            <div className="text-2xl">✅</div>
                            <div>
                                <h4 className="mb-1 font-bold text-black">Siap untuk Finalisasi</h4>
                                <p className="text-sm text-gray-700">
                                    Tidak ada pilihan Special CMG yang tersedia. Anda dapat melakukan finalisasi klaim atau mengulangi proses grouper.
                                </p>
                            </div>
                        </div>

                        {/* Final Request Preview */}
                        <div className="mb-4 rounded border border-gray-300 bg-white p-3">
                            <h4 className="mb-2 font-bold text-black">Final Request Data (Preview):</h4>
                            <pre className="font-mono text-xs text-gray-800">
                                {`{
    "metadata": {
        "method": "claim_final"
    },
    "data": {
        "nomor_sep": "${dataGroupper?.nomor_sep || ''}",
        "coder_nik": "${coderNik || '123123123123'}"
    }
}`}
                            </pre>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleFinalRequest}
                                disabled={isLoadingFinal || !coderNik}
                                className={`rounded border px-6 py-3 font-bold ${
                                    !isLoadingFinal && coderNik
                                        ? 'border-gray-400 bg-black text-white hover:bg-gray-800'
                                        : 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600'
                                }`}
                            >
                                {isLoadingFinal ? 'Memproses Final...' : 'Finalisasi Klaim'}
                            </button>

                            <button
                                onClick={handleGrouperUlangRequest}
                                disabled={isLoadingGrouperUlang}
                                className={`rounded border px-6 py-3 font-bold ${
                                    !isLoadingGrouperUlang
                                        ? 'border-gray-400 bg-white text-black hover:bg-gray-100'
                                        : 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600'
                                }`}
                            >
                                {isLoadingGrouperUlang ? 'Memproses...' : 'Groupper Ulang'}
                            </button>
                        </div>

                        <div className="mt-3 text-center">
                            {!coderNik ? (
                                <p className="text-xs text-red-600">⚠️ Coder NIK diperlukan untuk finalisasi</p>
                            ) : (
                                <p className="text-xs text-gray-600">
                                    Finalisasi akan mengirim data final • Groupper Ulang akan menjalankan ulang proses grouper
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Tarif Alternative */}
            {tarifAlt && tarifAlt.length > 0 && (
                <div className="space-y-4">
                    <div className="rounded border border-gray-400 bg-gray-300 py-3 text-center">
                        <h3 className="text-lg font-bold text-black">Tarif Alternatif per Kelas</h3>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-black">
                        <table className="w-full text-sm">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">Kelas</th>
                                    <th className="px-4 py-3 text-right font-bold">Tarif INA-CBG</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-400">
                                {tarifAlt.map((tarif, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-3 font-bold text-black">{getKelasLabel(tarif.kelas)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-black">{formatCurrency(tarif.tarif_inacbg)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* COVID-19 Data */}
            {covid19Data && Object.keys(covid19Data).length > 0 && (
                <div className="space-y-4">
                    <div className="rounded border border-gray-400 bg-gray-300 py-3 text-center">
                        <h3 className="text-lg font-bold text-black">Data COVID-19</h3>
                    </div>

                    <div className="rounded-lg border border-gray-400 bg-gray-100 p-4">
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            {covid19Data.covid19_status_cd && (
                                <div>
                                    <strong className="text-black">Status COVID-19:</strong>
                                    <p className="mt-1 text-gray-700">
                                        {covid19Data.covid19_status_cd} - {covid19Data.covid19_status_nm}
                                    </p>
                                </div>
                            )}

                            {covid19Data.no_kartu_t && (
                                <div>
                                    <strong className="text-black">No. Kartu:</strong>
                                    <p className="mt-1 text-gray-700">{covid19Data.no_kartu_t}</p>
                                </div>
                            )}
                        </div>

                        {covid19Data.episodes && covid19Data.episodes.length > 0 && (
                            <div className="mt-4">
                                <div className="mb-2 rounded border border-gray-400 bg-gray-300 py-2 text-center">
                                    <h4 className="font-bold text-black">Episodes</h4>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-black">
                                    <table className="w-full text-sm">
                                        <thead className="bg-black text-white">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold">Class</th>
                                                <th className="px-3 py-2 text-center font-bold">LOS</th>
                                                <th className="px-3 py-2 text-right font-bold">Tarif</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-400">
                                            {covid19Data.episodes.map((episode: any, index: number) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-3 py-2 text-gray-800">{episode.episode_class_nm}</td>
                                                    <td className="px-3 py-2 text-center text-gray-700">{episode.los} hari</td>
                                                    <td className="px-3 py-2 text-right font-bold text-black">{formatCurrency(episode.tariff)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Debug & Footer */}
            <div className="space-y-2 text-center">
                <div className="border-t border-gray-300 py-4 text-xs text-gray-500">
                    Data diproses pada: {new Date(currentData.created_at).toLocaleString('id-ID')}
                </div>
            </div>

            {/* Custom Confirmation Modal for Final Klaim */}
            {isConfirmFinalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 animate-in fade-in-0 duration-200"
                        onClick={() => setIsConfirmFinalOpen(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-auto animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Konfirmasi Finalisasi Klaim
                                </h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-gray-700 mb-3">
                                        Anda akan memfinalisasi klaim dengan data berikut:
                                    </p>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <strong className="text-gray-900">Nomor SEP:</strong>
                                                <div className="font-mono text-gray-700">{dataGroupper?.nomor_sep}</div>
                                            </div>
                                            <div>
                                                <strong className="text-gray-900">Coder NIK:</strong>
                                                <div className="font-mono text-gray-700">{coderNik}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="border-t pt-2 mt-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <strong className="text-gray-900">CBG Code:</strong>
                                                    <div className="font-mono text-gray-700">{currentData.cbg_code}</div>
                                                </div>
                                                <div>
                                                    <strong className="text-gray-900">Total Tarif:</strong>
                                                    <div className="font-bold text-green-600">
                                                        {formatCurrency(
                                                            parseInt(currentData.cbg_tariff) +
                                                                (dataGroupper?.sub_acute_tariff || 0) +
                                                                (dataGroupper?.chronic_tariff || 0) +
                                                                (currentData.add_payment_amt || 0),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-red-600 text-xl">🚨</div>
                                        <div>
                                            <h4 className="font-semibold text-red-900 mb-2">Peringatan Penting:</h4>
                                            <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                                                <li>Setelah difinalisasi, klaim tidak dapat diubah tanpa proses reedit</li>
                                                <li>Data akan dikirim ke sistem INACBG untuk pemrosesan final</li>
                                                <li>Pastikan semua data sudah benar sebelum melanjutkan</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-blue-900 mb-2">Data Request yang akan dikirim:</h4>
                                    <pre className="text-xs text-blue-800 font-mono bg-white p-2 rounded border overflow-x-auto">
{`{
  "metadata": {
    "method": "claim_final"
  },
  "data": {
    "nomor_sep": "${dataGroupper?.nomor_sep || ''}",
    "coder_nik": "${coderNik || ''}"
  }
}`}
                                    </pre>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmFinalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmFinal}
                                    disabled={isLoadingFinal || !coderNik}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingFinal ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Memproses...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>🔒</span>
                                            <span>Ya, Finalisasi Klaim</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HasilGrouperTab;
