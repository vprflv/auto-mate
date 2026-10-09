import Link from 'next/link';
import { Search, UserRound } from 'lucide-react';

export default function AdminUsersPage() {
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
                        placeholder="Поиск пользователей..."
                        className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
                    />
                </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                        <tr className="border-b border-[var(--border)] text-left">
                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
                                Пользователь
                            </th>

                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
                                Автомобили
                            </th>

                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
                                Регистрация
                            </th>

                            <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
                                Статус
                            </th>

                            <th className="w-12 px-5 py-4" />
                        </tr>
                        </thead>

                        <tbody>
                        <tr>
                            <td
                                colSpan={5}
                                className="px-5 py-16 text-center"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="rounded-full bg-[var(--bg-elevated)] p-3 text-[var(--text-dim)]">
                                        <UserRound className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-[var(--text)]">
                                            Пользователей пока нет
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--text-dim)]">
                                            Здесь появятся зарегистрированные пользователи
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}