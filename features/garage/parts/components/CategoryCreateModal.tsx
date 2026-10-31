
'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';

const SUGGESTED_CATEGORIES = [
    'Двигатель',
    'Трансмиссия',
    'Электрика',
    'Топливная система',
    'Ходовая часть',
    'Кузов',
    'Салон',
];

interface Props {
    open: boolean;
    existingCategories: string[];
    onClose: () => void;
    onCreate: (name: string) => void;
    onSelectExisting: (name: string) => void;
}

const normalizeName = (value: string): string =>
    value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

export default function CategoryCreateModal({
                                                open,
                                                existingCategories,
                                                onClose,
                                                onCreate,
                                                onSelectExisting,
                                            }: Props) {
    const [isCustom, setIsCustom] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        if (!open) return;

        setIsCustom(false);
        setName('');
    }, [open]);

    if (!open) return null;

    const existingNames = new Set(
        existingCategories.map(normalizeName)
    );

    const isDuplicate = existingNames.has(normalizeName(name));

    const handleSelect = (value: string) => {
        const normalized = value.trim().replace(/\s+/g, ' ');

        if (!normalized) return;

        if (existingNames.has(normalizeName(normalized))) {
            onSelectExisting(normalized);
        } else {
            onCreate(normalized);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-create-title"
                className="relative w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3
                        id="category-create-title"
                        className="text-lg font-semibold text-[var(--text)]"
                    >
                        Новая категория
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)]"
                    >
                        <X size={18} />
                    </button>
                </div>

                {!isCustom ? (
                    <div className="space-y-2">
                        <p className="mb-4 text-sm text-[var(--text-muted)]">
                            Выберите категорию или создайте свою.
                        </p>

                        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                            {SUGGESTED_CATEGORIES.map((suggestion) => {
                                const exists = existingNames.has(
                                    normalizeName(suggestion)
                                );

                                return (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => handleSelect(suggestion)}
                                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left text-sm font-medium text-[var(--text)] transition hover:border-[var(--btn-primary)]"
                                    >
                                        <span className="min-w-0 truncate">
                                            {suggestion}
                                        </span>

                                        {exists ? (
                                            <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">
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

                        <button
                            type="button"
                            onClick={() => setIsCustom(true)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--btn-primary)] px-4 py-3 text-sm font-semibold text-[var(--text-accent)] transition hover:bg-[var(--bg-elevated)]"
                        >
                            <Plus size={17} />
                            Создать свою категорию
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setIsCustom(false)}
                            className="flex items-center gap-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]"
                        >
                            <ArrowLeft size={16} />
                            К готовым категориям
                        </button>

                        <div>
                            <label
                                htmlFor="custom-category-name"
                                className="mb-2 block text-xs font-medium text-[var(--text-muted)]"
                            >
                                Название категории
                            </label>

                            <input
                                id="custom-category-name"
                                autoFocus
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleSelect(name);
                                    }

                                    if (event.key === 'Escape') {
                                        onClose();
                                    }
                                }}
                                placeholder="Например, Дополнительное оборудование"
                                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--btn-primary)]"
                            />

                            {isDuplicate && (
                                <p className="mt-2 text-xs text-amber-500">
                                    Такая категория уже существует.
                                    При выборе она будет открыта.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={!name.trim()}
                            onClick={() => handleSelect(name)}
                            className="w-full rounded-xl bg-[var(--btn-primary)] px-4 py-3 text-sm font-semibold text-[var(--btn-primary-text)] transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isDuplicate
                                ? 'Открыть категорию'
                                : 'Создать категорию'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
