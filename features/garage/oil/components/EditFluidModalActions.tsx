'use client';

import { Loader2, Trash2 } from 'lucide-react';

type Props = {
    isEditing: boolean;
    canDelete: boolean;
    isProcessingPhoto: boolean;
    onDelete: () => void;
    onClose: () => void;
};

export default function EditFluidModalActions({
                                                  isEditing,
                                                  canDelete,
                                                  isProcessingPhoto,
                                                  onDelete,
                                                  onClose,
                                              }: Props) {
    const showDelete = isEditing && canDelete;

    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {showDelete ? (
                <button
                    type="button"
                    disabled={isProcessingPhoto}
                    onClick={onDelete}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Trash2
                        size={17}
                        aria-hidden="true"
                    />

                    Удалить
                </button>
            ) : (
                <div aria-hidden="true" />
            )}

            <div className="ml-auto flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="min-h-11 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                >
                    Отмена
                </button>

                <button
                    type="submit"
                    form="edit-fluid-form"
                    disabled={isProcessingPhoto}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--btn-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isProcessingPhoto && (
                        <Loader2
                            size={17}
                            className="animate-spin"
                            aria-hidden="true"
                        />
                    )}

                    {isProcessingPhoto
                        ? 'Обработка фото…'
                        : 'Сохранить'}
                </button>
            </div>
        </div>
    );
}