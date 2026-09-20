'use client';

import { CarSection } from "@/features/garage/car/types/types";

const MENU: { id: CarSection; label: string }[] = [
    { id: 'overview', label: 'Обзор' },
    { id: 'fluids', label: 'Масла и жидкости' },
    { id: 'parts', label: 'Запчасти' },
    { id: 'service', label: 'История ТО' },
    { id: 'danger', label: 'Удаление автомобиля' },
];

type Props = {
    section: CarSection;
    onChange: (section: CarSection) => void;
};

export default function CarSectionNav({ section, onChange }: Props) {
    return (
        <aside className="md:w-56 shrink-0 bg-transparent">
            {/* Обертка навигации скроллится на мобилках и выстраивается в ряд */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                {MENU.map((item) => {
                    const active = section === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`
                                whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left cursor-pointer active:scale-[0.98]
                                
                                /* ОБЫЧНЫЕ ТАБЫ: Активный и пассивный режимы на переменных */
                                ${
                                active && item.id !== 'danger'
                                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] [html[data-theme=dark]_&]:shadow-[0_0_12px_rgba(57,255,20,0.15)]'
                                    : item.id !== 'danger'
                                        ? 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]'
                                        : ''
                            }
                                
                                /* ДЕСТРУКТИВНЫЙ ТАБ (Удаление автомобиля): Пассивный режим */
                                ${
                                item.id === 'danger' && !active
                                    ? 'md:mt-6 text-[var(--danger)]/80 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10'
                                    : ''
                            }
                                
                                /* ДЕСТРУКТИВНЫЙ ТАБ (Удаление автомобиля): Активный режим */
                                ${
                                item.id === 'danger' && active
                                    ? 'md:mt-6 bg-[var(--danger)] text-white font-bold shadow-sm'
                                    : ''
                            }
                            `}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
