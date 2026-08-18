import React from "react";
import { Compass, Heart, Map, Search, Sparkles } from "lucide-react";

interface OnboardingViewProps {
  onNext: () => void;
}

export default function OnboardingView({ onNext }: OnboardingViewProps) {
  return (
    <div
      id="onboarding-screen"
      className="flex flex-col justify-between h-full w-full bg-white p-6 overflow-y-auto"
    >
      <div className="flex justify-between items-center w-full pt-2">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Thong Dee Go • พิชัย</span>
        <button
          onClick={onNext}
          className="text-xs font-medium text-muted-foreground/70 hover:text-primary"
        >
          ข้าม
        </button>
      </div>

      <div className="flex flex-col items-center justify-center my-auto py-4">
        <div className="relative w-64 h-64 flex items-center justify-center bg-gradient-to-tr from-blue-50 to-blue-100 rounded-3xl shadow-inner mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="absolute -top-16 -left-6 bg-white p-2.5 rounded-2xl shadow-md border border-border rotate-[-12deg] text-amber-500 animate-pulse">
              <Compass className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-12 -right-6 bg-white p-3 rounded-2xl shadow-lg border border-border rotate-[8deg] flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono text-muted-foreground">Safe: เส้นทางปลอดภัย</span>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="w-40 h-28 bg-primary rounded-3xl p-3 shadow-xl flex flex-col justify-between border-2 border-white text-white">
                <div className="flex justify-between items-center">
                  <Map className="w-6 h-6 text-amber-400" />
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-16 bg-blue-300 rounded" />
                  <div className="h-1.5 w-24 bg-white/40 rounded" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-amber-400">
                <Search className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex gap-1 items-center">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-gray-700 font-sans">AI-Guided Adventure</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-primary text-center mb-3">
          Discover Local Culture
        </h2>

        <p className="text-sm text-muted-foreground text-center leading-relaxed px-4 max-w-[320px]">
          ค้นพบวัฒนธรรมท้องถิ่น เส้นทางลับ อาหารพื้นบ้าน และเรื่องเล่าในอดีตของ <span className="text-primary font-semibold">เมืองรองพิชัย</span> ด้วยคำแนะนำส่วนบุคคลจากเพื่อนร่วมทาง AI
        </p>
      </div>

      <div className="flex flex-col items-center w-full gap-5 pb-2">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-5 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>

        <button
          id="btn-onboarding-start"
          onClick={onNext}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          เริ่มต้นใช้งาน
        </button>
      </div>
    </div>
  );
}
