import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarUploadProgressProps {
  progress: number;
  isVisible: boolean;
}

export const AvatarUploadProgress: React.FC<AvatarUploadProgressProps> = ({
  progress,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progress,
        text: `Upload progress: ${progress}%`,
      }}
      accessibilityLabel="Avatar upload progress"
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.text}>{progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#19c3e6',
    borderRadius: 2,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
