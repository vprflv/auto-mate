import * as React from 'react';
import { Settings2 } from 'lucide-react';
import { getCatalogCategoryKeys, getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { storage } from '@/features/admin/lib/system-store/storage';

const NEW_CATEGORY = '__NEW_CATEGORY__';
const NEW_NODE = '__CUSTOM__';

const fieldClassName =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]';

interface NodeEditorBlockProps {
    nodeCategory: string;
    setNodeCategory: (value: string) => void;
    nodeTitle: string;
    setNodeTitle: (value: string) => void;
    existingNodes: string[];
    isCustomNode: boolean;
    setIsCustomNode: (value: boolean) => void;
    existingCategories?: string[];
}

export function NodeEditorBlock({
                                    nodeCategory,
                                    setNodeCategory,
                                    nodeTitle,
                                    setNodeTitle,
                                    existingNodes,
                                    isCustomNode,
                                    setIsCustomNode,
                                    existingCategories = [],
                                }: NodeEditorBlockProps) {
    const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);
    const categoryId = React.useId();
    const nodeId = React.useId();

    const [{ catalogCategoryLabels: labels, catalogCategoryOrder, hiddenCatalogCategories }] = React.useState(() => storage.getState());
    const categories = sortCatalogCategoryKeys(getCatalogCategoryKeys(existingCategories, hiddenCatalogCategories), catalogCategoryOrder, labels);

    const isListedCategory =
        categories.includes(nodeCategory);

    const showCategoryInput =
        !isListedCategory && (isCreatingCategory || Boolean(nodeCategory));
    const showNodeInput = isCustomNode || existingNodes.length === 0;

    return (
        <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/40 p-5">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                <Settings2 className="h-3.5 w-3.5" />
                Дерево каталога
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor={categoryId} className="block text-xs text-[var(--text-muted)]">
                        Категория
                    </label>

                    <select
                        id={categoryId}
                        value={showCategoryInput ? NEW_CATEGORY : nodeCategory}
                        onChange={event => {
                            const category = event.target.value;
                            const creating = category === NEW_CATEGORY;

                            setIsCreatingCategory(creating);
                            setNodeCategory(creating ? '' : category);
                            setNodeTitle('');
                            setIsCustomNode(creating);
                        }}
                        className={fieldClassName}
                    >
                        <option value="" disabled>
                            Выберите категорию
                        </option>

                        {categories.map(category => (
                            <option key={category} value={category}>{getCatalogCategoryLabel(category, labels)}</option>
                        ))}
                        <option value={NEW_CATEGORY}>＋ Создать категорию</option>
                    </select>

                    {showCategoryInput && (
                        <input
                            aria-label="Название новой категории"
                            value={nodeCategory}
                            onChange={event => setNodeCategory(event.target.value)}
                            placeholder="Например, Система охлаждения"
                            className={fieldClassName}
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor={nodeId} className="block text-xs text-[var(--text-muted)]">
                        Подкатегория
                    </label>

                    <select
                        id={nodeId}
                        value={showNodeInput ? NEW_NODE : nodeTitle}
                        onChange={event => {
                            const title = event.target.value;
                            const creating = title === NEW_NODE;

                            setIsCustomNode(creating);
                            setNodeTitle(creating ? '' : title);
                        }}
                        className={fieldClassName}
                    >
                        <option value="" disabled>Выберите подкатегорию</option>
                        {existingNodes.map(title => (
                            <option key={title} value={title}>{title}</option>
                        ))}
                        <option value={NEW_NODE}>＋ Создать подкатегорию</option>
                    </select>

                    {showNodeInput && (
                        <input
                            aria-label="Название новой подкатегории"
                            value={nodeTitle}
                            onChange={event => setNodeTitle(event.target.value)}
                            placeholder="Например, Термостаты"
                            className={fieldClassName}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
