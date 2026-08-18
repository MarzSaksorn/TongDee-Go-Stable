import React, { useMemo, useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Map, 
  AlertCircle,
  Clock,
  Compass,
  Play,
  Flag,
  Route
} from "lucide-react";
import { TripPlanResult, TripPlanStop } from "../types";
import { formatThaiBaht } from "../utils/tripCost";

interface ActiveTripViewProps {
  tripPlan: TripPlanResult;
  onBackToRouteResult: () => void;
  onFinishTrip: () => void;
  onOpenMapLocation?: (placeId: string) => void;
}

export default function ActiveTripView({
  tripPlan,
  onBackToRouteResult,
  onFinishTrip,
  onOpenMapLocation
}: ActiveTripViewProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [completedStopIds, setCompletedStopIds] = useState<string[]>([]);

  const currentStop = tripPlan?.stops?.[currentStopIndex];
  const nextStop = tripPlan?.stops?.[currentStopIndex + 1] ?? null;

  const progressPercent = useMemo(() => {
    if (!tripPlan?.stops?.length) return 0;
    return Math.round(((currentStopIndex) / tripPlan.stops.length) * 100);
  }, [currentStopIndex, tripPlan?.stops?.length]);

  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      gsap.fromTo(progressBarRef.current,
        { width: "0%" },
        { width: `${progressPercent}%`, duration: 1.2, ease: "power3.out" }
      );
    }
  }, [progressPercent]);

  const handleNextStop = () => {
    if (!tripPlan?.stops?.length) return;
    if (currentStop?.id) {
      setCompletedStopIds((current) =>
        current.includes(currentStop.id) ? current : [...current, currentStop.id]
      );
    }

    if (currentStopIndex < tripPlan.stops.length - 1) {
      setCurrentStopIndex((current) => current + 1);
    } else {
      onFinishTrip();
    }
  };

  const handlePreviousStop = () => {
    setCurrentStopIndex((current) => Math.max(current - 1, 0));
  };

  const handleNavigate = () => {
    if (!currentStop) return;
    let url = "";
    if (currentStop.latitude && currentStop.longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${currentStop.latitude},${currentStop.longitude}&travelmode=driving`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentStop.name)}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!tripPlan || !tripPlan.stops?.length) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 text-center bg-background">
        <Compass className="size-14 text-muted-foreground/40 mb-4" />
        <h2 className="text-base font-bold text-foreground">ยังไม่มีทริปที่กำลังเดินทาง</h2>
        <button
          onClick={onBackToRouteResult}
          className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-all cursor-pointer"
        >
          กลับไปหน้าแผนเที่ยว
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto pb-[calc(120px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground px-5 pt-12 pb-4 relative shrink-0">
        <div className="absolute top-[-20%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBackToRouteResult}
              className="size-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground transition-colors cursor-pointer shrink-0 backdrop-blur-xs"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate">กำลังเดินทาง</h1>
              <p className="text-[10px] text-primary-foreground/70 truncate">{tripPlan.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-[9px] font-bold shrink-0 backdrop-blur-xs border border-emerald-400/20">
            <ShieldCheck className="size-3 fill-emerald-200" />
            Safe Mode
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-4 space-y-4">
        {/* Progress */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-muted-foreground">ความคืบหน้า</span>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div ref={progressBarRef} className="h-full rounded-full bg-primary" />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-[9px] font-bold text-muted-foreground">
            <span>จุดเริ่มต้น</span>
            <span>จุดที่ {currentStopIndex + 1}/{tripPlan.stops.length}</span>
          </div>
        </div>

        {/* Cost badge */}
        {tripPlan.costEstimate && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5">
            <span className="text-[10px] font-bold text-muted-foreground">งบประมาณ</span>
            <span className="text-sm font-black text-foreground">
              {formatThaiBaht(tripPlan.costEstimate.totalCost)}
              <span className="text-[9px] font-bold text-muted-foreground ml-1">/ {tripPlan.costEstimate.travelers} คน</span>
            </span>
          </div>
        )}

        {/* Current stop */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {currentStop.imageUrl ? (
            <div className="relative h-48 overflow-hidden bg-muted">
              <img
                src={currentStop.imageUrl}
                alt={currentStop.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold rounded-full border border-white/20">
                  {currentStop.category || "จุดท่องเที่ยว"}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-16 bg-gradient-to-r from-primary/5 to-primary/10" />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="size-3" /> จุดหมายปัจจุบัน
                </p>
                <h2 className="text-lg font-black text-foreground leading-tight">{currentStop.name}</h2>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                <Clock className="size-3" />
                {currentStop.timeLabel}
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-2.5">
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg flex items-center gap-1">
                <Compass className="size-3" />{currentStop.durationLabel}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              {currentStop.note || currentStop.description || ""}
            </p>
            <div className="flex gap-2.5 mt-3.5">
              <button
                onClick={handleNavigate}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <Navigation className="size-3.5 fill-white" />
                นำทาง
              </button>
              <button
                onClick={() => onOpenMapLocation?.(currentStop.placeId)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-[10px] font-bold active:scale-95 transition-all cursor-pointer border border-primary/20"
              >
                <MapPin className="size-3.5" />
                ดูแผนที่
              </button>
            </div>
          </div>
        </div>

        {/* Next stop preview */}
        {nextStop && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <Flag className="size-3 text-emerald-500" /> จุดหมายถัดไป
              </span>
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">ถัดไป</span>
            </div>
            <h3 className="text-sm font-bold text-foreground">{nextStop.name}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">
              {nextStop.timeLabel} &middot; {nextStop.durationLabel}
            </p>
          </div>
        )}

        {/* Safety reminder */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 p-4 flex items-start gap-3">
          <ShieldCheck className="size-5 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[11px] font-black text-emerald-800">Safe Mode กำลังทำงาน</h3>
            <p className="text-[10px] text-emerald-700/80 mt-0.5 leading-relaxed">
              สแกนคิวอาร์ตามจุดท่องเที่ยวเพื่อรับการคุ้มครอง กด SOS เพื่อโทรติดต่อเจ้าหน้าที่ช่วยเหลือตลอด 24 ชม.
            </p>
            <ul className="mt-2 text-[9px] font-bold text-emerald-600 space-y-0.5 list-disc pl-3">
              <li>ระมัดระวังบริเวณถนนแคบและไม่มีฟุตบาท</li>
              <li>เตรียมเบอร์โทรศัพท์ฉุกเฉินหรือกระเป๋ายาขนาดเล็กติดตัว</li>
            </ul>
          </div>
        </div>

        {/* Route timeline */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-[10px] font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Route className="size-3" /> เส้นทางทั้งหมด
          </h3>
          <div className="relative space-y-2 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {tripPlan.stops.map((stop, index) => {
              const isCurrent = index === currentStopIndex;
              const isCompleted = completedStopIds.includes(stop.id) || index < currentStopIndex;
              return (
                <div
                  key={stop.id}
                  className={`relative flex gap-3 rounded-xl p-2.5 transition-all ${
                    isCurrent ? "bg-primary/10 ring-1 ring-primary/20" : isCompleted ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`relative z-10 size-[34px] shrink-0 flex items-center justify-center rounded-full text-[10px] font-black shadow-sm transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="size-4" /> : index + 1}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold truncate ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                        {stop.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground shrink-0">{stop.timeLabel}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] font-bold text-primary flex items-center gap-1 mt-0.5 animate-pulse">
                        <Play className="size-2 fill-current" /> กำลังทำกิจกรรม
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-lg mx-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pointer-events-auto">
          <div className="bg-card shadow-lg shadow-black/10 border border-border rounded-2xl px-4 py-3">
            <div className="flex gap-3">
              <button
                onClick={onFinishTrip}
                className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-[11px] font-bold hover:bg-accent active:scale-95 transition-all cursor-pointer border border-border"
              >
                จบทริป
              </button>
              <button
                onClick={handleNextStop}
                className="flex-[2] py-2.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/25"
              >
                {currentStopIndex >= tripPlan.stops.length - 1 ? "เสร็จสิ้น" : "ไปจุดถัดไป"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
