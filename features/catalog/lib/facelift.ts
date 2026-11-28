export const faceliftValues = ['unknown', 'pre_facelift', 'facelift'] as const;

type BaseFacelift = (typeof faceliftValues)[number];
type Facelift = BaseFacelift | `facelift_${number}`;
type KnownFacelift = Exclude<Facelift, 'unknown'>;

const baseLabels: Record<BaseFacelift, string> = {
    pre_facelift: 'Дорестайлинг',
    facelift: 'Рестайлинг',
    unknown: 'Не определено',
};

function faceliftKey(value: string): string {
    return value.toLowerCase().replace(/[\s_№\-–—]+/g, '');
}

export function parseFacelift(value: string): Facelift | undefined {
    const key = faceliftKey(value);
    const base = faceliftValues.find(option => faceliftKey(option) === key || faceliftKey(baseLabels[option]) === key);
    if (base) return base;

    const numberText = /^(?:facelift|рестайлинг)(\d+)$/u.exec(key)?.[1] ??
        /^(\d+)(?:й|ый|ой)?рестайлинг$/u.exec(key)?.[1];
    const number = Number(numberText);
    return Number.isSafeInteger(number) && number > 0 ? `facelift_${number}` : undefined;
}

export function normalizeFacelift(value?: string): Facelift {
    return parseFacelift(value ?? '') ?? 'unknown';
}

export function knownFacelift(value?: string): KnownFacelift | undefined {
    const version = normalizeFacelift(value);
    return version === 'unknown' ? undefined : version;
}

export function faceliftNumber(value?: string): string {
    const version = normalizeFacelift(value);
    return version.startsWith('facelift_') ? version.slice('facelift_'.length) : '';
}

export function formatFacelift(value?: string): string {
    const version = normalizeFacelift(value);
    if (version === 'unknown' || version === 'pre_facelift' || version === 'facelift') return baseLabels[version];
    return `Рестайлинг ${faceliftNumber(version)}`;
}

export function matchesFacelift(first?: string, second?: string): boolean {
    const entered = knownFacelift(first);
    const stored = knownFacelift(second);
    return !entered || !stored || entered === stored ||
        (entered === 'facelift' && stored.startsWith('facelift_')) ||
        (stored === 'facelift' && entered.startsWith('facelift_'));
}

export function getCatalogFaceliftOptions(attributes: readonly Readonly<Record<string, string | undefined>>[]) {
    const yearsByVersion = new Map<KnownFacelift, Set<string>>();
    for (const { facelift, year, yearEnd } of attributes) {
        const version = knownFacelift(facelift);
        if (!version) continue;
        const ranges = yearsByVersion.get(version) ?? new Set<string>();
        if (year && /^\d{4}$/.test(year)) {
            ranges.add(yearEnd && /^\d{4}$/.test(yearEnd) && yearEnd !== year ? `${year}–${yearEnd}` : year);
        }
        yearsByVersion.set(version, ranges);
    }

    const order = (version: KnownFacelift) => version === 'pre_facelift' ? -1 : Number(faceliftNumber(version));
    return [...yearsByVersion.entries()].sort(([first], [second]) => order(first) - order(second)).map(([value, years]) => ({
        value,
        label: years.size === 1 ? `${formatFacelift(value)} · ${[...years][0]}` : formatFacelift(value),
    }));
}
