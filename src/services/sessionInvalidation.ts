/**
 * Session invalidation sequence. (#786)
 *
 * After three consecutive 401s the refresh path cleared tokens and stopped
 * there, leaving the socket connected and the user on an authenticated
 * screen. This runs the remaining steps, never letting one failure stop them.
 */

export const SESSION_INVALIDATED = 'SESSION_INVALIDATED' as const;

export interface SessionInvalidationSteps {
  clearTokens: () => Promise<void> | void;
  disconnectSocket: () => Promise<void> | void;
  navigateToLogin: () => Promise<void> | void;
  notify?: (event: typeof SESSION_INVALIDATED) => void;
}

export interface SessionInvalidationOutcome {
  completed: string[];
  failed: string[];
}

/**
 * Executes every logout step, continuing past individual failures so a broken
 * socket teardown cannot strand the user on an authenticated screen.
 */
export async function invalidateSession(
  steps: SessionInvalidationSteps
): Promise<SessionInvalidationOutcome> {
  const ordered: [string, () => Promise<void> | void][] = [
    ['clearTokens', steps.clearTokens],
    ['disconnectSocket', steps.disconnectSocket],
    ['navigateToLogin', steps.navigateToLogin],
  ];

  const completed: string[] = [];
  const failed: string[] = [];

  for (const [name, run] of ordered) {
    try {
      await run();
      completed.push(name);
    } catch {
      failed.push(name);
    }
  }

  steps.notify?.(SESSION_INVALIDATED);
  return { completed, failed };
}
