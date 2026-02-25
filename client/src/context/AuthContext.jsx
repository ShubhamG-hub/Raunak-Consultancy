import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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

                if (token && storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                return () => {
                    // Cleanup if needed
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
            const rawError = err.response?.data?.error;
            const errorMsg = typeof rawError === 'string'
                ? rawError
                : rawError?.message || rawError?.code || 'Login failed';
            return { success: false, error: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
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
