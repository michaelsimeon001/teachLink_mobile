import { render } from '@testing-library/react-native';
import React from 'react';

import { CourseViewerSkeleton } from '../../src/components/mobile/CourseViewerSkeleton';
import { DataGridSkeleton } from '../../src/components/mobile/DataGridSkeleton';
import { QuizSkeleton } from '../../src/components/mobile/QuizSkeleton';
import { SettingsSkeleton } from '../../src/components/mobile/SettingsSkeleton';
import { SubscriptionSkeleton } from '../../src/components/mobile/SubscriptionSkeleton';

describe('CourseViewerSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<CourseViewerSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('contains skeleton elements', () => {
    const { toJSON } = render(<CourseViewerSkeleton />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Animated.View');
  });
});

describe('QuizSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<QuizSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('contains skeleton elements', () => {
    const { toJSON } = render(<QuizSkeleton />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Animated.View');
  });
});

describe('SettingsSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<SettingsSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('contains skeleton elements', () => {
    const { toJSON } = render(<SettingsSkeleton />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Animated.View');
  });
});

describe('SubscriptionSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<SubscriptionSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('contains skeleton elements', () => {
    const { toJSON } = render(<SubscriptionSkeleton />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Animated.View');
  });
});

describe('DataGridSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<DataGridSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('contains skeleton elements', () => {
    const { toJSON } = render(<DataGridSkeleton />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Animated.View');
  });

  it('produces deterministic widths across re-renders', () => {
    const { toJSON, rerender } = render(<DataGridSkeleton />);
    const first = JSON.stringify(toJSON());
    rerender(<DataGridSkeleton />);
    const second = JSON.stringify(toJSON());
    expect(first).toBe(second);
  });
});
