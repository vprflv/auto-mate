'use client';

import { X, Trash2 } from 'lucide-react';
import { useEditFluidModal } from '../hooks/useEditFluidModal';
import { CarFluidItem } from '@/types/oil';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import FluidCategorySelect from "@/features/garage/oil/components/FluidCategorySelect";


type EditFluidModalProps = {
    open: boolean;
    item: CarFluidItem | null;
    onClose: () => void;
    onSave: (item: CarFluidItem) => void;
    onDelete?: (id: string) => void;

    customCategories: {
        id: string;
        label: string;
    }[];

    onCreateCategory: (name: string) => string | null;
};

export default function EditFluidModal({
                                           open,
                                           item,
                                           onClose,
                                           onSave,
                                           onDelete,
                                           customCategories,
                                           onCreateCategory,
                                       }: EditFluidModalProps) {
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
    } = useEditFluidModal({
        open,
        item,
        onClose,
        onSave,
    });

    if (!open) {
        return null;
    }

    const currentOption = FLUID_CATEGORY_OPTIONS.find(
        (option) => option.value === category
    );

    const displayLabel =
        currentOption?.label ||
        customCategories.find((option) => option.id === category)?.label ||
        'Кастомная категория';

    const handleDelete = () => {
        if (item?.id && onDelete) {
            onDelete(item.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                    <h2 className="text-lg font-semibold text-[var(--text)]">
                        {item ? 'Редактирование жидкости' : 'Новая жидкость'}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                        aria-label="Закрыть"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 p-5"
                >
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="fluid-name"
                            className="text-sm font-medium text-[var(--text-accent)]"
                        >
                            Название
                        </label>

                        <input
                            id="fluid-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например: Моторное масло"
                            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--text)] outline-none transition placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
                        />
                    </div>

                    <FluidCategorySelect
                        category={category}
                        setCategory={setCategory}
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        dropdownRef={dropdownRef}
                        customCategories={customCategories}
                        onCreateCategory={onCreateCategory}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="fluid-brand"
                            className="text-sm font-medium text-[var(--text-accent)]"
                        >
                            Бренд
                        </label>

                        <input
                            id="fluid-brand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder="Например: Motul"
                            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--text)] outline-none transition placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="fluid-spec"
                            className="text-sm font-medium text-[var(--text-accent)]"
                        >
                            Спецификация
                        </label>

                        <input
                            id="fluid-spec"
                            value={spec}
                            onChange={(e) => setSpec(e.target.value)}
                            placeholder="Например: 5W-30, API SP"
                            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--text)] outline-none transition placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="fluid-volume"
                            className="text-sm font-medium text-[var(--text-accent)]"
                        >
                            Объём
                        </label>

                        <input
                            id="fluid-volume"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                            placeholder="Например: 4.5 л"
                            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--text)] outline-none transition placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
                        />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                        {item && onDelete ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
                            >
                                <Trash2 size={17} />
                                Удалить
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                            >
                                Отмена
                            </button>

                            <button
                                type="submit"
                                className="rounded-xl bg-[var(--btn-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] [html[data-theme=dark]_&]:shadow-[0_0_12px_rgba(57,255,20,0.2)]"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}