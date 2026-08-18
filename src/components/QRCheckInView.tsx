import React, { useState } from "react";
import { Camera, ChevronLeft, Check, Sparkles, MapPin, Award, AlertCircle } from "lucide-react";
import { Attraction } from "../types";
import { ATTRACTIONS } from "../data";

interface QRCheckInViewProps {
  onBack: () => void;
  onCheckInSuccess: (id: string) => void;
  checkedInIds: string[];
  locations?: Attraction[];
}

export default function QRCheckInView({
  onBack,
  onCheckInSuccess,
  checkedInIds,
  locations,
}: QRCheckInViewProps) {
  const list = locations && locations.length > 0 ? locations : ATTRACTIONS;
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(list[0]?.id || "wat_mahathat");
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSimulateScan = () => {
    setScanning(true);
    setSuccess(null);
    
    setTimeout(() => {
      setScanning(false);
      onCheckInSuccess(selectedPlaceId);
      const place = list.find(a => a.id === selectedPlaceId);
      if (place) {
        setSuccess(place.name);
      }
    }, 1500);
  };

  const remainingPlaces = list.filter(a => !checkedInIds.includes(a.id));

  return (
    <div
      id="qr-checkin-screen"
      className="flex flex-col h-full w-full bg-background pb-16 overflow-y-auto text-foreground animate-fade-in-up"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-card border-b border-border shadow-lg sticky top-0 z-20">
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-muted active:scale-95 text-muted-foreground rounded-xl transition-all cursor-pointer shrink-0"
          title="ย้อนกลับ"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white leading-tight truncate">สแกน QR คาร์ดโบราณสถาน</h2>
          <span className="text-[10px] text-muted-foreground/70 font-mono block truncate">ระบบตรวจสอบตำแหน่งภูมิศาสตร์ออแกนิก</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
        {/* Main Scanner Emulator HUD */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-muted border-2 border-border rounded-[32px] overflow-hidden flex flex-col items-center justify-center shadow-2xl p-4">
          
          {/* Scanning box indicator corners */}
          <div className="absolute top-8 left-8 w-10 h-10 rounded-xl ring-2 ring-amber-400/90" />
          <div className="absolute top-8 right-8 w-10 h-10 rounded-xl ring-2 ring-amber-400/90" />
          <div className="absolute bottom-8 left-8 w-10 h-10 rounded-xl ring-2 ring-amber-400/90" />
          <div className="absolute bottom-8 right-8 w-10 h-10 rounded-xl ring-2 ring-amber-400/90" />

          {/* Glowing scanner red line */}
          {scanning && (
            <div className="absolute left-6 right-6 h-1 bg-rose-500 shadow-[0_0_12px_#ef4444] animate-pulse z-10" />
          )}

          {scanning ? (
            <div className="flex flex-col items-center gap-2 text-center z-10 bg-black/40 backdrop-blur-sm p-4 rounded-2xl">
              <Camera className="w-8 h-8 text-amber-400 animate-spin" />
              <span className="text-xs font-bold text-amber-300">กำลังสแกนโค้ด OTOP...</span>
              <p className="text-[9px] text-muted-foreground">ความปลอดภัยความแม่นยำสูง</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-2 text-center z-10 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm p-4 rounded-2xl animate-fade-in">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <span className="text-xs font-bold text-emerald-400">สแกนรหัสสำเร็จ!</span>
              <p className="text-[10px] font-semibold text-white truncate max-w-[190px]">{success}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center z-10 p-5">
              <Camera className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground font-sans">เล็งกล้องไปที่ป้ายคิวอาร์แสตมป์</span>
              <p className="text-[9px] text-muted-foreground/70 max-w-[180px]">มีแผงสิทธิ์ป้ายคิวอาร์สีทองพาสปอร์ตติดตั้งทุกๆ เช็คพอยต์</p>
            </div>
          )}
        </div>

        {/* Location Dropdown selector for mock scanner */}
        <div className="space-y-3 bg-muted/60 p-4 rounded-xl border border-border">
          <label className="block text-xs font-medium text-muted-foreground font-sans">
            <MapPin className="w-3.5 h-3.5 inline-block mr-1" /> เลือกสถานที่เช็กอินจำลอง
          </label>
          
          <select
            value={selectedPlaceId}
            onChange={(e) => {
              setSelectedPlaceId(e.target.value);
              setSuccess(null);
            }}
            className="w-full text-xs font-bold text-foreground p-3 bg-card border border-border rounded-xl outline-none"
          >
            {list.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name} {checkedInIds.includes(place.id) ? "(เช็กอินแล้ว แวะกราบซ้ำ)" : "(ยังไม่เคยสแกน)"}
              </option>
            ))}
          </select>

          {/* Trigger check-in action button */}
          <button
            onClick={handleSimulateScan}
            disabled={scanning}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 active:scale-95 transition-all text-primary text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/10 flex justify-center items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-primary" />
            <span>{scanning ? "โปรดดึงกล้องค้างไว้..." : "จำลองการสแกนรหัส QR"}</span>
          </button>
        </div>

        {/* Dynamic Badge unlock hints */}
        <div className="p-3 bg-blue-950/40 border border-blue-900/40 text-[10px] text-blue-200 rounded-xl flex items-start gap-2 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>
            <strong>รางวัลพาสปอร์ตแสนสนุก:</strong> ปัจจุบันสแกนไปแล้ว <strong>{checkedInIds.length}/10</strong> สถานที่. สะสมแสตมป์เพื่อเลื่อนยศผู้รู้ประวัติศาสตร์ท้องถิ่น และรับเหรียญเกียรติยศเพิ่มความสุข!
          </span>
        </div>
      </div>
    </div>
  );
}
