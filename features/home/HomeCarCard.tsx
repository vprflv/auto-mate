import Link from 'next/link';
import { Car } from '@/types';
import { CarIcon } from 'lucide-react';

type Props = {
    car: Car;
};

export default function HomeCarCard({ car }: Props) {
    const name = `${car.make} ${car.model}`;
    const title = car.nickname ? `${name} (${car.nickname})` : name;

    return (
        <Link
            href={`/garage/${car.id}`}
            className="group bg-transparent border-2 border-[var(--border)] hover:border-[var(--accent)]/40 rounded-2xl overflow-hidden transition"
        >
            <div className="aspect-[16/10] bg-transparent overflow-hidden">
                {car.photos?.[0] ? (
                    <img
                        src={car.photos[0]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="w-8 h-8 text-[var(--text-dim)]" />
                    </div>
                )}
            </div>

            <div className="px-4 py-3 bg-[var(--card)]/80 [html[data-theme=light]_&]:bg-[#dd6127]">
                <h3 className="text-sm font-medium text-[var(--text)] leading-snug truncate [html[data-theme=light]_&]:text-white">
                    {title}
                </h3>
                <p className="text-xs text-[var(--text-dim)] mt-0.5 [html[data-theme=light]_&]:text-white/80">
                    {car.year}
                </p>
            </div>
        </Link>
    );
}