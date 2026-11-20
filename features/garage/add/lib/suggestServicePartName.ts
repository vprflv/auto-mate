import type { PartForm } from '../types/serviceForm';

import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { getFluidCategoriesFor } from '@/features/garage/lib/getFluidCategories';
import type { PartInstallation } from '@/types/partInstallation';

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

const FLUID_NAMES = new Map([
    ['gearboxOil', 'Трансмиссионное масло'],
    ['transferCaseOil', 'Масло раздаточной коробки'],
    ['differentialOil', 'Масло редуктора'],
    ['powerSteeringFluid', 'Жидкость ГУР'],
]);

function getFluidLabel(categoryId: string): string | undefined {
    return getFluidCategoriesFor().find(category => category.id === categoryId)?.label;
}

export function suggestServicePartName(
    part: Classification
): string {
    if (part.itemType === 'fluid') {
        return FLUID_NAMES.get(part.fluidCategory) ?? getFluidLabel(part.fluidCategory) ?? '';
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

export function hasAutomaticServicePartName(part: PartForm): boolean {
    const name = stripPartInstallationFromName(part.name);

    return !name ||
        name === suggestServicePartName(part) ||
        (part.itemType === 'fluid' && name === getFluidLabel(part.fluidCategory));
}

const axleName = { front: 'перед', rear: 'зад', both: 'перед и зад' };
const sideName = { left: 'LH', right: 'RH', both: 'LH + RH' };

export function stripPartInstallationFromName(name: string): string {
    return name
        .trim()
        .replace(/\s+\((?:(?:перед и зад|передняя и задняя оси|передняя ось|задняя ось|перед|зад)(?:,\s*)?)?(?:LH \+ RH|LH|RH|левая и правая стороны|левая сторона|правая сторона)?\)$/iu, '')
        .replace(/^(Диск тормозной)(?: (?:передний и задний|передний|задний))?(?: (?:левый и правый|левый|правый))?$/u, '$1');
}

export function formatPartNameWithInstallation(
    name: string,
    { axle, side }: PartInstallation
): string {
    const base = stripPartInstallationFromName(name);
    const location = [axle ? axleName[axle] : '', side ? sideName[side] : '']
        .filter(Boolean)
        .join(', ');

    return base && location ? `${base} (${location})` : base;
}
