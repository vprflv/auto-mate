import Link from 'next/link';

type Props = {
    carId: string;
};

export default function ServiceFormHeader({
                                              carId,
                                          }: Props) {
    return (
        <div className="mx-auto max-w-2xl px-6 pt-6">
            <Link
                href={`/garage/${carId}`}
                className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
            >
                ← Назад к авто
            </Link>
        </div>
    );
}