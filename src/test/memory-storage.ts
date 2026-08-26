/**
 * Installs an in-memory `window.localStorage` when the environment lacks one.
 *
 * Node 24+ ships an experimental global `localStorage` that is inert unless the
 * process is started with `--localstorage-file`. It shadows the DOM
 * environment's own implementation, so `window.localStorage` resolves to
 * `undefined` and anything touching storage throws. `sessionStorage` is
 * unaffected.
 *
 * Methods live on the prototype so tests can spy on them.
 */
class MemoryStorage implements Storage {
  #entries = new Map<string, string>()

  get length(): number {
    return this.#entries.size
  }
  key(index: number): string | null {
    return [...this.#entries.keys()][index] ?? null
  }
  getItem(key: string): string | null {
    return this.#entries.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.#entries.set(key, String(value))
  }
  removeItem(key: string): void {
    this.#entries.delete(key)
  }
  clear(): void {
    this.#entries.clear()
  }
}

export function installMemoryStorage(): void {
  if (window.localStorage) return

  Object.defineProperty(window, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
}
