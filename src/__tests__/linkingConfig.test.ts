import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

import { linking, buildScreenUrl, setDeepLinkAnalyticsHandler } from '../navigation/linking';
import { NotificationType } from '../types/notifications';

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    infoSync: jest.fn(),
    warnSync: jest.fn(),
    errorSync: jest.fn(),
    debugSync: jest.fn(),
  },
}));

jest.mock('expo-notifications', () => ({
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `teachlink://${path}`),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

beforeEach(() => {
  jest.clearAllMocks();
  setDeepLinkAnalyticsHandler(null);
});

describe('linking config', () => {
  describe('prefixes', () => {
    it('includes the custom scheme and web URLs', () => {
      expect(linking.prefixes).toContain('teachlink://');
      expect(linking.prefixes).toContain('https://teachlink.com');
      expect(linking.prefixes).toContain('https://www.teachlink.com');
    });
  });

  describe('getInitialURL', () => {
    it('returns null when no notification and no external URL', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);
      (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

      const url = await linking.getInitialURL!();
      expect(url).toBeNull();
    });

    it('returns notification deep link when notification response exists', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue({
        notification: {
          request: {
            content: {
              data: {
                type: NotificationType.COURSE_UPDATE,
                courseId: '456',
              },
            },
          },
        },
      });

      const url = await linking.getInitialURL!();
      expect(url).toBe('teachlink://course/456');
    });

    it('returns external URL when no notification response', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);
      (Linking.getInitialURL as jest.Mock).mockResolvedValue('teachlink://messages/789');

      const url = await linking.getInitialURL!();
      expect(url).toBe('teachlink://messages/789');
    });

    it('handles malformed notification data gracefully', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue({
        notification: {
          request: {
            content: {
              data: null,
            },
          },
        },
      });
      (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

      const url = await linking.getInitialURL!();
      expect(url).toBeNull();
    });

    it('handles notification with missing type field', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue({
        notification: {
          request: {
            content: {
              data: { courseId: '999' },
            },
          },
        },
      });
      (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

      const url = await linking.getInitialURL!();
      expect(url).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('returns a cleanup function', () => {
      const cleanup = linking.subscribe!(jest.fn());
      expect(typeof cleanup).toBe('function');
    });

    it('calls listener when linking event fires', () => {
      const listener = jest.fn();
      const urlHandler = jest.fn();

      (Linking.addEventListener as jest.Mock).mockImplementation((_event: string, handler: any) => {
        urlHandler.mockImplementation(handler);
        return { remove: jest.fn() };
      });

      const cleanup = linking.subscribe!(listener);
      urlHandler({ url: 'teachlink://course/123' });

      expect(listener).toHaveBeenCalledWith('teachlink://course/123');
      cleanup();
    });

    it('calls listener when notification response is received', () => {
      const listener = jest.fn();
      const responseHandler = jest.fn();

      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (handler: any) => {
          responseHandler.mockImplementation(handler);
          return { remove: jest.fn() };
        }
      );

      const cleanup = linking.subscribe!(listener);
      responseHandler({
        notification: {
          request: {
            content: {
              data: {
                type: NotificationType.MESSAGE,
                conversationId: 'conv-42',
              },
            },
          },
        },
      });

      expect(listener).toHaveBeenCalledWith('teachlink://messages/conv-42');
      cleanup();
    });

    it('calls listener for foreground notifications', () => {
      const listener = jest.fn();
      const foregroundHandler = jest.fn();

      (Notifications.addNotificationReceivedListener as jest.Mock).mockImplementation(
        (handler: any) => {
          foregroundHandler.mockImplementation(handler);
          return { remove: jest.fn() };
        }
      );

      const cleanup = linking.subscribe!(listener);
      foregroundHandler({
        request: {
          content: {
            data: {
              type: NotificationType.LEARNING_REMINDER,
            },
          },
        },
      } as any);

      expect(listener).toHaveBeenCalledWith('teachlink://learn');
      cleanup();
    });
  });
});

describe('buildScreenUrl', () => {
  it('builds URL for CourseDetail with courseId', () => {
    const url = buildScreenUrl('CourseDetail', { courseId: '123' });
    expect(url).toBe('teachlink://course/123');
  });

  it('builds URL for Chat with conversationId', () => {
    const url = buildScreenUrl('Chat', { conversationId: 'conv-789' });
    expect(url).toBe('teachlink://messages/conv-789');
  });

  it('builds URL for AchievementDetail', () => {
    const url = buildScreenUrl('AchievementDetail', { achievementId: 'ach-1' });
    expect(url).toBe('teachlink://achievements/ach-1');
  });

  it('builds URL for CommunityPost', () => {
    const url = buildScreenUrl('CommunityPost', { postId: 'post-5' });
    expect(url).toBe('teachlink://community/post-5');
  });

  it('builds URL for tab screens without params', () => {
    expect(buildScreenUrl('Home')).toBe('teachlink://');
    expect(buildScreenUrl('Courses')).toBe('teachlink://courses');
    expect(buildScreenUrl('Messages')).toBe('teachlink://messages');
    expect(buildScreenUrl('Learning')).toBe('teachlink://learn');
    expect(buildScreenUrl('Community')).toBe('teachlink://community');
    expect(buildScreenUrl('Settings')).toBe('teachlink://settings');
  });

  it('encodes special characters in params', () => {
    const url = buildScreenUrl('CourseDetail', { courseId: 'a b&c=d' });
    expect(url).toBe('teachlink://course/a%20b%26c%3Dd');
  });

  it('does not crash with XSS payload in params', () => {
    const url = buildScreenUrl('CourseDetail', { courseId: '<script>alert(1)</script>' });
    expect(url).toContain('teachlink://course/');
    expect(url).not.toContain('<script>');
  });

  it('handles empty string param value', () => {
    const url = buildScreenUrl('CourseDetail', { courseId: '' });
    expect(url).toBe('teachlink://course/');
  });
});
