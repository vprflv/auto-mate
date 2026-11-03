'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogProvider } from '@/features/catalog/lib/providers';
import { STORAGE_KEY } from '@/features/admin/lib/system-store/defaults';
import { STORAGE_KEYS } from '@/features/garage/add/lib/config/storage';
import type { VehicleCatalog } from '@/types/catalog/catalog';

type Params = {
    carId: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
    enabled?: boolean;
};

export function useVehicleCatalog({ enabled = true, ...params }: Params) {
    const queryClient = useQueryClient();
    const query = useQuery<VehicleCatalog>({
        queryKey: ['vehicle-catalog', params.carId, params.vin, params.make, params.model, params.year],
        enabled: enabled && !!params.carId && !!params.make && !!params.model,
        queryFn: () => catalogProvider.getCatalog(params),
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        const update = () => {
            void queryClient.invalidateQueries({ queryKey: ['vehicle-catalog', params.carId] });
        };
        const onStorage = (event: StorageEvent) => {
            if (event.key === null || event.key === STORAGE_KEY || event.key === STORAGE_KEYS.garage) update();
        };
        window.addEventListener('system-store-updated', update);
        window.addEventListener('garage-updated', update);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('system-store-updated', update);
            window.removeEventListener('garage-updated', update);
            window.removeEventListener('storage', onStorage);
        };
    }, [params.carId, queryClient]);

    return {
        catalog: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refresh: async () => { await query.refetch(); },
    };
}