import React from "react";
import { Sparkles, MessageCircle } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface FloatingChatBubbleProps {
  onClick: () => void;
  visible?: boolean;
}

export default function FloatingChatBubble({ onClick, visible = true }: FloatingChatBubbleProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className={`absolute right-5 bottom-[calc(88px+env(safe-area-inset-bottom))] z-40 text-white py-3 px-4 rounded-full flex items-center gap-2 transition-all duration-300 group hover:-translate-y-1 active:scale-95 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Open Thong Dee Go Buddy chat"
    >
      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="text-[11px] font-bold">{t("chat.bubbleLabel") || "Ask AI"}</span>
      <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5">
        <Sparkles className="w-2.5 h-2.5" />
      </div>
    </button>
  );
}
