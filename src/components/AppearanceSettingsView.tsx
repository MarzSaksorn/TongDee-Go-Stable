import React, { useState, useEffect } from "react";
import { useAppearance } from "../theme/AppearanceContext";
import { PRESET_ACCENT_THEMES, isValidHexColor } from "../theme/accentThemes";
import {
  ChevronLeft,
  Palette,
  Sliders,
  Check,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppearanceSettingsViewProps {
  onBack: () => void;
  language?: "TH" | "EN";
}

export function AppearanceSettingsView({ onBack, language = "TH" }: AppearanceSettingsViewProps) {
  const {
    accent,
    customPrimaryColor,
    useCustomPrimaryColor,
    uiScale,
    setAccent,
    setCustomPrimaryColor,
    setUseCustomPrimaryColor,
    setUiScale,
    resetAppearance
  } = useAppearance();

  const [hexInput, setHexInput] = useState<string>(customPrimaryColor);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RGB helper functions
  function clampRgb(value: number): number {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function componentToHex(value: number): string {
    return clampRgb(value).toString(16).padStart(2, "0").toUpperCase();
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
  }

  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const safe = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#1E5BFF";
    return {
      r: parseInt(safe.slice(1, 3), 16),
      g: parseInt(safe.slice(3, 5), 16),
      b: parseInt(safe.slice(5, 7), 16)
    };
  }

  const initialRgb = hexToRgb(customPrimaryColor || "#1E5BFF");
  const [rgb, setRgb] = useState(initialRgb);

  useEffect(() => {
    const parsed = hexToRgb(customPrimaryColor || "#1E5BFF");
    setRgb(parsed);
    setHexInput(customPrimaryColor || "#1E5BFF");
  }, [customPrimaryColor]);

  const updateRgb = async (nextRgb: { r: number; g: number; b: number }) => {
    const safeRgb = {
      r: clampRgb(nextRgb.r),
      g: clampRgb(nextRgb.g),
      b: clampRgb(nextRgb.b)
    };

    setRgb(safeRgb);

    const hex = rgbToHex(safeRgb.r, safeRgb.g, safeRgb.b);
    setHexInput(hex);

    await setUseCustomPrimaryColor(true);
    await setAccent("custom");
    await setCustomPrimaryColor(hex);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleHexInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toUpperCase();
    setHexInput(value);

    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const nextRgb = hexToRgb(value);
      setRgb(nextRgb);
      await setUseCustomPrimaryColor(true);
      await setAccent("custom");
      await setCustomPrimaryColor(value);
      showToast(
        language === "TH"
          ? "เปลี่ยนโทนสีที่กำหนดเองแล้ว"
          : "Custom color updated"
      );
    }
  };

  const handlePresetSelect = async (presetId: string) => {
    try {
      await setUseCustomPrimaryColor(false);
      await setAccent(presetId as any);
      showToast(
        language === "TH"
          ? `เลือกธีม ${PRESET_ACCENT_THEMES.find(t => t.id === presetId)?.labelTh} สำเร็จ`
          : `Applied theme ${PRESET_ACCENT_THEMES.find(t => t.id === presetId)?.labelEn}`
      );
    } catch (err) {
      showToast(
        language === "TH"
          ? "เปลี่ยนสีสำเร็จ (เฉพาะเซสชันนี้)"
          : "Theme applied locally"
      );
    }
  };

  const handleScaleSelect = async (scaleId: "compact" | "normal" | "comfortable") => {
    try {
      await setUiScale(scaleId);
      showToast(
        language === "TH"
          ? "ปรับขนาดหน้าจอเรียบร้อย"
          : "Display size updated"
      );
    } catch (err) {
      showToast(
        language === "TH"
          ? "เปลี่ยนขนาดหน้าจอแล้ว"
          : "Display size updated locally"
      );
    }
  };

  const handleReset = async () => {
    try {
      await resetAppearance();
      setHexInput("#1E5BFF");
      setRgb(hexToRgb("#1E5BFF"));
      setShowResetConfirm(false);
      showToast(
        language === "TH"
          ? "รีเซ็ตรูปลักษณ์เป็นค่าเริ่มต้นแล้ว"
          : "Appearance settings reset to default"
      );
    } catch (err) {
      setHexInput("#1E5BFF");
      setRgb(hexToRgb("#1E5BFF"));
      setShowResetConfirm(false);
      showToast(
        language === "TH"
          ? "รีเซ็ตรูปลักษณ์แล้ว"
          : "Appearance settings reset locally"
      );
    }
  };

  const SCALE_OPTIONS = [
    {
      id: "compact",
      labelTh: "เล็ก",
      labelEn: "Small",
      descTh: "แสดงข้อมูลได้มากขึ้น",
      descEn: "Show more content"
    },
    {
      id: "normal",
      labelTh: "ปกติ",
      labelEn: "Normal",
      descTh: "สมดุล อ่านง่าย",
      descEn: "Balanced and readable"
    },
    {
      id: "comfortable",
      labelTh: "ใหญ่",
      labelEn: "Large",
      descTh: "อ่านง่าย กดง่ายขึ้น",
      descEn: "Easier to read and tap"
    }
  ];

  const RGB_CHANNELS = [
    { key: "r", label: "R", color: "bg-rose-500" },
    { key: "g", label: "G", color: "bg-emerald-500" },
    { key: "b", label: "B", color: "bg-blue-500" }
  ] as const;

  const colorMode = useCustomPrimaryColor ? "custom_rgb" : "preset";
  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);

  return (
    <div id="appearance-settings-view" className="flex flex-col h-full w-full bg-muted overflow-y-auto pb-[120px] animate-fade-in-up">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-foreground/90 text-background text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-card px-4 pt-6 pb-4 border-b border-border flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted cursor-pointer active:scale-95 transition-all text-foreground shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-foreground leading-none">
            {language === "TH" ? "รูปลักษณ์แอป" : "Appearance"}
          </h2>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {language === "TH"
              ? "สีแอป ขนาดหน้าจอ และรูปแบบการแสดงผล"
              : "App color, screen size, and appearance mode"}
          </p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 max-w-[480px] mx-auto w-full">
        <div className="rounded-xl bg-card p-4 border border-border flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground leading-tight">
                {language === "TH" ? "โหมดสี" : "Color Mode"}
              </h3>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-normal">
                {language === "TH"
                  ? "เลือกสีแอปจากชุดสีสำเร็จรูป หรือกำหนดเองด้วย RGB"
                  : "Choose a preset color or customize with RGB"}
              </p>
            </div>
          </div>

          {/* Mode Segmented Control */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            <button
              type="button"
              onClick={async () => {
                await setUseCustomPrimaryColor(false);
                if (accent === "custom") {
                  await setAccent("blue");
                }
              }}
              className={cn(
                "h-10 rounded-xl text-xs font-extrabold transition-all border-0 outline-none cursor-pointer flex items-center justify-center",
                colorMode === "preset"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground/70 hover:text-muted-foreground"
              )}
            >
              {language === "TH" ? "สีสำเร็จรูป" : "Preset"}
            </button>

            <button
              type="button"
              onClick={async () => {
                await setUseCustomPrimaryColor(true);
                await setAccent("custom");
              }}
              className={cn(
                "h-10 rounded-xl text-xs font-extrabold transition-all border-0 outline-none cursor-pointer flex items-center justify-center",
                colorMode === "custom_rgb"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground/70 hover:text-muted-foreground"
              )}
            >
              {language === "TH" ? "กำหนดเอง RGB" : "Custom RGB"}
            </button>
          </div>

          {/* Content conditional on colorMode */}
          {colorMode === "preset" ? (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-black tracking-wider text-muted-foreground/70 mb-1">
                {language === "TH" ? "เลือกชุดสีสำเร็จรูป" : "Choose Preset"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ACCENT_THEMES.map((theme) => {
                  const isSelected = accent === theme.id && !useCustomPrimaryColor;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handlePresetSelect(theme.id)}
                      className={cn(
                        "relative rounded-2xl border p-3 text-left transition-all active:scale-[0.98] cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border bg-muted text-foreground hover:bg-card"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center shrink-0"
                          style={{ backgroundColor: theme.primary }}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <span className="text-xs font-bold truncate">
                          {language === "TH" ? theme.labelTh : theme.labelEn}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-black tracking-wider text-muted-foreground/70 mb-1">
                {language === "TH" ? "ปรับค่าสี RGB" : "Adjust RGB"}
              </div>

              {/* RGB Sliders */}
              <div className="flex flex-col gap-2.5">
                {RGB_CHANNELS.map((channel) => (
                  <div key={channel.key} className="rounded-2xl bg-muted p-3 border border-border">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${channel.color}`} />
                        <span className="text-xs font-extrabold text-foreground">
                          {channel.label}
                        </span>
                      </div>

                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={rgb[channel.key]}
                        onChange={(e) => {
                          const value = clampRgb(Number(e.target.value));
                          updateRgb({ ...rgb, [channel.key]: value });
                        }}
                        className="h-8 w-16 rounded-lg border border-border bg-card text-center text-xs font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb[channel.key]}
                      onChange={(e) => {
                        const value = clampRgb(Number(e.target.value));
                        updateRgb({ ...rgb, [channel.key]: value });
                      }}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Hex Input */}
              <div className="rounded-2xl bg-muted p-3 border border-border flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-muted-foreground">
                  {language === "TH" ? "รหัสพิกเซลสีหลัก (HEX)" : "Hex Color"}
                </span>
                <Input
                  type="text"
                  value={hexInput}
                  maxLength={7}
                  onChange={handleHexInputChange}
                  placeholder="#1E5BFF"
                  className={cn(
                    "h-11 font-mono font-bold",
                    !isValidHexColor(hexInput)
                      ? "border-rose-400 focus:border-rose-500 ring-2 ring-rose-500/10 text-rose-600"
                      : "border-border text-foreground"
                  )}
                />
                {!isValidHexColor(hexInput) && (
                  <div className="text-[10px] text-destructive mt-1 font-semibold leading-normal">
                    {language === "TH"
                      ? "กรุณากรอกสีในรูปแบบ #RRGGBB (เช่น #1E5BFF)"
                      : "Please enter a color in #RRGGBB format (e.g. #1E5BFF)"}
                  </div>
                )}
              </div>

              {/* Custom RGB Realtime Preview Card */}
              <div className="rounded-xl border border-border bg-card p-4.5">
                <div className="flex items-center gap-3">
                  <div
                    className="h-14 w-14 rounded-2xl border-4 border-white shadow-lg shrink-0 transition-colors duration-200"
                    style={{ backgroundColor: currentHex }}
                  />
                  <div>
                    <div className="text-xs font-medium text-gray-500 leading-none mb-1">
                      {language === "TH" ? "ตัวอย่างสี" : "Color Preview"}
                    </div>
                    <div className="text-lg font-black text-foreground leading-tight">
                      {currentHex}
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 font-medium leading-none mt-0.5">
                      RGB({rgb.r}, {rgb.g}, {rgb.b})
                    </div>
                  </div>
                </div>

                <div className="mt-4.5 grid grid-cols-2 gap-2">
                  <Button variant="default" size="lg" className="w-full rounded-2xl text-xs font-extrabold shadow-sm">
                    {language === "TH" ? "ปุ่มตัวอย่าง" : "Sample Button"}
                  </Button>

                  <div className="flex h-10 items-center justify-center rounded-2xl bg-primary/10 text-xs font-extrabold text-primary border border-primary/20">
                    {language === "TH" ? "ไฮไลต์" : "Highlight"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border/80 p-4">
          <div className="flex items-start gap-2.5 mb-3">
            <Sliders className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-foreground">
                {language === "TH" ? "ขนาดหน้าจอ" : "Display Size"}
              </h3>
              <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                {language === "TH" ? "ปรับขนาดตัวอักษร ปุ่ม และการ์ดให้เหมาะกับหน้าจอ" : "Adjust text, buttons, and cards for your screen"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SCALE_OPTIONS.map((option) => {
              const active = uiScale === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleScaleSelect(option.id as any)}
                  className={cn(
                    "rounded-2xl border p-2.5 text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-[74px]",
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                      : "border-border bg-muted text-muted-foreground hover:bg-card"
                  )}
                >
                  <div className="text-[11px] font-extrabold leading-tight">
                    {language === "TH" ? option.labelTh : option.labelEn}
                  </div>
                  <div className="text-[9px] text-muted-foreground/70 font-normal mt-0.5 leading-tight">
                    {language === "TH" ? option.descTh : option.descEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div id="reset-section" className="mt-2.5">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full h-11 border border-border bg-card hover:bg-muted rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === "TH" ? "รีเซ็ตรูปลักษณ์กลับเป็นค่าเริ่มต้น" : "Reset Appearance Settings"}</span>
            </button>
          ) : (
            <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <span className="text-[11px] font-bold text-amber-900 leading-normal">
                {language === "TH"
                  ? "ต้องการรีเซ็ตรูปลักษณ์แอปกลับเป็นสีและขนาดเริ่มต้น (เล็ก / น้ำเงินทองดี) หรือไม่?"
                  : "Reset appearance settings to default values (Small / Tongdee Blue)?"}
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 h-9 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-extrabold transition-colors cursor-pointer"
                >
                  {language === "TH" ? "ยืนยันการตั้งค่าใหม่" : "Confirm Reset"}
                </button>
                <Button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  variant="outline"
                  className="flex-1 h-9 rounded-xl text-[10px] font-bold"
                >
                  {language === "TH" ? "ยกเลิก" : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
