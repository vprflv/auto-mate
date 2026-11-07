import type { PartForm } from '../types/serviceForm';

import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { getFluidCategoriesFor } from '@/features/garage/lib/getFluidCategories';
import {PART_AXLE_LABELS, PART_SIDE_LABELS} from "@/types/partInstallation";

type Classification = Pick<
    PartForm,
    | 'itemType'
    | 'partCategory'
    | 'subcategory'
    | 'fluidCategory'
>;

const SUBCATEGORY_NAMES: Record<string, string> = {
    oil: 'Фильтр масляный',
    air: 'Фильтр воздушный',
    cabin: 'Фильтр салонный',
    fuel: 'Фильтр топливный',
    transmission: 'Фильтр трансмиссии',

    pads: 'Колодки тормозные',
    discs: 'Диск тормозной',
    hoses: 'Шланг тормозной',
    caliperGuides: 'Направляющие суппорта',
    calipers: 'Суппорт тормозной',
    drums: 'Барабан тормозной',

    sparkPlugs: 'Свеча зажигания',
    belts: 'Ремень',
    gaskets: 'Прокладка',
    sensors: 'Датчик',

    filter: 'Фильтр КПП',
    mechatronics: 'Мехатроника',

    shock: 'Амортизатор',
    arms: 'Рычаг подвески',
    bushings: 'Сайлентблок',
    balls: 'Опора шаровая',

    wipers: 'Щётки стеклоочистителя',
    bulbs: 'Лампа',
    battery: 'Аккумулятор',
    mirrors: 'Зеркало',
    optics: 'Оптика',
};

export function suggestServicePartName(
    part: Classification
): string {
    if (part.itemType === 'fluid') {
        return getFluidCategoriesFor().find(
            category => category.id === part.fluidCategory
        )?.label ?? '';
    }

    if (!part.subcategory || part.subcategory === 'other') {
        return '';
    }

    const subcategory = getSubcategoriesFor(
        part.partCategory
    ).find(
        item => item.id === part.subcategory
    );

    if (!subcategory) return '';

    // Для готовых разделов — подготовленное название.
    // Для пользовательских — выбранное пользователем название.
    return SUBCATEGORY_NAMES[subcategory.id] ??
        subcategory.label;
}

export function formatPartNameWithInstallation(
    name: string,
    { axle, side }: PartInstallation
): string {
    if (!name.trim() || (!axle && !side)) {
        return name;
    }

    if (name === 'Диск тормозной') {
        const axleLabels = {
            front: 'передний',
            rear: 'задний',
            both: 'передний и задний',
        };

        const sideLabels = {
            left: 'левый',
            right: 'правый',
            both: 'левый и правый',
        };

        return [
            name,
            axle ? axleLabels[axle] : '',
            side ? sideLabels[side] : '',
        ].filter(Boolean).join(' ');
    }

    const location = [
        axle ? PART_AXLE_LABELS[axle].toLowerCase() : '',
        side ? PART_SIDE_LABELS[side].toLowerCase() : '',
    ].filter(Boolean).join(', ');

    return `${name} (${location})`;
}