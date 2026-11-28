'use client';

import { compareCatalogModificationAttributes } from '@/features/catalog/lib/sortCatalogModifications';
import VinDecodeForm from './VinDecodeForm';
import ManualCarForm from './ManualCarForm';
import { CatalogModificationPicker } from './CatalogModificationPicker';
import { useAddCar } from '@/features/garage/add/hooks/useAddCar';
import type { CatalogVinMatch } from '@/features/garage/add/lib/catalogVinRules';
import { ListChecks } from 'lucide-react';

export default function AddCarForm() {
    const {
        vin,
        correctedVin,
        updateVin,
        isDecoding,
        vinMatches,
        sharedSs11Options,
        enterGeelyManually,
        enterBelgeeManually,
        chooseLookupMatch,
        chooseCatalogModification,
        catalogPicker,
        openCatalogPicker,
        closeCatalogPicker,
        error,
        manualMode,
        manualForm,
        decodeIdentifier,
        enableManualMode,
        cancelManualMode,
        updateManualField,
        commitManualFrame,
        saveManualCar,
        matchedVin,
    } = useAddCar();

    const choiceClassName = 'block w-full rounded-xl border border-[var(--border)] px-4 py-3 text-left text-sm hover:border-[var(--link)]';
    const renderMatches = (matches: CatalogVinMatch[], transmission?: string) =>
        [...matches].sort((first, second) =>
            (second.specificity ?? 0) - (first.specificity ?? 0) ||
            compareCatalogModificationAttributes(first.modification.attributes, second.modification.attributes)
        ).map(match => {
            const { model, modification } = match;
            const { year, yearEnd, engine, transmission: gearbox } = modification.attributes;
            const years = year && yearEnd && year !== yearEnd ? `${year}–${yearEnd}` : year;
            const title = transmission ?? `${model.brandName} ${model.modelName}`;
            return (
                <button
                    type="button"
                    key={JSON.stringify([model.brandSlug, model.modelSlug, modification.id])}
                    onClick={() => chooseLookupMatch(match)}
                    className={choiceClassName}
                >
                    {[title, modification.name, years, engine && !modification.name.includes(engine) && engine,
                        gearbox && !modification.name.includes(gearbox) && gearbox, match.modelYear && `Модельный год ${match.modelYear}`].filter(Boolean).join(' · ')}
                </button>
            );
        });

    const vinMatchOptions = sharedSs11Options ? (
        <section className="mb-5 space-y-2">
            <h2 className="text-sm font-semibold">Выберите модель и модификацию</h2>
            <h3 className="pt-2 text-sm font-semibold">Belgee S50</h3>
            {sharedSs11Options.belgee.flatMap(({ transmission, matches }) => matches.length ? renderMatches(matches, transmission) : [
                <button key={transmission} type="button" className={choiceClassName} onClick={() => enterBelgeeManually(transmission)}>
                    {transmission} · указать характеристики вручную
                </button>,
            ])}
            <button type="button" className={choiceClassName} onClick={() => enterBelgeeManually()}>
                Указать модификацию Belgee вручную
            </button>
            <h3 className="pt-2 text-sm font-semibold">Geely Emgrand IV (SS11)</h3>
            {renderMatches(sharedSs11Options.geely)}
            <button type="button" className={choiceClassName} onClick={enterGeelyManually}>
                Указать модификацию Geely вручную
            </button>
        </section>
    ) : vinMatches.length > 0 && (
        <section className="mb-5 space-y-2">
            <h2 className="text-sm font-semibold">Выберите свою модификацию</h2>
            {renderMatches(vinMatches)}
        </section>
    );

    if (catalogPicker) {
        return (
            <CatalogModificationPicker
                correctedVin={correctedVin}
                models={catalogPicker.models}
                reason={catalogPicker.reason}
                identifier={catalogPicker.identifier}
                hint={catalogPicker.hint}
                onBack={closeCatalogPicker}
                backLabel={manualMode ? 'К заполнению автомобиля' : undefined}
                onNoMatch={manualMode ? closeCatalogPicker : undefined}
                onChoose={chooseCatalogModification}
                onManual={enableManualMode}
            />
        );
    }

    return (
        <div className="mx-auto max-w-xl">
            <h1 className="mb-2 text-3xl font-bold text-[var(--text)]">
                Добавить автомобиль
            </h1>

            <p className="mb-8 text-[var(--text-muted)]">
                Введите VIN или номер кузова. Можно сразу выбрать модификацию из каталога.
            </p>

            {!manualMode && (
                <>
                    <VinDecodeForm
                        vin={vin}
                        correctedVin={correctedVin}
                        error={error}
                        isDecoding={isDecoding}
                        onVinChange={updateVin}
                        onSubmit={decodeIdentifier}
                    />

                    {vinMatchOptions}

                    <button
                            type="button"
                            onClick={() => openCatalogPicker()}
                            className="mb-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--link)]/50 hover:bg-[var(--bg-elevated)] hover:text-[var(--link)]"
                        >
                            <ListChecks className="h-4 w-4" aria-hidden="true" />
                            <span>Выбрать из всего каталога</span>
                    </button>
                </>
            )}

            {manualMode && (
                <ManualCarForm
                    form={manualForm}
                    correctedVin={correctedVin}
                    error={error}
                    fromVinMatch={matchedVin}
                    isDecoding={isDecoding}
                    vinMatchOptions={vinMatchOptions}
                    onChange={updateManualField}
                    onFrameCommit={commitManualFrame}
                    onSubmit={saveManualCar}
                    onCancel={cancelManualMode}
                />
            )}
        </div>
    );
}
