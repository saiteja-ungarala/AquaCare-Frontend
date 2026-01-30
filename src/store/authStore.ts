// Authentication store using Zustand

import { create } from 'zustand';
import { User, UserRole, LoginCredentials, SignupData } from '../models/types';
import { authService } from '../services/authService';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    selectedRole: UserRole | null;
    error: string | null;
}

interface AuthActions {
    setSelectedRole: (role: UserRole) => void;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    signup: (data: SignupData) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
    // Initial state
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    selectedRole: null,
    error: null,

    // Actions
    setSelectedRole: (role: UserRole) => {
        set({ selectedRole: role });
    },

    login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
            const { user, token } = await authService.login(credentials);
            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                selectedRole: user.role,
            });
            return true;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.message || 'Login failed',
            });
            return false;
        }
    },

    signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
            const { user, token } = await authService.signup(data);
            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                selectedRole: user.role,
            });
            return true;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.message || 'Signup failed',
            });
            return false;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authService.logout();
        } finally {
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                selectedRole: null,
            });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const auth = await authService.checkAuth();
            if (auth) {
                set({
                    user: auth.user,
                    token: auth.token,
                    isAuthenticated: true,
                    selectedRole: auth.user.role,
                });
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));
