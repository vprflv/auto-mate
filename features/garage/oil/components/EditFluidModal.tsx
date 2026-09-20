'use client';

import { X, Trash2, ChevronDown, Check } from 'lucide-react';
import { useEditFluidModal } from '../hooks/useEditFluidModal';
import { CarFluidItem } from '@/types/oil';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import FluidCategorySelect from "@/features/garage/oil/components/FluidCategorySelect";

type Props = {
    open: boolean;
    item: CarFluidItem | null;
    onClose: () => void;
    onSave: (item: CarFluidItem) => void;
    onDelete: (id: string) => void;
};

export default function EditFluidModal({ open, item, onClose, onSave, onDelete }: Props) {
    // Внедряем наш кастомный хук, освобождая компонент от стейтов и эффектов
    const {
        name,
        setName,
        brand,
        setBrand,
        spec,
        setSpec,
        volume,
        setVolume,
        category,
        setCategory,
        isDropdownOpen,
        setIsDropdownOpen,
        dropdownRef,
        handleSubmit,
    } = useEditFluidModal({ open, item, onClose, onSave });

    if (!open) return null;

    const currentOption = FLUID_CATEGORY_OPTIONS.find(o => o.value === category);
    const displayLabel = currentOption ? currentOption.label : 'Кастомная категория';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-all duration-200">
                <div className="p-6">
                    {/* Шапка модального окна */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-[var(--text)]">
                            {item ? 'Редактировать' : 'Добавить жидкость'}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[var(--text-dim)] hover:text-[var(--text)] transition cursor-pointer p-1 rounded-xl hover:bg-[var(--bg-elevated)]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Категория с идеальным бесшовным выпадающим списком */}
                        <FluidCategorySelect
                            category={category}
                            setCategory={setCategory}
                            isDropdownOpen={isDropdownOpen}
                            setIsDropdownOpen={setIsDropdownOpen}
                            dropdownRef={dropdownRef}
                        />
                        {/* Название */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[var(--text-accent)]">Название *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Например: Масло моторное"
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]/20 text-[var(--text)] text-sm outline-none focus:border-[var(--link)] transition placeholder-[var(--text-dim)]/40"
                            />
                        </div>

                        {/* Бренд */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[var(--text-accent)]">Производитель / Бренд</label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="Например: Mobil 1"
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]/20 text-[var(--text)] text-sm outline-none focus:border-[var(--link)] transition placeholder-[var(--text-dim)]/40"
                            />
                        </div>

                        {/* Спецификация */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[var(--text-accent)]">Спецификация / Вязкость</label>
                            <input
                                type="text"
                                value={spec}
                                onChange={(e) => setSpec(e.target.value)}
                                placeholder="Например: 5W-30 ACEA A5"
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]/20 text-[var(--text)] text-sm outline-none focus:border-[var(--link)] transition placeholder-[var(--text-dim)]/40"
                            />
                        </div>

                        {/* Объем */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[var(--text-accent)]">Объём / Кол-во</label>
                            <input
                                type="text"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value)}
                                placeholder="Например: 4 л"
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]/20 text-[var(--text)] text-sm outline-none focus:border-[var(--link)] transition placeholder-[var(--text-dim)]/40"
                            />
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex items-center justify-between gap-3 pt-4 mt-6 border-t border-[var(--border)]/10">
                            {item ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onDelete(item.id);
                                        onClose();
                                    }}
                                    className="p-3 rounded-xl bg-[var(--danger)] text-white hover:opacity-90 transition cursor-pointer active:scale-95"
                                    title="Удалить"
                                >
                                    <Trash2 size={18} />
                                </button>
                            ) : (
                                <div />
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-3 rounded-xl text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)]/30 hover:bg-[var(--border)]/20 transition cursor-pointer active:scale-95"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-3 rounded-xl text-sm font-bold bg-[var(--btn-primary)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] transition cursor-pointer active:scale-95 [html[data-theme=dark]_&]:shadow-[0_0_12px_rgba(57,255,20,0.2)]"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
