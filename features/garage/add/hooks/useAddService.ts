
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Car, ServiceRecord, ServicePart } from '@/types';
import {
    createEmptyPart,
    PartForm,
} from '@/features/garage/add/types/serviceForm';
import { STORAGE_KEYS } from '@/features/garage/add/lib/config/storage';
import { syncServicePartsToCar } from '@/features/garage/lib/syncServiceToCar';

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

    useEffect(() => {
        const data = localStorage.getItem(STORAGE_KEYS.garage);

        if (data) {
            const cars: Car[] = JSON.parse(data);
            const found =
                cars.find((c) => c.id === carId) || null;

            setCar(found);

            if (found?.currentMileage) {
                setMileage(String(found.currentMileage));
            }
        }

        setLoading(false);
    }, [carId]);

    const addPart = () => {
        setParts((prev) => [...prev, createEmptyPart()]);
    };

    const updatePart = (
        id: string,
        field: keyof PartForm,
        value: string
    ) => {
        setParts((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, [field]: value }
                    : p
            )
        );
    };

    const removePart = (id: string) => {
        setParts((prev) =>
            prev.filter((p) => p.id !== id)
        );
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
                toast.error(
                    'У каждого расходника должно быть название'
                );
                return;
            }
        }

        setSaving(true);

        const serviceParts: ServicePart[] = parts.map((p) => ({
            id: p.id,
            oemNumber: p.oemNumber.trim() || undefined,
            brand: p.brand.trim() || undefined,
            name: p.name.trim(),
            quantity: parseInt(p.quantity, 10) || 1,
            itemType: p.itemType,
            fluidCategory:
                p.itemType === 'fluid'
                    ? p.fluidCategory
                    : undefined,
            partCategory:
                p.itemType === 'part'
                    ? p.partCategory
                    : undefined,
            subcategory:
                p.itemType === 'part'
                    ? p.subcategory
                    : undefined,
        }));

        const newRecord: ServiceRecord = {
            id: crypto.randomUUID(),
            carId,
            date,
            mileage: mileage
                ? parseInt(mileage, 10)
                : undefined,
            title: title.trim(),
            description:
                description.trim() || undefined,
            parts: serviceParts,
            cost: cost
                ? parseFloat(cost)
                : undefined,
            photos:
                photos.length > 0
                    ? photos
                    : undefined,
            createdAt: new Date().toISOString(),
        };

        const serviceData =
            localStorage.getItem('automate-service');

        const records: ServiceRecord[] = serviceData
            ? JSON.parse(serviceData)
            : [];

        records.push(newRecord);

        localStorage.setItem(
            'automate-service',
            JSON.stringify(records)
        );

        syncServicePartsToCar(carId, serviceParts);

        if (mileage) {
            const garageData =
                localStorage.getItem('automate-garage');

            if (garageData) {
                const cars: Car[] = JSON.parse(garageData);

                const updatedCars = cars.map((c) =>
                    c.id === carId
                        ? {
                              ...c,
                              currentMileage:
                                  parseInt(mileage, 10),
                              updatedAt:
                                  new Date().toISOString(),
                          }
                        : c
                );

                localStorage.setItem(
                    'automate-garage',
                    JSON.stringify(updatedCars)
                );
            }
        }

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

