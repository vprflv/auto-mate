'use client';

import { useState } from 'react';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import { PartForm } from '@/features/garage/add/types/serviceForm';
import { PartCategory } from '@/types';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { addUserCategory } from '@/features/garage/lib/userCategories';
import { addUserSubcategory } from '@/features/garage/lib/userSubcategories';
import { getCategoriesFor } from '@/features/garage/lib/getCategories';
import NamePromptModal from '@/features/garage/parts/components/NamePromptModal';

type Props = {
    part: PartForm;
    index: number;
    onChange: (id: string, field: keyof PartForm, value: string) => void;
    onRemove: (id: string) => void;
};

const fieldClass =
    'w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition';

export default function ServicePartCard({
                                            part,
                                            index,
                                            onChange,
                                            onRemove,
                                        }: Props) {
    const [, setTick] = useState(0);
    const [namePrompt, setNamePrompt] = useState<'category' | 'subcategory' | null>(null);
    const refresh = () => setTick((v) => v + 1);

    const createCategory = (name: string) => {
        const created = addUserCategory(name);
        onChange(part.id, 'partCategory', created.key);
        onChange(part.id, 'subcategory', 'other');
        refresh();
    };

    const createSubcategory = (name: string) => {
        const created = addUserSubcategory(part.partCategory as PartCategory, name);
        onChange(part.id, 'subcategory', created.key);
        refresh();
    };

    return (
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-[#A3A3A3]">Расходник #{index + 1}</span>
                <button
                    type="button"
                    onClick={() => onRemove(part.id)}
                    className="text-red-400 hover:text-red-300 text-sm transition"
                >
                    Удалить
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Тип</label>
                    <select
                        value={part.itemType}
                        onChange={(e) => onChange(part.id, 'itemType', e.target.value)}
                        className={fieldClass}
                    >
                        <option value="part">Запчасть / расходник</option>
                        <option value="fluid">Жидкость / масло</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Категория</label>
                    {part.itemType === 'fluid' ? (
                        <select
                            value={part.fluidCategory}
                            onChange={(e) =>
                                onChange(part.id, 'fluidCategory', e.target.value)
                            }
                            className={fieldClass}
                        >
                            {FLUID_CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <select
                            value={part.partCategory}
                            onChange={(e) => {
                                if (e.target.value === '__new_category__') {
                                    setNamePrompt('category');
                                    return;
                                }

                                const nextCategory = e.target.value as PartCategory;
                                const first =
                                    getSubcategoriesFor(nextCategory)[0]?.id || 'other';
                                onChange(part.id, 'partCategory', nextCategory);
                                onChange(part.id, 'subcategory', first);
                            }}
                            className={fieldClass}
                        >
                            {getCategoriesFor().map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                    {opt.isCustom ? ' ★' : ''}
                                </option>
                            ))}
                            <option value="__new_category__">+ Создать категорию</option>
                        </select>
                    )}
                </div>

                {part.itemType === 'part' && (
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-[#39FF14] mb-1">
                            Подкатегория
                        </label>
                        <select
                            value={part.subcategory}
                            onChange={(e) => {
                                if (e.target.value === '__new_subcategory__') {
                                    setNamePrompt('subcategory');
                                    return;
                                }
                                onChange(part.id, 'subcategory', e.target.value);
                            }}
                            className={fieldClass}
                        >
                            {getSubcategoriesFor(part.partCategory as PartCategory).map(
                                (sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.label}
                                        {sub.isCustom ? ' ★' : ''}
                                    </option>
                                )
                            )}
                            <option value="__new_subcategory__">
                                + Создать подкатегорию
                            </option>
                        </select>
                    </div>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Ориг. номер</label>
                    <input
                        value={part.oemNumber}
                        onChange={(e) => onChange(part.id, 'oemNumber', e.target.value)}
                        placeholder="90915-YZZD3"
                        className={fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Фирма</label>
                    <input
                        value={part.brand}
                        onChange={(e) => onChange(part.id, 'brand', e.target.value)}
                        placeholder="Mann, Motul, Bosch..."
                        className={fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Название *</label>
                    <input
                        value={part.name}
                        onChange={(e) => onChange(part.id, 'name', e.target.value)}
                        required
                        placeholder="Масляный фильтр"
                        className={fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Количество</label>
                    <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => onChange(part.id, 'quantity', e.target.value)}
                        className={fieldClass}
                    />
                </div>
            </div>

            <NamePromptModal
                open={!!namePrompt}
                title={
                    namePrompt === 'subcategory'
                        ? 'Новая подкатегория'
                        : 'Новая категория'
                }
                placeholder={
                    namePrompt === 'subcategory'
                        ? 'Колодки, диски…'
                        : 'Электрика, салон…'
                }
                onClose={() => setNamePrompt(null)}
                onSubmit={(name) => {
                    if (namePrompt === 'category') createCategory(name);
                    if (namePrompt === 'subcategory') createSubcategory(name);
                }}
            />
        </div>
    );
}