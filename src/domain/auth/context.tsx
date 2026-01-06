"use client";

/**
 * Auth Context
 *
 * Shared authentication state across the app.
 * Provides user info without redundant getUser() calls.
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase";
import type { User } from "@supabase/supabase-js";

// =============================================================================
// TYPES
// =============================================================================

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
    status: AuthStatus;
    user: User | null;
    athleteId: string | null;
}

export interface AuthActions {
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export type AuthContextValue = AuthState & AuthActions;

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<User | null>(null);

    // Load user on mount
    useEffect(() => {
        let cancelled = false;
        const supabase = createSupabaseBrowserClient();

        const loadUser = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (cancelled) return;

                if (user) {
                    setUser(user);
                    setStatus("authenticated");
                } else {
                    setUser(null);
                    setStatus("unauthenticated");
                }
            } catch (error) {
                // Log auth check failures for debugging but still gracefully fall back
                console.error('[AuthContext] Failed to get user:', error);
                if (!cancelled) {
                    setUser(null);
                    setStatus("unauthenticated");
                }
            }
        };

        loadUser();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (cancelled) return;

            if (session?.user) {
                setUser(session.user);
                setStatus("authenticated");
            } else {
                setUser(null);
                setStatus("unauthenticated");
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = useCallback(async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        setUser(null);
        setStatus("unauthenticated");
    }, []);

    const refreshUser = useCallback(async () => {
        const supabase = createSupabaseBrowserClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            setStatus("authenticated");
        }
    }, []);

    const value: AuthContextValue = {
        status,
        user,
        athleteId: user?.id ?? null,

        signOut,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Access auth context from any component.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

/**
 * Convenience hook for checking if user is authenticated
 */
export function useIsAuthenticated(): boolean {
    const { status } = useAuth();
    return status === "authenticated";
}

/**
 * Convenience hook for getting athlete ID
 */
export function useAthleteId(): string | null {
    const { athleteId } = useAuth();
    return athleteId;
}
