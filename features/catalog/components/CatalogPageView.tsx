'use client';

import CatalogTree from '@/features/catalog/components/CatalogTree';
import CatalogHeader from './CatalogHeader';
import CatalogArticlesHeader from './CatalogArticlesHeader';
import CatalogEmpty from './CatalogEmpty';
import CatalogArticleCard from './CatalogArticleCard';
import { useCatalogPage } from '@/features/catalog/hooks/useCatalogPage';

export default function CatalogPageView({
                                            carId,
                                        }: {
    carId: string;
}) {
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
            <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-muted)]">
                Машина не найдена
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-muted)]">
                Загружаем каталог...
            </div>
        );
    }

    if (!catalog) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-muted)]">
                Не удалось загрузить каталог
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <CatalogHeader
                car={car}
                search={search}
                onSearch={setSearch}
                onRefresh={refresh}
                isFetching={isFetching}
                showDisclaimer={
                    catalog.source === 'ai' ||
                    catalog.source === 'mock'
                }
            />

            <div className="flex flex-col md:flex-row">
                <aside className="max-h-[40vh] overflow-y-auto border-b border-[var(--border)] bg-[var(--bg)] p-4 md:max-h-none md:w-72 md:border-b-0 md:border-r">
                    <p className="mb-3 text-xs uppercase tracking-wider text-[var(--text-dim)]">
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
                        title={
                            selectedNodeName ||
                            'Все запчасти'
                        }
                        count={filteredArticles.length}
                    />

                    {filteredArticles.length === 0 ? (
                        <CatalogEmpty
                            search={search}
                            onClear={
                                search
                                    ? () => setSearch('')
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredArticles.map(
                                (art) => (
                                    <CatalogArticleCard
                                        key={art.id}
                                        carId={carId}
                                        article={art}
                                        alreadyAdded={isAlreadyAdded(
                                            art.oem
                                        )}
                                        onAdd={() =>
                                            addToPersonal(
                                                art
                                            )
                                        }
                                        onRemove={() =>
                                            removeFromPersonal(
                                                art
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}