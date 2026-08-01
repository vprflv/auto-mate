import {
    Car,
    ServicePart,
    CarFluids,
    CarParts,

    CarPartItem,

} from '@/types';
import { getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { detectSubcategory } from '@/features/garage/lib/detectSubcategory';
import {CarFluidItem, FluidCategory} from "@/types/oil";

function upsertFluid(
    fluids: CarFluids,
    category: FluidCategory,
    part: ServicePart
): CarFluids {
    const items = [...(fluids.items || [])];

    const newItem: CarFluidItem = {
        id: part.id,
        category,
        name: part.name,
        brand: part.brand,
        spec: part.oemNumber || part.name,
        volume: part.quantity ? `${part.quantity}` : undefined,
    };

    // Ищем по id или по названию + категории
    const idx = items.findIndex(
        (f) =>
            f.id === part.id ||
            (f.category === category &&
                f.name.toLowerCase() === part.name.toLowerCase())
    );

    if (idx >= 0) {
        items[idx] = { ...items[idx], ...newItem };
    } else {
        items.push(newItem);
    }

    return { items };
}

function upsertPart(parts: CarParts, part: ServicePart): CarParts {
    const category = part.partCategory || 'other';
    const items = [...(parts.items || [])];

    const subcategory = detectSubcategory(category, part.name);

    const newItem: CarPartItem = {
        id: part.id,
        category,
        subcategory,
        name: part.name,
        brand: part.brand,
        oemNumber: part.oemNumber,
        quantity: part.quantity,
    };

    const idx = items.findIndex((p) => {
        if (part.oemNumber && p.oemNumber) {
            return p.oemNumber.toLowerCase() === part.oemNumber.toLowerCase();
        }
        return (
            p.name.toLowerCase() === part.name.toLowerCase() &&
            p.category === category
        );
    });

    if (idx >= 0) items[idx] = { ...items[idx], ...newItem };
    else items.push(newItem);

    return { items };
}

export function syncServicePartsToCar(carId: string, parts: ServicePart[]) {
    const cars = getGarageCars();
    const index = cars.findIndex((c) => c.id === carId);
    if (index < 0) return;

    let car: Car = { ...cars[index] };
    let fluids: CarFluids = { items: [...(car.fluids?.items || [])] };
    let partsCatalog: CarParts = { items: [...(car.partsCatalog?.items || [])] };

    for (const part of parts) {
        if (part.itemType === 'fluid' && part.fluidCategory) {
            fluids = upsertFluid(fluids, part.fluidCategory, part);
        }

        if (part.itemType === 'part') {
            partsCatalog = upsertPart(partsCatalog, part);
        }
    }

    car = {
        ...car,
        fluids,
        partsCatalog,
        updatedAt: new Date().toISOString(),
    };

    cars[index] = car;
    saveGarageCars(cars);
}