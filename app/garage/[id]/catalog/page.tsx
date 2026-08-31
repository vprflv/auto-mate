'use client';

import { use } from 'react';
import CatalogPageView from '@/features/catalog/components/CatalogPageView';

export default function CatalogPage({
                                        params,
                                    }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <CatalogPageView carId={id} />;
}