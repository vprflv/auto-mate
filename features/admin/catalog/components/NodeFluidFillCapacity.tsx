'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { StoredCatalogNode, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { saveFluidFillCapacity } from '@/features/admin/lib/system-store/actions/fluidFillCapacities';
import { getNodeFillCapacity, getNodeFluidCategory } from '@/features/catalog/lib/fluidFillCapacities';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';

const fieldClass = 'rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm';

export function NodeFluidFillCapacity({ node, model }: { node: StoredCatalogNode; model: StoredMasterModel }) {
    const [selectedId, setSelectedId] = useState('');
    const modifications = model.modifications ?? [];
    const modification = modifications.length === 1
        ? modifications[0]
        : modifications.find(item => item.id === selectedId);
    const category = getNodeFluidCategory(node);
    const liters = modification && getNodeFillCapacity(node, modification);

    function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!modification) return;

        const form = event.currentTarget;
        const data = new FormData(form);
        const value = String(data.get('liters') ?? '').trim();
        const fluidType = FLUID_CATEGORY_OPTIONS.find(option => option.value === data.get('category'));

        try {
            saveFluidFillCapacity(node.id, modification.id, fluidType?.value ?? null, value);
            toast.success(value ? 'Заправочный объём сохранён' : 'Заправочный объём удалён');
            form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Не удалось сохранить объём.');
        }
    }

    return (
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="font-semibold">Заправочный объём</h2>
            {modifications.length > 0 ? (
                <label className="grid max-w-md gap-1 text-sm">
                    Модификация
                    <select className={fieldClass} value={modification?.id ?? ''} onChange={event => setSelectedId(event.target.value)}>
                        <option value="" disabled>Выберите модификацию</option>
                        {modifications.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                </label>
            ) : (
                <p className="text-sm text-[var(--text-muted)]">Сначала добавьте модификацию модели.</p>
            )}

            {modification && (
                <form
                    key={JSON.stringify([modification.id, category, liters])}
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={handleSave}
                >
                    <label className="grid gap-1 text-sm">
                        Объём, л
                        <input
                            name="liters"
                            inputMode="decimal"
                            placeholder="4,0"
                            defaultValue={liters?.toLocaleString('ru-RU', {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 3,
                                useGrouping: false,
                            }) ?? ''}
                            className={`${fieldClass} w-24`}
                        />
                    </label>
                    <label className="grid gap-1 text-sm">
                        Тип жидкости для подсказки в ТО
                        <select name="category" defaultValue={category ?? ''} className={fieldClass}>
                            <option value="">Показывать только в каталоге</option>
                            {FLUID_CATEGORY_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <button type="submit" className="rounded-xl bg-[var(--btn-primary)] px-3 py-2 text-sm font-medium text-[var(--btn-primary-text)]">
                        Сохранить
                    </button>
                    <p className="w-full text-xs text-[var(--text-muted)]">
                        Чтобы убрать объём для этой модификации, очистите поле и сохраните. Тип жидкости задаётся для всей ветки.
                    </p>
                </form>
            )}
        </section>
    );
}
