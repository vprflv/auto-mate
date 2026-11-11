'use client';

import { useId } from 'react';
import type { RefObject } from 'react';

import type { CatalogArticle } from '@/types/catalog/catalog';

import { CatalogFitmentList } from './CatalogFitmentList';
import { CatalogPartRow } from './CatalogPartRow';
import { CopyNumberButton } from './CopyNumberButton';

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    article: CatalogArticle;
    isAlreadyAdded: (article: CatalogArticle) => boolean;
    onAdd: (article: CatalogArticle) => void;
    onClose: () => void;
    onRemove: (article: CatalogArticle) => void;
};

export function CatalogArticleDialog({
                                         dialogRef,
                                         article,
                                         isAlreadyAdded,
                                         onAdd,
                                         onRemove,
                                         onClose,
                                     }: Props) {
    const titleId = useId();

    const originalNumbers = article.originalNumbers ?? [];
    const originalNumber = originalNumbers.join(' / ');

    const variants = article.variants ?? [];

    const detailItems = article.canSave !== false
        ? [article, ...variants]
        : variants;

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
            className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-0 text-[var(--text)] backdrop:bg-black/60"
        >
            <div className="space-y-6 p-5 sm:p-6">
                <header className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs text-[var(--text-muted)]">
                            Оригинальный номер
                        </p>

                        <div className="mt-1 space-y-1">
                            {originalNumbers.map(number => (
                                <div
                                    key={number}
                                    className="flex items-center gap-2"
                                >
                                    <span className="break-all font-mono text-2xl font-semibold">
                                        {number}
                                    </span>

                                    <CopyNumberButton value={number} />
                                </div>
                            ))}

                            {!originalNumbers.length && (
                                <p className="text-sm text-[var(--text-muted)]">
                                    OEM-номер не указан
                                </p>
                            )}
                        </div>

                        <h2
                            id={titleId}
                            className="mt-3 text-base font-medium"
                        >
                            {article.name}
                        </h2>
                    </div>

                    <button
                        type="button"
                        autoFocus
                        onClick={onClose}
                        aria-label="Закрыть карточку"
                        className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    >
                        Закрыть
                    </button>
                </header>

                <section className="space-y-3">
                    <h3 className="text-lg font-semibold">
                        Оригинал и аналоги
                    </h3>

                    {detailItems.map(item => (
                        <CatalogPartRow
                            key={item.id}
                            article={item}
                            originalNumber={originalNumber || 'не указан'}
                            alreadyAdded={isAlreadyAdded(item)}
                            onAdd={() => onAdd(item)}
                            onRemove={() => onRemove(item)}
                        />
                    ))}

                    {!variants.length && (
                        <p className="text-sm text-[var(--text-muted)]">
                            Одобренные аналоги пока не добавлены.
                        </p>
                    )}
                </section>

                {article.note && (
                    <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                        {article.note}
                    </p>
                )}

                <footer className="space-y-3 border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">

                    <details>
                        <summary className="cursor-pointer hover:text-[var(--text)]">
                            Все автомобили и модификации в цепочке
                        </summary>

                        <div className="mt-3 space-y-3">
                            <CatalogFitmentList
                                items={article.relatedFitments ?? []}
                            />

                            <p>
                                Применимость каждой детали указана
                                отдельно в её строке.
                            </p>
                        </div>
                    </details>
                </footer>
            </div>
        </dialog>
    );
}