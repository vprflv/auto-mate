import { AppUser } from '../types';
import { storage } from '../storage';

export function createUser(name: string, email: string, customId?: string): AppUser {
    const state = storage.getState();
    const existing = state.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
        if (name && existing.name !== name && existing.name === existing.email.split('@')[0]) {
            existing.name = name;
            storage.saveState(state);
        }
        return existing;
    }

    const newUser: AppUser = {
        id: customId || `usr_${Date.now().toString().slice(-4)}`,
        name: name.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        carsCount: 0,
        createdAt: new Date().toLocaleDateString('ru-RU'),
        status: 'active',
    };

    state.users.unshift(newUser);
    storage.saveState(state);
    return newUser;
}