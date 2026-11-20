
import { useId, useState } from 'react';
import { formatPartBrand } from '@/features/admin/lib/system-store/formatPartBrand';
import { storage } from '@/features/admin/lib/system-store/storage';

import {
    OemCrossSelect,
    type OemSuggestion
} from './OemCrossSelect';

interface PartEditorBlockProps {
    brand: string;
    setBrand: (value: string) => void;
    article: string;
    setArticle: (value: string) => void;
    name: string;
    setName: (value: string) => void;
    isOem: boolean;
    setIsOem: (value: boolean) => void;
    oemCross: string;
    setOemCross: (value: string) => void;
    onOemSelect?: (suggestion: OemSuggestion) => void;
    oemSuggestions: OemSuggestion[];
}

export function PartEditorBlock({
                                    brand,
                                    setBrand,
                                    article,
                                    setArticle,
                                    name,
                                    setName,
                                    isOem,
                                    setIsOem,
                                    oemCross,
                                    setOemCross,
                                    onOemSelect,
                                    oemSuggestions
                                }: PartEditorBlockProps) {
    const brandId = useId();
    const brandOptionsId = `${brandId}-options`;
    const [brandOptions] = useState(() => {
        const brands = new Set<string>();

        for (const node of storage.getState().catalogNodes) {
            for (const part of node.items) {
                const formattedBrand = formatPartBrand(part.brand);
                if (formattedBrand) brands.add(formattedBrand);
            }
        }

        return [...brands].sort((a, b) => a.localeCompare(b, 'ru'));
    });

    return (
        <div className="space-y-4 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/40 p-5">
            <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase text-[var(--text-dim)]">
                    Карточка детали
                </p>

                <label className="group flex cursor-pointer items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isOem}
                        onChange={e => setIsOem(e.target.checked)}
                        className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-amber-500 focus:ring-amber-500/20"
                    />
                    <span
                        className={`text-xs font-bold transition ${
                            isOem
                                ? 'text-amber-500'
                                : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'
                        }`}
                    >
                        Это оригинальная деталь (OEM)
                    </span>
                </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor={brandId} className="mb-1 block text-xs text-[var(--text-muted)]">
                        Бренд
                    </label>
                    <input
                        id={brandId}
                        list={brandOptions.length > 0 ? brandOptionsId : undefined}
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        onBlur={e => setBrand(formatPartBrand(e.currentTarget.value))}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]"
                    />
                    {brandOptions.length > 0 && (
                        <datalist id={brandOptionsId}>
                            {brandOptions.map(option => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">
                        Артикул
                    </label>
                    <input
                        value={article}
                        onChange={e => setArticle(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-mono text-sm text-[var(--text)] outline-none focus:border-[var(--link)]"
                    />
                </div>

                <div className="col-span-2">
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">
                        Эталонное название
                    </label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Напр: Фильтр масляный"
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]"
                    />
                </div>

                {!isOem && (
                    <OemCrossSelect
                        value={oemCross}
                        onChange={setOemCross}
                        onSelect={onOemSelect}
                        suggestions={oemSuggestions}
                    />
                )}
            </div>
        </div>
    );
}
