type CategoryRule = {
    category: string;
    categoryLabel: string;
    matches: RegExp;
};

const CATEGORY_RULES: CategoryRule[] = [
    {
        category: 'brakes',
        categoryLabel: 'Тормозная система',
        matches:
            /колодк|суппорт|тормозн|направляющ\p{L}*\s+суппорт/iu,
    },
    {
        category: 'suspension',
        categoryLabel: 'Подвеска и рулевое',
        matches:
            /амортизатор|сайлентблок|шаров\p{L}*\s+опор|опор\p{L}*\s+шаров|рычаг\p{L}*\s+подвес|рулев\p{L}*\s+(тяг|наконечник|рейк)|стойк\p{L}*\s+стабилизатор|втулк\p{L}*\s+стабилизатор/iu,
    },
];

export function getPartCategoryWarning(
    partName: string,
    selectedCategory: string
): string | null {
    const name = partName.trim();
    const category = selectedCategory.trim();

    if (!name || !category) return null;

    const rule = CATEGORY_RULES.find(candidate =>
        candidate.matches.test(name)
    );

    if (!rule || rule.category === category) {
        return null;
    }

    return `Проверьте категорию. Для детали «${name}» рекомендуем раздел «${rule.categoryLabel}».`;
}