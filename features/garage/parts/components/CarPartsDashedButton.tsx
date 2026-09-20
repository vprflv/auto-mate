'use client';

import { Plus } from 'lucide-react';

type Props = {
    label: string;
    onClick: () => void;
};

export default function CarPartsDashedButton({ label, onClick }: Props) {
    return (
        /*
          Заменили старые хексы на адаптивные токены.
          Бордер в пассивном режиме привязан к var(--text-dim)/30 для деликатного вида.
          При наведении (hover) кнопка загорается цветом var(--link) активной темы.
        */
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-[var(--text-dim)]/30 text-[var(--text-muted)] hover:border-[var(--link)] hover:text-[var(--link)] transition-all duration-200 cursor-pointer font-medium active:scale-95"
        >
            <Plus size={18} />
            {label}
        </button>
    );
}
