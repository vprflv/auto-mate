'use client';

import { useState } from 'react';
import { brand } from '@/features/lib/brand';

type FaqItem = {
    question: string;
    answer: string;
};

const faqData: FaqItem[] = [
    {
        question: `Что такое ${brand.name}`,
        answer:
            'Это ваш персональный помощник по уходу за автомобилем. Добавил машину один раз — и вся история обслуживания всегда под рукой.',
    },
    {
        question: 'Зачем это нужно?',
        answer:
            `Многие забывают, какое масло заливали, какие колодки стояли и когда было последнее ТО. ${brand.name} хранит всю эту информацию в одном месте, чтобы ты больше не терял чеки и не вспоминал на сервисе.`,
    },
    {
        question: 'Что я смогу делать в приложении?',
        answer:
            'Добавлять автомобили по VIN, вести историю обслуживания, сохранять фото расходников и чеков, искать запчасти под свою машину и получать напоминания о следующем ТО.',
    },
    {
        question: `Кому подойдёт ${brand.name}?`,
        answer:
            'Обычным автовладельцам, которые хотят навести порядок в обслуживании своей машины. Особенно полезно тем, у кого несколько авто или кто часто меняет расходники.',
    },
    {
        question: 'Нужно ли что-то устанавливать?',
        answer:
            `Нет. ${brand.name} работает прямо в браузере. Достаточно зарегистрироваться и добавить свой автомобиль.`,
    },
];

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        /* Изменение 1: Убрали bg-[var(--bg)], сделали bg-transparent, чтобы картинки были видны */
        <section className="relative z-10 py-24 px-6 bg-transparent">

            {/* Изменение 2: Нижние декор-картинки теперь живут здесь.
                Они привязаны к верху секции FAQ (top-[20px] и top-[80px]).
                Когда аккордеон раскрывается, контент растет вниз, а эти картинки не двигаются и не прыгают! */}
            <div
                className="pointer-events-none absolute inset-0 z-0 hidden [html[data-theme=light]_&]:block overflow-hidden"
                aria-hidden
            >
                <img
                    src="/images/decor/sedan-4.png"
                    alt=""
                    className="absolute right-[120px] top-[80px] w-[300px] max-w-none opacity-30"
                />
                <img
                    src="/images/decor/sedan-2.png"
                    alt=""
                    className="absolute left-[120px] top-[20px] w-[320px] max-w-none opacity-25"
                />
            </div>

            {/* Контент FAQ поднимаем на z-10 поверх картинок */}
            <div className="max-w-3xl mx-auto relative z-10">
                <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text)]">
                    Что такое {brand.name}?
                </h2>
                <p className="text-[var(--text-muted)] text-center mb-14">
                    Коротко о главном
                </p>

                <div className="space-y-4">
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={index}
                                className="bg-[var(--card)]/55 backdrop-blur-md border border-[var(--border)]/80 rounded-2xl overflow-hidden"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[var(--input)]/60 transition"
                                >
                                    <span className="text-lg font-medium pr-4 text-[var(--text)]">
                                        {item.question}
                                    </span>
                                    <span
                                        className={`text-2xl shrink-0 transition ${
                                            isOpen
                                                ? 'text-[var(--link)]'
                                                : 'text-[var(--text-muted)]'
                                        }`}
                                    >
                                        {isOpen ? '−' : '+'}
                                    </span>
                                </button>

                                <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="px-6 pb-6 pt-4 text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]/60">
                                            {item.answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
