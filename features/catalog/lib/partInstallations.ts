import type {
    PartAxle,
    PartSide,
    PartInstallation,
} from '@/types/partInstallation';

export function normalizeInstallation(
    value: PartInstallation = {}
): PartInstallation {
    if (!value || typeof value !== 'object') {
        throw new Error('Некорректное расположение детали.');
    }

    const axle = value.axle || undefined;
    const side = value.side || undefined;

    if (
        axle !== undefined &&
        !['front', 'rear', 'both'].includes(axle)
    ) {
        throw new Error('Некорректное значение оси.');
    }

    if (
        side !== undefined &&
        !['left', 'right', 'both'].includes(side)
    ) {
        throw new Error('Некорректное значение стороны.');
    }

    return { axle, side };
}

export function installationKey(
    value: PartInstallation = {}
): string {
    const { axle, side } = normalizeInstallation(value);

    return JSON.stringify([axle ?? '', side ?? '']);
}

export function uniqueInstallations(
    values: PartInstallation[] = []
): PartInstallation[] {
    const result = new Map<string, PartInstallation>();

    for (const value of values) {
        const normalized = normalizeInstallation(value);

        if (!normalized.axle && !normalized.side) continue;

        result.set(
            installationKey(normalized),
            normalized
        );
    }

    return Array.from(result.values());
}

export function expandInstallations(
    values: PartInstallation[] = []
): PartInstallation[] {
    const expanded: PartInstallation[] = [];

    for (const value of uniqueInstallations(values)) {
        const axles: (PartAxle | undefined)[] =
            value.axle === 'both'
                ? ['front', 'rear']
                : [value.axle];

        const sides: (PartSide | undefined)[] =
            value.side === 'both'
                ? ['left', 'right']
                : [value.side];

        for (const axle of axles) {
            for (const side of sides) {
                expanded.push({ axle, side });
            }
        }
    }

    return uniqueInstallations(expanded);
}