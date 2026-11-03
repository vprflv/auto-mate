type SubcategoryOption = {
    id: string;
    label: string;
};

const normalize = (value: string) =>
    value
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();

const ignoredWords = new Set([
    'и',
    'в',
    'во',
    'на',
    'для',
    'с',
    'со',
    'по',
    'от',
    'к',
    'из',
    'шт',
]);

function stem(word: string): string {
    // Частые варианты написания.
    if (/^(масля|маслян)/.test(word) || word === 'oil') {
        return 'масля';
    }

    if (/^воздуш/.test(word) || word === 'air') {
        return 'воздуш';
    }

    if (/^салон/.test(word) || word === 'cabin') {
        return 'салон';
    }

    if (/^топлив/.test(word) || word === 'fuel') {
        return 'топлив';
    }

    // Не обрезаем короткие обозначения: ABS, ГРМ, АКПП.
    if (word.length <= 3) return word;

    // Окончания прилагательных:
    // передний / передние, шаровая / шаровые.
    const adjective = word.replace(
        /(ыми|ими|ого|его|ому|ему|ая|яя|ое|ее|ый|ий|ой|ые|ие|ую|юю|ым|им|ом|ем|ых|их)$/u,
        ''
    );

    if (adjective !== word && adjective.length >= 4) {
        return adjective;
    }

    // Окончания существительных:
    // датчик / датчики / датчика,
    // амортизатор / амортизаторы,
    // свеча / свечи, опора / опоры.
    const noun = word.replace(
        /(иями|ями|ами|ией|иям|иях|ия|ий|ей|ов|ев|ам|ям|ах|ях|ы|и|а|я|у|ю|е|о|ь)$/u,
        ''
    );

    return noun.length >= 3 ? noun : word;
}

function words(value: string): string[] {
    return [
        ...new Set(
            normalize(value)
                .split(/\s+/)
                .filter(word =>
                    Boolean(word) && !ignoredWords.has(word)
                )
                .map(stem)
        ),
    ];
}

const genericWords = new Set(
    [
        'фильтр',
        'filter',
        'деталь',
        'запчасть',
        'комплект',
        'прочее',
        'другое',
        'other',
    ].map(stem)
);

export function suggestPartSubcategory(
    partName: string,
    options: SubcategoryOption[]
): string {
    const partWords = new Set(words(partName));

    const matches = options
        .map(option => {
            const labelWords = words(option.label);

            const meaningfulWords = labelWords.filter(
                word => !genericWords.has(word)
            );

            if (
                !meaningfulWords.length ||
                !meaningfulWords.every(word => partWords.has(word))
            ) {
                return {
                    id: option.id,
                    score: 0,
                };
            }

            const matchedWords = labelWords.filter(
                word => partWords.has(word)
            ).length;

            return {
                id: option.id,
                score: meaningfulWords.length * 10 + matchedWords,
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    if (!matches.length) return '';

    if (
        matches.length > 1 &&
        matches[0].score === matches[1].score
    ) {
        return '';
    }

    return matches[0].id;
}