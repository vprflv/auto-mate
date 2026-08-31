import Link from 'next/link';
import { Check } from 'lucide-react';
import { CatalogArticle } from '@/types/catalog/catalog';

type Props = {
    carId: string;
    article: CatalogArticle;
    alreadyAdded: boolean;
    onAdd: () => void;
    onRemove: () => void;
};

export default function CatalogArticleCard({
                                               carId,
                                               article,
                                               alreadyAdded,
                                               onAdd,
                                               onRemove
                                           }: Props) {
    return (
        <div className="group bg-[#161616] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl p-4 transition">
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-[#A3A3A3] bg-[#0A0A0A] px-2 py-0.5 rounded-md">
                    {article.oem}
                </span>
                {article.brand && (
                    <span className="text-xs text-[#666666] shrink-0">{article.brand}</span>
                )}
            </div>

            <h3 className="font-medium text-[15px] leading-snug mb-1 text-[#F5F5F5]">
                {article.name}
            </h3>

            {article.note && (
                <p className="text-xs text-[#666666] mb-3">{article.note}</p>
            )}

            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#2A2A2A]">
                <div className="text-xs text-[#666666]">
                    {article.quantity ? `${article.quantity} шт.` : '—'}
                </div>

                <Link
                    href={{
                        pathname: `/garage/${carId}/buy`,
                        query: {
                            name: article.name,
                            oem: article.oem,
                            brand: article.brand || '',
                        },
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-sm font-medium text-[#F5F5F5] transition"
                >
                    Где купить
                </Link>

                {alreadyAdded ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white text-sm font-medium transition"
                    >
                        Убрать
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="px-4 py-1.5 rounded-xl bg-[#39FF14] hover:bg-[#57FF3A] text-black text-sm font-medium transition"
                    >
                        В мой каталог
                    </button>
                )}
            </div>
        </div>
    );
}