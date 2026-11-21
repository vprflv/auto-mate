import type { CatalogBranch, CatalogPartPayload } from '@/types';
import { catalogBranchKey } from '@/features/admin/lib/system-store/catalogBranches';
import { fluidProductKey, planCompatibleFluidFamily } from '@/features/admin/lib/system-store/fluidAnalogFamily';
import { getOemCrosses, uniqueOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import type { StoredCatalogNode, StoredMasterModel, StoredPartItem } from '@/features/admin/lib/system-store/types';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';

export function FluidBranchPreview({ model, branches, part, modificationIds, catalogNodes }: {
    model: Pick<StoredMasterModel, 'brandSlug' | 'modelSlug'>;
    branches: CatalogBranch[];
    part: CatalogPartPayload['part'] & Pick<StoredPartItem, 'fluidAnalogDetached'>;
    modificationIds: string[];
    catalogNodes: StoredCatalogNode[];
}) {
    if (!part.brand.trim() || !normalizeArticle(part.article) || !modificationIds.length) return null;

    return branches.map(branch => {
        const key = catalogBranchKey(branch);
        const destination = catalogNodes.find(node => catalogBranchKey(node) === key &&
            node.brandSlug === model.brandSlug && node.modelSlug === model.modelSlug) ?? {
            ...branch, brandSlug: model.brandSlug, modelSlug: model.modelSlug,
            id: 'preview', items: [], compatibleModifications: [],
        };
        const existing = destination.items.find(item => fluidProductKey(item) === fluidProductKey(part));
        const incoming = getOemCrosses(part);
        const crosses = uniqueOemCrosses([...(existing ? getOemCrosses(existing) : []), ...incoming]);
        const preview: StoredPartItem = {
            ...part, id: existing?.id ?? 'preview', oemCrosses: crosses, oemCross: crosses[0] ?? '',
            fluidAnalogDetached: crosses.length ? undefined : (existing?.fluidAnalogDetached ?? part.fluidAnalogDetached),
            compatibleModifications: modificationIds, installationsCount: 0, compatibilityScore: 0,
        };
        const { ambiguous, byProduct } = planCompatibleFluidFamily(catalogNodes, destination, preview, modificationIds);
        if (!ambiguous && byProduct.size === 0) return null;

        return (
            <p key={key} className="text-xs text-[var(--text-muted)]">
                «{branch.title}» — {ambiguous
                    ? 'OEM-цепочки пересекаются. Проверьте связи перед групповым добавлением.'
                    : `Подходящие аналоги: ${[...byProduct.values()].map(({ part }) => `${part.name} (${part.article})`).join(', ')}.`}
            </p>
        );
    });
}
