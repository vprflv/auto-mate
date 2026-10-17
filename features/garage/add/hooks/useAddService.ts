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
import { systemStore } from '@/features/admin/lib/systemStore';

export function useAddService(carId: string) {
    const router = useRouter();

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [mileage, setMileage] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [parts, setParts] = useState<PartForm[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);

    useEffect(() => {
        const data = localStorage.getItem(STORAGE_KEYS.garage);

        if (data) {
            const cars: Car[] = JSON.parse(data);
            const found = cars.find((item) => item.id === carId) || null;

            setCar(found);

            if (found?.currentMileage !== undefined) {
                setMileage(String(found.currentMileage));
            }
        }

        setLoading(false);
    }, [carId]);

    const addPart = () => {
        setParts((prev) => [...prev, createEmptyPart()]);
    };

    const updatePart = (id: string, field: keyof PartForm, value: string) => {
        setParts((prev) =>
            prev.map((part) =>
                part.id === id ? { ...part, [field]: value } : part
            )
        );
    };

    const removePart = (id: string) => {
        setParts((prev) => prev.filter((part) => part.id !== id));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!car) return;

        if (!title.trim()) {
            toast.error('Укажите название работы');
            return;
        }

        for (const part of parts) {
            if (!part.name.trim()) {
                toast.error('У каждого расходника должно быть название');
                return;
            }
        }

        setSaving(true);

        const parsedMileage = mileage ? parseInt(mileage, 10) : undefined;

        const serviceParts: ServicePart[] = parts.map((part) => ({
            id: part.id,
            oemNumber: part.oemNumber.trim() || undefined,
            brand: part.brand.trim() || undefined,
            name: part.name.trim(),
            quantity: parseInt(part.quantity, 10) || 1,
            itemType: part.itemType,
            fluidCategory: part.itemType === 'fluid' ? part.fluidCategory : undefined,
            partCategory: part.itemType === 'part' ? part.partCategory : undefined,
            subcategory: part.itemType === 'part' ? part.subcategory : undefined,
        }));

        const updatedCar = syncServicePartsToCar(carId, serviceParts);

        if (!updatedCar) {
            setSaving(false);
            toast.error('Не удалось обновить автомобиль');
            return;
        }

        const newRecord: ServiceRecord = {
            id: crypto.randomUUID(),
            carId,
            date,
            mileage: parsedMileage,
            title: title.trim(),
            description: description.trim() || undefined,
            parts: serviceParts,
            cost: cost ? parseFloat(cost) : undefined,
            photos: photos.length > 0 ? photos : undefined,
            createdAt: new Date().toISOString(),
        };

        const serviceData = localStorage.getItem(STORAGE_KEYS.service);
        const records: ServiceRecord[] = serviceData ? JSON.parse(serviceData) : [];
        records.push(newRecord);
        localStorage.setItem(STORAGE_KEYS.service, JSON.stringify(records));

        let finalCar = updatedCar;

        if (parsedMileage !== undefined) {
            finalCar = {
                ...updatedCar,
                currentMileage: parsedMileage,
                updatedAt: new Date().toISOString(),
            };

            const carsData = localStorage.getItem(STORAGE_KEYS.garage);
            if (carsData) {
                const cars: Car[] = JSON.parse(carsData);
                const nextCars = cars.map((item) =>
                    item.id === carId ? finalCar : item
                );
                localStorage.setItem(STORAGE_KEYS.garage, JSON.stringify(nextCars));
                window.dispatchEvent(new Event('automate:garage-updated'));
            }
        }

        // Синхронизация с системой краудсорсинга и очередью модерации
        try {
            const adminState = systemStore.getState();

            const effectiveVin =
                car.vin ||
                (car as any).carVin ||
                (car as any).specs?.vin ||
                '';

            const effectiveBrand =
                car.make ||
                (car as any).brand ||
                'Автомобиль';

            const effectiveModel = car.model || '';
            const effectiveYear = Number(car.year) || new Date().getFullYear();

            const effectiveEngine =
                (car as any).engine ||
                (car as any).engineCode ||
                (car as any).specs?.engine ||
                '';

            const effectiveEngineCode =
                (car as any).engineCode ||
                (car as any).specs?.engineCode ||
                '';

            const effectiveTransmission =
                (car as any).transmission ||
                (car as any).gearbox ||
                (car as any).transmissionType ||
                (car as any).specs?.transmission ||
                (car as any).specs?.gearbox ||
                (car as any).specs?.transmissionType ||
                '';

            const effectiveDrivetrain =
                (car as any).drivetrain ||
                (car as any).driveType ||
                (car as any).drive ||
                (car as any).specs?.drivetrain ||
                (car as any).specs?.driveType ||
                (car as any).specs?.drive ||
                '';

            const effectiveCarSpecs = {
                ...((car as any).carSpecs || (car as any).specs || {}),
                transmission: effectiveTransmission,
                drivetrain: effectiveDrivetrain,
            };

            let adminCar = adminState.cars.find(
                (c) => c.id === carId || (effectiveVin && c.vin === effectiveVin)
            );

            if (!adminCar) {
                let user = adminState.users[0];
                if (!user) {
                    user = systemStore.createUser('Пользователь', 'user@auto.ru');
                }

                adminCar = systemStore.addCar({
                    userId: user.id,
                    brand: effectiveBrand,
                    model: effectiveModel,
                    year: effectiveYear,
                    vin: effectiveVin,
                    mileage: parsedMileage || 0,
                    engine: effectiveEngine,
                });
            }

            serviceParts.forEach((sp) => {
                const brandLower = (sp.brand || '').trim().toLowerCase();
                const isCarBrand =
                    brandLower === effectiveBrand.toLowerCase() ||
                    brandLower === 'oem' ||
                    brandLower === 'оригинал';

                const calculatedIsOem = Boolean(sp.oemNumber && (!sp.brand || isCarBrand));

                systemStore.addUserPart({
                    carId: adminCar.id,
                    carBrand: effectiveBrand,
                    carModel: effectiveModel,
                    carYear: effectiveYear,
                    carVin: effectiveVin,
                    engine: effectiveEngine,
                    engineCode: effectiveEngineCode,
                    transmission: effectiveTransmission,
                    drivetrain: effectiveDrivetrain,
                    carSpecs: effectiveCarSpecs,
                    partName: sp.name,
                    partBrand: sp.brand || (calculatedIsOem ? 'OEM' : 'Не указан'),
                    partArticle: sp.oemNumber,
                    isOem: calculatedIsOem,
                    itemType: sp.itemType === 'fluid' ? 'Техническая жидкость' : 'Запчасть / Расходник',
                    category: sp.partCategory || sp.fluidCategory,
                    subcategory: sp.subcategory,
                    quantity: sp.quantity,
                    mileage: parsedMileage,
                    source: 'user_service',
                    note: `Запись ТО: "${title.trim()}"`,
                });
            });
        } catch (err) {
            console.error('[useAddService] Ошибка синхронизации с админкой:', err);
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