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
import { getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { resolveCarCatalogIdentity } from './carCatalogIdentity';
import { getCatalogSection } from './catalogSections';
import { getNodeFillCapacity } from './fluidFillCapacities';
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

export function getOemCatalogCategoryId(category: string): string {
    return category === 'fluids' ? 'fluids' : `master-category:${category}`;
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
        if (params.section && getCatalogSection(node.category) !== params.section) continue;

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

            const key = part.fluidAnalogDetached && getCatalogSection(node.category) === 'fluids'
                ? JSON.stringify([partKey(part), node.id])
                : partKey(part);
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

        if (!part.isOem || part.fluidAnalogDetached) continue;

        const number = normalizeArticle(part.article);
        const keys = originalsByNumber.get(number) ?? new Set();

        keys.add(group.key);
        originalsByNumber.set(number, keys);
    }

    const linkedNumbers = new Map<string, Set<string>>();

    for (const group of groups.values()) {
        const part = group.entries[0].part;
        if (!part.isOem) continue;

        const number = normalizeArticle(part.article);
        if (part.fluidAnalogDetached || originalsByNumber.get(number)?.size !== 1) continue;

        for (const cross of crossNumbers(group).keys()) {
            if ((originalsByNumber.get(cross)?.size ?? 0) > 1) continue;

            const links = linkedNumbers.get(number) ?? new Set<string>();
            links.add(cross);
            linkedNumbers.set(number, links);

            const reverseLinks = linkedNumbers.get(cross) ?? new Set<string>();
            reverseLinks.add(number);
            linkedNumbers.set(cross, reverseLinks);
        }
    }

    const chainCache = new Map<string, Set<string>>();

    function oemChain(number: string): Set<string> {
        const cached = chainCache.get(number);
        if (cached) return cached;

        const chain = new Set([number]);
        for (const current of chain) {
            for (const linked of linkedNumbers.get(current) ?? []) {
                chain.add(linked);
            }
        }

        for (const linked of chain) chainCache.set(linked, chain);
        return chain;
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
                    installations: part.installation
                        ? [part.installation]
                        : part.installationsByModification?.[modification.id] ?? [],
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
        nodeId: string,
    ): CatalogArticle {
        const placements = catalogNodeIds(group);
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
            nodeId: placements[0] ?? nodeId,
            nodeIds: params.section === 'fluids' || placements.length ? placements : undefined,

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



    const categoryMap = new Map<string, CatalogNode>();
    const nodeMap = new Map<string, CatalogNode>();

    function getNodeId(node: StoredCatalogNode, hasArticles = true, fillCapacity?: number): string {
        const isFluid = node.category === 'fluids';
        const prefix = isFluid ? 'fluids-master' : 'master-node';

        const id = `${prefix}:${JSON.stringify([
            node.category,
            node.title.trim().toLowerCase(),
        ])}`;

        const existing = nodeMap.get(id);
        if (existing) {
            if (hasArticles) existing.hasArticles = true;
            return id;
        }

        const categoryId = getOemCatalogCategoryId(node.category);

        let category = categoryMap.get(categoryId);

        if (!category) {
            category = {
                id: categoryId,
                name: getCatalogCategoryLabel(node.category, state.catalogCategoryLabels),
                children: [],
            };

            categoryMap.set(categoryId, category);
        }

        const child: CatalogNode = {
            id,
            parentId: categoryId,
            name: node.title,
            hasArticles,
            fillCapacity,
        };

        nodeMap.set(id, child);
        category.children?.push(child);

        return id;
    }

    if (params.section === 'fluids') {
        for (const node of state.catalogNodes) {
            if (getCatalogSection(node.category) !== 'fluids' ||
                node.brandSlug !== identity.model.brandSlug || node.modelSlug !== identity.model.modelSlug) continue;
            const liters = getNodeFillCapacity(node, identity.modification);
            if (liters != null) getNodeId(node, false, liters);
        }
    }

    function catalogNodeIds(group: PartGroup): string[] {
        const ids = new Set<string>();
        for (const { node, part } of group.entries) {
            if (node.brandSlug !== identity!.model.brandSlug || node.modelSlug !== identity!.model.modelSlug) continue;
            const compatible = part.compatibleModifications ?? [];
            if (compatible.includes('all') || compatible.includes(identity!.modification.id)) {
                ids.add(getNodeId(node));
            }
        }
        return [...ids];
    }

    const analogs = Array.from(groups.values()).filter(
        group => !group.entries[0].part.isOem
    );
    const visibleOriginalNumbers = new Set<string>();

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
        const chain = oemChain(number);
        if (!part.fluidAnalogDetached) {
            for (const linked of chain) visibleOriginalNumbers.add(linked);
        }
        const unambiguous = !part.fluidAnalogDetached && originalsByNumber.get(number)?.size === 1;

        const placements = catalogNodeIds(group);
        const nodeId = placements[0] ?? getNodeId(preferredEntry(group).node);



        const variants = unambiguous
            ? analogs
                .filter(analog =>
                    Array.from(crossNumbers(analog).keys()).some(
                        cross => chain.has(cross)
                    )
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

    // OEM-карточки для аналогов без оригинала в текущем каталоге.
    const oemReferences = new Map<
        string,
        { display: string; groups: PartGroup[] }
    >();

    for (const analog of analogs) {
        for (const [number, display] of crossNumbers(analog)) {
            if (visibleOriginalNumbers.has(number)) continue;

            const bucket = oemReferences.get(number) ?? {
                display,
                groups: [],
            };

            bucket.groups.push(analog);
            oemReferences.set(number, bucket);
        }
    }

    for (const [number, bucket] of oemReferences) {
        const relevantGroup = bucket.groups.find(
            group => matchesCurrentCar(directFitments(group))
        );
        if (!relevantGroup) continue;

        const entry = preferredEntry(relevantGroup);
        const placements = [...new Set(bucket.groups.flatMap(catalogNodeIds))];
        const nodeId = placements[0] ?? getNodeId(entry.node);

        // Внутри карточки — вся цепочка по всей базе.
        const variants = bucket.groups.map(
            group => toArticle(group, nodeId)
        );

        catalog.articles.push({
            id: `master-oem-reference:${number}`,
            nodeId,
            nodeIds: placements.length ? placements : undefined,
            oem: bucket.display,
            originalNumbers: [bucket.display],
            name: entry.part.name,
            canSave: false,
            note: 'OEM-номер из одобренных связей с аналогами для вашей модификации.',
            fitments: [],
            variants,
            relatedFitments: uniqueFitments(
                variants.flatMap(
                    variant => variant.fitments ?? []
                )
            ),
        });
    }

    if (params.section === 'fluids') {
        for (const group of analogs) {
            if (crossNumbers(group).size > 0) continue;
            const [nodeId] = catalogNodeIds(group);
            if (nodeId) catalog.articles.push(toArticle(group, nodeId));
        }
    }

    const categoryByKey = new Map([...categoryMap.values()].map(node => [
        node.id === 'fluids' ? 'fluids' : node.id.slice('master-category:'.length),
        node,
    ]));
    catalog.nodes = sortCatalogCategoryKeys(
        [...categoryByKey.keys()],
        state.catalogCategoryOrder,
        state.catalogCategoryLabels
    ).flatMap(key => {
        const node = categoryByKey.get(key);
        return node ? [node] : [];
    });

    return catalog;
}
