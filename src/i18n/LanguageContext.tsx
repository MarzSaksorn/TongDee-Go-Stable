import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, getTranslation } from "./translations";
import { supabase } from "../lib/supabaseClient";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("TH");
  const [userId, setUserId] = useState<string | null>(null);

  // Load language initially from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tongdee_language");
    if (saved === "EN" || saved === "TH") {
      setLanguageState(saved);
    }
  }, []);

  // Listen to Auth State changes in Supabase
  useEffect(() => {
    const fetchUserSettings = async (uId: string) => {
      try {
        // Fetch language setting
        const { data, error } = await supabase
          .from("user_settings")
          .select("language")
          .eq("user_id", uId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user settings language:", error);
          return;
        }

        if (data && (data.language === "TH" || data.language === "EN")) {
          setLanguageState(data.language as Language);
          localStorage.setItem("tongdee_language", data.language);
        } else {
          // If no row exists, create a default row in user_settings table
          await supabase.from("user_settings").insert({
            user_id: uId,
            language: "TH",
            safety_mode: true,
            compact_mode: false,
            notification_enabled: true,
            primary_accent: "blue",
            ui_scale: "compact"
          });
          setLanguageState("TH");
          localStorage.setItem("tongdee_language", "TH");
        }
      } catch (err) {
        console.error("Error loading language from Supabase:", err);
      }
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        fetchUserSettings(session.user.id);
      } else {
        setUserId(null);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchUserSettings(session.user.id);
      } else {
        setUserId(null);
        // On Sign-out, fall back to what's in local storage
        const saved = localStorage.getItem("tongdee_language");
        if (saved === "EN" || saved === "TH") {
          setLanguageState(saved);
        } else {
          setLanguageState("TH");
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const changeLanguage = async (newLang: Language) => {
    // 1. Update React state immediately
    setLanguageState(newLang);
    // 2. Save to localStorage
    localStorage.setItem("tongdee_language", newLang);

    // 3. Save to Supabase user_settings when user is logged in
    if (userId) {
      try {
        // First, check if settings row exists
        const { data, error } = await supabase
          .from("user_settings")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Update
          const { error: updateError } = await supabase
            .from("user_settings")
            .update({ language: newLang })
            .eq("user_id", userId);
          if (updateError) throw updateError;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from("user_settings")
            .insert({
              user_id: userId,
              language: newLang,
              safety_mode: true,
              compact_mode: false,
              notification_enabled: true
            });
          if (insertError) throw insertError;
        }
      } catch (e) {
        console.error("Failed to persist language to user_settings table:", e);
      }
    }
  };

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
