import { normalizeArticle } from '../normalizeArticle';
import { getOemCrosses, uniqueOemCrosses } from '../oemCrosses';
import { storage } from '../storage';
import { getCatalogPartPlacements } from '../catalogBranches';

export function setCatalogPartOriginality(
    nodeId: string,
    partId: string,
    isOem: boolean,
    linkedOem: string
): void {
    const state = storage.getState();
    const node = state.catalogNodes.find(node => node.id === nodeId);
    const part = node?.items.find(item => item.id === partId);

    if (!node || !part) throw new Error('Запчасть больше не найдена в каталоге.');
    if (part.isOem === isOem) return;

    const ownArticle = normalizeArticle(part.article);
    const crosses = uniqueOemCrosses([...getOemCrosses(part), linkedOem])
        .filter(number => normalizeArticle(number) !== ownArticle);

    if (!isOem && crosses.length === 0) {
        throw new Error('Укажите номер оригинала, к которому относится аналог.');
    }

    for (const { part: placement } of getCatalogPartPlacements(state.catalogNodes, node, part)) {
        placement.isOem = isOem;
        if (placement !== part && placement.fluidAnalogDetached) continue;
        placement.oemCrosses = crosses;
        placement.oemCross = crosses[0] ?? '';
        if (crosses.length) delete placement.fluidAnalogDetached;
    }
    storage.saveState(state);
}
