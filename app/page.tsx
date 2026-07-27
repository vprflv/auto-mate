'use client';

import { useState } from 'react';

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
    const [isLogin, setIsLogin] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0); // первый вопрос открыт по умолчанию

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* ===== 1. БЛОК: Вход / Регистрация ===== */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-bold mb-3">AutoMate</h1>
                        <p className="text-zinc-400 text-lg">
                            Персональный помощник по твоему автомобилю
                        </p>
                    </div>

                    {/* Переключатель */}
                    <div className="flex bg-zinc-900 rounded-2xl p-1 mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-xl font-medium transition ${
                                isLogin ? 'bg-white text-black' : 'text-zinc-400'
                            }`}
                        >
                            Вход
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-xl font-medium transition ${
                                !isLogin ? 'bg-white text-black' : 'text-zinc-400'
                            }`}
                        >
                            Регистрация
                        </button>
                    </div>

                    {/* Форма */}
                    <form className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Имя</label>
                                <input
                                    type="text"
                                    placeholder="Как тебя зовут"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="hannah.h@example.com"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Пароль</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-medium py-4 rounded-2xl hover:bg-zinc-200 transition"
                        >
                            {isLogin ? 'Войти' : 'Создать аккаунт'}
                        </button>
                    </form>

                    <p className="text-center text-zinc-500 text-sm mt-6">
                        {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white underline"
                        >
                            {isLogin ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </p>
                </div>
            </section>

            {/* ===== 2. БЛОК: FAQ / Аккордеон ===== */}
            <section className="py-24 px-6 border-t border-zinc-800">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4">
                        Что такое AutoMate?
                    </h2>
                    <p className="text-zinc-400 text-center mb-14">
                        Коротко о главном
                    </p>

                    <div className="space-y-4">
                        {faqData.map((item, index) => (
                            <div
                                key={index}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-zinc-800/50 transition"
                                >
                  <span className="text-lg font-medium pr-4">
                    {item.question}
                  </span>
                                    <span className="text-2xl text-zinc-400 shrink-0">
                    {openIndex === index ? '−' : '+'}
                  </span>
                                </button>

                                {openIndex === index && (
                                    <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Футер */}
            <footer className="py-10 text-center text-zinc-600 text-sm border-t border-zinc-900">
                AutoMate © 2026 — Твой автомобильный помощник
            </footer>
        </div>
    );
}