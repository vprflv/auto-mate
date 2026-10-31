'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { Car } from '@/types';
import {
    getGarageCars,
    saveGarageCars,
} from '@/features/garage/add/lib/storage';
import {
    createEmptyManualForm,
    getManualFormError,
    mapDecodedToManualForm,
    mapManualFormToCar,
} from '@/features/garage/add/lib/manualForm';
import type {
    EditCarField,
    EditCarFormValues,
} from '../types';
import {submitCarCatalogReview} from "@/features/admin/lib/system-store/carCatalogReview";

function createEmptyEditForm(): EditCarFormValues {
    return {
        ...createEmptyManualForm(),
        currentMileage: '',
        notes: '',
    };
}

export function useEditCar() {
    const params = useParams();
    const router = useRouter();

    const id = typeof params.id === 'string'
        ? params.id
        : '';

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState<EditCarFormValues>(
        createEmptyEditForm
    );

    useEffect(() => {
        setLoading(true);
        setError('');

        try {
            const found = getGarageCars().find(
                candidate => candidate.id === id
            );

            if (!found) {
                setCar(null);
                setForm(createEmptyEditForm());
                return;
            }

            setCar(found);

            setForm({
                ...mapDecodedToManualForm(found),
                catalogBrandSlug: found.catalogBrandSlug ?? '',
                catalogModelSlug: found.catalogModelSlug ?? '',
                catalogModificationId:
                    found.catalogModificationId ?? '',
                modificationName: found.modificationName ?? '',
                color: found.color ?? '',
                nickname: found.nickname ?? '',
                currentMileage:
                    found.currentMileage !== undefined
                        ? String(found.currentMileage)
                        : '',
                notes: found.notes ?? '',
            });
        } catch {
            setCar(null);
            setError('Не удалось загрузить автомобиль.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateField = (
        field: EditCarField,
        value: string
    ) => {
        if (field === 'year' && !/^\d{0,4}$/.test(value)) {
            return;
        }

        if (
            field === 'currentMileage' &&
            !/^\d*$/.test(value)
        ) {
            return;
        }

        if (
            field === 'displacementL' &&
            /[-−–—﹣－]/.test(value)
        ) {
            return;
        }

        setForm(previous => ({
            ...previous,
            [field]: value,
        }));

        setError('');
    };

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {
        const { name, value } = event.target;

        if (!Object.prototype.hasOwnProperty.call(form, name)) {
            return;
        }

        updateField(name as EditCarField, value);
    };

    const handleSave = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!car || saving) return;

        const validationError = getManualFormError(form);

        if (validationError) {
            setError(validationError);
            return;
        }

        const mileageText = form.currentMileage.trim();
        const mileage = mileageText
            ? Number(mileageText)
            : undefined;

        if (
            mileage !== undefined &&
            (
                !/^\d+$/.test(mileageText) ||
                !Number.isSafeInteger(mileage) ||
                mileage < 0
            )
        ) {
            setError('Пробег должен быть целым числом от нуля.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const cars = getGarageCars();

            const existingCar = cars.find(
                candidate => candidate.id === id
            );

            if (!existingCar) {
                setError('Автомобиль больше не найден в гараже.');
                return;
            }

            const manualValues = mapManualFormToCar(form);

            const updatedCar: Car = {
                ...existingCar,
                ...manualValues,
                id: existingCar.id,
                addedAt: existingCar.addedAt,
                catalogBrandSlug:
                    form.catalogBrandSlug?.trim() || undefined,
                catalogModelSlug:
                    form.catalogModelSlug?.trim() || undefined,
                catalogModificationId:
                    form.catalogModificationId?.trim() ||
                    undefined,
                modificationName:
                    form.modificationName?.trim() || undefined,
                currentMileage: mileage,
                notes: form.notes.trim() || undefined,
                updatedAt: new Date().toISOString(),
            };

            saveGarageCars(
                cars.map(candidate =>
                    candidate.id === id
                        ? updatedCar
                        : candidate
                )
            );

            setCar(updatedCar);

            try {
                submitCarCatalogReview({
                    brand: updatedCar.make,
                    model: updatedCar.model,
                    year: updatedCar.year,
                    engine: updatedCar.engine ?? '',
                    carSpecs: {
                        vin: updatedCar.vin,
                        bodyClass: updatedCar.bodyClass,
                        displacementL: updatedCar.displacementL,
                        fuel: updatedCar.fuel,
                        transmission: updatedCar.transmission,
                        driveType: updatedCar.driveType,
                        color: updatedCar.color,
                        trim: updatedCar.trim,
                    },
                });
            } catch {
                setError(
                    'Автомобиль сохранён, но отправить характеристики на модерацию не удалось. Попробуйте сохранить ещё раз.'
                );

                return;
            }

            router.push(`/garage/${id}`);

        } catch {
            setError(
                'Не удалось сохранить изменения. Попробуйте ещё раз.'
            );
        } finally {
            setSaving(false);
        }
    };

    return {
        car,
        loading,
        saving,
        error,
        form,
        updateField,
        handleChange,
        handleSave,
    };
}