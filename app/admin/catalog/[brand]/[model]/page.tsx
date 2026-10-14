'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

import { initialModelNodes } from './data/mockModelCatalog';
import { AssemblyNode, PartItem } from './types';
import { CatalogHeader } from './components/CatalogHeader';
import { EngineSelector } from './components/EngineSelector';
import { CategoryTabs } from './components/CategoryTabs';
import { PartItemRow } from './components/PartItemRow';
import { EditPartScoreModal } from './components/EditPartScoreModal';
import { systemStore } from '@/features/admin/lib/systemStore';
import { normalizeSlug } from '@/features/admin/lib/system-store/utils';

export default function AdminModelCatalogPage() {
    const params = useParams();
    const rawBrand = decodeURIComponent((params?.brand as string) ?? 'skoda');
    const rawModel = decodeURIComponent((params?.model as string) ?? 'octavia-a7');

    const brandSlug = normalizeSlug(rawBrand);
    const modelSlug = normalizeSlug(rawModel);

    // Не подставляем initialModelNodes для чужих машин, чтобы не было "мигания" при перезагрузке
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

        if (brandSlug === 'skoda' && modelSlug === 'octavia-a7') {
            // Для Octavia A7 объединяем базовые моковые узлы и новые одобренные узлы
            const merged = [...matched];
            initialModelNodes.forEach((initNode) => {
                if (!merged.some((m) => m.id === initNode.id || m.title === initNode.title)) {
                    merged.push(initNode);
                }
            });
            setNodes(merged);
        } else {
            setNodes(matched);
        }
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

            <CategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

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
                            Новые детали поступают из записей ТО пользователей через модерацию входящих
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