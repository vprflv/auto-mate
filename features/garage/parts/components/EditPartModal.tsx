'use client';

import { Package } from 'lucide-react';
import { CarPartItem } from '@/types';

import { useEditPartModal } from '@/features/garage/parts/hooks/useEditPartModal';
import PartCategorySelect from '@/features/garage/parts/components/PartCategorySelect';
import PartSubcategorySelect from '@/features/garage/parts/components/PartSubcategorySelect';

type Props = {
    item: CarPartItem | null;
    open: boolean;
    onClose: () => void;
    onSave: (item: CarPartItem) => void;
    onDelete?: (id: string) => void;
};

export default function EditPartModal({
                                          item,
                                          open,
                                          onClose,
                                          onSave,
                                          onDelete,
                                      }: Props) {
    const {
        form,
        set,
        newSubOpen,
        setNewSubOpen,
        openDropdown,
        dropdownRef,
        handleSave,
        handlePhotoChange,
        removePhoto,
        closeDropdown,
        toggleDropdown,
    } = useEditPartModal({
        item,
        onSave,
        onClose,
    });

    if (!open || !form) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl border border-[var(--border)]/30 bg-[var(--card)] p-5 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:rounded-3xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                        Редактировать
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]"
                    >
                        Закрыть
                    </button>
                </div>

                {/* Фото */}
                <div>
                    <label className="mb-2 block text-xs text-[var(--text-muted)]">
                        Фото
                    </label>

                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                            {form.photo ? (
                                <img
                                    src={form.photo}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Package
                                    className="h-8 w-8 text-[var(--text-dim)]"
                                    strokeWidth={1.5}
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer text-sm text-[var(--link)] transition hover:text-[var(--btn-primary-hover)]">
                                {form.photo
                                    ? 'Заменить фото'
                                    : 'Добавить фото'}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0];

                                        if (!file) return;

                                        handlePhotoChange(file);
                                    }}
                                />
                            </label>

                            {form.photo && (
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="text-left text-sm text-[var(--danger)] transition hover:opacity-80"
                                >
                                    Удалить фото
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Категория / подраздел */}
                <div
                    className="grid grid-cols-2 gap-3"
                    ref={dropdownRef}
                >
                    <PartCategorySelect
                        category={form.category}
                        open={openDropdown === 'category'}
                        onToggle={() =>
                            toggleDropdown('category')
                        }
                        onClose={closeDropdown}
                        onChange={set}
                    />

                    <PartSubcategorySelect
                        category={form.category}
                        subcategory={form.subcategory}
                        open={
                            openDropdown === 'subcategory'
                        }
                        newSubOpen={newSubOpen}
                        onToggle={() =>
                            toggleDropdown('subcategory')
                        }
                        onClose={closeDropdown}
                        onChange={set}
                        onNewSubOpen={setNewSubOpen}
                    />
                </div>

                {/* Название */}
                <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">
                        Название *
                    </label>

                    <input
                        value={form.name}
                        onChange={(e) =>
                            set({ name: e.target.value })
                        }
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                    />
                </div>

                {/* Бренд / количество */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">
                            Бренд
                        </label>

                        <input
                            value={form.brand || ''}
                            onChange={(e) =>
                                set({
                                    brand: e.target.value,
                                })
                            }
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">
                            Кол-во
                        </label>

                        <input
                            type="number"
                            min={1}
                            value={form.quantity ?? 1}
                            onChange={(e) =>
                                set({
                                    quantity:
                                        Number(
                                            e.target.value
                                        ) || 1,
                                })
                            }
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                        />
                    </div>
                </div>

                {/* OEM / аналог */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">
                            Ориг. номер
                        </label>

                        <input
                            value={form.oemNumber || ''}
                            onChange={(e) =>
                                set({
                                    oemNumber:
                                    e.target.value,
                                })
                            }
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">
                            Аналог
                        </label>

                        <input
                            value={form.analogNumber || ''}
                            onChange={(e) =>
                                set({
                                    analogNumber:
                                    e.target.value,
                                })
                            }
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                        />
                    </div>
                </div>

                {/* Заметка */}
                <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">
                        Заметка
                    </label>

                    <input
                        value={form.notes || ''}
                        onChange={(e) =>
                            set({
                                notes: e.target.value,
                            })
                        }
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                    />
                </div>

                {/* Кнопки */}
                <div className="flex gap-3 pt-2">
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                onDelete(form.id);
                                onClose();
                            }}
                            className="rounded-2xl border border-[var(--danger)]/40 px-4 py-3 text-sm text-[var(--danger)] transition hover:bg-[var(--danger)]/10 active:scale-[0.98]"
                        >
                            Удалить
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] py-3 text-sm text-[var(--text-muted)] transition hover:text-[var(--text)] active:scale-[0.98]"
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 rounded-2xl bg-[var(--btn-primary)] py-3 text-sm text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] active:scale-[0.98]"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}