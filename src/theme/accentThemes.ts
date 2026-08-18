export type AccentColor =
  | "linear"
  | "blue"
  | "teal"
  | "emerald"
  | "orange"
  | "purple"
  | "rose"
  | "custom";

export interface AccentTheme {
  id: AccentColor;
  labelTh: string;
  labelEn: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  primaryLight: string;
  shadow: string;
}

export const PRESET_ACCENT_THEMES: AccentTheme[] = [
  {
    id: "linear",
    labelTh: "อินดิโก้โมเดิร์น",
    labelEn: "Linear Indigo",
    primary: "#5e6ad2",
    primaryDark: "#7170ff",
    primarySoft: "#eef0fa",
    primaryLight: "#f6f7fe",
    shadow: "rgba(94, 106, 210, 0.25)"
  },
  {
    id: "blue",
    labelTh: "น้ำเงินทองดี",
    labelEn: "Tongdee Blue",
    primary: "#1E5BFF",
    primaryDark: "#173FCC",
    primarySoft: "#DBEAFE",
    primaryLight: "#EFF6FF",
    shadow: "rgba(30, 91, 255, 0.30)"
  },
  {
    id: "teal",
    labelTh: "เขียวน้ำทะเล",
    labelEn: "Travel Teal",
    primary: "#14B8A6",
    primaryDark: "#0F766E",
    primarySoft: "#CCFBF1",
    primaryLight: "#F0FDFA",
    shadow: "rgba(20, 184, 166, 0.35)"
  },
  {
    id: "emerald",
    labelTh: "เขียวชุมชน",
    labelEn: "Community Green",
    primary: "#10B981",
    primaryDark: "#047857",
    primarySoft: "#D1FAE5",
    primaryLight: "#ECFDF5",
    shadow: "rgba(16, 185, 129, 0.32)"
  },
  {
    id: "orange",
    labelTh: "ส้ม OTOP",
    labelEn: "OTOP Orange",
    primary: "#F97316",
    primaryDark: "#C2410C",
    primarySoft: "#FFEDD5",
    primaryLight: "#FFF7ED",
    shadow: "rgba(249, 115, 22, 0.32)"
  },
  {
    id: "purple",
    labelTh: "ม่วงวัฒนธรรม",
    labelEn: "Heritage Purple",
    primary: "#8B5CF6",
    primaryDark: "#6D28D9",
    primarySoft: "#EDE9FE",
    primaryLight: "#F5F3FF",
    shadow: "rgba(139, 92, 246, 0.32)"
  },
  {
    id: "rose",
    labelTh: "ชมพูเทศกาล",
    labelEn: "Festival Rose",
    primary: "#F43F5E",
    primaryDark: "#BE123C",
    primarySoft: "#FFE4E6",
    primaryLight: "#FFF1F2",
    shadow: "rgba(244, 63, 94, 0.30)"
  }
];

export const DEFAULT_ACCENT: AccentColor = "blue";
export const DEFAULT_CUSTOM_COLOR = "#1E5BFF";

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

export function rgbaFromHex(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mixWithWhite(hex: string, amount = 0.9): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function darkenHex(hex: string, amount = 0.18): string {
  const { r, g, b } = hexToRgb(hex);
  const darken = (channel: number) => Math.max(0, Math.round(channel * (1 - amount)));
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
}

export function createCustomAccentTheme(hex: string): AccentTheme {
  const safeHex = isValidHexColor(hex) ? hex : DEFAULT_CUSTOM_COLOR;

  return {
    id: "custom",
    labelTh: "กำหนดเอง",
    labelEn: "Custom",
    primary: safeHex,
    primaryDark: darkenHex(safeHex, 0.22),
    primarySoft: mixWithWhite(safeHex, 0.82),
    primaryLight: mixWithWhite(safeHex, 0.92),
    shadow: rgbaFromHex(safeHex, 0.32)
  };
}

export function getAccentTheme(
  accent?: string,
  customColor?: string,
  useCustom?: boolean
): AccentTheme {
  if (useCustom || accent === "custom") {
    return createCustomAccentTheme(customColor || DEFAULT_CUSTOM_COLOR);
  }

  return (
    PRESET_ACCENT_THEMES.find((theme) => theme.id === accent) ||
    PRESET_ACCENT_THEMES[0]
  );
}
