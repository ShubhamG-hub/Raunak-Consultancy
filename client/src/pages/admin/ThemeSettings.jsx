import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Check, Palette, ShieldCheck, Zap, Heart, Moon, Sun } from 'lucide-react';

const ThemeSettings = () => {
    const { themeId, updateGlobalTheme, themes, isDark, toggleGlobalDarkMode } = useTheme();
    const [saving, setSaving] = useState(false);

    const handleThemeChange = async (newThemeId) => {
        setSaving(true);
        try {
            await updateGlobalTheme(newThemeId);
        } catch (err) {
            console.error('Failed to save theme setting:', err);
            alert('Could not save global theme.');
        } finally {
            setSaving(false);
        }
    };

    const handleModeToggle = async () => {
        setSaving(true);
        try {
            await toggleGlobalDarkMode();
        } catch (err) {
            console.error('Failed to save global mode setting:', err);
            alert('Could not save global display mode.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Appearance Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Customize the look and feel of your consultancy website for all users.
                </p>
            </header>

            {/* Dark Mode Toggle Section */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            {isDark ? <Moon className="text-indigo-500" /> : <Sun className="text-amber-500" />}
                            Personal Display Mode
                        </h2>
                        <p className="text-sm text-slate-500">This setting only affects your current browser session.</p>
                    </div>
                    <Button
                        onClick={handleModeToggle}
                        variant="outline"
                        disabled={saving}
                        className="h-12 rounded-xl px-6 gap-2 font-bold"
                    >
                        Switch to {isDark ? 'Light' : 'Dark'} Mode
                    </Button>
                </div>
            </section>

            {/* Theme Presets Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Palette className="text-primary" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Global Color Palette</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {themes.map((t) => {
                        const isActive = themeId === t.id;
                        return (
                            <motion.button
                                key={t.id}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleThemeChange(t.id)}
                                disabled={saving}
                                className={`relative p-8 rounded-[2.5rem] border-2 text-left transition-all duration-300 ${isActive
                                    ? 'bg-white dark:bg-slate-800 border-primary shadow-xl shadow-primary/10'
                                    : 'bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 hover:border-slate-200'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute top-6 right-6 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40">
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{t.name}</h3>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: t.primary }} title="Primary" />
                                            <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: t.secondary }} title="Secondary" />
                                            <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: t.accent }} title="Accent" />
                                        </div>
                                    </div>

                                    {/* Mini Preview Mockup */}
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
                                            <div className="h-2 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                        </div>
                                        <div className="h-8 w-full rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: t.primary }}>
                                            Primary CTA
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-6 flex-1 rounded-lg border flex items-center justify-center text-[8px] font-bold" style={{ borderColor: t.secondary, color: t.secondary }}>Secondary</div>
                                            <div className="h-6 flex-1 rounded-lg flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: t.accent }}>Accent</div>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                            <ShieldCheck size={16} />
                                            Currently Active Globally
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            {/* Micro-interaction Demo */}
            <section className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-[3rem] p-12 text-center border border-primary/10 dark:border-white/5">
                <Heart className="w-12 h-12 mx-auto text-primary mb-4 animate-pulse" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Designed for Trust</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2">
                    Every theme is handcrafted to convey professionalism and build long-term trust with your clients.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <div className="px-6 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-sm font-bold flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" /> Premium UX
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ThemeSettings;
