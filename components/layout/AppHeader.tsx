'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/components/AuthProvider';

const nav = [
    { href: '/', label: 'Главная' },
    { href: '/garage', label: 'Гараж' },
    { href: '/garage/add', label: 'Добавить авто' },
];

export default function AppHeader() {
    const pathname = usePathname();
    const { user, loading, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
            if (!menuRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                <Link
                    href="/"
                    className="text-xl font-bold text-[#F5F5F5] hover:text-[#39FF14] transition"
                >
                    AutoMate
                </Link>

                {!loading && !user && (
                    <nav className="flex items-center gap-3 sm:gap-5 text-sm">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`transition ${
                                    isActive(item.href)
                                        ? 'text-[#39FF14]'
                                        : 'text-[#A3A3A3] hover:text-[#39FF14]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link
                            href="/login"
                            className="bg-[#39FF14] hover:bg-[#57FF3A] text-black font-medium px-4 py-2 rounded-xl transition"
                        >
                            Войти / Регистрация
                        </Link>
                    </nav>
                )}

                {!loading && user && (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            className="w-9 h-9 rounded-full bg-[#39FF14] text-black font-semibold flex items-center justify-center hover:bg-[#57FF3A] transition"
                            title={user.name || user.email}
                            aria-expanded={open}
                        >
                            {initials}
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-[#2A2A2A] bg-[#161616] shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden">
                                <div className="px-4 py-3 border-b border-[#2A2A2A]">
                                    <p className="text-sm text-[#F5F5F5] truncate">
                                        {user.name || 'Аккаунт'}
                                    </p>
                                    <p className="text-xs text-[#666666] truncate">
                                        {user.email}
                                    </p>
                                </div>

                                <nav className="p-2">
                                    {nav.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`block px-3 py-2 rounded-xl text-sm transition ${
                                                isActive(item.href)
                                                    ? 'bg-[#39FF14] text-black'
                                                    : 'text-[#A3A3A3] hover:bg-[#1F1F1F] hover:text-[#F5F5F5]'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="p-2 border-t border-[#2A2A2A]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            signOut();
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-[#1F1F1F] transition"
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