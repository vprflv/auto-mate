'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ListChecks, Pencil } from 'lucide-react';
import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { compareCatalogModificationAttributes } from '@/features/catalog/lib/sortCatalogModifications';
import type { CatalogVinMatch } from '../lib/catalogVinRules';
import { findVinVersionCandidates, type VinVersionHint } from '../lib/vinVersionHint';
import { formatFacelift } from '@/features/catalog/lib/facelift';

interface Props {
    correctedVin?: string;
    models: StoredMasterModel[];
    reason: 'no-match' | 'unavailable' | 'skip';
    identifier?: 'frame' | 'vin';
    hint?: VinVersionHint;
    onBack: () => void;
    onChoose: (match: CatalogVinMatch) => void;
    onManual?: (model?: StoredMasterModel) => void;
    onNoMatch?: () => void;
    backLabel?: string;
}

const selectClass = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--link)] disabled:opacity-50';

export function CatalogModificationPicker({ correctedVin, models, reason, identifier, hint, onBack, onChoose, onManual, onNoMatch, backLabel = 'К поиску автомобиля' }: Props) {
    const [brandSlug, setBrandSlug] = useState('');
    const [modelSlug, setModelSlug] = useState('');
    const [showAll, setShowAll] = useState(false);
    const heading = useRef<HTMLHeadingElement>(null);

    useEffect(() => { heading.current?.focus(); }, []);

    const brands = [...new Map(models.map(model => [model.brandSlug, model.brandName])).entries()]
        .sort(([, first], [, second]) => first.localeCompare(second, 'ru'));
    const brandModels = models.filter(model => model.brandSlug === brandSlug)
        .sort((first, second) => first.modelName.localeCompare(second.modelName, 'ru'));
    const model = brandModels.find(candidate => candidate.modelSlug === modelSlug);
    const modifications = [...(model?.modifications ?? [])].sort((first, second) =>
        compareCatalogModificationAttributes(first.attributes, second.attributes));
    const suggestions = hint ? findVinVersionCandidates(hint, models).sort((first, second) =>
        compareCatalogModificationAttributes(first.modification.attributes, second.modification.attributes)) : [];
    const showCatalog = !suggestions.length || showAll;

    const renderChoice = (match: CatalogVinMatch) => (
        <li key={JSON.stringify([match.model.modelSlug, match.modification.id])}>
            <button type="button" onClick={() => onChoose(match)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-medium hover:border-[var(--link)] focus-visible:outline-2 focus-visible:outline-[var(--link)]">
                <span className="break-words">{match.modification.name}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--link)]" aria-hidden="true" />
            </button>
        </li>
    );

    return (
        <section aria-labelledby="catalog-picker-heading" className="mx-auto max-w-3xl space-y-5 text-[var(--text)]">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[var(--link)] hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
            </button>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-7">
                <ListChecks className="mb-4 h-7 w-7 text-[var(--link)]" aria-hidden="true" />
                <h1 id="catalog-picker-heading" ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none sm:text-3xl">
                    Выберите модификацию автомобиля
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {reason === 'no-match' && (identifier === 'frame' ? 'В каталоге пока нет совпадения по этому номеру кузова. ' : 'В каталоге пока нет совпадения по этому VIN. ')}
                    {reason === 'unavailable' && (identifier === 'frame' ? 'Сейчас не удалось проверить номер кузова. ' : 'Сейчас не удалось проверить VIN. ')}
                    {suggestions.length ? 'Проверьте предложенную версию перед выбором.' : models.length
                        ? 'Укажите марку и модель, затем выберите подходящий вариант.'
                        : onManual ? 'Готовых модификаций пока нет. Можно указать характеристики автомобиля вручную.' : 'Готовых модификаций пока нет.'}
                </p>
                {correctedVin && <p role="status" className="mt-2 text-sm">Проверьте исправленный VIN · {correctedVin}</p>}
                {hint && (
                    <div className="mt-4 space-y-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                        <p className="text-xs font-medium text-[var(--text-muted)]">Возможная версия по коду {hint.typeCode}</p>
                        <h2 className="font-semibold">BMW {hint.version} · {hint.bodyCode}</h2>
                        <p className="text-sm text-[var(--text-muted)]">{formatFacelift(hint.facelift)} · {hint.engineFamily} · {hint.drivetrain}</p>
                    </div>
                )}
                {models.length > 0 && showCatalog && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 text-sm font-medium">
                            <span>Марка</span>
                            <select className={selectClass} value={brandSlug} onChange={event => {
                                setBrandSlug(event.target.value);
                                setModelSlug('');
                            }}>
                                <option value="">Выберите марку</option>
                                {brands.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
                            </select>
                        </label>
                        <label className="space-y-1 text-sm font-medium">
                            <span>Модель</span>
                            <select className={selectClass} value={modelSlug} disabled={!brandSlug} onChange={event => setModelSlug(event.target.value)}>
                                <option value="">Выберите модель</option>
                                {brandModels.map(item => <option key={item.modelSlug} value={item.modelSlug}>{item.modelName}</option>)}
                            </select>
                        </label>
                    </div>
                )}
            </div>
            {!!suggestions.length && !showAll && (
                <div className="space-y-3">
                    <ul aria-label="Предложенные модификации" className="grid gap-2">{suggestions.map(renderChoice)}</ul>
                    <button type="button" onClick={() => setShowAll(true)} className="text-sm font-medium text-[var(--link)] hover:underline">
                        Выбрать из всего каталога
                    </button>
                </div>
            )}
            {model && showCatalog && (
                <ul aria-label="Готовые модификации" className="grid gap-2">
                    {modifications.map(modification => renderChoice({ model, modification }))}
                </ul>
            )}
            {(onManual || onNoMatch) && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] p-4">
                {models.length > 0 && <p className="text-sm text-[var(--text-muted)]">Нет вашей модели или модификации?</p>}
                {onManual && <button type="button" onClick={() => onManual(model)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:border-[var(--link)]">
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Указать характеристики вручную
                </button>}
                {onNoMatch && <button type="button" onClick={onNoMatch} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:border-[var(--link)]">
                    Подходящей модификации нет
                </button>}
            </div>}
        </section>
    );
}
