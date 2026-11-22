import { useId, useState } from 'react';
import { getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { storage } from '@/features/admin/lib/system-store/storage';
import type { CatalogSection } from '@/types/catalog/catalog';
import { FLUID_CATALOG_CATEGORY, getCatalogSection } from '@/features/catalog/lib/catalogSections';

const NEW_CATEGORY = '__NEW_CATEGORY__';
const fieldClass = 'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)]';

interface Props {
    section: CatalogSection;
    nodeCategory: string;
    setNodeCategory: (value: string) => void;
    assembly: string;
    setAssembly: (value: string) => void;
    nodeTitle: string;
    setNodeTitle: (value: string) => void;
    existingCategories: string[];
    existingSubcategories: string[];
    existingAssemblies: string[];
}

export function NodeEditorBlock({
    section, nodeCategory, setNodeCategory, assembly, setAssembly, nodeTitle, setNodeTitle,
    existingCategories, existingSubcategories, existingAssemblies,
}: Props) {
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const subcategoryOptionsId = useId();
    const assemblyOptionsId = useId();
    const [{ catalogCategoryLabels: labels, catalogCategoryOrder }] = useState(() => storage.getState());
    const isFluidSection = section === 'fluids';
    const categories = isFluidSection
        ? [FLUID_CATALOG_CATEGORY]
        : sortCatalogCategoryKeys(existingCategories, catalogCategoryOrder, labels)
            .filter(category => getCatalogSection(category) === section);
    const showCategoryInput = !categories.includes(nodeCategory) && (isCreatingCategory || Boolean(nodeCategory));

    return (
        <div className="mt-4 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 sm:grid-cols-3">
            <div className="space-y-2">
                <label className="grid gap-1 text-xs text-[var(--text-muted)]">
                    Категория
                    <select disabled={isFluidSection} value={showCategoryInput ? NEW_CATEGORY : nodeCategory}
                        className={fieldClass} onChange={event => {
                            const creating = event.target.value === NEW_CATEGORY;
                            setIsCreatingCategory(creating);
                            setNodeCategory(creating ? '' : event.target.value);
                            setNodeTitle('');
                        }}>
                        <option value="" disabled>Выберите категорию</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{getCatalogCategoryLabel(category, labels)}</option>
                        ))}
                        {!isFluidSection && <option value={NEW_CATEGORY}>＋ Создать категорию</option>}
                    </select>
                </label>
                {showCategoryInput && (
                    <input aria-label="Название новой категории" className={fieldClass} value={nodeCategory}
                        onChange={event => setNodeCategory(event.target.value)} placeholder="Например, Двигатель" />
                )}
            </div>
            <label className="grid content-start gap-1 text-xs text-[var(--text-muted)]">
                Подкатегория
                <input className={fieldClass} list={subcategoryOptionsId} value={nodeTitle}
                    onChange={event => setNodeTitle(event.target.value)} placeholder="Например, Прокладки" />
                <datalist id={subcategoryOptionsId}>
                    {existingSubcategories.map(item => <option key={item} value={item} />)}
                </datalist>
            </label>
            <label className="grid content-start gap-1 text-xs text-[var(--text-muted)]">
                Узел (необязательно)
                <input className={fieldClass} list={assemblyOptionsId} value={assembly}
                    onChange={event => setAssembly(event.target.value)} placeholder="Например, ГБЦ" />
                <datalist id={assemblyOptionsId}>
                    {existingAssemblies.map(item => <option key={item} value={item} />)}
                </datalist>
            </label>
        </div>
    );
}
