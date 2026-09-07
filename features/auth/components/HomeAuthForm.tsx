'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/features/auth/components/AuthProvider';
import { useRouter } from 'next/navigation';
import {Eye, EyeOff} from "lucide-react";

export default function HomeAuthForm() {
    const router = useRouter();
    const { signIn, signUp } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const scrollToFaq = () => {
        const faqSection = document.getElementById('faq');
        if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
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
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#161616]/70 backdrop-blur-md border border-[#2A2A2A] rounded-2xl px-5 py-4 pr-12 text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#39FF14] transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

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

            </div>
        </section>
    );
}