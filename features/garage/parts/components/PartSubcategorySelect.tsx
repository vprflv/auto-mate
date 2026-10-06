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
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-left text-sm text-[var(--text)] outline-none transition-all duration-150 hover:border-[var(--link)]/50 focus:border-[var(--link)] ${
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
                    <div className="absolute left-0 right-0 top-full z-50 max-h-72 space-y-0.5 overflow-y-auto rounded-b-2xl border border-[var(--dropdown-border)] border-t-0 bg-[var(--bg-elevated)] p-1.5 shadow-xl scrollbar-none animate-in fade-in slide-in-from-top-0.5 duration-100">
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
                                            subcategory:
                                            sub.id,
                                        });
                                        onClose();
                                    }}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${
                                        isSelected
                                            ? 'bg-[var(--btn-primary)] font-bold text-[var(--btn-primary-text)]'
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
                            className="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--link)] transition-colors duration-150 hover:bg-[var(--card)]"
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
                    const created =
                        addUserSubcategory(
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