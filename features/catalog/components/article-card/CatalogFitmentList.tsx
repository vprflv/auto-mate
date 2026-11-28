'use client';

import { compareCatalogModificationAttributes } from '@/features/catalog/lib/sortCatalogModifications';
import { Dialog } from 'radix-ui';
import type { CatalogFitment } from '@/types/catalog/catalog';
import { PartInstallationBadge } from '@/features/garage/components/PartInstallationBadge';
import { installationKey } from '@/features/catalog/lib/partInstallations';

const PREVIEW_LIMIT = 4;

type ModelFitments = {
    id: string;
    name: string;
    modifications: CatalogFitment[];
};

function ModelList({ models }: { models: ModelFitments[] }) {
    return (
        <ul className="space-y-2 text-xs text-[var(--text-muted)]">
            {models.map(model => (
                <li key={model.id} className="border-l border-[var(--border)] pl-3">
                    <details>
                        <summary className="cursor-pointer font-medium text-[var(--text)]">
                            {model.name}
                        </summary>
                        <ul className="mt-2 space-y-2 pl-3">
                            {model.modifications.map(item => (
                                <li key={item.modificationId}>
                                    <p>{item.modification}</p>
                                    {item.description && <p className="mt-0.5 text-[11px]">{item.description}</p>}
                                    {item.installations?.map(position => (
                                        <PartInstallationBadge key={installationKey(position)} value={position} />
                                    ))}
                                </li>
                            ))}
                        </ul>
                    </details>
                </li>
            ))}
        </ul>
    );
}

export function CatalogFitmentList({ items }: { items: CatalogFitment[] }) {
    const byModel = new Map<string, ModelFitments>();
    for (const item of items) {
        const id = JSON.stringify([item.brandSlug, item.modelSlug]);
        const model = byModel.get(id) ?? {
            id,
            name: `${item.make} ${item.model}`,
            modifications: [],
        };
        model.modifications.push(item);
        byModel.set(id, model);
    }
    const models = [...byModel.values()];
    for (const model of models) model.modifications.sort(compareCatalogModificationAttributes);

    if (models.length === 0) {
        return <p className="text-xs text-[var(--text-muted)]">Подтверждённая применимость не указана.</p>;
    }

    return (
        <div className="space-y-3">
            <ModelList models={models.slice(0, PREVIEW_LIMIT)} />
            {models.length > PREVIEW_LIMIT && (
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <button type="button" className="text-xs font-semibold text-[var(--link)] hover:underline">
                            Посмотреть все ({models.length})
                        </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm" />
                        <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] max-h-[85vh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--text)] shadow-xl sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                                <Dialog.Title className="text-lg font-bold">Применимость запчасти</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs">
                                        Закрыть
                                    </button>
                                </Dialog.Close>
                            </div>
                            <Dialog.Description className="text-sm text-[var(--text-muted)]">
                                Нажмите на модель, чтобы увидеть подходящие модификации.
                            </Dialog.Description>
                            <ModelList models={models} />
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
        </div>
    );
}
