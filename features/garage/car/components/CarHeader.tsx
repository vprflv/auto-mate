import Link from 'next/link';

export default function CarHeader() {
    return (
        <header className="w-full bg-transparent">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
                <Link
                    href="/garage"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--link)] active:scale-95"
                >
                    ← Назад в гараж
                </Link>
            </div>
        </header>
    );
}