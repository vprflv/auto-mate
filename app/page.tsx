'use client';

import FaqSection from '@/features/home/FaqSection';
import { useGarage } from '@/features/garage/hooks/useGarage';
import GarageEmpty from '@/features/garage/components/GarageEmpty';
import HomeCarCard from '@/features/home/HomeCarCard';
import { brand } from '@/features/lib/brand';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import styles from './home.module.css';

export default function Home() {
    const { cars, loading } = useGarage();

    const scrollToFaq = () => {
        document.getElementById('faq')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <div className={`${styles.root} min-h-screen bg-[var(--bg)] text-[var(--text)] relative w-full overflow-x-hidden`}>
            <div className="fixed inset-0 z-0 [html[data-theme=light]_&]:hidden pointer-events-none" aria-hidden="true">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/head_green.jpg')", backgroundPosition: 'center top' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#0A0A0A]" />
            </div>

            <div className={styles.trackBackdrop} aria-hidden="true">
                <div className={styles.ambient}>
                    <div className={styles.leftEdge} />
                </div>
            </div>

            <main className={`${styles.main} relative z-10 max-w-5xl mx-auto px-6 py-12 bg-transparent`}>
                <div className={styles.hero}>
                    <div>
                        <p className={styles.eyebrow}>AUTO-MATE / ТВОЯ ТЕРРИТОРИЯ</p>
                        <p className="text-[var(--text-muted)] text-lg mb-10 max-w-xl">
                            <button
                                type="button"
                                onClick={scrollToFaq}
                                className={`${styles.aboutButton} mt-5 inline-flex items-center gap-2 text-sm text-[var(--link)] border border-[var(--border)] rounded-full px-4 py-1.5 transition hover:border-[var(--accent)] hover:bg-[var(--input)]`}
                            >
                                Что такое {brand.name}?
                            </button>
                        </p>
                        <h1 className={`text-4xl sm:text-5xl font-bold [html[data-theme=dark]_&]:drop-shadow-[0_0_15px_rgba(57,255,20,0.25)]`}>
                            Твой гараж
                        </h1>
                        <p className={`${styles.subtitle} text-[var(--text-muted)] text-lg mt-3 max-w-xl`}>
                            Автомобили, каталог запчастей и история ТО — в одном месте.
                        </p>
                    </div>
                    <div className={styles.heroArtwork} aria-hidden="true">
                        <img src="/images/decor/home-car-grunge-v1.png" alt="" />
                    </div>
                </div>

                {loading ? (
                    <p className="text-[var(--text-muted)]">Загрузка...</p>
                ) : cars.length === 0 ? (
                    <div className={styles.empty}><GarageEmpty /></div>
                ) : (
                    <section className={styles.garage}>
                        <div className={styles.sectionHeading}>
                            <h2 className="text-2xl font-semibold mb-5 text-[var(--text)]">Добавленные авто</h2>
                            <Link href="/garage" className={styles.garageLink}>Весь гараж <span aria-hidden="true">↗</span></Link>
                        </div>
                        <div className={`${styles.carGrid} grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4`}>
                            {cars.map(car => <HomeCarCard key={car.id} car={car} />)}
                            <Link
                                href="/garage/add"
                                className={`${styles.addCard} group overflow-hidden rounded-2xl border-2 border-dashed border-[var(--border)] bg-transparent transition-colors hover:border-[var(--link)]/60`}
                            >
                                <div className="flex aspect-[16/10] items-center justify-center">
                                    <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] transition-colors group-hover:text-[var(--link)]">
                                        <Plus className="h-8 w-8" />
                                        <span className="text-sm font-medium">Добавить автомобиль</span>
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-sm font-medium text-[var(--text-muted)]">Новый автомобиль</p>
                                    <p className="mt-0.5 text-xs text-[var(--text-dim)]">Добавить в гараж</p>
                                </div>
                            </Link>
                        </div>
                    </section>
                )}
            </main>

            <div id="faq" className={`${styles.faq} relative z-10 w-full mt-12 bg-transparent`}>
                <FaqSection />
            </div>
            <footer className={`${styles.footer} relative z-10 py-10 text-center text-[var(--text-dim)] text-sm bg-transparent`}>
                {brand.name} © 2026 — Твой автомобильный помощник
            </footer>
        </div>
    );
}
