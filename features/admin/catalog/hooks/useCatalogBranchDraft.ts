import { useMemo, useState } from 'react';
import type { CatalogBranch } from '@/types';
import type { CatalogSection } from '@/types/catalog/catalog';
import { resolveCatalogBranch } from '@/features/admin/lib/system-store/actions/createCatalogBranch';
import { catalogBranchKey } from '@/features/admin/lib/system-store/catalogBranches';
import { storage } from '@/features/admin/lib/system-store/storage';
import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';

export function useCatalogBranchDraft(section: CatalogSection, selected: CatalogBranch[]) {
    const [draft, setDraft] = useState<CatalogBranch | null>(null);

    const pending = useMemo((): { branch?: CatalogBranch; error?: string } => {
        if (!draft || (!draft.category.trim() && !draft.title.trim() && !draft.assembly?.trim())) return {};

        const category = section === 'fluids' ? FLUID_CATALOG_CATEGORY : draft.category;
        if (!category.trim() || !draft.title.trim()) {
            return { error: 'Укажите категорию и подкатегорию для новой ветки.' };
        }

        try {
            return { branch: resolveCatalogBranch(storage.getState(), section, { ...draft, category }) };
        } catch (error) {
            return { error: error instanceof Error ? error.message : 'Не удалось выбрать новую ветку.' };
        }
    }, [draft, section]);

    const branch = pending.branch;
    const branches = branch && !selected.some(item => catalogBranchKey(item) === catalogBranchKey(branch))
        ? [...selected, branch]
        : selected;
    const validationMessage = pending.error ??
        (branches.length === 0 ? 'Отметьте существующую ветку или заполните новую.' : undefined);

    return { branches, validationMessage, draft, setDraft, pendingBranch: branch };
}
