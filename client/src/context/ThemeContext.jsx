import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes, defaultThemeId } from '../config/themes';
import api from '../lib/api';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [themeId, setThemeId] = useState(() => {
        // Initialise from localStorage immediately to avoid a flash of the default theme
        return localStorage.getItem('themeId') || defaultThemeId;
    });

    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem('isDark');
        if (stored !== null) return stored === 'true';
        // Respect the OS preference if no stored preference exists
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    });

    const [themeLoading, setThemeLoading] = useState(true);

    // ── Fetch the globally-active theme and mode from the backend ────────────
    useEffect(() => {
        let cancelled = false;

        const fetchGlobalSettings = async () => {
            try {
                // Fetch active theme ID
                const themeResponse = await api.get('/settings/active_theme');
                if (!cancelled && themeResponse.data?.value) {
                    setThemeId(themeResponse.data.value);
                }

                // Fetch global dark mode preference
                const darkResponse = await api.get('/settings/is_dark');
                if (!cancelled && darkResponse.data?.value !== undefined) {
                    // Check if user has a personal override in localStorage
                    // If not, use the global setting
                    if (localStorage.getItem('isDark') === null) {
                        setIsDark(darkResponse.data.value === 'true');
                    }
                }
            } catch (err) {
                console.error('❌ Could not fetch global settings from backend:', {
                    message: err?.message,
                    status: err?.response?.status,
                    data: err?.response?.data,
                    url: err?.config?.url
                });
            } finally {
                if (!cancelled) setThemeLoading(false);
            }
        };

        fetchGlobalSettings();

        return () => { cancelled = true; };
    }, []);

    // ── Convert hex colour → "R, G, B" string for CSS custom properties ───────
    const hexToRgb = useCallback((hex) => {
        // Gracefully handle 3-digit shorthand (#fff) as well as 6-digit (#ffffff)
        const sanitised = hex.replace(/^#/, '');
        const full = sanitised.length === 3
            ? sanitised.split('').map(c => c + c).join('')
            : sanitised;

        const r = parseInt(full.slice(0, 2), 16);
        const g = parseInt(full.slice(2, 4), 16);
        const b = parseInt(full.slice(4, 6), 16);

        if ([r, g, b].some(isNaN)) {
            console.warn(`ThemeContext: invalid hex colour "${hex}", falling back to 0,0,0`);
            return '0, 0, 0';
        }

        return `${r} ${g} ${b}`;
    }, []);

    // ── Apply CSS variables + dark class whenever theme or mode changes ────────
    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = themes.find(t => t.id === themeId) ?? themes[0];

        if (!currentTheme) return; // safety guard if themes array is empty

        const rgbPrimary = hexToRgb(currentTheme.primary);
        const rgbSecondary = hexToRgb(currentTheme.secondary);
        const rgbAccent = hexToRgb(currentTheme.accent);

        // RGB triplets — used for rgba() opacity variants e.g. rgba(var(--primary), 0.1)
        root.style.setProperty('--primary', rgbPrimary);
        root.style.setProperty('--secondary', rgbSecondary);
        root.style.setProperty('--accent', rgbAccent);

        // Full hex values — used wherever a plain colour string is needed
        root.style.setProperty('--primary-theme', currentTheme.primary);
        root.style.setProperty('--secondary-theme', currentTheme.secondary);
        root.style.setProperty('--accent-theme', currentTheme.accent);

        // Pre-built glow / tint helpers
        root.style.setProperty('--primary-glow', `rgba(${rgbPrimary} / 0.15)`);
        root.style.setProperty('--accent-glow', `rgba(${rgbAccent} / 0.15)`);

        // Dark mode
        root.classList.toggle('dark', isDark);

        // Persist preferences locally
        localStorage.setItem('themeId', themeId);
        localStorage.setItem('isDark', String(isDark));
    }, [themeId, isDark, hexToRgb]);

    // ── Synchronize state across multiple open tabs ──────────────────────────
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'themeId' && e.newValue) {
                setThemeId(e.newValue);
            }
            if (e.key === 'isDark' && e.newValue) {
                setIsDark(e.newValue === 'true');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // ── Sync with OS dark-mode changes while the app is open ──────────────────
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
        if (!mq) return;

        const handleChange = (e) => {
            // Only follow the OS if the user has not manually set a preference
            if (localStorage.getItem('isDark') === null) {
                setIsDark(e.matches);
            }
        };

        mq.addEventListener('change', handleChange);
        return () => mq.removeEventListener('change', handleChange);
    }, []);

    const updateGlobalTheme = useCallback(async (newThemeId) => {
        try {
            // Update locally first
            setThemeId(newThemeId);
            // Persist to backend
            await api.post('/settings', {
                key: 'active_theme',
                value: newThemeId
            });
        } catch (err) {
            console.error('Failed to update global theme:', err);
            // Revert on failure if needed, but usually we want to stay optimistic
        }
    }, []);

    const toggleGlobalDarkMode = useCallback(async () => {
        const newIsDark = !isDark;
        try {
            // Update locally first
            setIsDark(newIsDark);
            // Clear personal override so global takes effect
            localStorage.setItem('isDark', String(newIsDark));

            // Persist to backend
            await api.post('/settings', {
                key: 'is_dark',
                value: String(newIsDark)
            });
        } catch (err) {
            console.error('Failed to toggle global dark mode:', err);
        }
    }, [isDark]);

    const toggleDarkMode = useCallback(() => setIsDark(prev => !prev), []);

    // Clear the stored dark-mode preference so OS preference takes over again
    const resetDarkModeToSystem = useCallback(() => {
        localStorage.removeItem('isDark');
        setIsDark(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
    }, []);

    const value = {
        themeId,
        setThemeId, // local only
        updateGlobalTheme, // persistence
        isDark,
        setIsDark, // local only
        toggleDarkMode, // local only
        toggleGlobalDarkMode, // persistence
        resetDarkModeToSystem,
        themes,
        themeLoading,
        // Convenience: the full active theme object
        activeTheme: themes.find(t => t.id === themeId) ?? themes[0],
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};