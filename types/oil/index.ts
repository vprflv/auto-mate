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
    categoryLabel?: string | undefined;
    id: string;
    /*
      ИСПРАВЛЕНО: Добавили | (string & {})
      Это умный трюк TypeScript: он сохраняет автодополнение системных категорий (engineOil и т.д.)
      в IDE, но при этом официально разрешает записывать сюда абсолютно любую кастомную строку!
    */
    category: FluidCategory | (string & {});
    name: string;
    brand?: string;
    spec?: string;
    volume?: string;
    notes?: string;
    photo?: string;
};

export type CarFluids = {
    items: CarFluidItem[];
};
