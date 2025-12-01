import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimeInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

/**
 * DateTimeInput component with dd/mm/yyyy hh:mm:ss format display
 * Internally converts to/from ISO format for form handling
 */
export function DateTimeInput({ 
    value, 
    onChange, 
    disabled = false, 
    className = '',
    placeholder = 'dd/mm/yyyy hh:mm:ss'
}: DateTimeInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Convert ISO/database format to display format (dd/mm/yyyy hh:mm:ss)
    const isoToDisplay = (isoValue: string): string => {
        if (!isoValue) return '';
        
        try {
            // Handle multiple formats:
            // - yyyy-mm-dd hh:mm:ss (database format)
            // - yyyy-mm-ddThh:mm:ss (ISO format)
            // - yyyy-mm-ddThh:mm:ssZ (ISO with Z)
            
            // First try to parse as simple string without Date object to avoid timezone conversion
            let year, month, day, hours, minutes, seconds;
            
            // Match yyyy-mm-dd hh:mm:ss or yyyy-mm-ddThh:mm:ss
            const regex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
            const match = isoValue.match(regex);
            
            if (match) {
                [, year, month, day, hours, minutes, seconds] = match;
                return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            }
            
            // Try yyyy-mm-ddThh:mm format (without seconds)
            const regexNoSec = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})$/;
            const matchNoSec = isoValue.match(regexNoSec);
            
            if (matchNoSec) {
                [, year, month, day, hours, minutes] = matchNoSec;
                return `${day}/${month}/${year} ${hours}:${minutes}:00`;
            }
            
            // Fallback: try Date object (may have timezone issues)
            const date = new Date(isoValue);
            if (isNaN(date.getTime())) return '';
            
            day = String(date.getDate()).padStart(2, '0');
            month = String(date.getMonth() + 1).padStart(2, '0');
            year = String(date.getFullYear());
            hours = String(date.getHours()).padStart(2, '0');
            minutes = String(date.getMinutes()).padStart(2, '0');
            seconds = String(date.getSeconds()).padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        } catch {
            return '';
        }
    };

    // Convert display format (dd/mm/yyyy hh:mm:ss) to database format (yyyy-mm-dd hh:mm:ss)
    const displayToIso = (displayVal: string): string => {
        if (!displayVal) return '';
        
        // Match dd/mm/yyyy hh:mm:ss or dd/mm/yyyy hh:mm
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/;
        const match = displayVal.match(regex);
        
        if (!match) return '';
        
        const [, day, month, year, hours, minutes, seconds = '00'] = match;
        
        // Validate date components
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const hoursNum = parseInt(hours);
        const minutesNum = parseInt(minutes);
        const secondsNum = parseInt(seconds);
        
        if (dayNum < 1 || dayNum > 31) return '';
        if (monthNum < 1 || monthNum > 12) return '';
        if (yearNum < 1900 || yearNum > 2100) return '';
        if (hoursNum < 0 || hoursNum > 23) return '';
        if (minutesNum < 0 || minutesNum > 59) return '';
        if (secondsNum < 0 || secondsNum > 59) return '';
        
        // Return database format without T separator
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Auto-format input as user types
    const formatInput = (input: string): string => {
        // Remove all non-numeric characters except / : and space
        let cleaned = input.replace(/[^\d\/:\s]/g, '');
        
        // Auto-add separators
        const digits = cleaned.replace(/[^\d]/g, '');
        let formatted = '';
        
        for (let i = 0; i < digits.length && i < 14; i++) {
            if (i === 2 || i === 4) formatted += '/';
            if (i === 8) formatted += ' ';
            if (i === 10 || i === 12) formatted += ':';
            formatted += digits[i];
        }
        
        return formatted;
    };

    // Update display value when prop value changes
    useEffect(() => {
        if (!isEditing) {
            setDisplayValue(isoToDisplay(value));
        }
    }, [value, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatInput(e.target.value);
        setDisplayValue(formatted);
        
        // If complete format, convert and update parent
        if (formatted.length >= 17) { // dd/mm/yyyy hh:mm (at least)
            const isoValue = displayToIso(formatted);
            if (isoValue) {
                onChange(isoValue);
            }
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        
        // On blur, try to parse and update
        const isoValue = displayToIso(displayValue);
        if (isoValue) {
            onChange(isoValue);
            setDisplayValue(isoToDisplay(isoValue));
        } else if (displayValue && displayValue.length > 0) {
            // Invalid input, reset to original value
            setDisplayValue(isoToDisplay(value));
        }
    };

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleNativePickerClick = () => {
        if (disabled) return;
        
        // Create a temporary native datetime-local input
        const tempInput = document.createElement('input');
        tempInput.type = 'datetime-local';
        tempInput.style.position = 'absolute';
        tempInput.style.opacity = '0';
        tempInput.style.pointerEvents = 'none';
        
        if (value) {
            // Convert to datetime-local format (yyyy-mm-ddThh:mm)
            // Handle both "yyyy-mm-dd hh:mm:ss" and "yyyy-mm-ddThh:mm:ss" formats
            const normalized = value.replace(' ', 'T').slice(0, 16);
            tempInput.value = normalized;
        }
        
        document.body.appendChild(tempInput);
        
        tempInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.value) {
                // Convert back to database format (yyyy-mm-dd hh:mm:ss)
                const dbFormat = target.value.replace('T', ' ') + ':00';
                onChange(dbFormat);
            }
            document.body.removeChild(tempInput);
        });
        
        tempInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (document.body.contains(tempInput)) {
                    document.body.removeChild(tempInput);
                }
            }, 100);
        });
        
        tempInput.showPicker?.();
        tempInput.click();
    };

    const baseClasses = 'w-full rounded-md border px-3 py-2 text-sm focus:outline-none pr-10';
    const enabledClasses = 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
    const disabledClasses = 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed';

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                disabled={disabled}
                placeholder={placeholder}
                className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${className}`}
            />
            <button
                type="button"
                onClick={handleNativePickerClick}
                disabled={disabled}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${
                    disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Pilih tanggal dan waktu"
            >
                <Calendar className="h-4 w-4" />
            </button>
        </div>
    );
}
