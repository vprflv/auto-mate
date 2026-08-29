'use client';

import { toast } from 'sonner';
import { Car, ServiceRecord } from '@/types';
import { CarFluids } from '@/types/oil';

import CarSpecs from '@/features/garage/car/components/CarSpecs';
import CarExtraInfo from '@/features/garage/car/components/CarExtraInfo';
import ServiceHistory from '@/features/garage/car/components/ServiceHistory';
import DangerZone from '@/features/garage/car/components/DangerZone';
import CarFluidsCard from '@/features/garage/oil/components/CarFluidsCard';
import CarPartsCard from '@/features/garage/components/CarPartsCard';
import CarPhotosGallery from '@/features/garage/gallery/components/CarPhotosGallery';
import { CarSection } from '@/features/garage/car/types/types';

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
    const carTitle = car.nickname || `${car.make} ${car.model}`;

    const handleDeleteCar = () => {
        toast.warning(`Удалить ${carTitle}?`, {
            description: 'Машина и связанные данные пропадут из гаража. Это нельзя отменить.',
            duration: Infinity,
            action: {
                label: 'Удалить',
                onClick: () => {
                    onDeleteCar();
                    toast.success(`${carTitle} удалена из гаража`);
                },
            },
            cancel: {
                label: 'Отмена',
                onClick: () => {},
            },
        });
    };

    const handleDeleteRecord = (id: string) => {
        toast.warning('Удалить запись ТО?', {
            description: 'История обслуживания по этой записи будет удалена.',
            duration: Infinity,
            action: {
                label: 'Удалить',
                onClick: () => {
                    onDeleteRecord(id);
                    toast.success('Запись ТО удалена');
                },
            },
            cancel: {
                label: 'Отмена',
                onClick: () => {},
            },
        });
    };

    if (section === 'overview') {
        return (
            <div className="space-y-6">
                <CarPhotosGallery
                    photos={car.photos || []}
                    onUpdatePhotos={(photos) => {
                        onUpdateCar({
                            ...car,
                            photos,
                            updatedAt: new Date().toISOString(),
                        });
                    }}
                />

                <div className="grid gap-6 md:grid-cols-2">
                    <CarSpecs car={car} />
                    <CarExtraInfo car={car} />
                </div>
            </div>
        );
    }

    if (section === 'fluids') {
        return (
            <CarFluidsCard
                fluids={car.fluids?.items ? car.fluids : { items: [] }}
                onUpdateFluids={(fluids: CarFluids) => {
                    onUpdateCar({
                        ...car,
                        fluids,
                        updatedAt: new Date().toISOString(),
                    });
                }}
            />
        );
    }

    if (section === 'parts') {
        return (
            <CarPartsCard
                parts={car.partsCatalog}
                carId={car.id}
                onUpdateParts={(partsCatalog) => {
                    onUpdateCar({
                        ...car,
                        partsCatalog,
                        updatedAt: new Date().toISOString(),
                    });
                }}
            />
        );
    }

    if (section === 'service') {
        return (
            <ServiceHistory
                carId={car.id}
                records={records}
                onUpdateRecord={onUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
            />
        );
    }

    return <DangerZone onDelete={handleDeleteCar} />;
}