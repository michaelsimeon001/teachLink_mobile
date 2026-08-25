import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearCache,
  fetchWithSWR,
  getCache,
  getCacheStats,
  getCacheStatus,
  invalidateCacheByDataVersion,
  invalidateCacheByTags,
  invalidateCacheForBatchRequests,
  invalidateCacheForMutation,
  resetCacheStats,
  setCache,
  setMaxCacheSize,
} from '../../../services/api/cache';

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const DEFAULT_MAX_CACHE_SIZE = 100 * 1024 * 1024;

beforeEach(() => {
  jest.clearAllMocks();
  mockedAsyncStorage.getAllKeys.mockResolvedValue([]);
  mockedAsyncStorage.getItem.mockResolvedValue(null);
  setMaxCacheSize(DEFAULT_MAX_CACHE_SIZE);
  clearCache();
  resetCacheStats();
});

describe('invalidateCacheByDataVersion', () => {
  it('removes entries matching the given data version', () => {
    setCache('key:a', 'data-a', 60_000, 300_000, 'v2');
    setCache('key:b', 'data-b', 60_000, 300_000, 'v2');
    setCache('key:c', 'data-c', 60_000, 300_000, 'v1');

    invalidateCacheByDataVersion('v2');

    expect(getCache('key:a')).toBeNull();
    expect(getCache('key:b')).toBeNull();
    expect(getCache('key:c')).toBe('data-c');
  });

  it('leaves all entries intact when no version matches', () => {
    setCache('key:x', 'data-x', 60_000, 300_000, 'v3');

    invalidateCacheByDataVersion('v99');

    expect(getCache('key:x')).toBe('data-x');
  });

  it('handles entries with no dataVersion without throwing', () => {
    setCache('key:unversioned', 'data', 60_000, 300_000);

    expect(() => invalidateCacheByDataVersion('v1')).not.toThrow();
    expect(getCache('key:unversioned')).toBe('data');
  });
});

describe('LRU cache eviction and stats', () => {
  it('evicts least recently used items when limit is reached', () => {
    // Set size limit to 500 bytes.
    // metadata is ~128 bytes. Key 'k1' is 2 bytes. Value 'v1' is 2 bytes.
    // Total size of k1 = 4 + 2*2 + 128 = 136 bytes.
    // 3 entries will fit (3 * 136 = 408 bytes), but 4 entries (544 bytes) will exceed 500 bytes.
    setMaxCacheSize(500);

    setCache('k1', 'val1', 60_000, 300_000);
    setCache('k2', 'val2', 60_000, 300_000);
    setCache('k3', 'val3', 60_000, 300_000);

    // Verify all 3 exist
    expect(getCache('k1')).toBe('val1');
    expect(getCache('k2')).toBe('val2');
    expect(getCache('k3')).toBe('val3');

    // Add 4th item. The reads above touched k1, k2, then k3, so the order is:
    // k1 (oldest), k2, k3 (newest).
    // k1 should be evicted.
    setCache('k4', 'val4', 60_000, 300_000);

    expect(getCache('k1')).toBeNull();
    expect(getCache('k2')).toBe('val2');
    expect(getCache('k3')).toBe('val3');
    expect(getCache('k4')).toBe('val4');
  });

  it('preserves frequently-read entries over rarely-read ones during eviction', () => {
    setMaxCacheSize(500);

    setCache('read-heavy', 'val1', 60_000, 300_000);
    setCache('write-only', 'val2', 60_000, 300_000);

    // Read the read-heavy entry many times to promote it
    for (let i = 0; i < 5; i++) {
      getCache('read-heavy');
    }

    // Add a new entry to trigger eviction
    setCache('new-entry', 'val3', 60_000, 300_000);

    // write-only should be evicted since read-heavy was accessed more recently
    expect(getCache('read-heavy')).toBe('val1');
    expect(getCache('write-only')).toBeNull();
    expect(getCache('new-entry')).toBe('val3');
  });

  it('evicts non-critical entries before critical ones', () => {
    setMaxCacheSize(500);

    setCache('critical-entry', 'val1', 60_000, 300_000, { critical: true });
    setCache('normal-entry', 'val2', 60_000, 300_000, { critical: false });

    // Add entries to force eviction
    setCache('extra1', 'val3', 60_000, 300_000);
    setCache('extra2', 'val4', 60_000, 300_000);

    // Critical entry should survive
    expect(getCache('critical-entry')).toBe('val1');
  });

  it('tracks eviction stats', () => {
    resetCacheStats();
    setMaxCacheSize(500);

    setCache('k1', 'val1', 60_000, 300_000);
    setCache('k2', 'val2', 60_000, 300_000);
    setCache('k3', 'val3', 60_000, 300_000);
    setCache('k4', 'val4', 60_000, 300_000); // should trigger eviction

    const stats = getCacheStats();
    expect(stats.evictions).toBeGreaterThan(0);
  });

  it('correctly tracks hits and misses stats', () => {
    resetCacheStats();

    // Miss
    expect(getCache('non_existent')).toBeNull();
    let stats = getCacheStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0);

    // Hit
    setCache('k1', 'val1', 60_000, 300_000);
    expect(getCache('k1')).toBe('val1');

    stats = getCacheStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.5);

    // Reset stats
    resetCacheStats();
    stats = getCacheStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.hitRate).toBe(0);
  });
});

describe('three-tier cache behavior', () => {
  it('keeps sensitive entries in memory without persisting them', async () => {
    setCache('users:u1', { id: 'u1', name: 'Ada' }, 60_000, 300_000, {
      dataType: 'user-profile',
      tags: ['users', 'user:u1'],
      critical: true,
      persist: true,
      sensitive: true,
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();
    expect(getCache('users:u1')).toEqual({ id: 'u1', name: 'Ada' });
  });

  it('persists allowlisted course entries by default', async () => {
    setCache('courses:course-1', { id: 'course-1', title: 'Math' }, 60_000, 300_000);

    await Promise.resolve();
    await Promise.resolve();

    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      '@teachlink/api-cache:courses%3Acourse-1',
      expect.any(String)
    );
  });

  it('hydrates from AsyncStorage before hitting the network', async () => {
    mockedAsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({
        schemaVersion: 1,
        key: 'users:u1',
        entry: {
          data: { id: 'u1', name: 'Grace' },
          cachedAt: Date.now(),
          ttl: 60_000,
          staleTtl: 300_000,
          tags: ['users', 'user:u1'],
          dataType: 'user-profile',
          critical: true,
          persist: false,
          sensitive: true,
          sizeBytes: 180,
        },
      })
    );

    const fetcher = jest.fn().mockResolvedValue({ id: 'u1', name: 'Network' });

    const result = await fetchWithSWR('users:u1', fetcher, 60_000, 300_000, {
      tags: ['users', 'user:u1'],
      dataType: 'user-profile',
    });

    expect(result).toEqual({ id: 'u1', name: 'Grace' });
    expect(fetcher).not.toHaveBeenCalled();
    expect(getCacheStats()).toMatchObject({
      hits: 1,
      misses: 0,
      storageHits: 1,
      networkFetches: 0,
    });
  });

  it('records a network fetch when both local tiers miss', async () => {
    const fetcher = jest.fn().mockResolvedValue({ id: 'course-1' });

    const result = await fetchWithSWR('courses:course-1', fetcher, 60_000, 300_000, {
      tags: ['courses', 'course:course-1'],
      dataType: 'course-detail',
    });

    expect(result).toEqual({ id: 'course-1' });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(getCacheStats()).toMatchObject({
      hits: 0,
      misses: 1,
      networkFetches: 1,
    });
  });

  it('tracks revalidation state while stale data is being refreshed', async () => {
    setCache('users:u1', { id: 'u1', name: 'Ada' }, 60_000, 30_000);
    await new Promise(resolve => setTimeout(resolve, 5));

    const fetcher = jest
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 'u1', name: 'Grace' }), 10))
      );

    const responsePromise = fetchWithSWR('users:u1', fetcher, 1, 30_000);

    expect(getCacheStatus('users:u1')).toMatchObject({
      isCached: true,
      isStale: true,
      isRevalidating: true,
    });

    const response = await responsePromise;
    expect(response).toEqual({ id: 'u1', name: 'Ada' });
    await Promise.resolve();

    expect(getCacheStatus('users:u1')).toMatchObject({
      isCached: true,
      isStale: false,
      isRevalidating: false,
    });
  });

  it('invalidates memory entries by data tags', () => {
    setCache('courses:list', [{ id: 'c1' }], 60_000, 300_000, {
      tags: ['courses'],
      dataType: 'course-list',
    });
    setCache('users:u1', { id: 'u1' }, 60_000, 300_000, {
      tags: ['users', 'user:u1'],
      dataType: 'user-profile',
    });

    invalidateCacheByTags(['courses']);

    expect(getCache('courses:list')).toBeNull();
    expect(getCache('users:u1')).toEqual({ id: 'u1' });
  });

  it('maps direct course and user mutations to targeted invalidation tags', () => {
    setCache('courses:list', [{ id: 'c1' }], 60_000, 300_000, {
      tags: ['courses'],
      dataType: 'course-list',
    });
    setCache('users:u1', { id: 'u1' }, 60_000, 300_000, {
      tags: ['users', 'user:u1'],
      dataType: 'user-profile',
    });

    invalidateCacheForMutation('PUT', '/users/u1');

    expect(getCache('courses:list')).toEqual([{ id: 'c1' }]);
    expect(getCache('users:u1')).toBeNull();
  });

  it('does not invalidate read-only batch requests', () => {
    setCache('courses:list', [{ id: 'c1' }], 60_000, 300_000, {
      tags: ['courses'],
      dataType: 'course-list',
    });

    invalidateCacheForBatchRequests(JSON.stringify([{ method: 'GET', url: '/courses' }]));

    expect(getCache('courses:list')).toEqual([{ id: 'c1' }]);
  });

  it('invalidates only mutation operations inside a batch request', () => {
    setCache('courses:list', [{ id: 'c1' }], 60_000, 300_000, {
      tags: ['courses'],
      dataType: 'course-list',
    });
    setCache('users:u1', { id: 'u1' }, 60_000, 300_000, {
      tags: ['users', 'user:u1'],
      dataType: 'user-profile',
    });

    invalidateCacheForBatchRequests([
      { method: 'GET', url: '/courses' },
      { method: 'DELETE', url: '/users/u1' },
    ]);

    expect(getCache('courses:list')).toEqual([{ id: 'c1' }]);
    expect(getCache('users:u1')).toBeNull();
  });
});
