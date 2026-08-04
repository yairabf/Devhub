"use client";

import { Toaster } from "sonner";

import { useAppTheme } from "@/components/theme/useAppTheme";

/**
 * Sonner's Toaster with the theme the app is actually using, rather than the OS
 * colour-scheme it would otherwise follow.
 */
export function ThemeToaster() {
  const theme = useAppTheme();

  return <Toaster theme={theme} position="bottom-right" richColors />;
}
