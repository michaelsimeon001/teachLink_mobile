import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import * as Network from 'expo-network';

import { requestQueue } from '../../services/api/requestQueue';

/**
 * #824: Persistent offline indicator banner.
 *
 * Appears within 500 ms of going offline and shows the number of queued
 * actions pending sync. Disappears automatically on reconnection.
 *
 * Usage:
 *   // In your root navigator or layout:
 *   <OfflineBanner />
 *   <RootNavigator />
 */
const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const slideAnim = useRef(new Animated.Value(-60)).current;

  // ── Network state subscription ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    // Poll network state every 500 ms — expo-network does not provide a
    // persistent event listener on all platforms, so polling is the safest
    // cross-platform approach.
    const interval = setInterval(async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const offline = !state.isConnected || !state.isInternetReachable;
        if (mounted) setIsOffline(offline);
      } catch {
        // Treat network-check failure as offline
        if (mounted) setIsOffline(true);
      }
    }, 500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Queue depth subscription ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = requestQueue.onPendingCountChange(count => {
      setPendingCount(count);
    });

    // Read initial count
    requestQueue.getPendingCount().then(count => setPendingCount(count));

    return unsubscribe;
  }, []);

  // ── Slide animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  const pendingText =
    pendingCount > 0
      ? `${pendingCount} action${pendingCount === 1 ? '' : 's'} pending sync`
      : 'No connection';

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={`Offline mode. ${pendingText}.`}
    >
      <View style={styles.inner}>
        <View style={styles.dot} />
        <Text style={styles.text}>
          {isOffline ? `Offline — ${pendingText}` : ''}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#D32F2F',
    paddingTop: 44, // Safe area top (status bar)
    paddingBottom: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFCDD2',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default OfflineBanner;
