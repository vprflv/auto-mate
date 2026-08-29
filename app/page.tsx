'use client';



import HomeAuthForm from "@/features/auth/components/HomeAuthForm";
import FaqSection from "@/features/home/FaqSection";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] relative">
            {/* ===== ФИКСИРОВАННЫЙ ФОН ===== */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/head_green.jpg')",
                        backgroundPosition: 'center top',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </div>

            {/* ===== КОНТЕНТ ===== */}
            <div className="relative z-10">
                <HomeAuthForm />
                <FaqSection />

                <footer className="py-10 text-center text-[#666666] text-sm">
                    AutoMate © 2026 — Твой автомобильный помощник
                </footer>
            </div>
        </div>
    );
}