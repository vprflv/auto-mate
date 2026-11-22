'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import type { CatalogBranch } from '@/types';
import type { CatalogSection } from '@/types/catalog/catalog';
import { FLUID_CATALOG_CATEGORY, getCatalogSection } from '@/features/catalog/lib/catalogSections';
import { storage } from '@/features/admin/lib/system-store/storage';
import { catalogBranchKey, catalogBranchLabel, getCatalogAssemblyNames, getCatalogBranches } from '@/features/admin/lib/system-store/catalogBranches';
import { getCatalogBranchTitles, getCatalogCategoryKeys, getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { createCatalogBranch } from '@/features/admin/lib/system-store/actions/createCatalogBranch';
import { NodeEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/NodeEditorBlock';

interface Props {
    section: CatalogSection;
    value: CatalogBranch[];
    onChange: (branches: CatalogBranch[]) => void;
    draft: CatalogBranch | null;
    setDraft: Dispatch<SetStateAction<CatalogBranch | null>>;
    pendingBranch?: CatalogBranch;
    validationMessage?: string;
}

export function CatalogBranchesPicker({ section, value, onChange, draft, setDraft, pendingBranch, validationMessage }: Props) {
    const [state, setState] = useState(() => storage.getState());
    const { catalogCategoryLabels: labels, catalogCategoryOrder, hiddenCatalogCategories } = state;
    const branches = getCatalogBranches(state);
    const { category = '', title = '', assembly = '' } = draft ?? {};
    const [error, setError] = useState('');

    const fluid = section === 'fluids';
    const draftCategory = fluid ? FLUID_CATALOG_CATEGORY : category;
    const selected = new Set(value.map(catalogBranchKey));
    const options = new Map<string, CatalogBranch>();
    for (const branch of [...branches, ...value]) {
        if (getCatalogSection(branch.category) === section && (!hiddenCatalogCategories?.includes(branch.category) || selected.has(catalogBranchKey(branch)))) {
            options.set(catalogBranchKey(branch), branch);
        }
    }

    const categories = sortCatalogCategoryKeys([...new Set([...options.values()].map(branch => branch.category))], catalogCategoryOrder, labels);
    const availableCategories = getCatalogCategoryKeys(branches, hiddenCatalogCategories);

    function toggle(branch: CatalogBranch) {
        const key = catalogBranchKey(branch);
        onChange(selected.has(key) ? value.filter(item => catalogBranchKey(item) !== key) : [...value, branch]);
    }

    function addBranch() {
        try {
            const branch = createCatalogBranch(section, { category: draftCategory, assembly, title });
            if (!selected.has(catalogBranchKey(branch))) onChange([...value, branch]);
            setState(storage.getState());
            setDraft(null);
            setError('');
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Не удалось сохранить ветку.');
        }
    }

    function updateDraft(patch: Partial<CatalogBranch>) {
        setDraft(current => ({ ...(current ?? { category: '', title: '' }), ...patch }));
        setError('');
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
                                .sort((a, b) => catalogBranchLabel(a).localeCompare(catalogBranchLabel(b), 'ru'))
                                .map(branch => (
                                    <label key={catalogBranchKey(branch)} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={selected.has(catalogBranchKey(branch))}
                                            onChange={() => toggle(branch)} />
                                        {catalogBranchLabel(branch)}
                                    </label>
                                ))}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[var(--text-muted)]">Пока нет веток. Создайте первую ниже.</p>
            )}

            {draft ? (
                <div className="space-y-2">
                    <NodeEditorBlock section={section} nodeCategory={draftCategory} nodeTitle={title}
                        assembly={assembly} setAssembly={value => updateDraft({ assembly: value })}
                        setNodeCategory={value => updateDraft({ category: value, assembly: '' })}
                        setNodeTitle={value => updateDraft({ title: value })}
                        existingSubcategories={getCatalogBranchTitles(branches, draftCategory)}
                        existingAssemblies={getCatalogAssemblyNames(branches, { category: draftCategory, title })}
                        existingCategories={availableCategories} />
                    {pendingBranch && (
                        <p className="text-xs text-[var(--text-muted)]">
                            «{catalogBranchLabel(pendingBranch)}» сохранится вместе с позицией.
                        </p>
                    )}
                    <div className="flex gap-3 text-sm">
                        <button type="button" disabled={!draftCategory.trim() || !title.trim()} onClick={addBranch}
                            className="font-medium text-[var(--link)] disabled:opacity-50">Сохранить ветку отдельно</button>
                        <button type="button" onClick={() => { setDraft(null); setError(''); }}>Отмена</button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={() => setDraft({ category: '', title: '' })} className="text-sm font-medium text-[var(--link)]">
                    + Новая ветка
                </button>
            )}
            {(error || validationMessage) && <p role="alert" className="text-sm text-red-500">{error || validationMessage}</p>}
        </fieldset>
    );
}
