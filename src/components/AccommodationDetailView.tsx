import React, { useState, useMemo } from "react";
import { ChevronLeft, Star, MapPin, Phone, Navigation, Clock, Globe, MessageSquare, Check, Wifi, Car, Coffee, Snowflake, Tv, Dumbbell, Waves, Bike, AlarmCheck, Ban, Hotel, Home, Building2, Trees, Bookmark } from "lucide-react";
import { Accommodation } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDistanceKm, formatDistanceKm } from "../utils/distance";

interface AccommodationDetailViewProps {
  accommodation: Accommodation;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onBack: () => void;
  onNavigate?: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

const amenityIcons: Record<string, React.ReactNode> = {
  "WiFi": <Wifi className="w-4 h-4" />,
  "ที่จอดรถ": <Car className="w-4 h-4" />,
  "อาหารเช้า": <Coffee className="w-4 h-4" />,
  "เครื่องปรับอากาศ": <Snowflake className="w-4 h-4" />,
  "ทีวีจอแบน": <Tv className="w-4 h-4" />,
  "สระว่ายน้ำ": <Waves className="w-4 h-4" />,
  "จักรยานให้ยืม": <Bike className="w-4 h-4" />,
  "ฟิตเนส": <Dumbbell className="w-4 h-4" />,
};

const propertyTypeIcons: Record<string, React.ReactNode> = {
  hotel: <Hotel className="w-4 h-4" />,
  resort: <Trees className="w-4 h-4" />,
  homestay: <Home className="w-4 h-4" />,
  guesthouse: <Home className="w-4 h-4" />,
  apartment: <Building2 className="w-4 h-4" />,
};

const propertyTypeLabels: Record<string, string> = {
  hotel: "โรงแรม",
  resort: "รีสอร์ท",
  homestay: "โฮมสเตย์",
  guesthouse: "เกสท์เฮาส์",
  apartment: "อพาร์ทเม้นท์",
};

export default function AccommodationDetailView({
  accommodation,
  isSaved,
  onToggleSave,
  onBack,
  onNavigate,
  userLocation
}: AccommodationDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  const images = accommodation.images.length > 0
    ? accommodation.images
    : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"];

  const computedDistanceLabel = useMemo(() => {
    if (!userLocation) return "";
    const km = getDistanceKm(userLocation.lat, userLocation.lng, accommodation.lat, accommodation.lng);
    return formatDistanceKm(km, "TH");
  }, [userLocation, accommodation]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_blank", "noopener,noreferrer");
  };

  const handleOpenLine = (lineId: string) => {
    window.open(`https://line.me/R/ti/p/${lineId.replace("@", "")}`, "_blank", "noopener,noreferrer");
  };

  const handleOpenLink = (url: string) => {
    try {
      const parsed = new URL(url);
      if (!["https:", "http:"].includes(parsed.protocol)) return;
    } catch {
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${accommodation.lat},${accommodation.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onNavigate?.();
  };

  const propertyIcon = propertyTypeIcons[accommodation.propertyType] || <Building2 className="w-4 h-4" />;
  const propertyLabel = propertyTypeLabels[accommodation.propertyType] || accommodation.propertyType;

  const hasBookingLinks = accommodation.bookingLinks.agoda || accommodation.bookingLinks.booking || accommodation.bookingLinks.direct;

  return (
    <div className="flex flex-col h-full w-full bg-card relative overflow-hidden">
      <div className="absolute top-[calc(12px+env(safe-area-inset-top))] left-4 z-40">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center border border-white/10 shadow-md backdrop-blur-md transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Save bookmark toggle */}
      <div className="absolute top-[calc(12px+env(safe-area-inset-top))] right-4 z-40">
        <button
          type="button"
          onClick={() => onToggleSave?.()}
          className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
            isSaved
              ? "bg-amber-400 border-amber-300 text-foreground"
              : "bg-black/55 hover:bg-black/75 text-white border-white/10"
          }`}
          title={isSaved ? "ลบออกจากรายการบันทึก" : "บันทึกที่พัก"}
        >
          <Bookmark className={`w-4.5 h-4.5 ${isSaved ? "fill-foreground" : ""}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain bg-card">
        <div className="relative h-[30vh] min-h-[240px] w-full overflow-hidden bg-muted">
          <img
            src={images[selectedImageIndex]}
            alt={accommodation.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === selectedImageIndex ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600/90 text-white text-[9px] font-bold rounded-full">
                {propertyIcon}
                {propertyLabel}
              </span>
              {accommodation.rating > 0 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-400/90 text-foreground text-[9px] font-bold rounded-full">
                  <Star className="w-3 h-3 fill-foreground" />
                  {accommodation.rating}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white leading-tight drop-shadow-sm">
              {accommodation.name}
            </h1>
            {accommodation.priceRange && (
              <p className="text-sm text-emerald-300 font-bold mt-0.5 drop-shadow-sm">
                {accommodation.priceRange}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pt-5 pb-40 space-y-5">
          {accommodation.description && (
            <p className="text-xs text-foreground leading-relaxed font-light">
              {accommodation.description}
            </p>
          )}

          {accommodation.amenities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2.5">สิ่งอำนวยความสะดวก</h3>
              <div className="flex flex-wrap gap-2">
                {accommodation.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-muted border border-border rounded-lg text-[10px] font-semibold text-muted-foreground"
                  >
                    {amenityIcons[amenity] || <Check className="w-3 h-3 text-emerald-500" />}
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {accommodation.roomTypes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2.5">ประเภทห้องพัก</h3>
              <div className="space-y-2">
                {accommodation.roomTypes.map((room, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted border border-border rounded-xl"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground">{room.name}</p>
                      {room.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{room.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        <Check className="w-3 h-3 inline-block mr-0.5 text-emerald-500" />
                        สูงสุด {room.max_guests} ท่าน
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-extrabold text-emerald-600">
                        {room.price.toLocaleString()} ฿
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">/คืน</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted border border-border rounded-xl">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 font-medium">
                <Clock className="w-3 h-3" /> เช็คอิน
              </div>
              <p className="text-xs font-bold text-foreground mt-0.5">{accommodation.checkInTime} น.</p>
            </div>
            <div className="p-3 bg-muted border border-border rounded-xl">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 font-medium">
                <AlarmCheck className="w-3 h-3" /> เช็คเอาท์
              </div>
              <p className="text-xs font-bold text-foreground mt-0.5">{accommodation.checkOutTime} น.</p>
            </div>
          </div>

          {accommodation.cancellationPolicy && (
            <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl">
              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                <Ban className="w-3 h-3" /> นโยบายการยกเลิก
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5 font-medium">{accommodation.cancellationPolicy}</p>
            </div>
          )}

          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground">ช่องทางติดต่อ</h3>
            <div className="flex flex-wrap gap-2">
              {accommodation.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCall(accommodation.phone)}
                  className="gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  {showPhone ? accommodation.phone : "โทร"}
                </Button>
              )}
              {accommodation.lineId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenLine(accommodation.lineId)}
                  className="gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                  Line
                </Button>
              )}
              {accommodation.website && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenLink(accommodation.website)}
                  className="gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  เว็บไซต์
                </Button>
              )}
            </div>
          </div>

          {hasBookingLinks && (
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-xs font-bold text-foreground">จองที่พัก</h3>
              <div className="flex flex-wrap gap-2">
                {accommodation.bookingLinks.agoda && (
                  <Button size="sm" onClick={() => handleOpenLink(accommodation.bookingLinks.agoda!)} className="gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Agoda
                  </Button>
                )}
                {accommodation.bookingLinks.booking && (
                  <Button size="sm" variant="secondary" onClick={() => handleOpenLink(accommodation.bookingLinks.booking!)} className="gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Booking.com
                  </Button>
                )}
                {accommodation.bookingLinks.direct && (
                  <Button size="sm" variant="outline" onClick={() => handleOpenLink(accommodation.bookingLinks.direct!)} className="gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> จองตรง
                  </Button>
                )}
              </div>
            </div>
          )}

          {accommodation.address && (
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-bold text-foreground mb-1.5">ที่อยู่</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{accommodation.address}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted p-3 rounded-xl">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>
              {computedDistanceLabel
                ? `ห่างจากคุณ ${computedDistanceLabel}`
                : "พิกัดในอำเภอพิชัย"}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="absolute bottom-3 left-3 right-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg flex gap-2.5">
        <button
          type="button"
          onClick={handleNavigate}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-600/30"
        >
          <Navigation className="w-4 h-4" />
          <span>นำทางไปยังที่พัก</span>
        </button>
      </div>
    </div>
  );
}
