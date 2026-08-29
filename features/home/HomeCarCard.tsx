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
            className="group bg-[#161616]/80 border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl overflow-hidden transition"
        >
            <div className="aspect-[16/10] bg-[#0A0A0A] overflow-hidden">
                {car.photos?.[0] ? (
                    <img
                        src={car.photos[0]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="w-8 h-8 text-[#3A3A3A]" />
                    </div>
                )}
            </div>

            <div className="px-4 py-3">
                <h3 className="text-sm font-medium text-[#F5F5F5] leading-snug truncate">
                    {title}
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">{car.year}</p>
            </div>
        </Link>
    );
}