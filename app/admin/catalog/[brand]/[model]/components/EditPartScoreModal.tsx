import * as React from 'react';
import { X } from 'lucide-react';
import { PartItem } from '../types';

interface Props {
    item: PartItem;
    onClose: () => void;
    onSave: (updated: { score: number; isVerified: boolean; note?: string }) => void;
}

export function EditPartScoreModal({ item, onClose, onSave }: Props) {
    const [score, setScore] = React.useState<number>(item.compatibilityScore);
    const [isVerified, setIsVerified] = React.useState<boolean>(Boolean(item.isVerified));
    const [note, setNote] = React.useState<string>(item.note || '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text)]">
                            Настройка совместимости
                        </h3>
                        <p className="text-xs text-[var(--text-dim)] mt-0.5">
                            {item.brand} • {item.article}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-[var(--text-dim)] hover:text-[var(--text)]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                            Индекс совместимости
                        </label>
                        <span className={`text-base font-bold font-mono ${
                            score >= 80 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                            {score}%
                        </span>
                    </div>

                    <input
                        type="range"
                        min={5}
                        max={100}
                        step={1}
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--text-dim)]">
                        <span>5% (Низкая)</span>
                        <span>50% (Средняя)</span>
                        <span>100% (Идеально)</span>
                    </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-[var(--border)] p-3 hover:bg-[var(--bg-elevated)]/40 transition-colors">
                    <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={(e) => {
                            setIsVerified(e.target.checked);
                            if (e.target.checked && score < 80) setScore(98);
                        }}
                        className="h-4 w-4 rounded accent-emerald-500"
                    />
                    <div>
                        <p className="text-xs font-semibold text-[var(--text)]">
                            Подтверждено администратором (OEM Baseline)
                        </p>
                        <p className="text-[11px] text-[var(--text-dim)]">
                            Гарантирует статус «Проверено» даже без истории установок
                        </p>
                    </div>
                </label>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                        Примечание или ограничение
                    </label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Например: только для моторов до 2018 года..."
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        onClick={() => onSave({ score, isVerified, note: note.trim() || undefined })}
                        className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-xs font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] transition-colors"
                    >
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
}