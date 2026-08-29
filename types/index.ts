import {CarFluids, FluidCategory} from "@/types/oil";

export type Car = {
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    fluids?: CarFluids;
    bodyClass?: string;
    engine?: string;
    partsCatalog?: CarParts;
    displacementL?: string;
    cylinders?: string;
    fuel?: string;
    driveType?: string;
    transmission?: string;
    doors?: string;
    plantCountry?: string;
    color?: string;
    nickname?: string;
    currentMileage?: number;
    notes?: string;
    addedAt: string;
    updatedAt?: string;

    photos?: string[];
};



export type DecodedCar = {
    vin: string;
    make: string;
    model: string;
    year: number;
    bodyClass?: string;
    engine?: string;
    displacementL?: string;
    cylinders?: string;
    fuel?: string;
    driveType?: string;
    transmission?: string;
    doors?: string;
    plantCountry?: string;
};


export type ManualCarForm = {
    vin: string;
    make: string;
    model: string;
    year: string;
    bodyClass: string;
    displacementL: string;
    cylinders: string;
    engine: string;
    fuel: string;
    driveType: string;
    transmission: string;
    doors: string;
    plantCountry: string;
    color: string;
    nickname: string;
};

export type PartCategory =
    | 'maintenance'
    | 'engine'
    | 'transmission'
    | 'suspension'
    | 'brakes'
    | 'filters'
    | 'electrical'
    | 'body'
    | 'other';



export type ServicePart = {
    id: string;
    name: string;
    brand?: string;
    oemNumber?: string;
    quantity: number;
    // новое
    itemType: 'fluid' | 'part';
    fluidCategory?: FluidCategory;
    partCategory?: PartCategory;
};


// export type FluidItem = {
//     id: string;
//     name: string;
//     spec?: string;
//     brand?: string;
//     volume?: string;
//     notes?: string;
// };




// export type CarFluids = {
//     engineOil?: FluidItem;
//     gearboxOil?: FluidItem;
//     transferCaseOil?: FluidItem;
//     differentialOil?: FluidItem;
//     coolant?: FluidItem;
//     brakeFluid?: FluidItem;
//     powerSteeringFluid?: FluidItem;
//     other?: FluidItem[];
// };

export type CarPartItem = {
    id: string;
    category: PartCategory;
    subcategory?: string;
    name: string;
    brand?: string;
    oemNumber?: string;
    analogNumber?: string;
    quantity?: number;
    notes?: string;
    photo?: string;
};

export type CarParts = {
    items: CarPartItem[];
};

export type ServiceRecord = {
    id: string;
    carId: string;
    date: string;
    mileage?: number;
    title: string;
    description?: string;
    parts: ServicePart[];
    photos?: string[];
    cost?: number;
    createdAt: string;
};

export type UserSubcategory = {
    id: string;
    category: PartCategory;
    name: string;
    key: string;
    keywords: string[];
    createdAt: string;
};