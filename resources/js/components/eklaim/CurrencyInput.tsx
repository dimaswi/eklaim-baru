import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    showFormatted?: boolean;
}

// Helper function untuk format rupiah tanpa trailing zeros
const formatRupiah = (amount: string | number) => {
    if (!amount || amount === '' || amount === '0') return 'Rp 0';
    
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
    if (isNaN(num)) return 'Rp 0';
    
    // Format dengan pemisah ribuan, tanpa desimal jika nilai bulat
    const formatted = num % 1 === 0 
        ? num.toLocaleString('id-ID')
        : num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    
    return `Rp ${formatted}`;
};

// Helper function untuk parse input rupiah kembali ke angka
const parseRupiah = (rupiahString: string): string => {
    if (!rupiahString) return '';
    // Hapus semua karakter selain angka, titik, dan tanda minus
    const cleaned = rupiahString.replace(/[^\d.-]/g, '');
    return cleaned;
};

export default function CurrencyInput({ 
    label, 
    value, 
    onChange, 
    placeholder = "0",
    showFormatted = true 
}: CurrencyInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (!isEditing) {
            setDisplayValue(value ? value.toString() : '');
        }
    }, [value, isEditing]);

    const handleFocus = () => {
        setIsEditing(true);
        setDisplayValue(value ? value.toString() : '');
    };

    const handleBlur = () => {
        setIsEditing(false);
        const parsedValue = parseRupiah(displayValue);
        onChange(parsedValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(e.target.value);
    };

    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={isEditing ? displayValue : (showFormatted && value ? formatRupiah(value) : value || '')}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
        </div>
    );
}