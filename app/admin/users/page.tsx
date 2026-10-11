'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, UserRound, ArrowUpRight, X } from 'lucide-react';
import { systemStore, AppUser } from '@/features/admin/lib/systemStore';

const statusStyles: Record<AppUser['status'], { label: string; className: string }> = {
    active: {
        label: 'Активен',
        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    pending: {
        label: 'Ожидает',
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    blocked: {
        label: 'Заблокирован',
        className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    },
};

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [users, setUsers] = React.useState<AppUser[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
        // Читаем начальное состояние
        setUsers(systemStore.getState().users);
        setIsLoaded(true);

        // Обновление внутри одной вкладки
        const onLocalUpdate = () => setUsers(systemStore.getState().users);
        window.addEventListener('system-store-updated', onLocalUpdate);

        // Обновление между соседними вкладками (если регистрация была в другом окне)
        const onStorageUpdate = (e: StorageEvent) => {
            if (e.key === 'bm_shared_system_state_v1') {
                setUsers(systemStore.getState().users);
            }
        };
        window.addEventListener('storage', onStorageUpdate);

        return () => {
            window.removeEventListener('system-store-updated', onLocalUpdate);
            window.removeEventListener('storage', onStorageUpdate);
        };
    }, []);

    const filteredUsers = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return users;

        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.id.toLowerCase().includes(query)
        );
    }, [searchQuery, users]);

    if (!isLoaded) return null; // Избегаем гидратационных ошибок

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--text)]">
                    Пользователи
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Пользователи приложения и их активность
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />

                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по имени, email или ID..."
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
            </div>

            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                        <tr className="border-b border-[var(--border)] text-left">
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Пользователь</th>
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Автомобили</th>
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Регистрация</th>
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Статус</th>
                            <th className="w-12 px-5 py-4" />
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--border)]/40">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                const status = statusStyles[user.status];
                                return (
                                    <tr key={user.id} className="group transition-colors hover:bg-[var(--bg-elevated)]/40">
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <Link href={`/admin/users/${user.id}`} className="font-medium text-[var(--text)] transition-colors hover:text-[var(--link)]">
                                                    {user.name}
                                                </Link>
                                                <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-[var(--text)]">
                                            {user.carsCount > 0 ? (
                                                <span>{user.carsCount} авто</span>
                                            ) : (
                                                <span className="text-[var(--text-dim)]">Нет авто</span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-[var(--text-muted)]">
                                            {user.createdAt}
                                        </td>

                                        <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                                                    {status.label}
                                                </span>
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                                            >
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="rounded-full bg-[var(--bg-elevated)] p-3 text-[var(--text-dim)]">
                                            <UserRound className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text)]">
                                                {searchQuery ? 'Пользователи не найдены' : 'Пользователей пока нет'}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--text-dim)]">
                                                {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Здесь появятся зарегистрированные пользователи'}
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