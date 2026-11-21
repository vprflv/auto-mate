'use client';

import { useState } from 'react';
import type { CatalogBranch } from '@/types';
import type { CatalogSection } from '@/types/catalog/catalog';
import { FLUID_CATALOG_CATEGORY, getCatalogSection } from '@/features/catalog/lib/catalogSections';
import { storage } from '@/features/admin/lib/system-store/storage';
import { catalogBranchKey } from '@/features/admin/lib/system-store/catalogBranches';
import { getCatalogCategoryKeys, getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { NodeEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/NodeEditorBlock';

interface Props {
    section: CatalogSection;
    value: CatalogBranch[];
    onChange: (branches: CatalogBranch[]) => void;
}

export function CatalogBranchesPicker({ section, value, onChange }: Props) {
    const [{ catalogNodes, catalogCategoryLabels: labels, catalogCategoryOrder, hiddenCatalogCategories }] =
        useState(() => storage.getState());
    const [creating, setCreating] = useState(false);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');

    const fluid = section === 'fluids';
    const draftCategory = fluid ? FLUID_CATALOG_CATEGORY : category;
    const selected = new Set(value.map(catalogBranchKey));
    const options = new Map<string, CatalogBranch>();
    for (const branch of [...catalogNodes, ...value]) {
        if (getCatalogSection(branch.category) === section && (!hiddenCatalogCategories?.includes(branch.category) || selected.has(catalogBranchKey(branch)))) {
            options.set(catalogBranchKey(branch), { category: branch.category, title: branch.title });
        }
    }

    const categories = sortCatalogCategoryKeys([...new Set([...options.values()].map(branch => branch.category))], catalogCategoryOrder, labels);
    const availableCategories = getCatalogCategoryKeys(catalogNodes.map(node => node.category), hiddenCatalogCategories);

    function toggle(branch: CatalogBranch) {
        const key = catalogBranchKey(branch);
        onChange(selected.has(key) ? value.filter(item => catalogBranchKey(item) !== key) : [...value, branch]);
    }

    function addBranch() {
        const branch = { category: draftCategory.trim(), title: title.trim() };
        if (!branch.category || !branch.title) return;
        const key = catalogBranchKey(branch);
        if (!selected.has(key)) onChange([...value, options.get(key) ?? branch]);
        setCreating(false);
        setTitle('');
    }

    return (
        <fieldset className="min-w-0 space-y-3 rounded-2xl border border-[var(--border)] p-4">
            <legend className="px-1 text-sm font-semibold">Ветки каталога</legend>
            {categories.length ? (
                <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
                    {categories.map(key => (
                        <div key={key} role="group" aria-label={getCatalogCategoryLabel(key, labels)} className="space-y-1">
                            {!fluid && <p className="text-xs font-medium text-[var(--text-muted)]">{getCatalogCategoryLabel(key, labels)}</p>}
                            {[...options.values()].filter(branch => branch.category === key)
                                .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
                                .map(branch => (
                                    <label key={catalogBranchKey(branch)} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={selected.has(catalogBranchKey(branch))}
                                            onChange={() => toggle(branch)} />
                                        {branch.title}
                                    </label>
                                ))}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[var(--text-muted)]">Пока нет веток. Создайте первую ниже.</p>
            )}

            {creating ? (
                <div className="space-y-2">
                    <NodeEditorBlock section={section} nodeCategory={draftCategory} nodeTitle={title}
                        setNodeCategory={setCategory} setNodeTitle={setTitle} existingNodes={[]}
                        existingCategories={availableCategories} isCustomNode setIsCustomNode={() => {}} />
                    <div className="flex gap-3 text-sm">
                        <button type="button" disabled={!draftCategory.trim() || !title.trim()} onClick={addBranch}
                            className="font-medium text-[var(--link)] disabled:opacity-50">Добавить в список</button>
                        <button type="button" onClick={() => { setCreating(false); setTitle(''); }}>Отмена</button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={() => setCreating(true)} className="text-sm font-medium text-[var(--link)]">
                    + Новая ветка
                </button>
            )}
        </fieldset>
    );
}
