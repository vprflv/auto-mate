'use client';

import { useId, type RefObject } from 'react';
import type { CatalogArticle } from '@/types/catalog/catalog';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { CopyNumberButton } from './CopyNumberButton';

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    article: CatalogArticle;
    catalogArticles: readonly CatalogArticle[];
    onClose: () => void;
};

export function CatalogArticleDialog({ dialogRef, article, catalogArticles, onClose }: Props) {
    const titleId = useId();
    const groups = catalogArticles.filter(group =>
        group.id === article.id || group.variants?.some(variant => variant.id === article.id)
    );

    const oemNumbers = new Map<string, string>();
    const addOem = (number: string) => {
        const key = normalizeArticle(number);
        if (key && !oemNumbers.has(key)) oemNumbers.set(key, number);
    };

    for (const number of article.originalNumbers ?? []) addOem(number);
    for (const group of groups) {
        if (group.isOem || group.canSave === false) addOem(group.oem);
        for (const number of group.originalNumbers ?? []) addOem(number);
    }

    const variants = new Map<string, CatalogArticle>();
    for (const variant of [...(article.variants ?? []), ...groups.flatMap(group => group.variants ?? [])]) {
        const number = normalizeArticle(variant.oem);
        if (variant.id === article.id || !number) continue;
        const key = JSON.stringify([variant.brand?.trim().toLowerCase() ?? '', number]);
        if (!variants.has(key)) variants.set(key, variant);
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={event => {
                event.preventDefault();
                onClose();
            }}
            onClick={event => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-0 text-[var(--text)] backdrop:bg-black/60"
        >
            <div className="space-y-5 p-5 sm:p-6">
                <header className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 id={titleId} className="break-words text-lg font-semibold">Аналоги детали</h2>
                        <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
                            {[article.name, article.brand, article.oem].filter(Boolean).join(' · ')}
                        </p>
                    </div>
                    <button
                        type="button"
                        autoFocus
                        onClick={onClose}
                        className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    >
                        Закрыть
                    </button>
                </header>

                {oemNumbers.size > 0 && (
                    <section className="space-y-2">
                        <h3 className="text-sm font-semibold">Оригинальные номера</h3>
                        <ul className="divide-y divide-[var(--border)]">
                            {[...oemNumbers.values()].map(number => (
                                <li key={number} className="flex items-center gap-2 py-1">
                                    <span className="break-all font-mono text-sm">{number}</span>
                                    <CopyNumberButton value={number} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Аналоги</h3>
                    {variants.size === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">Аналоги пока не добавлены.</p>
                    ) : (
                        <ul className="divide-y divide-[var(--border)]">
                            {[...variants.entries()].map(([key, variant]) => (
                                <li key={key} className="flex flex-wrap items-center gap-x-2 py-1 text-sm">
                                    {variant.brand && <span className="font-medium">{variant.brand}</span>}
                                    <span className="break-all font-mono">{variant.oem}</span>
                                    <CopyNumberButton value={variant.oem} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </dialog>
    );
}
