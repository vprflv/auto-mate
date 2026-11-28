import CatalogPageView from '@/features/catalog/components/CatalogPageView';

export default async function CatalogPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CatalogPageView carId={id} />;
}