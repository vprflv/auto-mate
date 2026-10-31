'use client';

import type { ManualCarForm } from '@/types';
import { useCarCatalog } from './useCarCatalog';

type SpecificationField =
    | 'bodyClass'
    | 'fuel'
    | 'transmission'
    | 'driveType';

const defaultOptions: Record<SpecificationField, string[]> = {
    bodyClass: [
        'Седан',
        'Хэтчбек',
        'Универсал',
        'Лифтбек',
        'Купе',
        'Кабриолет',
        'Кроссовер',
        'Внедорожник',
        'Минивэн',
        'Пикап',
        'Фургон',
    ],
    fuel: [
        'Бензин',
        'Дизель',
        'Газ',
        'Газ / бензин',
        'Гибрид',
        'Электро',
    ],
    transmission: ['MT', 'AT', 'CVT', 'DCT'],
    driveType: ['FWD', 'RWD', 'AWD', '4WD'],
};

const attributeKeys: Record<SpecificationField, string> = {
    bodyClass: 'bodyClass',
    fuel: 'fuel',
    transmission: 'transmission',
    driveType: 'drivetrain',
};

function normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function mergeOptions(
    catalogValues: string[],
    standardValues: string[]
): string[] {
    const unique = new Map<string, string>();

    for (const value of [...catalogValues, ...standardValues]) {
        const label = value.trim().replace(/\s+/g, ' ');

        if (label && !unique.has(normalize(label))) {
            unique.set(normalize(label), label);
        }
    }

    return Array.from(unique.values());
}

export function useCarSpecificationOptions(form: ManualCarForm) {
    const { models } = useCarCatalog();

    const selectedModels = models.filter(model => {
        const sameBrand =
            normalize(model.brandName) === normalize(form.make);

        const sameModel =
            normalize(model.modelName) === normalize(form.model);

        const matchesBrandReference =
            !form.catalogBrandSlug ||
            model.brandSlug === form.catalogBrandSlug;

        const matchesModelReference =
            !form.catalogModelSlug ||
            model.modelSlug === form.catalogModelSlug;

        return (
            sameBrand &&
            sameModel &&
            matchesBrandReference &&
            matchesModelReference
        );
    });

    const modifications = selectedModels.flatMap(
        model => model.modifications
    );

    function getOptions(field: SpecificationField): string[] {
        const catalogValues: string[] = [];
        const attributeKey = attributeKeys[field];

        for (const modification of modifications) {
            const value = modification.attributes[attributeKey];

            if (typeof value === 'string' && value.trim()) {
                catalogValues.push(value);
            }
        }

        return mergeOptions(catalogValues, defaultOptions[field]);
    }

    return {
        bodyClass: getOptions('bodyClass'),
        fuel: getOptions('fuel'),
        transmission: getOptions('transmission'),
        driveType: getOptions('driveType'),
    };
}