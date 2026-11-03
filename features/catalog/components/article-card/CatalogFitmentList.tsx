import type { CatalogFitment } from '@/types/catalog/catalog';
import {PartInstallationBadge} from "@/features/garage/components/PartInstallationBadge";
import {installationKey} from "@/features/catalog/lib/partInstallations";

type Props = {
    items: CatalogFitment[];
};

export function CatalogFitmentList({ items }: Props) {
    if (!items.length) {
        return (
            <p className="text-xs text-[var(--text-muted)]">
                Подтверждённая применимость не указана.
            </p>
        );
    }

    return (
        <ul className="space-y-2 text-xs text-[var(--text-muted)]">
            {items.map(item => (
                <li
                    key={JSON.stringify([
                        item.brandSlug,
                        item.modelSlug,
                        item.modificationId,
                    ])}
                    className="border-l border-[var(--border)] pl-3"
                >
                    <p className="font-medium">
                        {item.make} {item.model}
                    </p>

                    <p className="mt-0.5">
                        {item.modification}
                    </p>

                    {item.description && (
                        <p className="mt-0.5 text-[11px]">
                            {item.description}
                        </p>
                    )}

                    {item.installations?.map(position => (
                        <PartInstallationBadge
                            key={installationKey(position)}
                            value={position}
                        />
                    ))}
                </li>
            ))}
        </ul>
    );
}