import Link from 'next/link';
import {
    ArrowLeft,
    CarFront,
    UserRound,
    Gauge,
    Calendar,
    Wrench,
    Hash,
    ArrowUpRight,
} from 'lucide-react';

interface MockCarDetail {
    id: string;
    title: string;
    year: number;
    vin: string;
    plateNumber?: string;
    mileage: number;
    engine?: string;
    transmission?: string;
    createdAt: string;
    serviceRecordsCount: number;
    owner: {
        id: string;
        name: string;
        email: string;
    };
}

const mockCarsData: Record<string, MockCarDetail> = {
    car_01: {
        id: 'car_01',
        title: 'Skoda Octavia A7',
        year: 2016,
        vin: 'XW8ZZZ5EZGP012345',
        plateNumber: 'А777АА 777',
        mileage: 124500,
        engine: '1.4 TSI (150 л.с.)',
        transmission: 'DSG-7 (DQ200)',
        createdAt: '12.02.2025',
        serviceRecordsCount: 8,
        owner: {
            id: 'usr_01',
            name: 'Виктор',
            email: 'viktor@example.com',
        },
    },
    car_02: {
        id: 'car_02',
        title: 'Volkswagen Golf 7',
        year: 2018,
        vin: 'WVWZZZAUZJP098765',
        mileage: 89000,
        engine: '1.4 TSI (125 л.с.)',
        transmission: 'Механика 6-ст',
        createdAt: '14.02.2025',
        serviceRecordsCount: 4,
        owner: {
            id: 'usr_01',
            name: 'Виктор',
            email: 'viktor@example.com',
        },
    },
    car_03: {
        id: 'car_03',
        title: 'Toyota Camry XV70',
        year: 2020,
        vin: 'XW7BF4FK60S034567',
        plateNumber: 'В123ОР 199',
        mileage: 65000,
        engine: '2.5 (181 л.с.)',
        transmission: 'АКПП-6',
        createdAt: '29.01.2025',
        serviceRecordsCount: 5,
        owner: {
            id: 'usr_02',
            name: 'Алексей Смирнов',
            email: 'alex.smirnov@example.com',
        },
    },
    car_04: {
        id: 'car_04',
        title: 'BMW 320d F30',
        year: 2014,
        vin: 'WBA3D31050F567890',
        mileage: 172000,
        engine: '2.0d (190 л.с.)',
        transmission: 'АКПП-8 (ZF)',
        createdAt: '05.12.2024',
        serviceRecordsCount: 14,
        owner: {
            id: 'usr_04',
            name: 'Сергей Морозов',
            email: 'morozov_s@example.com',
        },
    },
};

export default async function AdminCarPage({
                                               params,
                                           }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const car = mockCarsData[id] ?? {
        id,
        title: 'Автомобиль не найден',
        year: 0,
        vin: '—',
        mileage: 0,
        createdAt: '—',
        serviceRecordsCount: 0,
        owner: {
            id: 'unknown',
            name: 'Неизвестен',
            email: '—',
        },
    };

    return (
        <div className="space-y-6">
            <Link
                href="/admin/cars"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
                <ArrowLeft className="h-4 w-4" />
                Назад к списку автомобилей
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                        <CarFront className="h-7 w-7" />
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                                {car.title}
                            </h2>

                            {car.year > 0 && (
                                <span className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                                    {car.year} г.в.
                                </span>
                            )}
                        </div>

                        <p className="mt-0.5 text-xs font-mono text-[var(--text-dim)]">
                            ID: {car.id}
                        </p>
                    </div>
                </div>

                {car.plateNumber && (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 font-mono text-sm font-semibold tracking-wider text-[var(--text)]">
                        {car.plateNumber}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-2">
                    <h3 className="font-semibold text-[var(--text)]">
                        Параметры и характеристики
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                        <div className="flex items-start gap-3 rounded-xl bg-[var(--bg)]/40 border border-[var(--border)]/60 p-3.5">
                            <Hash className="h-4 w-4 text-[var(--text-dim)] mt-0.5" />
                            <div>
                                <p className="text-xs text-[var(--text-dim)]">VIN номер</p>
                                <p className="font-mono text-xs font-medium text-[var(--text)] mt-0.5">
                                    {car.vin}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-[var(--bg)]/40 border border-[var(--border)]/60 p-3.5">
                            <Gauge className="h-4 w-4 text-[var(--text-dim)] mt-0.5" />
                            <div>
                                <p className="text-xs text-[var(--text-dim)]">Текущий пробег</p>
                                <p className="font-semibold text-[var(--text)] mt-0.5">
                                    {car.mileage.toLocaleString('ru-RU')} км
                                </p>
                            </div>
                        </div>

                        {car.engine && (
                            <div className="flex items-start gap-3 rounded-xl bg-[var(--bg)]/40 border border-[var(--border)]/60 p-3.5">
                                <Wrench className="h-4 w-4 text-[var(--text-dim)] mt-0.5" />
                                <div>
                                    <p className="text-xs text-[var(--text-dim)]">Двигатель</p>
                                    <p className="font-medium text-[var(--text)] mt-0.5">
                                        {car.engine}
                                    </p>
                                </div>
                            </div>
                        )}

                        {car.transmission && (
                            <div className="flex items-start gap-3 rounded-xl bg-[var(--bg)]/40 border border-[var(--border)]/60 p-3.5">
                                <Wrench className="h-4 w-4 text-[var(--text-dim)] mt-0.5" />
                                <div>
                                    <p className="text-xs text-[var(--text-dim)]">Трансмиссия</p>
                                    <p className="font-medium text-[var(--text)] mt-0.5">
                                        {car.transmission}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3 rounded-xl bg-[var(--bg)]/40 border border-[var(--border)]/60 p-3.5">
                            <Calendar className="h-4 w-4 text-[var(--text-dim)] mt-0.5" />
                            <div>
                                <p className="text-xs text-[var(--text-dim)]">Добавлен в гараж</p>
                                <p className="font-medium text-[var(--text)] mt-0.5">
                                    {car.createdAt}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-[var(--bg)]/40 border border-[var(--border)]/60 p-3.5">
                            <Wrench className="h-4 w-4 text-[var(--text-dim)] mt-0.5" />
                            <div>
                                <p className="text-xs text-[var(--text-dim)]">Записей обслуживания</p>
                                <p className="font-medium text-[var(--text)] mt-0.5">
                                    {car.serviceRecordsCount} записей
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-1">
                    <h3 className="font-semibold text-[var(--text)]">
                        Владелец
                    </h3>

                    <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--bg)]/40 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-[var(--bg-elevated)] p-2 text-[var(--text-dim)]">
                                <UserRound className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="font-medium text-[var(--text)]">
                                    {car.owner.name}
                                </p>
                                <p className="text-xs text-[var(--text-dim)]">
                                    {car.owner.email}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-[var(--border)]/40">
                            <Link
                                href={`/admin/users/${car.owner.id}`}
                                className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
                            >
                                Перейти в профиль владельца
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}