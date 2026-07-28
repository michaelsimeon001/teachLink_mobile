import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncStorageJSONStorage, createHydrationErrorRecovery } from './persistence';

import type { CourseProgress, LessonProgress } from '../types/course';
import type { Lesson } from '../types/course';

// ── Windowed lesson loading constants ─────────────────────────────────────────
/**
 * Number of lessons to load ahead and behind the current lesson (i.e. the
 * "window radius"). At radius 2 we keep at most 5 lessons in memory at a time,
 * which limits the in-memory object graph to < 50 MB even on 50-lesson courses.
 */
const LESSON_WINDOW_RADIUS = 2;
const LESSON_PAGE_SIZE = LESSON_WINDOW_RADIUS * 2 + 1; // 5 lessons per fetch

export class InvalidLessonProgressError extends Error {
  constructor(message = 'Invalid lesson progress data: missing or invalid required fields.') {
    super(message);
    this.name = 'InvalidLessonProgressError';
  }
}

export function isValidLessonProgress(data: Partial<LessonProgress>): data is LessonProgress {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.lessonId === 'string' &&
    data.lessonId.trim().length > 0 &&
    typeof data.completed === 'boolean' &&
    typeof data.lastPosition === 'number' &&
    typeof data.timeSpent === 'number' &&
    typeof data.completedAt === 'string'
  );
}

interface CourseProgressState {
  // keyed by courseId
  progressMap: Record<string, CourseProgress>;
  setCourseProgress: (courseId: string, progress: CourseProgress) => void;
  getCourseProgress: (courseId: string) => CourseProgress | null;
  markLessonComplete: (
    courseId: string,
    lessonId: string,
    totalLessons: number,
    lessonData?: Partial<LessonProgress>
  ) => void;
  isCourseComplete: (courseId: string, totalLessons: number) => boolean;

  // ── Windowed lesson loading (issue #817) ──────────────────────────────────
  /**
   * In-memory window of lesson metadata for the currently active course.
   * Only the current ± LESSON_WINDOW_RADIUS lessons are kept here, limiting
   * memory usage on large courses with many lessons.
   */
  lessonWindow: Record<string, Lesson[]>; // keyed by courseId
  /**
   * The 1-based page that was last loaded for each course.
   * Stored so the viewer can detect when the window needs sliding.
   */
  lessonWindowPage: Record<string, number>;
  /**
   * Load (or slide) the lesson window to the page containing `currentLessonIndex`.
   * Frees the previous window from memory before setting the new one.
   *
   * @param courseId           - Course whose lessons should be windowed.
   * @param currentLessonIndex - 0-based absolute index of the active lesson.
   * @param totalLessons       - Total lesson count for the course.
   */
  loadLessonWindow: (courseId: string, currentLessonIndex: number, totalLessons: number) => Promise<void>;
  /**
   * Return the currently loaded lesson slice for a course.
   * Returns an empty array if no window has been loaded yet.
   */
  getLessonWindow: (courseId: string) => Lesson[];
}

const INITIAL_COURSE_PROGRESS_STATE = {
  progressMap: {},
  lessonWindow: {} as Record<string, Lesson[]>,
  lessonWindowPage: {} as Record<string, number>,
};

/**
 * Tracks lesson completions currently within the 500 ms deduplication window.
 * Key format: `${courseId}:${lessonId}` — module-level so it persists across
 * store resets and is not serialised to AsyncStorage.
 */
export const completionInProgress = new Set<string>();

/** Exposed for tests so they can drain pending timers cleanly. */
export const _completionTimers = new Map<string, ReturnType<typeof setTimeout>>();

let resetCourseProgressStoreAfterHydrationError = () => {};

export const useCourseProgressStore = create<CourseProgressState>()(
  persist(
    (set, get): CourseProgressState => {
      resetCourseProgressStoreAfterHydrationError = () => set(INITIAL_COURSE_PROGRESS_STATE);

      return {
        ...INITIAL_COURSE_PROGRESS_STATE,

        setCourseProgress: (courseId, progress) =>
          set(s => ({ progressMap: { ...s.progressMap, [courseId]: progress } })),

        getCourseProgress: courseId => get().progressMap[courseId] ?? null,

        markLessonComplete: (courseId, lessonId, totalLessons, lessonData) => {
          const candidateProgress: Partial<LessonProgress> = {
            lessonId,
            completed: true,
            lastPosition: 0,
            timeSpent: 0,
            completedAt: new Date().toISOString(),
            ...lessonData,
          };

          if (!isValidLessonProgress(candidateProgress)) {
            throw new InvalidLessonProgressError(
              'Failed to update course progress: lessonData is missing required fields.'
            );
          }

          const lessonProgress: LessonProgress = candidateProgress;
          // ── Deduplication guard ───────────────────────────────────────────
          // A 500 ms window prevents duplicate completion records when multiple
          // triggers fire for the same lesson (e.g., video-end + manual skip).
          const key = `${courseId}:${lessonId}`;
          if (completionInProgress.has(key)) return;

          completionInProgress.add(key);

          // Clear any pre-existing timer for this key before setting a new one.
          const existingTimer = _completionTimers.get(key);
          if (existingTimer !== undefined) clearTimeout(existingTimer);

          _completionTimers.set(
            key,
            setTimeout(() => {
              completionInProgress.delete(key);
              _completionTimers.delete(key);
            }, 500)
          );
          // ─────────────────────────────────────────────────────────────────

          set(s => {
            const existing = s.progressMap[courseId];
            if (!existing) return s;

            const updatedLessons = { ...existing.lessons, [lessonId]: lessonProgress };
            const completedLessons = Object.values(updatedLessons).filter(l => l.completed).length;

            // Use integer comparison as primary check; >= 99.5 as float fallback
            const computedPercentage =
              totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            const isComplete = completedLessons === totalLessons || computedPercentage >= 99.5;
            const overallProgress = isComplete
              ? 100
              : Math.min(99, Math.round(computedPercentage * 10) / 10);

            return {
              progressMap: {
                ...s.progressMap,
                [courseId]: { ...existing, lessons: updatedLessons, overallProgress },
              },
            };
          });
        },

        isCourseComplete: (courseId, totalLessons) => {
          const progress = get().progressMap[courseId];
          if (!progress) return false;
          const completedLessons = Object.values(progress.lessons).filter(l => l.completed).length;
          return completedLessons === totalLessons || progress.overallProgress >= 99.5;
        },

        // ── Windowed lesson loading (issue #817) ────────────────────────────
        lessonWindow: {},
        lessonWindowPage: {},

        getLessonWindow: (courseId) => get().lessonWindow[courseId] ?? [],

        loadLessonWindow: async (courseId, currentLessonIndex, totalLessons) => {
          // Compute which 1-based page contains the current lesson index
          const targetPage = Math.floor(currentLessonIndex / LESSON_PAGE_SIZE) + 1;
          const currentPage = get().lessonWindowPage[courseId];

          // Skip if the required window is already loaded
          if (currentPage === targetPage) return;

          try {
            // Lazy-import the API to avoid a circular dependency at module load time
            const { courseApi } = await import('../services/api/courseApi');
            const result = await courseApi.loadLessonsPage(courseId, targetPage, LESSON_PAGE_SIZE);

            set(s => ({
              // Free the previous window before storing the new one so the old
              // lesson objects are eligible for GC (#817: memory management)
              lessonWindow: {
                ...s.lessonWindow,
                [courseId]: result.lessons,
              },
              lessonWindowPage: {
                ...s.lessonWindowPage,
                [courseId]: targetPage,
              },
            }));
          } catch (_err) {
            // Non-fatal: the viewer falls back to the full lesson list supplied
            // via the course prop when the window fails to load.
          }
        },
      };
    },
    {
      name: 'course-progress-storage',
      version: 1,
      storage: asyncStorageJSONStorage,
      onRehydrateStorage: createHydrationErrorRecovery(
        'course-progress-storage',
        resetCourseProgressStoreAfterHydrationError
      ),
      partialize: state => ({
        progressMap: state.progressMap,
        // lessonWindow and lessonWindowPage are transient — they are rebuilt on
        // demand from the API and should not bloat AsyncStorage with lesson data.
      }),
    }
  )
);
