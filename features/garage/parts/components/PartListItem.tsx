import { CarPartItem } from '@/types';
import CopyButton from './CopyButton';

type Props = {
    item: CarPartItem;
};

export default function PartListItem({ item }: Props) {
    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3">
            <p className="text-white text-sm">
                {item.quantity && item.quantity > 1 ? `${item.quantity}× ` : ''}
                {item.name}
            </p>

            {item.brand && (
                <p className="text-zinc-500 text-xs mt-1">{item.brand}</p>
            )}

            <div className="mt-2 space-y-1.5">
                {item.oemNumber && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-600 w-14 shrink-0">Ориг.</span>
                        <CopyButton value={item.oemNumber} label="ориг. номер" />
                    </div>
                )}
                {item.analogNumber && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-600 w-14 shrink-0">Аналог</span>
                        <CopyButton value={item.analogNumber} label="аналог" />
                    </div>
                )}
            </div>

            {item.notes && (
                <p className="text-zinc-600 text-xs mt-2">{item.notes}</p>
            )}
        </div>
    );
}