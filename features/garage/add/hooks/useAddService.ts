'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
    Car,
    ServiceRecord,
    ServicePart,
} from '@/types';

import {
    createEmptyPart,
    PartForm,
} from '@/features/garage/add/types/serviceForm';

import { STORAGE_KEYS } from '@/features/garage/add/lib/config/storage';

import { syncServicePartsToCar } from '@/features/garage/lib/syncServiceToCar';

export function useAddService(carId: string) {
    const router = useRouter();

    const [car, setCar] =
        useState<Car | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [title, setTitle] = useState('');

    const [date, setDate] = useState(
        new Date()
            .toISOString()
            .slice(0, 10)
    );

    const [mileage, setMileage] =
        useState('');

    const [description, setDescription] =
        useState('');

    const [cost, setCost] =
        useState('');

    const [parts, setParts] =
        useState<PartForm[]>([]);

    const [photos, setPhotos] =
        useState<string[]>([]);

    useEffect(() => {
        const data =
            localStorage.getItem(
                STORAGE_KEYS.garage
            );

        if (data) {
            const cars: Car[] =
                JSON.parse(data);

            const found =
                cars.find(
                    (item) =>
                        item.id === carId
                ) || null;

            setCar(found);

            if (
                found?.currentMileage !==
                undefined
            ) {
                setMileage(
                    String(
                        found.currentMileage
                    )
                );
            }
        }

        setLoading(false);
    }, [carId]);

    const addPart = () => {
        setParts((prev) => [
            ...prev,
            createEmptyPart(),
        ]);
    };

    const updatePart = (
        id: string,
        field: keyof PartForm,
        value: string
    ) => {
        setParts((prev) =>
            prev.map((part) =>
                part.id === id
                    ? {
                        ...part,
                        [field]: value,
                    }
                    : part
            )
        );
    };

    const removePart = (id: string) => {
        setParts((prev) =>
            prev.filter(
                (part) => part.id !== id
            )
        );
    };

    const submit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!car) return;

        if (!title.trim()) {
            toast.error(
                'Укажите название работы'
            );
            return;
        }

        for (const part of parts) {
            if (!part.name.trim()) {
                toast.error(
                    'У каждого расходника должно быть название'
                );
                return;
            }
        }

        setSaving(true);

        const parsedMileage = mileage
            ? parseInt(mileage, 10)
            : undefined;

        const serviceParts: ServicePart[] =
            parts.map((part) => ({
                id: part.id,

                oemNumber:
                    part.oemNumber.trim() ||
                    undefined,

                brand:
                    part.brand.trim() ||
                    undefined,

                name: part.name.trim(),

                quantity:
                    parseInt(
                        part.quantity,
                        10
                    ) || 1,

                itemType:
                part.itemType,

                fluidCategory:
                    part.itemType ===
                    'fluid'
                        ? part.fluidCategory
                        : undefined,

                partCategory:
                    part.itemType ===
                    'part'
                        ? part.partCategory
                        : undefined,

                subcategory:
                    part.itemType ===
                    'part'
                        ? part.subcategory
                        : undefined,
            }));

        /*
         * Сначала обновляем автомобиль:
         * - запчасти
         * - жидкости
         * - пробег
         *
         * Всё сохраняется одной операцией.
         */
        const updatedCar =
            syncServicePartsToCar(
                carId,
                serviceParts,
                parsedMileage
            );

        if (!updatedCar) {
            setSaving(false);

            toast.error(
                'Не удалось обновить автомобиль'
            );

            return;
        }

        const newRecord: ServiceRecord = {
            id: crypto.randomUUID(),

            carId,

            date,

            mileage:
            parsedMileage,

            title:
                title.trim(),

            description:
                description.trim() ||
                undefined,

            parts:
            serviceParts,

            cost:
                cost
                    ? parseFloat(cost)
                    : undefined,

            photos:
                photos.length > 0
                    ? photos
                    : undefined,

            createdAt:
                new Date().toISOString(),
        };

        const serviceData =
            localStorage.getItem(
                STORAGE_KEYS.service
            );

        const records: ServiceRecord[] =
            serviceData
                ? JSON.parse(serviceData)
                : [];

        records.push(newRecord);

        localStorage.setItem(
            STORAGE_KEYS.service,
            JSON.stringify(records)
        );

        setCar(updatedCar);
        setSaving(false);

        toast.success(
            'Запись ТО добавлена'
        );

        router.push(
            `/garage/${carId}`
        );
    };

    return {
        car,
        loading,
        saving,

        title,
        setTitle,

        date,
        setDate,

        mileage,
        setMileage,

        description,
        setDescription,

        cost,
        setCost,

        parts,

        addPart,
        updatePart,
        removePart,

        submit,

        photos,
        setPhotos,
    };
}