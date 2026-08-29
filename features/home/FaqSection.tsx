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

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
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
                                <span
                                    className={`text-2xl shrink-0 transition ${
                                        openIndex === index
                                            ? 'text-[#39FF14]'
                                            : 'text-[#A3A3A3]'
                                    }`}
                                >
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
    );
}