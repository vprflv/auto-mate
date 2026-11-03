import type { PartForm } from '../types/serviceForm';

import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { getFluidCategoriesFor } from '@/features/garage/lib/getFluidCategories';

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