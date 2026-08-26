'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/components/AuthProvider';

export default function GarageHeader() {
    const { user, signOut, loading } = useAuth();

    return (
        <header className="border-b border-zinc-800">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
                <Link href="/" className="text-xl font-bold">
                    AutoMate
                </Link>

                <nav className="flex items-center gap-4 sm:gap-6 text-sm text-zinc-400">
                    <Link href="/garage" className="text-white">
                        Гараж
                    </Link>
                    <Link href="/garage/add" className="hover:text-white transition">
                        Добавить авто
                    </Link>

                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-zinc-500 max-w-[140px] truncate">
                    {user.name || user.email}
                  </span>
                                    <button
                                        type="button"
                                        onClick={signOut}
                                        className="hover:text-white transition"
                                    >
                                        Выйти
                                    </button>
                                </div>
                            ) : (
                                <Link href="/" className="hover:text-white transition">
                                    Войти
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}