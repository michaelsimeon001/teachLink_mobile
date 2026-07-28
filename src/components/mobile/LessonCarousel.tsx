import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useDeviceUiComplexity } from '../../hooks/useDeviceUiComplexity';
import { useAppStore } from '../../store';
import { useSettingsStore } from '../../store/settingsStore';
import { getColors } from '../../utils/colors';
import { CourseProgress, Lesson } from '../../types/course';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LessonCarouselProps {
  lessons: Lesson[];
  currentLessonId: string;
  progress?: CourseProgress | null;
  onLessonChange: (lessonId: string, index: number) => void;
  onProgressUpdate?: (lessonId: string, position: number) => void;
  renderLessonContent: (lesson: Lesson) => React.ReactNode;
  onLastLessonNext?: () => void;
  isLastLessonInSection?: boolean;
}

const LessonCarousel = ({
  lessons,
  currentLessonId,
  progress,
  onLessonChange,
  renderLessonContent,
  onLastLessonNext,
  isLastLessonInSection = false,
}: LessonCarouselProps) => {
  const dataSaverEnabled = useSettingsStore(state => state.dataSaverEnabled);
  const theme = useAppStore(state => state.theme);
  const colors = getColors(theme);
  const flatListRef = useRef<FlatList<Lesson>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const { shouldDisableHeavyEffects } = useDeviceUiComplexity();

  useEffect(() => {
    const index = lessons.findIndex(lesson => lesson.id === currentLessonId);
    if (index >= 0 && index !== currentIndex) {
      setCurrentIndex(index);
      flatListRef.current?.scrollToIndex({ index, animated: false });
    }
  }, [currentLessonId, currentIndex, lessons]);

  useEffect(() => {
    if (!progress || lessons.length === 0) return;

    const completedCount = lessons.filter(lesson => progress.lessons[lesson.id]?.completed).length;
    const progressPercent = (completedCount / lessons.length) * 100;
    const toValue = (progressPercent / 100) * SCREEN_WIDTH;

    if (dataSaverEnabled) {
      progressBarWidth.setValue(toValue);
    } else {
      Animated.spring(progressBarWidth, {
        toValue,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [lessons, progress, progressBarWidth, dataSaverEnabled]);

  const getItemLayout = useCallback(
    (_: ArrayLike<Lesson> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  const handleMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (index < 0 || index >= lessons.length || index === currentIndex) return;

      setCurrentIndex(index);
      onLessonChange(lessons[index].id, index);
    },
    [currentIndex, lessons, onLessonChange]
  );

  const currentLesson = lessons[currentIndex];

  const renderItem = useCallback(
    ({ item }: { item: Lesson }) => (
      <View style={[styles.lessonContainer, { width: SCREEN_WIDTH }]}>
        <View style={styles.lessonContent}>{renderLessonContent(item)}</View>
      </View>
    ),
    [renderLessonContent]
  );

  if (lessons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lessons available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="LessonCarousel">
      <View style={[styles.progressBarContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={{ width: progressBarWidth, height: '100%' }}>
          {shouldDisableHeavyEffects ? (
            <View style={[styles.progressBarGradient, { backgroundColor: colors.accent }]} />
          ) : (
            <LinearGradient
              colors={[colors.accent, '#2c8aec', '#586ce9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBarGradient}
            />
          )}
        </Animated.View>
      </View>

      <View style={[styles.indicatorsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.indicatorsRow}>
          {lessons.map((lesson, index) => {
            const isCompleted = progress?.lessons[lesson.id]?.completed;
            const isCurrent = index === currentIndex;

            return (
              <View
                key={lesson.id}
                accessibilityRole="button"
                accessibilityLabel={`Lesson ${index + 1}: ${lesson.title}${isCompleted ? ', completed' : ''}${isCurrent ? ', current' : ''}`}
                style={[
                  styles.indicator,
                  isCurrent && [styles.indicatorCurrent, { backgroundColor: colors.accent }],
                  isCompleted && !isCurrent && [styles.indicatorCompleted, { backgroundColor: '#10b981' }],
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.indicatorText, { color: colors.secondary }]}>
          {currentIndex + 1} / {lessons.length}
        </Text>
      </View>

      <View style={[styles.titleContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.titleText, { color: colors.primary }]}>{currentLesson.title}</Text>
        {progress?.lessons[currentLesson.id]?.completed && (
          <View style={styles.completedBadge}>
            <View style={[styles.completedDot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.completedText, { color: '#10b981' }]}>✓ Completed</Text>
          </View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={lessons}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        getItemLayout={getItemLayout}
        windowSize={3}
        maxToRenderPerBatch={1}
        initialNumToRender={1}
        removeClippedSubviews
        testID="LessonCarouselList"
      />

      <View style={[styles.navigationContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            if (currentIndex === 0) return;
            const nextIndex = currentIndex - 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: !dataSaverEnabled });
            setCurrentIndex(nextIndex);
            onLessonChange(lessons[nextIndex].id, nextIndex);
          }}
          disabled={currentIndex === 0}
          style={[
            styles.navButton,
            [styles.previousButton, { backgroundColor: colors.background, borderColor: colors.border }],
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Previous lesson"
          accessibilityHint="Go to the previous lesson"
          accessibilityState={{ disabled: currentIndex === 0 }}
        >
          <Text style={[styles.navButtonText, { color: colors.primary }, currentIndex === 0 && styles.navButtonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        {currentIndex === lessons.length - 1 ? (
          <TouchableOpacity onPress={onLastLessonNext} style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel={isLastLessonInSection ? 'Continue' : 'Next lesson'}
            accessibilityHint={isLastLessonInSection ? 'Continue to next section' : 'Go to the next lesson'}
          >
            {shouldDisableHeavyEffects ? (
              <View style={[styles.nextButtonGradient, { backgroundColor: colors.accent }]}>
                <Text style={[styles.nextButtonText, { color: '#ffffff' }]}>
                  {isLastLessonInSection ? 'Continue →' : 'Next →'}
                </Text>
              </View>
            ) : (
              <LinearGradient
                colors={[colors.accent, '#2c8aec', '#586ce9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={[styles.nextButtonText, { color: '#ffffff' }]}>
                  {isLastLessonInSection ? 'Continue →' : 'Next →'}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              const nextIndex = currentIndex + 1;
              if (nextIndex >= lessons.length) return;
              flatListRef.current?.scrollToIndex({ index: nextIndex, animated: !dataSaverEnabled });
              setCurrentIndex(nextIndex);
              onLessonChange(lessons[nextIndex].id, nextIndex);
            }}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Next lesson"
            accessibilityHint="Go to the next lesson"
          >
            {shouldDisableHeavyEffects ? (
              <View style={[styles.nextButtonGradient, { backgroundColor: colors.accent }]}>
                <Text style={[styles.nextButtonText, { color: '#ffffff' }]}>Next →</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[colors.accent, '#2c8aec', '#586ce9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={[styles.nextButtonText, { color: '#ffffff' }]}>Next →</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    overflow: 'hidden',
  },
  progressBarGradient: {
    height: '100%',
    width: '100%',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  indicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  indicatorCurrent: {
    width: 32,
    height: 10,
    borderRadius: 5,
  },
  indicatorCompleted: {
  },
  indicatorText: {
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  completedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonContainer: {
    flex: 1,
  },
  lessonContent: {
    padding: 16,
    paddingBottom: 32,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  previousButton: {
    borderWidth: 1,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default LessonCarousel;
