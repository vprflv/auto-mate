'use client';

import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { mergeCatalogModifications, previewModificationMerge } from '@/features/admin/lib/system-store/actions/mergeModifications';
import type { CatalogModification, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { sortCatalogModifications } from '@/features/catalog/lib/sortCatalogModifications';

type Props = {
    model: StoredMasterModel;
    source: CatalogModification;
    targetIds?: string[];
    onClose: () => void;
    onMerged: (targetId: string) => void;
};

export function MergeModificationModal({ model, source, targetIds, onClose, onMerged }: Props) {
    const [targetId, setTargetId] = useState('');
    const [preview, setPreview] = useState<ReturnType<typeof previewModificationMerge>>();
    const [error, setError] = useState('');
    const targets = sortCatalogModifications((model.modifications ?? []).filter(item => item.id !== source.id && (!targetIds || targetIds.includes(item.id))));
    const mergeInput = (id: string) => ({
        brandSlug: model.brandSlug, modelSlug: model.modelSlug, sourceId: source.id, targetId: id,
    });

    function chooseTarget(id: string) {
        setTargetId(id);
        setPreview(undefined);
        setError('');
        if (!id) return;
        try {
            setPreview(previewModificationMerge(mergeInput(id)));
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Не удалось подготовить объединение.');
        }
    }

    function confirm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!preview) return;
        try {
            mergeCatalogModifications(mergeInput(targetId), preview.revision);
            toast.success('Модификации объединены');
            onMerged(targetId);
        } catch (error) {
            setPreview(undefined);
            setError(error instanceof Error ? error.message : 'Не удалось объединить модификации.');
        }
    }

    return (
        <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] flex max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-2xl">
                    <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
                        <div>
                            <Dialog.Title className="text-lg font-bold">Объединить модификации</Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-[var(--text-muted)]">
                                Выберите основную карточку, в которую перенести данные из «{source.name}». После объединения карточка‑дубликат будет удалена.
                            </Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                            <button type="button" aria-label="Закрыть" className="shrink-0 rounded-lg p-2 hover:bg-[var(--bg-elevated)]">
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </Dialog.Close>
                    </header>
                    <form onSubmit={confirm} className="flex min-h-0 flex-col">
                        <div className="space-y-4 overflow-y-auto p-5">
                            <label className="block space-y-2 text-sm font-medium">
                                <span>Основная модификация</span>
                                <select value={targetId} onChange={event => chooseTarget(event.target.value)}
                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                                    <option value="">Выберите модификацию</option>
                                    {targets.map(item => <option key={item.id} value={item.id}>
                                        {[item.name, formatTransmission(item.attributes?.transmission)].filter(Boolean).join(' · ')}
                                    </option>)}
                                </select>
                            </label>

                            {preview && (
                                <div className="space-y-3 rounded-xl border border-[var(--border)] p-3 text-sm">
                                    <p>Основная карточка · <strong>{preview.target.name}</strong></p>
                                    <p>КПП · {formatTransmission(preview.target.attributes.transmission) || '—'}</p>
                                    <details open>
                                        <summary className="cursor-pointer font-medium">
                                            Новые VIN-правила в основной карточке: {preview.addedVinRules.length}
                                        </summary>
                                        <ul className="mt-1 space-y-1 break-all pl-4 font-mono text-xs">
                                            {preview.addedVinRules.map(mask => <li key={mask}>{mask}</li>)}
                                        </ul>
                                    </details>
                                    {preview.addedVinExceptions.length > 0 && (
                                        <details>
                                            <summary className="cursor-pointer font-medium">Исключения по полному VIN: {preview.addedVinExceptions.length}</summary>
                                            <ul className="mt-1 space-y-1 break-all pl-4 font-mono text-xs">
                                                {preview.addedVinExceptions.map(vin => <li key={vin}>{vin}</li>)}
                                            </ul>
                                        </details>
                                    )}
                                    <details>
                                        <summary className="cursor-pointer font-medium">Привязки запчастей и жидкостей: {preview.parts.length}</summary>
                                        <ul className="mt-1 space-y-1 pl-4 text-xs">
                                            {preview.parts.map(({ node, part }) => <li key={JSON.stringify([node.id, part.id])}>
                                                {node.title} · {part.name} · {part.brand} {part.article}
                                            </li>)}
                                        </ul>
                                    </details>
                                    <details>
                                        <summary className="cursor-pointer font-medium">Автомобили, которые перейдут в основную карточку: {preview.cars.length}</summary>
                                        <ul className="mt-1 space-y-1 pl-4 text-xs">
                                            {preview.cars.map(car => <li key={car.id}>{car.nickname || `${car.make} ${car.model}`} · {car.year} · {car.vin}</li>)}
                                        </ul>
                                    </details>
                                    <p className="text-xs text-[var(--text-muted)]">Ветки каталога: {preview.branches.length}. Заявки: {preview.applications}.</p>
                                </div>
                            )}

                            {error && (
                                <div className="space-y-2">
                                    <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>
                                    {targetId && <button type="button" onClick={() => chooseTarget(targetId)}
                                        className="text-sm text-[var(--link)] hover:underline">Обновить предпросмотр</button>}
                                </div>
                            )}
                        </div>
                        <footer className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] p-4">
                            <Dialog.Close asChild>
                                <button type="button" className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">Отмена</button>
                            </Dialog.Close>
                            <button type="submit" disabled={!preview} className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] disabled:opacity-50">
                                Объединить
                            </button>
                        </footer>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
