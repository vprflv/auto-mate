import { Search } from 'lucide-react';

type Props = {
    search: string;
    onClear?: () => void;
};

export default function CatalogEmpty({
                                         search,
                                         onClear,
                                     }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                <Search className="h-7 w-7 text-[var(--text-dim)]" />
            </div>

            <p className="font-medium text-[var(--text-muted)]">
                Ничего не найдено
            </p>

            <p className="mt-1 text-sm text-[var(--text-dim)]">
                {search
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'В этом разделе пока нет запчастей'}
            </p>

            {onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-5 text-sm text-[var(--link)] transition-colors hover:text-[var(--btn-primary-hover)]"
                >
                    Показать все запчасти
                </button>
            )}
        </div>
    );
}