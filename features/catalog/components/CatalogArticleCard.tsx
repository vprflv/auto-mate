'use client';

import Link from 'next/link';
import { BookmarkMinus, BookmarkPlus, ShoppingCart } from 'lucide-react';

import type { CatalogArticle } from '@/types/catalog/catalog';

import { CopyNumberButton } from './article-card/CopyNumberButton';
import {installationKey} from "@/features/catalog/lib/partInstallations";
import {PartInstallationBadge} from "@/features/garage/components/PartInstallationBadge";

const OEM_NUMBERS_PER_COLUMN = 5;
const oemActionClass = 'shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--link)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--link)]';

type Props = {
    carId: string;
    article: CatalogArticle;
    onShowAnalogs: () => void;
    onAdd: (article: CatalogArticle) => void;
    onRemove: (article: CatalogArticle) => void;
    isAlreadyAdded: (article: CatalogArticle) => boolean;
};

export default function CatalogArticleCard({
                                               carId,
                                               article,
                                               onShowAnalogs,
                                               onAdd,
                                               onRemove,
                                               isAlreadyAdded,
                                           }: Props) {
    const originalNumbers = [...new Set([
        ...(article.isOem && article.oem ? [article.oem] : []),
        ...(article.originalNumbers ?? []),
    ])];
    const variants = article.variants ?? [];
    const numberColumns = Array.from(
        { length: Math.ceil(originalNumbers.length / OEM_NUMBERS_PER_COLUMN) },
        (_, index) => originalNumbers.slice(
            index * OEM_NUMBERS_PER_COLUMN,
            (index + 1) * OEM_NUMBERS_PER_COLUMN
        )
    );
    const canSave = article.canSave !== false;

    return (
        <section className="space-y-3">
            <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                <div className="flex-1">
                    <h3 className="mb-3 text-base font-semibold text-[var(--text)]">
                        {article.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                        Оригинальный номер
                    </p>


                    {numberColumns.length > 0 ? (
                        <div className="mt-2 flex flex-wrap items-start gap-x-6 gap-y-3">
                            {numberColumns.map(column => (
                                <ul key={column[0]} className="grid max-w-full grid-cols-[minmax(0,1fr)_auto] gap-y-1">
                                    {column.map(number => {
                                        const item: CatalogArticle = canSave && number === article.oem
                                            ? article
                                            : {
                                                id: `${article.id}:oem:${number}`,
                                                oem: number,
                                                name: article.name,
                                                nodeId: article.nodeId,
                                                isOem: true,
                                            };
                                        const added = isAlreadyAdded(item);
                                        const personalAction = added
                                            ? 'Убрать из личного каталога'
                                            : 'Добавить в личный каталог';
                                        const PersonalIcon = added ? BookmarkMinus : BookmarkPlus;

                                        return (
                                            <li key={number} className="col-span-2 grid grid-cols-subgrid items-center gap-x-2">
                                                <span className="break-all font-mono text-base font-semibold sm:text-lg">{number}</span>
                                                <div className="flex items-center gap-0.5">
                                                    <CopyNumberButton value={number} size="large" />
                                                    <Link
                                                        href={{
                                                            pathname: `/garage/${carId}/buy`,
                                                            query: { name: item.name, oem: item.oem, brand: item.brand ?? '' },
                                                        }}
                                                        aria-label={`Где купить ${number}`}
                                                        title="Где купить"
                                                        className={oemActionClass}
                                                    >
                                                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => added ? onRemove(item) : onAdd(item)}
                                                        aria-label={`${personalAction}: ${number}`}
                                                        title={personalAction}
                                                        className={`${oemActionClass} ${added ? 'bg-[var(--link)]/10 text-[var(--link)]' : ''}`}
                                                    >
                                                        <PersonalIcon className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-1 text-sm text-[var(--text-muted)]">OEM-номер не указан</p>
                    )}

                    {article.brand && (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {article.brand}
                        </p>
                    )}

                    {article.installationOptions?.map(position => (
                        <PartInstallationBadge
                            key={installationKey(position)}
                            value={position}
                        />
                    ))}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <button type="button" aria-haspopup="dialog" onClick={onShowAnalogs}
                            className="rounded-lg bg-[var(--bg)] px-2 py-1 font-semibold text-[var(--link)] hover:underline">
                            Посмотреть аналоги
                        </button>
                        <span className="rounded-lg bg-[var(--bg)] px-2 py-1 text-[var(--text-muted)]">
                            Аналогов: {variants.length}
                        </span>

                        {canSave && (
                            <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-emerald-500">
                                Для вашей модификации
                            </span>
                        )}
                    </div>

                </div>

                {canSave && originalNumbers.length === 0 && (
                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                        <div className="flex flex-wrap justify-end gap-2">
                            <Link
                                href={{
                                    pathname: `/garage/${carId}/buy`,
                                    query: {
                                        name: article.name,
                                        oem: article.oem,
                                        brand: article.brand ?? '',
                                    },
                                }}
                                className="rounded-xl bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] transition-colors hover:bg-[var(--border)]"
                            >
                                Где купить
                            </Link>

                            <button
                                type="button"
                                onClick={() => isAlreadyAdded(article) ? onRemove(article) : onAdd(article)}
                                className="rounded-xl bg-[var(--btn-primary)] px-3 py-2 text-xs font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                            >
                                {isAlreadyAdded(article)
                                    ? 'Убрать из личного каталога'
                                    : 'Добавить в личный каталог'}
                            </button>
                        </div>
                    </div>
                )}
            </article>

        </section>
    );
}
