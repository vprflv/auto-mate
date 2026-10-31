'use client';

import { useEffect, useId, useRef } from 'react';
import { Trash2 } from 'lucide-react';

type Props = {
    open: boolean;
    name: string;
    itemCount: number;
    error?: string;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ConfirmDeleteSubcategoryModal({
                                                          open,
                                                          name,
                                                          itemCount,
                                                          error,
                                                          onClose,
                                                          onConfirm,
                                                      }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const titleId = useId();
    const descriptionId = useId();

    const canDelete = itemCount === 0;

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            style={{
                width: 'calc(100% - 2rem)',
            }}
            className="fixed inset-0 m-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--text)] shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        >
            <div className="mb-4 flex items-center gap-3">
                <Trash2
                    size={22}
                    className="shrink-0 text-[var(--danger)]"
                    aria-hidden="true"
                />

                <h3
                    id={titleId}
                    className="text-lg font-semibold"
                >
                    Удалить подкатегорию «{name}»?
                </h3>
            </div>

            <p
                id={descriptionId}
                className="text-sm leading-relaxed text-[var(--text-muted)]"
            >
                {canDelete
                    ? 'Пустая подкатегория исчезнет из каталога этого автомобиля. При необходимости её можно добавить заново по названию. Другие автомобили сохранят свои подкатегории.'
                    : 'Сначала перенесите детали в другую подкатегорию или удалите их по отдельности. Непустую подкатегорию удалить нельзя.'}
            </p>

            <p className="mt-4 rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-sm">
                Позиций внутри: <strong>{itemCount}</strong>
            </p>

            {error && (
                <p
                    role="alert"
                    className="mt-3 text-sm text-[var(--danger)]"
                >
                    {error}
                </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-sm font-medium"
                >
                    Отмена
                </button>

                <button
                    type="button"
                    disabled={!canDelete}
                    onClick={onConfirm}
                    className="flex-1 rounded-xl bg-[var(--danger)] px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Удалить
                </button>
            </div>
        </dialog>
    );
}