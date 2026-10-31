'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

type Props = {
    open: boolean;
    categoryName: string;
    suggestions: string[];
    existingNames: string[];
    onClose: () => void;
    onSubmit: (name: string) => void;
};

const normalize = (value: string): string =>
    value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

export default function SubcategoryCreateModal({
                                                   open,
                                                   categoryName,
                                                   suggestions,
                                                   existingNames,
                                                   onClose,
                                                   onSubmit,
                                               }: Props) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (open) setName('');
    }, [open, categoryName]);

    if (!open) return null;

    const existing = new Set(
        existingNames.map(normalize)
    );

    const isDuplicate = existing.has(normalize(name));

    const handleSubmit = (value: string) => {
        const trimmed = value.trim().replace(/\s+/g, ' ');

        if (!trimmed) return;

        onSubmit(trimmed);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    event.stopPropagation();
                    onClose();
                }
            }}
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="subcategory-create-title"
                className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl"
            >
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <h3
                            id="subcategory-create-title"
                            className="text-lg font-semibold text-[var(--text)]"
                        >
                            Новая подкатегория
                        </h3>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {categoryName}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)]"
                    >
                        <X size={18} />
                    </button>
                </div>

                {suggestions.length > 0 && (
                    <>
                        <p className="mb-3 text-sm text-[var(--text-muted)]">
                            Выберите готовую подкатегорию
                            или введите своё название.
                        </p>

                        <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                            {suggestions.map((suggestion) => {
                                const exists = existing.has(
                                    normalize(suggestion)
                                );

                                return (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() =>
                                            handleSubmit(suggestion)
                                        }
                                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left text-sm font-medium text-[var(--text)] transition hover:border-[var(--btn-primary)]"
                                    >
                                        <span>{suggestion}</span>

                                        {exists ? (
                                            <span className="flex shrink-0 items-center gap-1 text-[10px] text-[var(--text-muted)]">
                                                <Check size={13} />
                                                Уже есть
                                            </span>
                                        ) : (
                                            <Plus
                                                size={17}
                                                className="shrink-0 text-[var(--text-muted)]"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                <form
                    className="mt-5 space-y-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit(name);
                    }}
                >
                    <label
                        htmlFor="custom-subcategory-name"
                        className="block text-xs font-medium text-[var(--text-muted)]"
                    >
                        Своя подкатегория
                    </label>

                    <input
                        id="custom-subcategory-name"
                        autoFocus
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="Введите название"
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                    />

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full rounded-xl bg-[var(--btn-primary)] px-4 py-3 text-sm font-semibold text-[var(--btn-primary-text)] transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isDuplicate
                            ? 'Открыть подкатегорию'
                            : 'Создать подкатегорию'}
                    </button>
                </form>
            </div>
        </div>
    );
}