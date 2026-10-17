'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

import { initialModelNodes } from './data/mockModelCatalog';
import { AssemblyNode, PartItem } from './types';
import { CatalogHeader } from './components/CatalogHeader';
import { EngineSelector } from './components/EngineSelector';
import { PartItemRow } from './components/PartItemRow';
import { EditPartScoreModal } from './components/EditPartScoreModal';
import { systemStore } from '@/features/admin/lib/systemStore';
import { normalizeSlug } from '@/features/admin/lib/system-store/utils';
import {ADMIN_CATALOG_CATEGORIES} from "@/features/admin/catalog-inbox/lib/partInboxUtils";


export default function AdminModelCatalogPage() {
    const params = useParams();
    const rawBrand = decodeURIComponent((params?.brand as string) ?? 'skoda');
    const rawModel = decodeURIComponent((params?.model as string) ?? 'octavia-a7');

    const brandSlug = normalizeSlug(rawBrand);
    const modelSlug = normalizeSlug(rawModel);

    const [nodes, setNodes] = React.useState<AssemblyNode[]>([]);
    const [selectedEngine, setSelectedEngine] = React.useState('all');
    const [selectedCategory, setSelectedCategory] = React.useState('service');

    const [editingState, setEditingState] = React.useState<{
        nodeId: string;
        item: PartItem;
    } | null>(null);

    const loadModelNodes = React.useCallback(() => {
        const state = systemStore.getState();
        const matched = state.catalogNodes
            .filter(
                (n) =>
                    normalizeSlug(n.brandSlug) === brandSlug &&
                    normalizeSlug(n.modelSlug) === modelSlug
            )
            .map((n) => ({
                id: n.id,
                title: n.title,
                category: n.category,
                engineCompatibility: n.engineCompatibility,
                items: n.items,
            }));

        let finalNodes = matched;

        if (brandSlug === 'skoda' && modelSlug === 'octavia-a7') {
            const merged = [...matched];
            initialModelNodes.forEach((initNode) => {
                if (!merged.some((m) => m.id === initNode.id || m.title === initNode.title)) {
                    merged.push(initNode);
                }
            });
            finalNodes = merged;
        }

        setNodes(finalNodes);

        // Если в текущей выбранной вкладке пусто, а в другой есть детали — переключаемся на непустую
        setSelectedCategory((prevCat) => {
            const hasInCurrent = finalNodes.some((n) => n.category === prevCat && n.items.length > 0);
            if (hasInCurrent) return prevCat;
            const firstNonEmpty = finalNodes.find((n) => n.items.length > 0);
            return firstNonEmpty ? firstNonEmpty.category : prevCat;
        });
    }, [brandSlug, modelSlug]);

    React.useEffect(() => {
        loadModelNodes();

        const onLocalUpdate = () => loadModelNodes();
        window.addEventListener('system-store-updated', onLocalUpdate);

        const onStorageUpdate = (e: StorageEvent) => {
            if (e.key === 'bm_shared_system_state_v1') {
                loadModelNodes();
            }
        };
        window.addEventListener('storage', onStorageUpdate);

        return () => {
            window.removeEventListener('system-store-updated', onLocalUpdate);
            window.removeEventListener('storage', onStorageUpdate);
        };
    }, [loadModelNodes]);

    // Формируем список всех вкладок: стандартные + любые кастомные категории админа
    const categoryTabs = React.useMemo(() => {
        const map = new Map<string, string>();
        ADMIN_CATALOG_CATEGORIES.forEach((c) => map.set(c.id, c.label));

        nodes.forEach((n) => {
            if (n.category && !map.has(n.category)) {
                map.set(n.category, n.category.charAt(0).toUpperCase() + n.category.slice(1));
            }
        });

        return Array.from(map.entries()).map(([id, label]) => {
            const count = nodes
                .filter((n) => n.category === id)
                .reduce((acc, n) => acc + n.items.length, 0);
            return { id, label, count };
        });
    }, [nodes]);

    const formatTitle = (slug: string) =>
        slug
            .split('-')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');

    const handleSavePart = (updated: { score: number; isVerified: boolean; note?: string }) => {
        if (!editingState) return;

        systemStore.updateCatalogPart({
            nodeId: editingState.nodeId,
            partId: editingState.item.id,
            score: updated.score,
            isVerified: updated.isVerified,
            note: updated.note,
        });

        setEditingState(null);
    };

    const visibleNodes = nodes.filter((node) => {
        if (node.items.length === 0) return false;
        if (node.category !== selectedCategory) return false;
        if (selectedEngine === 'all') return true;
        return (
            node.engineCompatibility.includes(selectedEngine) ||
            node.engineCompatibility.includes('all')
        );
    });

    return (
        <div className="space-y-6">
            <CatalogHeader
                brandTitle={formatTitle(brandSlug)}
                modelTitle={formatTitle(modelSlug)}
            />

            <EngineSelector
                selectedEngine={selectedEngine}
                onSelectEngine={setSelectedEngine}
            />

            {/* Умные вкладки категорий со счётчиком деталей */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
                {categoryTabs.map((tab) => {
                    const isActive = selectedCategory === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedCategory(tab.id)}
                            className={[
                                'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition',
                                isActive
                                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-2xs'
                                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            <span>{tab.label}</span>
                            {tab.count > 0 && (
                                <span
                                    className={[
                                        'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                                        isActive
                                            ? 'bg-black/20 text-white'
                                            : 'bg-[var(--card)] text-[var(--text)]',
                                    ].join(' ')}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6">
                {visibleNodes.length > 0 ? (
                    visibleNodes.map((node) => (
                        <section
                            key={node.id}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
                        >
                            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/40 px-5 py-3.5">
                                <h3 className="font-semibold text-base text-[var(--text)]">
                                    {node.title}
                                </h3>
                                <span className="text-xs text-[var(--text-dim)] font-medium">
                                    {node.items.length} вар. в базе
                                </span>
                            </div>

                            <div className="divide-y divide-[var(--border)]/40">
                                {node.items.map((item) => (
                                    <PartItemRow
                                        key={item.id}
                                        item={item}
                                        onEdit={() => setEditingState({ nodeId: node.id, item })}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
                        <p className="text-sm font-medium text-[var(--text)]">
                            Для выбранной категории пока нет верифицированных деталей
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-dim)]">
                            Новые детали поступают из записей ТО и гаражей пользователей через модерацию входящих
                        </p>
                    </div>
                )}
            </div>

            {editingState && (
                <EditPartScoreModal
                    item={editingState.item}
                    onClose={() => setEditingState(null)}
                    onSave={handleSavePart}
                />
            )}
        </div>
    );
}