import { storage } from '../storage';

interface RenameCatalogPartInput {
    nodeId: string;
    partId: string;
    name: string;
}

export function renameCatalogPart({
                                      nodeId,
                                      partId,
                                      name,
                                  }: RenameCatalogPartInput): void {
    const nextName = name.trim();

    if (!nextName) {
        throw new Error('Введите название запчасти.');
    }

    const state = storage.getState();
    const node = state.catalogNodes.find(item => item.id === nodeId);

    if (!node) {
        throw new Error('Раздел каталога больше не найден.');
    }

    const part = node.items.find(item => item.id === partId);

    if (!part) {
        throw new Error('Запчасть больше не найдена в этом разделе.');
    }

    if (part.name === nextName) return;

    part.name = nextName;
    storage.saveState(state);
}