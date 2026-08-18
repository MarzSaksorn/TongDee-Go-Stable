// Central screen registry — the single source of truth for screen metadata.
// Previously this was scattered across App.tsx (isRestorableScreen exclusion
// list, GUEST_SAFE_SCREENS, backMapping, getActiveTabIndex, nav-hidden list).
// Adding a screen = one entry here + one render branch in App.tsx.

export interface ScreenMeta {
  id: number;
  /** Bottom-nav tab index (0-4) or -1 when the screen has no tab. */
  tab: number;
  /** Whether the bottom nav bar renders on this screen. */
  showNav: boolean;
  /** Whether restoring this screen after a reload is safe. */
  restorable: boolean;
  /** Whether a guest may land on this screen after a session-expiry reload. */
  guestSafe: boolean;
  /** handleUniversalBack target when the history stack is empty. */
  backFallback: number;
}

export const SCREENS: Record<number, ScreenMeta> = {
  1:  { id: 1,  tab: -1, showNav: false, restorable: false, guestSafe: false, backFallback: 1 },  // Splash
  2:  { id: 2,  tab: -1, showNav: false, restorable: false, guestSafe: false, backFallback: 2 },  // Onboarding
  3:  { id: 3,  tab: -1, showNav: false, restorable: false, guestSafe: false, backFallback: 4 },  // (unused)
  4:  { id: 4,  tab: 0,  showNav: true,  restorable: true,  guestSafe: true,  backFallback: 4 },  // Home
  5:  { id: 5,  tab: 1,  showNav: true,  restorable: true,  guestSafe: true,  backFallback: 4 },  // AI Trip Planner
  6:  { id: 6,  tab: 1,  showNav: false, restorable: true,  guestSafe: false, backFallback: 5 },  // AI Route Result
  7:  { id: 7,  tab: -1, showNav: false, restorable: true,  guestSafe: true,  backFallback: 4 },  // Place Detail
  8:  { id: 8,  tab: 2,  showNav: true,  restorable: true,  guestSafe: true,  backFallback: 8 },  // Map
  9:  { id: 9,  tab: -1, showNav: true,  restorable: false, guestSafe: false, backFallback: 4 },  // (unused chat slot)
  10: { id: 10, tab: 4,  showNav: false, restorable: true,  guestSafe: true,  backFallback: 4 },  // Digital Passport
  11: { id: 11, tab: 4,  showNav: true,  restorable: true,  guestSafe: false, backFallback: 4 },  // Safety Mode
  12: { id: 12, tab: 4,  showNav: true,  restorable: true,  guestSafe: true,  backFallback: 12 }, // Profile
  13: { id: 13, tab: 4,  showNav: false, restorable: true,  guestSafe: true,  backFallback: 10 }, // QR Check-in
  14: { id: 14, tab: 1,  showNav: false, restorable: true,  guestSafe: true,  backFallback: 10 }, // Travel Diary
  15: { id: 15, tab: -1, showNav: false, restorable: true,  guestSafe: false, backFallback: 16 }, // Local Shop Detail
  16: { id: 16, tab: 1,  showNav: false, restorable: true,  guestSafe: true,  backFallback: 4 },  // Trip Detail Plan
  17: { id: 17, tab: -1, showNav: false, restorable: false, guestSafe: false, backFallback: 2 },  // Welcome
  18: { id: 18, tab: -1, showNav: false, restorable: false, guestSafe: false, backFallback: 17 }, // Login
  19: { id: 19, tab: -1, showNav: false, restorable: false, guestSafe: false, backFallback: 17 }, // Register
  20: { id: 20, tab: -1, showNav: false, restorable: false, guestSafe: false, backFallback: 18 }, // Forgot password
  21: { id: 21, tab: 3,  showNav: true,  restorable: true,  guestSafe: true,  backFallback: 4 },  // Local Taxi
  22: { id: 22, tab: -1, showNav: false, restorable: true,  guestSafe: false, backFallback: 12 }, // Taxi Provider Register
  23: { id: 23, tab: -1, showNav: false, restorable: true,  guestSafe: true,  backFallback: 4 },  // Local Marketplace
  24: { id: 24, tab: -1, showNav: false, restorable: true,  guestSafe: false, backFallback: 12 }, // Marketplace Seller Register
  25: { id: 25, tab: 4,  showNav: true,  restorable: true,  guestSafe: false, backFallback: 12 }, // Appearance Settings
  26: { id: 26, tab: 0,  showNav: true,  restorable: true,  guestSafe: true,  backFallback: 4 },  // Weather
  27: { id: 27, tab: 1,  showNav: false, restorable: false, guestSafe: false, backFallback: 5 },  // Active Trip (in-memory tripPlan needed)
  28: { id: 28, tab: 4,  showNav: false, restorable: true,  guestSafe: false, backFallback: 12 }, // Accommodation Owner Register
  29: { id: 29, tab: 0,  showNav: true,  restorable: true,  guestSafe: true,  backFallback: 4 },  // Hotel Selection
  40: { id: 40, tab: 4,  showNav: false, restorable: true,  guestSafe: false, backFallback: 12 }, // Admin Panel
};

export function isGuestSafeScreen(screen: number): boolean {
  return SCREENS[screen]?.guestSafe ?? false;
}
