'use client';

import { useEffect, useState } from 'react';
import { ServiceRecord, ServicePart } from '@/types';
import ServiceMainFields from '@/features/garage/add/components/ServiceMainFields';
import ServicePartsSection from '@/features/garage/add/components/ServicePartsSection';
import { PartForm, createEmptyPart } from '@/features/garage/add/types/serviceForm';
import ServicePhotosSection from "@/features/garage/add/components/ServicePhotosSection";

type Props = {
    record: ServiceRecord | null;
    open: boolean;
    onClose: () => void;
    onSave: (record: ServiceRecord) => void;
    onDelete?: (id: string) => void;
};

function partsToForm(parts: ServicePart[]): PartForm[] {
    return (parts || []).map((p) => ({
        id: p.id,
        name: p.name || '',
        brand: p.brand || '',
        oemNumber: p.oemNumber || '',
        quantity: String(p.quantity ?? 1),
        itemType: p.itemType || 'part',
        fluidCategory: p.fluidCategory || 'engineOil',
        partCategory: p.partCategory || 'filters',
    }));
}

function formToParts(parts: PartForm[]): ServicePart[] {
    return parts
        .filter((p) => p.name.trim())
        .map((p) => ({
            id: p.id,
            name: p.name.trim(),
            brand: p.brand.trim() || undefined,
            oemNumber: p.oemNumber.trim() || undefined,
            quantity: parseInt(p.quantity) || 1,
            itemType: p.itemType,
            fluidCategory: p.itemType === 'fluid' ? (p.fluidCategory as any) : undefined,
            partCategory: p.itemType === 'part' ? (p.partCategory as any) : undefined,
        }));
}

export default function EditServiceModal({
                                             record,
                                             open,
                                             onClose,
                                             onSave,
                                             onDelete,
                                         }: Props) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [mileage, setMileage] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [parts, setParts] = useState<PartForm[]>([]);

    const [photos, setPhotos] = useState<string[]>([])



    useEffect(() => {
        if (open && record) {
            setPhotos(record.photos || [])
            setTitle(record.title || '');
            setDate(record.date || new Date().toISOString().slice(0, 10));
            setMileage(record.mileage ? String(record.mileage) : '');
            setDescription(record.description || '');
            setCost(record.cost !== undefined ? String(record.cost) : '');
            setParts(partsToForm(record.parts || []));
        }
    }, [open, record]);

    if (!open || !record) return null;

    const addPart = () => setParts((prev) => [...prev, createEmptyPart()]);
    const updatePart = (id: string, field: keyof PartForm, value: string) => {
        setParts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    };
    const removePart = (id: string) => {
        setParts((prev) => prev.filter((p) => p.id !== id));
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert('Укажи название работы');
            return;
        }

        const updated: ServiceRecord = {
            ...record,
            title: title.trim(),
            date,
            mileage: mileage ? parseInt(mileage) : undefined,
            photos: photos.length ? photos : undefined,
            description: description.trim() || undefined,
            cost: cost ? parseFloat(cost) : undefined,
            parts: formToParts(parts),
        };


        onSave(updated);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Редактировать ТО</h3>
                    <button type="button" onClick={onClose} className="text-zinc-400 text-sm">
                        Закрыть
                    </button>
                </div>

                <ServiceMainFields
                    title={title}
                    date={date}
                    mileage={mileage}
                    description={description}
                    cost={cost}
                    onTitleChange={setTitle}
                    onDateChange={setDate}
                    onMileageChange={setMileage}
                    onDescriptionChange={setDescription}
                    onCostChange={setCost}
                />

                <ServicePartsSection
                    parts={parts}
                    onAdd={addPart}
                    onChange={updatePart}
                    onRemove={removePart}
                />

                <ServicePhotosSection photos={photos} onChange={setPhotos} />



                <div className="flex gap-3 pt-2">
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                onDelete(record.id);
                                onClose();
                            }}
                            className="px-4 py-3 rounded-2xl text-red-400 text-sm border border-red-900/50"
                        >
                            Удалить
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl bg-zinc-800 text-sm"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}