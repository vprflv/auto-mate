'use client';

import { Check, ChevronDown } from 'lucide-react';
import { CarPartItem, PartCategory } from '@/types';
import { getCategoriesFor, getCategoryLabel } from '@/features/garage/lib/getCategories';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';

type Props = {
    carId: string;
    category: CarPartItem['category'];
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
    onChange: (patch: Partial<CarPartItem>) => void;
};

export default function PartCategorySelect({
                                               carId,
                                               category,
                                               open,
                                               onToggle,
                                               onClose,
                                               onChange,
                                           }: Props) {
    return (
        <div className="relative">
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
                Категория
            </label>

            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-sm text-[var(--text)] outline-none transition-all duration-150 text-left cursor-pointer hover:border-[var(--link)]/50 focus:border-[var(--link)] ${
                    open
                        ? 'rounded-b-none border-b-transparent'
                        : ''
                }`}
            >
                <span className="truncate">
                    {getCategoryLabel(category, carId)}
                </span>

                <ChevronDown
                    size={16}
                    className={`shrink-0 text-[var(--text-dim)] transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 z-50 max-h-72 overflow-y-auto bg-[var(--bg-elevated)] border border-[var(--dropdown-border)] border-t-0 rounded-b-2xl shadow-xl p-1.5 space-y-0.5 scrollbar-none animate-in fade-in slide-in-from-top-0.5 duration-100">
                    {getCategoriesFor(carId).map(({ id, label }) => {
                        const nextCategory = id as PartCategory;
                        const isSelected =
                            nextCategory === category;

                        return (
                            <button
                                key={nextCategory}
                                type="button"
                                onClick={() => {
                                    const firstSub =
                                        getSubcategoriesFor(
                                            nextCategory
                                        )[0]?.id || 'other';

                                    onChange({
                                        category:
                                            nextCategory as PartCategory,
                                        subcategory: firstSub,
                                    });

                                    onClose();
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 text-left cursor-pointer ${
                                    isSelected
                                        ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] font-bold'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)]'
                                }`}
                            >
                                <span className="truncate">
                                    {label}
                                </span>

                                {isSelected && (
                                    <Check
                                        size={14}
                                        className="shrink-0"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
