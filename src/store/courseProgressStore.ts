import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncStorageJSONStorage, createHydrationErrorRecovery } from './persistence';

import type { CourseProgress, LessonProgress } from '../types/course';

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
}

const INITIAL_COURSE_PROGRESS_STATE = {
  progressMap: {},
};

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
      }),
    }
  )
);
