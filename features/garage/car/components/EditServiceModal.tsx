'use client';

import { useEffect, useState } from 'react';

import { ServiceRecord, ServicePart } from '@/types';
import ServiceMainFields from '@/features/garage/add/components/ServiceMainFields';
import ServicePartsSection from '@/features/garage/add/components/ServicePartsSection';
import {
    PartForm,
    createEmptyPart,
} from '@/features/garage/add/types/serviceForm';
import ServicePhotosSection from '@/features/garage/add/components/ServicePhotosSection';
import {toast} from "sonner";

type Props = {
    record: ServiceRecord | null;
    open: boolean;
    onClose: () => void;
    onSave: (record: ServiceRecord) => void;
    onDelete?: (id: string) => void;
};

function partsToForm(parts: ServicePart[]): PartForm[] {
    return parts.map((p) => ({
        id: p.id,
        name: p.name || '',
        brand: p.brand || '',
        oemNumber: p.oemNumber || '',
        quantity: String(p.quantity ?? 1),
        itemType: p.itemType,
        fluidCategory: p.fluidCategory || 'engineOil',
        partCategory: p.partCategory || 'filters',
        subcategory: p.subcategory || '',
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
                p.subcategory.trim() || undefined,
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
    const [photos, setPhotos] = useState<string[]>([]);

    useEffect(() => {
        if (!open || !record) return;

        setPhotos(record.photos || []);
        setTitle(record.title || '');
        setDate(
            record.date ||
            new Date().toISOString().slice(0, 10)
        );
        setMileage(
            record.mileage ? String(record.mileage) : ''
        );
        setDescription(record.description || '');
        setCost(
            record.cost !== undefined
                ? String(record.cost)
                : ''
        );
        setParts(partsToForm(record.parts || []));
    }, [open, record]);

    useEffect(() => {
        if (!open) return;

        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [open, onClose]);

    if (!open || !record) return null;

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

    const handleSave = () => {
        if (!title.trim()) {
            toast.error('Укажите название работы');
            return;
        }

        const updated: ServiceRecord = {
            ...record,
            title: title.trim(),
            date,
            mileage: mileage
                ? parseInt(mileage, 10)
                : undefined,
            photos: photos.length ? photos : undefined,
            description:
                description.trim() || undefined,
            cost: cost
                ? parseFloat(cost)
                : undefined,
            parts: formToParts(parts),
        };

        onSave(updated);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            {/* Overlay */}
            <div
                className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)]/20 px-5 py-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                        Редактировать ТО
                    </h3>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClose();
                        }}
                        className="relative z-20 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] active:scale-95"
                    >
                        Закрыть
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="space-y-5">
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

                        <ServicePhotosSection
                            photos={photos}
                            onChange={setPhotos}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 gap-3 border-t border-[var(--border)]/20 bg-[var(--card)] px-5 py-4">
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                onDelete(record.id);
                                onClose();
                            }}
                            className="rounded-2xl border border-[var(--danger)]/30 px-4 py-3 text-sm text-[var(--danger)] transition hover:bg-[var(--danger)]/10 active:scale-[0.98]"
                        >
                            Удалить
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl bg-[var(--bg-elevated)] py-3 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text)] active:scale-[0.98]"
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 rounded-2xl bg-[var(--btn-primary)] py-3 text-sm font-medium text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] active:scale-[0.98]"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}