'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Props = {
    open: boolean;
    title: string;
    placeholder?: string;
    confirmLabel?: string;
    onClose: () => void;
    onSubmit: (name: string) => void;
};

export default function NamePromptModal({
                                            open,
                                            title,
                                            placeholder = 'Название',
                                            confirmLabel = 'Создать',
                                            onClose,
                                            onSubmit,
                                        }: Props) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!open) return;

        setValue('');

        const timeout = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => window.clearTimeout(timeout);
    }, [open]);

    if (!open) return null;

    const submit = () => {
        const name = value.trim();

        if (!name) return;

        onSubmit(name);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-colors duration-200">
                <h3 className="mb-4 text-base font-semibold text-[var(--text)]">
                    {title}
                </h3>

                <label className="mb-1.5 block text-xs font-medium text-[var(--text-accent)]">
                    Название
                </label>

                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            submit();
                        }

                        if (e.key === 'Escape') {
                            e.preventDefault();
                            onClose();
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-[var(--border)]/40 bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
                />

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
                        onClick={submit}
                        disabled={!value.trim()}
                        className="flex-1 rounded-xl bg-[var(--btn-primary)] py-2.5 text-sm font-medium text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}