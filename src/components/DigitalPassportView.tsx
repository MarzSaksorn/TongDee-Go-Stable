import React, { useEffect } from "react";
import gsap from "gsap";
import { Award, Compass, Star, Mic, Flame, Shield, Globe, Landmark, Smile, Sparkles, ChevronLeft, Lock, QrCode, BookOpen, CheckCircle2 } from "lucide-react";
import { Badge, Stamp } from "../types";
import { STAMPS } from "../data";

interface DigitalPassportViewProps {
  exp: number;
  nextLevelExp: number;
  checkedInIds: string[];
  badges: Badge[];
  onTriggerCheckIn: (attractionId: string) => void;
  onOpenQRCheckIn: () => void;
  onOpenDiary: () => void;
  displayName?: string;
  onBack?: () => void;
}

export default function DigitalPassportView({
  exp,
  nextLevelExp,
  checkedInIds,
  badges,
  onTriggerCheckIn,
  onOpenQRCheckIn,
  onOpenDiary,
  displayName = "คุณแมว",
  onBack
}: DigitalPassportViewProps) {
  const expPercentage = Math.round((exp / nextLevelExp) * 100);

  useEffect(() => {
    gsap.fromTo(".passport-stamp",
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.06, ease: "back.out(2)" }
    );
  }, []);

  return (
    <div 
      id="passport-screen" 
      className="flex flex-col h-full w-full bg-background pb-[calc(110px+env(safe-area-inset-bottom))] overflow-y-auto animate-fade-in-up"
    >
      <div className="p-5">
        <div className="relative w-full bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl border-4 border-amber-400 overflow-hidden">
          {/* Subtle gold line pattern as overlay */}
          <div className="absolute inset-0 border-2 border-amber-300/20 m-2 rounded-[24px] pointer-events-none" />
          <div className="absolute top-[-20%] right-[-10%] w-44 h-44 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-24 h-24 rounded-full bg-white/10 blur-lg pointer-events-none" />

          {/* Core passport header */}
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div className="flex items-start gap-2.5">
              {onBack && (
                <button 
                  type="button"
                  onClick={onBack}
                  className="p-1 hover:bg-white/10 active:scale-95 text-white rounded-lg transition-all cursor-pointer -mt-1"
                  title="ย้อนกลับ"
                >
                  <ChevronLeft className="w-5 h-5 text-amber-300" />
                </button>
              )}
              <div>
                <span className="block text-xs font-medium text-muted-foreground">KINGDOM OF THAILAND</span>
                <h3 className="text-sm font-bold tracking-wider text-white mt-0.5">พาสปอร์ตท่องเที่ยวดิจิทัล</h3>
              </div>
            </div>
            <Globe className="w-8 h-8 text-amber-400 animate-spin-slow" />
          </div>

          {/* Passport seal center */}
          <div className="flex flex-col items-center justify-center my-4 text-center z-10 relative">
            <Landmark className="w-10 h-10 text-amber-400 filter drop-shadow" />
            <span className="text-xl font-bold mt-1 text-amber-300 font-mono">THAILAND PASSPORT</span>
            <span className="text-xs font-medium text-muted-foreground mt-1">SECONDARY CITY TOURISM BOARD</span>
          </div>

          {/* User travel status and exp progress bar */}
          <div className="mt-6 pt-5 border-t border-white/10 z-10 relative space-y-3">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-gray-200">
              <span className="text-background">ผู้ถือบัตร: {displayName}</span>
            </div>

            {/* Exp slider bar */}
            <div>
              <div className="flex justify-between text-[10px] text-blue-200 mb-1">
                <span>คะแนนสะสมวัฒนธรรม {exp} EXP</span>
                <span>เป้าหมายถัดไป {nextLevelExp} EXP</span>
              </div>
              <div className="w-full bg-blue-950 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Scan & Diary Entries Link bar */}
      <div className="px-5 mb-5 grid grid-cols-2 gap-3.5">
        <button
          onClick={onOpenQRCheckIn}
          className="py-3 px-3 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center gap-2 font-bold text-xs text-primary-foreground shadow-md shadow-blue-500/10 cursor-pointer border-none"
        >
          <QrCode className="w-4 h-4" /> ไปสแกน QR เช็คอิน
        </button>
        <button
          onClick={onOpenDiary}
          className="py-3 px-3 bg-primary text-primary-foreground hover:bg-primary/90 border-none active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-sm cursor-pointer"
        >
          <BookOpen className="w-4 h-4" /> บันทึกไดอารี่ AI
        </button>
      </div>

      <div className="px-5 mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <span>ตราสัญลักษณ์แสตมป์วัฒนธรรม ({checkedInIds.length}/10)</span>
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4 leading-normal">
          เมื่อคุณไปสะสมสิทธิเช็คอินสำเร็จ แสตมป์สัญลักษณ์ล้านนาโบราณจะปลดล็อกเปี่ยมสีสัน เลือกกดแสตมป์เพื่อจำลองการสะสมได้ฟรี!
        </p>

        {/* Grid of Stamps */}
        <div className="grid grid-cols-2 gap-3.5">
          {STAMPS.map((stamp) => {
            const isUnlocked = checkedInIds.includes(stamp.attractionId);
            return (
              <button
                key={stamp.id}
                onClick={() => onTriggerCheckIn(stamp.attractionId)}
                className={`passport-stamp relative p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  isUnlocked 
                    ? "bg-amber-400/10 border-amber-300 text-amber-900 group" 
                    : "bg-card border-border text-muted-foreground/50 hover:border-gray-200"
                }`}
              >
                {/* Stamp visual symbol icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border mb-2 transition-transform duration-200 ${
                  isUnlocked 
                    ? "bg-amber-400 border-amber-300 scale-105 rotate-[4deg] group-hover:rotate-[12deg] text-foreground" 
                    : "bg-muted border-gray-200 opacity-40"
                }`}>
                  {isUnlocked ? <Landmark className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <span className={`text-[11px] font-bold ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {stamp.name}
                </span>

                <span className="text-[8px] mt-0.5 text-muted-foreground font-mono">
                  {isUnlocked ? "ปลดล็อกแล้ว" : "คลิกเพื่อจำลองปลด"}
                </span>
                
                {/* Gold emblem ribbon overlay */}
                {isUnlocked && (
                  <div className="absolute top-1 right-2 text-amber-500 animate-pulse">
                    <Star className="w-3 h-3 fill-amber-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mb-5">
        <h3 className="text-sm font-bold text-foreground mb-3">เหรียญเกียรติยศ (Badges)</h3>
        
        <div className="space-y-3.5">
          {badges.map((badge) => {
            // Check dynamic state or default
            let locked = !badge.unlocked;
            if (badge.id === "b2" && checkedInIds.length >= 2) locked = false;
            if (badge.id === "b4" && checkedInIds.length >= 7) locked = false;

            return (
              <div 
                key={badge.id}
                className={`p-4 border rounded-xl flex gap-3.5 items-center relative overflow-hidden transition-all ${
                  !locked 
                    ? "bg-card border-primary/20" 
                    : "bg-muted/40 border-border opacity-60"
                }`}
              >
                {/* Icon box representing medals */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  !locked 
                    ? "bg-amber-400 text-foreground border border-amber-300" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {badge.iconName === "Compass" ? <Compass className="w-5 h-5" /> : badge.iconName === "Utensils" ? <Flame className="w-5 h-5" /> : badge.iconName === "Mic" ? <Mic className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold ${!locked ? "text-foreground" : "text-muted-foreground"}`}>{badge.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 lines-clamp-1">{badge.desc}</p>
                </div>

                {/* Lock banner or checkmark */}
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                  !locked 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-gray-200 text-muted-foreground"
                }`}>
                  {!locked ? "ปลดล็อกแล้ว" : "ยังล็อกอยู่"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
