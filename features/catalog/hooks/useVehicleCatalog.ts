'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { catalogProvider } from '@/features/catalog/lib/providers';
import { getCachedCatalog, saveCatalog } from '@/features/catalog/lib/storage';
import {VehicleCatalog} from "@/types/catalog/catalog";

type Params = {
    carId: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
    enabled?: boolean;
};

export function useVehicleCatalog({
                                      carId,
                                      vin,
                                      make,
                                      model,
                                      year,
                                      enabled = true,
                                  }: Params) {
    const queryClient = useQueryClient();

    const query = useQuery<VehicleCatalog>({
        queryKey: ['vehicle-catalog', carId],
        enabled: enabled && !!carId && !!make && !!model,
        queryFn: async () => {
            // 1. Сначала пробуем кэш
            const cached = getCachedCatalog(carId);
            if (cached) {
                return cached;
            }

            // 2. Если кэша нет — идём в провайдер
            const catalog = await catalogProvider.getCatalog({
                carId,
                vin,
                make,
                model,
                year,
            });

            // 3. Сохраняем
            saveCatalog(catalog);
            return catalog;
        },
        staleTime: 1000 * 60 * 60 * 24,
    });

    /** Принудительно обновить каталог */
    const refresh = async () => {
        // Очищаем кэш
        localStorage.removeItem(`automate-catalog-${carId}`);

        // Инвалидируем и перезапрашиваем
        await queryClient.invalidateQueries({ queryKey: ['vehicle-catalog', carId] });
    };

    return {
        catalog: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refresh,
    };
}