'use client';

import Link from 'next/link';

import type { CatalogArticle } from '@/types/catalog/catalog';

import { useCatalogArticleDialog } from '../hooks/useCatalogArticleDialog';
import { CatalogArticleDialog } from './article-card/CatalogArticleDialog';
import { CopyNumberButton } from './article-card/CopyNumberButton';
import {installationKey} from "@/features/catalog/lib/partInstallations";
import {PartInstallationBadge} from "@/features/garage/components/PartInstallationBadge";

type Props = {
    carId: string;
    article: CatalogArticle;
    alreadyAdded: boolean;
    onAdd: () => void;
    onRemove: () => void;
    onRemoveVariant: (article: CatalogArticle) => void;
    isAlreadyAdded: (articleNumber: string) => boolean;
    onAddVariant: (article: CatalogArticle) => void;
};

export default function CatalogArticleCard({
                                               carId,
                                               article,
                                               alreadyAdded,
                                               onAdd,
                                               onRemove,
                                               isAlreadyAdded,
                                               onRemoveVariant,
                                               onAddVariant,
                                           }: Props) {
    const dialog = useCatalogArticleDialog();

    const originalNumbers = article.originalNumbers ?? [];
    const variantsCount = article.variants?.length ?? 0;
    const canSave = article.canSave !== false;

    return (
        <>
            <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                <div className="flex-1">
                    <h3 className="mb-3 text-base font-semibold text-[var(--text)]">
                        {article.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                        Оригинальный номер
                    </p>


                    <div className="mt-1 space-y-1">
                        {originalNumbers.map(number => (
                            <div
                                key={number}
                                className="flex items-center gap-2"
                            >
                                <span className="break-all font-mono text-xl font-semibold text-[var(--text)]">
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
                        <span className="rounded-lg bg-[var(--bg)] px-2 py-1 text-[var(--text-muted)]">
                            Аналогов: {variantsCount}
                        </span>

                        {canSave && (
                            <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-emerald-500">
                                Для вашей модификации
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={dialog.open}
                        aria-haspopup="dialog"
                        className="mt-4 rounded-lg text-sm text-[var(--link)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--link)]"
                    >
                        Открыть аналоги →
                    </button>
                </div>

                <div className="mt-4 border-t border-[var(--border)] pt-3">
                    {canSave ? (
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
                                onClick={alreadyAdded ? onRemove : onAdd}
                                className="rounded-xl bg-[var(--btn-primary)] px-3 py-2 text-xs font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                            >
                                {alreadyAdded
                                    ? 'Убрать из личного каталога'
                                    : 'Добавить в личный каталог'}
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-[var(--text-muted)]">
                            Откройте карточку, чтобы выбрать
                            проверенный аналог.
                        </p>
                    )}
                </div>
            </article>

            {dialog.isOpen && (
                <CatalogArticleDialog
                    dialogRef={dialog.dialogRef}
                    article={article}
                    isAlreadyAdded={isAlreadyAdded}
                    onAdd={onAddVariant}
                    onRemove={onRemoveVariant}
                    onClose={dialog.close}
                />
            )}
        </>
    );
}