import type {
    StoredCatalogNode,
    StoredPartItem,
    SystemState,
} from '@/features/admin/lib/system-store/types';

import type { Car } from '@/types';

import type {
    CatalogArticle,
    CatalogFitment,
    CatalogNode,
    CatalogProviderParams,
    VehicleCatalog,
} from '@/types/catalog/catalog';

import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import { resolveCarCatalogIdentity } from './carCatalogIdentity';
import {uniqueInstallations} from "@/features/catalog/lib/partInstallations";

type Entry = {
    part: StoredPartItem;
    node: StoredCatalogNode;
};

type PartGroup = {
    key: string;
    entries: Entry[];
};

const normalizeBrand = (value: string) =>
    value.trim().replace(/\s+/g, ' ').toLowerCase();

function partKey(part: StoredPartItem): string {
    return JSON.stringify([
        part.isOem,
        normalizeBrand(part.brand),
        normalizeArticle(part.article),
    ]);
}

function fitmentKey(fitment: CatalogFitment): string {
    return JSON.stringify([
        fitment.brandSlug,
        fitment.modelSlug,
        fitment.modificationId,
    ]);
}

function uniqueFitments(
    values: CatalogFitment[]
): CatalogFitment[] {
    const result = new Map<string, CatalogFitment>();

    for (const value of values) {
        const key = fitmentKey(value);
        const previous = result.get(key);

        result.set(key, {
            ...value,

            installations: uniqueInstallations([
                ...(previous?.installations ?? []),
                ...(value.installations ?? []),
            ]),
        });
    }

    return Array.from(result.values());
}

function crossNumbers(group: PartGroup): Map<string, string> {
    const numbers = new Map<string, string>();

    for (const { part } of group.entries) {
        for (const number of getOemCrosses(part)) {
            const normalized = normalizeArticle(number);

            if (normalized && !numbers.has(normalized)) {
                numbers.set(normalized, number);
            }
        }
    }

    return numbers;
}

export function buildOemCatalog(
    state: SystemState,
    params: CatalogProviderParams,
    car?: Car
): VehicleCatalog {
    const identity = car
        ? resolveCarCatalogIdentity(car, state.masterModels)
        : null;

    const catalog: VehicleCatalog = {
        ...params,
        source: identity ? 'master' : 'master-pending',
        fetchedAt: new Date().toISOString(),
        nodes: [],
        articles: [],
    };

    if (!identity) return catalog;

    const models = new Map(
        state.masterModels
            .filter(model => model.verified)
            .map(model => [
                JSON.stringify([
                    model.brandSlug,
                    model.modelSlug,
                ]),
                model,
            ])
    );

    const groups = new Map<string, PartGroup>();

    // Общий индекс проверенных деталей всех моделей.
    for (const node of state.catalogNodes) {
        const model = models.get(
            JSON.stringify([node.brandSlug, node.modelSlug])
        );

        if (!model) continue;

        for (const part of node.items) {
            if (
                part.isVerified !== true ||
                !part.brand.trim() ||
                !normalizeArticle(part.article)
            ) {
                continue;
            }

            const key = partKey(part);
            const group = groups.get(key) ?? {
                key,
                entries: [],
            };

            group.entries.push({ part, node });
            groups.set(key, group);
        }
    }

    // Один номер может встречаться у разных производителей.
    // Неоднозначные номера не используем для автонаследования.
    const originalsByNumber = new Map<string, Set<string>>();

    for (const group of groups.values()) {
        const part = group.entries[0].part;

        if (!part.isOem) continue;

        const number = normalizeArticle(part.article);
        const keys = originalsByNumber.get(number) ?? new Set();

        keys.add(group.key);
        originalsByNumber.set(number, keys);
    }

    const directCache = new Map<string, CatalogFitment[]>();

    function directFitments(group: PartGroup): CatalogFitment[] {
        const cached = directCache.get(group.key);

        if (cached) return cached;

        const result: CatalogFitment[] = [];

        for (const { part, node } of group.entries) {
            const model = models.get(
                JSON.stringify([
                    node.brandSlug,
                    node.modelSlug,
                ])
            );

            if (!model) continue;

            const ids = part.compatibleModifications ?? [];

            const modifications = Array.isArray(model.modifications)
                ? model.modifications
                : [];

            for (const modification of modifications) {
                if (
                    !ids.includes('all') &&
                    !ids.includes(modification.id)
                ) {
                    continue;
                }

                result.push({
                    brandSlug: model.brandSlug,
                    modelSlug: model.modelSlug,
                    modificationId: modification.id,
                    make: model.brandName,
                    model: model.modelName,
                    modification: modification.name,
                    description: [
                        modification.attributes.engine,
                        modification.attributes.transmission,
                        modification.attributes.drivetrain,
                    ]
                        .filter(Boolean)
                        .join(' · '),
                });
            }
        }

        const unique = uniqueFitments(result);
        directCache.set(group.key, unique);

        return unique;
    }

    const effectiveCache = new Map<string, CatalogFitment[]>();

    function effectiveFitments(group: PartGroup): CatalogFitment[] {
        const cached = effectiveCache.get(group.key);

        if (cached) return cached;

        const part = group.entries[0].part;
        const result = [...directFitments(group)];

        if (!part.isOem) {
            for (const number of crossNumbers(group).keys()) {
                const originalKeys = originalsByNumber.get(number);

                if (originalKeys?.size !== 1) continue;

                const originalKey = Array.from(originalKeys)[0];
                const original = groups.get(originalKey);

                if (original) {
                    // Только прямая применимость оригинала.
                    // Через другие аналоги цепочку не расширяем.
                    result.push(
                        ...directFitments(original).map(
                            fitment => ({
                                ...fitment,
                                installations: [],
                            })
                        )
                    );
                }
            }
        }

        const unique = uniqueFitments(result);
        effectiveCache.set(group.key, unique);

        return unique;
    }

    function matchesCurrentCar(fitments: CatalogFitment[]) {
        return fitments.some(fitment =>
            fitment.brandSlug === identity!.model.brandSlug &&
            fitment.modelSlug === identity!.model.modelSlug &&
            fitment.modificationId === identity!.modification.id
        );
    }

    function preferredEntry(group: PartGroup): Entry {
        return group.entries.find(({ node }) =>
            node.brandSlug === identity!.model.brandSlug &&
            node.modelSlug === identity!.model.modelSlug
        ) ?? group.entries[0];
    }

    function toArticle(
        group: PartGroup,
        nodeId: string
    ): CatalogArticle {
        const { part } = preferredEntry(group);

        const linkedOemNumbers = Array.from(
            crossNumbers(group).values()
        );

        const fitments = effectiveFitments(group);

        const installationOptions = uniqueInstallations(
            directFitments(group)
                .filter(fitment =>
                    fitment.brandSlug ===
                    identity!.model.brandSlug &&
                    fitment.modelSlug ===
                    identity!.model.modelSlug &&
                    fitment.modificationId ===
                    identity!.modification.id
                )
                .flatMap(
                    fitment => fitment.installations ?? []
                )
        );

        return {
            id: `master-part:${group.key}`,
            nodeId,

            oem: part.article,
            name: part.name,
            brand: part.brand,
            note: part.note,

            isOem: part.isOem,
            isVerified: true,
            canSave: true,

            originalNumbers: linkedOemNumbers.length
                ? linkedOemNumbers
                : part.isOem
                    ? [part.article]
                    : [],

            fitments,
            installationOptions,

            appliesToCurrentCar:
                matchesCurrentCar(fitments),
        };
    }



    const categoryLabels: Record<string, string> = {
        service: 'Расходники ТО',
        brakes: 'Тормозная система',
        suspension: 'Подвеска и рулевое',
        fluids: 'Масла и жидкости',
        ignition: 'Зажигание / Электрика',
    };

    const categoryMap = new Map<string, CatalogNode>();
    const nodeMap = new Map<string, CatalogNode>();

    function getNodeId(entry: Entry): string {
        const { node } = entry;

        const isFluid = node.category === 'fluids';
        const prefix = isFluid ? 'fluids-master' : 'master-node';

        const id = `${prefix}:${JSON.stringify([
            node.category,
            node.title.trim().toLowerCase(),
        ])}`;

        if (nodeMap.has(id)) return id;

        const categoryId = isFluid
            ? 'fluids'
            : `master-category:${node.category}`;

        let category = categoryMap.get(categoryId);

        if (!category) {
            category = {
                id: categoryId,
                name: categoryLabels[node.category] ?? node.category,
                children: [],
            };

            categoryMap.set(categoryId, category);
        }

        const child: CatalogNode = {
            id,
            parentId: categoryId,
            name: node.title,
            hasArticles: true,
        };

        nodeMap.set(id, child);
        category.children?.push(child);

        return id;
    }

    const analogs = Array.from(groups.values()).filter(
        group => !group.entries[0].part.isOem
    );

    // Основные карточки: оригиналы, подходящие текущей машине.
    for (const group of groups.values()) {
        const part = group.entries[0].part;

        if (
            !part.isOem ||
            !matchesCurrentCar(directFitments(group))
        ) {
            continue;
        }

        const number = normalizeArticle(part.article);
        const unambiguous =
            originalsByNumber.get(number)?.size === 1;

        const nodeId = getNodeId(preferredEntry(group));



        const variants = unambiguous
            ? analogs
                .filter(analog =>
                    crossNumbers(analog).has(number)
                )
                .map(analog => toArticle(analog, nodeId))
            : [];

        const original = toArticle(group, nodeId);

        catalog.articles.push({
            ...original,
            variants,
            relatedFitments: uniqueFitments([
                ...(original.fitments ?? []),
                ...variants.flatMap(
                    variant => variant.fitments ?? []
                ),
            ]),
        });
    }

    // Есть одобренный аналог с OEM-кроссом,
    // но отдельную запись оригинала ещё не добавили.
    const missingOriginals = new Map<
        string,
        { display: string; groups: PartGroup[] }
    >();

    for (const analog of analogs) {

        for (const [number, display] of crossNumbers(analog)) {
            if (originalsByNumber.has(number)) continue;

            const bucket = missingOriginals.get(number) ?? {
                display,
                groups: [],
            };

            bucket.groups.push(analog);
            missingOriginals.set(number, bucket);
        }
    }

    for (const [number, bucket] of missingOriginals) {
        // Саму карточку показываем только тогда,
        // когда в цепочке есть деталь для текущей машины.
        const relevantToCurrentCar = bucket.groups.some(
            group => matchesCurrentCar(
                effectiveFitments(group)
            )
        );

        if (!relevantToCurrentCar) continue;

        const relevantGroup = bucket.groups.find(
            group => matchesCurrentCar(
                effectiveFitments(group)
            )
        )!;

        const entry = preferredEntry(relevantGroup);
        const nodeId = getNodeId(entry);

        // Внутри карточки — вся цепочка по всей базе.
        const variants = bucket.groups.map(
            group => toArticle(group, nodeId)
        );

        catalog.articles.push({
            id: `master-oem-reference:${number}`,
            nodeId,
            oem: bucket.display,
            originalNumbers: [bucket.display],
            name: entry.part.name,
            canSave: false,
            note: 'OEM-номер из одобренных связей. Отдельная запись оригинала пока не добавлена.',
            fitments: [],
            variants,
            relatedFitments: uniqueFitments(
                variants.flatMap(
                    variant => variant.fitments ?? []
                )
            ),
        });
    }

    catalog.nodes = Array.from(categoryMap.values());

    return catalog;
}