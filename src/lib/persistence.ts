import {
  DEFAULT_LEFT_TEXT,
  DEFAULT_OPTIONS,
  DEFAULT_RIGHT_TEXT,
  STORAGE_KEY,
} from "./constants";
import type { PersistedSession } from "../types/diff";

export function createDefaultSession(): PersistedSession {
  return {
    version: 1,
    leftText: DEFAULT_LEFT_TEXT,
    rightText: DEFAULT_RIGHT_TEXT,
    options: DEFAULT_OPTIONS,
    theme: "light",
  };
}

export function loadSession(): PersistedSession {
  if (typeof window === "undefined") {
    return createDefaultSession();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultSession();
    }

    const parsed = JSON.parse(raw) as PersistedSession;
    if (parsed.version !== 1) {
      return createDefaultSession();
    }

    return {
      ...parsed,
      theme: "light",
    };
  } catch {
    return createDefaultSession();
  }
}

export function saveSession(session: PersistedSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

