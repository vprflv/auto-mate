import { PartCategory } from '@/types';

export const PART_SUBCATEGORY_ORDER: Record<PartCategory, string[]> = {
    brakes: ['pads', 'discs', 'hoses', 'caliperGuides', 'calipers', 'drums', 'other'],
    filters: ['oil', 'air', 'cabin', 'fuel', 'transmission', 'other'],
    engine: ['sparkPlugs', 'belts', 'gaskets', 'sensors', 'other'],
    transmission: ['filter', 'mechatronics', 'other'],
    suspension: ['shock', 'arms', 'bushings', 'balls', 'other'],
    maintenance: ['wipers', 'bulbs', 'other'],
    electrical: ['battery', 'sensors', 'other'],
    body: ['mirrors', 'optics', 'other'],
    other: ['other'],
};

export const PART_SUBCATEGORY_LABELS: Record<string, string> = {
    pads: 'Колодки',
    discs: 'Диски',
    hoses: 'Тормозные шланги',
    caliperGuides: 'Направляющие суппорта',
    calipers: 'Суппорты',
    drums: 'Барабаны',

    oil: 'Масляный',
    air: 'Воздушный',
    cabin: 'Салонный',
    fuel: 'Топливный',
    transmission: 'АКПП / КПП',

    sparkPlugs: 'Свечи',
    belts: 'Ремни',
    gaskets: 'Прокладки',
    sensors: 'Датчики',

    filter: 'Фильтр',
    mechatronics: 'Мехатроника',

    shock: 'Амортизаторы',
    arms: 'Рычаги',
    bushings: 'Сайлентблоки',
    balls: 'Шаровые',

    wipers: 'Дворники',
    bulbs: 'Лампы',
    battery: 'АКБ',
    mirrors: 'Зеркала',
    optics: 'Оптика',
    other: 'Прочее',
};