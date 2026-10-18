// localStorage can be missing or throw (private mode, blocked site data), so wrap every access.
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not persisting is acceptable; the page still works for this visit.
  }
}
