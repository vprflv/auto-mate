'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { CatalogBranch } from '@/types';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import type { StoredCatalogNode, StoredPartItem } from '@/features/admin/lib/system-store/types';
import { catalogBranchKey, getCatalogPartPlacements } from '@/features/admin/lib/system-store/catalogBranches';
import { getFluidAnalogFamily } from '@/features/admin/lib/system-store/fluidAnalogFamily';
import { setCatalogPartBranches } from '@/features/admin/lib/system-store/actions/setCatalogPartBranches';
import { storage } from '@/features/admin/lib/system-store/storage';
import { CatalogBranchesPicker } from '../CatalogBranchesPicker';
import { FluidBranchPreview } from '../FluidBranchPreview';

export function CatalogPartBranchesForm({ node, part, onSaved }: {
    node: StoredCatalogNode;
    part: StoredPartItem;
    onSaved: (sourceRemoved: boolean) => void;
}) {
    const [catalogNodes, setCatalogNodes] = useState(() => storage.getState().catalogNodes);
    const placements = getCatalogPartPlacements(catalogNodes, node, part);
    const original = placements.map(({ node }) => ({ category: node.category, title: node.title }));
    const [value, setValue] = useState<CatalogBranch[]>(original);
    const section = getCatalogSection(node.category);
    const initialKeys = new Set(original.map(catalogBranchKey));
    const selected = new Set(value.map(catalogBranchKey));
    const dirty = selected.size !== initialKeys.size || value.some(branch => !initialKeys.has(catalogBranchKey(branch)));
    const newBranches = value.filter(branch => !initialKeys.has(catalogBranchKey(branch)));
    const removed = placements.flatMap(({ node, part }) => {
        if (selected.has(catalogBranchKey(node)) || section !== 'fluids') return [];
        const family = getFluidAnalogFamily(catalogNodes, node, part);
        const localIds = new Set(node.items.map(item => item.id));
        const analogs = family.members.filter(item => item.id !== part.id && localIds.has(item.id));
        return analogs.length ? [{ node, analogs }] : [];
    });

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            setCatalogPartBranches(node.id, part.id, value, [...initialKeys]);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Не удалось сохранить ветки.');
            return;
        }
        setCatalogNodes(storage.getState().catalogNodes);
        toast.success('Ветки сохранены');
        onSaved(!selected.has(catalogBranchKey(node)));
    }

    return (
        <form className="space-y-3" onSubmit={save}>
            <CatalogBranchesPicker section={section} value={value} onChange={setValue} />
            {newBranches.length > 0 && (
                <p className="text-xs text-[var(--text-muted)]">
                    Для новых веток используется применимость текущей ветки. Её можно уточнить в каждой ветке.
                </p>
            )}
            {section === 'fluids' && (
                <FluidBranchPreview model={node} branches={newBranches} catalogNodes={catalogNodes}
                    part={part} modificationIds={part.compatibleModifications ?? []} />
            )}
            {removed.map(({ node, analogs }) => (
                <p key={node.id} className="text-xs text-[var(--text-muted)]">
                    Из ветки «{node.title}» также уйдут {analogs.map(item => `${item.name} (${item.article})`).join(', ')}.
                </p>
            ))}
            <button type="submit" disabled={!dirty || !value.length}
                className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] disabled:opacity-50">
                Сохранить ветки
            </button>
        </form>
    );
}
