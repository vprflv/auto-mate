import { Search } from 'lucide-react';

type Props = {
    search: string;
    onClear?: () => void;
};

export default function CatalogEmpty({ search, onClear }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-[#3A3A3A]" />
            </div>
            <p className="text-[#A3A3A3] font-medium">Ничего не найдено</p>
            <p className="text-sm text-[#666666] mt-1">
                {search
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'В этом разделе пока нет запчастей'}
            </p>
            {onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-5 text-sm text-[#39FF14] hover:text-[#57FF3A] transition"
                >
                    Показать все запчасти
                </button>
            )}
        </div>
    );
}