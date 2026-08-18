import React from "react";
import { Sparkles, MapPin, Compass, Shield, ArrowRight, ChevronLeft, AlertCircle, Info, Clock, Footprints, DollarSign, Route } from "lucide-react";
import { TripPlanResult } from "../types";
import { formatThaiBaht } from "../utils/tripCost";

interface AIRouteResultViewProps {
  tripPlan: TripPlanResult | null;
  onBack: () => void;
  onStartTrip: () => void;
  onOpenMapLocation?: (placeId: string) => void;
  onAudioStoryClick?: (title: string, story: string) => void;
  onCreateNewPlan?: () => void;
}

export default function AIRouteResultView({
  tripPlan,
  onBack,
  onStartTrip,
  onOpenMapLocation,
  onAudioStoryClick,
  onCreateNewPlan
}: AIRouteResultViewProps) {
  if (!tripPlan) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 text-center bg-background">
        <Compass className="size-12 text-muted-foreground/40 mb-3" />
        <h3 className="text-sm font-bold text-muted-foreground">ยังไม่มีแผนเที่ยวที่จะแสดง</h3>
        <button
          onClick={onCreateNewPlan || onBack}
          className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-all cursor-pointer"
        >
          กลับไปสร้างแผนเที่ยว
        </button>
      </div>
    );
  }

  const { title, summary, duration, pace, stops, tips, interests, startPoint } = tripPlan;
  const durationText = duration === "half-day" ? "ครึ่งวัน" : duration === "2-days" ? "2 วัน 1 คืน" : "1 วันเต็ม";
  const paceText = pace === "relaxed" ? "เที่ยวสบายๆ" : pace === "packed" ? "อัดแน่น" : "สมดุล";

  return (
    <div
      id="route-result-screen"
      className="flex flex-col h-full w-full bg-background overflow-y-auto pb-[calc(120px+env(safe-area-inset-bottom))]"
    >
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground px-5 pt-12 pb-5 relative shrink-0 safe-bleed">
        <div className="absolute top-[-20%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 rounded-full bg-white/8 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="size-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground transition-colors cursor-pointer shrink-0 backdrop-blur-xs"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="size-3 text-amber-300 fill-amber-300" />
              <span className="text-[9px] font-bold text-primary-foreground/70">AI วางแผนสำเร็จ</span>
            </div>
            <h1 className="text-sm font-bold truncate leading-tight">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 relative z-10">
          <span className="text-[10px] font-bold text-primary-foreground/80 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
            <Clock className="size-3" /> {durationText}
          </span>
          <span className="text-[10px] font-bold text-primary-foreground/80 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
            <Footprints className="size-3" /> {paceText}
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 space-y-4">
        {/* Summary */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{summary}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {interests.map((interest, idx) => (
              <span key={idx} className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                #{interest}
              </span>
            ))}
            {startPoint && (
              <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="size-2.5" /> {startPoint}
              </span>
            )}
          </div>
        </div>

        {/* Cost */}
        {tripPlan.costEstimate && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <DollarSign className="size-3" /> ค่าใช้จ่ายโดยประมาณ
              </span>
              <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{tripPlan.costEstimate.travelers} คน</span>
            </div>
            <div className="flex items-end justify-between mb-3">
              <span className="text-2xl font-black text-foreground">{formatThaiBaht(tripPlan.costEstimate.totalCost)}</span>
              <span className="text-[10px] font-bold text-muted-foreground">เฉลี่ย {formatThaiBaht(tripPlan.costEstimate.costPerPerson)} / คน</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "เดินทาง", value: tripPlan.costEstimate.transportCost },
                { label: "อาหาร", value: tripPlan.costEstimate.foodCost },
                { label: "ค่าเข้า", value: tripPlan.costEstimate.entranceCost },
                { label: "อื่นๆ", value: tripPlan.costEstimate.shoppingCost + tripPlan.costEstimate.miscCost }
              ].map((item, i) => (
                <div key={i} className="bg-muted rounded-xl px-2.5 py-2 text-center">
                  <p className="text-[8px] font-bold text-muted-foreground">{item.label}</p>
                  <p className="text-[10px] font-extrabold text-foreground mt-0.5">{formatThaiBaht(item.value)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
              {tripPlan.costEstimate.note}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h3 className="text-[10px] font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Route className="size-3" /> ตารางเดินทาง
          </h3>
          <div className="relative border-l-2 border-dashed border-primary/20 pl-4 ml-2 space-y-3">
            {stops.map((stop, idx) => (
              <div key={stop.id} className="relative bg-card border border-border rounded-2xl overflow-hidden">
                <div className="absolute -left-[25px] top-5 w-3.5 h-3.5 bg-primary border-3 border-background rounded-full shadow-sm z-10" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Clock className="size-3" /> {stop.timeLabel}
                    </span>
                    {stop.category && (
                      <span className="text-[9px] font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                        {stop.category}
                      </span>
                    )}
                  </div>
                  <h4
                    onClick={() => onOpenMapLocation?.(stop.placeId)}
                    className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {stop.name}
                    <MapPin className="size-3 text-primary" />
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                    {stop.note || stop.description}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-[9px] text-muted-foreground">ใช้เวลา {stop.durationLabel}</span>
                    <button
                      type="button"
                      onClick={() => onOpenMapLocation?.(stop.placeId)}
                      className="text-[9px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      ดูแผนที่ &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {tips && tips.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h4 className="text-[10px] font-bold text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Info className="size-3 text-amber-500" /> คำแนะนำท่องเที่ยว
            </h4>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety note */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-[10px] text-amber-800 leading-relaxed">
          <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>พร้อมลุยอย่างปลอดภัย:</strong> แนะนำให้กด <strong>"เริ่มเดินทาง"</strong> เพื่อเข้าสู่ระบบช่วยเหลือบนแผนที่พาสปอร์ตส่วนตัว
          </span>
        </div>

        {/* Create new */}
        <button
          type="button"
          onClick={onCreateNewPlan || onBack}
          className="w-full py-2.5 rounded-xl bg-muted border border-border text-[11px] font-bold text-muted-foreground hover:bg-accent active:scale-[0.98] transition-all cursor-pointer"
        >
          สร้างแผนใหม่
        </button>
      </div>

      {/* Bottom bar */}
      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-lg mx-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pointer-events-auto">
          <div className="bg-card shadow-lg shadow-black/10 border border-border rounded-2xl px-4 py-3">
            <button
              type="button"
              onClick={onStartTrip}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/25"
            >
              <Shield className="size-4 text-amber-300 fill-amber-300" />
              เริ่มเดินทาง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
