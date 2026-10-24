'use client';

import * as React from 'react';
import { GitBranch, Plus } from 'lucide-react';

import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';

import { AddModificationModal } from './AddModificationModal';

interface Props {
    model: StoredMasterModel;
}

const attributeLabels: Record<string, string> = {
    trim: 'Комплектация',
    engine: 'Двигатель',
    transmission: 'КПП',
    drivetrain: 'Привод'
};

export function ModelModifications({ model }: Props) {
    const [isAddOpen, setIsAddOpen] = React.useState(false);

    const modifications = model.modifications ?? [];

    return (
        <section className="space-y-4 rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-[var(--link)]" />

                    <h2 className="text-lg font-bold text-[var(--text)]">
                        Модификации модели
                    </h2>

                    <span className="rounded-lg bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-bold text-[var(--text-muted)]">
                        {modifications.length}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600"
                >
                    <Plus className="h-4 w-4" />
                    Добавить модификацию
                </button>
            </div>

            {modifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)]/60 bg-[var(--bg-elevated)]/20 px-4 py-8 text-center">
                    <p className="text-sm font-bold text-[var(--text-muted)]">
                        Модификации пока не добавлены
                    </p>

                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">
                        Добавьте первую модификацию,
                        чтобы выбирать её при указании
                        применимости запчастей.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {modifications.map(modification => {
                        const attributes = Object.entries(
                            modification.attributes ?? {}
                        ).filter(
                            (entry): entry is [string, string] => {
                                const value = entry[1];

                                return (
                                    typeof value === 'string' &&
                                    value.trim().length > 0
                                );
                            }
                        );

                        return (
                            <div
                                key={modification.id}
                                className="space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4"
                            >
                                <h3 className="break-words text-sm font-bold text-[var(--text)]">
                                    {modification.name}
                                </h3>

                                {attributes.length > 0 ? (
                                    <dl className="space-y-1.5">
                                        {attributes.map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex flex-wrap gap-x-2 text-xs"
                                                >
                                                    <dt className="text-[var(--text-muted)]">
                                                        {attributeLabels[key] ??
                                                            key}
                                                        :
                                                    </dt>

                                                    <dd className="min-w-0 break-words font-medium text-[var(--text)]">
                                                        {value}
                                                    </dd>
                                                </div>
                                            )
                                        )}
                                    </dl>
                                ) : (
                                    <p className="text-xs text-[var(--text-dim)]">
                                        Характеристики не указаны
                                    </p>
                                )}

                                {modification.registeredCount > 0 && (
                                    <p className="border-t border-[var(--border)]/30 pt-2 text-[11px] text-[var(--text-muted)]">
                                        Автомобилей в гаражах:{' '}
                                        {modification.registeredCount}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isAddOpen && (
                <AddModificationModal
                    key={`${model.brandSlug}:${model.modelSlug}`}
                    model={model}
                    onClose={() => setIsAddOpen(false)}
                />
            )}
        </section>
    );
}