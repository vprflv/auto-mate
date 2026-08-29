'use client';


import {CarSection} from "@/features/garage/car/types/types";

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
        <aside className="md:w-56 shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {MENU.map((item) => {
                    const active = section === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`
                                whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition text-left
                                ${
                                active
                                    ? 'bg-[#39FF14] text-black'
                                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#161616]'
                            }
                                ${item.id === 'danger' && !active ? 'md:mt-4 text-red-400/80 hover:text-red-400' : ''}
                                ${item.id === 'danger' && active ? 'md:mt-4 bg-red-950/40 text-red-400' : ''}
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