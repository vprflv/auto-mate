export type EditCarFormValues = {
    make: string;
    model: string;
    year: string;
    vin: string;
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
    currentMileage: string;
    notes: string;
};

export type EditCarField = keyof EditCarFormValues;