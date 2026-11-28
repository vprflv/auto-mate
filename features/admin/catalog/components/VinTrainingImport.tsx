'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { submitVinTrainingWithReport } from '@/features/admin/lib/system-store/vinTraining';

const example = JSON.stringify({
    brand: 'BMW',
    model: '3-series',
    year: 2012,
    yearEnd: 2015,
    bodyCode: 'F30',
    bodyClass: 'Седан',
    facelift: 'Дорестайлинг',
    engine: 'N20B20',
    displacementL: '2.0',
    transmission: 'Автомат (8AT)',
    drivetrain: 'AWD',
    fuel: 'Бензин',
    vin: [{ sample: 'WBA3C3C58EF985047', modelYear: 2014, positions: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10] }],
}, null, 2);

const frameExample = JSON.stringify({
    brand: 'Honda',
    model: 'Fit',
    year: 2001,
    bodyCode: 'GD1',
    bodyClass: 'Хэтчбек',
    engine: 'L13A',
    transmission: 'Вариатор',
    fuel: 'Бензин',
    frame: [{ sample: 'GD1-1234567', positions: [0] }],
}, null, 2);

export function VinTrainingImport() {
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [created, setCreated] = useState<ReturnType<typeof submitVinTrainingWithReport> | null>(null);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setCreated(null);
        try {
            setCreated(submitVinTrainingWithReport(text));
            setText('');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Не удалось принять данные.');
        }
    }

    return (
        <details className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <summary className="cursor-pointer font-semibold">Обучение декодера VIN и Frame</summary>
            <form onSubmit={submit} className="mt-4 space-y-3">
                <label className="block space-y-2 text-sm">
                    <span>Данные для модерации</span>
                    <textarea
                        value={text}
                        onChange={event => {
                            setText(event.target.value);
                            setError('');
                            setCreated(null);
                        }}
                        rows={9}
                        spellCheck={false}
                        required
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-sm"
                        placeholder={example}
                    />
                </label>
                <p className="text-xs text-[var(--text-muted)]">
                    Вставьте JSON-объект или массив объектов.
                    В поле vin укажите первые 11 символов или полный VIN. Префикс без positions пропускает девятый символ.
                    В поле frame передайте образец sample и позиции positions. Отсчёт начинается с нуля после дефиса. Пустой массив проверяет только код кузова.
                    Для старых масок с отсчётом от начала образца укажите <code>{'"positionBasis": "sample"'}</code>.
                    Можно передать VIN и Frame в одной записи или пропустить любое из этих полей.
                    Передайте известный модельный год в modelYear или укажите null, если год неизвестен. Строки VIN тоже поддерживаются.
                    Для маски передайте полный VIN в sample, а в positions — номера сравниваемых символов от 0 до 16.
                    Название собирается из характеристик. Своё название можно передать в поле name и выбрать при модерации.
                    Поля source, yearEnd, trim, drivetrain и displacementL необязательны.
                    В facelift укажите версию кузова, например «Дорестайлинг» или «Рестайлинг 2». Поле можно пропустить.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)]">
                        Отправить на модерацию
                    </button>
                    <button type="button" onClick={() => { setText(example); setError(''); setCreated(null); }}
                        className="px-2 py-2 text-sm text-[var(--link)] hover:underline">
                        Вставить пример VIN
                    </button>
                    <button type="button" onClick={() => { setText(frameExample); setError(''); setCreated(null); }}
                        className="px-2 py-2 text-sm text-[var(--link)] hover:underline">
                        Вставить пример Frame
                    </button>
                    <Link href="/admin/catalog/inbox" className="px-2 py-2 text-sm text-[var(--link)] hover:underline">
                        Открыть модерацию
                    </Link>
                </div>
                {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
                {created !== null && (
                    <p role="status" className="text-sm text-[var(--text-muted)]">
                        Отправлено заявок: {created.created}.
                        {created.catalogDuplicates > 0 && ` Пропущено: ${created.catalogDuplicates} уже в каталоге.`}
                        {created.queuedDuplicates > 0 && ` Уже ждут модерации: ${created.queuedDuplicates}.`}
                    </p>
                )}
            </form>
        </details>
    );
}
