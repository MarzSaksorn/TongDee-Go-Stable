import React, { useState } from "react";
import { Clock, Navigation, ShieldAlert, DollarSign, Award, ChevronLeft, Calendar, Landmark, Flame, Shield, ArrowRight, BookOpen, AlertTriangle, MapPin, Utensils, Car, Gift, Phone, Share2 } from "lucide-react";
import { ItineraryItem } from "../types";

interface TripDetailPlanViewProps {
  itinerary: ItineraryItem[];
  onBack: () => void;
  onStartTrip: () => void;
  onAudioStoryClick: (title: string, story: string) => void;
  onPlaceClick: (name: string) => void;
}

export default function TripDetailPlanView({
  itinerary,
  onBack,
  onStartTrip,
  onAudioStoryClick,
  onPlaceClick
}: TripDetailPlanViewProps) {
  const [activeTab, setActiveTab] = useState<"plan" | "culture" | "budget" | "safety">("plan");

  return (
    <div
      id="detail-plan-screen"
      className="flex flex-col h-full w-full bg-background overflow-y-auto pb-[calc(120px+env(safe-area-inset-bottom))]"
    >
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground px-5 pt-12 pb-5 relative shrink-0 overflow-hidden safe-bleed">
        <div className="absolute top-[-20%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 rounded-full bg-white/8 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="size-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground transition-colors cursor-pointer shrink-0 backdrop-blur-xs"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate">แผนเที่ยวพิชัย 1 วัน</h1>
              <p className="text-[10px] text-primary-foreground/70 truncate">{itinerary.length} จุดหมาย</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartTrip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-primary text-[10px] font-bold hover:bg-amber-500 active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <Shield className="size-3 fill-primary" />
            เริ่มทริป
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-card border-b border-border sticky top-0 z-20">
        {[
          { id: "plan", label: "เส้นทาง", icon: <Navigation className="size-3.5" /> },
          { id: "culture", label: "ประวัติ", icon: <BookOpen className="size-3.5" /> },
          { id: "budget", label: "งบประมาณ", icon: <DollarSign className="size-3.5" /> },
          { id: "safety", label: "ปลอดภัย", icon: <ShieldAlert className="size-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground/60 hover:text-muted-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 space-y-4">
        {/* TAB: Plan */}
        {activeTab === "plan" && (
          <div className="space-y-3">
            {itinerary.map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                      <Clock className="size-3" />
                      {item.time} น.
                    </div>
                    <span className="text-[9px] font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3
                    onClick={() => onPlaceClick(item.title)}
                    className="text-sm font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><MapPin className="size-3" />{item.distance}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" />{item.duration}</span>
                  </div>
                </div>
                <div className="flex border-t border-border">
                  <button
                    onClick={() => onPlaceClick(item.title)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <Navigation className="size-3" />
                    นำทาง
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Culture */}
        {activeTab === "culture" && (
          <div className="space-y-3.5">
            <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200 rounded-2xl p-5 text-center">
              <Landmark className="size-10 text-amber-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-amber-900">ความลึกซึ้งวัฒนธรรมคนพิชัย</h3>
              <p className="text-[11px] text-amber-700/80 mt-1">ประวัติศาสตร์กู้ดินแดน ยอดวีรบุรุษดาบหัก และช่างเหล็กเยอรมันริมแม่น้ำน่าน</p>
            </div>
            {[
              {
                title: "เกียรติภูมิพระยาพิชัยดาบหัก",
                desc: "ทหารเอกคู่พระทัยพระเจ้าตากสิน ผู้ขึ้นชื่อเรื่องวิชามวยไทยสายพิชัย และดาบสองมือที่กอบกู้บ้านด่านสอยศึกจนดาบหักในมือ สะท้อนความไม่ยอมแพ้เพื่อความมั่นคงของชุมชน"
              },
              {
                title: "ศิลปรอยต่อรัชกาลที่ 5 ณ บ้านดารา",
                desc: "สะพานเหล็กปรมินทร์เดิมออกแบบโดยเยอรมนี ถอดแบบโครงเหล็กไขว้ดุดันสะท้อนกลิ่นอายอุตสาหกรรมยุคต้นรัตนโกสินทร์ อีกทั้งยังรอดระเบิดศึกสงครามโลกหนุนฝูงชนเหนือ"
              },
              {
                title: "วัฒนธรรมอาหาร: ห้อยหวาน ขนมวงโบราณ",
                desc: "ขนมแป้งสาดทอดเคลือบน้ำตาลอ้อยเคี่ยวเข้มข้น ดั้งเดิมของตำบลในเมือง เป็นขนม OTOP ท้องถิ่นที่ผู้มาเยือนมักซื้อติดไม้ติดมือเพื่ออุดหนุนชุมชนและพาร์ทเนอร์ร้านค้า"
              }
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-xs font-bold text-foreground mb-1.5">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Budget */}
        {activeTab === "budget" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/20 rounded-2xl p-5 text-center">
              <p className="text-[10px] font-bold text-muted-foreground mb-1">งบประมาณแนะนำรวม</p>
              <span className="text-3xl font-black text-primary">฿{itinerary.length * 90 + 150 + 120}</span>
              <p className="text-[10px] text-muted-foreground mt-1">สำหรับ 1 คน 1 วัน</p>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {[
                { icon: <Utensils className="size-3.5" />, label: "ค่าอาหารและขนม OTOP ท้องถิ่น", amount: itinerary.length * 90, color: "text-orange-500" },
                { icon: <Car className="size-3.5" />, label: "ค่าพาหนะสองแถว / มอเตอร์ไซค์", amount: 120, color: "text-teal-600" },
                { icon: <Gift className="size-3.5" />, label: "ของที่ระลึกและสมทบเสาบุญวัด", amount: 150, color: "text-amber-600" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`size-7 rounded-lg bg-muted flex items-center justify-center shrink-0 ${item.color}`}>{item.icon}</span>
                    <span className="text-[11px] font-semibold text-foreground truncate">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-foreground shrink-0 ml-3">฿{item.amount}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                <span className="text-[11px] font-bold text-foreground">รวมทั้งสิ้น</span>
                <span className="text-sm font-black text-primary">฿{itinerary.length * 90 + 150 + 120}</span>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-emerald-700">งบประมาณโดยประมาณ อาจเปลี่ยนแปลงตามร้านค้าและการเดินทางจริง</p>
              <p className="text-[10px] text-emerald-600 mt-1">ยอดใช้จ่ายของคุณจะช่วยหมุนเวียนเศรษฐกิจในชุมชนพิชัยโดยตรง!</p>
            </div>
          </div>
        )}

        {/* TAB: Safety */}
        {activeTab === "safety" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {[
                { icon: <Phone className="size-4" />, label: "โทรฉุกเฉิน", style: "bg-destructive/10 text-destructive", onClick: () => { window.location.href = "tel:191"; } },
                { icon: <Share2 className="size-4" />, label: "แชร์ตำแหน่ง", style: "bg-amber-50 text-amber-600", onClick: () => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
                    if (navigator.share) {
                      navigator.share({ title: "ตำแหน่งของฉัน (Thong Dee Go)", text: `พิกัดปัจจุบัน: ${coords}` }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(coords).catch(() => {});
                    }
                  }, () => {}, { timeout: 8000 });
                } },
                { icon: <Shield className="size-4" />, label: "Safe Mode", style: "bg-emerald-50 text-emerald-600", onClick: onStartTrip }
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={btn.onClick}
                  className={`flex-1 rounded-xl py-2.5 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${btn.style}`}
                >
                  {btn.icon}
                  <span className="text-[9px] font-bold">{btn.label}</span>
                </button>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold text-amber-800">ข้อควรระวังสำหรับนักท่องเที่ยวเดี่ยว</h4>
                <p className="text-[10px] text-amber-700/80 mt-0.5 leading-relaxed">
                  หลีกเลี่ยงการเดินคนเดียวบริเวณเลียบป่าบ้านดาราหลังสะพานปรมินทร์หลัง 18:00 เนื่องจากแสงไฟค่อนข้างน้อยและไม่มีรั้วกั้นทางรถไฟ ให้เปิดโหมด Safe เสมอ
                </p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {[
                { name: "โรงพยาบาลอำเภอพิชัย", detail: "พิกัดติดเขตในเมือง", tag: "สถานพยาบาลหลัก", tagStyle: "bg-destructive/10 text-rose-500" },
                { name: "สถานีตำรวจภูธรอำเภอพิชัย", detail: "ตั้งอยู่หลังสำนักงานกองอำนวยการตำรวจท่องเที่ยว", tag: "ตำรวจภูธร", tagStyle: "bg-primary/10 text-foreground" },
                { name: "กองบัญชาการรักษาศูนย์ชุมนุมบ้านดารา", detail: "ศูนย์กู้ภัยทางน้ำและช่วยเหลือฉุกเฉินทางแม่น้ำ", tag: "ศูนย์อบต.ดารา", tagStyle: "bg-emerald-50 text-emerald-600" }
              ].map((place, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-bold text-foreground">{place.name}</h4>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{place.detail}</p>
                  </div>
                  <span className={`shrink-0 ml-2 px-2 py-0.5 text-[8px] font-bold rounded ${place.tagStyle}`}>{place.tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
