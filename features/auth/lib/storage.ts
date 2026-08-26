export type LocalUser = {
    id: string;
    email: string;
    name?: string;
    password: string; // только для локального MVP!
    createdAt: string;
};

export type LocalSession = {
    userId: string;
    email: string;
    name?: string;
};

const USERS_KEY = 'automate-users';
const SESSION_KEY = 'automate-session';

export function getUsers(): LocalUser[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveUsers(users: LocalUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): LocalSession | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setSession(session: LocalSession | null) {
    if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

export function registerUser(params: {
    email: string;
    password: string;
    name?: string;
}): { ok: true; session: LocalSession } | { ok: false; error: string } {
    const email = params.email.trim().toLowerCase();
    const password = params.password;
    const name = params.name?.trim();

    if (!email || !password) {
        return { ok: false, error: 'Заполните email и пароль' };
    }
    if (password.length < 6) {
        return { ok: false, error: 'Пароль минимум 6 символов' };
    }

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
        return { ok: false, error: 'Пользователь с таким email уже есть' };
    }

    const user: LocalUser = {
        id: crypto.randomUUID(),
        email,
        name: name || undefined,
        password,
        createdAt: new Date().toISOString(),
    };

    saveUsers([...users, user]);

    const session: LocalSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
    };
    setSession(session);

    return { ok: true, session };
}

export function loginUser(params: {
    email: string;
    password: string;
}): { ok: true; session: LocalSession } | { ok: false; error: string } {
    const email = params.email.trim().toLowerCase();
    const password = params.password;

    const user = getUsers().find((u) => u.email === email);
    if (!user || user.password !== password) {
        return { ok: false, error: 'Неверный email или пароль' };
    }

    const session: LocalSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
    };
    setSession(session);

    return { ok: true, session };
}

export function logoutUser() {
    setSession(null);
}