'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { StoredCatalogNode } from '@/features/admin/lib/system-store/types';
import type { CatalogNode } from '@/types/catalog/catalog';
import { catalogBranchLabel, catalogSubcategoryKey } from '@/features/admin/lib/system-store/catalogBranches';
import { getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { renameCatalogSection } from '@/features/admin/lib/system-store/actions/renameCatalogSection';
import { getOemCrosses, getRelatedParts, uniqueRelatedProducts } from '@/features/admin/lib/system-store/oemCrosses';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { storage } from '@/features/admin/lib/system-store/storage';
import CatalogTree from '@/features/catalog/components/CatalogTree';
import CatalogArticlesHeader from '@/features/catalog/components/CatalogArticlesHeader';
import { CatalogPartCard } from './CatalogPartCard';
import { DeleteCatalogCategoryDialog } from './DeleteCatalogCategoryDialog';
import { PartDetailsModal } from './part-details/PartDetailsModal';

type Selection = {
    label: string;
    category: string;
    nodes: StoredCatalogNode[];
    branch?: StoredCatalogNode;
    rename: Parameters<typeof renameCatalogSection>[0];
};

export function ModelPartsCatalogList({ nodesByCategory, modelPath, currentQuery }: {
    nodesByCategory: Record<string, StoredCatalogNode[]>;
    modelPath: string;
    currentQuery: string;
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [opened, setOpened] = useState<{ nodeId: string; partId: string } | null>(null);
    const { catalogCategoryLabels: labels, catalogCategoryOrder, catalogNodes } = storage.getState();
    const categories = sortCatalogCategoryKeys(Object.keys(nodesByCategory), catalogCategoryOrder, labels);
    const selections = new Map<string, Selection>();
    const tree = categories.map((category): CatalogNode => {
        const nodes = nodesByCategory[category];
        const name = getCatalogCategoryLabel(category, labels);
        const id = `category:${category}`;
        selections.set(id, { label: name, category, nodes, rename: { category } });

        const groups = new Map<string, StoredCatalogNode[]>();
        for (const node of nodes) {
            const key = catalogSubcategoryKey(node);
            const members = groups.get(key) ?? [];
            members.push(node);
            groups.set(key, members);
        }

        const children = [...groups].map(([key, members]): CatalogNode => {
            const first = members[0];
            const subcategoryId = `subcategory:${key}`;
            const hasAssemblies = members.some(node => node.assembly);
            selections.set(subcategoryId, {
                label: first.title,
                category,
                nodes: members,
                branch: hasAssemblies ? undefined : first,
                rename: { nodeId: first.id },
            });
            return {
                id: subcategoryId,
                name: first.title,
                children: hasAssemblies ? members.map(node => {
                    const memberId = `branch:${node.id}`;
                    const label = node.assembly || 'Общие позиции';
                    selections.set(memberId, {
                        label, category, nodes: [node], branch: node,
                        rename: { nodeId: node.id, renameAssembly: Boolean(node.assembly) },
                    });
                    return { id: memberId, name: label };
                }) : undefined,
            };
        });
        return { id, name, children };
    });

    const allNodes = categories.flatMap(category => nodesByCategory[category]);
    const selectedTreeId = selectedId && selections.has(selectedId) ? selectedId : tree[0]?.children?.[0]?.id ?? null;
    const selection = selectedTreeId ? selections.get(selectedTreeId) : undefined;
    const query = search.trim().toLocaleLowerCase('ru');
    const articleQuery = normalizeArticle(query);
    const rows = (query ? allNodes : selection?.nodes ?? []).flatMap(node =>
        node.items.filter(part => !query ||
            [part.name, part.brand, catalogBranchLabel(node), getCatalogCategoryLabel(node.category, labels)]
                .some(value => value.toLocaleLowerCase('ru').includes(query)) ||
            (articleQuery !== '' && [part.article, ...getOemCrosses(part)]
                .some(number => normalizeArticle(number).includes(articleQuery)))
        ).map(part => ({ node, part }))
    );
    const modelParts = allNodes.flatMap(node => node.items);
    const openedNode = catalogNodes.find(node => node.id === opened?.nodeId);
    const openedPart = openedNode?.items.find(part => part.id === opened?.partId);
    const branch = selection?.branch;

    function rename(target: Selection) {
        const currentName = target.branch?.assembly ?? target.branch?.title ?? target.label;
        const nextName = window.prompt('Новое название для всех моделей', currentName);
        if (nextName === null) return;
        try {
            renameCatalogSection(target.rename, nextName);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Не удалось переименовать раздел.');
        }
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
            <div className="border-b border-[var(--border)] p-4">
                <input type="search" value={search} onChange={event => setSearch(event.target.value)}
                    aria-label="Поиск запчастей" placeholder="Поиск по названию, артикулу или разделу"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm" />
            </div>

            <div className="flex flex-col md:flex-row">
                <aside aria-label="Разделы каталога" className="max-h-[40vh] overflow-y-auto border-b border-[var(--border)] p-4 md:max-h-none md:w-64 md:shrink-0 md:border-b-0 md:border-r lg:w-72">
                    <p className="mb-3 text-xs uppercase tracking-wider text-[var(--text-dim)]">Разделы</p>
                    <CatalogTree nodes={tree} selectedNodeId={query ? null : selectedTreeId}
                        onSelect={id => { setSelectedId(id); setSearch(''); }} />
                </aside>

                <div className="min-w-0 flex-1 p-4 md:p-6">
                    <CatalogArticlesHeader title={query ? 'Результаты поиска' : selection?.label ?? 'Каталог запчастей'}
                        count={rows.length} />

                    {!query && selection && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <button type="button" aria-label="Переименовать раздел" title="Переименовать раздел"
                                onClick={() => rename(selection)} className="rounded-lg p-2 text-[var(--link)] hover:bg-[var(--bg-elevated)]">
                                <Pencil className="h-4 w-4" />
                            </button>
                            {(branch || 'category' in selection.rename) && (
                                <DeleteCatalogCategoryDialog category={selection.category}
                                    categoryLabel={getCatalogCategoryLabel(selection.category, labels)}
                                    branchTitle={branch?.title} branchAssembly={branch?.assembly} />
                            )}
                            {branch && (
                                <Link href={`${modelPath}/${encodeURIComponent(branch.id)}${currentQuery ? `?${currentQuery}` : ''}`}
                                    className="text-sm text-[var(--link)] hover:underline">Открыть ветку</Link>
                            )}
                        </div>
                    )}

                    {rows.length ? (
                        <ul className="space-y-2">
                            {rows.map(({ node, part }) => (
                                <li key={JSON.stringify([node.id, part.id])}>
                                    {(query || (selection?.nodes.length ?? 0) > 1) && (
                                        <p className="mb-1 px-1 text-xs text-[var(--text-muted)]">
                                            {getCatalogCategoryLabel(node.category, labels)} → {catalogBranchLabel(node)}
                                        </p>
                                    )}
                                    <CatalogPartCard part={part}
                                        analogsCount={part.isOem ? uniqueRelatedProducts(part,
                                            getRelatedParts(part, modelParts).filter(item => !item.isOem)).length : 0}
                                        onOpen={() => setOpened({ nodeId: node.id, partId: part.id })} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-[var(--text-muted)]">
                            {query ? 'По этому запросу ничего не найдено.' : 'В этом разделе пока нет подходящих запчастей.'}
                        </p>
                    )}
                </div>
            </div>

            <PartDetailsModal isOpen={Boolean(openedPart)} onClose={() => setOpened(null)}
                node={openedNode ?? null} part={openedPart ?? null} />
        </section>
    );
}
