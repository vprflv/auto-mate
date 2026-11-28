'use client';

import { useMemo, useState } from 'react';
import type { ManualCarForm } from '@/types';
import { findMatchingCatalogModifications, getCatalogProductionYears, matchesVehicleDetails, modificationValues } from '@/features/catalog/lib/carCatalogIdentity';
import { formatTransmission } from '../lib/config/robotTransmission';
import { sortCatalogModifications } from '@/features/catalog/lib/sortCatalogModifications';

import { useCarCatalog } from './useCarCatalog';
import type { CatalogModification } from '@/features/admin/lib/system-store/types';
import { getCatalogVinModelYear, getConfirmedVinMatch } from '../lib/catalogVinRules';

import { formatFacelift, getCatalogFaceliftOptions, knownFacelift, matchesFacelift } from '@/features/catalog/lib/facelift';

interface Props {
    form: ManualCarForm;
    allowAllModifications?: boolean;
    onChange: (
        field: keyof ManualCarForm,
        value: string
    ) => void;
}

const normalizeName = (value: string) =>
    value.trim().replace(/\s+/g, ' ').toLowerCase();

function findUnique<T>(
    items: T[],
    predicate: (item: T) => boolean
): T | undefined {
    const matches = items.filter(predicate);

    return matches.length === 1 ? matches[0] : undefined;
}

const emptySpecifications = {
    catalogModificationId: '',
    modificationName: '',
    engine: '',
    transmission: '',
    driveType: '',
    trim: '',
    displacementL: '',
    fuel: '',
    bodyClass: '',
    facelift: ''
};

export function useCatalogCarSelection({
                                           form,
                                           onChange,
                                           allowAllModifications = false
                                       }: Props) {
    const catalog = useCarCatalog();
    const [showAllModifications, setShowAllModifications] = useState(false);

    const brand =
        catalog.brands.find(
            item =>
                item.value === form.catalogBrandSlug &&
                normalizeName(item.label) === normalizeName(form.make)
        ) ??
        findUnique(
            catalog.brands,
            item =>
                normalizeName(item.label) === normalizeName(form.make)
        );

    const availableModels = catalog.models.filter(
        item => item.brandSlug === brand?.value
    );

    const model =
        availableModels.find(
            item =>
                item.modelSlug === form.catalogModelSlug &&
                normalizeName(item.modelName) === normalizeName(form.model)
        ) ??
        findUnique(
            availableModels,
            item =>
                normalizeName(item.modelName) === normalizeName(form.model)
        );

    const modifications = model?.verified && Array.isArray(model.modifications)
        ? sortCatalogModifications(model.modifications)
        : [];
    const faceliftOptions = getCatalogFaceliftOptions(modifications.map(item => item.attributes ?? {}));
    const currentFacelift = knownFacelift(form.facelift);
    const vinMatch = useMemo(() => getConfirmedVinMatch(form.vin, catalog.models), [form.vin, catalog.models]);
    const matchesDetails = (modification: CatalogModification, year: string, bodyCode: string) =>
        matchesVehicleDetails(modification, year, bodyCode, {
            modelYear: !allowAllModifications && vinMatch?.modification === modification ? vinMatch.modelYear : undefined,
            yearTolerance: allowAllModifications && modification.id === form.catalogModificationId ? 1 : 0,
        });
    const matchingModifications = modifications.filter(item =>
        (!allowAllModifications && item.id === form.catalogModificationId) ||
        (matchesDetails(item, form.year, form.bodyCode ?? '') && matchesFacelift(form.facelift, item.attributes?.facelift))
    );
    const exactMatches = form.catalogModificationId ? [] : findMatchingCatalogModifications(
        { ...form, year: Number(form.year) },
        catalog.models,
        { includeUnspecifiedBody: true }
    );
    const needsModificationChoice = exactMatches.length > 1;
    const showAll = allowAllModifications && showAllModifications && modifications.length > 0;
    const displayedModifications = showAll ? modifications : needsModificationChoice
        ? sortCatalogModifications(exactMatches.map(({ modification }) => modification))
        : matchingModifications;
    const selectedModification = modifications.find(item => item.id === form.catalogModificationId);
    const selectionNeedsReview = showAll && selectedModification !== undefined &&
        (!matchesDetails(selectedModification, form.year, form.bodyCode ?? '') ||
            !matchesFacelift(form.facelift, selectedModification.attributes?.facelift));

    function toggleAllModifications(value: boolean) {
        setShowAllModifications(value);
        if (!value && selectionNeedsReview) {
            onChange('catalogModificationId', '');
            onChange('modificationName', '');
        }
    }
    const bodyCodes = [...new Set(modifications
        .map(item => item.attributes?.bodyCode?.trim().toUpperCase())
        .filter((code): code is string => Boolean(code)))];

    function changeVehicleDetail(field: 'year' | 'bodyCode', value: string) {
        onChange(field, value);
        const selected = modifications.find(item => item.id === form.catalogModificationId);
        if (selected && !matchesDetails(
            selected,
            field === 'year' ? value : form.year,
            field === 'bodyCode' ? value : form.bodyCode ?? ''
        )) {
            onChange('catalogModificationId', '');
            onChange('modificationName', '');
        }
    }

    function changeFacelift(value: string) {
        onChange('facelift', value);
        if (selectedModification && !matchesFacelift(value, selectedModification.attributes?.facelift)) {
            onChange('catalogModificationId', '');
            onChange('modificationName', '');
        }
    }

    const selectModification = (id: string) => {
        const selected = displayedModifications.find(item => item.id === id);
        const selectedModel = !showAll && needsModificationChoice
            ? exactMatches.find(({ modification }) => modification === selected)?.model
            : model;
        if (!selected || !selectedModel) {
            onChange('catalogModificationId', '');
            onChange('modificationName', '');
            return;
        }

        const values = modificationValues(selected, form.facelift);
        for (const field of Object.keys(values) as (keyof typeof values)[]) {
            if (!allowAllModifications || !form[field]?.trim()) onChange(field, values[field]);
        }
        if (!form.bodyCode?.trim() && selected.attributes?.bodyCode) {
            onChange('bodyCode', selected.attributes.bodyCode);
        }
        onChange('catalogBrandSlug', selectedModel.brandSlug);
        onChange('catalogModelSlug', selectedModel.modelSlug);
        onChange('modificationName', selected.name);
        // Последним: изменение характеристик сбрасывает прежнюю связь.
        onChange('catalogModificationId', selected.id);
    };

    const engineNames = new Map<string, string>();

    for (const modification of model?.modifications ?? []) {
        const engine = modification.attributes.engine?.trim();

        if (engine && !engineNames.has(normalizeName(engine))) {
            engineNames.set(normalizeName(engine), engine);
        }
    }

    const patch = (values: Partial<ManualCarForm>) => {
        for (
            const field of Object.keys(values) as
            (keyof ManualCarForm)[]
            ) {
            const value = values[field];

            if (value !== undefined) {
                onChange(field, value);
            }
        }
    };

    const updateIdentity = (
        field: 'make' | 'model',
        value: string,
        slug: string
    ) => {
        const isBrand = field === 'make';

        const previousSlug = isBrand
            ? brand?.value
            : model?.modelSlug;

        const changed =
            normalizeName(value) !== normalizeName(form[field]) ||
            slug !== (previousSlug ?? '');

        if (changed) setShowAllModifications(false);
        patch({
            ...(changed ? emptySpecifications : {}),
            ...(changed ? { bodyCode: '' } : {}),

            ...(isBrand && changed
                ? { model: '', catalogModelSlug: '' }
                : {}),

            [field]: value,

            ...(isBrand
                ? { catalogBrandSlug: slug }
                : {
                    catalogBrandSlug: brand?.value ?? '',
                    catalogModelSlug: slug
                })
        });
    };

    const changeBrand = (value: string) => {
        const match = findUnique(
            catalog.brands,
            item =>
                normalizeName(item.label) === normalizeName(value)
        );

        updateIdentity('make', value, match?.value ?? '');
    };

    const changeModel = (value: string) => {
        const match = findUnique(
            availableModels,
            item =>
                normalizeName(item.modelName) === normalizeName(value)
        );

        updateIdentity('model', value, match?.modelSlug ?? '');
    };

    const changeEngine = (value: string) => {
        patch({
            engine: value,
            catalogModificationId: '',
            modificationName: ''
        });
    };

    return {
        loaded: catalog.loaded,
        modelYear: allowAllModifications && selectedModification
            ? getCatalogVinModelYear(selectedModification, form.vin)
            : vinMatch?.modification === selectedModification ? vinMatch?.modelYear : undefined,
        productionYears: selectedModification ? getCatalogProductionYears(selectedModification) : undefined,
        facelift: {
            value: currentFacelift ?? '',
            options: faceliftOptions,
            legacyValue: !allowAllModifications && currentFacelift && !faceliftOptions.some(option => option.value === currentFacelift)
                ? { value: currentFacelift, label: formatFacelift(currentFacelift) } : undefined,
            onChange: changeFacelift,
        },
        year: {
            value: form.year,
            onChange: (value: string) => {
                if (/^\d{0,4}$/.test(value)) changeVehicleDetail('year', value);
            },
        },
        bodyCode: {
            value: form.bodyCode ?? '',
            options: bodyCodes.map(value => ({ value, label: value })),
            onChange: (value: string) => changeVehicleDetail('bodyCode', value),
            onSelect: (value: string) => changeVehicleDetail('bodyCode', value),
        },
        modification: {
            value: form.catalogModificationId ?? '',
            options: displayedModifications.map(item => {
                const facelift = knownFacelift(item.attributes.facelift);
                return {
                    value: item.id,
                    label: [
                        item.name,
                        ...((showAll || needsModificationChoice) && item.attributes.bodyCode
                            ? [`Кузов ${item.attributes.bodyCode}`]
                            : []),
                        ...(showAll && item.attributes.year
                            ? [`Годы выпуска ${item.attributes.year}${item.attributes.yearEnd && item.attributes.yearEnd !== item.attributes.year ? `–${item.attributes.yearEnd}` : ''}`]
                            : []),
                        facelift ? formatFacelift(facelift) : '',
                        item.attributes.engine,
                        formatTransmission(item.attributes.transmission),
                        item.attributes.drivetrain,
                    ].filter(Boolean).join(' · '),
                };
            }),
            disabled: !catalog.loaded || (!model && !needsModificationChoice),
            required: !showAll && needsModificationChoice,
            showAll,
            selectionNeedsReview,
            canShowAll: allowAllModifications && modifications.length > 0,
            onShowAllChange: toggleAllModifications,
            total: modifications.length,
            onChange: selectModification,
        },

        brand: {
            value: form.make,
            options: catalog.brands,
            disabled: !catalog.loaded,
            onChange: changeBrand,

            onSelect: (slug: string) => {
                const selected = catalog.brands.find(
                    item => item.value === slug
                );

                if (selected) {
                    updateIdentity('make', selected.label, selected.value);
                }
            }
        },

        model: {
            value: form.model,

            options: availableModels.map(model => ({
                value: model.modelSlug,
                label: model.modelName,
            })),

            disabled: !catalog.loaded || !form.make.trim(),
            onChange: changeModel,

            onSelect: (slug: string) => {
                const selected = availableModels.find(
                    item => item.modelSlug === slug
                );

                if (selected) {
                    updateIdentity('model', selected.modelName, slug);
                }
            }
        },

        engine: {
            value: form.engine,

            options: Array.from(
                engineNames,
                ([value, label]) => ({ value, label })
            ).sort((a, b) => a.label.localeCompare(b.label)),

            disabled:
                !catalog.loaded ||
                !form.make.trim() ||
                !form.model.trim() || !!form.catalogModificationId,

            onChange: changeEngine,

            onSelect: (value: string) => {
                const engine = engineNames.get(value);

                if (engine) changeEngine(engine);
            }
        }
    };
}
