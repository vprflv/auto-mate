import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AppHeader from '@/components/layout/AppHeader';
import { brand } from '@/features/lib/brand';
import { defaultTheme } from '@/features/lib/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru" data-theme={defaultTheme}>
        <body className={`${inter.className} bg-[var(--bg)] text-[var(--text)]`}>
        <Providers>
            <AppHeader />
            {children}
        </Providers>
        </body>
        </html>
    );
}