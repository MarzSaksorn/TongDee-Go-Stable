import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  AccentColor,
  AccentTheme,
  DEFAULT_ACCENT,
  DEFAULT_CUSTOM_COLOR,
  getAccentTheme,
  isValidHexColor
} from "./accentThemes";

export type UIScale = "compact" | "normal" | "comfortable";

interface AppearanceContextValue {
  accent: AccentColor;
  customPrimaryColor: string;
  useCustomPrimaryColor: boolean;
  uiScale: UIScale;
  darkMode: boolean;
  theme: AccentTheme;

  setAccent: (accent: AccentColor) => Promise<void>;
  setCustomPrimaryColor: (hex: string) => Promise<void>;
  setUseCustomPrimaryColor: (enabled: boolean) => Promise<void>;
  setUiScale: (scale: UIScale) => Promise<void>;
  setDarkMode: (val: boolean) => Promise<void>;
  resetAppearance: () => Promise<void>;
}

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

function applyThemeVariables(theme: AccentTheme, scale: UIScale, darkMode: boolean) {
  const root = document.documentElement;

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-foreground", "#FFFFFF");
  root.style.setProperty("--ring", theme.primary);
  root.style.setProperty("--chart-1", theme.primary);
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty("--sidebar-ring", theme.primary);

  root.dataset.uiScale = scale;
  root.style.setProperty("--app-ui-scale-mode", scale);

  root.classList.toggle("dark", darkMode);
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem("tongdee_primary_accent") as AccentColor | null;
    return saved || DEFAULT_ACCENT;
  });

  const [customPrimaryColor, setCustomPrimaryColorState] = useState<string>(() => {
    const saved = localStorage.getItem("tongdee_custom_primary_color");
    return saved && isValidHexColor(saved) ? saved : DEFAULT_CUSTOM_COLOR;
  });

  const [useCustomPrimaryColor, setUseCustomPrimaryColorState] = useState<boolean>(() => {
    const saved = localStorage.getItem("tongdee_use_custom_primary_color");
    return saved === "true";
  });

  const [uiScale, setUiScaleState] = useState<UIScale>(() => {
    const saved = localStorage.getItem("tongdee_ui_scale") as UIScale | null;
    return saved || "compact"; // Default should be compact
  });

  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem("tongdee_dark_mode") === "true";
  });

  const theme = useMemo(() => {
    return getAccentTheme(accent, customPrimaryColor, useCustomPrimaryColor);
  }, [accent, customPrimaryColor, useCustomPrimaryColor]);

  // Synchronously apply theme state variations on render/re-evaluation
  useEffect(() => {
    applyThemeVariables(theme, uiScale, darkMode);
  }, [theme, uiScale, darkMode]);

  const pendingUpdatesRef = React.useRef<any>({});
  const dbTimeoutRef = React.useRef<any>(null);

  // Fetch loaded user_settings on mount
  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        // Safe defaults and/or fallback localStorage
        const savedAccent = localStorage.getItem("tongdee_primary_accent") as AccentColor | null;
        const nextAccent = savedAccent || DEFAULT_ACCENT;

        const savedCustom = localStorage.getItem("tongdee_custom_primary_color");
        const nextCustom = savedCustom && isValidHexColor(savedCustom) ? savedCustom : DEFAULT_CUSTOM_COLOR;

        const savedUseCustom = localStorage.getItem("tongdee_use_custom_primary_color") === "true";

        const savedScale = localStorage.getItem("tongdee_ui_scale") as UIScale | null;
        const nextScale = savedScale || "compact";

        const savedDark = localStorage.getItem("tongdee_dark_mode") === "true";

        if (mounted) {
          setAccentState(nextAccent);
          setCustomPrimaryColorState(nextCustom);
          setUseCustomPrimaryColorState(savedUseCustom);
          setUiScaleState(nextScale);
          setDarkModeState(savedDark);
        }
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("primary_accent, custom_primary_color, use_custom_primary_color, ui_scale, compact_mode")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading user settings from Supabase:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        return;
      }

      if (data && mounted) {
        const dbAccent = (data.primary_accent || DEFAULT_ACCENT) as AccentColor;
        const dbCustomColor = data.custom_primary_color && isValidHexColor(data.custom_primary_color)
          ? data.custom_primary_color
          : DEFAULT_CUSTOM_COLOR;
        const dbUseCustom = data.use_custom_primary_color ?? false;

        let dbScale: UIScale = "compact";
        if (data.ui_scale) {
          dbScale = data.ui_scale as UIScale;
        } else if (data.compact_mode === true) {
          dbScale = "compact";
        } else if (data.compact_mode === false) {
          dbScale = "normal";
        }

        const dbDarkMode = localStorage.getItem("tongdee_dark_mode") === "true";

        setAccentState(dbAccent);
        setCustomPrimaryColorState(dbCustomColor);
        setUseCustomPrimaryColorState(dbUseCustom);
        setUiScaleState(dbScale);
        setDarkModeState(dbDarkMode);

        // Update local cache
        localStorage.setItem("tongdee_primary_accent", dbAccent);
        localStorage.setItem("tongdee_custom_primary_color", dbCustomColor);
        localStorage.setItem("tongdee_use_custom_primary_color", String(dbUseCustom));
        localStorage.setItem("tongdee_ui_scale", dbScale);
        localStorage.setItem("tongdee_dark_mode", String(dbDarkMode));
      }
    }

    loadSettings();

    return () => {
      mounted = false;
      if (dbTimeoutRef.current) {
        clearTimeout(dbTimeoutRef.current);
      }
    };
  }, []);

  const saveToDatabase = async (updates: {
    primary_accent?: AccentColor;
    custom_primary_color?: string;
    use_custom_primary_color?: boolean;
    ui_scale?: UIScale;
    compact_mode?: boolean;
  }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id"
      });

    if (error) {
      console.error("Failed to save appearance settings to Supabase:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      throw error;
    }
  };

  const debouncedSaveToDatabase = async (updates: any) => {
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    };

    if (dbTimeoutRef.current) {
      clearTimeout(dbTimeoutRef.current);
    }

    dbTimeoutRef.current = setTimeout(async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) return;

      const currentUpdates = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};

      try {
        await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            ...currentUpdates,
            updated_at: new Date().toISOString()
          }, {
            onConflict: "user_id"
          });
      } catch (err) {
        console.error("Failed debounced save to Supabase:", err);
      }
    }, 600);
  };

  const setAccent = async (nextAccent: AccentColor) => {
    setAccentState(nextAccent);
    localStorage.setItem("tongdee_primary_accent", nextAccent);

    // If a preset accent color is selected, we automatically disable custom color mode, except when set to custom
    const isCustom = nextAccent === "custom";
    setUseCustomPrimaryColorState(isCustom);
    localStorage.setItem("tongdee_use_custom_primary_color", String(isCustom));

    try {
      await saveToDatabase({
        primary_accent: nextAccent,
        use_custom_primary_color: isCustom
      });
    } catch (err) {
      // Keep local state but propogate error for warning triggers if needed
      console.warn("Could not sync accent preset to online DB. Saving locally.");
    }
  };

  const setCustomPrimaryColor = async (hex: string) => {
    if (!isValidHexColor(hex)) return;
    setCustomPrimaryColorState(hex);
    localStorage.setItem("tongdee_custom_primary_color", hex);

    try {
      await debouncedSaveToDatabase({
        custom_primary_color: hex
      });
    } catch (err) {
      console.warn("Could not sync custom color value to online DB.");
    }
  };

  const setUseCustomPrimaryColor = async (enabled: boolean) => {
    setUseCustomPrimaryColorState(enabled);
    localStorage.setItem("tongdee_use_custom_primary_color", String(enabled));

    let nextAccent = accent;
    if (enabled) {
      nextAccent = "custom";
      setAccentState("custom");
      localStorage.setItem("tongdee_primary_accent", "custom");
    } else {
      nextAccent = "blue";
      setAccentState("blue");
      localStorage.setItem("tongdee_primary_accent", "blue");
    }

    try {
      await saveToDatabase({
        primary_accent: nextAccent,
        use_custom_primary_color: enabled
      });
    } catch (err) {
      console.warn("Could not sync custom color toggle to online DB.");
    }
  };

  const setUiScale = async (nextScale: UIScale) => {
    setUiScaleState(nextScale);
    localStorage.setItem("tongdee_ui_scale", nextScale);

    try {
      await saveToDatabase({
        ui_scale: nextScale,
        compact_mode: nextScale === "compact"
      });
    } catch (err) {
      console.warn("Could not sync UI scale selection to online DB.");
    }
  };

  const setDarkMode = async (nextDarkMode: boolean) => {
    setDarkModeState(nextDarkMode);
    localStorage.setItem("tongdee_dark_mode", String(nextDarkMode));
  };

  const resetAppearance = async () => {
    setAccentState("blue");
    setCustomPrimaryColorState(DEFAULT_CUSTOM_COLOR);
    setUseCustomPrimaryColorState(false);
    setUiScaleState("compact");
    setDarkModeState(false);

    localStorage.setItem("tongdee_primary_accent", "blue");
    localStorage.setItem("tongdee_custom_primary_color", DEFAULT_CUSTOM_COLOR);
    localStorage.setItem("tongdee_use_custom_primary_color", "false");
    localStorage.setItem("tongdee_ui_scale", "compact");
    localStorage.setItem("tongdee_dark_mode", "false");

    try {
      await saveToDatabase({
        primary_accent: "blue",
        custom_primary_color: DEFAULT_CUSTOM_COLOR,
        use_custom_primary_color: false,
        ui_scale: "compact",
        compact_mode: true
      });
    } catch (err) {
      console.warn("Could not sync format resets to online DB.");
    }
  };

  return (
    <AppearanceContext.Provider
      value={{
        accent,
        customPrimaryColor,
        useCustomPrimaryColor,
        uiScale,
        darkMode,
        theme,
        setAccent,
        setCustomPrimaryColor,
        setUseCustomPrimaryColor,
        setUiScale,
        setDarkMode,
        resetAppearance
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used inside AppearanceProvider");
  }
  return ctx;
}
