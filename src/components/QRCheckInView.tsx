import React, { useState } from "react";
import { Camera, ChevronLeft, Check, Sparkles, MapPin, Award, AlertCircle, MessageCircle, Wrench } from "lucide-react";
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
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground leading-tight truncate">LINE OA แอดไลน์สะสมแสตมป์</h2>
          <span className="text-[10px] text-muted-foreground/70 font-mono block truncate">ผ่าน LINE Official Account • กำลังพัฒนา</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
        {/* LINE OA Card */}
        <div className="relative w-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[32px] overflow-hidden shadow-2xl p-6 flex flex-col items-center text-white">
          <div className="absolute top-[-20%] right-[-15%] w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-[-15%] left-[-10%] w-32 h-32 rounded-full bg-white/10 blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-3 text-center w-full">
            <div className="inline-flex items-center gap-2 bg-emerald-950/20 border border-emerald-900/20 px-3.5 py-1.5 rounded-full">
              <MessageCircle className="w-4 h-4" />
              <span className="text-[11px] font-extrabold tracking-wide">LINE Official Account</span>
            </div>

            <div className="text-2xl font-black tracking-widest drop-shadow-sm">@thongdeego</div>

            {/* QR placeholder */}
            <div className="relative mt-1 bg-white p-4 rounded-2xl shadow-lg">
              <div className="grid grid-cols-7 gap-0.5 w-36 h-36">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={i % 3 === 0 || i % 5 === 0 ? "bg-emerald-950" : "bg-white"}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white/85 backdrop-blur-sm text-emerald-700 text-[9px] font-extrabold px-3 py-1.5 rounded-full border border-emerald-200">
                  QR กำลังพัฒนา
                </span>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-white/90 leading-relaxed max-w-[250px]">
              สแกน QR ด้วยแอป LINE เพื่อแอดไลน์ <span className="font-extrabold">@thongdeego</span>
              แล้วรับสิทธิ์เช็คอินแสตมป์พาสปอร์ตดิจิทัลได้เลย
            </p>

            <span className="inline-flex items-center gap-1.5 bg-amber-300 text-emerald-950 text-[9px] font-extrabold px-3 py-1 rounded-full">
              <Wrench className="w-3 h-3" />
              In Development • กำลังพัฒนา
            </span>
          </div>
        </div>

        {/* Dev simulation (kept so stamps can still be collected) */}
        <div className="space-y-3 bg-muted/60 p-4 rounded-xl border border-border">
          <label className="block text-xs font-medium text-muted-foreground font-sans">
            <MapPin className="w-3.5 h-3.5 inline-block mr-1" /> เลือกสถานที่เช็กอินจำลอง (โหมดนักพัฒนา)
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

          <button
            onClick={handleSimulateScan}
            disabled={scanning}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 active:scale-95 transition-all text-primary text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/10 flex justify-center items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-primary" />
            <span>{scanning ? "โปรดดึงกล้องค้างไว้..." : "จำลองเช็คอินผ่าน LINE OA"}</span>
          </button>

          {scanning && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <Camera className="w-3.5 h-3.5 animate-pulse" />
              กำลังจำลองการแอดไลน์และเช็คอิน...
            </div>
          )}

          {success && !scanning && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              เช็คอินสำเร็จ: {success}
            </div>
          )}
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
