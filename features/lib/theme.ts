export const themes = ['dark', 'light'] as const;

export type Theme = (typeof themes)[number];

/** Пока руками. Потом сюда же придёт переключатель. */
export const defaultTheme: Theme = 'light';