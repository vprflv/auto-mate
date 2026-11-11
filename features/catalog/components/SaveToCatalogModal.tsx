'use client';

import { useEffect, useId, useRef } from 'react';

import type { CatalogArticle } from '@/types/catalog/catalog';

import {
    useSaveToCatalogModal,
} from '../hooks/useSaveToCatalogModal';

import type {
    SavedPartDestination,
} from '../hooks/useSaveToCatalogModal';
import { PartInstallationBadge } from '@/features/garage/components/PartInstallationBadge';

type Props = {
    carId: string;
    article: CatalogArticle;
    nodeName?: string;
    onClose: () => void;
    onSaved: (destination: SavedPartDestination) => void;
};

const inputClassName =
    'w-full rounded-xl border border-[var(--border)] ' +
    'bg-[var(--bg-elevated)] px-3 py-2.5 text-sm ' +
    'text-[var(--text)] outline-none focus:border-[var(--link)]';

export default function SaveToCatalogModal({
                                               carId,
                                               article,
                                               nodeName,
                                               onClose,
                                               onSaved,
                                           }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    const form = useSaveToCatalogModal({
        carId,
        article,
        nodeName,
        onSaved,
    });

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        if (!dialog.open) dialog.showModal();

        return () => {
            if (dialog.open) dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={event => {
                event.preventDefault();
                onClose();
            }}
            onClick={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-0 text-[var(--text)] backdrop:bg-black/60"
        >
            <form
                onSubmit={event => {
                    event.preventDefault();
                    form.save();
                }}
                className="space-y-5 p-5 sm:p-6"
            >
                <h2 id={titleId} className="text-xl font-semibold">
                    Добавить в личный каталог
                </h2>

                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                    <p className="font-medium">{article.name}</p>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {article.brand} · {article.oem}
                    </p>
                </div>

                <label className="block space-y-2">
                    <span className="text-sm">Категория</span>

                    <select
                        required
                        value={form.category}
                        onChange={event =>
                            form.changeCategory(event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">Выберите категорию</option>

                        {form.categories.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.label}
                            </option>
                        ))}

                        <option value={form.newCategoryValue}>
                            + Создать / подключить категорию
                        </option>
                    </select>
                </label>

                {form.creatingCategory && (
                    <label className="block space-y-2">
                        <span className="text-sm">
                            Название категории
                        </span>

                        <input
                            required
                            value={form.newCategoryName}
                            onChange={event =>
                                form.setNewCategoryName(event.target.value)
                            }
                            placeholder="Например, Двигатель"
                            className={inputClassName}
                        />
                    </label>
                )}

                <label className="block space-y-2">
                    <span className="text-sm">Подкатегория</span>

                    <select
                        required
                        disabled={!form.category}
                        value={form.subcategory}
                        onChange={event =>
                            form.setSubcategory(event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">Выберите подкатегорию</option>

                        {form.subcategories.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.label}
                            </option>
                        ))}

                        <option value={form.newSubcategoryValue}>
                            + Создать / подключить подкатегорию
                        </option>
                    </select>
                </label>

                {form.creatingSubcategory && (
                    <label className="block space-y-2">
                        <span className="text-sm">
                            Название подкатегории
                        </span>

                        <input
                            required
                            value={form.newSubcategoryName}
                            onChange={event =>
                                form.setNewSubcategoryName(
                                    event.target.value
                                )
                            }
                            placeholder="Например, Масляный фильтр"
                            className={inputClassName}
                        />
                    </label>
                )}



                {form.installation && (
                    <PartInstallationBadge value={form.installation} />
                )}

                <div className="rounded-xl border border-[var(--border)] p-3 text-sm">
                    <p className="text-xs text-[var(--text-muted)]">
                        Место сохранения
                    </p>

                    <p className="mt-1">{form.path}</p>
                </div>

                {form.error && (
                    <p role="alert" className="text-sm text-[var(--danger)]">
                        {form.error}
                    </p>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm"
                    >
                        Отмена
                    </button>

                    <button
                        type="submit"
                        className="flex-1 rounded-xl bg-[var(--btn-primary)] px-4 py-3 text-sm font-medium text-[var(--btn-primary-text)]"
                    >
                        Добавить
                    </button>
                </div>
            </form>
        </dialog>
    );
}
