import React, { useEffect } from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DateTimeInput } from '@/components/ui/datetime-input';

interface Props {
    formData: { [key: string]: any };
    updateField: (field: string, value: any) => void;
    getNestedValue: (parent: string, field: string) => string;
    updateNestedField: (parent: string, field: string, value: any) => void;
}

export default function VentilatorTab({ formData, updateField, getNestedValue, updateNestedField }: Props) {
    // Function to calculate hours between two datetime strings
    const calculateVentilatorHours = (startDateTime: string, stopDateTime: string): number => {
        if (!startDateTime || !stopDateTime) return 0;
        
        const startDate = new Date(startDateTime);
        const stopDate = new Date(stopDateTime);
        
        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(stopDate.getTime())) return 0;
        
        // Calculate difference in milliseconds, then convert to hours
        const diffInMs = stopDate.getTime() - startDate.getTime();
        const diffInHours = Math.round(diffInMs / (1000 * 60 * 60)); // Round to nearest hour
        
        return diffInHours > 0 ? diffInHours : 0; // Return 0 if negative (stop before start)
    };

    // Handle ventilator status change and clear related fields if disabled
    const handleVentilatorStatusChange = (value: string) => {
        updateNestedField('ventilator', 'use_ind', value);
        
        // If ventilator is set to "0" (Tidak Menggunakan), clear all related fields
        if (value === '0') {
            updateNestedField('ventilator', 'start_dttm', '');
            updateNestedField('ventilator', 'stop_dttm', '');
            updateField('ventilator_hour', '');
        }
    };

    // Auto-calculate ventilator hours when start or stop datetime changes
    useEffect(() => {
        const startDateTime = getNestedValue('ventilator', 'start_dttm');
        const stopDateTime = getNestedValue('ventilator', 'stop_dttm');
        
        if (startDateTime && stopDateTime) {
            const calculatedHours = calculateVentilatorHours(startDateTime, stopDateTime);
            
            // Only update if the calculated value is different from current value
            const currentHours = parseInt(formData.ventilator_hour || '0');
            if (calculatedHours !== currentHours) {
                updateField('ventilator_hour', calculatedHours.toString());
            }
        }
    }, [getNestedValue('ventilator', 'start_dttm'), getNestedValue('ventilator', 'stop_dttm')]);

    // Handle start datetime change
    const handleStartDateTimeChange = (value: string) => {
        updateNestedField('ventilator', 'start_dttm', value);
        
        // If stop datetime exists, calculate hours immediately
        const stopDateTime = getNestedValue('ventilator', 'stop_dttm');
        if (stopDateTime && value) {
            const calculatedHours = calculateVentilatorHours(value, stopDateTime);
            updateField('ventilator_hour', calculatedHours.toString());
        }
    };

    // Handle stop datetime change
    const handleStopDateTimeChange = (value: string) => {
        updateNestedField('ventilator', 'stop_dttm', value);
        
        // If start datetime exists, calculate hours immediately
        const startDateTime = getNestedValue('ventilator', 'start_dttm');
        if (startDateTime && value) {
            const calculatedHours = calculateVentilatorHours(startDateTime, value);
            updateField('ventilator_hour', calculatedHours.toString());
        }
    };
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Ventilator</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Status Ventilator
                    </label>
                    <SearchableSelect
                        options={[
                            { value: '0', label: 'Tidak Menggunakan' },
                            { value: '1', label: 'Menggunakan' },
                        ]}
                        value={getNestedValue('ventilator', 'use_ind') || '0'}
                        onSelect={handleVentilatorStatusChange}
                        placeholder="Pilih status ventilator..."
                        searchPlaceholder="Cari status ventilator..."
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Tanggal Mulai Ventilator
                    </label>
                    <DateTimeInput
                        value={getNestedValue('ventilator', 'start_dttm') || ''}
                        onChange={(value) => handleStartDateTimeChange(value)}
                        disabled={getNestedValue('ventilator', 'use_ind') === '0'}
                        placeholder="dd/mm/yyyy hh:mm:ss"
                    />
                    {getNestedValue('ventilator', 'use_ind') === '0' && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena ventilator tidak digunakan</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Tanggal Selesai Ventilator
                    </label>
                    <DateTimeInput
                        value={getNestedValue('ventilator', 'stop_dttm') || ''}
                        onChange={(value) => handleStopDateTimeChange(value)}
                        disabled={getNestedValue('ventilator', 'use_ind') === '0'}
                        placeholder="dd/mm/yyyy hh:mm:ss"
                    />
                    {getNestedValue('ventilator', 'use_ind') === '0' && (
                        <p className="mt-1 text-xs text-gray-500">Field ini tidak aktif karena ventilator tidak digunakan</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Total Jam Ventilator (Otomatis)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            value={formData.ventilator_hour || '0'}
                            readOnly
                            placeholder="Akan dihitung otomatis"
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                                getNestedValue('ventilator', 'use_ind') === '0' 
                                    ? 'border-gray-200 bg-gray-50 text-gray-400' 
                                    : 'border-gray-300 bg-gray-50 text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                            }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-sm text-gray-500">jam</span>
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {getNestedValue('ventilator', 'use_ind') === '0' 
                            ? 'Field ini tidak aktif karena ventilator tidak digunakan'
                            : 'Dihitung otomatis berdasarkan tanggal mulai dan selesai'
                        }
                    </p>
                </div>
            </div>
            
            {/* Informational note */}
            {getNestedValue('ventilator', 'start_dttm') && getNestedValue('ventilator', 'stop_dttm') && (
                <div className="mt-4 rounded-md bg-blue-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Perhitungan Otomatis</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Durasi ventilator dihitung otomatis: {formData.ventilator_hour || 0} jam
                                    {parseInt(formData.ventilator_hour || '0') > 24 && (
                                        <span className="ml-2 text-xs">
                                            (≈ {Math.round((parseInt(formData.ventilator_hour || '0') / 24) * 10) / 10} hari)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}