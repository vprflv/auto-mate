import { PartCategory } from '@/types';
import {getUserSubcategoriesByCategory} from "@/features/garage/lib/userSubcategories";

type Rule = { sub: string; patterns: RegExp[] };

const RULES: Partial<Record<PartCategory, Rule[]>> = {
    brakes: [
        { sub: 'pads', patterns: [/колодк/i, /pad/i] },
        { sub: 'discs', patterns: [/диск/i, /disc/i, /rotor/i] },
        { sub: 'hoses', patterns: [/шланг/i, /hose/i] },
        { sub: 'caliperGuides', patterns: [/направляющ/i, /направл/i, /guide/i, /pin/i] },
        { sub: 'calipers', patterns: [/суппорт/i, /caliper/i] },
        { sub: 'drums', patterns: [/барабан/i, /drum/i] },
    ],
    filters: [
        { sub: 'oil', patterns: [/маслян/i, /oil\s*filter/i] },
        { sub: 'air', patterns: [/воздушн/i, /air\s*filter/i] },
        { sub: 'cabin', patterns: [/салонн/i, /салон/i, /cabin/i, /pollen/i] },
        { sub: 'fuel', patterns: [/топливн/i, /fuel\s*filter/i] },
        { sub: 'transmission', patterns: [/акпп|кпп|трансмисс/i] },
    ],
    engine: [
        { sub: 'sparkPlugs', patterns: [/свеч/i, /spark/i] },
        { sub: 'belts', patterns: [/ремен|ремень|belt/i] },
        { sub: 'gaskets', patterns: [/прокладк/i, /gasket/i] },
        { sub: 'sensors', patterns: [/датчик/i, /sensor/i] },
    ],
    suspension: [
        { sub: 'shock', patterns: [/амортизатор|стойк/i, /shock/i] },
        { sub: 'arms', patterns: [/рычаг/i, /arm/i] },
        { sub: 'bushings', patterns: [/сайлент/i, /втулк/i, /bush/i] },
        { sub: 'balls', patterns: [/шаров/i, /ball\s*joint/i] },
    ],
    maintenance: [
        { sub: 'wipers', patterns: [/дворник|щётки|щетки|wiper/i] },
        { sub: 'bulbs', patterns: [/ламп/i, /bulb/i] },
    ],
    electrical: [
        { sub: 'battery', patterns: [/акб|батаре/i, /battery/i] },
        { sub: 'sensors', patterns: [/датчик/i, /sensor/i] },
    ],
    body: [
        { sub: 'mirrors', patterns: [/зеркал/i, /mirror/i] },
        { sub: 'optics', patterns: [/фара|фонар|оптик/i, /headlight|lamp/i] },
    ],
};



export function detectSubcategory(
    category: PartCategory,
    name: string
): string {
    const text = name.trim().toLowerCase();

    // 1. Сначала пользовательские категории
    const userSubs = getUserSubcategoriesByCategory(category);
    for (const sub of userSubs) {
        if (sub.keywords.some((kw) => text.includes(kw))) {
            return sub.key;
        }
    }

    // 2. Потом системные правила
    const rules = RULES[category];
    if (rules) {
        for (const rule of rules) {
            if (rule.patterns.some((re) => re.test(text))) {
                return rule.sub;
            }
        }
    }

    return 'other';
}