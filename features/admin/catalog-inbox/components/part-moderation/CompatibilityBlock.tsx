'use client';

import * as React from 'react';
import { GitBranch, AlertTriangle } from 'lucide-react';

import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';

interface CompatibilityBlockProps {
    targetCar: StoredMasterModel | null;

    compatibilityType: 'all' | 'specific';
    setCompatibilityType: (value: 'all' | 'specific') => void;

    selectedModIds: string[];
    setSelectedModIds: React.Dispatch<
        React.SetStateAction<string[]>
    >;
}

export function CompatibilityBlock({
                                       targetCar,
                                       compatibilityType,
                                       setCompatibilityType,
                                       selectedModIds,
                                       setSelectedModIds
                                   }: CompatibilityBlockProps) {
    const modifications = targetCar?.modifications ?? [];

    const selectedCount = modifications.filter(
        mod => selectedModIds.includes(mod.id)
    ).length;

    const toggleMod = (id: string) => {
        setSelectedModIds(current =>
            current.includes(id)
                ? current.filter(modId => modId !== id)
                : [...current, id]
        );
    };

    return (
        <section className="mt-4 space-y-4 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/40 p-5">
            <div>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    <GitBranch className="h-4 w-4 text-[var(--link)]" />
                    Применимость запчасти
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                    Укажите, на какие модификации автомобиля
                    подходит именно эта деталь.
                </p>
            </div>

            {!targetCar ? (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <p className="text-xs leading-relaxed">
                        Модель автомобиля не найдена в эталонном
                        каталоге. Сначала добавьте её, затем
                        укажите применимость запчасти.
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-sm font-bold text-[var(--text)]">
                        {targetCar.brandName}{' '}
                        {targetCar.modelName}
                    </p>

                    <div
                        role="group"
                        aria-label="Режим выбора применимости"
                        className="grid grid-cols-1 gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1 sm:grid-cols-2"
                    >
                        <button
                            type="button"
                            aria-pressed={
                                compatibilityType === 'specific'
                            }
                            onClick={() =>
                                setCompatibilityType('specific')
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                                compatibilityType === 'specific'
                                    ? 'bg-[var(--card)] text-[var(--link)] shadow-sm'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            Конкретные модификации
                        </button>

                        <button
                            type="button"
                            aria-pressed={
                                compatibilityType === 'all'
                            }
                            onClick={() =>
                                setCompatibilityType('all')
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                                compatibilityType === 'all'
                                    ? 'bg-[var(--card)] text-[var(--link)] shadow-sm'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            Все модификации модели
                        </button>
                    </div>

                    {compatibilityType === 'all' ? (
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                            <p className="text-xs leading-relaxed text-[var(--text)]">
                                Вы подтверждаете, что эта деталь
                                подходит для всех модификаций{' '}
                                <span className="font-bold">
                                    {targetCar.brandName}{' '}
                                    {targetCar.modelName}
                                </span>.
                            </p>

                            <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                                Если применимость подтверждена
                                только для отдельных вариантов,
                                выберите конкретные модификации.
                            </p>
                        </div>
                    ) : modifications.length === 0 ? (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                            <p className="text-xs leading-relaxed">
                                У этой модели пока нет модификаций.
                                Добавьте их в каталоге модели,
                                чтобы выбрать применимость.
                                Вариант «Все модификации» используйте
                                только при подтверждённой
                                применимости ко всей модели.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs text-[var(--text-muted)]">
                                    Выбрано:{' '}
                                    <span className="font-bold text-[var(--text)]">
                                        {selectedCount}
                                    </span>
                                    {' '}из {modifications.length}
                                </p>

                                {selectedCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedModIds([])
                                        }
                                        className="text-xs text-[var(--text-muted)] transition hover:text-[var(--text)]"
                                    >
                                        Снять выбор
                                    </button>
                                )}
                            </div>

                            <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1">
                                {modifications.map(mod => {
                                    const selected =
                                        selectedModIds.includes(
                                            mod.id
                                        );

                                    const description = [
                                        mod.attributes?.engine,
                                        mod.attributes?.transmission,
                                        mod.attributes?.drivetrain
                                    ]
                                        .filter(Boolean)
                                        .join(' · ');

                                    return (
                                        <label
                                            key={mod.id}
                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                                selected
                                                    ? 'border-blue-500/30 bg-blue-500/5'
                                                    : 'border-[var(--border)]/40 hover:bg-[var(--bg-elevated)]'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() =>
                                                    toggleMod(mod.id)
                                                }
                                                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-500"
                                            />

                                            <div className="min-w-0">
                                                <p className="break-words text-sm font-bold leading-tight text-[var(--text)]">
                                                    {mod.name}
                                                </p>

                                                {description && (
                                                    <p className="mt-1 break-words text-[11px] leading-relaxed text-[var(--text-muted)]">
                                                        {description}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            {selectedCount === 0 && (
                                <p className="text-xs text-amber-500">
                                    Выберите хотя бы одну модификацию.
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}