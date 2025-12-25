import { useEffect } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';

const lightThemes = [
    { name: 'default', label: 'Default', color: 'bg-slate-500' },
    { name: 'theme-ocean', label: 'Ocean', color: 'bg-cyan-500' },
    { name: 'theme-sunset', label: 'Sunset', color: 'bg-orange-500' },
    { name: 'theme-forest', label: 'Forest', color: 'bg-green-500' },
];

const darkThemes = [
    { name: 'default', label: 'Default', color: 'bg-slate-400' },
    { name: 'theme-midnight', label: 'Midnight', color: 'bg-indigo-500' },
    { name: 'theme-ember', label: 'Ember', color: 'bg-red-500' },
    { name: 'theme-aurora', label: 'Aurora', color: 'bg-emerald-500' },
];

export function ThemeSelector() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    // Decide which list to show based on the *actual* visible mode
    const currentThemes = resolvedTheme === 'dark' ? darkThemes : lightThemes;
    const currentColor = 'default'; // For now, just use default since we don't have custom color themes in next-themes

    // Reset variant whenever the base mode changes
    useEffect(() => {
        const classes = Array.from(document.documentElement.classList);
        classes.forEach(cls => {
            if (cls.startsWith('theme-')) {
                document.documentElement.classList.remove(cls);
            }
        });
    }, [resolvedTheme]);

    const handleThemeChange = (themeName: string) => {
        // Get all current classes
        const classes = Array.from(document.documentElement.classList);

        // Remove all previous theme variant classes
        classes.forEach(cls => {
            if (cls.startsWith('theme-')) {
                document.documentElement.classList.remove(cls);
            }
        });

        // Apply new theme class if not default
        if (themeName !== 'default') {
            document.documentElement.classList.add(themeName);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-[2.8rem] w-[2.8rem] rounded-full border-2 border-primary/20 bg-background/80 backdrop-blur-md transition-all duration-300 hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:scale-110 active:scale-95 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Palette className="h-[1.3rem] w-[1.3rem] transition-transform duration-300 group-hover:rotate-12 text-primary dark:text-primary-foreground z-10" />
                    <span className="sr-only">Change theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-primary/10 bg-background/95 backdrop-blur-xl shadow-xl">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5">
                    {resolvedTheme === 'dark' ? 'Dark Themes' : 'Light Themes'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 my-1" />
                <div className="grid gap-1">
                    {currentThemes.map((t) => (
                        <DropdownMenuItem
                            key={t.name}
                            onClick={() => handleThemeChange(t.name)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${currentColor === t.name
                                ? "bg-primary/15 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            <span className={`w-3 h-3 rounded-full shadow-sm ring-1 ring-inset ring-black/10 ${t.color}`} />
                            {t.label}
                            {currentColor === t.name && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
