export const ROUTES = {
  SPLASH: "/",
  ONBOARDING: "/onboarding",
  AUTH: "/auth",
  HOME: "/home",
  PLAN: "/plan",
  PLAN_RESULT: "/plan/result",
  PLAN_DETAIL: "/plan/detail",
  PLAN_ACTIVE: "/plan/active",
  PLACE: "/place/:id",
  MAP: "/map",
  PASSPORT: "/passport",
  SAFETY: "/safety",
  QR: "/qr",
  DIARY: "/diary",
  SHOP: "/shop/:name",
  TAXI: "/taxi",
  TAXI_REGISTER: "/taxi/register",
  MARKETPLACE: "/marketplace",
  MARKETPLACE_REGISTER: "/marketplace/register",
  SETTINGS_APPEARANCE: "/settings/appearance",
  WEATHER: "/weather",
  ADMIN: "/admin",
  PROFILE: "/profile",
} as const;

const screenIdToPath: Record<number, string> = {
  1: ROUTES.SPLASH,
  2: ROUTES.ONBOARDING,
  4: ROUTES.HOME,
  5: ROUTES.PLAN,
  6: ROUTES.PLAN_RESULT,
  7: ROUTES.PLACE,
  8: ROUTES.MAP,
  10: ROUTES.PASSPORT,
  11: ROUTES.SAFETY,
  12: ROUTES.PROFILE,
  13: ROUTES.QR,
  14: ROUTES.DIARY,
  15: ROUTES.SHOP,
  16: ROUTES.PLAN_DETAIL,
  17: ROUTES.AUTH,
  18: ROUTES.AUTH,
  19: ROUTES.AUTH,
  20: ROUTES.AUTH,
  21: ROUTES.TAXI,
  22: ROUTES.TAXI_REGISTER,
  23: ROUTES.MARKETPLACE,
  24: ROUTES.MARKETPLACE_REGISTER,
  25: ROUTES.SETTINGS_APPEARANCE,
  26: ROUTES.WEATHER,
  27: ROUTES.PLAN_ACTIVE,
  40: ROUTES.ADMIN,
};

export function screenIdToRoute(id: number): string {
  return screenIdToPath[id] || ROUTES.HOME;
}

export function routeToScreenId(path: string): number | null {
  const exact: Record<string, number> = {
    [ROUTES.SPLASH]: 1,
    [ROUTES.ONBOARDING]: 2,
    [ROUTES.HOME]: 4,
    [ROUTES.PLAN]: 5,
    [ROUTES.PLAN_RESULT]: 6,
    [ROUTES.MAP]: 8,
    [ROUTES.PASSPORT]: 10,
    [ROUTES.SAFETY]: 11,
    [ROUTES.PROFILE]: 12,
    [ROUTES.QR]: 13,
    [ROUTES.DIARY]: 14,
    [ROUTES.PLAN_DETAIL]: 16,
    [ROUTES.AUTH]: 17,
    [ROUTES.TAXI]: 21,
    [ROUTES.TAXI_REGISTER]: 22,
    [ROUTES.MARKETPLACE]: 23,
    [ROUTES.MARKETPLACE_REGISTER]: 24,
    [ROUTES.SETTINGS_APPEARANCE]: 25,
    [ROUTES.WEATHER]: 26,
    [ROUTES.PLAN_ACTIVE]: 27,
    [ROUTES.ADMIN]: 40,
  };
  if (exact[path] !== undefined) return exact[path];
  if (path.startsWith("/place/")) return 7;
  if (path.startsWith("/shop/")) return 15;
  return null;
}

export function placeRoute(id: string): string {
  return `/place/${id}`;
}

export function shopRoute(name: string): string {
  return `/shop/${encodeURIComponent(name)}`;
}
