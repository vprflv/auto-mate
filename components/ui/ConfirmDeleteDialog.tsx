'use client';

import { useState, type ReactElement } from 'react';
import { AlertDialog } from 'radix-ui';
import { Trash2 } from 'lucide-react';

interface Props {
    title: string;
    description: string;
    children: ReactElement;

    // true — удаление выполнено, окно можно закрыть.
    onConfirm: () => boolean;
}

export function ConfirmDeleteDialog({
                                        title,
                                        description,
                                        children,
                                        onConfirm
                                    }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <AlertDialog.Root
            open={open}
            onOpenChange={setOpen}
        >
            <AlertDialog.Trigger asChild>
                {children}
            </AlertDialog.Trigger>

            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm" />

                <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[301] max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl focus:outline-none">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500">
                        <Trash2 className="h-6 w-6" />
                    </div>

                    <AlertDialog.Title className="break-words text-lg font-bold text-[var(--text)]">
                        {title}
                    </AlertDialog.Title>

                    <AlertDialog.Description className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-[var(--text-muted)]">
                        {description}
                    </AlertDialog.Description>

                    <div className="mt-6 flex gap-3">
                        <AlertDialog.Cancel
                            type="button"
                            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)]"
                        >
                            Отмена
                        </AlertDialog.Cancel>

                        <AlertDialog.Action
                            type="button"
                            onClick={event => {
                                // При ошибке удаления оставляем окно открытым.
                                event.preventDefault();

                                if (onConfirm()) {
                                    setOpen(false);
                                }
                            }}
                            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                        >
                            Удалить
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}