import * as React from 'react';
import { Link as LinkIcon } from 'lucide-react'; // Добавим иконку для красоты

interface PartEditorBlockProps {
    brand: string; setBrand: (value: string) => void;
    article: string; setArticle: (value: string) => void;
    name: string; setName: (value: string) => void;
    isOem: boolean; setIsOem: (value: boolean) => void;
    oemCross: string; setOemCross: (value: string) => void; // <-- НОВЫЕ ПРОПСЫ
}

export function PartEditorBlock({ brand, setBrand, article, setArticle, name, setName, isOem, setIsOem, oemCross, setOemCross }: PartEditorBlockProps) {
    return (
        <div className="space-y-4 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/40 p-5">
            <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase text-[var(--text-dim)]">Карточка детали</p>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={isOem} onChange={(e) => setIsOem(e.target.checked)} className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-amber-500 focus:ring-amber-500/20" />
                    <span className={`text-xs font-bold transition ${isOem ? 'text-amber-500' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>Это оригинальная деталь (OEM)</span>
                </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Бренд</label>
                    <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Артикул</label>
                    <input value={article} onChange={(e) => setArticle(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-mono text-[var(--text)] outline-none focus:border-[var(--link)]" />
                </div>

                <div className="col-span-2">
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Эталонное название</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр: Фильтр масляный" className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                </div>

                {/* БЛОК КРОСС-НОМЕРА */}
                {!isOem && (
                    <div className="col-span-2 mt-1 rounded-xl bg-blue-500/5 p-3 border border-blue-500/10">
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-blue-500/80">
                            <LinkIcon className="h-3.5 w-3.5" />
                            Привязка к оригиналу (OEM Кросс)
                        </label>
                        <input
                            value={oemCross}
                            onChange={(e) => setOemCross(e.target.value)}
                            placeholder="Введите оригинальный номер (если это аналог)"
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-mono text-[var(--text)] outline-none focus:border-blue-500/50"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}