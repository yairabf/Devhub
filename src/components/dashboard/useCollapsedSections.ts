"use client";

import { useSyncExternalStore } from "react";

export type CollapsibleSectionId = "favorites" | "recent" | "types";

export type CollapsedSectionsState = Record<CollapsibleSectionId, boolean>;

const STORAGE_KEY = "devstash:sidebar:sections";

const DEFAULT_STATE: CollapsedSectionsState = Object.freeze({
  favorites: false,
  recent: false,
  types: false,
}) as CollapsedSectionsState;

function isValidState(value: unknown): value is CollapsedSectionsState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.favorites === "boolean" &&
    typeof v.recent === "boolean" &&
    typeof v.types === "boolean"
  );
}

let cachedSnapshot: CollapsedSectionsState = DEFAULT_STATE;
let hasReadStorage = false;
const listeners = new Set<() => void>();

function readStorage(): CollapsedSectionsState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidState(parsed)) return parsed;
    }
  } catch {
    // Fall back to defaults on malformed JSON / storage errors.
  }
  return DEFAULT_STATE;
}

function getSnapshot(): CollapsedSectionsState {
  if (!hasReadStorage) {
    cachedSnapshot = readStorage();
    hasReadStorage = true;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): CollapsedSectionsState {
  return DEFAULT_STATE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setSnapshot(next: CollapsedSectionsState) {
  cachedSnapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore write errors (quota, private mode, etc.).
  }
  listeners.forEach(listener => listener());
}

export function useCollapsedSections(): [
  CollapsedSectionsState,
  (sectionId: CollapsibleSectionId) => void,
] {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle(sectionId: CollapsibleSectionId) {
    setSnapshot({ ...cachedSnapshot, [sectionId]: !cachedSnapshot[sectionId] });
  }

  return [state, toggle];
}
