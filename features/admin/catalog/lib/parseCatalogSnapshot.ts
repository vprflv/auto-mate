import { z } from 'zod';
import type { CatalogSnapshot } from './catalogSnapshot';

const id = z.string().trim().min(1);
const count = z.number().int().nonnegative();

const installationSchema = z.object({
    axle: z.enum(['front', 'rear', 'both']).optional(),
    side: z.enum(['left', 'right', 'both']).optional(),
}).passthrough();

const modificationSchema = z.object({
    id,
    name: z.string(),
    registeredCount: count,
    attributes: z.record(z.string(), z.string()),
}).passthrough();

const modelSchema = z.object({
    brandSlug: id,
    brandName: z.string(),
    modelSlug: id,
    modelName: z.string(),
    years: z.string(),
    verified: z.boolean(),
    registeredCount: count,
    modifications: z.array(modificationSchema),
}).passthrough();

const partSchema = z.object({
    id,
    brand: z.string(),
    article: z.string(),
    name: z.string(),
    isOem: z.boolean(),
    oemCross: z.string().optional(),
    oemCrosses: z.array(z.string()).optional(),
    compatibleModifications: z.array(id).optional(),
    installation: installationSchema.optional(),
    installationsByModification: z.record(
        id,
        z.array(installationSchema)
    ).optional(),
    isVerified: z.boolean().optional(),
    installationsCount: count,
    compatibilityScore: z.number(),
    priceRange: z.string().optional(),
    note: z.string().optional(),
}).passthrough();

const nodeSchema = z.object({
    id,
    brandSlug: id,
    modelSlug: id,
    title: z.string(),
    category: z.string(),
    compatibleModifications: z.array(id),
    items: z.array(partSchema),
}).passthrough();

const snapshotSchema = z.object({
    schemaVersion: z.literal(1),
    exportedAt: z.string().refine(value => Number.isFinite(Date.parse(value))),
    masterModels: z.array(modelSchema),
    catalogNodes: z.array(nodeSchema),
});

function checkUnique(ids: string[], context: string): void {
    const seen = new Set<string>();

    for (const id of ids) {
        if (seen.has(id)) {
            throw new Error(`Повторяющийся ID «${id}» в ${context}.`);
        }
        seen.add(id);
    }
}

function modelKey(brandSlug: string, modelSlug: string): string {
    return JSON.stringify([brandSlug, modelSlug]);
}

export function parseCatalogSnapshot(text: string) {
    let data: unknown;

    try {
        data = JSON.parse(text.replace(/^\uFEFF/, ''));
    } catch {
        throw new Error('Не удалось прочитать JSON. Проверьте файл выгрузки.');
    }

    const parsed = snapshotSchema.safeParse(data);

    if (!parsed.success) {
        const field = parsed.error.issues[0]?.path.join('.') || 'корень файла';
        throw new Error(`Некорректное поле «${field}». Ожидается выгрузка каталога версии 1.`);
    }

    const snapshot: CatalogSnapshot = parsed.data;
    const modelIds = new Map<string, Set<string>>();
    let modificationCount = 0;
    let partCount = 0;

    for (const model of snapshot.masterModels) {
        const key = modelKey(model.brandSlug, model.modelSlug);
        const label = `${model.brandName} ${model.modelName}`;

        if (modelIds.has(key)) {
            throw new Error(`Модель «${label}» встречается в файле дважды.`);
        }

        const ids = model.modifications.map(modification => modification.id);
        checkUnique(ids, `модификациях модели «${label}»`);
        modelIds.set(key, new Set(ids));
        modificationCount += ids.length;
    }

    checkUnique(
        snapshot.catalogNodes.map(node => node.id),
        'разделах каталога'
    );

    for (const node of snapshot.catalogNodes) {
        const ids = modelIds.get(modelKey(node.brandSlug, node.modelSlug));

        if (!ids) {
            throw new Error(`Раздел «${node.title}» ссылается на модель, которой нет в файле.`);
        }

        checkUnique(node.items.map(part => part.id), `разделе «${node.title}»`);
        partCount += node.items.length;

        const references = [
            ...node.compatibleModifications,
            ...node.items.flatMap(part => part.compatibleModifications ?? []),
        ];

        const unknownId = references.find(id => id !== 'all' && !ids.has(id));
        if (unknownId) {
            throw new Error(`В разделе «${node.title}» не найдена модификация «${unknownId}».`);
        }

        for (const part of node.items) {
            const unknownPositionId = Object.keys(
                part.installationsByModification ?? {}
            ).find(id => !ids.has(id));

            if (unknownPositionId) {
                throw new Error(
                    `У детали «${part.name}» указано расположение для отсутствующей модификации «${unknownPositionId}».`
                );
            }
        }
    }

    return {
        snapshot,
        counts: {
            models: snapshot.masterModels.length,
            modifications: modificationCount,
            sections: snapshot.catalogNodes.length,
            parts: partCount,
        },
    };
}