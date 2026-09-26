'use client';

import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

type Props = {
    open: boolean;
    categoryName: string;
    itemCount: number;
    subcategoryCount?: number;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ConfirmDeleteCategoryModal({
                                                       open,
                                                       categoryName,
                                                       itemCount,
                                                       subcategoryCount = 0,
                                                       onClose,
                                                       onConfirm,
                                                   }: Props) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    const subcategoryLabel =
        subcategoryCount === 1
            ? 'подкатегория'
            : subcategoryCount >= 2 && subcategoryCount <= 4
                ? 'подкатегории'
                : 'подкатегорий';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--danger)]/10 text-[var(--danger)]">
                        <Trash2 size={19} />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[var(--text)]">
                            Удалить категорию «{categoryName}»?
                        </h3>

                        <p className="mt-1.5 text-sm leading-5 text-[var(--text-muted)]">
                            Все элементы внутри категории будут удалены вместе с ней.
                            Если хочешь сохранить детали, сначала перенеси их в другую категорию.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-muted)]">
                    <div>
                        Будет удалено:{' '}
                        <span className="font-semibold text-[var(--text)]">
                            {itemCount} позиций
                        </span>
                    </div>

                    {subcategoryCount > 0 && (
                        <div className="mt-1">
                            А также:{' '}
                            <span className="font-semibold text-[var(--text)]">
                                {subcategoryCount} {subcategoryLabel}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-[var(--bg-elevated)] py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text)] active:scale-[0.98]"
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-[var(--danger)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}