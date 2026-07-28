/**
 * Location state store (#591)
 *
 * Centralised, in-memory store for the device's current coordinates and
 * OS-level location permission state. Kept intentionally un-persisted so that
 * coordinates never survive an app restart (privacy) and are always re-derived
 * from a live, permission-checked GPS read.
 *
 * Access outside React (e.g. from services) via `useLocationStore.getState()`.
 */

import { create } from 'zustand';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  obtainedAt: string; // ISO timestamp
}

interface LocationState {
  coordinates: LocationCoordinates | null;
  permissionGranted: boolean;

  setCoordinates: (coordinates: LocationCoordinates | null) => void;
  setPermissionGranted: (granted: boolean) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>(set => ({
  coordinates: null,
  permissionGranted: false,

  setCoordinates: coordinates => set({ coordinates }),
  setPermissionGranted: permissionGranted => set({ permissionGranted }),
  clearLocation: () => set({ coordinates: null }),
}));
