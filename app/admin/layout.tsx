'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CarFront,
    BookOpen,
    Building2,
    Upload,
    Settings, PlaySquare,
} from 'lucide-react';
import { brand } from '@/features/lib/brand';

const nav = [
    {
        href: '/admin',
        label: 'Обзор',
        icon: LayoutDashboard,
    },
    {
        href: '/admin/users',
        label: 'Пользователи',
        icon: Users,
    },
    {
        href: '/admin/cars',
        label: 'Автомобили',
        icon: CarFront,
    },
    {
        href: '/admin/catalog',
        label: 'Каталог деталей',
        icon: BookOpen,
    },
    {
        href: '/admin/suppliers',
        label: 'Поставщики',
        icon: Building2,
    },
    {
        href: '/admin/imports',
        label: 'Импорты',
        icon: Upload,
    },
    {
        href: '/admin/settings',
        label: 'Настройки',
        icon: Settings,
    },
    {
        href: '/admin/test-flow',
        label: 'Тест-полигон',
        icon: PlaySquare,
    },
];

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isLinkActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <aside className="fixed inset-y-0 left-0 hidden w-64 bg-[var(--bg)] lg:flex lg:flex-col">
                <div className="px-6 py-5">
                    <Link
                        href="/admin"
                        className="text-lg font-bold text-[var(--text)] transition-colors hover:text-[var(--link)]"
                    >
                        {brand.name}
                    </Link>

                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                        Панель администратора
                    </p>
                </div>

                <nav className="flex-1 space-y-1 p-3">
                    {nav.map(({ href, label, icon: Icon }) => {
                        const active = isLinkActive(href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-[var(--bg-elevated)] text-[var(--text)] font-semibold shadow-xs'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]/60 hover:text-[var(--text)]'
                                }`}
                            >
                                <Icon
                                    className={`h-4 w-4 transition-colors ${
                                        active
                                            ? 'text-[var(--text)]'
                                            : 'text-[var(--text-dim)]'
                                    }`}
                                />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-[var(--border)]/40 p-4">
                    <Link
                        href="/"
                        className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
                    >
                        ← Вернуться в приложение
                    </Link>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 bg-[var(--bg)]/95 px-4 py-4 backdrop-blur-md sm:px-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-dim)]">
                                Admin
                            </p>

                            <h1 className="text-lg font-semibold">
                                Управление системой
                            </h1>
                        </div>

                        <span className="rounded-full bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
                            Главный администратор
                        </span>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}