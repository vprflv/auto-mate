export interface CompatibilityResult {
    score: number; // 0 - 100
    tier: 'high' | 'medium' | 'low';
    label: string;
    warning?: string;
    isVerified?: boolean;
}

export interface CompatibilityInput {
    isOem?: boolean | null;
    isVerified?: boolean | null; // Проверено админом или заводским мануалом
    manualScore?: number | null; // Принудительный процент от админа
    explicitScore?: number | null;
    brand?: string | null;
    engineMatch?: boolean | null;
    yearMatch?: boolean | null;
    installationsCount?: number | null;
    hasVinMismatchWarning?: boolean | null;
}

const TIER_1_BRANDS = new Set([
    'mann-filter',
    'mann',
    'mahle',
    'knecht',
    'ate',
    'trw',
    'brembo',
    'lemforder',
    'lemförder',
    'bosch',
    'ngk',
    'denso',
    'sachs',
    'valeo',
    'continental',
    'contitech',
    'ina',
    'luk',
    'febi',
    'skf',
]);

export function formatCompatibilityResult(score: number, isVerified?: boolean): CompatibilityResult {
    if (isVerified || score >= 80) {
        return {
            score,
            tier: 'high',
            label: isVerified ? 'Проверено экспертом' : 'Высокая надежность',
            isVerified: true,
        };
    }

    if (score >= 40) {
        return {
            score,
            tier: 'medium',
            label: 'Редкий аналог',
            isVerified: false,
        };
    }

    return {
        score,
        tier: 'low',
        label: 'Требует проверки',
        warning: 'Низкая совместимость — перед покупкой проверьте совместимость по VIN коду!',
        isVerified: false,
    };
}

export function calculateCompatibilityScore(input: CompatibilityInput): CompatibilityResult {
    // 1. Наивысший приоритет — ручной процент, выставленный админом
    if (typeof input.manualScore === 'number') {
        const score = Math.max(5, Math.min(100, input.manualScore));
        return formatCompatibilityResult(score, input.isVerified ?? score >= 80);
    }

    if (typeof input.explicitScore === 'number') {
        const score = Math.max(5, Math.min(100, input.explicitScore));
        return formatCompatibilityResult(score, input.isVerified ?? score >= 80);
    }

    // 2. Если деталь верифицирована админом или заводским мануалом (Холодный старт)
    if (input.isVerified) {
        return formatCompatibilityResult(98, true);
    }

    let score = 0;
    const brandLower = (input.brand || '').trim().toLowerCase();

    // Базовый вес бренда / OEM
    if (Boolean(input.isOem)) {
        score += 55; // OEM изначально высоко
    } else if (TIER_1_BRANDS.has(brandLower)) {
        score += 45; // Конвейерные бренды изначально в хорошей зоне
    } else if (brandLower) {
        score += 25;
    } else {
        score += 15;
    }

    // Соответствие двигателю и годам
    if (input.engineMatch !== false) score += 20;
    if (input.yearMatch !== false) score += 10;

    // Подтверждение реальными установками (бонус к базовому)
    const count = input.installationsCount ?? 0;
    if (count >= 10) {
        score += 15;
    } else if (count >= 3) {
        score += 10;
    } else if (count >= 1) {
        score += 5;
    }

    // Штрафы
    if (input.hasVinMismatchWarning) {
        score = Math.min(score, 25);
    }

    const finalScore = Math.max(5, Math.min(99, score));
    return formatCompatibilityResult(finalScore, false);
}