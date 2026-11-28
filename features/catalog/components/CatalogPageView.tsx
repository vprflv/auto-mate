'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { CarCatalogPreference } from '@/types';
import { requestCarCatalogReview, saveCarCatalogPreference } from '@/features/admin/lib/system-store/carCatalogReview';
import { CatalogModificationPicker } from '@/features/garage/add/components/CatalogModificationPicker';
import { useCarCatalog } from '@/features/garage/add/hooks/useCarCatalog';
import { catalogPreferenceFor, catalogReviewVersion } from '../lib/catalogVehicleSelection';
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
    const [choiceMode, setChoiceMode] = useState<'list' | 'all' | 'waiting' | null>(null);
    const [choiceError, setChoiceError] = useState('');
    const { models, loaded: catalogLoaded } = useCarCatalog();
    const readyModels = models.filter(model => model.verified && model.modifications?.length);

    function openChoice(mode: 'list' | 'all' | null) {
        setChoiceError('');
        setChoiceMode(mode);
    }

    function choose(preference: CarCatalogPreference) {
        try {
            if (!saveCarCatalogPreference(carId, preference)) {
                toast.warning('Модификация сохранена. Отправить заявку на проверку не удалось. Повторите выбор этой карточки, чтобы отправить её снова.');
            }
            setSearch('');
            setSelectedNodeId(null);
            openChoice(null);
        } catch (error) {
            setChoiceError(error instanceof Error ? error.message : 'Не удалось сохранить выбор.');
        }
    }

    function waitForReview() {
        if (!car) return;
        try {
            requestCarCatalogReview(car.id);
            setChoiceError('');
            setChoiceMode('waiting');
        } catch (error) {
            setChoiceError(error instanceof Error ? error.message : 'Не удалось отправить данные на модерацию.');
        }
    }
    const [analogArticle, setAnalogArticle] = useState<CatalogArticle | null>(null);
    const analogDialog = useCatalogArticleDialog();

    function showAnalogs(article: CatalogArticle) {
        setAnalogArticle(article);
        analogDialog.open();
    }

    const selectedModification = catalog?.selectedModification;
    const options = catalog?.modificationOptions ?? [];
    const waiting = choiceMode === 'waiting' || Boolean(car?.catalogAwaitingReview && car.catalogAwaitingReview === catalogReviewVersion(car));
    const selectedYears = [...new Set([selectedModification?.year, selectedModification?.yearEnd].filter(Boolean))].join('–');
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

    if (isLoading || !catalogLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-muted)]">
                Загружаем каталог...
            </div>
        );
    }

    if (choiceMode === 'all') {
        return (
            <div className="p-6">
                {choiceError && <p role="alert" className="mx-auto mb-4 max-w-3xl text-sm text-[var(--danger)]">{choiceError}</p>}
                <CatalogModificationPicker models={readyModels} reason="skip" backLabel="Вернуться к ИИ-каталогу"
                    onBack={() => openChoice(null)} onChoose={match => choose(catalogPreferenceFor(match))}
                    onNoMatch={catalog?.source === 'master' || catalog?.source === 'master-selected' ? undefined : waitForReview} />
            </div>
        );
    }

    if (choiceMode === 'list' || (!waiting && catalog?.source === 'master-choice')) {
        return (
            <div className="mx-auto max-w-2xl space-y-5 p-6 text-[var(--text)]">
                <h1 className="text-2xl font-semibold">Выберите модификацию для ИИ-каталога</h1>
                <p className="text-sm text-[var(--text-muted)]">Выбор сохранится для этого автомобиля. Сверьте двигатель, КПП и годы выпуска.</p>
                {choiceError && <p role="alert" className="text-sm text-[var(--danger)]">{choiceError}</p>}
                <ul className="space-y-2">
                    {options.map(option => {
                        const years = [...new Set([option.year, option.yearEnd].filter(Boolean))].join('–');
                        const details = [years, option.bodyCode, option.engine, option.transmission].filter(Boolean).join(' · ');
                        return (
                            <li key={option.value}>
                                <button type="button" onClick={() => choose(option.preference)}
                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left hover:border-[var(--link)]">
                                    <span className="block font-medium">{option.modelName} · {option.name}</span>
                                    {details && <span className="text-sm text-[var(--text-muted)]">{details}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <div className="flex flex-wrap items-center gap-4">
                    <button type="button" onClick={() => openChoice('all')} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--link)]">
                        Выбрать из всего каталога
                    </button>
                    {choiceMode === 'list' && <button type="button" onClick={() => openChoice(null)} className="text-sm text-[var(--link)]">Отмена</button>}
                    <Link href={`/garage/${carId}`} className="text-sm text-[var(--link)]">Вернуться к автомобилю</Link>
                </div>
            </div>
        );
    }

    if (catalog?.source === 'master-pending' || (waiting && catalog?.source === 'master-choice')) {
        return (
            <div className="mx-auto max-w-xl space-y-4 p-6 text-[var(--text)]">
                <h1 className="text-2xl font-semibold">{waiting || !readyModels.length ? 'Подходящей модификации пока нет' : 'Выберите модификацию для ИИ-каталога'}</h1>
                <p className="text-[var(--text-muted)]">
                    {waiting || !readyModels.length
                        ? 'Подбор совместимых деталей появится, когда модератор добавит подходящую карточку или свяжет автомобиль с существующей.'
                        : 'Для данных автомобиля нет подходящих вариантов. Проверьте, есть ли нужная карточка в общем каталоге.'}
                </p>
                {choiceError && <p role="alert" className="text-sm text-[var(--danger)]">{choiceError}</p>}
                {readyModels.length > 0 && <button type="button" onClick={() => openChoice('all')} className="block rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--link)]">Выбрать из всего каталога</button>}
                <Link href={`/garage/${carId}`} className="block text-[var(--link)]">Вернуться к автомобилю</Link>
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

            {selectedModification && (
                <div role="status" className="space-y-1 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm md:px-6">
                    <p className="font-semibold">Выбрано вами · {selectedModification.name}{selectedYears ? ` · ${selectedYears}` : ''}</p>
                    {selectedModification.differences.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5 text-[var(--text-muted)]">
                            {selectedModification.differences.map(difference => <li key={difference}>{difference}</li>)}
                        </ul>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 md:px-6">
                <CatalogSectionLinks section={section} partsHref={catalogPath} fluidsHref={`${catalogPath}/fluids`} />
                <button type="button" onClick={() => openChoice(options.length ? 'list' : 'all')}
                    className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:border-[var(--link)]">
                    Сменить модификацию
                </button>
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
