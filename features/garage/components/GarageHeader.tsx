'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/components/AuthProvider';

export default function GarageHeader() {
    const { user, signOut, loading } = useAuth();

    return (
        <header className="border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
                <Link
                    href="/"
                    className="text-xl font-bold text-[#F5F5F5] hover:text-[#39FF14] transition"
                >
                    AutoMate
                </Link>

                <nav className="flex items-center gap-4 sm:gap-6 text-sm text-[#A3A3A3]">
                    <Link href="/garage" className="text-[#39FF14]">
                        Гараж
                    </Link>
                    <Link
                        href="/garage/add"
                        className="hover:text-[#39FF14] transition"
                    >
                        Добавить авто
                    </Link>

                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <span className="hidden sm:inline text-[#666666] max-w-[140px] truncate">
                                        {user.name || user.email}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={signOut}
                                        className="hover:text-[#39FF14] transition"
                                    >
                                        Выйти
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/"
                                    className="hover:text-[#39FF14] transition"
                                >
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