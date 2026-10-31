'use client';

import type { ManualCarForm } from '@/types';

import { useCarCatalog } from './useCarCatalog';

interface Props {
    form: ManualCarForm;
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
    bodyClass: ''
};

export function useCatalogCarSelection({
                                           form,
                                           onChange
                                       }: Props) {
    const catalog = useCarCatalog();

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

        patch({
            ...(changed ? emptySpecifications : {}),

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
                !form.model.trim(),

            onChange: changeEngine,

            onSelect: (value: string) => {
                const engine = engineNames.get(value);

                if (engine) changeEngine(engine);
            }
        }
    };
}