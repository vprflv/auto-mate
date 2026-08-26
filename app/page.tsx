'use client';

import {FormEvent, useState} from 'react';
import {useAuth} from "@/features/auth/components/AuthProvider";
import {useRouter} from "next/navigation";

type FaqItem = {
    question: string;
    answer: string;
};

const faqData: FaqItem[] = [
    {
        question: 'Что такое AutoMate?',
        answer:
            'Это ваш персональный помощник по уходу за автомобилем. Добавил машину один раз — и вся история обслуживания всегда под рукой.',
    },
    {
        question: 'Зачем это нужно?',
        answer:
            'Многие забывают, какое масло заливали, какие колодки стояли и когда было последнее ТО. AutoMate хранит всю эту информацию в одном месте, чтобы ты больше не терял чеки и не вспоминал на сервисе.',
    },
    {
        question: 'Что я смогу делать в приложении?',
        answer:
            'Добавлять автомобили по VIN, вести историю обслуживания, сохранять фото расходников и чеков, искать запчасти под свою машину и получать напоминания о следующем ТО.',
    },
    {
        question: 'Кому подойдёт AutoMate?',
        answer:
            'Обычным автовладельцам, которые хотят навести порядок в обслуживании своей машины. Особенно полезно тем, у кого несколько авто или кто часто меняет расходники.',
    },
    {
        question: 'Нужно ли что-то устанавливать?',
        answer:
            'Нет. AutoMate работает прямо в браузере. Достаточно зарегистрироваться и добавить свой автомобиль.',
    },
];

export default function Home() {
    const router = useRouter();

    const { signIn, signUp, user, loading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const res = isLogin
            ? await signIn(email, password)
            : await signUp(email, password, name);

        setSubmitting(false);

        if (res.error) {
            setError(res.error);
            return;
        }

        router.push('/garage');
    };

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const scrollToFaq = () => {
        const faqSection = document.getElementById('faq');
        if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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
                {/* ===== 1. БЛОК: Вход / Регистрация ===== */}
                <section className="min-h-screen flex items-center justify-center px-6">
                    <div className="max-w-md w-full">
                        <div className="text-center mb-10">
                            <h1 className="text-5xl font-bold mb-3 drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                                AutoMate
                            </h1>
                            <p className="text-[#A3A3A3] text-lg mb-4">
                                Персональный помощник по твоему автомобилю
                            </p>


                        </div>

                        <div className="flex bg-[#161616]/70 backdrop-blur-md rounded-2xl p-1 mb-8 border border-[#2A2A2A]">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(true);
                                    setError(null);
                                }}
                                className={`flex-1 py-3 rounded-xl font-medium transition ${
                                    isLogin
                                        ? 'bg-[#39FF14] text-black'
                                        : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                                }`}
                            >
                                Вход
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(false);
                                    setError(null);
                                }}
                                className={`flex-1 py-3 rounded-xl font-medium transition ${
                                    !isLogin
                                        ? 'bg-[#39FF14] text-black'
                                        : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                                }`}
                            >
                                Регистрация
                            </button>
                        </div>

                        <form className="space-y-5" onSubmit={onSubmit}>
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm text-[#A3A3A3] mb-2">Имя</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Как тебя зовут"
                                        className="w-full bg-[#161616]/70 backdrop-blur-md border border-[#2A2A2A] rounded-2xl px-5 py-4 text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-[#A3A3A3] mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hannah.h@example.com"
                                    className="w-full bg-[#161616]/70 backdrop-blur-md border border-[#2A2A2A] rounded-2xl px-5 py-4 text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#A3A3A3] mb-2">Пароль</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#161616]/70 backdrop-blur-md border border-[#2A2A2A] rounded-2xl px-5 py-4 text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#39FF14] text-black font-medium py-4 rounded-2xl hover:bg-[#57FF3A] transition disabled:opacity-60 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                            >
                                {submitting
                                    ? isLogin
                                        ? 'Входим...'
                                        : 'Создаём...'
                                    : isLogin
                                        ? 'Войти'
                                        : 'Создать аккаунт'}
                            </button>
                        </form>

                        <p className="text-center text-[#A3A3A3] text-sm mt-6">
                            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                }}
                                className="text-[#39FF14] underline hover:text-[#57FF3A] transition"
                            >
                                {isLogin ? 'Зарегистрироваться' : 'Войти'}
                            </button>
                        </p>

                        <p className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => router.push('/garage')}
                                className="text-sm text-[#A3A3A3] hover:text-[#39FF14] transition"
                            >
                                Продолжить без входа →
                            </button>

                        </p>

                        <p className="text-center mt-4">
                            {/* Кнопка-подсказка */}
                            <button
                                type="button"
                                onClick={scrollToFaq}
                                className="inline-flex items-center gap-2 text-sm text-[#39FF14] border border-[#39FF14]/40 hover:border-[#39FF14] hover:bg-[#39FF14]/10 rounded-full px-4 py-1.5 transition"
                            >
                                Что такое AutoMate?
                            </button>
                        </p>


                    </div>
                </section>

                {/* ===== 2. БЛОК: FAQ ===== */}
                <section id="faq" className="py-24 px-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-4 drop-shadow-md">
                            Что такое AutoMate?
                        </h2>
                        <p className="text-[#A3A3A3] text-center mb-14">
                            Коротко о главном
                        </p>

                        <div className="space-y-4">
                            {faqData.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-[#161616]/55 backdrop-blur-md border border-[#2A2A2A]/80 rounded-2xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#1F1F1F]/40 transition"
                                    >
                                        <span className="text-lg font-medium pr-4">
                                            {item.question}
                                        </span>
                                        <span className={`text-2xl shrink-0 transition ${
                                            openIndex === index ? 'text-[#39FF14]' : 'text-[#A3A3A3]'
                                        }`}>
                                            {openIndex === index ? '−' : '+'}
                                        </span>
                                    </button>

                                    {openIndex === index && (
                                        <div className="px-6 pb-6 text-[#A3A3A3] leading-relaxed border-t border-[#2A2A2A]/60 pt-4">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Футер */}
                <footer className="py-10 text-center text-[#666666] text-sm">
                    AutoMate © 2026 — Твой автомобильный помощник
                </footer>
            </div>
        </div>
    );
}