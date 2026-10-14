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

    // Нормализатор, который исправляет массивы на объекты
    const getSafeCatalog = (data: any) => {
        if (!data) return { items: [] };
        if (Array.isArray(data)) return { items: data }; // Если это массив - оборачиваем в items
        if (data.items && Array.isArray(data.items)) return data; // Если уже объект - отдаем как есть
        return { items: [] };
    };

    const carInfo = {
        id: car.id,
        brand: car.make || (car as any).brand || 'Неизвестная марка',
        model: car.model || 'Неизвестная модель',
        year: car.year,
        vin: car.vin,
        engine: (car as any).engine,
    };

    if (section === 'overview') {
        return (
            <div className="space-y-6 bg-transparent">
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

                {/* Адаптивная сетка параметров */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 relative z-10 bg-transparent">
                    <CarSpecs car={car} />
                    <CarExtraInfo car={car} />
                </div>
            </div>
        );
    }

    if (section === 'fluids') {
        return (
            <CarFluidsCard
                carId={car.id}
                carInfo={carInfo}
                fluids={getSafeCatalog(car.fluids)}
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
                carId={car.id}
                carInfo={carInfo}
                parts={getSafeCatalog(car.partsCatalog || (car as any).parts)}
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
                records={records || []}
                onUpdateRecord={onUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
            />
        );
    }

    return <DangerZone onDelete={handleDeleteCar} />;
}