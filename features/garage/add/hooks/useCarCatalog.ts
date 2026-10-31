'use client';

import { useEffect, useState } from 'react';

import { storage } from '@/features/admin/lib/system-store/storage';
import { STORAGE_KEY } from '@/features/admin/lib/system-store/defaults';

import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';

export function useCarCatalog() {
    const [models, setModels] = useState<StoredMasterModel[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const loadCatalog = () => {
            setModels(storage.getState().masterModels ?? []);
            setLoaded(true);
        };

        const handleStorageChange = (event: StorageEvent) => {
            if (
                event.key === STORAGE_KEY ||
                event.key === null
            ) {
                loadCatalog();
            }
        };

        loadCatalog();

        window.addEventListener(
            'system-store-updated',
            loadCatalog
        );

        window.addEventListener(
            'storage',
            handleStorageChange
        );

        return () => {
            window.removeEventListener(
                'system-store-updated',
                loadCatalog
            );

            window.removeEventListener(
                'storage',
                handleStorageChange
            );
        };
    }, []);

    const brandNames = new Map<string, string>();

    for (const model of models) {
        if (!brandNames.has(model.brandSlug)) {
            brandNames.set(model.brandSlug, model.brandName);
        }
    }

    const brands = Array.from(
        brandNames,
        ([value, label]) => ({ value, label })
    ).sort((a, b) => a.label.localeCompare(b.label));

    return {
        loaded,
        models,
        brands
    };
}