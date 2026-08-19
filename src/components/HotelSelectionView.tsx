import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, Search, Star, MapPin, Bed, Wifi, Car, Coffee, Snowflake, Tv, Waves, Home, Building2, Trees, Hotel, Bookmark } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Accommodation } from "../types";
import { useLanguage } from "../i18n/LanguageContext";
import { getDistanceKm, formatDistanceKm } from "../utils/distance";
import { useToast } from "./ToastProvider";
gsap.registerPlugin(ScrollTrigger);

const propertyTypeIcons: Record<string, React.ReactNode> = {
  hotel: <Hotel className="w-3.5 h-3.5" />,
  resort: <Trees className="w-3.5 h-3.5" />,
  homestay: <Home className="w-3.5 h-3.5" />,
  guesthouse: <Home className="w-3.5 h-3.5" />,
  apartment: <Building2 className="w-3.5 h-3.5" />,
};

const propertyTypeLabels: Record<string, string> = {
  hotel: "โรงแรม",
  resort: "รีสอร์ท",
  homestay: "โฮมสเตย์",
  guesthouse: "เกสท์เฮาส์",
  apartment: "อพาร์ทเม้นท์",
};

const amenityIcons: Record<string, React.ReactNode> = {
  "WiFi": <Wifi className="w-3 h-3" />,
  "ที่จอดรถ": <Car className="w-3 h-3" />,
  "อาหารเช้า": <Coffee className="w-3 h-3" />,
  "เครื่องปรับอากาศ": <Snowflake className="w-3 h-3" />,
  "ทีวีจอแบน": <Tv className="w-3 h-3" />,
  "สระว่ายน้ำ": <Waves className="w-3 h-3" />,
  "ฟิตเนส": <Waves className="w-3 h-3" />,
};

const propertyTypes = ["ทั้งหมด", "hotel", "resort", "homestay", "guesthouse"];

function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "..." : str;
}

interface HotelSelectionViewProps {
  accommodations: Accommodation[];
  userLocation?: { lat: number; lng: number } | null;
  savedItems?: { id: string; kind: "place" | "hotel" }[];
  onToggleSave?: (kind: "place" | "hotel", id: string) => void;
  onBack: () => void;
  onSelectAccommodation: (id: string) => void;
}

export default function HotelSelectionView({
  accommodations,
  userLocation,
  savedItems = [],
  onToggleSave,
  onBack,
  onSelectAccommodation,
}: HotelSelectionViewProps) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activePropertyType, setActivePropertyType] = useState("ทั้งหมด");

  const allAccommodations = useMemo(() => {
    let filtered = accommodations;

    if (activePropertyType !== "ทั้งหมด") {
      filtered = filtered.filter((a) => a.propertyType === activePropertyType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.address.toLowerCase().includes(q)
      );
    }

    return filtered.map((item) => ({
      ...item,
      computedDistance: (() => {
        if (!userLocation) return null;
        const km = getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
        return formatDistanceKm(km, language);
      })(),
    }));
  }, [accommodations, activePropertyType, searchQuery, userLocation, language]);

  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
      gsap.fromTo(searchRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: "power3.out" });
      gsap.fromTo(filterRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.15, ease: "power3.out" });
      if (listRef.current) {
        gsap.fromTo(listRef.current.children,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power3.out",
            scrollTrigger: { trigger: listRef.current, start: "top 90%", toggleActions: "play none none reverse", scroller: "#hotel-list-scroll" }
          }
        );
      }
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([headerRef.current, searchRef.current, filterRef.current], { opacity: 1, y: 0 });
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div ref={headerRef} className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground transition-all active:scale-90 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {language === "TH" ? "ที่พัก" : "Hotels & Stays"}
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              {language === "TH"
                ? `พบ ${allAccommodations.length} แห่งในอำเภอพิชัย`
                : `${allAccommodations.length} places in Phichai`}
            </p>
          </div>
        </div>
      </div>

      <div ref={searchRef} className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "TH" ? "ค้นหาที่พัก..." : "Search hotels..."}
            className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div ref={filterRef} className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {propertyTypes.map((type) => {
            const isActive = activePropertyType === type;
            const label = type === "ทั้งหมด"
              ? (language === "TH" ? "ทั้งหมด" : "All")
              : propertyTypeLabels[type] || type;
            return (
              <button
                key={type}
                onClick={() => setActivePropertyType(type)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {type !== "ทั้งหมด" && propertyTypeIcons[type]}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4" id="hotel-list-scroll">
        {allAccommodations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Bed className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold text-muted-foreground">
              {language === "TH" ? "ไม่พบที่พัก" : "No accommodations found"}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {language === "TH" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "Try a different search or filter"}
            </p>
          </div>
        ) : (
          <div ref={listRef} className="flex flex-col gap-3 pt-1">
            {allAccommodations.map((item) => {
              const propertyIcon = propertyTypeIcons[item.propertyType] || <Building2 className="w-3.5 h-3.5" />;
              const propertyLabel = propertyTypeLabels[item.propertyType] || item.propertyType;
              const primaryImage = item.images.length > 0
                ? item.images[0]
                : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80";
              const displayedAmenities = item.amenities.slice(0, 4);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAccommodation(item.id)}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all hover:border-primary/30"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={primaryImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600/90 text-white text-[9px] font-bold rounded-full">
                        {propertyIcon}
                        {propertyLabel}
                      </span>
                      {item.rating > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-400/90 text-foreground text-[9px] font-bold rounded-full">
                          <Star className="w-2.5 h-2.5 fill-foreground" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-sm drop-shadow-sm leading-tight">{item.name}</h3>
                      {item.priceRange && (
                        <p className="text-white/80 text-[10px] font-semibold mt-0.5 drop-shadow-sm">{item.priceRange}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const isNowSaved = savedItems.some((s) => s.kind === "hotel" && s.id === item.id);
                        showToast(isNowSaved ? "ลบออกจากรายการบันทึกแล้ว" : "บันทึกที่พักแล้ว", "success");
                        onToggleSave?.("hotel", item.id);
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer z-10 ${
                        savedItems.some((s) => s.kind === "hotel" && s.id === item.id)
                          ? "bg-amber-400 border-amber-300 text-foreground"
                          : "bg-black/45 hover:bg-black/65 text-white border-white/15"
                      }`}
                      title={
                        savedItems.some((s) => s.kind === "hotel" && s.id === item.id)
                          ? "ลบออกจากรายการบันทึก"
                          : "บันทึกที่พัก"
                      }
                    >
                      <Bookmark className={`w-4 h-4 ${savedItems.some((s) => s.kind === "hotel" && s.id === item.id) ? "fill-foreground" : ""}`} />
                    </button>
                  </div>
                  <div className="p-3.5 space-y-2.5">
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {truncate(item.description, 120)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                      {item.computedDistance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.computedDistance}
                        </span>
                      )}
                      {item.address && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.address.split(",")[0]}</span>
                        </span>
                      )}
                    </div>
                    {displayedAmenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {displayedAmenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground text-[9px] font-medium rounded-full"
                          >
                            {amenityIcons[amenity]}
                            {amenity}
                          </span>
                        ))}
                        {item.amenities.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
                            +{item.amenities.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
