import { BrandCatalog } from '../types';

export const defaultBaseCatalogs: BrandCatalog[] = [
    {
        brand: 'Audi',
        slug: 'audi',
        models: [
            {
                slug: 'a4-b9',
                name: 'A4 (B9)',
                years: '2015 – 2024',
                partsCount: 112,
                verifiedPercent: 93,
            },
            {
                slug: 'q5-fy',
                name: 'Q5 (FY)',
                years: '2017 – н.в.',
                partsCount: 88,
                verifiedPercent: 90,
            },
        ],
    },
    {
        brand: 'BMW',
        slug: 'bmw',
        models: [
            {
                slug: '3-series-g20',
                name: '3 Series (G20)',
                years: '2018 – н.в.',
                partsCount: 120,
                verifiedPercent: 92,
            },
            {
                slug: '5-series-g30',
                name: '5 Series (G30)',
                years: '2017 – 2023',
                partsCount: 104,
                verifiedPercent: 88,
            },
        ],
    },
    {
        brand: 'Skoda',
        slug: 'skoda',
        models: [
            {
                slug: 'kodiaq',
                name: 'Kodiaq I',
                years: '2016 – 2024',
                partsCount: 98,
                verifiedPercent: 91,
            },
            {
                slug: 'octavia-a7',
                name: 'Octavia A7',
                years: '2013 – 2020',
                partsCount: 142,
                verifiedPercent: 94,
            },
        ],
    },
    {
        brand: 'Toyota',
        slug: 'toyota',
        models: [
            {
                slug: 'camry-xv70',
                name: 'Camry (XV70)',
                years: '2017 – 2024',
                partsCount: 130,
                verifiedPercent: 95,
            },
            {
                slug: 'rav4-xa50',
                name: 'RAV4 (XA50)',
                years: '2018 – н.в.',
                partsCount: 105,
                verifiedPercent: 91,
            },
        ],
    },
    {
        brand: 'Volkswagen',
        slug: 'volkswagen',
        models: [
            {
                slug: 'tiguan-ii',
                name: 'Tiguan II',
                years: '2016 – 2024',
                partsCount: 115,
                verifiedPercent: 89,
            },
        ],
    },
];