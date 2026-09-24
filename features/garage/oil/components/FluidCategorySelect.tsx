'use client';

import { useState } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { FluidCategory } from '@/types/oil';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';

type CustomCategory = {
    id: string;
    label: string;
};

type Props = {
    category: FluidCategory | string;
    setCategory: (value: FluidCategory | string) => void;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    customCategories: CustomCategory[];
    onCreateCategory: (name: string) => string | null;
};

export default function FluidCategorySelect({
                                                category,
                                                setCategory,
                                                isDropdownOpen,
                                                setIsDropdownOpen,
                                                dropdownRef,
                                                customCategories,
                                                onCreateCategory,
                                            }: Props) {
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const currentOption = FLUID_CATEGORY_OPTIONS.find(
        (o) => o.value === category
    );

    const currentCustomCategory = customCategories.find(
        (c) => c.id === category
    );

    const displayLabel =
        currentOption?.label ||
        currentCustomCategory?.label ||
        'Выберите категорию';

    const handleStartCreating = () => {
        setNewCategoryName('');
        setIsCreatingCategory(true);
    };

    const handleCancelCreating = () => {
        setNewCategoryName('');
        setIsCreatingCategory(false);
    };

    const handleCreate = () => {
        const trimmedName = newCategoryName.trim();

        if (!trimmedName) return;

        const newId = onCreateCategory(trimmedName);

        if (!newId) return;

        setCategory(newId);
        setNewCategoryName('');
        setIsCreatingCategory(false);
        setIsDropdownOpen(false);
    };

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelCreating();
        }
    };

    return (
        <div
            className="flex flex-col gap-1.5 relative"
            ref={dropdownRef}
        >
            <label className="text-xs font-semibold text-[var(--text-accent)]">
                Категория
            </label>

            {/* Кнопка-триггер селекта */}
            <button
                type="button"
                onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setIsCreatingCategory(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border)]/20 text-[var(--text)] text-sm font-medium outline-none transition-all duration-150 cursor-pointer text-left hover:border-[var(--link)]/50 focus:border-[var(--link)] ${
                    isDropdownOpen
                        ? 'rounded-t-xl rounded-b-none border-b-transparent'
                        : 'rounded-xl'
                }`}
            >
                <span className="truncate">{displayLabel}</span>

                <ChevronDown
                    size={16}
                    className={`text-[var(--text-dim)] transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {/* Выпадающее меню */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 max-h-72 overflow-y-auto bg-[var(--bg-elevated)] border border-[var(--border)]/20 border-t-0 rounded-b-2xl shadow-xl p-1.5 space-y-0.5 scrollbar-none animate-in fade-in slide-in-from-top-0.5 duration-100">

                    {!isCreatingCategory ? (
                        <>
                            {/* Системные категории */}
                            {FLUID_CATEGORY_OPTIONS.map((option) => {
                                const isSelected = option.value === category;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setCategory(option.value);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 text-left cursor-pointer ${
                                            isSelected
                                                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] font-bold'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)]'
                                        }`}
                                    >
                                        <span className="truncate">
                                            {option.label}
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

                            {/* Кастомные категории */}
                            {customCategories.length > 0 && (
                                <>
                                    <div className="my-1.5 border-t border-[var(--border)]/10" />

                                    {customCategories.map((custom) => {
                                        const isSelected =
                                            custom.id === category;

                                        return (
                                            <button
                                                key={custom.id}
                                                type="button"
                                                onClick={() => {
                                                    setCategory(custom.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 text-left cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] font-bold'
                                                        : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)]'
                                                }`}
                                            >
                                                <span className="truncate">
                                                    ★ {custom.label}
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
                                </>
                            )}

                            {/* Создание новой категории */}
                            <div className="my-1.5 border-t border-[var(--border)]/10" />

                            <button
                                type="button"
                                onClick={handleStartCreating}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--link)] hover:bg-[var(--card)] transition-colors duration-150 text-left cursor-pointer"
                            >
                                <Plus
                                    size={16}
                                    className="shrink-0"
                                />

                                <span>Создать категорию</span>
                            </button>
                        </>
                    ) : (
                        /* Форма создания категории */
                        <div className="p-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[var(--text)]">
                                    Новая категория
                                </span>

                                <button
                                    type="button"
                                    onClick={handleCancelCreating}
                                    className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--card)] transition cursor-pointer"
                                    aria-label="Отмена"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                onKeyDown={handleInputKeyDown}
                                placeholder="Например: Омывайка"
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]/20 text-[var(--text)] text-sm outline-none focus:border-[var(--link)] transition placeholder-[var(--text-dim)]/50"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleCancelCreating}
                                    className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--card)] text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text)] transition cursor-pointer"
                                >
                                    Отмена
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={!newCategoryName.trim()}
                                    className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--btn-primary)] text-[var(--btn-primary-text)] text-sm font-bold hover:bg-[var(--btn-primary-hover)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                                >
                                    Создать
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}