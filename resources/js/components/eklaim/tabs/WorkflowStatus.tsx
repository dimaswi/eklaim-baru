import React from 'react';

interface WorkflowStatusProps {
    statusPengiriman?: number;
    hasSpecialCmgOptions: boolean;
    isStage2Available: boolean;
    coderNik?: string;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ 
    statusPengiriman, 
    hasSpecialCmgOptions, 
    isStage2Available,
    coderNik 
}) => {
    const getStatusInfo = () => {
        if (hasSpecialCmgOptions) {
            return {
                icon: '🔄',
                title: 'Stage 2 Tersedia',
                description: 'Pilih Special CMG untuk melanjutkan ke Grouping Stage 2',
                color: 'bg-blue-100 border-blue-400',
                textColor: 'text-blue-800'
            };
        }
        
        if (statusPengiriman === 2) {
            return {
                icon: '✅',
                title: 'Siap Finalisasi',
                description: 'Tidak ada Special CMG Options. Siap untuk finalisasi atau groupper ulang.',
                color: 'bg-green-100 border-green-400',
                textColor: 'text-green-800'
            };
        }
        
        if (statusPengiriman === 3) {
            return {
                icon: '🎯',
                title: 'Sudah Final',
                description: 'Klaim telah difinalisasi.',
                color: 'bg-gray-100 border-gray-400',
                textColor: 'text-gray-800'
            };
        }
        
        return {
            icon: '⏳',
            title: 'Dalam Proses',
            description: 'Menunggu proses grouping atau tahap selanjutnya.',
            color: 'bg-yellow-100 border-yellow-400',
            textColor: 'text-yellow-800'
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`${statusInfo.color} border rounded-lg p-4 mb-4`}>
            <div className="flex items-start gap-3">
                <div className="text-2xl">{statusInfo.icon}</div>
                <div className="flex-1">
                    <h3 className={`font-bold ${statusInfo.textColor} mb-1`}>
                        {statusInfo.title}
                    </h3>
                    <p className={`text-sm ${statusInfo.textColor} mb-2`}>
                        {statusInfo.description}
                    </p>
                    
                    {/* Status Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className={`px-2 py-1 rounded bg-white border ${statusInfo.textColor}`}>
                            <strong>Status:</strong> {statusPengiriman || 'N/A'}
                        </div>
                        <div className={`px-2 py-1 rounded bg-white border ${statusInfo.textColor}`}>
                            <strong>Special CMG:</strong> {hasSpecialCmgOptions ? 'Ada' : 'Tidak ada'}
                        </div>
                        <div className={`px-2 py-1 rounded bg-white border ${statusInfo.textColor}`}>
                            <strong>Stage 2:</strong> {isStage2Available ? 'Tersedia' : 'Tidak tersedia'}
                        </div>
                    </div>
                    
                    {coderNik && (
                        <div className="mt-2 text-xs">
                            <span className={`px-2 py-1 rounded bg-white border ${statusInfo.textColor}`}>
                                <strong>Coder NIK:</strong> {coderNik}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkflowStatus;