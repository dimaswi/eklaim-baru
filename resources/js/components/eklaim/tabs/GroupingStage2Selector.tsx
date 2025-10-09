import React, { useState } from 'react';

interface SpecialCmgOption {
    code: string;
    description: string;
    type: string;
}

interface Props {
    specialCmgOptions: SpecialCmgOption[];
    nomor_sep: string;
    onSubmit: (selectedSpecialCmg: string, nomor_sep: string) => void;
    isLoading?: boolean;
}

const GroupingStage2Selector: React.FC<Props> = ({ 
    specialCmgOptions, 
    nomor_sep, 
    onSubmit, 
    isLoading = false 
}) => {
    const [selectedSpecialCmg, setSelectedSpecialCmg] = useState<string>('');

    const handleSubmit = () => {
        if (selectedSpecialCmg) {
            onSubmit(selectedSpecialCmg, nomor_sep);
        }
    };

    const handleSelectionChange = (value: string) => {
        setSelectedSpecialCmg(value);
    };

    if (!specialCmgOptions || specialCmgOptions.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-8">
                    <div className="text-gray-600 text-lg mb-2">⚠️</div>
                    <h3 className="text-lg font-bold text-black mb-2">Tidak Ada Special CMG Options</h3>
                    <p className="text-gray-700">
                        Special CMG options tidak tersedia untuk dilanjutkan ke Stage 2.
                        Silakan lakukan Grouping Stage 1 terlebih dahulu.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-300 text-center py-3 rounded border border-gray-400">
                <h2 className="text-lg font-bold text-black">
                    Pilih Special CMG untuk Grouping Stage 2
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                    SEP: {nomor_sep} • Pilih salah satu opsi di bawah untuk melanjutkan
                </p>
            </div>

            {/* Info Box */}
            <div className="bg-gray-100 border border-gray-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                        <h3 className="font-bold text-black mb-1">Petunjuk Grouping Stage 2</h3>
                        <p className="text-sm text-gray-700">
                            Untuk Grouping Stage 2, jika dari hasil Grouping Stage 1 terdapat pilihan 
                            special cmg option, maka silakan masukkan data pada field special_cmg. 
                            Jika pilihan bisa dari satu karena dari type yang berbeda maka silakan 
                            ditambahkan dengan tanda # di antara kode:
                        </p>
                        <div className="mt-2 p-2 bg-white border border-gray-300 rounded">
                            <code className="text-xs font-mono text-black">
                                Format: "RR04#YY01" (jika memilih lebih dari satu)
                            </code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Table */}
            <div className="border border-black rounded-lg overflow-hidden">
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
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3 text-center">
                                    <input 
                                        type="radio" 
                                        name="special_cmg_selection"
                                        value={`${option.code}#${option.type}`}
                                        checked={selectedSpecialCmg === `${option.code}#${option.type}`}
                                        onChange={(e) => handleSelectionChange(e.target.value)}
                                        className="w-4 h-4 border-2 border-gray-400"
                                        disabled={isLoading}
                                    />
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-black">{option.code}</td>
                                <td className="px-4 py-3 text-gray-800">{option.description}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs font-medium text-gray-700">
                                        {option.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Selection Preview */}
            {selectedSpecialCmg && (
                <div className="bg-gray-100 border border-gray-400 rounded-lg p-4">
                    <h4 className="font-bold text-black mb-2">Preview Request Data:</h4>
                    <div className="bg-white border border-gray-300 rounded p-3">
                        <pre className="text-xs font-mono text-gray-800">
{`{
    "metadata": {
        "method": "grouper",
        "stage": "2"
    },
    "data": {
        "nomor_sep": "${nomor_sep}",
        "special_cmg": "${selectedSpecialCmg}"
    }
}`}
                        </pre>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 py-4">
                <button 
                    onClick={handleSubmit}
                    disabled={!selectedSpecialCmg || isLoading}
                    className={`px-8 py-3 rounded border font-bold ${
                        selectedSpecialCmg && !isLoading
                            ? 'bg-black text-white border-gray-400 hover:bg-gray-800' 
                            : 'bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isLoading ? 'Memproses Grouping Stage 2...' : 'Kirim Request Stage 2'}
                </button>
                
                <button 
                    onClick={() => setSelectedSpecialCmg('')}
                    disabled={isLoading}
                    className="px-6 py-3 rounded border border-gray-400 bg-white text-gray-700 hover:bg-gray-100 font-bold"
                >
                    Reset Pilihan
                </button>
            </div>

            {/* Status Message */}
            <div className="text-center text-sm">
                {!selectedSpecialCmg ? (
                    <p className="text-gray-600">Pilih salah satu Special CMG option di atas</p>
                ) : (
                    <p className="text-black">
                        Siap mengirim: <span className="font-mono font-bold">{selectedSpecialCmg.split('#')[0]}</span> 
                        <span className="text-gray-600"> ({selectedSpecialCmg.split('#')[1]})</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default GroupingStage2Selector;