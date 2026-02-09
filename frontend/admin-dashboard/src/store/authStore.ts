import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    consumer_id: string;
    email?: string;
    name?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => {
                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_user', JSON.stringify(user));
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'admin-auth-storage',
        }
    )
);
