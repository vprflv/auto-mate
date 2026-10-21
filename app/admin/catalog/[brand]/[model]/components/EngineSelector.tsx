import { SlidersHorizontal } from 'lucide-react';

interface FilterOption {
    id: string;
    label: string;
}

interface Props {
    engines: FilterOption[];
    selectedEngine: string;
    onSelectEngine: (id: string) => void;
    transmissions: FilterOption[];
    selectedTransmission: string;
    onSelectTransmission: (id: string) => void;
    drivetrains: FilterOption[];
    selectedDrivetrain: string;
    onSelectDrivetrain: (id: string) => void;
}

export function EngineSelector({
                                   engines, selectedEngine, onSelectEngine,
                                   transmissions, selectedTransmission, onSelectTransmission,
                                   drivetrains, selectedDrivetrain, onSelectDrivetrain
                               }: Props) {
    // Если нет ни одного фильтра (кроме "Все"), скрываем блок
    if (engines.length <= 1 && transmissions.length <= 1 && drivetrains.length <= 1) return null;

    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] border-b border-[var(--border)]/40 pb-2">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Фильтры модификации
            </div>

            {engines.length > 1 && (
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Двигатель:</span>
                    <div className="flex flex-wrap gap-2">
                        {engines.map((engine) => {
                            const active = selectedEngine === engine.id;
                            return (
                                <button
                                    key={engine.id}
                                    type="button"
                                    onClick={() => onSelectEngine(engine.id)}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
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
            )}

            {transmissions.length > 1 && (
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">КПП:</span>
                    <div className="flex flex-wrap gap-2">
                        {transmissions.map((t) => {
                            const active = selectedTransmission === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => onSelectTransmission(t.id)}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                                        active
                                            ? 'bg-[var(--text)] text-[var(--bg)] font-semibold shadow-xs'
                                            : 'bg-[var(--bg)]/60 text-[var(--text-muted)] border border-[var(--border)]/70 hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {drivetrains.length > 1 && (
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Привод:</span>
                    <div className="flex flex-wrap gap-2">
                        {drivetrains.map((d) => {
                            const active = selectedDrivetrain === d.id;
                            return (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => onSelectDrivetrain(d.id)}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                                        active
                                            ? 'bg-[var(--text)] text-[var(--bg)] font-semibold shadow-xs'
                                            : 'bg-[var(--bg)]/60 text-[var(--text-muted)] border border-[var(--border)]/70 hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                                    }`}
                                >
                                    {d.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}