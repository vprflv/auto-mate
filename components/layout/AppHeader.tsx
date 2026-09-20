'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/components/AuthProvider';
import { brand } from '@/features/lib/brand';
import ThemeToggle from '@/components/layout/ThemeToggle'; // Импортируем наш тоггл тем

const nav = [
    { href: '/', label: 'Главная' },
    { href: '/garage', label: 'Гараж' },
    { href: '/garage/add', label: 'Добавить авто' },
];


    export default function AppHeader() {
        const pathname = usePathname();
        const { user, loading, signOut } = useAuth();
        const [open, setOpen] = useState(false);
        const menuRef = useRef<HTMLDivElement | null>(null);

    const initials = (user?.name || user?.email || 'A')
        .trim()
        .charAt(0)
        .toUpperCase();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';

        if (href === '/garage/add') {
            return pathname === '/garage/add';
        }

        if (href === '/garage') {
            if (pathname === '/garage/add' || pathname.startsWith('/garage/add/')) {
                return false;
            }
            return pathname === '/garage' || pathname.startsWith('/garage/');
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

        useEffect(() => {
            const onClickOutside = (e: MouseEvent) => {
                /*
                  ИСПРАВЛЕНО: Явно приводим e.target к типу Node через промежуточную переменную.
                  Теперь TypeScript на 100% уверен в безопасности типов, и любая ошибка исчезнет.
                */
                const target = e.target as Node;

                if (target && menuRef.current && !menuRef.current.contains(target)) {
                    setOpen(false);
                }
            };

            document.addEventListener('mousedown', onClickOutside);
            return () => document.removeEventListener('mousedown', onClickOutside);
        }, []);


        return (
        /*
          ИСПРАВЛЕНО 1: Убрали рамку border-b и матовую подложку.
          Делаем шапку полностью прозрачной bg-transparent, чтобы она сливалась с фоном страницы
        */
        <header className="sticky top-0 z-50 bg-transparent w-full">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">

                {/* Логотип */}
                <Link
                    href="/"
                    className="text-xl font-bold text-[var(--text)] transition-colors duration-200 hover:text-[var(--link)] active:scale-95"
                >
                    {brand.name}
                </Link>

                {/* ИНТЕРФЕЙС ГОСТЯ */}
                {!loading && !user && (
                    <nav className="flex items-center gap-3 sm:gap-5 text-sm">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`transition-colors duration-200 font-semibold ${
                                    isActive(item.href)
                                        ? 'text-[var(--link)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* ВНЕДРЕНИЕ: Ставим кнопку переключения тем прямо перед входом */}
                        <ThemeToggle />

                        {/*
                          ИСПРАВЛЕНО 2: Заменили bg-[var(--accent)] на универсальный токен --btn-primary.
                          Теперь кнопка сочно-оранжевая в светлой теме и неоново-зелёная в тёмной!
                        */}
                        <Link
                            href="/login"
                            className="bg-[var(--btn-primary)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-bold px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm [html[data-theme=dark]_&]:shadow-[0_0_12px_rgba(57,255,20,0.15)]"
                        >
                            Войти
                        </Link>
                    </nav>
                )}

                {/* ИНТЕРФЕЙС АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ */}
                {!loading && user && (
                    <div className="flex items-center gap-4 relative" ref={menuRef}>

                        {/* Кнопка переключения тем для авторизованного пользователя */}
                        <ThemeToggle />

                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            /* Круглая аватарка использует токен главного акцента активной темы */
                            className="w-9 h-9 rounded-full bg-[var(--btn-primary)] text-[var(--btn-primary-text)] font-bold flex items-center justify-center hover:opacity-90 transition-all duration-200 cursor-pointer active:scale-95"
                            title={user.name || user.email}
                            aria-expanded={open}
                        >
                            {initials}
                        </button>

                        {/* Выпадающее меню дропдауна */}
                        {open && (
                            <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-[var(--border)]/30 bg-[var(--card)] shadow-xl overflow-hidden transition-all duration-200">
                                <div className="px-4 py-3 border-b border-[var(--border)]/20 bg-[var(--bg-elevated)]/40">
                                    <p className="text-sm font-bold text-[var(--text)] truncate">
                                        {user.name || 'Аккаунт'}
                                    </p>
                                    <p className="text-xs text-[var(--text-dim)] truncate mt-0.5">
                                        {user.email}
                                    </p>
                                </div>

                                <nav className="p-2 space-y-0.5 bg-transparent">
                                    {nav.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            /* ИСПРАВЛЕНО 3: Перевели ховер ссылок меню на мягкий var(--bg-elevated) */
                                            className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                                                isActive(item.href)
                                                    ? 'text-[var(--link)] bg-[var(--bg-elevated)]/60 font-semibold'
                                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="p-2 border-t border-[var(--border)]/20">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            signOut();
                                        }}
                                        /* ИСПРАВЛЕНО 4: Кнопка выхода аккуратно подсвечивается мягким красным */
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-[var(--danger)] font-semibold hover:bg-[var(--danger)]/10 transition-colors duration-150 cursor-pointer active:scale-95"
                                    >
                                        Выйти
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
