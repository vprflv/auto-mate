'use client';

import {
    ClipboardPlus,
    Pencil,
    Sparkles,
} from 'lucide-react';

import type { Car, ServiceRecord } from '@/types';
import type { CarSection } from '@/features/garage/car/types/types';

import { useCarSectionContent } from '@/features/garage/car/hooks/useCarSectionContent';

import CarSpecs from './CarSpecs';
import CarExtraInfo from './CarExtraInfo';
import ServiceHistory from './ServiceHistory';
import DangerZone from './DangerZone';
import CarPersonalCatalog from './CarPersonalCatalog';
import CarSectionAction from './CarSectionAction';

import CarFluidsCard from '@/features/garage/oil/components/CarFluidsCard';
import CarPartsCard from '@/features/garage/components/CarPartsCard';
import CarPhotosGallery from '@/features/garage/gallery/components/CarPhotosGallery';

type Props = {
    section: CarSection;
    car: Car;
    records: ServiceRecord[];
    onUpdateCar: (car: Car) => void;
    onUpdateRecord: (record: ServiceRecord) => void;
    onDeleteRecord: (id: string) => void;
    onDeleteCar: () => void;
};

export default function CarSectionContent({
                                              section,
                                              car,
                                              records,
                                              onUpdateCar,
                                              onUpdateRecord,
                                              onDeleteRecord,
                                              onDeleteCar,
                                          }: Props) {
    const {
        carInfo,
        partsCatalog,
        fluidsCatalog,
        updatePhotos,
        updateParts,
        updateFluids,
        requestDeleteCar,
        requestDeleteRecord,
    } = useCarSectionContent({
        car,
        onUpdateCar,
        onDeleteRecord,
        onDeleteCar,
    });

    if (section === 'overview') {
        return (
            <div className="space-y-6 bg-transparent">
                <CarPhotosGallery
                    photos={car.photos || []}
                    onUpdatePhotos={updatePhotos}
                />

                <div className="relative z-10 grid grid-cols-1 gap-6 bg-transparent sm:grid-cols-2">
                    <CarSpecs car={car} />
                    <CarExtraInfo car={car} />
                </div>
            </div>
        );
    }

    if (section === 'catalog') {
        return (
            <CarPersonalCatalog
                key={car.id}
                carId={car.id}
                parts={
                    <CarPartsCard
                        carId={car.id}
                        carInfo={carInfo}
                        parts={partsCatalog}
                        onUpdateParts={updateParts}
                    />
                }
                fluids={
                    <CarFluidsCard
                        carId={car.id}
                        carInfo={carInfo}
                        fluids={fluidsCatalog}
                        onUpdateFluids={updateFluids}
                    />
                }
            />
        );
    }

    if (section === 'ai-catalog') {
        return (
            <CarSectionAction
                title="ИИ-каталог"
                description="Каталог запчастей и технических жидкостей для этого автомобиля. Найденные позиции можно добавлять в личный каталог."
                href={`/garage/${car.id}/catalog`}
                actionLabel="Открыть ИИ-каталог"
                icon={Sparkles}
            />
        );
    }

    if (section === 'add-service') {
        return (
            <CarSectionAction
                title="Добавить ТО"
                description="Запишите выполненные работы, пробег, использованные детали и стоимость обслуживания."
                href={`/garage/${car.id}/service/add`}
                actionLabel="Добавить запись ТО"
                icon={ClipboardPlus}
            />
        );
    }

    if (section === 'edit') {
        return (
            <CarSectionAction
                title="Редактировать автомобиль"
                description="Измените данные автомобиля: название, характеристики, комплектацию и VIN."
                href={`/garage/${car.id}/edit`}
                actionLabel="Открыть редактирование"
                icon={Pencil}
            />
        );
    }

    if (section === 'service') {
        return (
            <ServiceHistory
                carId={car.id}
                records={records || []}
                onUpdateRecord={onUpdateRecord}
                onDeleteRecord={requestDeleteRecord}
            />
        );
    }

    if (section === 'danger') {
        return (
            <DangerZone onDelete={requestDeleteCar} />
        );
    }

    return null;
}