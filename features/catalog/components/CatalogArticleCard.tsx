import Link from 'next/link';
import { Check } from 'lucide-react';

import { CatalogArticle } from '@/types/catalog/catalog';

type Props = {
    carId: string;
    article: CatalogArticle;
    alreadyAdded: boolean;
    onAdd: () => void;
    onRemove: () => void;
};

export default function CatalogArticleCard({
                                               carId,
                                               article,
                                               alreadyAdded,
                                               onAdd,
                                               onRemove,
                                           }: Props) {
    return (
        <div className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--link)]/40">
            <div className="mb-2 flex items-start justify-between gap-2">
                <span className="rounded-md bg-[var(--bg)] px-2 py-0.5 font-mono text-xs text-[var(--text-muted)]">
                    {article.oem}
                </span>

                {article.brand && (
                    <span className="shrink-0 text-xs text-[var(--text-dim)]">
                        {article.brand}
                    </span>
                )}
            </div>

            <h3 className="mb-1 text-[15px] font-medium leading-snug text-[var(--text)]">
                {article.name}
            </h3>

            {article.note && (
                <p className="mb-3 text-xs text-[var(--text-dim)]">
                    {article.note}
                </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                <div className="text-xs text-[var(--text-dim)]">
                    {article.quantity
                        ? `${article.quantity} шт.`
                        : '—'}
                </div>

                <Link
                    href={{
                        pathname: `/garage/${carId}/buy`,
                        query: {
                            name: article.name,
                            oem: article.oem,
                            brand: article.brand || '',
                        },
                    }}
                    className="rounded-xl bg-[var(--bg)] px-4 py-1.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--border)]"
                >
                    Где купить
                </Link>

                {alreadyAdded ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="rounded-xl bg-[var(--danger)]/15 px-3 py-1.5 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)] hover:text-[var(--btn-primary-text)]"
                    >
                        Убрать
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="rounded-xl bg-[var(--btn-primary)] px-4 py-1.5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                    >
                        В мой каталог
                    </button>
                )}
            </div>
        </div>
    );
}