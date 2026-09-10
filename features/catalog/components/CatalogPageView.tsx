'use client';

import CatalogTree from '@/features/catalog/components/CatalogTree';
import CatalogHeader from './CatalogHeader';
import CatalogArticlesHeader from './CatalogArticlesHeader';
import CatalogEmpty from './CatalogEmpty';
import CatalogArticleCard from './CatalogArticleCard';
import { useCatalogPage } from '@/features/catalog/hooks/useCatalogPage';

export default function CatalogPageView({ carId }: { carId: string }) {
    const {
        car,
        catalog,
        isLoading,
        isFetching,
        refresh,
        search,
        setSearch,
        selectedNodeId,
        setSelectedNodeId,
        filteredArticles,
        selectedNodeName,
        isAlreadyAdded,
        addToPersonal,
        removeFromPersonal,
    } = useCatalogPage(carId);

    if (!car) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#A3A3A3]">
                Машина не найдена
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#A3A3A3]">
                Загружаем каталог...
            </div>
        );
    }

    if (!catalog) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#A3A3A3]">
                Не удалось загрузить каталог
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
            <CatalogHeader
                car={car}
                search={search}
                onSearch={setSearch}
                onRefresh={refresh}
                isFetching={isFetching}
                showDisclaimer={catalog.source === 'ai' || catalog.source === 'mock'}
            />

            <div className="flex flex-col md:flex-row">
                <aside className="md:w-72 bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-[#2A2A2A] p-4 overflow-y-auto max-h-[40vh] md:max-h-none">
                    <p className="text-xs text-[#666666] mb-3 uppercase tracking-wider">
                        Разделы
                    </p>
                    <CatalogTree
                        nodes={catalog.nodes}
                        selectedNodeId={selectedNodeId}
                        onSelect={setSelectedNodeId}
                    />
                </aside>

                <main className="flex-1 p-4 md:p-6">
                    <CatalogArticlesHeader
                        title={selectedNodeName || 'Все запчасти'}
                        count={filteredArticles.length}
                    />

                    {filteredArticles.length === 0 ? (
                        <CatalogEmpty
                            search={search}
                            onClear={search ? () => setSearch('') : undefined}
                        />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredArticles.map((art) => (
                                <CatalogArticleCard
                                    key={art.id}
                                    carId={carId}
                                    article={art}
                                    alreadyAdded={isAlreadyAdded(art.oem)}
                                    onAdd={() => addToPersonal(art)}
                                    onRemove={() => removeFromPersonal(art)}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}