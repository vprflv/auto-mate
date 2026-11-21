'use client';

import { useState } from 'react';
import type { CatalogArticle, CatalogSection } from '@/types/catalog/catalog';
import { FLUID_FILL_CAPACITY_NOTICE, formatFillCapacity } from '../lib/fluidFillCapacities';
import { CatalogSectionLinks } from './CatalogSectionLinks';
import { useCatalogArticleDialog } from '../hooks/useCatalogArticleDialog';
import { CatalogArticleDialog } from './article-card/CatalogArticleDialog';
import CatalogTree from '@/features/catalog/components/CatalogTree';
import CatalogHeader from './CatalogHeader';
import CatalogArticlesHeader from './CatalogArticlesHeader';
import CatalogEmpty from './CatalogEmpty';
import CatalogArticleCard from './CatalogArticleCard';
import { CatalogPartRow } from './article-card/CatalogPartRow';
import { useCatalogPage } from '@/features/catalog/hooks/useCatalogPage';
import SaveToCatalogModal from "@/features/catalog/components/SaveToCatalogModal";
import Link from "next/link";

export default function CatalogPageView({
                                            carId,
                                            section = 'parts',
                                        }: {
    carId: string;
    section?: CatalogSection;
}) {
    const isFluids = section === 'fluids';
    const catalogPath = `/garage/${carId}/catalog`;
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
        selectedNode,
        isAlreadyAdded,
        addToPersonal,
        removeFromPersonal,
        partToSave,
        closeSaveModal,
        finishSavingPart,
    } = useCatalogPage(carId, section);
    const [analogArticle, setAnalogArticle] = useState<CatalogArticle | null>(null);
    const analogDialog = useCatalogArticleDialog();

    function showAnalogs(article: CatalogArticle) {
        setAnalogArticle(article);
        analogDialog.open();
    }

    const oemCards = filteredArticles.filter(article =>
        article.isOem || article.canSave === false
    );
    const otherParts = new Map(
        filteredArticles
            .flatMap(article => [
                ...(!article.isOem && article.canSave !== false ? [article] : []),
                ...(article.variants ?? []),
            ])
            .map(article => [article.id, article] as const)
    );

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
                    {isFluids ? ' подходящих масел и жидкостей.' : ' подходящих запчастей.'}
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
                    catalogPath={partToSave.catalogPath}
                    onClose={closeSaveModal}
                    onSaved={finishSavingPart}
                />
            )}

            <CatalogHeader
                car={car}
                section={section}
                search={search}
                onSearch={setSearch}
                onRefresh={refresh}
                isFetching={isFetching}
                showDisclaimer={
                    catalog.source === 'ai' ||
                    catalog.source === 'mock'
                }
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 md:px-6">
                <CatalogSectionLinks section={section} partsHref={catalogPath} fluidsHref={`${catalogPath}/fluids`} />
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
                            selectedNode?.name ||
                            (isFluids ? 'Все масла и жидкости' : 'Все запчасти')
                        }
                        count={filteredArticles.length}
                    />

                    {isFluids && !search.trim() && selectedNode?.fillCapacity !== undefined && (
                        <div className="mb-5 space-y-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                            <p className="text-sm font-semibold">
                                Справочный заправочный объём: {formatFillCapacity(selectedNode.fillCapacity)}
                            </p>
                            <p className="text-xs leading-relaxed text-[var(--text-muted)]">{FLUID_FILL_CAPACITY_NOTICE}</p>
                        </div>
                    )}

                    {filteredArticles.length === 0 ? (
                        <CatalogEmpty
                            search={search}
                            section={section}
                            onClear={
                                search
                                    ? () => setSearch('')
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="space-y-6">
                            {oemCards.map(
                                (art) => (
                                    <CatalogArticleCard
                                        isAlreadyAdded={isAlreadyAdded}
                                        key={art.id}
                                        carId={carId}
                                        article={art}
                                        onShowAnalogs={() => showAnalogs(art)}
                                        onAdd={addToPersonal}
                                        onRemove={removeFromPersonal}
                                    />
                                )
                            )}
                            {otherParts.size > 0 && (
                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold text-[var(--text)]">
                                        {isFluids ? 'Масла и жидкости' : 'Аналоги и другие детали'}
                                    </h3>
                                    <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                        {[...otherParts.values()].map(part => (
                                            <CatalogPartRow
                                                key={part.id}
                                                article={part}
                                                onShowAnalogs={() => showAnalogs(part)}
                                                carId={carId}
                                                originalNumber={part.originalNumbers?.join(' / ') ?? ''}
                                                alreadyAdded={isAlreadyAdded(part)}
                                                onAdd={() => addToPersonal(part)}
                                                onRemove={() => removeFromPersonal(part)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                    {analogDialog.isOpen && analogArticle && (
                        <CatalogArticleDialog
                            dialogRef={analogDialog.dialogRef}
                            article={analogArticle}
                            catalogArticles={isFluids ? filteredArticles : catalog.articles}
                            onClose={analogDialog.close}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
