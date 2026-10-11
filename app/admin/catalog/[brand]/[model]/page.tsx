'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

import { initialModelNodes, mockEngines, mockCategories } from './data/mockModelCatalog';
import { AssemblyNode, PartItem } from './types';
import { CatalogHeader } from './components/CatalogHeader';
import { EngineSelector } from './components/EngineSelector';
import { CategoryTabs } from './components/CategoryTabs';
import { PartItemRow } from './components/PartItemRow';
import { EditPartScoreModal } from './components/EditPartScoreModal';
import { systemStore } from '@/features/admin/lib/systemStore';

export default function AdminModelCatalogPage() {
    const params = useParams();
    const brandSlug = ((params?.brand as string) ?? 'skoda').toLowerCase();
    const modelSlug = ((params?.model as string) ?? 'octavia-a7').toLowerCase();

    const [nodes, setNodes] = React.useState<AssemblyNode[]>(initialModelNodes);
    const [selectedEngine, setSelectedEngine] = React.useState('all');
    const [selectedCategory, setSelectedCategory] = React.useState('service');

    const [editingState, setEditingState] = React.useState<{
        nodeId: string;
        item: PartItem;
    } | null>(null);

    const loadModelNodes = React.useCallback(() => {
        const state = systemStore.getState();
        // Находим сохраненные узлы для этой модели в глобальном сторе
        const matched = state.catalogNodes.filter(
            (n) => n.brandSlug === brandSlug && n.modelSlug === modelSlug
        );

        if (matched.length > 0) {
            setNodes(
                matched.map((n) => ({
                    id: n.id,
                    title: n.title,
                    category: n.category,
                    engineCompatibility: n.engineCompatibility,
                    items: n.items,
                }))
            );
        } else if (brandSlug === 'skoda' && modelSlug === 'octavia-a7') {
            setNodes(initialModelNodes);
        } else {
            // Если новая модель, формируем пустые базовые секции
            setNodes([
                {
                    id: `${brandSlug}-${modelSlug}-service-default`,
                    title: 'Регламентные расходники ТО',
                    category: 'service',
                    engineCompatibility: ['all'],
                    items: [],
                },
            ]);
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

    const formatBrandTitle = (slug: string) =>
        slug.charAt(0).toUpperCase() + slug.slice(1);

    const formatModelTitle = (slug: string) =>
        slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

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
        if (node.category !== selectedCategory) return false;
        if (selectedEngine === 'all') return true;
        return node.engineCompatibility.includes(selectedEngine) || node.engineCompatibility.includes('all');
    });

    return (
        <div className="space-y-6">
            <CatalogHeader
                brandTitle={formatBrandTitle(brandSlug)}
                modelTitle={formatModelTitle(modelSlug)}
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
                {visibleNodes.length > 0 && visibleNodes.some((n) => n.items.length > 0) ? (
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