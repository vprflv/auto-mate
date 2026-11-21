
'use client';

import { useEffect, useState } from 'react';
import type { ServiceRecord } from '@/types';
import { STORAGE_KEYS } from '@/features/garage/add/lib/config/storage';
import { getRecommendedFillCapacity } from '@/features/garage/add/lib/getRecommendedFillCapacity';
import ServicePartCard from './ServicePartCard';
import { PartForm } from '@/features/garage/add/types/serviceForm';

import type { FluidFillCapacities } from '@/types/oil';
import { storage } from '@/features/admin/lib/system-store/storage';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';
import { formatFillCapacity, getServiceFillCapacities } from '@/features/catalog/lib/fluidFillCapacities';

function getReferenceFillCapacity(part: PartForm, capacities?: FluidFillCapacities) {
    const liters = capacities?.[part.fluidCategory];
    if (part.itemType === 'fluid' && typeof liters === 'number' && liters > 0) {
        return formatFillCapacity(liters);
    }
}

type Props = {
    carId: string;
    serviceDate: string;
    excludedRecordId?: string;
    parts: PartForm[];
    onAdd: () => void;
    onChange: (
        id: string,
        field: keyof PartForm,
        value: string
    ) => void;
    onRemove: (id: string) => void;
};

export default function ServicePartsSection({
                                                carId,
    serviceDate,
    excludedRecordId,
    parts,
    onAdd,
    onChange,
    onRemove,
}: Props) {
    const [history, setHistory] = useState<{ carId: string; records: ServiceRecord[] } | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.service);
            const records: ServiceRecord[] = stored ? JSON.parse(stored) : [];
            setHistory({ carId, records: records.filter(record => record.carId === carId) });
        } catch {
            setHistory(null);
        }
    }, [carId]);

    const [reference, setReference] = useState<{ carId: string; capacities?: FluidFillCapacities } | null>(null);

    useEffect(() => {
        const loadReference = () => {
            try {
                const car = getGarageCars().find(item => item.id === carId);
                const state = storage.getState();
                const identity = car && resolveCarCatalogIdentity(car, state.masterModels);
                setReference({
                    carId,
                    capacities: identity ? getServiceFillCapacities(state.catalogNodes, identity.model, identity.modification) : undefined,
                });
            } catch {
                setReference(null);
            }
        };

        loadReference();
        window.addEventListener('system-store-updated', loadReference);
        window.addEventListener('garage-updated', loadReference);
        window.addEventListener('storage', loadReference);
        return () => {
            window.removeEventListener('system-store-updated', loadReference);
            window.removeEventListener('garage-updated', loadReference);
            window.removeEventListener('storage', loadReference);
        };
    }, [carId]);

    const records = history?.carId === carId ? history.records : [];
    const capacities = reference?.carId === carId ? reference.capacities : undefined;

    return (
        <div className="rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] p-5 transition-colors duration-200 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                    Расходники
                </h2>

                <button
                    type="button"
                    onClick={onAdd}
                    className="shrink-0 rounded-xl border border-[var(--border)]/40 bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--border)]/60 hover:bg-[var(--bg-elevated)]/80 hover:text-[var(--link)] active:scale-95"
                >
                    + Добавить
                </button>
            </div>

            {parts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[var(--border)]/30 bg-[var(--bg-elevated)]/30 px-5 py-8 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                        Пока нет расходников
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                        Нажми «+ Добавить», чтобы добавить масло,
                        фильтр, колодки и т.д.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {parts.map((part, index) => (
                    <ServicePartCard
                        carId={carId}
                        key={part.id}
                        part={part}
                        index={index}
                        referenceFillCapacity={getReferenceFillCapacity(part, capacities)}
                        recommendedFillCapacity={getRecommendedFillCapacity(part, records, serviceDate, excludedRecordId)}
                        onChange={onChange}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
}

