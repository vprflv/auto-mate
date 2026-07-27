import { PartCategory } from '@/types';

export const PART_CATEGORY_LABELS: Record<PartCategory, string> = {
    maintenance: 'Расходники ТО',
    engine: 'Двигатель',
    transmission: 'Трансмиссия',
    suspension: 'Подвеска',
    brakes: 'Тормоза',
    filters: 'Фильтры',
    electrical: 'Электрика',
    body: 'Кузов и оптика',
    other: 'Другое',
};

export const PART_CATEGORY_ORDER: PartCategory[] = [
    'maintenance',
    'filters',
    'engine',
    'transmission',
    'brakes',
    'suspension',
    'electrical',
    'body',
    'other',
];