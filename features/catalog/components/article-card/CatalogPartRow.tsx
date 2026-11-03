import type { CatalogArticle } from '@/types/catalog/catalog';

import { CatalogFitmentList } from './CatalogFitmentList';
import { CopyNumberButton } from './CopyNumberButton';
import {PartInstallationBadge} from "@/features/garage/components/PartInstallationBadge";
import {installationKey} from "@/features/catalog/lib/partInstallations";

type Props = {
    article: CatalogArticle;
    originalNumber: string;
    alreadyAdded: boolean;
    onAdd: () => void;
    onRemove: () => void;
};

export function CatalogPartRow({
                                   article,
                                   originalNumber,
                                   alreadyAdded,
                                   onAdd,
                                   onRemove,
                               }: Props) {
    return (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-[var(--text-muted)]">
                        {article.isOem
                            ? 'Оригинал'
                            : `Аналог для OEM ${originalNumber}`}
                    </p>

                    {article.brand && (
                        <p className="mt-2 font-semibold">
                            {article.brand}
                        </p>
                    )}

                    <div className="mt-1 flex items-center gap-2">
                        <span className="break-all font-mono text-base font-semibold">
                            {article.oem}
                        </span>

                        <CopyNumberButton value={article.oem} />
                    </div>

                    {article.installationOptions?.map(position => (
                        <PartInstallationBadge
                            key={installationKey(position)}
                            value={position}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={alreadyAdded ? onRemove : onAdd}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        alreadyAdded
                            ? 'bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20'
                            : 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]'
                    }`}
                >
                    {alreadyAdded
                        ? 'Убрать из личного каталога'
                        : 'Добавить в личный каталог'}
                </button>
            </div>

            <details className="border-t border-[var(--border)] pt-2 text-xs text-[var(--text-muted)]">
                <summary className="cursor-pointer transition-colors hover:text-[var(--text)]">
                    Применимость
                </summary>

                <div className="mt-3 space-y-3">
                    {article.appliesToCurrentCar !== undefined && (
                        <p>
                            {article.appliesToCurrentCar
                                ? 'Подтверждена для вашей модификации.'
                                : 'Для вашей модификации пока не подтверждена.'}
                        </p>
                    )}

                    <CatalogFitmentList
                        items={article.fitments ?? []}
                    />
                </div>
            </details>
        </div>
    );
}