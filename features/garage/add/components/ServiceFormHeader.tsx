import Link from 'next/link';

type Props = {
    carId: string;
};

export default function ServiceFormHeader({ carId }: Props) {
    return (
        <div className="max-w-2xl mx-auto px-6 pt-6">
            <Link
                href={`/garage/${carId}`}
                className="text-sm text-[#A3A3A3] hover:text-[#39FF14] transition"
            >
                ← Назад к авто
            </Link>
        </div>
    );
}