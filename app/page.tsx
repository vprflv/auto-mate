'use client';

import FaqSection from '@/features/home/FaqSection';
import { useGarage } from '@/features/garage/hooks/useGarage';
import GarageEmpty from '@/features/garage/components/GarageEmpty';
import HomeCarCard from '@/features/home/HomeCarCard';
import { brand } from '@/features/lib/brand';

export default function Home() {
    const { cars, loading } = useGarage();

    const scrollToFaq = () => {
        document.getElementById('faq')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] relative w-full overflow-x-hidden">

            {/* ФОН ТЕМНОЙ ТЕМЫ */}
            <div className="fixed inset-0 z-0 [html[data-theme=light]_&]:hidden pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/head_green.jpg')",
                        backgroundPosition: 'center top',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#0A0A0A]" />
            </div>

            {/* ВЕРХНИЙ ДЕКОР: Оставляем тут только две верхние машины */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[500px] z-0 hidden [html[data-theme=light]_&]:block"
                aria-hidden
            >
                <img
                    src="/images/decor/sedan.jpg"
                    alt=""
                    className="absolute right-[100px] top-[120px] w-[400px] max-w-none opacity-30"
                />
                <img
                    src="/images/decor/sedan-3.png"
                    alt=""
                    className="absolute left-[90px] top-[120px] w-[400px] max-w-none opacity-30"
                />
            </div>

            {/* КОНТЕНТ ГАРАЖА */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 bg-transparent">
                <p className="text-[var(--text-muted)] text-lg mb-10 max-w-xl">
                    <button
                        type="button"
                        onClick={scrollToFaq}
                        className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--link)] border border-[var(--border)] rounded-full px-4 py-1.5 transition hover:border-[var(--accent)] hover:bg-[var(--input)] [html[data-theme=light]_&]:hover:bg-[#dd6127] [html[data-theme=light]_&]:hover:text-white [html[data-theme=light]_&]:hover:border-[#cc9966]"
                    >
                        Что такое {brand.name}?
                    </button>
                </p>
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold [html[data-theme=dark]_&]:drop-shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                        Твой гараж
                    </h1>
                    <p className="text-[var(--text-muted)] text-lg mt-3 max-w-xl">
                        Автомобили, каталог запчастей и история ТО — в одном месте.
                    </p>
                </div>

                {loading ? (
                    <p className="text-[var(--text-muted)]">Загрузка...</p>
                ) : cars.length === 0 ? (
                    <GarageEmpty />
                ) : (
                    <section>
                        <h2 className="text-2xl font-semibold mb-5 text-[var(--text)]">
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

            {/* СЕКЦИЯ FAQ С ВСТРОЕННЫМ НИЖНИМ ДЕКОРОМ */}
            {/* Обязательно добавляем relative, чтобы нижние картинки позиционировались от границ этого блока */}
            <div id="faq" className="relative w-full mt-12 bg-transparent">

                {/* НИЖНИЙ ДЕКОР СВЕТЛОЙ ТЕМЫ: Текущие координаты top-[10px] и top-[40px]
                    отсчитываются от начала секции FAQ. Подстройте пиксели, как вам визуально нравится */}

                {/* Сам контент FAQ рендерится поверх (z-10) */}
                <div className="relative z-10">
                    <FaqSection />
                </div>
            </div>

            {/* ФУТЕР */}
            <footer className="relative z-10 py-10 text-center text-[var(--text-dim)] text-sm bg-transparent">
                {brand.name} © 2026 — Твой автомобильный помощник
            </footer>
        </div>
    );
}
