import '@testing-library/jest-dom/vitest';

// Node v22+ ships a built-in localStorage that shadows jsdom's implementation.
// The built-in is incomplete (missing clear/getItem/setItem/etc.), so we install
// a spec-compliant polyfill on both globalThis and window.
if (typeof window !== 'undefined' && typeof window.localStorage?.clear !== 'function') {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length() { return this.store.size; }
    clear() { this.store.clear(); }
    getItem(key: string) { return this.store.get(key) ?? null; }
    setItem(key: string, value: string) { this.store.set(key, String(value)); }
    removeItem(key: string) { this.store.delete(key); }
    key(index: number) {
      const keys = Array.from(this.store.keys());
      return keys[index] ?? null;
    }
  }
  const storage = new MemoryStorage();
  Object.defineProperty(window, 'localStorage', { value: storage, writable: true, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true, configurable: true });
}
