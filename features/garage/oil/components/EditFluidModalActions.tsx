import { Trash2 } from 'lucide-react';

type EditFluidModalActionsProps = {
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
                                              }: EditFluidModalActionsProps) {
    return (
        <div className="flex w-full items-center justify-between gap-3">
            {isEditing && canDelete ? (
                <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/10 active:scale-[0.98]"
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
                    className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] active:scale-[0.98]"
                >
                    Отмена
                </button>

                <button
                    type="submit"
                    form="edit-fluid-form"
                    disabled={isProcessingPhoto}
                    className="rounded-xl bg-[var(--btn-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
}