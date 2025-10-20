import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onSelect: (value: string, label: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ada data ditemukan",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.sublabel?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (option: Option) => {
    onSelect(option.value, option.label);
    setShowOptions(false);
    setSearchValue("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (!showOptions) {
      setShowOptions(true);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setShowOptions(false);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setShowOptions(!showOptions);
  };

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      {/* Button trigger */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          !value ? 'text-gray-500' : 'text-gray-900'
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown options */}
      {showOptions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search input */}
          <div className="flex items-center border-b border-gray-200 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-sm p-0"
              autoFocus
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-[200px] overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionSelect(option)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                    value === option.value ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.sublabel && (
                      <span className="text-sm text-gray-500">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
