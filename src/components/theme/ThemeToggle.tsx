"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  useAppTheme,
  type Theme,
} from "@/components/theme/useAppTheme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const theme = useAppTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleToggle() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative overflow-hidden text-muted-foreground hover:text-foreground"
    >
      <Sun
        className={cn(
          "absolute size-4 transition-all",
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0",
        )}
        aria-hidden
      />
    </Button>
  );
}
