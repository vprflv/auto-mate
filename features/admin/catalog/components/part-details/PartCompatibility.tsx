import { GitBranch } from 'lucide-react';

import type { PartModificationView } from '../../hooks/usePartDetails';

interface Props {
    appliesToAll: boolean;
    modifications: PartModificationView[];
}

export function PartCompatibility({
                                      appliesToAll,
                                      modifications
                                  }: Props) {
    return (
        <section className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
            <div className="mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[var(--text-muted)]" />

                <h3 className="text-[10px] font-bold uppercase text-[var(--text-dim)]">
                    Применимость
                </h3>
            </div>

            {appliesToAll ? (
                <div>
                    <p className="text-sm font-bold text-emerald-500">
                        Все модификации модели
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        В рамках указанной модели автомобиля.
                    </p>
                </div>
            ) : modifications.length > 0 ? (
                <div className="space-y-2">
                    {modifications.map(mod => (
                        <div
                            key={mod.id}
                            className="rounded-xl border border-[var(--border)]/40 bg-[var(--card)] p-3"
                        >
                            <p className="break-words text-sm font-bold text-[var(--text)]">
                                {mod.name}
                            </p>

                            {mod.description && (
                                <p className="mt-1 break-words text-[11px] leading-relaxed text-[var(--text-muted)]">
                                    {mod.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs leading-relaxed text-amber-500">
                    Применимость не уточнена.
                    Модификации для этой детали
                    пока не подтверждены.
                </p>
            )}
        </section>
    );
}