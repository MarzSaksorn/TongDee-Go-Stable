import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, Camera, Heart, Sparkles, Share2, Award, ArrowRight, User, ChevronLeft } from "lucide-react";
import { Attraction } from "../types";
import { ATTRACTIONS } from "../data";

interface TravelDiaryViewProps {
  checkedInIds: string[];
  selectedInterests: string[];
  onBack: () => void;
  onOpenPassport: () => void;
  locations?: Attraction[];
}

export default function TravelDiaryView({
  checkedInIds,
  selectedInterests,
  onBack,
  onOpenPassport,
  locations
}: TravelDiaryViewProps) {
  const [diaryTitle, setDiaryTitle] = useState("ทริปเดียวเยือนถิ่นพระยาพิชัยดาบหัก");
  const [writtenNote, setWrittenNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStory, setAiStory] = useState<string | null>(null);

  // Resolved list of places checked-in
  const allPlaces = locations && locations.length > 0 ? locations : ATTRACTIONS;
  const checkedInPlaces = allPlaces.filter((a) => checkedInIds.includes(a.id));
  const activeMoods = selectedInterests.length > 0 ? selectedInterests : ["วัฒนธรรมลุ่มลึก", "อาหารท้องถิ่น"];

  const handleGenerateAIStory = () => {
    setIsGenerating(true);
    setAiStory(null);

    setTimeout(() => {
      setIsGenerating(false);
      const placeNames = checkedInPlaces.map(p => p.name).join(", ");
      
      const story = `บันทึกการเดินทางเที่ยวเดี่ยว ณ อำเภอพิชัย จังหวัดอุตรดิตถ์ ในวันนี้เป็นทริปสุดลึกซึ้ง โดยเน้นสเปกหมวดหมู่ "${activeMoods.join(" & ")}" 

ฉันได้ไปเยือนสถานที่เปี่ยมศรัทธาอย่าง ${placeNames || "วัดหน้าพระธาตุและสะพานประวัติศาสตร์หลัก"} ได้กราบไหว้หลวงพ่อโตศักดิ์สิทธิ์ รับไอธรรมชาติอบอุ่นริมแม่น้ำน่าน และสูดอารมณ์ย้อนประวัติศาสตร์ไปในยุคพระยาพิชัยดาบหัก การเป็นนักท่องเที่ยวเดี่ยวในเมืองรองทำให้พบว่าวิถีคนพิชัยน่ารักมาก อาหารมีความเป็นออริจินัล โดยเฉพาะไส้กรอกหมูสมุนไพรและขนมวงที่รสชาติสืบทอดมารุ่นต่อรุ่น เป็นแสตมป์ความสุขในชีวิตที่ประทับลงในใจอย่างแท้จริง!`;
      
      setAiStory(story);
    }, 1200);
  };

  useEffect(() => {
    if (checkedInPlaces.length > 0 && !aiStory) {
      handleGenerateAIStory();
    }
  }, [checkedInIds]);

  return (
    <div 
      id="diary-screen"
      className="flex flex-col h-full w-full bg-background pb-16 overflow-y-auto animate-fade-in-up"
    >
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 pt-12 rounded-b-[32px] relative safe-bleed">
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
        <div className="pl-9">
          <div className="flex items-center gap-1.5 mb-1 text-xs text-amber-300 font-bold leading-none">
            <BookOpen className="w-4 h-4" />
            <span>บันทึกท่องเที่ยวดิจิทัล • Travel Diary</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">สมุดบันทึกของฉัน</h2>
          <p className="text-[11px] text-primary-foreground/70 font-light mt-1">
            รวบรวมรอยเท้าวีรกรรมวัฒนธรรม ประทับตรา OTOP และแต่งเรียบเรียงร้อยอารมณ์ด้วย AI
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Core Diary Notebook Cover Component */}
        <div className="bg-card border border-border p-5 rounded-2xl relative overflow-hidden space-y-4">
          
          {/* Top binder rings mockup */}
          <div className="absolute top-0 left-8 right-8 flex justify-between -translate-y-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-2.5 h-6 bg-slate-400 rounded-full border border-white" />
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center border-b border-border pb-3">
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            
            <div className="flex gap-1">
              {activeMoods.map((m, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-600 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  #{m}
                </span>
              ))}
            </div>
          </div>

          {/* Diary Edit Form Entry */}
          <div className="space-y-3">
            <input 
              type="text"
              value={diaryTitle}
              onChange={(e) => setDiaryTitle(e.target.value)}
              className="w-full text-sm font-bold text-gray-800 bg-transparent border-b border-dashed border-border py-1 focus:border-primary outline-none"
              placeholder="หัวข้อไดอารี่ท่องเที่ยว..."
            />

            {/* AI Generated Prose */}
            {isGenerating ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                <Sparkles className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs font-bold text-gray-600">AI กำลังร่างวรรณกรรมเรียงประจักษ์...</span>
              </div>
            ) : aiStory ? (
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-xs text-amber-950 leading-relaxed font-light italic whitespace-pre-line relative">
                <Sparkles className="absolute right-3 top-3 w-4 h-4 text-amber-500 fill-amber-500" />
                {aiStory}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center text-muted-foreground/70 text-xs">
                <span>ยังไม่มีเรื่องราว เนื่องจากยังไม่ได้เริ่มเช็กอินสถานที่ใดๆ</span>
                <p className="text-[10px] text-gray-300 mt-1">กรุณาเช็คอินผ่าน LINE OA หรือสะสมแสตมป์จากหน้าพาสปอร์ต</p>
              </div>
            )}

            <textarea
              value={writtenNote}
              onChange={(e) => setWrittenNote(e.target.value)}
              className="w-full text-xs text-gray-600 bg-gray-50/40 p-3 rounded-2xl border border-gray-150 font-light resize-none h-20 placeholder:text-muted-foreground/40 focus:outline-primary"
              placeholder="พิมพ์ความประทับใจส่วนตัวเสริมที่นี่... (เช่น พ่อค้าร้านไส้กรอกอัธยาศัยดีเลิศ)"
            />
          </div>

          {/* Action to regenerate */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerateAIStory}
              disabled={isGenerating || checkedInPlaces.length === 0}
              className="flex-1 py-2.5 bg-primary/10 text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>แต่งกลอน/บันทึก AI ใหม่</span>
            </button>
            
            <button
              onClick={onOpenPassport}
              className="py-2.5 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span>ดูพาสปอร์ต</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Photobook Scrapbook of Checked-In Locations */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 font-sans flex items-center gap-1">
            <Camera className="w-4 h-4 text-primary" />
            <span>ภาพความสุขในทริป ({checkedInPlaces.length})</span>
          </h3>

          {checkedInPlaces.length > 0 ? (
            <div className="space-y-3.5">
              {/* Hero photo — first place */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100 group">
                <div className="w-full aspect-[16/9]">
                  <img 
                    src={checkedInPlaces[0].image} 
                    alt={checkedInPlaces[0].name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-sm font-bold text-white">{checkedInPlaces[0].name}</h4>
                  <span className="text-[10px] text-white/80">เช็กอินเรียบร้อย</span>
                </div>
              </div>

              {/* Rest of places in grid */}
              {checkedInPlaces.slice(1).length > 0 && (
                <div className="grid grid-cols-2 gap-3.5">
                  {checkedInPlaces.slice(1).map((place) => (
                    <div key={place.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <img 
                          src={place.image} 
                          alt={place.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-2">
                        <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1">{place.name}</h4>
                        <span className="text-[8px] text-muted-foreground/70">เช็กอินเรียบร้อย</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-card border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-muted-foreground/70" />
                <p>คุณจำเป็นต้องเริ่มเช็กอินสถานที่ในพิชัยเพื่อรวบรวมรูปภาพในสมุดความทรงจำ!</p>
              </div>
            </div>
          )}
        </div>

        {/* Companion Advice Box */}
        <div className="p-3.5 bg-gradient-to-tr from-rose-500/5 to-rose-500/10 border border-rose-100 rounded-2xl flex items-start gap-2 text-[10px] text-rose-800 leading-relaxed">
          <Heart className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5 fill-rose-500 animate-pulse" />
          <span>
            <strong>Traveler's Joy:</strong> บันทึกท่องเที่ยวส่วนตัวของคุณจะเพิ่มพูนความรักและกระตุ้นการบอกเล่าสิ่งดีๆ ของ อ.พิชัย จ.อุตรดิตถ์ ให้กับผู้คนที่เดินทางคนเดียวอื่นๆ แนะนำให้แชร์ออกทางสื่อสังคมออนไลน์เพื่อสะสมแต้ม!
          </span>
        </div>
      </div>
    </div>
  );
}
