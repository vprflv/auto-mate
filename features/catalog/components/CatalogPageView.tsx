'use client';

import CatalogTree from '@/features/catalog/components/CatalogTree';
import CatalogHeader from './CatalogHeader';
import CatalogArticlesHeader from './CatalogArticlesHeader';
import CatalogEmpty from './CatalogEmpty';
import CatalogArticleCard from './CatalogArticleCard';
import { useCatalogPage } from '@/features/catalog/hooks/useCatalogPage';
import SaveToCatalogModal from "@/features/catalog/components/SaveToCatalogModal";
import Link from "next/link";

export default function CatalogPageView({
                                            carId,
                                        }: {
    carId: string;
}) {
    const {
        car,
        catalog,
        error,
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
        partToSave,
        closeSaveModal,
        finishSavingPart,
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

    if (catalog?.source === 'master-pending') {
        return (
            <div className="mx-auto max-w-xl space-y-4 p-6 text-[var(--text)]">
                <h1 className="text-2xl font-semibold">
                    ИИ-каталог пока недоступен
                </h1>

                <p className="text-[var(--text-muted)]">
                    Модификация автомобиля ожидает проверки.
                    После подтверждения здесь появится каталог
                    подходящих запчастей.
                </p>

                <a
                    href={`/garage/${carId}`}
                    className="block text-[var(--link)]"
                >
                    Вернуться к автомобилю
                </a>
            </div>
        );
    }

    if (!catalog) {
        return (
            <div className="mx-auto max-w-xl space-y-4 p-6 text-[var(--text)]">
                <h1 className="text-xl font-semibold">
                    Не удалось загрузить каталог
                </h1>

                <p className="break-words text-sm text-[var(--text-muted)]">
                    {error instanceof Error
                        ? error.message
                        : 'Данные каталога не получены.'}
                </p>

                <button
                    type="button"
                    onClick={() => void refresh()}
                    disabled={isFetching}
                    className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm text-[var(--btn-primary-text)] disabled:opacity-50"
                >
                    {isFetching ? 'Загружаем…' : 'Повторить'}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            {partToSave && (
                <SaveToCatalogModal
                    key={partToSave.article.id}
                    carId={carId}
                    article={partToSave.article}
                    nodeName={partToSave.nodeName}
                    onClose={closeSaveModal}
                    onSaved={finishSavingPart}
                />
            )}

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

            <div className="flex justify-end border-b border-[var(--border)] px-4 py-3 md:px-6">
                <Link
                    href={`/garage/${carId}?section=catalog`}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--link)] transition-colors hover:bg-[var(--bg-elevated)]"
                >
                    Открыть личный каталог
                    <span aria-hidden="true">→</span>
                </Link>
            </div>



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
                                        isAlreadyAdded={isAlreadyAdded}
                                        onAddVariant={addToPersonal}
                                        onRemoveVariant={removeFromPersonal}
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