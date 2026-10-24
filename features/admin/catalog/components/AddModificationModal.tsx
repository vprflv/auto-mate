'use client';

import * as React from 'react';
import { X, GitBranchPlus } from 'lucide-react';

import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';

import { useModificationForm } from '../hooks/useModificationForm';
import { ModificationFormFields } from './ModificationFormFields';

interface Props {
    model: StoredMasterModel;
    onClose: () => void;
}

export function AddModificationModal({
                                         model,
                                         onClose
                                     }: Props) {
    const titleId = React.useId();
    const descriptionId = React.useId();

    const form = useModificationForm({
        brandSlug: model.brandSlug,
        modelSlug: model.modelSlug,
        onCreated: () => onClose()
    });

    React.useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;

            if (
                previousFocus instanceof HTMLElement &&
                previousFocus.isConnected
            ) {
                previousFocus.focus();
            }
        };
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === 'Escape' &&
                !event.defaultPrevented
            ) {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                onSubmit={event => {
                    event.preventDefault();
                    form.submit();
                }}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] shadow-2xl"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                            <GitBranchPlus className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h2
                                id={titleId}
                                className="text-lg font-bold text-[var(--text)]"
                            >
                                Добавить модификацию
                            </h2>

                            <p
                                id={descriptionId}
                                className="mt-0.5 break-words text-xs text-[var(--text-muted)]"
                            >
                                {model.brandName}{' '}
                                {model.modelName}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть окно добавления модификации"
                        className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
                    <ModificationFormFields form={form} />
                </div>

                <div className="shrink-0 space-y-3 border-t border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
                    {form.error && (
                        <p
                            role="alert"
                            className="text-sm text-red-500"
                        >
                            {form.error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--bg-elevated)]"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600"
                        >
                            Добавить
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}