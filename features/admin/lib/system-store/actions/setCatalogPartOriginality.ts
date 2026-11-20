import { normalizeArticle } from '../normalizeArticle';
import { getOemCrosses, uniqueOemCrosses } from '../oemCrosses';
import { storage } from '../storage';

export function setCatalogPartOriginality(
    nodeId: string,
    partId: string,
    isOem: boolean,
    linkedOem: string
): void {
    const state = storage.getState();
    const part = state.catalogNodes.find(node => node.id === nodeId)
        ?.items.find(item => item.id === partId);

    if (!part) throw new Error('Запчасть больше не найдена в каталоге.');
    if (part.isOem === isOem) return;

    const ownArticle = normalizeArticle(part.article);
    const crosses = uniqueOemCrosses([...getOemCrosses(part), linkedOem])
        .filter(number => normalizeArticle(number) !== ownArticle);

    if (!isOem && crosses.length === 0) {
        throw new Error('Укажите номер оригинала, к которому относится аналог.');
    }

    part.isOem = isOem;
    part.oemCrosses = crosses;
    part.oemCross = crosses[0] ?? '';
    storage.saveState(state);
}
