export const ROBOT_TRANSMISSION = 'Робот';

export const transmissionOptions = ['Механика', 'Автомат', 'Вариатор (CVT)', ROBOT_TRANSMISSION];

export function formatTransmission(value = ''): string {
    const label = value.trim().replace(/\s+/g, ' ');
    const wrapped = /^(Автомат|АКПП|Механика|МКПП|Вариатор|Робот)\s*\(([^)]+)\)$/iu.exec(label);
    const rawCode = (wrapped?.[2] ?? label).trim().toUpperCase();
    const code = rawCode.replace(/[АМТС]/gu, letter =>
        ({ А: 'A', М: 'M', Т: 'T', С: 'C' })[letter] ?? letter
    );
    const automatic = /^(\d+)\s*-?\s*AT$/u.exec(code) ?? /^(\d+)\s*-?\s*АКПП$/u.exec(rawCode);
    const manual = /^(\d+)\s*-?\s*MT$/u.exec(code) ?? /^(\d+)\s*-?\s*МКПП$/u.exec(rawCode);
    if (automatic) return `Автомат (${automatic[1]}AT)`;
    if (manual) return `Механика (${manual[1]}MT)`;
    if (code === 'AT' || /^(АВТОМАТ|АКПП)$/u.test(rawCode)) return 'Автомат';
    if (code === 'MT' || /^(МЕХАНИКА|МКПП)$/u.test(rawCode)) return 'Механика';
    if (code === 'CVT' || /^Вариатор$/iu.test(label)) return 'Вариатор (CVT)';
    if (/^I[ -]?SHIFT$/u.test(code)) return 'Робот (i-Shift)';
    if (/^(?:DCT|DSG|AMT|PDK|EDC|DCT\s*\d+|\d+\s*DCT)$/u.test(code)) return `Робот (${code})`;
    if (/^Робот$/iu.test(label)) return ROBOT_TRANSMISSION;
    return label;
}
