import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useDynamicFontSize } from '../../hooks/useDynamicFontSize';
import { useAppStore } from '../../store';
import { getColors } from '../../utils/colors';
import { Course } from '../../types/course';
import { AppText as Text } from '../common/AppText';
import BookmarkButton from "./BookmarkButton";

interface CourseHeaderProps {
  course: Course;
  overallProgress: number;
  isBookmarked: boolean;
  onBack?: () => void;
  onBookmarkToggle: () => void;
}

const CourseHeader = memo(
  ({ course, overallProgress, isBookmarked, onBack, onBookmarkToggle }: CourseHeaderProps) => {
    const { scale } = useDynamicFontSize();
    const theme = useAppStore(state => state.theme);
    const colors = getColors(theme);

    return (
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to the previous screen">
              <Text style={[styles.backButtonText, { color: colors.secondary }]}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
              {course.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>{overallProgress}% complete</Text>
          </View>
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={onBookmarkToggle}
            size="small"
            showLabel={false}
          />
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { height: scale(8), backgroundColor: colors.background }]}>
          <View style={[styles.progressBar, { width: `${overallProgress}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>
    );
  }
);

CourseHeader.displayName = 'CourseHeader';

export default CourseHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
});