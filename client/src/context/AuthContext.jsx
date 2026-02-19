import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // 1. Check local storage for existing session/user
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // 2. Listen for Supabase Auth changes (Auto logout on expiry)
                let subscription;
                if (supabase) {
                    const { data } = supabase.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED') {
                            logout();
                        }
                    });
                    subscription = data.subscription;
                }

                return () => {
                    if (subscription) subscription.unsubscribe();
                };
            } catch (error) {
                console.error("Auth Initialization Error:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // We use our custom backend login because it aggregates data from multiple sources
            // and handles the admin role logic efficiently.
            const { data } = await api.post('/auth/login', { email, password });

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            }
            return { success: false, error: 'Login failed' };
        } catch (err) {
            console.error(err);
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        if (supabase) supabase.auth.signOut();
        window.location.href = '/admin/login';
    };

    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAdmin: user?.role === 'admin' || user?.role === 'Administrator' }}>
            {children}
        </AuthContext.Provider>
    );
};
