import React, { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ChevronLeft, MapPin, RefreshCw, Droplets, Umbrella, Wind, Sun, Thermometer, CloudSun, CloudRain, Cloud } from "lucide-react";
import { getHomeWeather, type HomeWeatherData } from "../services/weatherService";
import { useLanguage } from "../i18n/LanguageContext";

interface WeatherViewProps {
  onBack: () => void;
}

const weatherGradients: Record<string, string> = {
  sunny: "from-amber-400 via-orange-300 to-sky-400",
  cloudy: "from-slate-300 via-slate-400 to-slate-500",
  rainy: "from-slate-500 via-blue-600 to-indigo-700",
  default: "from-primary/80 via-primary/40 to-background",
};

const weatherTextColors: Record<string, string> = {
  sunny: "text-white",
  cloudy: "text-slate-100",
  rainy: "text-white",
  default: "text-foreground",
};

function getWeatherTheme(condition?: string | null): string {
  if (!condition) return "default";
  const c = condition.toLowerCase();
  if (c.includes("ฝน") || c.includes("rain") || c.includes("shower") || c.includes("thunder")) return "rainy";
  if (c.includes("cloud") || c.includes("ครึ้ม") || c.includes("มีเมฆ") || c.includes("overcast")) return "cloudy";
  if (c.includes("sun") || c.includes("clear") || c.includes("แดด") || c.includes("แจ่มใส")) return "sunny";
  return "default";
}

function getWeatherIcon(condition?: string | null, className = "w-10 h-10") {
  if (!condition) return <CloudSun className={className} />;
  const c = condition.toLowerCase();
  if (c.includes("ฝน") || c.includes("rain") || c.includes("shower") || c.includes("thunder")) return <CloudRain className={className} />;
  if (c.includes("cloud") || c.includes("ครึ้ม") || c.includes("มีเมฆ") || c.includes("overcast")) return <Cloud className={className} />;
  if (c.includes("sun") || c.includes("clear") || c.includes("แดด") || c.includes("แจ่มใส")) return <Sun className={className} />;
  return <CloudSun className={className} />;
}

export function WeatherView({ onBack }: WeatherViewProps) {
  const { language } = useLanguage();
  const [homeWeather, setHomeWeather] = useState<HomeWeatherData | null>(null);
  const [homeWeatherLoading, setHomeWeatherLoading] = useState(false);
  const [homeWeatherError, setHomeWeatherError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const tempRef = useRef<HTMLSpanElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const hourlyRef = useRef<HTMLDivElement>(null);

  const weatherTheme = useMemo(() => getWeatherTheme(homeWeather?.condition), [homeWeather]);
  const textColor = weatherTextColors[weatherTheme];
  const gradient = weatherGradients[weatherTheme];

  const loadHomeWeather = async () => {
    try {
      setHomeWeatherLoading(true);
      setHomeWeatherError(null);
      const data = await getHomeWeather();
      setHomeWeather(data);
    } catch (error) {
      console.error("Weather request failed:", error);
      setHomeWeatherError(language === "TH" ? "ไม่สามารถโหลดข้อมูลอากาศได้ในขณะนี้" : "Unable to load weather data");
    } finally {
      setHomeWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadHomeWeather();
  }, []);

  useEffect(() => {
    if (!homeWeather) return;

    if (homeWeather.temperature != null && tempRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: homeWeather.temperature,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          if (tempRef.current) tempRef.current.innerText = `${Math.round(obj.val)}°C`;
        }
      });
    }

    gsap.fromTo(statsRef.current?.children ?? [], { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: "power3.out" });
    gsap.fromTo(hourlyRef.current?.children ?? [], { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.35, ease: "power3.out", delay: 0.2 });
  }, [homeWeather]);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className={`relative flex flex-col bg-gradient-to-b ${gradient} pb-6 pt-[calc(12px+env(safe-area-inset-top))]`}>
        <div className="flex items-center gap-3 px-4 py-2">
          <button
            type="button"
            onClick={onBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 ${weatherTheme === "default" ? "bg-card border border-border text-foreground" : "bg-white/20 text-white backdrop-blur-md border border-white/10"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-lg font-bold tracking-tight ${textColor}`}>
            {language === "TH" ? "สภาพอากาศ" : "Weather"}
          </h1>
          <button
            type="button"
            onClick={loadHomeWeather}
            disabled={homeWeatherLoading}
            className={`ml-auto w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${weatherTheme === "default" ? "bg-card border border-border text-foreground" : "bg-white/20 text-white backdrop-blur-md border border-white/10"}`}
            aria-label={language === "TH" ? "โหลดใหม่" : "Refresh"}
          >
            <RefreshCw className={`w-4 h-4 ${homeWeatherLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div ref={heroRef} className="px-5 mt-4">
          {homeWeatherLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-10 rounded-lg bg-white/15 animate-pulse" />
                <div className="w-24 h-4 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          ) : homeWeatherError ? (
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 text-center">
              <p className={`text-xs font-bold ${textColor} opacity-80`}>{homeWeatherError}</p>
              <button
                type="button"
                onClick={loadHomeWeather}
                className={`mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${weatherTheme === "default" ? "bg-primary text-primary-foreground" : "bg-white/20 text-white backdrop-blur-md"}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {language === "TH" ? "โหลดใหม่" : "Retry"}
              </button>
            </div>
          ) : homeWeather ? (
            <>
              <div className="flex items-center gap-0.5 text-[11px] font-semibold opacity-70 mb-2" style={{ color: textColor }}>
                <MapPin className="w-3 h-3" />
                {homeWeather.locationName || (language === "TH" ? "อำเภอพิชัย" : "Phichai District")}
              </div>

              <div className="flex items-center gap-4">
                <div className={`${textColor} drop-shadow-sm`}>
                  {homeWeather.iconBaseUri ? (
                    <img src={`${homeWeather.iconBaseUri}.svg`} alt="" className="w-16 h-16 drop-shadow-md" referrerPolicy="no-referrer" />
                  ) : (
                    getWeatherIcon(homeWeather.condition, "w-16 h-16")
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-0.5">
                    <span ref={tempRef} className={`text-6xl font-black leading-none tracking-tight drop-shadow-sm ${textColor}`}>
                      {homeWeather.temperature != null ? `${Math.round(homeWeather.temperature)}°C` : "--"}
                    </span>
                  </div>
                  <p className={`text-base font-bold mt-1 drop-shadow-sm opacity-90 ${textColor}`}>
                    {homeWeather.condition || (language === "TH" ? "ไม่มีข้อมูล" : "No data")}
                  </p>
                  {homeWeather.feelsLike != null && (
                    <p className={`text-xs font-medium mt-0.5 opacity-70 ${textColor}`}>
                      {language === "TH" ? `รู้สึกเหมือน ${Math.round(homeWeather.feelsLike)}°C` : `Feels like ${Math.round(homeWeather.feelsLike)}°C`}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 -mt-2">
        {homeWeather && !homeWeatherError && (
          <>
            <div ref={statsRef} className="grid grid-cols-2 gap-2.5">
              <div className="weather-stat rounded-2xl bg-card p-4 border border-border flex items-center gap-3 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground">{language === "TH" ? "ความชื้น" : "Humidity"}</p>
                  <p className="text-lg font-black text-foreground font-mono tabular-nums">
                    {homeWeather.humidity != null ? `${homeWeather.humidity}%` : "-"}
                  </p>
                </div>
              </div>

              <div className="weather-stat rounded-2xl bg-card p-4 border border-border flex items-center gap-3 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Umbrella className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground">{language === "TH" ? "โอกาสฝน" : "Rain"}</p>
                  <p className="text-lg font-black text-foreground font-mono tabular-nums">
                    {homeWeather.rainChance != null ? `${homeWeather.rainChance}%` : "-"}
                  </p>
                </div>
              </div>

              <div className="weather-stat rounded-2xl bg-card p-4 border border-border flex items-center gap-3 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground">{language === "TH" ? "ลม" : "Wind"}</p>
                  <p className="text-lg font-black text-foreground font-mono tabular-nums">
                    {homeWeather.windSpeed != null ? `${homeWeather.windSpeed}` : "-"}
                    <span className="text-[10px] font-bold text-muted-foreground"> km/h</span>
                  </p>
                </div>
              </div>

              <div className="weather-stat rounded-2xl bg-card p-4 border border-border flex items-center gap-3 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground">{language === "TH" ? "ดัชนี UV" : "UV Index"}</p>
                  <p className="text-lg font-black text-foreground font-mono tabular-nums">
                    {homeWeather.uvIndex ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            {homeWeather.hourly && homeWeather.hourly.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold text-foreground">
                    {language === "TH" ? "พยากรณ์รายชั่วโมง" : "Hourly Forecast"}
                  </p>
                </div>

                <div ref={hourlyRef} className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {homeWeather.hourly.map((hour, index) => {
                    const isFirst = index === 0;
                    return (
                      <div
                        key={`${hour.timeLabel}-${index}`}
                        className={`min-w-[80px] rounded-2xl p-3.5 flex flex-col items-center gap-2 border shrink-0 transition-all ${
                          isFirst
                            ? "bg-primary/10 border-primary/20"
                            : "bg-card border-border hover:border-primary/20"
                        }`}
                      >
                        <p className={`text-[10px] font-bold ${isFirst ? "text-primary" : "text-muted-foreground"}`}>
                          {isFirst ? (language === "TH" ? "ตอนนี้" : "Now") : hour.timeLabel}
                        </p>
                        {hour.iconBaseUri ? (
                          <img src={`${hour.iconBaseUri}.svg`} alt="" className="w-7 h-7" referrerPolicy="no-referrer" />
                        ) : (
                          getWeatherIcon(hour.condition, "w-7 h-7 opacity-60")
                        )}
                        <p className="text-sm font-black text-foreground font-mono tabular-nums">
                          {hour.temperature != null ? `${Math.round(hour.temperature)}°` : "-"}
                        </p>
                        <span className={`text-[9px] font-semibold ${isFirst ? "text-primary" : "text-muted-foreground"}`}>
                          <Umbrella className="w-2.5 h-2.5 inline mr-0.5" />
                          {hour.rainChance ?? 0}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mt-5 text-[9px] font-medium text-muted-foreground/60 text-center">
              {language === "TH" ? "แหล่งข้อมูล" : "Source"}: Google Weather
              {homeWeather.updatedAt && ` · ${language === "TH" ? "อัปเดตล่าสุด" : "Updated"} ${homeWeather.updatedAt}`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
