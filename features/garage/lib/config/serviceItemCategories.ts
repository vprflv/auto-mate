import {  PartCategory } from '@/types';
import {FluidCategory} from "@/types/oil";

export const FLUID_CATEGORY_OPTIONS: { value: FluidCategory; label: string }[] = [
    { value: 'engineOil', label: 'Моторное масло' },
    { value: 'gearboxOil', label: 'Трансмиссия / АКПП / МКПП' },
    { value: 'transferCaseOil', label: 'Раздатка' },
    { value: 'differentialOil', label: 'Редуктор' },
    { value: 'coolant', label: 'Антифриз' },
    { value: 'brakeFluid', label: 'Тормозная жидкость' },
    { value: 'powerSteeringFluid', label: 'ГУР' },
    { value: 'otherFluid', label: 'Другая жидкость' },
];

export const PART_CATEGORY_OPTIONS: { value: PartCategory; label: string }[] = [
    { value: 'maintenance', label: 'Расходники ТО' },
    { value: 'filters', label: 'Фильтры' },
    { value: 'engine', label: 'Двигатель' },
    { value: 'transmission', label: 'Трансмиссия' },
    { value: 'brakes', label: 'Тормоза' },
    { value: 'suspension', label: 'Подвеска' },
    { value: 'electrical', label: 'Электрика' },
    { value: 'body', label: 'Кузов и оптика' },
    { value: 'other', label: 'Другое' },
];