'use client';

import { GitBranch } from 'lucide-react';

import type {
    StoredPartItem,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';

import { usePartCompatibility } from '../../hooks/usePartCompatibility';

interface Props {
    part: StoredPartItem;
    node: StoredCatalogNode;
}

export function PartCompatibility({ part, node }: Props) {
    const state = usePartCompatibility({ part, node });

    return (
        <section className="space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                <GitBranch className="h-4 w-4" />
                Применимость
            </h3>

            {!state.modelFound ? (
                <p className="text-xs text-amber-500">
                    Модель автомобиля не найдена.
                </p>
            ) : (
                <>
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                        Назначено вручную
                    </p>

                    <label className="flex cursor-pointer items-start gap-2 text-xs font-bold text-[var(--text)]">
                        <input
                            type="checkbox"
                            checked={state.appliesToAll}
                            onChange={event =>
                                state.setAppliesToAll(event.target.checked)
                            }
                            className="mt-0.5 accent-blue-500"
                        />
                        Все модификации модели
                    </label>

                    <div className="max-h-64 space-y-2 overflow-y-auto">
                        {state.modifications.map(mod => (
                            <label
                                key={mod.id}
                                className="flex items-start gap-2 rounded-xl border border-[var(--border)]/40 p-3 text-xs text-[var(--text)]"
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        state.appliesToAll ||
                                        state.selectedIds.includes(mod.id)
                                    }
                                    disabled={state.appliesToAll}
                                    onChange={() =>
                                        state.toggleModification(mod.id)
                                    }
                                    className="mt-0.5 shrink-0 accent-blue-500"
                                />
                                <span className="min-w-0">
                                    <span className="block font-bold">
                                        {mod.name}
                                    </span>
                                    {mod.description && (
                                        <span className="mt-1 block text-[var(--text-muted)]">
                                            {mod.description}
                                        </span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>

                    {(state.inheritsAll ||
                        state.inheritedModifications.length > 0) && (
                        <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                            <p className="text-xs font-bold text-blue-500">
                                Получено автоматически от OEM
                            </p>

                            {state.inheritsAll ? (
                                <p className="text-xs text-[var(--text)]">
                                    Все модификации модели
                                </p>
                            ) : (
                                state.inheritedModifications.map(mod => (
                                    <div key={mod.id}>
                                        <p className="text-xs font-bold text-[var(--text)]">
                                            {mod.name}
                                        </p>

                                        {mod.description && (
                                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                                {mod.description}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}

                            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                                Эта применимость действует через
                                связанные OEM-оригиналы и обновляется
                                при изменении их применимости.
                            </p>
                        </div>
                    )}

                    {state.modifications.length === 0 && (
                        <p className="text-xs text-[var(--text-muted)]">
                            Отдельные модификации пока не добавлены.
                        </p>
                    )}

                    {!state.appliesToAll &&
                        state.selectedIds.length === 0 &&
                        !state.inheritsAll &&
                        state.inheritedModifications.length === 0 && (
                        <p className="text-xs text-amber-500">
                            Применимость не уточнена.
                        </p>
                    )}

                    {state.error && (
                        <p role="alert" className="text-xs text-red-500">
                            {state.error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 text-xs">
                        {state.dirty && (
                            <button
                                type="button"
                                onClick={state.cancel}
                                className="rounded-lg px-3 py-2 text-[var(--text-muted)]"
                            >
                                Отменить
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={state.save}
                            disabled={!state.dirty}
                            className="rounded-lg bg-blue-500 px-3 py-2 font-bold text-white disabled:opacity-40"
                        >
                            Сохранить
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}