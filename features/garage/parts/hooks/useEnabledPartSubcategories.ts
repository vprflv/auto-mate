'use client';

import { useSyncExternalStore } from 'react';

const CHANGE_EVENT =
    'automate-enabled-part-subcategories-changed';

function getStorageKey(
    carId: string,
    categoryId: string
): string {
    return `automate-enabled-part-subcategories:${encodeURIComponent(
        carId
    )}:${encodeURIComponent(categoryId)}`;
}

function readRaw(key: string | null): string {
    if (!key || typeof window === 'undefined') {
        return '[]';
    }

    try {
        return window.localStorage.getItem(key) ?? '[]';
    } catch {
        return '[]';
    }
}

function parseIds(raw: string): string[] {
    try {
        const parsed: unknown = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return [
            ...new Set(
                parsed.filter(
                    (value): value is string =>
                        typeof value === 'string' &&
                        value.length > 0
                )
            ),
        ];
    } catch {
        return [];
    }
}

function subscribe(onChange: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);

    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener('storage', onChange);
    };
}

function useStoredIds(key: string | null): string[] {
    const raw = useSyncExternalStore(
        subscribe,
        () => readRaw(key),
        () => '[]'
    );

    return parseIds(raw);
}

export function useEnabledPartSubcategories(
    carId: string,
    categoryId: string | null
): string[] {
    return useStoredIds(
        carId && categoryId
            ? getStorageKey(carId, categoryId)
            : null
    );
}

export function useHiddenPartSubcategories(
    carId: string,
    categoryId: string | null
): string[] {
    return useStoredIds(
        carId && categoryId
            ? `${getStorageKey(carId, categoryId)}:hidden`
            : null
    );
}

export function hidePartSubcategory(
    carId: string,
    categoryId: string,
    subcategoryId: string
): void {
    if (
        !carId ||
        !categoryId ||
        !subcategoryId ||
        subcategoryId === 'other'
    ) {
        throw new Error(
            'Эту подкатегорию нельзя удалить.'
        );
    }

    const key =
        `${getStorageKey(carId, categoryId)}:hidden`;

    const current = parseIds(readRaw(key));

    window.localStorage.setItem(
        key,
        JSON.stringify([
            ...new Set([...current, subcategoryId]),
        ])
    );

    window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function enablePartSubcategory(
    carId: string,
    categoryId: string,
    subcategoryId: string
): void {
    if (!carId || !categoryId || !subcategoryId) return;

    const key = getStorageKey(carId, categoryId);
    const enabled = parseIds(readRaw(key));
    const hidden = parseIds(readRaw(`${key}:hidden`));

    window.localStorage.setItem(
        key,
        JSON.stringify([
            ...new Set([...enabled, subcategoryId]),
        ])
    );

    // Повторное добавление восстанавливает подкатегорию.
    window.localStorage.setItem(
        `${key}:hidden`,
        JSON.stringify(
            hidden.filter((id) => id !== subcategoryId)
        )
    );

    window.dispatchEvent(new Event(CHANGE_EVENT));
}