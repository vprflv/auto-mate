import { InboxItem } from '@/features/admin/lib/systemStore';

export const ADMIN_CATALOG_CATEGORIES = [
    { id: 'service', label: 'ТО и фильтры' },
    { id: 'fluids', label: 'Масла и техжидкости' },
    { id: 'brakes', label: 'Тормозная система' },
    { id: 'suspension', label: 'Подвеска и рулевое' },
    { id: 'ignition', label: 'Зажигание и электрика' },
    { id: 'engine', label: 'Двигатель и КПП' },
    { id: 'body', label: 'Кузов и салон' },
];

export function detectInitialCategory(item: InboxItem): string {
    const raw = `${item.itemType || ''} ${item.category || ''} ${item.subcategory || ''} ${item.partName || ''}`.toLowerCase();

    if (item.itemType === 'Техническая жидкость' || raw.includes('масло') || raw.includes('жидкость') || raw.includes('антифриз') || raw.includes('oil') || raw.includes('fluid')) {
        return 'fluids';
    }
    if (raw.includes('тормоз') || raw.includes('колодк') || raw.includes('диск') || raw.includes('brake')) {
        return 'brakes';
    }
    if (raw.includes('подвеск') || raw.includes('амортизатор') || raw.includes('рычаг') || raw.includes('сайлентблок') || raw.includes('стойк') || raw.includes('suspension')) {
        return 'suspension';
    }
    if (raw.includes('зажигани') || raw.includes('свеч') || raw.includes('катушк') || raw.includes('аккумулятор') || raw.includes('ламп') || raw.includes('ignition') || raw.includes('electr')) {
        return 'ignition';
    }
    if (raw.includes('грм') || raw.includes('ремень') || raw.includes('цепь') || raw.includes('сцеплени') || raw.includes('двигател') || raw.includes('кпп') || raw.includes('engine')) {
        return 'engine';
    }
    if (raw.includes('кузов') || raw.includes('салон') || raw.includes('щетки') || raw.includes('дворник') || raw.includes('стекл') || raw.includes('body')) {
        return 'body';
    }
    return 'service';
}

export interface ParsedCarSpecs {
    vinDisplay: string;
    engineCodeDisplay: string;
    fullEngineTag: string;
    powerDisplay: string;
    transmissionDisplay: string;
    drivetrainDisplay: string;
    fuelDisplay: string;
    bodyGenerationDisplay: string;
    wheelDisplay: string;
    mileageDisplay: string;
    plateDisplay: string;
    extraUnknownSpecs: { label: string; value: string }[];
    hasAnySpecs: boolean;
}

// Перевод английских значений характеристик в привычный русский вид
const VALUE_TRANSLATIONS: Record<string, string> = {
    // Привод
    fwd: 'Передний (FWD)',
    front: 'Передний',
    rwd: 'Задний (RWD)',
    rear: 'Задний',
    awd: 'Полный (AWD)',
    '4wd': 'Полный (4WD)',
    '4x4': 'Полный (4x4)',
    full: 'Полный',
    // КПП
    at: 'Автомат (АКПП)',
    auto: 'Автомат (АКПП)',
    automatic: 'Автомат (АКПП)',
    mt: 'Механика (МКПП)',
    manual: 'Механика (МКПП)',
    cvt: 'Вариатор (CVT)',
    variator: 'Вариатор (CVT)',
    amt: 'Робот (АМТ)',
    robot: 'Робот (РКПП)',
    dsg: 'Робот (DSG)',
    dct: 'Робот (DCT)',
    // Топливо
    petrol: 'Бензин',
    gasoline: 'Бензин',
    benzin: 'Бензин',
    diesel: 'Дизель',
    hybrid: 'Гибрид',
    electric: 'Электро',
    ev: 'Электро',
    lpg: 'Газ / Бензин',
    gas: 'Газ',
    // Руль
    left: 'Левый',
    lhd: 'Левый',
    right: 'Правый',
    rhd: 'Правый',
    // Кузов
    sedan: 'Седан',
    hatchback: 'Хэтчбек',
    liftback: 'Лифтбек',
    wagon: 'Универсал',
    estate: 'Универсал',
    suv: 'Кроссовер / Внедорожник',
    crossover: 'Кроссовер',
    coupe: 'Купе',
    minivan: 'Минивэн',
    pickup: 'Пикап',
};

// Перевод английских ключей объекта car на русский
const KEY_TRANSLATIONS: Record<string, string> = {
    fuel: 'Топливо',
    fuelType: 'Топливо',
    engineType: 'Тип двигателя',
    steering: 'Руль',
    steeringWheel: 'Руль',
    wheel: 'Руль',
    handDrive: 'Руль',
    color: 'Цвет',
    doors: 'Дверей',
    seats: 'Мест',
    weight: 'Масса',
    clearance: 'Клиренс',
    tank: 'Объём бака',
    fuelTank: 'Объём бака',
    torque: 'Крутящий момент',
    cylinders: 'Цилиндров',
    valves: 'Клапанов',
    turbo: 'Наддув',
    country: 'Страна марки',
    assembly: 'Сборка',
    ecologicalClass: 'Эко-класс',
    ecoClass: 'Эко-класс',
};

function translateSpecValue(val: any): string {
    if (val === null || val === undefined) return '';
    const str = String(val).trim();
    if (!str) return '';
    const lower = str.toLowerCase();
    return VALUE_TRANSLATIONS[lower] || str;
}

const IGNORED_SPEC_KEYS = new Set([
    'id', 'make', 'brand', 'model', 'year', 'vin', 'vinCode', 'nickname', 'name',
    'engine', 'engineVolume', 'engineCapacity', 'displacement', 'motor', 'modification',
    'engineCode', 'engine_code', 'engineModel', 'engineName', 'engineDisplacement',
    'drive', 'drivetrain', 'driveType', 'wheelDrive', 'privod',
    'transmission', 'gearbox', 'transmissionType', 'kpp',
    'power', 'hp', 'powerHp', 'horsePower', 'enginePower',
    'fuel', 'fuelType', 'engineType',
    'steering', 'steeringWheel', 'wheel', 'handDrive',
    'bodyType', 'body', 'carBody', 'generation', 'gen',
    'mileage', 'currentMileage', 'odometer',
    'plateNumber', 'licensePlate', 'plate', 'regNumber', 'gosnomer',
    'createdAt', 'updatedAt', 'userId', 'ownerId', 'color', 'avatar', 'image', 'photo',
    'notes', 'comment', 'description', 'isArchived', 'isFavorite', 'status'
]);

export function extractCarSpecs(item: InboxItem): ParsedCarSpecs {
    const s = item.carSpecs || {};
    const rawSpecs: Record<string, any> = {
        ...(s.extra || {}),
        ...(s.extraInfo || {}),
        ...(s.specs || {}),
        ...(s.characteristics || {}),
        ...s,
    };

    const vinDisplay = String(item.carVin || rawSpecs.vin || rawSpecs.vinCode || '').trim();

    const engineDisplay =
        item.engine ||
        rawSpecs.engine ||
        rawSpecs.engineVolume ||
        rawSpecs.engineCapacity ||
        rawSpecs.displacement ||
        rawSpecs.motor ||
        rawSpecs.modification ||
        '';

    const engineCodeDisplay =
        item.engineCode ||
        rawSpecs.engineCode ||
        rawSpecs.engine_code ||
        rawSpecs.engineModel ||
        '';

    const drivetrainRaw =
        item.drivetrain ||
        rawSpecs.drivetrain ||
        rawSpecs.drive ||
        rawSpecs.driveType ||
        rawSpecs.wheelDrive ||
        rawSpecs.privod ||
        '';
    const drivetrainDisplay = translateSpecValue(drivetrainRaw);

    const transmissionRaw =
        item.transmission ||
        rawSpecs.transmission ||
        rawSpecs.gearbox ||
        rawSpecs.transmissionType ||
        rawSpecs.kpp ||
        '';
    const transmissionDisplay = translateSpecValue(transmissionRaw);

    const fuelRaw = rawSpecs.fuel || rawSpecs.fuelType || rawSpecs.engineType || '';
    const fuelDisplay = translateSpecValue(fuelRaw);

    const wheelRaw = rawSpecs.steering || rawSpecs.steeringWheel || rawSpecs.wheel || rawSpecs.handDrive || '';
    const wheelDisplay = translateSpecValue(wheelRaw);

    const powerVal =
        rawSpecs.power ||
        rawSpecs.hp ||
        rawSpecs.powerHp ||
        rawSpecs.horsePower ||
        rawSpecs.enginePower ||
        '';
    const powerDisplay = powerVal ? `${String(powerVal).replace(/л\.?с\.?|hp/gi, '').trim()} л.с.` : '';

    const bodyRaw = rawSpecs.bodyType || rawSpecs.body || rawSpecs.carBody || '';
    const bodyDisplay = translateSpecValue(bodyRaw);
    const generationDisplay = String(rawSpecs.generation || rawSpecs.gen || '').trim();
    const bodyGenerationDisplay = [bodyDisplay, generationDisplay].filter(Boolean).join(', ');

    const mileageVal = item.mileage || rawSpecs.mileage || rawSpecs.currentMileage || rawSpecs.odometer;
    const mileageDisplay = mileageVal ? `${Number(mileageVal).toLocaleString()} км` : '';

    const plateDisplay = String(
        rawSpecs.plateNumber ||
        rawSpecs.licensePlate ||
        rawSpecs.plate ||
        rawSpecs.regNumber ||
        rawSpecs.gosnomer ||
        ''
    ).trim();

    let fullEngineTag = String(engineDisplay || engineCodeDisplay || '').trim();
    if (engineDisplay && engineCodeDisplay) {
        const lowerEng = String(engineDisplay).toLowerCase();
        const lowerCode = String(engineCodeDisplay).toLowerCase();
        fullEngineTag = lowerEng.includes(lowerCode)
            ? String(engineDisplay).trim()
            : `${engineDisplay} (${engineCodeDisplay})`;
    }

    const extraUnknownSpecs: { label: string; value: string }[] = [];
    for (const [k, v] of Object.entries(rawSpecs)) {
        if (IGNORED_SPEC_KEYS.has(k)) continue;
        // Показываем дополнительные поля только если у них есть русский перевод ключа или сам ключ уже на кириллице
        const isCyrillicKey = /[а-яА-ЯёЁ]/.test(k);
        const translatedLabel = KEY_TRANSLATIONS[k] || (isCyrillicKey ? k : null);
        if (!translatedLabel) continue;

        if (typeof v === 'string' && v.trim().length > 0 && v.trim().length < 35) {
            extraUnknownSpecs.push({ label: translatedLabel, value: translateSpecValue(v) });
        } else if (typeof v === 'number' && v > 0) {
            extraUnknownSpecs.push({ label: translatedLabel, value: String(v) });
        }
    }

    const hasAnySpecs = Boolean(
        fullEngineTag ||
        powerDisplay ||
        transmissionDisplay ||
        drivetrainDisplay ||
        fuelDisplay ||
        wheelDisplay ||
        bodyGenerationDisplay ||
        mileageDisplay ||
        plateDisplay ||
        extraUnknownSpecs.length > 0
    );

    return {
        vinDisplay,
        engineCodeDisplay: String(engineCodeDisplay),
        fullEngineTag,
        powerDisplay,
        transmissionDisplay,
        drivetrainDisplay,
        fuelDisplay,
        bodyGenerationDisplay,
        wheelDisplay,
        mileageDisplay,
        plateDisplay,
        extraUnknownSpecs,
        hasAnySpecs,
    };
}