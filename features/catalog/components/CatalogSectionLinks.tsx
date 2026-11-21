import Link from 'next/link';
import type { CatalogSection } from '@/types/catalog/catalog';

type Props = {
    section: CatalogSection;
    partsHref: string;
    fluidsHref: string;
};

export function CatalogSectionLinks({ section, partsHref, fluidsHref }: Props) {
    const links = [
        { section: 'parts', label: 'Запчасти', href: partsHref },
        { section: 'fluids', label: 'Масла и жидкости', href: fluidsHref },
    ] as const;

    return (
        <nav aria-label="Разделы общего каталога" className="flex flex-wrap items-center gap-2">
            {links.map(link => (
                <Link
                    key={link.section}
                    href={link.href}
                    aria-current={section === link.section ? 'page' : undefined}
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg-elevated)] aria-[current=page]:border-[var(--link)] aria-[current=page]:text-[var(--link)]"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
