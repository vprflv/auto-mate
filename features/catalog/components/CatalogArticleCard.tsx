import Link from 'next/link';
import { CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

import { CatalogArticle } from '@/types/catalog/catalog';
import { calculateCompatibilityScore } from '../lib/compatibility';

type Props = {
    carId: string;
    article: CatalogArticle & {
        compatibilityScore?: number;
        installationsCount?: number;
        isOem?: boolean;
    };
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
    const isOem = article.isOem ?? (!article.brand || article.brand.toLowerCase() === 'oem' || article.brand.toLowerCase() === 'vag');

    // Алгоритмический расчёт без участия нейросети
    const compat = calculateCompatibilityScore({
        explicitScore: article.compatibilityScore,
        isOem,
        brand: article.brand,
        installationsCount: article.installationsCount,
    });

    const isHigh = compat.tier === 'high';
    const isMedium = compat.tier === 'medium';
    const isLow = compat.tier === 'low';

    return (
        <div className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--link)]/40">
            <div>
                {/* Верхняя строка: OEM + Бренд и Индикатор совместимости */}
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-[var(--bg)] px-2 py-0.5 font-mono text-xs text-[var(--text-muted)] border border-[var(--border)]/60">
                            {article.oem}
                        </span>

                        {article.brand && (
                            <span className="text-xs font-semibold text-[var(--text)]">
                                {article.brand}
                            </span>
                        )}

                        {isOem && (
                            <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                                OEM
                            </span>
                        )}
                    </div>

                    {/* Шкала и процент совместимости */}
                    <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1">
                            {isHigh && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            {isMedium && <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />}
                            {isLow && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}

                            <span
                                className={`text-xs font-bold font-mono ${
                                    isHigh
                                        ? 'text-emerald-500'
                                        : isMedium
                                            ? 'text-amber-500'
                                            : 'text-rose-500'
                                }`}
                            >
                                {compat.score}%
                            </span>
                        </div>

                        {/* Индикаторная полоска */}
                        <div className="mt-1 h-1 w-16 rounded-full bg-[var(--bg)] overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${
                                    isHigh
                                        ? 'bg-emerald-500'
                                        : isMedium
                                            ? 'bg-amber-500'
                                            : 'bg-rose-500'
                                }`}
                                style={{ width: `${compat.score}%` }}
                            />
                        </div>
                    </div>
                </div>

                <h3 className="mb-1 text-[15px] font-medium leading-snug text-[var(--text)]">
                    {article.name}
                </h3>

                {article.note && (
                    <p className="mb-2 text-xs text-[var(--text-dim)]">
                        {article.note}
                    </p>
                )}

                {/* Предупреждение для низкого процента совместимости */}
                {isLow && compat.warning && (
                    <div className="mb-3 flex items-start gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-[11px] font-medium text-rose-500 leading-tight">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{compat.warning}</span>
                    </div>
                )}
            </div>

            {/* Подвал карточки: количество и кнопки */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                <div className="text-xs text-[var(--text-dim)]">
                    {article.quantity ? `${article.quantity} шт.` : '—'}
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={{
                            pathname: `/garage/${carId}/buy`,
                            query: {
                                name: article.name,
                                oem: article.oem,
                                brand: article.brand || '',
                            },
                        }}
                        className="rounded-xl bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition-colors hover:bg-[var(--border)]"
                    >
                        Где купить
                    </Link>

                    {alreadyAdded ? (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="rounded-xl bg-[var(--danger)]/15 px-3 py-1.5 text-xs font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)] hover:text-[var(--btn-primary-text)]"
                        >
                            Убрать
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onAdd}
                            className="rounded-xl bg-[var(--btn-primary)] px-3 py-1.5 text-xs font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                        >
                            В мой каталог
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}