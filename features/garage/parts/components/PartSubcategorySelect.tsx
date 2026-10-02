'use client';

import { Check, ChevronDown } from 'lucide-react';
import { CarPartItem } from '@/types';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { addUserSubcategory } from '@/features/garage/lib/userSubcategories';
import NamePromptModal from '@/features/garage/parts/components/NamePromptModal';

type Props = {
    category: CarPartItem['category'];
    subcategory?: CarPartItem['subcategory'];
    open: boolean;
    newSubOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onChange: (patch: Partial<CarPartItem>) => void;
    onNewSubOpen: (open: boolean) => void;
};

export default function PartSubcategorySelect({
                                                  category,
                                                  subcategory,
                                                  open,
                                                  newSubOpen,
                                                  onToggle,
                                                  onClose,
                                                  onChange,
                                                  onNewSubOpen,
                                              }: Props) {
    const subs = getSubcategoriesFor(category);

    const selectedSub = subs.find(
        (sub) => sub.id === (subcategory || 'other')
    );

    return (
        <>
            <div className="relative">
                <label className="mb-1 block text-xs text-[var(--text-muted)]">
                    Подраздел
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
                        {selectedSub?.label ||
                            'Выберите подраздел'}
                        {selectedSub?.isCustom ? ' ★' : ''}
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
                        {subs.map((sub) => {
                            const isSelected =
                                sub.id ===
                                (subcategory || 'other');

                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                        onChange({
                                            subcategory: sub.id,
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
                                        {sub.label}
                                        {sub.isCustom
                                            ? ' ★'
                                            : ''}
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

                        <div className="my-1.5 border-t border-[var(--border)]/10" />

                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onNewSubOpen(true);
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--link)] hover:bg-[var(--card)] transition-colors duration-150 text-left cursor-pointer"
                        >
                            + Создать свою...
                        </button>
                    </div>
                )}
            </div>

            <NamePromptModal
                open={newSubOpen}
                title="Новая подкатегория"
                placeholder="Колодки, диски…"
                onClose={() => onNewSubOpen(false)}
                onSubmit={(name) => {
                    const created = addUserSubcategory(
                        category,
                        name
                    );

                    onChange({
                        subcategory: created.key,
                    });

                    onNewSubOpen(false);
                }}
            />
        </>
    );
}