export type FluidCategory =
    | 'engineOil'
    | 'gearboxOil'
    | 'transferCaseOil'
    | 'differentialOil'
    | 'coolant'
    | 'brakeFluid'
    | 'powerSteeringFluid'
    | 'otherFluid';

export type CarFluidItem = {
    id: string;
    category: FluidCategory;
    name: string;
    brand?: string;
    spec?: string;
    volume?: string;
    notes?: string;
};

export type CarFluids = {
    items: CarFluidItem[];
};