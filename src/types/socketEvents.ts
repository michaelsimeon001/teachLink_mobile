/**
 * Discriminated union for socket payloads. (#799)
 *
 * Socket event data was typed as `Record<string, any>`, so a renamed or
 * missing field on an incoming message passed the compiler and only surfaced
 * as a runtime error. Narrowing on `type` restores compile-time checking.
 */

export interface LessonProgressEvent {
  type: 'lesson:progress';
  lessonId: string;
  courseId: string;
  percentComplete: number;
}

export interface NotificationEvent {
  type: 'notification:new';
  notificationId: string;
  title: string;
  body: string;
}

export interface QuizGradedEvent {
  type: 'quiz:graded';
  quizId: string;
  score: number;
  passed: boolean;
}

export interface PresenceEvent {
  type: 'presence:update';
  userId: string;
  online: boolean;
}

export type SocketEvent =
  | LessonProgressEvent
  | NotificationEvent
  | QuizGradedEvent
  | PresenceEvent;

export type SocketEventType = SocketEvent['type'];

/** Narrows an incoming payload to one specific event type. */
export function isSocketEvent<T extends SocketEventType>(
  event: SocketEvent,
  type: T
): event is Extract<SocketEvent, { type: T }> {
  return event.type === type;
}
