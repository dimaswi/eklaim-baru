import React from 'react';

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
    dataGrouperStage2: DataGrouperStage2 | null;
}

const HasilGrouperStage2Tab: React.FC<Props> = ({ dataGrouperStage2 }) => {
    if (!dataGrouperStage2) {
        return (
            <div className="p-6 text-center">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-8">
                    <div className="text-gray-600 text-lg mb-2">📊</div>
                    <h3 className="text-lg font-bold text-black mb-2">Belum Ada Data Groupper Stage 2</h3>
                    <p className="text-gray-700">Data akan muncul setelah proses groupper stage 2 berhasil dijalankan</p>
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
            'kelas_1': 'Kelas 1',
            'kelas_2': 'Kelas 2', 
            'kelas_3': 'Kelas 3',
        };
        return kelasMap[kelas] || kelas;
    };

    const covid19Data = dataGrouperStage2.covid19_data || {};
    const responseInagrouper = dataGrouperStage2.response_inagrouper || {};
    const specialCmgOptions = dataGrouperStage2.special_cmg_option || [];
    const tarifAlt = dataGrouperStage2.tarif_alt || [];
    const specialCmg = dataGrouperStage2.special_cmg || [];

    // Calculate total tariff including special CMG
    const calculateTotalTariff = () => {
        let total = parseInt(dataGrouperStage2.cbg_tariff) || 0;
        
        // Add special CMG tariffs
        specialCmg.forEach(cmg => {
            total += cmg.tariff || 0;
        });
        
        // Add additional payment
        total += dataGrouperStage2.add_payment_amt || 0;
        
        return total;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-300 text-center py-3 rounded-t-lg border border-gray-400">
                <h2 className="text-lg font-bold text-black">
                    Hasil Groupper E-Klaim v6 (Stage 2)
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                    Pemrosesan dengan Special CMG: {dataGrouperStage2.selected_special_cmg}
                </p>
            </div>

            {/* Stage 2 Processing Info */}
            <div className="bg-black text-white px-4 py-3 border border-gray-400 rounded">
                <div className="flex items-center gap-3">
                    <div className="text-xl">⚡</div>
                    <div>
                        <h3 className="font-bold">Grouping Stage 2 - Request Data</h3>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>Method:</strong> grouper • <strong>Stage:</strong> 2
                            </div>
                            <div>
                                <strong>SEP:</strong> {dataGrouperStage2.nomor_sep} • <strong>Special CMG:</strong> {dataGrouperStage2.selected_special_cmg}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metadata Information */}
            <div className="bg-gray-200 px-4 py-3 border border-gray-400 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div><strong className="text-black">Status:</strong> <span className="text-gray-700">{dataGrouperStage2.metadata_code} - {dataGrouperStage2.metadata_message}</span></div>
                        <div><strong className="text-black">INA-CBG Version:</strong> <span className="text-gray-700">{dataGrouperStage2.inacbg_version}</span></div>
                        <div><strong className="text-black">Processing Date:</strong> <span className="text-gray-700">{new Date(dataGrouperStage2.created_at).toLocaleString('id-ID')}</span></div>
                    </div>
                    <div className="space-y-1">
                        <div><strong className="text-black">Base Data Groupper ID:</strong> <span className="text-gray-700">{dataGrouperStage2.data_groupper_id}</span></div>
                        <div><strong className="text-black">Kelas Rawat:</strong> <span className="text-gray-700">{getKelasLabel(dataGrouperStage2.kelas)}</span></div>
                        <div><strong className="text-black">Special CMG Applied:</strong> <span className="text-gray-700 font-mono">{dataGrouperStage2.selected_special_cmg}</span></div>
                    </div>
                </div>
            </div>

            {/* Main Groupper Table */}
            <div className="border border-black rounded-lg overflow-hidden">
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
                            <td className="px-4 py-3 text-gray-800">{dataGrouperStage2.cbg_description}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm bg-gray-100 border border-gray-300">{dataGrouperStage2.cbg_code}</td>
                            <td className="px-4 py-3 text-right font-bold text-black">
                                {formatCurrency(dataGrouperStage2.cbg_tariff)}
                            </td>
                        </tr>

                        {/* Special CMG Rows */}
                        {specialCmg.map((cmg, index) => (
                            <tr key={index} className="bg-gray-50">
                                <td className="px-4 py-3 font-bold text-black">{cmg.type}</td>
                                <td className="px-4 py-3 text-gray-800">{cmg.description}</td>
                                <td className="px-4 py-3 text-center font-mono text-sm bg-gray-100 border border-gray-300">{cmg.code}</td>
                                <td className="px-4 py-3 text-right font-bold text-black">
                                    {formatCurrency(cmg.tariff)}
                                </td>
                            </tr>
                        ))}

                        {/* Additional Payment Row */}
                        {dataGrouperStage2.add_payment_amt && dataGrouperStage2.add_payment_amt > 0 && (
                            <tr className="bg-white">
                                <td className="px-4 py-3 font-bold text-black">Additional Payment</td>
                                <td className="px-4 py-3 text-gray-800">Pembayaran Tambahan</td>
                                <td className="px-4 py-3 text-center text-gray-600">-</td>
                                <td className="px-4 py-3 text-right font-bold text-black">
                                    {formatCurrency(dataGrouperStage2.add_payment_amt)}
                                </td>
                            </tr>
                        )}

                        {/* Total Row */}
                        <tr className="bg-black text-white border-t-2 border-black">
                            <td className="px-4 py-4 font-bold text-lg" colSpan={3}>TOTAL TARIF</td>
                            <td className="px-4 py-4 text-right font-bold text-xl">
                                {formatCurrency(calculateTotalTariff())}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* INA Grouper Response */}
            {responseInagrouper && Object.keys(responseInagrouper).length > 0 && (
                <div className="space-y-4">
                    <div className="bg-gray-300 text-center py-3 border border-gray-400 rounded">
                        <h3 className="text-lg font-bold text-black">INA-Grouper Response</h3>
                    </div>

                    <div className="border border-black rounded-lg overflow-hidden">
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
                                    <td className="px-4 py-3 text-center font-mono bg-gray-100 border border-gray-300">{responseInagrouper.mdc_number || 'N/A'}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-bold text-black">DRG</td>
                                    <td className="px-4 py-3 text-gray-800">{responseInagrouper.drg_description || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center font-mono bg-gray-100 border border-gray-300">{responseInagrouper.drg_code || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Enhanced Tarif Alternative with Special CMG */}
            {tarifAlt && tarifAlt.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-gray-300 text-center py-3 border border-gray-400 rounded">
                        <h3 className="text-lg font-bold text-black">Tarif Alternatif per Kelas (dengan Special CMG)</h3>
                    </div>

                    <div className="border border-black rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">Kelas</th>
                                    <th className="px-4 py-3 text-right font-bold">Tarif INA-CBG</th>
                                    {tarifAlt[0]?.tarif_sp && <th className="px-4 py-3 text-right font-bold">Special Procedure</th>}
                                    {tarifAlt[0]?.tarif_sr && <th className="px-4 py-3 text-right font-bold">Special Prosthesis</th>}
                                    <th className="px-4 py-3 text-right font-bold">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-400">
                                {tarifAlt.map((tarif, index) => {
                                    const total = parseInt(tarif.tarif_inacbg) + (tarif.tarif_sp || 0) + (tarif.tarif_sr || 0);
                                    return (
                                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="px-4 py-3 font-bold text-black">{getKelasLabel(tarif.kelas)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-black">{formatCurrency(tarif.tarif_inacbg)}</td>
                                            {tarif.tarif_sp !== undefined && (
                                                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(tarif.tarif_sp)}</td>
                                            )}
                                            {tarif.tarif_sr !== undefined && (
                                                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(tarif.tarif_sr)}</td>
                                            )}
                                            <td className="px-4 py-3 text-right font-bold text-black bg-gray-100 border border-gray-300">
                                                {formatCurrency(total)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* COVID-19 Data */}
            {covid19Data && Object.keys(covid19Data).length > 0 && (
                <div className="space-y-4">
                    <div className="bg-gray-300 text-center py-3 border border-gray-400 rounded">
                        <h3 className="text-lg font-bold text-black">Data COVID-19</h3>
                    </div>

                    <div className="bg-gray-100 border border-gray-400 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {covid19Data.covid19_status_cd && (
                                <div>
                                    <strong className="text-black">Status COVID-19:</strong>
                                    <p className="text-gray-700 mt-1">
                                        {covid19Data.covid19_status_cd} - {covid19Data.covid19_status_nm}
                                    </p>
                                </div>
                            )}
                            
                            {covid19Data.no_kartu_t && (
                                <div>
                                    <strong className="text-black">No. Kartu:</strong>
                                    <p className="text-gray-700 mt-1">{covid19Data.no_kartu_t}</p>
                                </div>
                            )}
                            
                            {covid19Data.cc_ind && (
                                <div>
                                    <strong className="text-black">CC Indicator:</strong>
                                    <p className="text-gray-700 mt-1">{covid19Data.cc_ind}</p>
                                </div>
                            )}
                            
                            {covid19Data.top_up_rawat && (
                                <div>
                                    <strong className="text-black">Top Up Rawat:</strong>
                                    <p className="text-gray-700 mt-1">{formatCurrency(covid19Data.top_up_rawat)}</p>
                                </div>
                            )}
                        </div>

                        {/* COVID Episodes */}
                        {covid19Data.episodes && covid19Data.episodes.length > 0 && (
                            <div className="mt-4">
                                <div className="bg-gray-300 text-center py-2 border border-gray-400 rounded mb-2">
                                    <h4 className="font-bold text-black">Episodes</h4>
                                </div>
                                <div className="border border-black rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-black text-white">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold">ID</th>
                                                <th className="px-3 py-2 text-left font-bold">Class</th>
                                                <th className="px-3 py-2 text-center font-bold">LOS</th>
                                                <th className="px-3 py-2 text-right font-bold">Tarif</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-400">
                                            {covid19Data.episodes.map((episode: any, index: number) => (
                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    <td className="px-3 py-2 font-mono text-black">{episode.episode_id}</td>
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

                        {/* Pemulasaraan Jenazah */}
                        {covid19Data.pemulasaraan_jenazah && (
                            <div className="mt-4">
                                <div className="bg-gray-300 text-center py-2 border border-gray-400 rounded mb-2">
                                    <h4 className="font-bold text-black">Pemulasaraan Jenazah</h4>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(covid19Data.pemulasaraan_jenazah).map(([key, value]) => (
                                        <div key={key} className="bg-white border border-gray-300 rounded p-2 text-center">
                                            <div className="font-bold text-black capitalize">{key.replace('_', ' ')}</div>
                                            <div className="text-gray-700">{value as string}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Debug & Footer */}
            <div className="text-center space-y-2">
                <div className="text-left">
                    <a href="#" className="text-gray-600 hover:text-black text-sm border border-gray-400 px-2 py-1 rounded">
                        [ debug stage 2 ]
                    </a>
                </div>
                <div className="text-xs text-gray-500 py-4 border-t border-gray-300">
                    Stage 2 data diproses pada: {new Date(dataGrouperStage2.created_at).toLocaleString('id-ID')}
                    <span className="block mt-1 text-black font-medium">
                        Selected Special CMG: {dataGrouperStage2.selected_special_cmg}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HasilGrouperStage2Tab;