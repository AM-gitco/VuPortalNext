import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg bg-background border-2 border-primary/20 hover:border-primary hover:shadow-xl hover:scale-105 transition-all z-50 text-foreground"
      title={`Current mode: ${(theme || 'system').charAt(0).toUpperCase() + (theme || 'system').slice(1)} (Click to switch)`}
    >
      {theme === 'light' && <Sun size={20} className="text-orange-600 animate-pulse" />}
      {theme === 'dark' && <Moon size={20} className="text-blue-200 rotate-12" />}
      {(theme === 'system' || !theme) && <Monitor size={20} className="text-foreground" />}
    </Button>
  );
}
