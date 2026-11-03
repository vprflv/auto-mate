'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type {
    Car,
    ServiceRecord,
    ServicePart,
} from '@/types';

import {
    createEmptyPart,
} from '@/features/garage/add/types/serviceForm';

import type {
    PartForm,
} from '@/features/garage/add/types/serviceForm';

import {
    STORAGE_KEYS,
} from '@/features/garage/add/lib/config/storage';

import {
    syncServicePartsToCar,
} from '@/features/garage/lib/syncServiceToCar';

import {
    systemStore,
} from '@/features/admin/lib/systemStore';

import {
    suggestServicePartName,
} from '../lib/suggestServicePartName';

export function useAddService(carId: string) {
    const router = useRouter();

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');

    const [date, setDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const [mileage, setMileage] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [parts, setParts] = useState<PartForm[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);

    const manuallyNamedPartIds = useRef(
        new Set<string>()
    );

    useEffect(() => {
        const data = localStorage.getItem(
            STORAGE_KEYS.garage
        );

        if (data) {
            const cars: Car[] = JSON.parse(data);

            const found = cars.find(
                item => item.id === carId
            ) || null;

            setCar(found);

            if (found?.currentMileage !== undefined) {
                setMileage(
                    String(found.currentMileage)
                );
            }
        }

        setLoading(false);
    }, [carId]);

    const addPart = () => {
        const part = createEmptyPart();

        setParts(previous => [
            ...previous,
            {
                ...part,
                name: suggestServicePartName(part),
            },
        ]);
    };

    const updatePart = (
        id: string,
        field: keyof PartForm,
        value: string
    ) => {
        if (field === 'name') {
            manuallyNamedPartIds.current.add(id);
        }

        const classificationChanged = [
            'itemType',
            'partCategory',
            'subcategory',
            'fluidCategory',
        ].includes(field);

        const manuallyNamed =
            manuallyNamedPartIds.current.has(id);

        setParts(previous =>
            previous.map(part => {
                if (part.id !== id) return part;

                const updated: PartForm = {
                    ...part,
                    [field]: value,
                };

                if (
                    !classificationChanged ||
                    manuallyNamed
                ) {
                    return updated;
                }

                const previousSuggestion =
                    suggestServicePartName(part);

                const nameIsAutomatic =
                    !part.name.trim() ||
                    part.name === previousSuggestion;

                if (!nameIsAutomatic) {
                    return updated;
                }

                return {
                    ...updated,
                    name: suggestServicePartName(updated),
                };
            })
        );
    };

    const removePart = (id: string) => {
        manuallyNamedPartIds.current.delete(id);

        setParts(previous =>
            previous.filter(part => part.id !== id)
        );
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!car || saving) return;

        if (!title.trim()) {
            toast.error('Укажите название работы');
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

        const serviceParts: ServicePart[] = parts.map(
            part => ({
                id: part.id,
                oemNumber:
                    part.oemNumber.trim() || undefined,
                brand:
                    part.brand.trim() || undefined,
                name: part.name.trim(),
                quantity:
                    parseInt(part.quantity, 10) || 1,

                itemType: part.itemType,

                fluidCategory:
                    part.itemType === 'fluid'
                        ? part.fluidCategory
                        : undefined,

                partCategory:
                    part.itemType === 'part'
                        ? part.partCategory
                        : undefined,

                subcategory:
                    part.itemType === 'part'
                        ? part.subcategory
                        : undefined,

                axle:
                    part.itemType === 'part'
                        ? part.axle || undefined
                        : undefined,

                side:
                    part.itemType === 'part'
                        ? part.side || undefined
                        : undefined,
            })
        );

        const updatedCar = syncServicePartsToCar(
            carId,
            serviceParts
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
            mileage: parsedMileage,
            title: title.trim(),

            description:
                description.trim() || undefined,

            parts: serviceParts,

            cost: cost
                ? parseFloat(cost)
                : undefined,

            photos: photos.length
                ? photos
                : undefined,

            createdAt: new Date().toISOString(),
        };

        const serviceData = localStorage.getItem(
            STORAGE_KEYS.service
        );

        const records: ServiceRecord[] = serviceData
            ? JSON.parse(serviceData)
            : [];

        records.push(newRecord);

        localStorage.setItem(
            STORAGE_KEYS.service,
            JSON.stringify(records)
        );

        let finalCar = updatedCar;

        if (parsedMileage !== undefined) {
            finalCar = {
                ...updatedCar,
                currentMileage: parsedMileage,
                updatedAt: new Date().toISOString(),
            };

            const carsData = localStorage.getItem(
                STORAGE_KEYS.garage
            );

            if (carsData) {
                const cars: Car[] = JSON.parse(carsData);

                const nextCars = cars.map(item =>
                    item.id === carId
                        ? finalCar
                        : item
                );

                localStorage.setItem(
                    STORAGE_KEYS.garage,
                    JSON.stringify(nextCars)
                );

                window.dispatchEvent(
                    new Event('automate:garage-updated')
                );
            }
        }

        // Передаём расходники и предложенное расположение
        // в общую систему.
        try {
            const adminState = systemStore.getState();
            const rawCar = car as Car & Record<string, any>;

            const effectiveVin =
                car.vin ||
                rawCar.carVin ||
                rawCar.specs?.vin ||
                '';

            const effectiveBrand =
                car.make ||
                rawCar.brand ||
                'Автомобиль';

            const effectiveModel = car.model || '';

            const effectiveYear =
                Number(car.year) ||
                new Date().getFullYear();

            const effectiveEngine =
                car.engine ||
                rawCar.engineCode ||
                rawCar.specs?.engine ||
                '';

            const effectiveEngineCode =
                rawCar.engineCode ||
                rawCar.specs?.engineCode ||
                '';

            const effectiveTransmission =
                car.transmission ||
                rawCar.gearbox ||
                rawCar.transmissionType ||
                rawCar.specs?.transmission ||
                rawCar.specs?.gearbox ||
                rawCar.specs?.transmissionType ||
                '';

            const effectiveDrivetrain =
                rawCar.drivetrain ||
                car.driveType ||
                rawCar.drive ||
                rawCar.specs?.drivetrain ||
                rawCar.specs?.driveType ||
                rawCar.specs?.drive ||
                '';

            const effectiveCarSpecs = {
                ...(
                    rawCar.carSpecs ||
                    rawCar.specs ||
                    {}
                ),

                bodyClass: car.bodyClass,
                displacementL: car.displacementL,
                fuel: car.fuel,
                trim: car.trim,
                transmission: effectiveTransmission,
                drivetrain: effectiveDrivetrain,
                driveType: effectiveDrivetrain,
            };

            let adminCar = adminState.cars.find(
                item =>
                    item.id === carId ||
                    (
                        effectiveVin &&
                        effectiveVin !== 'UNKNOWN' &&
                        item.vin === effectiveVin
                    )
            );

            if (!adminCar) {
                let user = adminState.users[0];

                if (!user) {
                    user = systemStore.createUser(
                        'Пользователь',
                        'user@auto.ru'
                    );
                }

                adminCar = systemStore.addCar({
                    garageCarId: carId,
                    userId: user.id,
                    brand: effectiveBrand,
                    model: effectiveModel,
                    year: effectiveYear,
                    vin: effectiveVin,
                    mileage: parsedMileage ?? 0,
                    engine: effectiveEngine,
                    engineCode: effectiveEngineCode,
                    transmission: effectiveTransmission,
                    driveType: effectiveDrivetrain,
                    bodyClass: car.bodyClass,
                    displacementL: car.displacementL,
                    fuel: car.fuel,
                    color: car.color,
                    carSpecs: {
                        trim: car.trim,
                    },
                });
            }

            serviceParts.forEach(part => {
                const brandLower = (part.brand || '')
                    .trim()
                    .toLowerCase();

                const isCarBrand =
                    brandLower ===
                    effectiveBrand.toLowerCase() ||
                    brandLower === 'oem' ||
                    brandLower === 'оригинал';

                const calculatedIsOem = Boolean(
                    part.oemNumber &&
                    (!part.brand || isCarBrand)
                );

                systemStore.addUserPart({
                    // Нужен ID личной машины для связи
                    // с выбранной модификацией.
                    carId,

                    carBrand: effectiveBrand,
                    carModel: effectiveModel,
                    carYear: effectiveYear,
                    carVin: effectiveVin,

                    engine: effectiveEngine,
                    engineCode: effectiveEngineCode,
                    transmission: effectiveTransmission,
                    drivetrain: effectiveDrivetrain,
                    carSpecs: effectiveCarSpecs,

                    partName: part.name,

                    partBrand:
                        part.brand ||
                        (
                            calculatedIsOem
                                ? 'OEM'
                                : 'Не указан'
                        ),

                    partArticle: part.oemNumber,
                    isOem: calculatedIsOem,

                    itemType:
                        part.itemType === 'fluid'
                            ? 'Техническая жидкость'
                            : 'Запчасть / Расходник',

                    category:
                        part.partCategory ||
                        part.fluidCategory,

                    subcategory: part.subcategory,

                    axle: part.axle,
                    side: part.side,

                    quantity: part.quantity,
                    mileage: parsedMileage,
                    source: 'user_service',

                    note:
                        `Запись ТО: "${title.trim()}"`,
                });
            });
        } catch (error) {
            console.error(
                '[useAddService] Ошибка синхронизации с админкой:',
                error
            );
        }

        setCar(finalCar);
        setSaving(false);

        toast.success('Запись ТО добавлена');
        router.push(`/garage/${carId}`);
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