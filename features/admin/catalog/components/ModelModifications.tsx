'use client';

import * as React from 'react';
import Link from 'next/link';
import { GitBranch, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { deleteCatalogModification, getModificationPartLinks } from '@/features/admin/lib/system-store/actions/modifications';

import type { CatalogModification, StoredMasterModel } from '@/features/admin/lib/system-store/types';

import { AddModificationModal } from './AddModificationModal';
import { sortModificationsByTrim } from '@/features/catalog/lib/sortModificationsByTrim';

interface Props {
    model: StoredMasterModel;
    selectedModificationIds: string[];
    isPending: boolean;
    onSelectModification: (id: string, checked: boolean) => void;
    onReset: () => void;
}

const attributeLabels: Record<string, string> = {
    year: 'Год начала выпуска',
    yearEnd: 'Год окончания выпуска',
    bodyCode: 'Номер кузова',
    bodyClass: 'Тип кузова',
    fuel: 'Тип топлива',
    displacementL: 'Объём двигателя, л',
    trim: 'Комплектация',
    engine: 'Двигатель',
    transmission: 'КПП',
    drivetrain: 'Привод'
};

export function ModelModifications({ model, selectedModificationIds, isPending, onSelectModification, onReset }: Props) {
    const modelPath = `/admin/catalog/${encodeURIComponent(model.brandSlug)}/${encodeURIComponent(model.modelSlug)}`;
    const partsPath = (id: string) => `${modelPath}?pickPartsFor=${encodeURIComponent(id)}`;
    const [editingModification, setEditingModification] = React.useState<CatalogModification | null>(null);
    const [links, setLinks] = React.useState<ReturnType<typeof getModificationPartLinks>>([]);
    const [destinations, setDestinations] = React.useState(new Map<string, string | null>());

    const modifications = sortModificationsByTrim(model.modifications ?? []);

    function handleDelete(modificationId: string): boolean {
        try {
            deleteCatalogModification({
                brandSlug: model.brandSlug,
                modelSlug: model.modelSlug,
                modificationId,
                destinations,
            });
            toast.success('Модификация удалена');
            return true;
        } catch (error: unknown) {
            setLinks(getModificationPartLinks(model, modificationId));
            toast.error(error instanceof Error ? error.message : 'Не удалось удалить модификацию.');
            return false;
        }
    }

    return (
        <section className="space-y-4 rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-[var(--link)]" />

                    <h2 className="text-lg font-bold text-[var(--text)]">
                        Модификации модели
                    </h2>

                    {selectedModificationIds.length > 0 && (
                        <button type="button" disabled={isPending} onClick={onReset} className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--link)] hover:bg-[var(--bg-elevated)]">
                            Сбросить
                        </button>
                    )}

                    <span className="rounded-lg bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-bold text-[var(--text-muted)]">
                        {modifications.length}
                    </span>
                </div>

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
                        const selected = selectedModificationIds.includes(modification.id);
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
                                className={`space-y-3 rounded-2xl border p-4 transition-colors ${selected
                                    ? 'border-[var(--link)] bg-[var(--link)]/10'
                                    : 'border-[var(--border)]/40 bg-[var(--bg-elevated)]/30'}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="min-w-0 break-words text-sm font-bold text-[var(--text)]">
                                        {modification.name}
                                    </h3>
                                    <div className="flex flex-wrap justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setEditingModification(modification)}
                                        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--link)] hover:bg-[var(--bg-elevated)]"
                                        aria-label={`Редактировать модификацию ${modification.name}`}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Редактировать
                                    </button>
                                    <ConfirmDeleteDialog
                                        title={`Удалить модификацию «${modification.name}»?`}
                                        description="Выберите, куда перенести запчасти, или снимите привязку к удаляемой модификации. Изменения сохранятся при удалении."
                                        onOpen={() => {
                                            setLinks(getModificationPartLinks(model, modification.id));
                                            setDestinations(new Map());
                                        }}
                                        content={links.length > 0 && (
                                            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                                                {links.map(({ node, part, key }) => (
                                                    <li key={key}>
                                                        <label className="block space-y-1 text-sm">
                                                            <span className="block font-semibold">{part.name} · {part.brand} {part.article}</span>
                                                            <span className="block text-xs text-[var(--text-muted)]">{node.title}</span>
                                                            <select
                                                                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                                                                value={destinations.has(key) ? destinations.get(key) ?? 'detach' : ''}
                                                                onChange={event => {
                                                                    const value = event.target.value;
                                                                    setDestinations(current => new Map(current).set(key, value === 'detach' ? null : value));
                                                                }}
                                                            >
                                                                <option value="" disabled>Выберите действие</option>
                                                                <option value="detach">Снять только эту привязку</option>
                                                                {modifications.filter(item => item.id !== modification.id).map(item => (
                                                                    <option key={item.id} value={item.id}>Перенести в {item.name}</option>
                                                                ))}
                                                            </select>
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        onConfirm={() => handleDelete(modification.id)}
                                    >
                                        <button
                                            type="button"
                                            aria-label={`Удалить модификацию ${modification.name}`}
                                            title="Удалить модификацию"
                                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </ConfirmDeleteDialog>
                                    </div>
                                </div>

                                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--text)]">
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        disabled={isPending}
                                        onChange={event => onSelectModification(modification.id, event.target.checked)}
                                        className="h-4 w-4 accent-[var(--link)]"
                                    />
                                    Применить для каталога
                                </label>

                                <Link href={partsPath(modification.id)} className="block w-fit text-xs font-semibold text-[var(--link)] hover:underline">
                                    Подобрать запчасти
                                </Link>

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

            {editingModification && (
                <AddModificationModal
                    key={`${model.brandSlug}:${model.modelSlug}:${editingModification.id}`}
                    model={model}
                    modification={editingModification}
                    onClose={() => setEditingModification(null)}
                />
            )}
        </section>
    );
}
