
'use client';
import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import { PartForm } from '@/features/garage/add/types/serviceForm';
import { PartCategory } from '@/types';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { getCategoriesFor } from '@/features/garage/lib/getCategories';
import {getFluidCategoriesFor} from "@/features/garage/lib/getFluidCategories";

type Props = {
    part: PartForm;
    onChange: (
        id: string,
        field: keyof PartForm,
        value: string
    ) => void;
    onCreateCategory: () => void;
    onCreateSubcategory: () => void;
};

const triggerClass =
    'w-full rounded-xl border border-[var(--border)]/40 bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] shadow-none transition-all duration-200 hover:border-[var(--border)]/60 hover:bg-[var(--bg)] focus:border-[var(--link)] focus:ring-2 focus:ring-[var(--link)]/10 data-[placeholder]:text-[var(--text-dim)]';

const contentClass =
    'z-[250] rounded-xl border border-[var(--border)]/40 bg-[var(--card)] p-1.5 text-[var(--text)] shadow-xl';

const itemClass =
    'cursor-pointer rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] outline-none transition-colors focus:bg-[var(--bg-elevated)] focus:text-[var(--text)] data-[state=checked]:bg-[var(--bg-elevated)] data-[state=checked]:text-[var(--link)]';

const labelClass =
    'mb-1.5 block text-xs font-medium text-[var(--text-muted)]';

export default function ServicePartClassification({
    part,
    onChange,
    onCreateCategory,
    onCreateSubcategory,
}: Props) {
    const subcategories = getSubcategoriesFor(
        part.partCategory as PartCategory
    );

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div>
                <label className={labelClass}>Тип</label>

                <Select
                    value={part.itemType}
                    onValueChange={(value) =>
                        onChange(
                            part.id,
                            'itemType',
                            value
                        )
                    }
                >
                    <SelectTrigger className={triggerClass}>
                        <SelectValue placeholder="Выбери тип" />
                    </SelectTrigger>

                    <SelectContent
                        position="popper"
                        align="start"
                        className={contentClass}
                    >
                        <SelectItem
                            value="part"
                            className={itemClass}
                        >
                            Запчасть / расходник
                        </SelectItem>

                        <SelectItem
                            value="fluid"
                            className={itemClass}
                        >
                            Жидкость / масло
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className={labelClass}>
                    Категория
                </label>

                {part.itemType === 'fluid' ? (
                    <Select
                        value={part.fluidCategory}
                        onValueChange={(value) => {
                            if (value === '__new_fluid_category__') {
                                onCreateCategory();
                                return;
                            }

                            onChange(
                                part.id,
                                'fluidCategory',
                                value
                            );
                        }}
                    >
                        <SelectTrigger className={triggerClass}>
                            <SelectValue placeholder="Выбери категорию" />
                        </SelectTrigger>

                        <SelectContent
                            position="popper"
                            align="start"
                            className={contentClass}
                        >
                            {getFluidCategoriesFor().map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={option.id}
                                    className={itemClass}
                                >
                                    {option.label}
                                    {option.isCustom ? ' ★' : ''}
                                </SelectItem>
                            ))}

                            <SelectItem
                                value="__new_fluid_category__"
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--link)] outline-none transition-colors focus:bg-[var(--bg-elevated)] focus:text-[var(--link)]"
                            >
                                + Создать категорию
                            </SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <Select
                        value={part.partCategory}
                        onValueChange={(value) => {
                            if (
                                value ===
                                '__new_category__'
                            ) {
                                onCreateCategory();
                                return;
                            }

                            const nextCategory =
                                value as PartCategory;

                            const first =
                                getSubcategoriesFor(
                                    nextCategory
                                )[0]?.id || 'other';

                            onChange(
                                part.id,
                                'partCategory',
                                nextCategory
                            );

                            onChange(
                                part.id,
                                'subcategory',
                                first
                            );
                        }}
                    >
                        <SelectTrigger
                            className={triggerClass}
                        >
                            <SelectValue placeholder="Выбери категорию" />
                        </SelectTrigger>

                        <SelectContent
                            position="popper"
                            align="start"
                            className={contentClass}
                        >
                            {getCategoriesFor().map(
                                (option) => (
                                    <SelectItem
                                        key={option.id}
                                        value={option.id}
                                        className={itemClass}
                                    >
                                        {option.label}
                                        {option.isCustom
                                            ? ' ★'
                                            : ''}
                                    </SelectItem>
                                )
                            )}





                            <SelectItem
                                value="__new_category__"
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--link)] outline-none transition-colors focus:bg-[var(--bg-elevated)] focus:text-[var(--link)]"
                            >
                                + Создать категорию
                            </SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {part.itemType === 'part' && (
                <div className="sm:col-span-2">
                    <label className={labelClass}>
                        Подкатегория
                    </label>

                    <Select
                        value={part.subcategory}
                        onValueChange={(value) => {
                            if (
                                value ===
                                '__new_subcategory__'
                            ) {
                                onCreateSubcategory();
                                return;
                            }

                            onChange(
                                part.id,
                                'subcategory',
                                value
                            );
                        }}
                    >
                        <SelectTrigger
                            className={triggerClass}
                        >
                            <SelectValue placeholder="Выбери подкатегорию" />
                        </SelectTrigger>

                        <SelectContent
                            position="popper"
                            align="start"
                            className={contentClass}
                        >
                            {subcategories.map(
                                (subcategory) => (
                                    <SelectItem
                                        key={subcategory.id}
                                        value={subcategory.id}
                                        className={itemClass}
                                    >
                                        {subcategory.label}
                                        {subcategory.isCustom
                                            ? ' ★'
                                            : ''}
                                    </SelectItem>
                                )
                            )}

                            <SelectItem
                                value="__new_subcategory__"
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--link)] outline-none transition-colors focus:bg-[var(--bg-elevated)] focus:text-[var(--link)]"
                            >
                                + Создать подкатегорию
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}

