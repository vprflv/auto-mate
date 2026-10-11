import * as React from 'react';
import {
    CheckCircle2,
    ShieldCheck,
    AlertTriangle,
    Copy,
    Check,
    Pencil,
    BadgeCheck,
} from 'lucide-react';
import { PartItem } from '../types';

interface Props {
    item: PartItem;
    onEdit: () => void;
}

export function PartItemRow({ item, onEdit }: Props) {
    const [isCopied, setIsCopied] = React.useState(false);
    const score = item.compatibilityScore;

    const isHigh = score >= 80;
    const isMedium = score >= 40 && score < 80;
    const isLow = score < 40;

    const handleCopy = () => {
        navigator.clipboard.writeText(item.article);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[var(--bg-elevated)]/30">
            {/* Описание детали */}
            <div className="space-y-1.5 min-w-[280px]">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text)]">
                        {item.brand}
                    </span>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--text)] border border-[var(--border)]/60 hover:border-[var(--text-dim)] transition-colors"
                        title="Скопировать артикул"
                    >
                        {item.article}
                        {isCopied ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                            <Copy className="h-3 w-3 text-[var(--text-dim)]" />
                        )}
                    </button>

                    {item.isOem && (
                        <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                            OEM Оригинал
                        </span>
                    )}

                    {item.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                            <BadgeCheck className="h-3 w-3" />
                            Проверено админом
                        </span>
                    )}
                </div>

                <p className="text-xs text-[var(--text-muted)]">
                    {item.name}
                    {item.priceRange && ` • средняя цена: ${item.priceRange}`}
                </p>

                {isLow && (
                    <div className="flex items-center gap-1.5 pt-1 text-xs text-rose-500 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Низкая совместимость — перед покупкой проверьте совместимость по VIN коду!</span>
                    </div>
                )}

                {item.note && (
                    <p className="text-[11px] text-[var(--text-dim)] italic">
                        {item.note}
                    </p>
                )}
            </div>

            {/* Статистика и шкала */}
            <div className="flex items-center gap-4 sm:justify-end">
                <div className="text-right">
                    <p className="text-xs text-[var(--text-dim)]">Установок</p>
                    <p className="text-sm font-semibold text-[var(--text)]">
                        {item.installationsCount} авто
                    </p>
                </div>

                <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <div className="flex items-center gap-1.5">
                        {isHigh && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {isMedium && <ShieldCheck className="h-4 w-4 text-amber-500" />}
                        {isLow && <AlertTriangle className="h-4 w-4 text-rose-500" />}

                        <span
                            className={`font-bold text-sm ${
                                isHigh
                                    ? 'text-emerald-500'
                                    : isMedium
                                        ? 'text-amber-500'
                                        : 'text-rose-500'
                            }`}
                        >
                            {score}%
                        </span>
                    </div>

                    <div className="h-1.5 w-24 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                isHigh
                                    ? 'bg-emerald-500'
                                    : isMedium
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                            }`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors"
                    title="Редактировать совместимость"
                >
                    <Pencil className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}