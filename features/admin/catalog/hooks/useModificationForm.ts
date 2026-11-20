'use client';

import * as React from 'react';
import { toast } from 'sonner';

import {
    createCatalogModification,
    updateCatalogModification,
} from '@/features/admin/lib/system-store/actions/modifications';

import type { CatalogModification } from '@/features/admin/lib/system-store/types';
import {useCarCatalog} from "@/features/garage/add/hooks/useCarCatalog";
import { normalizeRobotTransmission, ROBOT_TRANSMISSION } from '@/features/garage/add/lib/config/robotTransmission';

interface ModificationFields {
    trim: string;
    engine: string;
    transmission: string;
    year: string;
    yearEnd: string;
    bodyCode: string;
    bodyClass: string;
    fuel: string;
    displacementL: string;
    drivetrain: string;
}

interface CustomAttribute {
    id: string;
    key: string;
    value: string;
}

const emptyFields: ModificationFields = {
    year: '',
    yearEnd: '',
    bodyCode: '',
    bodyClass: '',
    fuel: '',
    displacementL: '',
    trim: '',
    engine: '',
    transmission: '',
    drivetrain: '',
};
const mainFieldKeys = Object.keys(emptyFields) as (keyof ModificationFields)[];

interface Props {
    brandSlug: string;
    modelSlug: string;
    initialModification?: CatalogModification;
    onSaved: (modification: CatalogModification) => void;
}

export function useModificationForm({
                                        brandSlug,
                                        modelSlug,
                                        initialModification,
                                        onSaved
                                    }: Props) {

    const { models } = useCarCatalog();

    const model = models.find(item =>
        item.brandSlug === brandSlug && item.modelSlug === modelSlug
    );

    const modifications = Array.isArray(model?.modifications)
        ? model.modifications
        : [];

    function getSuggestions(key: keyof ModificationFields): string[] {
        const values = new Map<string, string>();

        for (const modification of modifications) {
            const value = modification.attributes?.[key]?.trim();

            if (value && !values.has(value.toLowerCase())) {
                values.set(value.toLowerCase(), value);
            }
        }

        return [...values.values()].sort((a, b) =>
            a.localeCompare(b, 'ru', { numeric: true })
        );
    }

    const suggestions = {
        year: getSuggestions('year'),
        yearEnd: getSuggestions('yearEnd'),
        bodyCode: getSuggestions('bodyCode'),
        bodyClass: getSuggestions('bodyClass'),
        fuel: getSuggestions('fuel'),
        trim: getSuggestions('trim'),
        engine: getSuggestions('engine'),
        displacementL: getSuggestions('displacementL'),
        transmission: [
            ...getSuggestions('transmission').filter(value =>
                normalizeRobotTransmission(value) !== ROBOT_TRANSMISSION
            ),
            ROBOT_TRANSMISSION,
        ],
    };



    const [fields, setFields] = React.useState<ModificationFields>(() => {
        const initialFields = { ...emptyFields };
        for (const key of mainFieldKeys) {
            initialFields[key] = initialModification?.attributes?.[key] ?? '';
        }
        return initialFields;
    });

    const [customAttributes, setCustomAttributes] =
        React.useState<CustomAttribute[]>(() =>
            Object.entries(initialModification?.attributes ?? {}).flatMap(([key, value]) =>
                typeof value === 'string' && value.trim() && !mainFieldKeys.some(field => field === key)
                    ? [{ id: key, key, value }]
                    : []
            )
        );

    const [customName, setCustomName] =
        React.useState<string | null>(null);
    const [preserveSavedName, setPreserveSavedName] = React.useState(!!initialModification);
    const requiresStartYear = !initialModification || !!initialModification.attributes?.year?.trim();

    const [error, setError] = React.useState('');

    // Название обновляется автоматически,
    // пока пользователь не начнёт редактировать его вручную.
    const startYear = fields.year.trim();
    const endYear = fields.yearEnd.trim();
    const volume = fields.displacementL.trim().replace(',', '.');
    const engine = fields.engine.trim();

    const generatedName = [
        startYear && endYear ? `${startYear}–${endYear}` : startYear,
        fields.bodyCode?.trim(),
        volume ? `${volume} л` : '',
        engine ? `(${engine})` : '',
        fields.transmission.trim(),
        fields.drivetrain.trim(),
        fields.trim.trim(),
        fields.fuel?.trim(),
        fields.bodyClass?.trim(),
        ...customAttributes.map(item => item.value.trim()),
    ]
        .filter(Boolean)
        .join(' / ');

    const name = customName ??
        (preserveSavedName ? initialModification?.name ?? generatedName : generatedName);

    const setName = (value: string) => {
        setCustomName(value);
        setError('');
    };

    const resetName = () => {
        setCustomName(null);
        setPreserveSavedName(false);
        setError('');
    };

    const setField = (
        key: keyof ModificationFields,
        value: string
    ) => {
        if (value !== fields[key]) setPreserveSavedName(false);
        setFields(current => ({
            ...current,
            [key]: value
        }));

        setError('');
    };

    const addAttribute = () => {
        setCustomAttributes(current => [
            ...current,
            {
                id: crypto.randomUUID(),
                key: '',
                value: ''
            }
        ]);

        setError('');
    };

    const updateAttribute = (
        id: string,
        field: 'key' | 'value',
        value: string
    ) => {
        if (field === 'value') setPreserveSavedName(false);
        setCustomAttributes(current =>
            current.map(item =>
                item.id === id
                    ? { ...item, [field]: value }
                    : item
            )
        );

        setError('');
    };

    const removeAttribute = (id: string) => {
        if (customAttributes.some(item => item.id === id && item.value.trim())) {
            setPreserveSavedName(false);
        }
        setCustomAttributes(current =>
            current.filter(item => item.id !== id)
        );

        setError('');
    };

    const submit = () => {
        setError('');

        const year = fields.year.trim();

        const displacementL = fields.displacementL.trim().replace(',', '.');

        const yearEnd = fields.yearEnd.trim();

        if (yearEnd && !/^[1-9]\d{3}$/.test(yearEnd)) {
            setError('Укажите год окончания выпуска четырьмя цифрами.');
            return;
        }

        if (yearEnd && Number(yearEnd) < Number(year)) {
            setError('Год окончания выпуска не может быть раньше года на
        }


        if ((requiresStartYear || year || yearEnd) && !/^[1-9]\d{3}$/.test(year)) {
            setError('Укажите год выпуска четырьмя цифрами, например 2012.');
            return;
        }

        if (
            displacementL &&
            (!/^\d+(?:\.\d+)?$/.test(displacementL) || Number(displacementL) <= 0)
        ) {
            setError('Укажите объём двигателя в литрах, например 2.0.');
            return;
        }

        if (!name.trim()) {
            setError('Укажите название модификации.');
            return;
        }

        const additionalEntries: [string, string][] = [];

        // Дополнительные поля не должны заменять основные.
        const usedKeys = new Set(mainFieldKeys.map(key => key.toLowerCase()));

        for (const attribute of customAttributes) {
            const key = attribute.key.trim();
            const value = attribute.value.trim();

            // Полностью пустую строку можно пропустить.
            if (!key && !value) continue;

            if (!key || !value) {
                setError(
                    'У каждой дополнительной характеристики заполните название и значение.'
                );
                return;
            }

            const normalizedKey = key.toLowerCase();

            if (usedKeys.has(normalizedKey)) {
                setError(
                    `Характеристика «${key}» уже указана. Используйте другое название.`
                );
                return;
            }

            usedKeys.add(normalizedKey);
            additionalEntries.push([key, value]);
        }

        let modification: CatalogModification;

        try {
            const input = {
                brandSlug,
                modelSlug,
                name,

                attributes: {
                    trim: fields.trim,
                    engine: fields.engine,
                    transmission: fields.transmission,
                    drivetrain: fields.drivetrain,
                    year,
                    ...(yearEnd ? { yearEnd } : {}),
                    bodyCode: fields.bodyCode,
                    bodyClass: fields.bodyClass,
                    fuel: fields.fuel,
                    ...(displacementL ? { displacementL } : {}),

                    ...Object.fromEntries(additionalEntries)
                }
            };

            modification = initialModification
                ? updateCatalogModification({ ...input, modificationId: initialModification.id })
                : createCatalogModification(input);
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить модификацию.'
            );

            return;
        }

        toast.success(initialModification ? 'Модификация обновлена' : 'Модификация добавлена');

        onSaved(modification);
    };

    return {
        fields,
        setField,
        suggestions,
        requiresStartYear,
        requiresFuelAndBodyClass: !initialModification,

        name,
        setName,
        resetName,
        isNameEdited: customName !== null,

        customAttributes,
        addAttribute,
        updateAttribute,
        removeAttribute,

        error,
        submit
    };
}
