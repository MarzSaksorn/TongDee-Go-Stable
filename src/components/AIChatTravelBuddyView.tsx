import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Volume2, User, ChevronRight, HelpCircle, MapPin, BookOpen, Utensils, Home, Compass, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "../types";

interface AIChatTravelBuddyViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  onBack?: () => void;
}

export default function AIChatTravelBuddyView({
  messages,
  onSendMessage,
  isSending,
  onBack
}: AIChatTravelBuddyViewProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { id: "qp1", text: "แนะนำที่กิน" },
    { id: "qp2", text: "จุดถ่ายรูป" },
    { id: "qp3", text: "เล่าเรื่องประวัติ" },
    { id: "qp4", text: "หาที่พัก" },
    { id: "qp5", text: "ช่วยวางแผนใหม่" }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleQuickSend = (text: string) => {
    onSendMessage(text);
  };

  // Keep scroll focused on newest bubbles
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  return (
    <div 
      id="chat-screen"
      className="flex flex-col h-full w-full bg-background pb-16 overflow-hidden animate-fade-in-up"
    >
      {/* Head banner */}
      <div className="bg-primary text-primary-foreground p-4 pt-6 flex items-center shadow-md relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary-foreground/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary-foreground/10" />
        <div className="flex-1 flex items-center gap-3 relative z-10">
          <div className="relative w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-inner border border-amber-400 text-primary">
            <Compass className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold flex items-center gap-1">
              Thong Dee Go Buddy <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            </h3>
            <span className="text-[10px] text-primary-foreground/70">คู่หู AI นำเที่ยวเมืองรองพิชัย • ออนไลน์</span>
          </div>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="relative z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-primary-foreground transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>

      {/* Suggestion Quick Chips */}
      <div className="flex gap-2 px-4 py-3 bg-card border-b border-border overflow-x-auto shrink-0 scrollbar-none">
        {quickPrompts.map((p) => (
          <button
            key={p.id}
            onClick={() => handleQuickSend(p.text)}
            className="px-2.5 py-1.5 bg-muted hover:bg-primary/10 border border-border text-[10px] font-bold text-muted-foreground hover:text-primary rounded-xl shrink-0 transition-colors"
          >
            {p.text}
          </button>
        ))}
      </div>

      {/* Messages Scrollbox */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3.5"
      >
        {messages.map((m) => {
          const isBuddy = m.role === "buddy";
          return (
            <div 
              key={m.id}
              className={`flex gap-2 w-full max-w-[85%] ${isBuddy ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs shrink-0 ${
                isBuddy ? "bg-card border-primary/20 text-rose-500" : "bg-primary text-primary-foreground border-transparent"
              }`}>
                {isBuddy ? <Compass className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Text Bubble */}
              <div 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isBuddy 
                    ? "bg-card text-foreground rounded-tl-none border border-border" 
                    : "bg-primary text-primary-foreground rounded-tr-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className={`text-[8px] mt-1 text-right font-mono ${
                  isBuddy ? "text-muted-foreground/70" : "text-primary-foreground/70"
                }`}>
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state quick actions */}
        {messages.length <= 1 && !isSending && (
          <div className="flex flex-col gap-2 p-4 mt-6 items-center">
            <h4 className="text-[11px] font-bold text-muted-foreground mb-2">ลองพิมพ์ถามหรือเลือกด้านล่าง:</h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              <button onClick={() => handleQuickSend('จัดทริปพิชัยให้หน่อยค่ะ')} className="col-span-2 bg-card border border-border rounded-xl p-3 text-left hover:border-primary transition-colors group">
                <span className="block mb-1 text-primary"><Compass className="w-5 h-5" /></span>
                <span className="text-[10px] font-bold text-foreground group-hover:text-primary">จัดทริป 1 วัน</span>
                <span className="text-[9px] text-muted-foreground/70 block truncate">แนะนำสถานที่ท่องเที่ยว</span>
              </button>
              <button onClick={() => handleQuickSend('เล่าประวัติวัดหน้าพระธาตุให้ฟังหน่อย')} className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary transition-colors group">
                <span className="block mb-1 text-primary"><BookOpen className="w-5 h-5" /></span>
                <span className="text-[10px] font-bold text-foreground group-hover:text-primary">เจาะลึกวัฒนธรรม</span>
                <span className="text-[9px] text-muted-foreground/70 block truncate">ประวัติศาสตร์พิชัย</span>
              </button>
              <button onClick={() => handleQuickSend('มีขนมท้องถิ่นอะไรอร่อยบ้าง?')} className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary transition-colors group">
                <span className="block mb-1 text-primary"><Utensils className="w-5 h-5" /></span>
                <span className="text-[10px] font-bold text-foreground group-hover:text-primary">ของกิน OTOP</span>
                <span className="text-[9px] text-muted-foreground/70 block truncate">ขนมวง ขนมไทยพื้นบ้าน</span>
              </button>
            </div>
            <button onClick={() => handleQuickSend('หาที่พักในตัวอำเภอพิชัย')} className="w-full bg-card border border-border rounded-xl p-3 text-left hover:border-primary transition-colors group">
              <span className="block mb-1 text-primary"><Home className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold text-foreground group-hover:text-primary">ที่พัก/โฮมสเตย์</span>
              <span className="text-[9px] text-muted-foreground/70 block truncate">แนะนำที่พักใกล้สถานี</span>
            </button>
          </div>
        )}

        {/* Loading/typing indicator bubbles */}
        {isSending && (
          <div className="flex gap-2 mr-auto w-full max-w-[85%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-primary/20 shrink-0 text-primary">
              <Compass className="w-4 h-4" />
            </div>
            <div className="p-4 bg-card border border-border rounded-2xl rounded-tl-none">
              <div className="flex gap-1.5 items-center justify-center h-4 py-1">
                <div className="w-2.5 h-2.5 bg-muted-foreground/30 rounded-full animate-pulse" />
                <div className="w-2.5 h-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat user input box */}
      <div className="p-3 bg-card border-t border-border sticky bottom-0 z-10">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="คุยกับบัดดี้ แนะนำขนมวง ข้อมูลดาบหัก..."
            className="flex-1 text-xs font-semibold p-3.5 bg-muted border border-border outline-none text-foreground focus:border-primary focus:ring-4 focus:ring-primary/20"
            disabled={isSending}
          />
          <Button 
            type="submit"
            size="icon"
            disabled={isSending || !inputText.trim()}
            className="w-12 rounded-2xl active:scale-95 transition-all disabled:opacity-55 disabled:cursor-not-allowed"
          >
            <Send className="w-4.5 h-4.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
