'use client';

import { useQuery } from '@tanstack/react-query';

import { priceProvider } from '@/features/price/lib/providers';
import {PartSearchRequest} from "@/types/prices/price";

export function usePartPriceSearch(request: PartSearchRequest | null) {
    return useQuery({
        queryKey: ['price-search', request],
        enabled: !!request,
        queryFn: async () => {
            if (!request) return [];
            return priceProvider.search(request);
        },
        staleTime: 1000 * 60 * 5,
    });
}