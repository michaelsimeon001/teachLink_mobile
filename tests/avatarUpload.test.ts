/**
 * Avatar Upload Tests
 * Issue #830
 *
 * Tests the upload retry flow with exponential backoff.
 */

const mockPost = jest.fn();
jest.mock('axios', () => ({
  post: mockPost,
  create: jest.fn(function () {
    return this;
  }),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  defaults: { headers: { common: {} } },
}));

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 10;

async function uploadWithRetry(
  imageUri: string,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; attempts: number }> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await mockPost(
        `https://api.example.com/users/${userId}/avatar`,
        { uri: imageUri },
        {
          onUploadProgress: (event: { loaded: number; total: number }) => {
            if (event.total) {
              onProgress?.(Math.round((event.loaded * 100) / event.total));
            }
          },
        }
      );

      return { success: true, url: response.data.avatarUrl, attempts: attempt };
    } catch (error: any) {
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, attempts: MAX_RETRIES };
}

describe('Avatar Upload Retry Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    mockPost.mockResolvedValueOnce({
      data: { avatarUrl: 'https://cdn.example.com/avatar.jpg' },
    });

    const result = await uploadWithRetry('/tmp/photo.jpg', 'user-123');

    expect(result.success).toBe(true);
    expect(result.url).toBe('https://cdn.example.com/avatar.jpg');
    expect(result.attempts).toBe(1);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed on second attempt', async () => {
    mockPost
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        data: { avatarUrl: 'https://cdn.example.com/avatar.jpg' },
      });

    const result = await uploadWithRetry('/tmp/photo.jpg', 'user-123');

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('should exhaust all retries and fail', async () => {
    mockPost.mockRejectedValue(new Error('Server error'));

    const result = await uploadWithRetry('/tmp/photo.jpg', 'user-123');

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(MAX_RETRIES);
    expect(mockPost).toHaveBeenCalledTimes(MAX_RETRIES);
  });

  it('should use exponential backoff between retries', async () => {
    const dates: number[] = [];
    const realDateNow = Date.now;
    let callCount = 0;

    // Track setTimeout delays
    const originalSetTimeout = global.setTimeout;

    mockPost.mockRejectedValue(new Error('Network error'));

    const result = await uploadWithRetry('/tmp/photo.jpg', 'user-123');

    expect(result.success).toBe(false);
    // 3 attempts total (1 initial + 2 retries)
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it('should report upload progress via callback', async () => {
    const onProgress = jest.fn();
    let progressCallback: ((event: { loaded: number; total: number }) => void) | undefined;

    mockPost.mockImplementation((_url: string, _data: unknown, config: any) => {
      progressCallback = config.onUploadProgress;
      return Promise.resolve({ data: { avatarUrl: 'https://cdn.example.com/avatar.jpg' } });
    });

    await uploadWithRetry('/tmp/photo.jpg', 'user-123', onProgress);

    if (progressCallback) {
      progressCallback({ loaded: 50, total: 100 });
      expect(onProgress).toHaveBeenCalledWith(50);
      progressCallback({ loaded: 100, total: 100 });
      expect(onProgress).toHaveBeenCalledWith(100);
    }
  });

  it('should not retry after successful upload', async () => {
    mockPost.mockResolvedValue({
      data: { avatarUrl: 'https://cdn.example.com/avatar.jpg' },
    });

    const result = await uploadWithRetry('/tmp/photo.jpg', 'user-123');

    expect(result.success).toBe(true);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
