import {CatalogModification} from "@/features/admin/lib/system-store/types";


export interface CarVariant {
    engine?: string;
    engineCode?: string;
    displacementL?: string;
    fuel?: string;
    transmission?: string;
    driveType?: string;
    bodyClass?: string;
    trim?: string;
}

const variantFields: (keyof CarVariant)[] = [
    'engine',
    'engineCode',
    'displacementL',
    'fuel',
    'transmission',
    'driveType',
    'bodyClass',
    'trim',
];

function normalizeValue(value: string | undefined): string {
    return (value ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

export function getCarVariantKey(variant: CarVariant): string {
    return JSON.stringify(
        variantFields.map(field => normalizeValue(variant[field]))
    );
}

export function hasCarVariantData(variant: CarVariant): boolean {
    return variantFields.some(
        field => normalizeValue(variant[field]).length > 0
    );
}

export function isSameCarVariant(
    first: CarVariant,
    second: CarVariant
): boolean {
    return (
        hasCarVariantData(first) &&
        hasCarVariantData(second) &&
        getCarVariantKey(first) === getCarVariantKey(second)
    );
}

export function getModificationVariant(
    modification: CatalogModification
): CarVariant {
    const attributes = modification.attributes;

    return {
        engine: attributes.engine,
        engineCode: attributes.engineCode,
        displacementL: attributes.displacementL,
        fuel: attributes.fuel,
        transmission: attributes.transmission,
        driveType: attributes.drivetrain,
        bodyClass: attributes.bodyClass,
        trim: attributes.trim,
    };
}