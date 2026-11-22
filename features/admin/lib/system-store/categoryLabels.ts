import type { CatalogBranch } from '@/types';

const legacyCatalogCategoryLabels: Readonly<Record<string, string>> = {
    service: 'Расходники ТО',
    engine: 'Двигатель',
    transmission: 'Трансмиссия',
    ignition: 'Электрика',
    suspension: 'Подвеска',
    steering: 'Рулевое управление',
    interior: 'Салон',
    body: 'Кузов',
    brakes: 'Тормозная система',
    fluids: 'Масла и жидкости',
};

const categoryAliases: Readonly<Record<string, string>> = {
    maintenance: 'service',
    electrical: 'ignition',
    'зажигание / электрика': 'ignition',
    'зажигание и электрика': 'ignition',
    'подвеска и рулевое': 'suspension',
    'рулевое': 'steering',
};

const normalizeCategory = (value: string) =>
    value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

const defaultOrder = Object.keys(legacyCatalogCategoryLabels);
const defaultKeysByLabel = new Map(
    Object.entries(legacyCatalogCategoryLabels).map(([key, label]) => [normalizeCategory(label), key])
);

function defaultCategoryKey(value: string): string {
    const key = normalizeCategory(value);
    return defaultKeysByLabel.get(key) ??
        (Object.prototype.hasOwnProperty.call(categoryAliases, key) ? categoryAliases[key] : key);
}

export function getCatalogCategoryKeys(
    branches: readonly CatalogBranch[],
    hidden: readonly string[] = []
): string[] {
    const hiddenKeys = new Set(hidden);
    return [...new Set(branches.map(branch => branch.category).filter(key => !hiddenKeys.has(key)))];
}

export function sortCatalogCategoryKeys(
    categories: readonly string[],
    savedOrder: readonly string[] = [],
    labels?: Readonly<Record<string, string>>
): string[] {
    const savedRanks = new Map(savedOrder.map((category, index) => [category, index]));
    const rank = (category: string) => {
        const saved = savedRanks.get(category);
        if (saved !== undefined) return saved;
        const standard = defaultOrder.indexOf(defaultCategoryKey(category));
        const index = standard >= 0 ? standard : defaultOrder.indexOf(defaultCategoryKey(getCatalogCategoryLabel(category, labels)));
        return savedOrder.length + (index >= 0 ? index : defaultOrder.length);
    };

    return [...categories].sort((a, b) =>
        rank(a) - rank(b) ||
        getCatalogCategoryLabel(a, labels).localeCompare(getCatalogCategoryLabel(b, labels), 'ru')
    );
}

export function getCatalogCategoryLabel(
    category: string,
    labels?: Readonly<Record<string, string>>
): string {
    for (const source of [labels, legacyCatalogCategoryLabels]) {
        if (source && Object.prototype.hasOwnProperty.call(source, category)) {
            return source[category];
        }
    }
    return category;
}

export function getCatalogBranchTitles(nodes: readonly CatalogBranch[], category: string): string[] {
    const titles = new Map<string, string>();

    for (const node of nodes) {
        const title = node.title.trim();
        if (node.category === category && title) {
            const key = title.toLocaleLowerCase('ru');
            if (!titles.has(key)) titles.set(key, title);
        }
    }

    const sort = (a: string, b: string) => a.localeCompare(b, 'ru');
    return [...titles.values()].sort(sort);
}
