'use client';

import * as React from 'react';
import { ShieldCheck } from 'lucide-react';

interface Props {
    partName: string;
    onChangeName: (v: string) => void;
    partBrand: string;
    onChangeBrand: (v: string) => void;
    partArticle: string;
    onChangeArticle: (v: string) => void;
    isOem: boolean;
    onToggleOem: () => void;
    score: number;
    onChangeScore: (v: number) => void;
}

export function PartDetailsFormSection({
                                           partName,
                                           onChangeName,
                                           partBrand,
                                           onChangeBrand,
                                           partArticle,
                                           onChangeArticle,
                                           isOem,
                                           onToggleOem,
                                           score,
                                           onChangeScore,
                                       }: Props) {
    return (
        <div className="space-y-2.5">
            {/* Название детали */}
            <div>
                <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                    Название
                </label>
                <input
                    type="text"
                    value={partName}
                    onChange={(e) => onChangeName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2.5 py-1 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                />
            </div>

            {/* Бренд + OEM + Артикул */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                            Бренд
                        </label>
                        <button
                            type="button"
                            onClick={onToggleOem}
                            className={[
                                'text-[9px] font-bold px-1 py-0.2 rounded transition',
                                isOem
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[var(--border)]/50 text-[var(--text-dim)]',
                            ].join(' ')}
                        >
                            OEM
                        </button>
                    </div>
                    <input
                        type="text"
                        value={partBrand}
                        onChange={(e) => onChangeBrand(e.target.value)}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2 py-1 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                        Артикул
                    </label>
                    <input
                        type="text"
                        value={partArticle}
                        onChange={(e) => onChangeArticle(e.target.value)}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2 py-1 font-mono text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                    />
                </div>
            </div>

            {/* Рейтинг совместимости */}
            <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-2 py-1 text-[11px]">
                <span className="flex items-center gap-1 font-bold text-[var(--text-dim)] text-[10px] uppercase">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Рейтинг:
                </span>
                <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
                    <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={score}
                        onChange={(e) => onChangeScore(Number(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-[var(--border)] rounded cursor-pointer"
                    />
                    <span className="font-mono text-[10px] font-bold text-emerald-500">
                        {score}%
                    </span>
                </div>
            </div>
        </div>
    );
}