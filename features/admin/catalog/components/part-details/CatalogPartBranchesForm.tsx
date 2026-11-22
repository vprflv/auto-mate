'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { CatalogBranch } from '@/types';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import type { StoredCatalogNode, StoredPartItem } from '@/features/admin/lib/system-store/types';
import { catalogBranchKey, catalogBranchLabel, catalogBranchReference, getCatalogPartPlacements } from '@/features/admin/lib/system-store/catalogBranches';
import { getFluidAnalogFamily } from '@/features/admin/lib/system-store/fluidAnalogFamily';
import { setCatalogPartBranches } from '@/features/admin/lib/system-store/actions/setCatalogPartBranches';
import { storage } from '@/features/admin/lib/system-store/storage';
import { CatalogBranchesPicker } from '../CatalogBranchesPicker';
import { useCatalogBranchDraft } from '../../hooks/useCatalogBranchDraft';
import { FluidBranchPreview } from '../FluidBranchPreview';

export function CatalogPartBranchesForm({ node, part, onSaved }: {
    node: StoredCatalogNode;
    part: StoredPartItem;
    onSaved: (sourceRemoved: boolean) => void;
}) {
    const [catalogNodes, setCatalogNodes] = useState(() => storage.getState().catalogNodes);
    const placements = getCatalogPartPlacements(catalogNodes, node, part);
    const original = placements.map(({ node }) => catalogBranchReference(node));
    const [value, setValue] = useState<CatalogBranch[]>(original);
    const section = getCatalogSection(node.category);
    const selection = useCatalogBranchDraft(section, value);
    const [showValidation, setShowValidation] = useState(false);
    const initialKeys = new Set(original.map(catalogBranchKey));
    const selected = new Set(selection.branches.map(catalogBranchKey));
    const dirty = selected.size !== initialKeys.size || selection.branches.some(branch => !initialKeys.has(catalogBranchKey(branch)));
    const newBranches = selection.branches.filter(branch => !initialKeys.has(catalogBranchKey(branch)));
    const removed = placements.flatMap(({ node, part }) => {
        if (selected.has(catalogBranchKey(node)) || section !== 'fluids') return [];
        const family = getFluidAnalogFamily(catalogNodes, node, part);
        const localIds = new Set(node.items.map(item => item.id));
        const analogs = family.members.filter(item => item.id !== part.id && localIds.has(item.id));
        return analogs.length ? [{ node, analogs }] : [];
    });

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (selection.validationMessage) {
            setShowValidation(true);
            return;
        }
        try {
            setCatalogPartBranches(node.id, part.id, selection.branches, [...initialKeys]);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Не удалось сохранить ветки.');
            return;
        }
        setCatalogNodes(storage.getState().catalogNodes);
        setValue(selection.branches);
        selection.setDraft(null);
        setShowValidation(false);
        toast.success('Ветки сохранены');
        onSaved(!selected.has(catalogBranchKey(node)));
    }

    return (
        <form className="space-y-3" onSubmit={save}>
            <CatalogBranchesPicker section={section} value={value} onChange={setValue}
                draft={selection.draft} setDraft={selection.setDraft} pendingBranch={selection.pendingBranch}
                validationMessage={showValidation ? selection.validationMessage : undefined} />
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
                    Из ветки «{catalogBranchLabel(node)}» также уйдут {analogs.map(item => `${item.name} (${item.article})`).join(', ')}.
                </p>
            ))}
            <button type="submit" disabled={!dirty && !selection.validationMessage}
                className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] disabled:opacity-50">
                Сохранить ветки
            </button>
        </form>
    );
}
