export type PartForm = {
    id: string;
    oemNumber: string;
    brand: string;
    name: string;
    quantity: string;
    itemType: 'fluid' | 'part';
    fluidCategory: string;
    partCategory: string;
    subcategory: string;
};

export function createEmptyPart(): PartForm {
    return {
        id: Date.now().toString() + Math.random(),
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