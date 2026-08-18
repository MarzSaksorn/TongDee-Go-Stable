import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Star,
  X,
  UserCheck,
  Check,
  ShieldCheck,
  Car,
  Search,
  Loader2,
  ChevronRight,
  Users,
  Calendar,
  Shield,
  Briefcase,
  Clock,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useLanguage } from "../i18n/LanguageContext";

export interface LocalTaxiDriver {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  age: number;
  phone: string;
  serviceArea: string;
  contactAddress: string;
  standLocation: string;
  vehiclePlate: string;
  vehicleType: string;
  vehicleColor: string;
  vehicleDescription: string;
  capacity: number;
  luggageNote: string;
  rating: number;
  availableNow: boolean;
  profileImage: string;
  verificationStatus: string;
  verifiedByAgency: string;
  verificationRef: string;
  verifiedAt: string;
  expiresAt: string;
  verificationChecklist: {
    identityVerified: boolean;
    phoneVerified: boolean;
    plateVerified: boolean;
    typeVerified: boolean;
    backgroundChecked: boolean;
    serviceTrained: boolean;
  };
}

interface LocalTaxiViewProps {
  onBack?: () => void;
}

const FILTERS = [
  { key: "all", thai: "ทั้งหมด", english: "All" },
  { key: "available", thai: "พร้อมให้บริการ", english: "Available" },
  { key: "car", thai: "รถยนต์", english: "Car" },
  { key: "songthaew", thai: "รถสองแถว", english: "Songthaew" },
  { key: "motorbike", thai: "มอเตอร์ไซค์", english: "Motorbike" },
  { key: "verified", thai: "ยืนยันแล้ว", english: "Verified" },
];

const VEHICLE_TYPE_MAP: Record<string, string> = {
  car: "รถยนต์",
  songthaew: "รถสองแถว",
  motorbike: "มอเตอร์ไซค์รับจ้าง",
  van: "รถตู้",
  pickup: "รถกระบะรับจ้าง",
};

export default function LocalTaxiView({ onBack }: LocalTaxiViewProps) {
  const { language, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<LocalTaxiDriver | null>(null);
  const [drivers, setDrivers] = useState<LocalTaxiDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("local_taxi_drivers")
          .select("*, local_taxi_vehicles (*), local_taxi_verifications (*)")
          .eq("is_active", true);

        if (fetchError) throw fetchError;

        const mappedDrivers: LocalTaxiDriver[] = (data || []).map((row: any) => {
          const vehicle = Array.isArray(row.local_taxi_vehicles)
            ? row.local_taxi_vehicles[0]
            : row.local_taxi_vehicles || {};
          const verification = Array.isArray(row.local_taxi_verifications)
            ? row.local_taxi_verifications[0]
            : row.local_taxi_verifications || {};

          return {
            id: String(row.id),
            firstName: String(row.first_name || ""),
            lastName: String(row.last_name || ""),
            nickname: String(row.nickname || ""),
            age: Number(row.age || 0),
            phone: String(row.phone || ""),
            serviceArea: String(row.service_area || ""),
            contactAddress: String(row.public_contact_address || ""),
            standLocation: String(row.stand_location || ""),
            vehiclePlate: String(vehicle.vehicle_plate || ""),
            vehicleType: String(vehicle.vehicle_type || ""),
            vehicleColor: String(vehicle.vehicle_color || ""),
            vehicleDescription: String(vehicle.vehicle_description || ""),
            capacity: Number(vehicle.capacity || 0),
            luggageNote: String(vehicle.luggage_note || ""),
            rating: Number(row.rating || 5.0),
            availableNow: Boolean(row.available_now),
            profileImage: String(row.profile_image || ""),
            verificationStatus: String(verification.verification_status || "pending"),
            verifiedByAgency: String(verification.verified_by_agency || ""),
            verificationRef: String(verification.verification_ref || ""),
            verifiedAt: String(verification.verified_at || ""),
            expiresAt: String(verification.expires_at || ""),
            verificationChecklist: {
              identityVerified: Boolean(verification.identity_checked),
              phoneVerified: Boolean(verification.phone_checked),
              plateVerified: Boolean(verification.vehicle_plate_checked),
              typeVerified: Boolean(verification.vehicle_type_checked),
              backgroundChecked: Boolean(verification.government_record_checked),
              serviceTrained: Boolean(verification.tourism_training_checked),
            },
          };
        });

        setDrivers(mappedDrivers);
      } catch (err: any) {
        setError(err.message || "Failed to load driver data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    if (activeFilter === "available" && !driver.availableNow) return false;
    if (activeFilter === "car" && driver.vehicleType !== VEHICLE_TYPE_MAP.car) return false;
    if (activeFilter === "songthaew" && driver.vehicleType !== VEHICLE_TYPE_MAP.songthaew) return false;
    if (activeFilter === "motorbike" && driver.vehicleType !== VEHICLE_TYPE_MAP.motorbike) return false;
    if (activeFilter === "verified" && driver.verificationStatus !== "verified") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        driver.nickname.toLowerCase().includes(q) ||
        driver.vehiclePlate.toLowerCase().includes(q) ||
        driver.standLocation.toLowerCase().includes(q) ||
        driver.vehicleType.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleCall = (phone: string) => {
    window.location.href = "tel:" + phone;
  };

  const handleGetDirections = (standLoc: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(standLoc)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const getDriverInitial = (driver: LocalTaxiDriver) => {
    return (driver.firstName || driver.nickname || driver.lastName || "T").trim().charAt(0).toUpperCase();
  };

  const tl = (thai: string, english: string) => (language === "TH" ? thai : english);

  return (
    <div id="local-taxi-screen" className="flex flex-col h-full w-full bg-background overflow-y-auto">
      <div className="bg-gradient-to-b from-primary to-primary/90 px-4 pt-6 pb-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-extrabold tracking-tight">{tl("รถรับจ้างท้องถิ่น", "Local Taxi")}</h1>
            <p className="text-[11px] text-primary-foreground/70 font-medium">{tl("พิชัย อุตรดิตถ์", "Phichai, Uttaradit")}</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 rounded-lg border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold tracking-wide">{tl("ตรวจสอบแล้ว", "Verified")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-3.5 py-2.5 rounded-xl backdrop-blur-sm focus-within:bg-white/15 transition-all">
          <Search className="w-4 h-4 shrink-0 opacity-70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tl("ค้นหาผู้ขับ คิวจอด หรือทะเบียน...", "Search drivers, stands, or plates...")}
            className="w-full bg-transparent text-sm font-medium placeholder:text-primary-foreground/50 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-white/10 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-background border-b border-border px-5 pt-4 pb-3">
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            const label = tl(f.thai, f.english);
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                    : "bg-card border border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 mt-3 mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {tl(`ผู้ให้บริการ ${filteredDrivers.length} คน`, `${filteredDrivers.length} drivers`)}
        </span>
        <span className="text-[10px] text-muted-foreground/60 font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {tl("พื้นที่พิชัย", "Phichai area")}
        </span>
      </div>

      <div className="px-4 pb-[calc(24px+env(safe-area-inset-bottom))] space-y-3 flex-1">
        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm font-bold text-foreground">{tl("กำลังโหลดข้อมูล...", "Loading...")}</p>
          </div>
        ) : error ? (
          <div className="bg-card border border-destructive/30 rounded-2xl p-10 flex flex-col items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-destructive" />
            <p className="text-sm font-bold text-foreground">{tl("เกิดข้อผิดพลาด", "Error")}</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-3">
            <Car className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm font-bold text-foreground">{tl("ไม่พบผู้ขับขี่", "No drivers found")}</p>
            <p className="text-xs text-muted-foreground text-center max-w-[240px]">
              {tl("ลองเปลี่ยนตัวกรองหรือคำค้นหา", "Try changing filters or search terms")}
            </p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-muted hover:bg-accent text-muted-foreground font-bold text-xs rounded-xl transition-all"
            >
              {tl("รีเซ็ต", "Reset")}
            </button>
          </div>
        ) : (
          filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-base font-extrabold shrink-0 border border-primary/20">
                    {getDriverInitial(driver)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground">
                        {driver.firstName} {driver.lastName}
                      </h3>
                      {driver.nickname && (
                        <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 bg-muted rounded-md">
                          {driver.nickname}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200/60 rounded-lg text-[10px] font-bold text-amber-800">
                        <Car className="w-3 h-3" />
                        {driver.vehicleType}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {driver.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        driver.availableNow
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-rose-50 text-rose-500 border border-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          driver.availableNow ? "bg-emerald-500 animate-pulse" : "bg-rose-400"
                        }`}
                      />
                      {driver.availableNow
                        ? tl("พร้อม", "Available")
                        : tl("ไม่ว่าง", "Busy")}
                    </span>
                    {driver.verificationStatus === "verified" && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary">
                        <CheckCircle className="w-3 h-3" />
                        {tl("ยืนยันแล้ว", "Verified")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">{driver.standLocation}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">{driver.serviceArea}</p>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleCall(driver.phone)}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {tl("โทร", "Call")}
                </button>
                <button
                  onClick={() => handleGetDirections(driver.standLocation)}
                  className="flex items-center justify-center gap-1.5 bg-muted hover:bg-accent text-foreground font-bold text-[10px] py-2.5 rounded-xl transition-all border border-border cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {tl("แผนที่", "Map")}
                </button>
                <button
                  onClick={() => setSelectedDriver(driver)}
                  className="flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-extrabold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {tl("รายละเอียด", "Details")}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedDriver(null)}
          />
          <div className="relative bg-card w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-border animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-card border-b border-border z-10 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  {tl("ข้อมูลผู้ขับขี่", "Driver Info")}
                </span>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-1 hover:bg-muted rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black border border-primary/20 shrink-0">
                  {getDriverInitial(selectedDriver)}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground">
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {tl("ชื่อเล่น", "Nickname")}: {selectedDriver.nickname}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tl("อายุ", "Age")} {selectedDriver.age} {tl("ปี", "yrs")}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 border border-border space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Car className="w-4 h-4 text-primary" />
                  {tl("ข้อมูลพาหนะ", "Vehicle Info")}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-card p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {tl("ประเภท", "Type")}
                    </span>
                    <p className="font-bold text-foreground mt-0.5">{selectedDriver.vehicleType}</p>
                  </div>
                  <div className="bg-card p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {tl("สี", "Color")}
                    </span>
                    <p className="font-bold text-foreground mt-0.5">{selectedDriver.vehicleColor}</p>
                  </div>
                  <div className="bg-card p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {tl("ทะเบียน", "Plate")}
                    </span>
                    <p className="font-bold text-primary mt-0.5">{selectedDriver.vehiclePlate}</p>
                  </div>
                  <div className="bg-card p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {tl("ที่นั่ง", "Seats")}
                    </span>
                    <p className="font-bold text-foreground mt-0.5">{selectedDriver.capacity} {tl("คน", "pax")}</p>
                  </div>
                </div>
                {selectedDriver.vehicleDescription && (
                  <p className="text-xs text-muted-foreground bg-card p-2.5 rounded-xl border border-border leading-relaxed">
                    {selectedDriver.vehicleDescription}
                  </p>
                )}
                {selectedDriver.luggageNote && (
                  <div className="flex items-start gap-1.5 text-xs bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-xl">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-amber-800 font-medium">{selectedDriver.luggageNote}</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    {tl("การตรวจสอบ", "Verification")}
                  </div>
                  {selectedDriver.verificationStatus === "verified" ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                      {tl("ผ่าน", "PASSED")}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                      {tl("รอตรวจ", "PENDING")}
                    </span>
                  )}
                </div>
                <div className="text-xs space-y-1.5">
                  {selectedDriver.verifiedByAgency && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{tl("หน่วยงาน", "Agency")}:</span>
                      <span className="font-bold text-foreground text-right max-w-[180px]">{selectedDriver.verifiedByAgency}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tl("วันที่", "Date")}:</span>
                    <span className="font-bold text-foreground">{selectedDriver.verifiedAt || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tl("หมดอายุ", "Expires")}:</span>
                    <span className="font-bold text-destructive">{selectedDriver.expiresAt || "-"}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                  {[
                    { key: "identityVerified", label: tl("ยืนยันตัวตน", "Identity") },
                    { key: "phoneVerified", label: tl("เบอร์โทร", "Phone") },
                    { key: "plateVerified", label: tl("ทะเบียนรถ", "Plate") },
                    { key: "typeVerified", label: tl("สภาพรถ", "Vehicle") },
                    {
                      key: "backgroundChecked",
                      label: tl("ประวัติอาชญากรรม", "Background"),
                      colSpan: true,
                    },
                    {
                      key: "serviceTrained",
                      label: tl("อบรมการท่องเที่ยว", "Service Training"),
                      colSpan: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`flex items-center gap-1.5 ${
                        (selectedDriver.verificationChecklist as any)[item.key] ? "" : "opacity-50"
                      } ${item.colSpan ? "col-span-2" : ""}`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          (selectedDriver.verificationChecklist as any)[item.key]
                            ? "bg-emerald-100"
                            : "bg-muted"
                        }`}
                      >
                        <Check
                          className={`w-2 h-2 ${
                            (selectedDriver.verificationChecklist as any)[item.key]
                              ? "text-emerald-600"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </span>
                      <span
                        className={
                          (selectedDriver.verificationChecklist as any)[item.key]
                            ? "font-medium text-foreground"
                            : "text-muted-foreground/50"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-2.5">
              <button
                onClick={() => handleCall(selectedDriver.phone)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm py-3 rounded-2xl transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                {tl("โทร", "Call")} {selectedDriver.phone}
              </button>
              <button
                onClick={() => handleGetDirections(selectedDriver.standLocation)}
                className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-accent text-foreground font-bold text-sm py-3 rounded-2xl transition-all border border-border cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-red-500" />
                {tl("นำทางไปจุดจอด", "Navigate to Stand")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
