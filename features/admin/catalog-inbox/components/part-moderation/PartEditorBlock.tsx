
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
                                    oemSuggestions
                                }: PartEditorBlockProps) {
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
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">
                        Бренд
                    </label>
                    <input
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]"
                    />
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
                        suggestions={oemSuggestions}
                    />
                )}
            </div>
        </div>
    );
}
