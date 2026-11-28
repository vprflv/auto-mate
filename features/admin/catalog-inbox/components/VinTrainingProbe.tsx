'use client';

import { useId, useState } from 'react';
import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { compareCatalogModificationAttributes } from '@/features/catalog/lib/sortCatalogModifications';
import { getBelgeeS50TransmissionChoices, getGeelyEmgrandSs11VinMatches, isBelgeeS50SharedVin } from '@/features/garage/add/lib/belgeeS50Vin';
import {
    catalogVinRuleMatches,
    findCatalogVinMatches,
    hasCatalogVinException,
    vinRuleKey,
} from '@/features/garage/add/lib/catalogVinRules';
import { isValidVin, isValidVinPrefix, normalizeVin, VIN_LENGTH } from '@/features/garage/add/lib/config/vin';

interface Props {
    models: StoredMasterModel[];
    initialVin?: string;
    buildPreview?: () => StoredMasterModel[];
    afterUnavailable: string;
    conflicts: boolean;
}

function ProbeResult({ title, vin, models }: { title: string; vin: string; models: StoredMasterModel[] }) {
    const matches = findCatalogVinMatches(vin, models).sort((first, second) =>
        compareCatalogModificationAttributes(first.modification.attributes, second.modification.attributes)
    );
    const belgeeChoices = matches.length === 0 && isBelgeeS50SharedVin(vin) ? getBelgeeS50TransmissionChoices(models) : null;
    const geelyMatches = belgeeChoices ? getGeelyEmgrandSs11VinMatches(models) : [];

    return (
        <div className="min-w-0 space-y-2 rounded-xl border border-[var(--border)] p-3 text-sm">
            <h4 className="font-semibold">{title}</h4>
            {belgeeChoices ? (
                <>
                    <p>Пользователь выбирает модель и модификацию.</p>
                    <p className="font-medium">Belgee S50</p>
                    <ul className="space-y-1 text-[var(--text-muted)]">
                        {belgeeChoices.map(({ transmission, matches }) => (
                            <li key={transmission}>
                                {transmission} · {matches.length ? matches.map(({ modification }) => modification.name).join(', ') : 'ручной ввод'}
                            </li>
                        ))}
                    </ul>
                    <p className="font-medium">Geely Emgrand IV (SS11)</p>
                    <p className="text-[var(--text-muted)]">{geelyMatches.length ? geelyMatches.map(({ modification }) => modification.name).join(', ') : 'Ручной ввод'}</p>
                </>
            ) : matches.length === 0 && <p className="text-[var(--text-muted)]">Совпадений нет</p>}
            {matches.length > 1 && <p className="font-medium text-[var(--danger)]">Найдено несколько модификаций</p>}
            {matches.length > 0 && (
                <ul className="space-y-2">
                    {matches.map(({ model, modification, modelYear }) => {
                        const matchedRules = new Map<string, string>();
                        if (hasCatalogVinException(modification, vin)) {
                            matchedRules.set(vin, 'Исключение по полному VIN');
                        } else {
                            for (const rule of modification.vinRules ?? []) {
                                if (!catalogVinRuleMatches(rule, vin)) continue;
                                const sample = normalizeVin(rule.sample);
                                const mask = vinRuleKey(rule);
                                if (isValidVinPrefix(sample)) matchedRules.set(sample, 'Префикс');
                                else matchedRules.set(mask, mask.includes('*') ? 'Маска по позициям' : 'Полный VIN');
                            }
                        }
                        return (
                            <li key={JSON.stringify([model.brandSlug, model.modelSlug, modification.id])} className="space-y-1">
                                <p className="break-words font-medium">{model.brandName} {model.modelName} · {modification.name}</p>
                                {modelYear !== undefined && <p>Модельный год · {modelYear}</p>}
                                {[...matchedRules].map(([rule, label]) => (
                                    <p key={rule} className="text-xs text-[var(--text-muted)]">
                                        {label} · <code className="break-all">{rule}</code>
                                    </p>
                                ))}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export function VinTrainingProbe({ models, initialVin, buildPreview, afterUnavailable, conflicts }: Props) {
    const fieldId = useId();
    const [input, setInput] = useState(initialVin && isValidVin(initialVin) ? normalizeVin(initialVin) : '');
    const [checkedVin, setCheckedVin] = useState('');
    const [error, setError] = useState('');
    const preview = checkedVin ? buildPreview?.() : undefined;

    function checkVin() {
        const vin = normalizeVin(input);
        if (!isValidVin(vin)) {
            setCheckedVin('');
            setError('Введите полный VIN из 17 символов без букв I, O и Q.');
            return;
        }

        setError('');
        setCheckedVin(vin);
    }

    return (
        <section className="space-y-3 rounded-2xl border border-[var(--border)] p-3">
            <label htmlFor={fieldId} className="text-sm font-semibold">Проверочный VIN</label>
            <div className="flex flex-wrap gap-2">
                <input
                    id={fieldId}
                    value={input}
                    maxLength={VIN_LENGTH}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="17 символов VIN"
                    onChange={event => {
                        setInput(event.target.value.toUpperCase());
                        setCheckedVin('');
                        setError('');
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            checkVin();
                        }
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm"
                />
                <button type="button" onClick={checkVin} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:border-[var(--link)]">
                    Проверить VIN
                </button>
            </div>
            {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
            {checkedVin && (
                <div aria-live="polite" className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <ProbeResult title="Сейчас" vin={checkedVin} models={models} />
                        {preview ? <ProbeResult title="После одобрения" vin={checkedVin} models={preview} /> : (
                            <div className="space-y-2 rounded-xl border border-[var(--border)] p-3 text-sm">
                                <h4 className="font-semibold">После одобрения</h4>
                                <p className="text-[var(--text-muted)]">{afterUnavailable}</p>
                            </div>
                        )}
                    </div>
                    {preview && conflicts && (
                        <p className="text-xs text-[var(--danger)]">
                            Справа показан пробный результат. Заявку можно одобрить после исправления пересечений.
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
