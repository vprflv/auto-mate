import { SlidersHorizontal } from 'lucide-react';
import { mockEngines } from '../data/mockModelCatalog';

interface Props {
    selectedEngine: string;
    onSelectEngine: (engineId: string) => void;
}

export function EngineSelector({ selectedEngine, onSelectEngine }: Props) {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Модификация / Двигатель
            </div>

            <div className="flex flex-wrap gap-2">
                {mockEngines.map((engine) => {
                    const active = selectedEngine === engine.id;
                    return (
                        <button
                            key={engine.id}
                            type="button"
                            onClick={() => onSelectEngine(engine.id)}
                            className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                                active
                                    ? 'bg-[var(--text)] text-[var(--bg)] font-semibold shadow-xs'
                                    : 'bg-[var(--bg)]/60 text-[var(--text-muted)] border border-[var(--border)]/70 hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                            }`}
                        >
                            {engine.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}