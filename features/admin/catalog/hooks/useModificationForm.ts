'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { createCatalogModification } from '@/features/admin/lib/system-store/actions/modifications';

import type { CatalogModification } from '@/features/admin/lib/system-store/types';

interface ModificationFields {
    trim: string;
    engine: string;
    transmission: string;
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
    const [fields, setFields] =
        React.useState<ModificationFields>({
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
    const generatedName = [
        fields.trim.trim(),

        fields.engine.trim()
            ? `(${fields.engine.trim()})`
            : '',

        fields.transmission.trim(),
        fields.drivetrain.trim(),

        ...customAttributes.map(item => item.value.trim())
    ]
        .filter(Boolean)
        .join(' ');

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

        if (!name.trim()) {
            setError('Укажите название модификации.');
            return;
        }

        const additionalEntries: [string, string][] = [];

        // Дополнительные поля не должны заменять основные.
        const usedKeys = new Set([
            'trim',
            'engine',
            'transmission',
            'drivetrain'
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