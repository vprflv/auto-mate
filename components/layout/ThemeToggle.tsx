'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // При монтировании компонента считываем текущую тему с тега html
    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
        setTheme(currentTheme);
    }, []);

    // Функция ручного переключения темы
    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        setTheme(nextTheme);
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            /*
              Кнопка использует адаптивные переменные темы.
              В светлой теме она станет аккуратной графитовой, в тёмной — неоново-зелёной.
              active:scale-95 добавляет классный микровсегдашний отклик при нажатии.
            */
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold border border-[var(--border)]/30 rounded-xl bg-[var(--bg-elevated)] text-[var(--text)] transition-all duration-200 cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-text)] hover:border-[var(--accent-hover)] active:scale-95"
            aria-label="Переключить тему оформления"
        >
            {theme === 'dark' ? (
                <>
                    <span className="text-base">☀️</span>
                    <span className="hidden sm:inline">Светлая</span>
                </>
            ) : (
                <>
                    <span className="text-base">🌙</span>
                    <span className="hidden sm:inline">Тёмная</span>
                </>
            )}
        </button>
    );
}
