/**
 * CRITICAL_ASSETS — images that must be preloaded during the splash-screen
 * phase (before the first meaningful paint) to avoid visible placeholder
 * flicker on first-time screen visits.
 *
 * Rules for inclusion:
 *  - Shown on the very first screen the user sees after login
 *  - Used as avatar / logo placeholders that would flash if loaded lazily
 *  - Appear in navigation tabs visible on every screen
 *
 * Use `Asset.loadAsync(CRITICAL_ASSETS)` inside the startup `Promise.all`
 * alongside font loading so that everything resolves before `SplashScreen.hideAsync()`.
 */
export const CRITICAL_ASSETS = [
  // App icon – used in splash, navigation header and share sheets
  require('../../assets/images/icon.png'),

  // Splash / loading screen graphic
  require('../../assets/images/splash-icon.png'),

  // Avatar placeholder shown before user profile data is fetched
  require('../../assets/images/ios-icon.png'),
] as const;
