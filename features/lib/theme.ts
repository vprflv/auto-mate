export const themes = ['dark', 'light'] as const;

export type Theme = (typeof themes)[number];

export const defaultTheme: Theme = 'light';
export const THEME_STORAGE_KEY = 'automate-theme';

export function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark';
}
