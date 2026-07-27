import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AutoMate — Персональный помощник по авто',
    description: 'Цифровая сервисная книжка и умный поиск запчастей',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <body className={inter.className}>
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}