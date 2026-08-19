import React, { useState } from "react";
import { Shield, PhoneCall, AlertTriangle, Share2, MapPin, Activity, Bell, Compass, Heart, CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SafetyModeViewProps {
  safetyModeActive: boolean;
  onToggleSafety: () => void;
  onBack?: () => void;
}

export default function SafetyModeView({
  safetyModeActive,
  onToggleSafety,
  onBack
}: SafetyModeViewProps) {
  const [shareConfigured, setShareConfigured] = useState(false);
  const [driftAlert, setDriftAlert] = useState(true);

  const emergencyContacts = [
    { name: "ตำรวจท้องถิ่น", tel: "191", color: "bg-amber-50 text-amber-700" },
    { name: "ศูนย์ปฏิบัติการสายตรวจ", tel: "055-832-060", color: "bg-amber-50 text-amber-700"},
    { name: "สายด่วนตำรวจท่องเที่ยว (ติดต่อฉุกเฉินสากล)", tel: "1155", color: "bg-primary/10 text-primary" },
    { name: "สมาคมกู้ภัยวัดหมอนไม้", tel: "089-503-9705", color: "bg-amber-50 text-amber-700" },
    { name: "โรงพยาบาลอำเภอพิชัย", tel: "055-832-100", color: "bg-rose-50 text-rose-600" },
  ];

  const handleShareClick = () => {
    setShareConfigured(!shareConfigured);
  };

  return (
    <div 
      id="safety-screen" 
      className="flex flex-col h-full w-full bg-background pb-16 overflow-y-auto animate-fade-in-up"
    >
      {/* Visual Header with Shield Indicator */}
      <div className={`p-6 pt-7 text-center transition-all relative ${
        safetyModeActive 
          ? "bg-emerald-600 text-white" 
          : "bg-gradient-to-r from-primary to-primary/80 text-white"
      }`}>
        {onBack && (
          <div className="absolute top-4 left-4 z-40">
            <button 
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              title="ย้อนกลับ"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
        <div className="relative inline-flex items-center justify-center mb-3">
          {/* Pulsing ring */}
          {safetyModeActive && (
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-white/20 animate-safe-pulse" />
          )}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
            safetyModeActive ? "bg-white text-emerald-600 border-white" : "bg-white/10 text-amber-400 border-amber-300"
          }`}>
            <Shield className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-lg font-bold mb-1">เที่ยวคนเดียวอย่างปลอดภัย</h2>
        <p className="text-[10px] text-primary-foreground/70 font-light tracking-wide max-w-[280px] mx-auto">
          {safetyModeActive 
            ? "● โหมดดูแลความปลอดภัยอัจฉริยะกำลังสแกนพิกัดของคุณตลอดทริป" 
            : "เปิดใช้งานระบบความปลอดภัยเพื่อความอุ่นใจในการออกผจญภัยในพิชัย"}
        </p>
      </div>

      <div className="p-5 space-y-4">
        
        {/* Radar Map Pin Coordinates visualization on active */}
        {safetyModeActive && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in text-center space-y-2.5">
            <div className="flex justify-center items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>พิกัด GPS ของคุณปลอดภัยและบันทึกอยู่</span>
            </div>
            <div className="font-mono text-[10px] text-emerald-600 font-bold">
              LAT: 17.303120 • LNG: 100.123512 (ต.ในเมือง พิชัย)
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal max-w-[280px] mx-auto">
              ระบบกำลังเชื่อมสัญญาณแชร์อัตโนมัติกับเพื่อนและโรงพยาบาล สวพ. ในกรณีอพยพด่วน
            </p>
          </div>
        )}

        {/* Big Action Toggle Button */}
        <Button
          onClick={onToggleSafety}
          className={`w-full py-6 text-base shadow-md ${
            safetyModeActive 
              ? "bg-destructive hover:bg-destructive/90 text-white" 
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
          }`}
        >
          {safetyModeActive ? "ปิดระบบ Safety Mode" : "เปิดใช้งาน Safety Mode"}
        </Button>

        {/* 1. แชร์ตำแหน่งให้เพื่อน Card */}
        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3 justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">1. แชร์ตำแหน่งแบบเรียลไทม์</h4>
              <p className="text-[10px] text-muted-foreground mt-1">
                {shareConfigured ? "คัดลอกและแชร์ลิงก์ให้ผู้ติดต่อสนิทแล้ว" : "สร้างพิกัดเว็บบุ๊คเพื่อให้เพื่อนตามรอยทริปคนเดียว"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleShareClick}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all ${
              shareConfigured 
                ? "bg-emerald-50 text-emerald-600" 
                : "bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
            }`}
          >
            {shareConfigured ? "แชร์แล้ว" : "ตั้งค่าแชร์"}
          </button>
        </div>

        {/* 2. แจ้งเตือนเมื่อออกนอกเส้นทาง */}
        <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">2. เตือนเมื่อเบี่ยงเส้นทาง</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">แจ้งเตือนหากพิกัดเลื่อนเกิน 500 ม.</p>
            </div>
          </div>
          
          {/* Custom Switch toggle style */}
          <button 
            onClick={() => setDriftAlert(!driftAlert)}
            className={`w-10 h-6 rounded-full p-1 transition-colors ${driftAlert ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${driftAlert ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>

        {/* 3. เบอร์โทรและปุ่มฉุกเฉิน SOS */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Badge variant="destructive" className="w-5 h-5 p-0 flex items-center justify-center rounded-full">
              <PhoneCall className="w-3 h-3" />
            </Badge>
            <span>3. สายด่วนฉุกเฉินท้องถิ่นพิชัย</span>
          </h3>
          
          <div className="space-y-2.5">
            {emergencyContacts.map((contact, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2.5 rounded-2xl border border-border bg-background"
              >
                <div>
                  <h4 className="text-xs font-bold text-foreground leading-tight">{contact.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-foreground mt-1 block">โทร: {contact.tel}</span>
                </div>
                <a 
                  href={`tel:${contact.tel}`}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${contact.color}`}
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 4. โรงพยาบาล & สถานีตำรวจใกล้ที่สุด */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary" /> 4. ข้อมูลพิกัดหน่วยพยาบาลและสัญจร
          </h3>
          
          <div className="divide-y divide-border space-y-3 test-xs">
            {/* Phichai Hospital details card */}
            <div className="text-xs pb-3">
              <h4 className="font-bold text-foreground">โรงพยาบาลหลัก: โรงพยาบาลอำเภอพิชัย</h4>
              <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                ตั้งอยู่ห่างจุดใจกลางอำเภอ 1.5 กม. มีหน่วยกู้ชีพดูแล 24 ชั่วโมง ขับรถ 4 นาทีถึง
              </p>
            </div>

            {/* Phichai Police station details card */}
            <div className="text-xs pt-3">
              <h4 className="font-bold text-foreground">สถานีอารักขาหลัก: สถานีตำรวจภูธรพิชัย</h4>
              <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                ติดเขตโบราณสถานเทศบาลเมืองเก่า มีกล้องตรวจสอบและแผนกรักษาความปลอดภัยนักท่องเที่ยวเมืองรองคอยตรวจตราสม่ำเสมอ
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
