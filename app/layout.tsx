import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AppHeader from '@/components/layout/AppHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AutoMate — Персональный помощник по авто',
    description: 'Цифровая сервисная книжка и умный поиск запчастей',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <body className={`${inter.className} bg-[#0A0A0A] text-[#F5F5F5]`}>
        <Providers>
            <AppHeader />
            {children}
        </Providers>
        </body>
        </html>
    );
}