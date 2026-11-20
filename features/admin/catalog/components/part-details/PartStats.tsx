import { Activity } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { storage } from '@/features/admin/lib/system-store/storage';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

interface Props {
    nodeId: string;
    part: Pick<
        StoredPartItem,
        'id' | 'installationsCount' | 'compatibilityScore'
    >;
}

export function PartStats({ part, nodeId }: Props) {
    const [draft, setDraft] = useState<string | null>(null);
    const [error, setError] = useState('');

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (draft === null || !draft.trim()) return;
        try {
            storage.updatePartConfidence(nodeId, part.id, Number(draft));
            setDraft(null);
            setError('');
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Не удалось сохранить индекс доверия.');
        }
    }
    return (
        <section className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
            <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--text-muted)]" />

                <h3 className="text-[10px] font-bold uppercase text-[var(--text-dim)]">
                    Статистика
                </h3>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--text-muted)]">
                        Успешных установок
                    </span>

                    <span className="text-sm font-bold text-[var(--text)]">
                        {part.installationsCount}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--text-muted)]">
                        Индекс доверия
                    </span>

                    <button type="button" title="Изменить индекс доверия"
                        aria-label={`Изменить индекс доверия, сейчас ${part.compatibilityScore}%`}
                        onClick={() => setDraft(String(part.compatibilityScore))}
                        className="text-sm font-bold text-emerald-500 hover:underline">
                        {part.compatibilityScore}%
                    </button>
                </div>
                {draft !== null && (
                    <form onSubmit={save} className="space-y-2">
                        <input aria-label="Индекс доверия, %" type="number" min={0} max={100}
                            step={1} required value={draft}
                            onChange={event => {
                                setDraft(event.target.value);
                                setError('');
                            }}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-sm"
                        />
                        {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
                        <div className="flex flex-wrap justify-end gap-2 text-xs">
                            <button type="button" onClick={() => {
                                setDraft(null);
                                setError('');
                            }} className="rounded-lg px-3 py-2 text-[var(--text-muted)]">Отмена</button>
                            <button type="submit" className="rounded-lg bg-blue-500 px-3 py-2 font-bold text-white">
                                Сохранить
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
