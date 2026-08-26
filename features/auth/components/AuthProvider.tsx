'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    getSession,
    loginUser,
    logoutUser,
    registerUser,
    type LocalSession,
} from '@/features/auth/lib/storage';

type AuthContextValue = {
    user: LocalSession | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (
        email: string,
        password: string,
        name?: string
    ) => Promise<{ error?: string }>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<LocalSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUser(getSession());
        setLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        const res = loginUser({ email, password });
        if (!res.ok) return { error: res.error };
        setUser(res.session);
        return {};
    };

    const signUp = async (email: string, password: string, name?: string) => {
        const res = registerUser({ email, password, name });
        if (!res.ok) return { error: res.error };
        setUser(res.session);
        return {};
    };

    const signOut = () => {
        logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}