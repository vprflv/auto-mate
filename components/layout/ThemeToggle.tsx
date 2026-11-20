'use client';

import { useEffect, useState } from 'react';
import { defaultTheme, isTheme, THEME_STORAGE_KEY, type Theme } from '@/features/lib/theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(defaultTheme);

    // При монтировании компонента считываем текущую тему с тега html
    useEffect(() => {
        const currentTheme = document.documentElement.dataset.theme;
        setTheme(isTheme(currentTheme) ? currentTheme : defaultTheme);
    }, []);

    // Функция ручного переключения темы
    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        setTheme(nextTheme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch {
            // Тема действует до обновления, если браузер отключил хранилище.
        }
    };

    const offersLight = theme === 'dark';
    const label = offersLight ? 'Светлая сторона' : 'Тёмная сторона';

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
            aria-label={`Включить тему «${label}»`}
            title={label}
        >
            <span aria-hidden="true" className="inline-flex size-6 shrink-0 items-center justify-center">
                <span className="flex -rotate-45 items-center">
                    <span className="h-1.5 w-2 rounded-l border border-slate-500 bg-slate-800" />
                    <span className={`h-1 w-4 rounded-full border ${offersLight
                        ? 'border-cyan-400 bg-cyan-50 shadow-[0_0_5px_#22d3ee]'
                        : 'border-red-500 bg-red-100 shadow-[0_0_5px_#ef4444]'}`} />
                </span>
            </span>
        </button>
    );
}
