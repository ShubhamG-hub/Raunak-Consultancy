import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
    const { themes, themeId, updateGlobalTheme, isDark, toggleGlobalDarkMode } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-10 w-10 md:h-11 md:w-11 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
                    <Palette className="h-5 h-5 text-slate-600 dark:text-primary-theme animate-pulse-subtle" />
                    <span className="sr-only">Quick Theme Settings</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 dark:border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-slate-50 dark:border-white/5 mb-2 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Themes</p>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleGlobalDarkMode}
                        className="rounded-lg h-8 px-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                        {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                        <span className="text-xs font-bold">{isDark ? 'Light' : 'Dark'}</span>
                    </Button>
                </div>

                <div className="space-y-1">
                    {themes.map((theme) => (
                        <DropdownMenuItem
                            key={theme.id}
                            onClick={() => updateGlobalTheme(theme.id)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${themeId === theme.id
                                ? 'bg-primary-theme/10 text-primary-theme'
                                : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                    style={{ backgroundColor: theme.primary }}
                                />
                                <span className="text-sm font-bold">{theme.name}</span>
                            </div>
                            {themeId === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-theme" />}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
