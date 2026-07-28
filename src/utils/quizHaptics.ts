import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
} from 'expo-haptics';
import { AccessibilityInfo } from 'react-native';

/**
 * #835: haptic feedback for quiz answers and achievement unlocks.
 *
 * Both helpers respect the OS "Reduce Motion" accessibility setting — when it
 * is enabled, no haptic is triggered. Failures are swallowed so haptics never
 * interrupt the learning flow.
 */

async function reduceMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
}

/** Medium impact when a quiz answer is selected. */
export async function quizAnswerHaptic(): Promise<void> {
  if (await reduceMotionEnabled()) return;
  impactAsync(ImpactFeedbackStyle.Medium).catch(() => {
    // Ignore haptic failures silently.
  });
}

/** Success notification when an achievement is unlocked. */
export async function achievementHaptic(): Promise<void> {
  if (await reduceMotionEnabled()) return;
  notificationAsync(NotificationFeedbackType.Success).catch(() => {
    // Ignore haptic failures silently.
  });
}
