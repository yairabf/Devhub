"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

/**
 * Sonner's Toaster with the theme the app is actually using. Reads the `dark`
 * class the root layout sets pre-hydration and listens for the same event
 * ThemeToggle dispatches, so it does not depend on OS colour-scheme.
 */
export function ThemeToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const sync = () =>
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );

    sync();
    window.addEventListener("devstash:theme-change", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("devstash:theme-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return <Toaster theme={theme} position="bottom-right" richColors />;
}
