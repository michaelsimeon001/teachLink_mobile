/**
 * Fix for issue #912:
 * `pushLogContext` and `popLogContext` were used in the axios interceptors
 * without being imported, causing a ReferenceError on every API request.
 *
 * This module exports no-op stubs for these functions so the interceptors
 * can import them safely. Replace with real implementations when a structured
 * logging context store is added.
 */

/** Pushes a key-value pair onto the current log context stack. */
export function pushLogContext(key: string, value: string): void {
  // No-op stub - replace with real log context implementation
  void key;
  void value;
}

/** Pops the most recently pushed log context entry. */
export function popLogContext(): void {
  // No-op stub - replace with real log context implementation
}