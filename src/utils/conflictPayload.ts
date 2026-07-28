/**
 * 409 Conflict payload parsing. (#787)
 *
 * Conflicts were logged as raw response bodies, so the UI had nothing typed
 * to drive a resolution prompt and the user saw a generic error with no way
 * to resolve it. This normalises the shapes the API returns into one payload
 * ConflictResolutionModal can consume.
 */

export interface ConflictPayload {
  resource: string;
  serverVersion: string | null;
  clientVersion: string | null;
}

/** First readable string/number among `keys`, or null. */
function readString(source: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return null;
}

/**
 * Returns a typed conflict payload, or null when `data` carries no
 * recognisable conflict details — the caller should then fall back to the
 * generic error path rather than opening an empty resolution modal.
 */
export function parseConflictPayload(data: unknown): ConflictPayload | null {
  if (!data || typeof data !== 'object') return null;
  const source = data as Record<string, unknown>;

  const serverVersion = readString(source, 'serverVersion', 'server_version', 'currentVersion');
  const clientVersion = readString(source, 'clientVersion', 'client_version', 'submittedVersion');
  if (!serverVersion && !clientVersion) return null;

  return {
    resource: readString(source, 'resource', 'entity', 'type') ?? 'record',
    serverVersion,
    clientVersion,
  };
}
