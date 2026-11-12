'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { createCatalogModification } from '@/features/admin/lib/system-store/actions/modifications';

import type { CatalogModification } from '@/features/admin/lib/system-store/types';
import {useCarCatalog} from "@/features/garage/add/hooks/useCarCatalog";

interface ModificationFields {
    trim: string;
    engine: string;
    transmission: string;
    year: string;
    yearEnd: string;
    displacementL: string;
    drivetrain: string;
}

interface CustomAttribute {
    id: string;
    key: string;
    value: string;
}

interface Props {
    brandSlug: string;
    modelSlug: string;
    onCreated: (modification: CatalogModification) => void;
}

export function useModificationForm({
                                        brandSlug,
                                        modelSlug,
                                        onCreated
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
        trim: getSuggestions('trim'),
        engine: getSuggestions('engine'),
        displacementL: getSuggestions('displacementL'),
        transmission: getSuggestions('transmission'),
    };



    const [fields, setFields] =
        React.useState<ModificationFields>({
            year: '',
            yearEnd: '',
            displacementL: '',
            trim: '',
            engine: '',
            transmission: '',
            drivetrain: ''
        });

    const [customAttributes, setCustomAttributes] =
        React.useState<CustomAttribute[]>([]);

    const [customName, setCustomName] =
        React.useState<string | null>(null);

    const [error, setError] = React.useState('');

    // Название обновляется автоматически,
    // пока пользователь не начнёт редактировать его вручную.
    const startYear = fields.year.trim();
    const endYear = fields.yearEnd.trim();
    const volume = fields.displacementL.trim().replace(',', '.');
    const engine = fields.engine.trim();

    const generatedName = [
        startYear && endYear ? `${startYear}–${endYear}` : startYear,
        volume ? `${volume} л` : '',
        engine ? `(${engine})` : '',
        fields.transmission.trim(),
        fields.drivetrain.trim(),
        fields.trim.trim(),
        ...customAttributes.map(item => item.value.trim()),
    ]
        .filter(Boolean)
        .join(' / ');

    const name = customName ?? generatedName;

    const setName = (value: string) => {
        setCustomName(value);
        setError('');
    };

    const resetName = () => {
        setCustomName(null);
        setError('');
    };

    const setField = (
        key: keyof ModificationFields,
        value: string
    ) => {
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
            setError('Год окончания выпуска не может быть раньше года начала.');
            return;
        }


        if (!/^[1-9]\d{3}$/.test(year)) {
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
        const usedKeys = new Set([
            'trim',
            'yearend',
            'engine',
            'transmission',
            'drivetrain',
            'year',
            'displacementl'
        ]);

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
            modification = createCatalogModification({
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
                    ...(displacementL ? { displacementL } : {}),

                    ...Object.fromEntries(additionalEntries)
                }
            });
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить модификацию.'
            );

            return;
        }

        toast.success('Модификация добавлена');

        onCreated(modification);
    };

    return {
        fields,
        setField,
        suggestions,

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