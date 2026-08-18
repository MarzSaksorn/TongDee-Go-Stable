import React, { useState } from "react";
import { Sparkles, Compass, MapPin, AlertCircle, ChevronLeft, Clock, Footprints, Users, Wallet, Landmark, Utensils, Camera, Heart, Trees, ShoppingBag, Church } from "lucide-react";
import { Attraction, TripPlanResult, TripPlanStop, TripBudgetLevel } from "../types";
import { calculateTripCost } from "../utils/tripCost";

interface AITripPlannerViewProps {
  locations: Attraction[];
  onTripGenerated: (result: TripPlanResult) => void;
  displayName?: string;
  onBack?: () => void;
}

function generateLocalTripPlan({
  locations,
  interests,
  duration,
  pace,
  startPoint,
  specialRequest
}: {
  locations: Attraction[];
  interests: string[];
  duration: "half-day" | "1-day" | "2-days";
  pace: "relaxed" | "balanced" | "packed";
  startPoint: string;
  specialRequest: string;
}): TripPlanResult {
  const activeLocations = locations;

  const scoredLocations = activeLocations.map((place) => {
    const text = [
      place.name,
      place.locationCategory,
      place.desc,
      place.historySummary,
      place.culturalHighlights,
      place.needToKnow
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const score = interests.reduce((total, interest) => {
      const normalizedInterest = interest.toLowerCase();
      let match = false;
      if (text.includes(normalizedInterest)) match = true;
      if (normalizedInterest.includes("วัด") && (text.includes("วัด") || text.includes("เจดีย์") || text.includes("หลวงพ่อ") || text.includes("พระธาตุ"))) match = true;
      if (normalizedInterest.includes("อาหาร") && (text.includes("อาหาร") || text.includes("กิน") || text.includes("อร่อย") || text.includes("ขนม") || text.includes("otop"))) match = true;
      if (normalizedInterest.includes("ของฝาก") && (text.includes("ตลาด") || text.includes("otop") || text.includes("ของฝาก") || text.includes("ช้อป") || text.includes("ของดี"))) match = true;
      if (normalizedInterest.includes("ประวัติ") && (text.includes("ประวัติ") || text.includes("ศาล") || text.includes("อนุสรณ์") || text.includes("เก่า") || text.includes("โบราณ"))) match = true;

      return match ? total + 2 : total;
    }, 0) + (place.rating ? Number(place.rating) / 5 : 0);

    return {
      place,
      score
    };
  });

  const count =
    duration === "half-day"
      ? pace === "packed"
        ? 4
        : 3
      : duration === "2-days"
        ? pace === "packed"
          ? 8
          : 6
        : pace === "packed"
          ? 6
          : 4;

  const selectedPlaces = scoredLocations
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.place);

  return buildTripResult(selectedPlaces, {
    interests,
    duration,
    pace,
    startPoint,
    specialRequest
  });
}

function buildTripResult(
  selectedPlaces: Attraction[],
  { interests, duration, pace, startPoint, specialRequest }: {
    interests: string[];
    duration: "half-day" | "1-day" | "2-days";
    pace: "relaxed" | "balanced" | "packed";
    startPoint: string;
    specialRequest: string;
  }
): TripPlanResult {
  const stops: TripPlanStop[] = [];

  const halfDayTimes = ["09:00 น.", "10:30 น.", "12:00 น.", "13:30 น."];
  const oneDayTimes = ["09:00 น.", "10:30 น.", "12:00 น.", "14:00 น.", "15:30 น.", "17:00 น."];

  selectedPlaces.forEach((place, index) => {
    let timeLabel = "";
    if (duration === "half-day") {
      timeLabel = halfDayTimes[index] || "ช่วงถัดไป";
    } else if (duration === "1-day") {
      timeLabel = oneDayTimes[index] || "ช่วงถัดไป";
    } else {
      const halfIndex = Math.ceil(selectedPlaces.length / 2);
      const isDay2 = index >= halfIndex;
      const dayNum = isDay2 ? 2 : 1;
      const timeIdx = isDay2 ? index - halfIndex : index;
      const timeStr = oneDayTimes[timeIdx] || "15:30 น.";
      timeLabel = `วันที่ ${dayNum} - ${timeStr}`;
    }

    stops.push({
      id: `${index}-${place.id}`,
      placeId: place.id,
      name: place.name,
      category: place.locationCategory || "ท่องเที่ยว",
      description: place.desc || "",
      imageUrl: place.image || "",
      latitude: place.lat,
      longitude: place.lng,
      timeLabel,
      durationLabel: pace === "relaxed" ? "1.5 - 2 ชั่วโมง" : pace === "packed" ? "45 - 60 นาที" : "1 - 1.5 ชั่วโมง",
      note: `สถานที่แนะนำพิเศษสอดคล้องกับความสนใจ '${interests.join(", ")}' และมีความพร้อมสำหรับการเยือนในสไตล์ '${pace}'`
    });
  });

  const durationText = duration === "half-day" ? "ครึ่งวัน" : duration === "2-days" ? "2 วัน 1 คืน" : "1 วันเต็ม";
  const paceText = pace === "relaxed" ? "สบายๆ" : pace === "packed" ? "ตารางอัดแน่น" : "สมดุล";

  return {
    title: `ทริปนำเที่ยวเมืองรองอุตรดิตถ์ (${durationText})`,
    summary: `แผนการเดินทางท่องเที่ยวรอบอำเภอพิชัยที่ออกแบบเพื่อสอดรับกับสไตล์ '${paceText}' โดยคัดสรรแหล่งท่องเที่ยวจากความสนใจเด่นในหมวด '${interests.join(", ")}' ปลอดภัย ทันสมัย และลึกซึ้ง`,
    duration,
    pace,
    interests,
    startPoint: startPoint || "สถานีรถไฟพิชัย",
    stops,
    tips: [
      "สวมเสื้อผ้าที่ระบายอากาศได้ดีเนื่องจากสภาพอากาศยามบ่ายอาจร้อนอบอ้าว",
      "แนะนำให้รายงานตำแหน่งหรือเปิด 'Safety Mode' บนแอปตลอดการเดินทาง",
      "อุดหนุนของฝากท้องถิ่น OTOP และอาหารพื้นบ้านเพื่อกระจายรายได้สู่ชุมชนพิชัยโดยตรง",
      "หากเดินทางด้วยรถสองแถว ควรเช็คตารางเดินรถหรือเบอร์โทรติดต่อไว้ล่วงหน้า"
    ]
  };
}

const INTEREST_ICONS: Record<string, React.ReactNode> = {
  "วัด/ศาสนา": <Church className="size-4" />,
  "ประวัติศาสตร์": <Landmark className="size-4" />,
  "ธรรมชาติ": <Trees className="size-4" />,
  "อาหารท้องถิ่น": <Utensils className="size-4" />,
  "ของฝาก/ตลาดชุมชน": <ShoppingBag className="size-4" />,
  "ถ่ายรูป": <Camera className="size-4" />,
  "ครอบครัว": <Heart className="size-4" />,
  "วัฒนธรรม": <Compass className="size-4" />,
};

export default function AITripPlannerView({
  locations,
  onTripGenerated,
  displayName = "นักท่องเที่ยว",
  onBack
}: AITripPlannerViewProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [tripDuration, setTripDuration] = useState<"half-day" | "1-day" | "2-days">("1-day");
  const [travelPace, setTravelPace] = useState<"relaxed" | "balanced" | "packed">("balanced");
  const [startPoint, setStartPoint] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelers, setTravelers] = useState<number>(1);
  const [budgetLevel, setBudgetLevel] = useState<TripBudgetLevel>("medium");

  const interestChips = [
    "วัด/ศาสนา",
    "ประวัติศาสตร์",
    "ธรรมชาติ",
    "อาหารท้องถิ่น",
    "ของฝาก/ตลาดชุมชน",
    "ถ่ายรูป",
    "ครอบครัว",
    "วัฒนธรรม"
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((x) => x !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerateTrip = async () => {
    if (selectedInterests.length === 0) {
      setError("กรุณาเลือกความสนใจอย่างน้อย 1 อย่าง");
      return;
    }

    if (!locations || locations.length === 0) {
      setError("ยังไม่มีข้อมูลสถานที่สำหรับสร้างแผนเที่ยว");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      let result: TripPlanResult | null = null;

      try {
        const response = await fetch("/api/trip-planner/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            interests: selectedInterests,
            duration: tripDuration,
            pace: travelPace,
            startPoint,
            specialRequest,
            locations
          })
        });

        if (response.ok) {
          const data = await response.json();
          result = data.result;
        } else {
          console.warn("AI trip planner API response error, switching to fallback");
        }
      } catch (apiError) {
        console.warn("AI trip planner API unavailable, using local fallback", apiError);
      }

      if (!result) {
        result = generateLocalTripPlan({
          locations,
          interests: selectedInterests,
          duration: tripDuration,
          pace: travelPace,
          startPoint,
          specialRequest
        });
      }

      const costEstimate = calculateTripCost({
        stopCount: result.stops?.length ?? 0,
        travelers,
        duration: tripDuration,
        pace: travelPace,
        budgetLevel
      });

      const resultWithCost = {
        ...result,
        costEstimate
      };

      onTripGenerated(resultWithCost);

    } catch (err) {
      console.error(err);
      setError("ไม่สามารถสร้างแผนเที่ยวได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerateTrip();
  };

  return (
    <div
      id="planner-screen"
      className="flex flex-col h-full w-full bg-background overflow-y-auto pb-[calc(96px+env(safe-area-inset-bottom))]"
    >
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground px-5 pt-12 pb-6 relative overflow-hidden shrink-0 safe-bleed">
        <div className="absolute top-[-20%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 rounded-full bg-white/8 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="size-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground transition-colors cursor-pointer shrink-0 backdrop-blur-xs"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">แผนเที่ยวของคุณ</h1>
            <p className="text-[11px] text-primary-foreground/70 mt-0.5 truncate">บอกความชอบเรา — AI จัดทริปให้คุณ</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-6 space-y-5">
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Interests */}
          <section className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">1</span>
              <h3 className="text-xs font-bold text-foreground">ความสนใจของคุณ</h3>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">เลือกความชอบเพื่อให้ AI จัดสถานที่ให้ตรงใจ</p>
            <div className="flex flex-wrap gap-2">
              {interestChips.map((chip) => {
                const selected = selectedInterests.includes(chip);
                return (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => toggleInterest(chip)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                      selected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span className={selected ? "text-primary-foreground/80" : "text-primary"}>{INTEREST_ICONS[chip]}</span>
                    {chip}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Duration & Pace */}
          <section className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">2</span>
              <h3 className="text-xs font-bold text-foreground">ระยะเวลาและสไตล์</h3>
            </div>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Clock className="size-3" /> ระยะเวลา
                </p>
                <div className="flex gap-2">
                  {[
                    { id: "half-day", label: "ครึ่งวัน", icon: "☀️" },
                    { id: "1-day", label: "1 วัน", icon: "🌤" },
                    { id: "2-days", label: "2 วัน", icon: "🌙" }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTripDuration(item.id as any)}
                      className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                        tripDuration === item.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Footprints className="size-3" /> ความเร็ว
                </p>
                <div className="flex gap-2">
                  {[
                    { id: "relaxed", label: "สบายๆ" },
                    { id: "balanced", label: "กำลังดี" },
                    { id: "packed", label: "อัดแน่น" }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTravelPace(item.id as any)}
                      className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                        travelPace === item.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Budget */}
          <section className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">3</span>
              <h3 className="text-xs font-bold text-foreground">งบประมาณและผู้เดินทาง</h3>
            </div>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" /> จำนวนผู้เดินทาง
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelers((c) => Math.max(1, c - 1))}
                    className="size-8 flex items-center justify-center rounded-lg bg-muted hover:bg-accent text-sm font-extrabold text-foreground transition-all active:scale-95 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-extrabold text-foreground">{travelers}</span>
                  <button
                    type="button"
                    onClick={() => setTravelers((c) => c + 1)}
                    className="size-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-extrabold hover:opacity-90 transition-all active:scale-95 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[11px] font-medium text-foreground flex items-center gap-1.5 mb-2">
                  <Wallet className="size-3.5 text-muted-foreground" /> ระดับงบประมาณ
                </span>
                <div className="flex gap-2">
                  {[
                    { id: "low", label: "ประหยัด" },
                    { id: "medium", label: "มาตรฐาน" },
                    { id: "high", label: "สบาย" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBudgetLevel(item.id as "low" | "medium" | "high")}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                        budgetLevel === item.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Step 4: Extra */}
          <section className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">4</span>
              <h3 className="text-xs font-bold text-foreground">ข้อมูลเพิ่มเติม (ไม่จำเป็น)</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-muted border border-border rounded-xl focus-within:border-primary transition-colors">
                <MapPin className="size-4 text-primary shrink-0" />
                <input
                  type="text"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="text-[11px] font-semibold text-foreground bg-transparent flex-1 outline-none placeholder:text-muted-foreground/50"
                  placeholder="จุดเริ่มต้น เช่น สถานีรถไฟพิชัย"
                />
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-muted border border-border rounded-xl focus-within:border-primary transition-colors">
                <Sparkles className="size-4 text-amber-500 shrink-0" />
                <input
                  type="text"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="text-[11px] font-semibold text-foreground bg-transparent flex-1 outline-none placeholder:text-muted-foreground/50"
                  placeholder="คำขอพิเศษ เช่น เลี่ยงทางชัน"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            <Sparkles className="size-4 fill-white" />
            {isGenerating ? "กำลังสร้าง..." : "สร้างแผนเที่ยว"}
          </button>
        </form>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="rounded-2xl bg-card border border-border p-6 text-center space-y-3">
            <div className="relative size-14 mx-auto">
              <div className="absolute inset-0 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
              <Compass className="size-6 text-primary absolute inset-0 m-auto" />
            </div>
            <h4 className="text-sm font-bold text-foreground">AI กำลังจัดแผนเที่ยวให้คุณ</h4>
            <p className="text-[11px] text-muted-foreground">วิเคราะห์สถานที่และคำนวณเส้นทางที่ดีที่สุด</p>
          </div>
        )}
      </div>
    </div>
  );
}
