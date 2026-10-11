'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    CarFront,
    Calendar,
    Mail,
    UserCheck,
    ArrowUpRight,
    Car,
} from 'lucide-react';
import { systemStore, AppUser, AppCar } from '@/features/admin/lib/systemStore';

export default function AdminUserDetailPage() {
    const params = useParams();
    const userId = params?.id as string;

    const [user, setUser] = React.useState<AppUser | null>(null);
    const [userCars, setUserCars] = React.useState<AppCar[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);

    const loadUserData = React.useCallback(() => {
        const state = systemStore.getState();
        const foundUser = state.users.find((u) => u.id === userId) || null;
        // Фильтруем автомобили именно этого пользователя
        const cars = state.cars.filter((c) => c.userId === userId);

        setUser(foundUser);
        setUserCars(cars);
        setIsLoaded(true);
    }, [userId]);

    React.useEffect(() => {
        loadUserData();

        const onLocalUpdate = () => loadUserData();
        window.addEventListener('system-store-updated', onLocalUpdate);

        const onStorageUpdate = (e: StorageEvent) => {
            if (e.key === 'bm_shared_system_state_v1') {
                loadUserData();
            }
        };
        window.addEventListener('storage', onStorageUpdate);

        return () => {
            window.removeEventListener('system-store-updated', onLocalUpdate);
            window.removeEventListener('storage', onStorageUpdate);
        };
    }, [loadUserData]);

    if (!isLoaded) return null;

    if (!user) {
        return (
            <div className="space-y-4">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к списку пользователей
                </Link>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
                    <p className="text-base font-medium text-[var(--text)]">
                        Пользователь не найден
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Навигация назад */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--text)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Пользователи
                </Link>
                <span>/</span>
                <span className="text-[var(--text)] font-medium">{user.name}</span>
            </div>

            {/* Карточка профиля */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                            {user.name}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                            <span className="inline-flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                                {user.email}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                                Зарегистрирован: {user.createdAt}
                            </span>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                        <UserCheck className="h-3.5 w-3.5" />
                        Активный аккаунт
                    </span>
                </div>
            </div>

            {/* Список автомобилей пользователя */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--text)]">
                        Автомобили в гараже ({userCars.length})
                    </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {userCars.length > 0 ? (
                        userCars.map((car) => (
                            <div
                                key={car.id}
                                className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--link)]/40"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)]">
                                                <Car className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-[var(--text)]">
                                                    {car.title}
                                                </h4>
                                                <p className="text-xs text-[var(--text-dim)]">
                                                    {car.year} г. • {car.engine || 'ДВС'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 text-xs text-[var(--text-muted)] space-y-1">
                                        <p>
                                            VIN: <span className="font-mono text-[var(--text)]">{car.vin || '—'}</span>
                                        </p>
                                        <p>
                                            Пробег: <span className="font-medium text-[var(--text)]">{car.mileage?.toLocaleString('ru-RU')} км</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-[var(--border)]/60 pt-3">
                                    <Link
                                        href={`/admin/cars/${car.id}`}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--link)] hover:underline"
                                    >
                                        Перейти к автомобилю
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="sm:col-span-2 flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
                            <CarFront className="h-8 w-8 text-[var(--text-dim)]" />
                            <p className="mt-2 text-sm font-medium text-[var(--text)]">
                                У пользователя пока нет добавленных автомобилей
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}