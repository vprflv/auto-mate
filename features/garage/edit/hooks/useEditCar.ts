'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car } from '@/types';
import { getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { EditCarFormValues } from '../types';

const emptyForm: EditCarFormValues = {
    make: '',
    model: '',
    year: '',
    vin: '',
    bodyClass: '',
    displacementL: '',
    cylinders: '',
    engine: '',
    fuel: '',
    driveType: '',
    transmission: '',
    doors: '',
    plantCountry: '',
    color: '',
    nickname: '',
    currentMileage: '',
    notes: '',
};

export function useEditCar() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EditCarFormValues>(emptyForm);

    useEffect(() => {
        const cars = getGarageCars();
        const found = cars.find((c) => c.id === id);

        if (found) {
            setCar(found);
            setForm({
                make: found.make || '',
                model: found.model || '',
                year: String(found.year || ''),
                vin: found.vin || '',
                bodyClass: found.bodyClass || '',
                displacementL: found.displacementL || '',
                cylinders: found.cylinders || '',
                engine: found.engine || '',
                fuel: found.fuel || '',
                driveType: found.driveType || '',
                transmission: found.transmission || '',
                doors: found.doors || '',
                plantCountry: found.plantCountry || '',
                color: found.color || '',
                nickname: found.nickname || '',
                currentMileage: found.currentMileage ? String(found.currentMileage) : '',
                notes: found.notes || '',
            });
        }

        setLoading(false);
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!car) return;

        setSaving(true);

        const cars = getGarageCars();
        const updatedCars = cars.map((c) => {
            if (c.id !== id) return c;

            return {
                ...c,
                make: form.make.trim() || c.make,
                model: form.model.trim() || c.model,
                year: parseInt(form.year) || c.year,
                vin: form.vin.trim().toUpperCase() || c.vin,
                bodyClass: form.bodyClass.trim() || undefined,
                displacementL: form.displacementL.trim() || undefined,
                cylinders: form.cylinders.trim() || undefined,
                engine: form.engine.trim() || undefined,
                fuel: form.fuel.trim() || undefined,
                driveType: form.driveType.trim() || undefined,
                transmission: form.transmission.trim() || undefined,
                doors: form.doors.trim() || undefined,
                plantCountry: form.plantCountry.trim() || undefined,
                color: form.color.trim() || undefined,
                nickname: form.nickname.trim() || undefined,
                currentMileage: form.currentMileage
                    ? parseInt(form.currentMileage)
                    : undefined,
                notes: form.notes.trim() || undefined,
                updatedAt: new Date().toISOString(),
            };
        });

        saveGarageCars(updatedCars);
        setSaving(false);
        router.push('/garage');
    };

    return { car, loading, saving, form, handleChange, handleSave };
}