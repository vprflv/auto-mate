'use client';

import * as React from 'react';
import Link from 'next/link';
import { CarFront, Search, ArrowUpRight, X, Trash2 } from 'lucide-react';
import { systemStore, AppCar } from '@/features/admin/lib/systemStore';

export default function AdminCarsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [cars, setCars] = React.useState<AppCar[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
        setCars(systemStore.getState().cars);
        setIsLoaded(true);

        const onLocalUpdate = () => setCars(systemStore.getState().cars);
        window.addEventListener('system-store-updated', onLocalUpdate);

        const onStorageUpdate = (e: StorageEvent) => {
            if (e.key === 'bm_shared_system_state_v1') {
                setCars(systemStore.getState().cars);
            }
        };
        window.addEventListener('storage', onStorageUpdate);

        return () => {
            window.removeEventListener('system-store-updated', onLocalUpdate);
            window.removeEventListener('storage', onStorageUpdate);
        };
    }, []);

    // Пуленепробиваемый фильтр (защита от undefined полей)
    const filteredCars = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return cars;

        return cars.filter((car) => {
            if (!car) return false;

            const title = car.title?.toLowerCase() || '';
            const vin = car.vin?.toLowerCase() || '';
            const owner = car.ownerName?.toLowerCase() || '';
            const plate = car.plateNumber?.toLowerCase() || '';
            const id = car.id?.toLowerCase() || '';

            return title.includes(query) ||
                vin.includes(query) ||
                owner.includes(query) ||
                plate.includes(query) ||
                id.includes(query);
        });
    }, [searchQuery, cars]);

    // Кнопка для очистки тестовой базы (если застряли кривые данные)
    const handleClearDB = () => {
        if (confirm('Сбросить общую тестовую базу админки?')) {
            localStorage.removeItem('bm_shared_system_state_v1');
            window.dispatchEvent(new Event('system-store-updated'));
            window.location.reload();
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">Автомобили</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Автомобили пользователей приложения
                    </p>
                </div>

                <button
                    onClick={handleClearDB}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-500 hover:text-white"
                >
                    <Trash2 className="h-4 w-4" />
                    Очистить базу
                </button>
            </div>

            <div className="relative max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по марке, модели, VIN или владельцу..."
                    className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-9 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                        <tr className="border-b border-[var(--border)] text-left">
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Автомобиль</th>
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Владелец</th>
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">VIN</th>
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Пробег</th>
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Добавлен</th>
                            <th className="w-12 px-5 py-4" />
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--border)]/40">
                        {filteredCars.length > 0 ? (
                            filteredCars.map((car) => (
                                <tr key={car.id} className="group transition-colors hover:bg-[var(--bg-elevated)]/40">
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <Link href={`/admin/cars/${car.id}`} className="font-medium text-[var(--text)] transition-colors hover:text-[var(--link)]">
                                                {car.title || 'Неизвестное авто'} ({car.year || '—'})
                                            </Link>
                                            {car.plateNumber && (
                                                <span className="text-xs text-[var(--text-dim)]">{car.plateNumber}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Link href={`/admin/users/${car.userId}`} className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--link)] hover:underline">
                                            {car.ownerName || 'Пользователь'}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-[var(--text-muted)]">{car.vin || '—'}</td>
                                    <td className="px-5 py-4 text-sm font-medium text-[var(--text)]">
                                        {car.mileage ? car.mileage.toLocaleString('ru-RU') : '0'} км
                                    </td>
                                    <td className="px-5 py-4 text-sm text-[var(--text-muted)]">{car.createdAt || '—'}</td>
                                    <td className="px-5 py-4 text-right">
                                        <Link href={`/admin/cars/${car.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="rounded-full bg-[var(--bg-elevated)] p-3 text-[var(--text-dim)]">
                                            <CarFront className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text)]">
                                                {searchQuery ? 'Автомобили не найдены' : 'Автомобилей пока нет'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}