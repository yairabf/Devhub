"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { toast } from "sonner";

import { updateEditorPreferences as saveEditorPreferences } from "@/actions/editor-preferences";
import type { EditorPreferences } from "@/types/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  /** Merges into the current preferences, saves immediately, and shows a toast. */
  updatePreferences: (partial: Partial<EditorPreferences>) => void;
}

const EditorPreferencesContext =
  createContext<EditorPreferencesContextValue | null>(null);

export function EditorPreferencesProvider({
  initialPreferences,
  children,
}: {
  initialPreferences: EditorPreferences;
  children: React.ReactNode;
}) {
  const [preferences, setPreferencesState] = useState(initialPreferences);
  // Mirrors `preferences` so `updatePreferences` always merges onto the latest
  // value without depending on it (which would recreate the callback every
  // save) or reaching for a functional `setState` updater (which React can
  // invoke twice in dev StrictMode — fine for a pure merge, not fine once a
  // network call rides along inside it).
  const preferencesRef = useRef(initialPreferences);

  const setPreferences = useCallback((next: EditorPreferences) => {
    preferencesRef.current = next;
    setPreferencesState(next);
  }, []);

  const updatePreferences = useCallback(
    (partial: Partial<EditorPreferences>) => {
      const previous = preferencesRef.current;
      const next = { ...previous, ...partial };
      setPreferences(next);

      saveEditorPreferences(next).then(result => {
        if (result.success) {
          toast.success("Editor preferences saved");
        } else {
          // The optimistic value didn't actually persist — revert it so the
          // UI doesn't keep claiming a setting that never saved.
          setPreferences(previous);
          toast.error(result.error);
        }
      });
    },
    [setPreferences],
  );

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

/**
 * Throws rather than defaulting: every route that renders a `CodeEditor` must
 * thread its own fetched `editorPreferences` into a provider (dashboard/items/
 * collections layouts + settings). A silent default would mean a route missing
 * that wiring quietly ignores the user's saved settings instead of erroring.
 */
export function useEditorPreferences(): EditorPreferencesContextValue {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    throw new Error(
      "useEditorPreferences must be used within an EditorPreferencesProvider",
    );
  }
  return context;
}
