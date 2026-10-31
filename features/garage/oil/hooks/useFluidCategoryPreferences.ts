'use client';

import { useSyncExternalStore } from 'react';

const EVENT = 'automate-fluid-categories-changed';

type Preferences = {
    enabled: string[];
    hidden: string[];
};

const keyFor = (carId: string) =>
    `automate-fluid-category-preferences:${encodeURIComponent(carId)}`;

function read(carId: string): string {
    if (!carId || typeof window === 'undefined') {
        return '{}';
    }

    try {
        return window.localStorage.getItem(
            keyFor(carId)
        ) ?? '{}';
    } catch {
        return '{}';
    }
}

function parse(raw: string): Preferences {
    const ids = (value: unknown): string[] =>
        Array.isArray(value)
            ? [
                ...new Set(
                    value.filter(
                        (id): id is string =>
                            typeof id === 'string' &&
                            Boolean(id)
                    )
                ),
            ]
            : [];

    try {
        const data = JSON.parse(raw);

        return {
            enabled: ids(data?.enabled),
            hidden: ids(data?.hidden),
        };
    } catch {
        return {
            enabled: [],
            hidden: [],
        };
    }
}

function subscribe(listener: () => void) {
    window.addEventListener(EVENT, listener);
    window.addEventListener('storage', listener);

    return () => {
        window.removeEventListener(EVENT, listener);
        window.removeEventListener('storage', listener);
    };
}

export function useFluidCategoryPreferences(
    carId: string
) {
    const raw = useSyncExternalStore(
        subscribe,
        () => read(carId),
        () => '{}'
    );

    const current = parse(raw);

    const update = (
        change: (previous: Preferences) => Preferences
    ) => {
        if (!carId) {
            throw new Error('Не выбран автомобиль');
        }

        // Каждое добавление использует актуальный список.
        const next = change(parse(read(carId)));

        window.localStorage.setItem(
            keyFor(carId),
            JSON.stringify(next)
        );

        window.dispatchEvent(new Event(EVENT));
    };

    return {
        ...current,

        enable: (ids: string[]) =>
            update((previous) => ({
                enabled: [
                    ...new Set([
                        ...previous.enabled,
                        ...ids,
                    ]),
                ],
                hidden: previous.hidden.filter(
                    (id) => !ids.includes(id)
                ),
            })),

        hide: (id: string) =>
            update((previous) => ({
                enabled: previous.enabled.filter(
                    (value) => value !== id
                ),
                hidden: [
                    ...new Set([
                        ...previous.hidden,
                        id,
                    ]),
                ],
            })),
    };
}