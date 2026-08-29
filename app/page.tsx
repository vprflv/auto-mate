'use client';

import Link from 'next/link';
import FaqSection from '@/features/home/FaqSection';
import { useAuth } from '@/features/auth/components/AuthProvider';
import { useGarage } from '@/features/garage/hooks/useGarage';
import CarCard from '@/features/garage/components/CarCard';
import GarageEmpty from '@/features/garage/components/GarageEmpty';
import HomeCarCard from "@/features/home/HomeCarCard";

export default function Home() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { cars, loading, removeCar } = useGarage();

    const initials = (user?.name || user?.email || 'A')
        .trim()
        .charAt(0)
        .toUpperCase();

    const scrollToFaq = () => {
        document.getElementById('faq')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] relative">
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/head_green.jpg')",
                        backgroundPosition: 'center top',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#0A0A0A]" />
            </div>

            <div className="relative z-10">

                <main className="max-w-5xl mx-auto px-6 py-12">
                    <p className="text-[#A3A3A3] text-lg mb-10 max-w-xl">
                    <button
                        type="button"
                        onClick={scrollToFaq}
                        className="mt-5 inline-flex items-center gap-2 text-sm text-[#39FF14] border border-[#39FF14]/40 hover:border-[#39FF14] hover:bg-[#39FF14]/10 rounded-full px-4 py-1.5 transition"
                    >
                        Что такое AutoMate?
                    </button>
                    </p>
                    <div className="mb-10">
                        <h1 className="text-4xl sm:text-5xl font-bold drop-shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                            Твой гараж
                        </h1>
                        <p className="text-[#A3A3A3] text-lg mt-3 max-w-xl">
                            Автомобили, каталог запчастей и история ТО — в одном месте.
                        </p>
                    </div>

                    {loading ? (
                        <p className="text-[#A3A3A3]">Загрузка...</p>
                    ) : cars.length === 0 ? (
                        <GarageEmpty />
                    ) : (
                        <section>
                            <h2 className="text-2xl font-semibold mb-5 text-[#F5F5F5]">
                                Добавленные авто
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {cars.map((car) => (
                                    <HomeCarCard key={car.id} car={car} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <FaqSection />

                <footer className="py-10 text-center text-[#666666] text-sm">
                    AutoMate © 2026 — Твой автомобильный помощник
                </footer>
            </div>
        </div>
    );
}