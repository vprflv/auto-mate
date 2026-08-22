// features/price/lib/providers/webSearch.ts


import {PartSearchRequest, PriceOffer, PriceProvider} from "@/types/prices/price";

function encode(q: string) {
    return encodeURIComponent(q.trim());
}

function buildQuery(req: PartSearchRequest) {
    const oem = req.oemNumber?.trim();
    const analog = req.analogNumber?.trim();
    const brand = req.brand?.trim();
    const name = req.name.trim();
    const car = `${req.make} ${req.model} ${req.year}`;


    if (oem && oem.toUpperCase() !== 'УТОЧНИТЬ') {
        return {
            short: oem,
            full: `${oem} ${brand || ''} ${car}`.trim(),
            display: oem,
        };
    }

    if (analog) {
        return {
            short: analog,
            full: `${analog} ${name} ${car}`.trim(),
            display: analog,
        };
    }

    return {
        short: `${brand || ''} ${name}`.trim(),
        full: `${brand || ''} ${name} ${car}`.trim(),
        display: name,
    };
}

export const webSearchPriceProvider: PriceProvider = {
    async search(request: PartSearchRequest): Promise<PriceOffer[]> {
        await new Promise((r) => setTimeout(r, 250));

        const q = buildQuery(request);
        const id = () => Math.random().toString(36).slice(2, 9);

        const offers: PriceOffer[] = [
            {
                id: id(),
                shop: 'Exist',
                title: `Найти «${q.display}» на Exist`,
                url: `https://exist.ru/Price/?pcode=${encode(q.short)}`,
                note: 'Поиск по артикулу / названию',
                source: 'web',
            },
            {
                id: id(),
                shop: 'Emex',
                title: `Найти «${q.display}» на Emex`,
                url: `https://emex.ru/f?detailNum=${encode(q.short)}`,
                note: 'Поиск по номеру детали',
                source: 'web',
            },
            {
                id: id(),
                shop: 'АвтоДокументы / Avito',
                title: `Объявления: ${q.display}`,
                url: `https://www.avito.ru/all?q=${encode(q.full)}`,
                note: 'Объявления частных продавцов и магазинов',
                source: 'web',
            },
            {
                id: id(),
                shop: 'Яндекс',
                title: `Яндекс: ${q.full}`,
                url: `https://yandex.ru/search/?text=${encode(q.full + ' купить')}`,
                note: 'Общий поиск по интернету',
                source: 'web',
            },
            {
                id: id(),
                shop: 'Google',
                title: `Google: ${q.full}`,
                url: `https://www.google.com/search?q=${encode(q.full + ' купить')}`,
                note: 'Общий поиск по интернету',
                source: 'web',
            },
        ];

        // Если есть нормальный OEM — добавим ещё один «точный» поиск
        if (request.oemNumber && request.oemNumber.toUpperCase() !== 'УТОЧНИТЬ') {
            offers.unshift({
                id: id(),
                shop: 'Exist (точный артикул)',
                title: `OEM ${request.oemNumber}`,
                url: `https://exist.ru/Price/?pcode=${encode(request.oemNumber)}`,
                note: 'Поиск строго по OEM',
                source: 'web',
            });
        }

        return offers;
    },
};