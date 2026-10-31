import type { ManualCarForm } from '@/types';

export type EditCarFormValues = ManualCarForm & {
    currentMileage: string;
    notes: string;
};

export type EditCarField = keyof EditCarFormValues;