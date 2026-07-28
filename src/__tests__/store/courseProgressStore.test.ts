import {
  InvalidLessonProgressError,
  isValidLessonProgress,
  useCourseProgressStore,
} from '../../store/courseProgressStore';
import type { CourseProgress, LessonProgress } from '../../types/course';

const baseCourseProgress = (courseId: string): CourseProgress => ({
  courseId,
  currentLessonId: '',
  currentSectionId: '',
  lessons: {},
  quizzes: {},
  overallProgress: 0,
  lastAccessed: new Date().toISOString(),
  bookmarks: [],
  notes: {},
});

describe('courseProgressStore — markLessonComplete / isCourseComplete', () => {
  beforeEach(() => {
    useCourseProgressStore.setState({ progressMap: {} });
  });

  // ---------------------------------------------------------------------------
  // Existing Progress Calculation Tests
  // ---------------------------------------------------------------------------

  it('does not mark complete at 1/3 lessons', () => {
    const courseId = 'c1';
    useCourseProgressStore.getState().setCourseProgress(courseId, baseCourseProgress(courseId));
    useCourseProgressStore.getState().markLessonComplete(courseId, 'l1', 3);

    expect(useCourseProgressStore.getState().isCourseComplete(courseId, 3)).toBe(false);
    expect(
      useCourseProgressStore.getState().getCourseProgress(courseId)?.overallProgress
    ).toBeLessThan(99.5);
  });

  it('does not mark complete at 2/3 lessons', () => {
    const courseId = 'c2';
    useCourseProgressStore.getState().setCourseProgress(courseId, baseCourseProgress(courseId));
    useCourseProgressStore.getState().markLessonComplete(courseId, 'l1', 3);
    useCourseProgressStore.getState().markLessonComplete(courseId, 'l2', 3);

    expect(useCourseProgressStore.getState().isCourseComplete(courseId, 3)).toBe(false);
  });

  it('marks complete at 3/3 lessons (non-divisible float case)', () => {
    const courseId = 'c3';
    useCourseProgressStore.getState().setCourseProgress(courseId, baseCourseProgress(courseId));
    useCourseProgressStore.getState().markLessonComplete(courseId, 'l1', 3);
    useCourseProgressStore.getState().markLessonComplete(courseId, 'l2', 3);
    useCourseProgressStore.getState().markLessonComplete(courseId, 'l3', 3);

    expect(useCourseProgressStore.getState().isCourseComplete(courseId, 3)).toBe(true);
    expect(useCourseProgressStore.getState().getCourseProgress(courseId)?.overallProgress).toBe(
      100
    );
  });

  it('marks complete at 10/10 lessons', () => {
    const courseId = 'c10';
    useCourseProgressStore.getState().setCourseProgress(courseId, baseCourseProgress(courseId));
    for (let i = 1; i <= 10; i++) {
      useCourseProgressStore.getState().markLessonComplete(courseId, `l${i}`, 10);
    }

    expect(useCourseProgressStore.getState().isCourseComplete(courseId, 10)).toBe(true);
    expect(useCourseProgressStore.getState().getCourseProgress(courseId)?.overallProgress).toBe(
      100
    );
  });

  it('isCourseComplete returns false for unknown course', () => {
    expect(useCourseProgressStore.getState().isCourseComplete('unknown', 5)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Issue #808 Validation & Type Guard Tests
  // ---------------------------------------------------------------------------

  describe('isValidLessonProgress type guard', () => {
    it('returns true for complete and valid LessonProgress data', () => {
      const validData: Partial<LessonProgress> = {
        lessonId: 'l1',
        completed: true,
        lastPosition: 120,
        timeSpent: 300,
        completedAt: new Date().toISOString(),
      };
      expect(isValidLessonProgress(validData)).toBe(true);
    });

    it('returns false when required fields are empty, missing, or wrong type', () => {
      expect(isValidLessonProgress({ lessonId: '' })).toBe(false);
      expect(isValidLessonProgress({ lessonId: 'l1', completed: 'yes' as any })).toBe(false);
      expect(isValidLessonProgress({ lessonId: 'l1', timeSpent: 'none' as any })).toBe(false);
      expect(isValidLessonProgress(null as any)).toBe(false);
    });
  });

  describe('markLessonComplete — lessonData validation', () => {
    it('accepts and applies valid custom lessonData overrides', () => {
      const courseId = 'c_custom';
      useCourseProgressStore.getState().setCourseProgress(courseId, baseCourseProgress(courseId));

      useCourseProgressStore.getState().markLessonComplete(courseId, 'l1', 1, {
        timeSpent: 450,
        lastPosition: 30,
      });

      const updatedLesson = useCourseProgressStore.getState().getCourseProgress(courseId)?.lessons[
        'l1'
      ];
      expect(updatedLesson?.timeSpent).toBe(450);
      expect(updatedLesson?.lastPosition).toBe(30);
      expect(updatedLesson?.completed).toBe(true);
    });

    it('throws InvalidLessonProgressError when invalid lessonData overrides required fields', () => {
      const courseId = 'c_invalid';
      useCourseProgressStore.getState().setCourseProgress(courseId, baseCourseProgress(courseId));

      expect(() => {
        useCourseProgressStore.getState().markLessonComplete(courseId, 'l1', 1, {
          lessonId: '', // Invalid empty string override
        });
      }).toThrow(InvalidLessonProgressError);
    });

    it('does not mutate store state when an invalid update is rejected', () => {
      const courseId = 'c_rollback';
      useCourseProgressStore.getState().setCourseProgress(courseId, baseCourseProgress(courseId));

      const initialState = useCourseProgressStore.getState().getCourseProgress(courseId);

      try {
        useCourseProgressStore.getState().markLessonComplete(courseId, 'l1', 1, {
          lessonId: '   ', // Invalid whitespace-only ID
        });
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidLessonProgressError);
      }

      const currentState = useCourseProgressStore.getState().getCourseProgress(courseId);
      expect(currentState?.lessons).toEqual(initialState?.lessons);
    });
  });
});
