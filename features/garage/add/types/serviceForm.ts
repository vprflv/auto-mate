import { PartCategory, ServicePart } from '@/types';
import { FluidCategory } from '@/types/oil';

export type PartForm = {
    id: string;
    oemNumber: string;
    brand: string;
    name: string;
    quantity: string;
    itemType: ServicePart['itemType'];
    fluidCategory: FluidCategory;
    partCategory: PartCategory;
    subcategory: string;
};

export function createEmptyPart(): PartForm {
    return {
        id: crypto.randomUUID(),
        oemNumber: '',
        brand: '',
        name: '',
        quantity: '1',
        itemType: 'part',
        fluidCategory: 'engineOil',
        partCategory: 'filters',
        subcategory: 'oil',
    };
}