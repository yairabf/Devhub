"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "devstash:theme";
export const THEME_CHANGE_EVENT = "devstash:theme-change";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
}

function subscribeToThemeChange(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

/**
 * The theme the app is actually using — the one the pre-hydration script in the
 * root layout read out of localStorage, kept in sync with ThemeToggle's event
 * and with other tabs. Deliberately not the OS colour-scheme: this app has its
 * own switch, and components that paint their own surfaces (toasts, the code
 * editor) have to follow that switch rather than the system.
 */
export function useAppTheme(): Theme {
  return useSyncExternalStore(
    subscribeToThemeChange,
    getStoredTheme,
    getServerThemeSnapshot,
  );
}
