import React, { useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandInput } from '@/components/ui/command';

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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.sublabel?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredOptions[highlightedIndex];
      if (selected) {
        onSelect(selected.value, selected.label);
        setOpen(false);
        setSearchValue("");
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-white shadow-lg border rounded-md"
        style={{ zIndex: 999999 }}
        onKeyDown={handleKeyDown}
      >
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <CommandEmpty className="py-6 text-center text-sm">
            {emptyText}
          </CommandEmpty>

          <CommandGroup className="max-h-[200px] overflow-auto">
            {filteredOptions.map((option, idx) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onSelect(option.value, option.label);
                  setOpen(false);
                  setSearchValue("");
                }}
                className={cn(
                  "cursor-pointer",
                  idx === highlightedIndex && "bg-blue-100"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-sm text-muted-foreground">
                      {option.sublabel}
                    </span>
                  )}
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
