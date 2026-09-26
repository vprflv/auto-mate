
import ServicePartCard from './ServicePartCard';
import { PartForm } from '@/features/garage/add/types/serviceForm';

type Props = {
    parts: PartForm[];
    onAdd: () => void;
    onChange: (
        id: string,
        field: keyof PartForm,
        value: string
    ) => void;
    onRemove: (id: string) => void;
};

export default function ServicePartsSection({
    parts,
    onAdd,
    onChange,
    onRemove,
}: Props) {
    return (
        <div className="rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] p-5 transition-colors duration-200 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                    Расходники
                </h2>

                <button
                    type="button"
                    onClick={onAdd}
                    className="shrink-0 rounded-xl border border-[var(--border)]/40 bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--border)]/60 hover:bg-[var(--bg-elevated)]/80 hover:text-[var(--link)] active:scale-95"
                >
                    + Добавить
                </button>
            </div>

            {parts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[var(--border)]/30 bg-[var(--bg-elevated)]/30 px-5 py-8 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                        Пока нет расходников
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                        Нажми «+ Добавить», чтобы добавить масло,
                        фильтр, колодки и т.д.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {parts.map((part, index) => (
                    <ServicePartCard
                        key={part.id}
                        part={part}
                        index={index}
                        onChange={onChange}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
}

