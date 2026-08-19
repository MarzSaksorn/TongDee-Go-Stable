// Guest-mode persistence: account-gated features (check-ins, stamps,
// badges) work without an account by storing their data in localStorage.
// When the guest later signs in, App.tsx migrates this data to Supabase
// and clears the guest store.

const GUEST_CHECKINS_KEY = "tongdee_guest_checkins";
const GUEST_STAMPS_KEY = "tongdee_guest_stamps";
const GUEST_BADGES_KEY = "tongdee_guest_badges";

export interface GuestStamp {
  placeId: string;
  stampCode: string;
  collectedAt: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable or full — guest progress just won't persist.
  }
}

export function getGuestCheckins(): string[] {
  return read<string[]>(GUEST_CHECKINS_KEY, []);
}

export function addGuestCheckin(placeId: string): string[] {
  const next = Array.from(new Set([...getGuestCheckins(), placeId]));
  write(GUEST_CHECKINS_KEY, next);
  return next;
}

export function getGuestStamps(): GuestStamp[] {
  return read<GuestStamp[]>(GUEST_STAMPS_KEY, []);
}

export function addGuestStamp(placeId: string): GuestStamp[] {
  const stamp: GuestStamp = {
    placeId,
    stampCode: `STAMP_${placeId.toUpperCase()}`,
    collectedAt: new Date().toISOString(),
  };
  const next = [...getGuestStamps().filter((s) => s.placeId !== placeId), stamp];
  write(GUEST_STAMPS_KEY, next);
  return next;
}

export function getGuestBadges(): string[] {
  return read<string[]>(GUEST_BADGES_KEY, []);
}

export function addGuestBadge(badgeCode: string): string[] {
  const next = Array.from(new Set([...getGuestBadges(), badgeCode]));
  write(GUEST_BADGES_KEY, next);
  return next;
}

export function clearGuestData() {
  try {
    localStorage.removeItem(GUEST_CHECKINS_KEY);
    localStorage.removeItem(GUEST_STAMPS_KEY);
    localStorage.removeItem(GUEST_BADGES_KEY);
  } catch {
    // ignore
  }
}
