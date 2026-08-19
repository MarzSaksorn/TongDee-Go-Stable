import React, { useState } from "react";
import { ChevronLeft, Bookmark, MapPin, Building2, Bed, Landmark, Heart } from "lucide-react";
import { Attraction, Accommodation } from "../types";
import { useLanguage } from "../i18n/LanguageContext";
import type { SavedItem } from "../services/savedService";

interface SavedPlacesViewProps {
  savedItems: SavedItem[];
  locations?: Attraction[];
  accommodations?: Accommodation[];
  onToggleSave: (kind: "place" | "hotel", id: string) => void;
  onBack: () => void;
  onOpenPlace: (placeId: string) => void;
  onOpenHotel: (accommodationId: string) => void;
}

const propertyTypeLabels: Record<string, string> = {
  hotel: "โรงแรม",
  resort: "รีสอร์ท",
  homestay: "โฮมสเตย์",
  guesthouse: "เกสท์เฮาส์",
  apartment: "อพาร์ทเม้นท์",
};

export default function SavedPlacesView({
  savedItems,
  locations = [],
  accommodations = [],
  onToggleSave,
  onBack,
  onOpenPlace,
  onOpenHotel
}: SavedPlacesViewProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"place" | "hotel">("place");

  const savedPlaces = savedItems
    .filter((s) => s.kind === "place")
    .map((s) => locations.find((p) => p.id === s.id))
    .filter((p): p is Attraction => Boolean(p));

  const savedHotels = savedItems
    .filter((s) => s.kind === "hotel")
    .map((s) => accommodations.find((a) => a.id === s.id))
    .filter((a): a is Accommodation => Boolean(a));

  const empty = (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <Heart className="w-10 h-10 text-muted-foreground/30 mb-3" />
      <p className="text-xs font-bold text-muted-foreground">
        {language === "TH" ? "ยังไม่มีรายการบันทึก" : "Nothing saved yet"}
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[240px]">
        {language === "TH"
          ? "กดปุ่มบุ๊คมาร์กบนหน้ารายละเอียดสถานที่หรือที่พักเพื่อบันทึกไว้ที่นี่"
          : "Tap the bookmark on a place or stay detail page to save it here"}
      </p>
    </div>
  );

  return (
    <div
      id="saved-places-screen"
      className="flex flex-col h-full w-full bg-background overflow-y-auto pb-[calc(96px+env(safe-area-inset-bottom))] animate-fade-in-up"
    >
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground px-5 pt-12 pb-5 relative overflow-hidden shrink-0 safe-bleed">
        <div className="absolute top-[-20%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="size-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground transition-colors cursor-pointer shrink-0 backdrop-blur-xs"
            title="ย้อนกลับ"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{language === "TH" ? "รายการบันทึก" : "Saved Places"}</h1>
            <p className="text-[11px] text-primary-foreground/70 mt-0.5 truncate">
              {language === "TH" ? "สถานที่และที่พักที่คุณชื่นชอบ" : "Your favorite places and stays"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex bg-card border-b border-border sticky top-0 z-20">
        <button
          type="button"
          onClick={() => setActiveTab("place")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === "place"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          }`}
        >
          <Landmark className="size-3.5" />
          {language === "TH" ? "สถานที่" : "Places"}
          <span className="text-[9px] font-extrabold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
            {savedPlaces.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hotel")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === "hotel"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          }`}
        >
          <Bed className="size-3.5" />
          {language === "TH" ? "ที่พัก" : "Stays"}
          <span className="text-[9px] font-extrabold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
            {savedHotels.length}
          </span>
        </button>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 space-y-3">
        {activeTab === "place" && (
          savedPlaces.length === 0 ? empty : savedPlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => onOpenPlace(place.id)}
              className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all hover:border-primary/30"
            >
              <div className="relative h-36 overflow-hidden bg-muted">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-12">
                  <h3 className="text-white font-bold text-sm drop-shadow-sm leading-tight">{place.name}</h3>
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-white/85">
                    <MapPin className="w-3 h-3" />
                    {place.locationCategory}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave("place", place.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-400 border border-amber-300 text-foreground flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
                  title={language === "TH" ? "ลบออกจากรายการบันทึก" : "Remove from saved"}
                >
                  <Bookmark className="w-4 h-4 fill-foreground" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{place.desc}</p>
              </div>
            </div>
          ))
        )}

        {activeTab === "hotel" && (
          savedHotels.length === 0 ? empty : savedHotels.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => onOpenHotel(hotel.id)}
              className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all hover:border-primary/30"
            >
              <div className="relative h-36 overflow-hidden bg-muted">
                <img
                  src={hotel.images.length > 0 ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-12">
                  <h3 className="text-white font-bold text-sm drop-shadow-sm leading-tight">{hotel.name}</h3>
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-white/85">
                    <Building2 className="w-3 h-3" />
                    {propertyTypeLabels[hotel.propertyType] || hotel.propertyType}
                    {hotel.priceRange ? ` • ${hotel.priceRange}` : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave("hotel", hotel.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-400 border border-amber-300 text-foreground flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
                  title={language === "TH" ? "ลบออกจากรายการบันทึก" : "Remove from saved"}
                >
                  <Bookmark className="w-4 h-4 fill-foreground" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{hotel.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
