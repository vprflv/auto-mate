'use client';

import { ChevronDown, Check } from 'lucide-react';
import { FluidCategory } from '@/types/oil';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';

type Props = {
    category: FluidCategory | string;
    setCategory: (value: FluidCategory | string) => void;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
};

export default function FluidCategorySelect({
                                                category,
                                                setCategory,
                                                isDropdownOpen,
                                                setIsDropdownOpen,
                                                dropdownRef,
                                            }: Props) {
    const currentOption = FLUID_CATEGORY_OPTIONS.find((o) => o.value === category);
    const displayLabel = currentOption ? currentOption.label : 'Кастомная категория';

    return (
        <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-semibold text-[var(--text-accent)]">Категория</label>

            {/* Кнопка-триггер селекта */}
            <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border)]/20 text-[var(--text)] text-sm font-medium outline-none transition-all duration-150 cursor-pointer text-left hover:border-[var(--link)]/50 focus:border-[var(--link)] ${
                    isDropdownOpen ? 'rounded-t-xl rounded-b-none border-b-transparent' : 'rounded-xl'
                }`}
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown
                    size={16}
                    className={`text-[var(--text-dim)] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Бесшовное выпадающее меню под инпутом */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 max-h-60 overflow-y-auto bg-[var(--bg-elevated)] border border-[var(--border)]/20 border-t-0 rounded-b-2xl shadow-xl p-1.5 space-y-0.5 scrollbar-none animate-in fade-in slide-in-from-top-0.5 duration-100">
                    {FLUID_CATEGORY_OPTIONS.map((o) => {
                        const isSelected = o.value === category;
                        return (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => {
                                    setCategory(o.value);
                                    setIsDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 text-left cursor-pointer ${
                                    isSelected
                                        ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] font-bold'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)]'
                                }`}
                            >
                                <span className="truncate">{o.label}</span>
                                {isSelected && <Check size={14} className="shrink-0" />}
                            </button>
                        );
                    })}

                    {!currentOption && (
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold bg-[var(--btn-primary)] text-[var(--btn-primary-text)] text-left cursor-pointer"
                        >
                            <span className="truncate">Кастомная категория</span>
                            <Check size={14} className="shrink-0" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
