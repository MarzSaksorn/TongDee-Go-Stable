import React, { useState, useEffect } from "react";
import gsap from "gsap";
import { supabase } from "../lib/supabaseClient";
import { useLanguage } from "../i18n/LanguageContext";
import {
  Award, Compass, Shield, Globe, LogOut, Clock, Sparkles, PhoneCall,
  Calendar, Bell, Trash2, Edit3, AlertTriangle, ShieldCheck, Sliders, Key, X, Palette,
  User, Car, Package, Settings, Loader2, Moon, Sun, Bed
} from "lucide-react";
import { useAppearance } from "../theme/AppearanceContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MenuRow } from "./shared";
import { useToast } from "./ToastProvider";

const sectionTitle = (text: string) => (
  <h3 className="text-xs font-medium text-muted-foreground pl-1 mb-2 select-none">{text}</h3>
);

interface ProfileViewProps {
  tripsCount: number;
  checkInCount: number;
  badgesCount: number;
  onOpenPassport: () => void;
  onOpenSafety: () => void;
  onResetApp: () => void;
  isHighDpiCompact: boolean;
  onToggleHighDpi: (val: boolean) => void;
  safetyModeActive?: boolean;
  onToggleSafety?: () => void;
  onNavigateToScreen?: (screenId: number) => void;
  isGuest?: boolean;
  displayName?: string;
  onGuestFeatureLocked?: () => void;
  onLogout?: () => void;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onEditProfile?: (newName: string) => Promise<void>;
  onOpenAppearanceSettings?: () => void;
  onOpenTodayTrip?: () => void;
}

export default function ProfileView({
  tripsCount, checkInCount, badgesCount, onOpenPassport, onOpenSafety, onResetApp,
  isHighDpiCompact, onToggleHighDpi, safetyModeActive = true, onToggleSafety,
  onNavigateToScreen, isGuest = false, displayName = "สวัสดี คุณแมว",
  onGuestFeatureLocked, onLogout, onChangePassword, onEditProfile,
  onOpenAppearanceSettings, onOpenTodayTrip
}: ProfileViewProps) {
  const { language, setLanguage, t } = useLanguage();
  const { accent, setAccent, uiScale, setUiScale, darkMode, setDarkMode } = useAppearance();
  const { showToast } = useToast();
  const [localSafetyActive, setLocalSafetyActive] = useState<boolean>(safetyModeActive);
  const [localNotificationActive, setLocalNotificationActive] = useState<boolean>(true);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [editName, setEditName] = useState(displayName);
  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("tourist");
  const [taxiAppStatus, setTaxiAppStatus] = useState<string | null>(null);
  const [isTaxiDriver, setIsTaxiDriver] = useState<boolean>(false);
  const [sellerAppStatus, setSellerAppStatus] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);
  const [accommodationAppStatus, setAccommodationAppStatus] = useState<string | null>(null);
  const [isAccommodationOwner, setIsAccommodationOwner] = useState<boolean>(false);

  useEffect(() => {
    async function fetchStatus() {
      if (isGuest) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data: profile } = await supabase.from("profiles").select("role").eq("owner_id", session.user.id).maybeSingle();
        if (profile) setUserRole(profile.role);
        const { data: driver } = await supabase.from("local_taxi_drivers").select("id, is_active").eq("user_id", session.user.id).maybeSingle();
        if (driver && driver.is_active) setIsTaxiDriver(true);
        else {
          const { data: appData } = await supabase.from("local_taxi_applications").select("application_status").eq("user_id", session.user.id).maybeSingle();
          if (appData) setTaxiAppStatus(appData.application_status);
        }
        const { data: seller } = await supabase.from("marketplace_sellers").select("id").eq("user_id", session.user.id).maybeSingle();
        if (seller) setIsSeller(true);
        else {
          const { data: sellerAppData } = await supabase.from("marketplace_seller_applications").select("application_status").eq("user_id", session.user.id).maybeSingle();
          if (sellerAppData) setSellerAppStatus(sellerAppData.application_status);
        }
        const { data: accommodation } = await supabase.from("accommodations").select("id, is_active").eq("owner_user_id", session.user.id).eq("is_active", true).maybeSingle();
        if (accommodation) setIsAccommodationOwner(true);
        else {
          const { data: accommodationAppData } = await supabase.from("accommodation_applications").select("application_status").eq("user_id", session.user.id).maybeSingle();
          if (accommodationAppData) setAccommodationAppStatus(accommodationAppData.application_status);
        }
      } catch (err) { console.error("Error fetching provider statuses:", err); }
    }
    fetchStatus();
  }, [isGuest]);

  useEffect(() => {
    gsap.fromTo(".profile-stat",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" }
    );
  }, []);

  const handleSafetyToggle = () => { if (onToggleSafety) onToggleSafety(); else setLocalSafetyActive(!localSafetyActive); };

  const handleConfirmReset = () => { setShowConfirmReset(false); onResetApp(); };

  const handleLogoutSim = () => {
    if (isGuest) { if (onNavigateToScreen) onNavigateToScreen(17); }
    else if (onLogout) onLogout();
  };

  const handleEditProfileSim = () => {
    if (isGuest) { if (onGuestFeatureLocked) onGuestFeatureLocked(); }
    else { setEditName(displayName); setShowEditProfileModal(true); }
  };

  const saveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      if (onEditProfile) await onEditProfile(editName.trim());
      showToast(language === "TH" ? "อัปเดตชื่อเรียบร้อย" : "Profile name updated", "success");
      setShowEditProfileModal(false);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : (language === "TH" ? "เกิดข้อผิดพลาดในการบันทึก" : "Failed to save profile"),
        "error"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast(language === "TH" ? "กรุณากรอกรหัสผ่านปัจจุบัน" : "Current password is required", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast(language === "TH" ? "รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร" : "New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast(language === "TH" ? "รหัสผ่านใหม่ไม่ตรงกัน" : "New passwords do not match", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      if (onChangePassword) await onChangePassword(currentPassword, newPassword);
      showToast(language === "TH" ? "เปลี่ยนรหัสผ่านเรียบร้อย" : "Password changed successfully", "success");
      setShowChangePasswordModal(false);
      setNewPassword("");
      setConfirmNewPassword("");
      setCurrentPassword("");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : (language === "TH" ? "เปลี่ยนรหัสผ่านไม่สำเร็จ" : "Failed to change password"),
        "error"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const iconBox = (bg: string, color: string, icon: React.ReactNode) => (
    <div className={`size-9 rounded-xl ${bg} flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
  );

  const modalOverlay = (children: React.ReactNode) => (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-xs z-50 flex items-center justify-center p-5">
      <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );

  return (
    <div id="profile-screen" className="flex flex-col h-full w-full bg-background pb-[calc(110px+env(safe-area-inset-bottom))] overflow-y-auto relative">
      {/* Toast — handled by ToastProvider */}

      {/* Profile Header */}
      <div className="mx-4 mt-4 rounded-2xl bg-primary text-primary-foreground p-5 pt-6 pb-6 shadow-md relative overflow-hidden shrink-0">
        <div className="absolute top-[-30%] right-[-10%] w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-24 h-24 rounded-full bg-white/10 blur-lg pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative size-14 rounded-2xl bg-white border-2 border-amber-300 dark:border-amber-400/50 flex items-center justify-center text-3xl font-bold p-1 shrink-0">
              <User className="size-7 text-primary" />
              <span className={`absolute -bottom-1 -right-1 size-4 border-2 border-white rounded-full ${isGuest ? "bg-amber-400 dark:bg-amber-500" : "bg-emerald-500 dark:bg-emerald-600"}`} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isGuest ? (language === "TH" ? "สวัสดี ผู้เยี่ยมชม" : "Hello, Guest") : `${language === "TH" ? "สวัสดี" : "Hello"} ${displayName}`}
              </h2>
              <div className="mt-1 flex flex-wrap gap-1 items-center">
                <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 h-auto rounded-md bg-amber-400 dark:bg-amber-500 text-primary-dark hover:bg-amber-400 dark:hover:bg-amber-500">
                  {isGuest ? "Guest Mode" : t("profile.roleTourist")}
                </Badge>
                {!isGuest && isTaxiDriver && (
                  <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 h-auto rounded-md bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-500 dark:hover:bg-emerald-600">
                    <Car className="size-2.5 inline mr-0.5" /> {t("profile.roleTaxiProvider")}
                  </Badge>
                )}
                {!isGuest && isAccommodationOwner && (
                  <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 h-auto rounded-md bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-500 dark:hover:bg-emerald-600">
                    <Bed className="size-2.5 inline mr-0.5" /> {language === "TH" ? "เจ้าของที่พัก" : "Accommodation Owner"}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-primary-foreground/70 font-medium mt-1">
                {isGuest ? (language === "TH" ? "เข้าสู่ระบบเพื่อสะสมตราประทับ" : "Sign in to save stamps") : (language === "TH" ? "นักเดินทางท่องเที่ยวสายเมืองรอง" : "Off-the-beaten-path explorer")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditProfileSim}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-primary-foreground font-bold text-[10px] rounded-xl shrink-0 h-auto"
          >
            <Edit3 className="size-3.5 text-amber-300 mr-1" />
            {isGuest ? (language === "TH" ? "เข้าสู่ระบบ" : "Sign In") : (language === "TH" ? "แก้ไข" : "Edit")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 -mt-3 mb-5 relative z-10">
        <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-3 divide-x divide-border text-center">
          <div className="flex flex-col items-center justify-center">
            <span className="profile-stat text-lg font-bold text-primary leading-none">{tripsCount > 0 ? tripsCount : "0"}</span>
            <span className="text-[11px] text-muted-foreground font-medium mt-1">{language === "TH" ? "ทริปวันนี้" : "Today's Trips"}</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="profile-stat text-lg font-bold text-amber-500 leading-none">{checkInCount}</span>
            <span className="text-[11px] text-muted-foreground font-medium mt-1">{language === "TH" ? "ตราสะสม" : "Stamps collected"}</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="profile-stat text-lg font-bold text-emerald-500 leading-none">{badgesCount}</span>
            <span className="text-[11px] text-muted-foreground font-medium mt-1">{language === "TH" ? "เหรียญทอง" : "Coins/Badges"}</span>
          </div>
        </div>
      </div>

      {/* My Travel */}
      <div className="px-4 mb-5">
        {sectionTitle(language === "TH" ? "การเดินทางของฉัน" : "My Travel")}
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          <MenuRow
            icon={iconBox("bg-amber-50 dark:bg-amber-500/20", "text-amber-500 dark:text-amber-400", <Calendar className="size-5" />)}
            title={language === "TH" ? "ทริปวันนี้" : "Today's Trip"}
            subtitle={language === "TH" ? "ดูแผนเที่ยวและจุดหมายวันนี้" : "View today's plan and destinations"}
            onClick={() => { if (isGuest) onGuestFeatureLocked?.(); else if (onOpenTodayTrip) onOpenTodayTrip(); else if (onNavigateToScreen) onNavigateToScreen(tripsCount > 0 ? 16 : 5); }}
            rightContent={<><Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 h-auto rounded-md">{isGuest ? "Need Sign In" : tripsCount > 0 ? "My Trip" : "No Plan"}</Badge></>}
          />
          <MenuRow
            icon={iconBox("bg-primary/10", "text-primary", <Award className="size-5" />)}
            title={language === "TH" ? "สมุดสะสมตราประทับ" : "Stamp Passport"}
            subtitle={language === "TH" ? "สะสมตราจากสถานที่ที่คุณไปเยือน" : "Collect stamps from places you visit"}
            onClick={() => { if (isGuest) onGuestFeatureLocked?.(); else onOpenPassport(); }}
            rightContent={isGuest ? <span className="text-[9px] text-muted-foreground font-bold">Locked</span> : <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 h-auto rounded-md">{language === "TH" ? `เช็คอินแล้ว ${checkInCount} แห่ง` : `${checkInCount} check-ins`}</Badge>}
          />
          <MenuRow
            icon={iconBox("bg-purple-50 dark:bg-purple-500/20", "text-purple-600 dark:text-purple-400", <Clock className="size-5" />)}
            title={language === "TH" ? "ประวัติการเดินทาง" : "Travel History"}
            subtitle={language === "TH" ? "ดูเส้นทางและสถานที่ที่เคยไป" : "View your travel history"}
            onClick={() => { if (isGuest) onGuestFeatureLocked?.(); else if (onNavigateToScreen) onNavigateToScreen(10); else onOpenPassport(); }}
          />
        </div>
      </div>

      {/* Safety */}
      <div className="px-4 mb-5">
        {sectionTitle(language === "TH" ? "โหมดความปลอดภัย" : "Safety Mode")}
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${safetyModeActive ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {safetyModeActive ? <ShieldCheck className="size-5" /> : <Shield className="size-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{language === "TH" ? "โหมดความปลอดภัย" : "Safety Mode"}</span>
                  {safetyModeActive && <span className="animate-pulse size-1.5 rounded-full bg-emerald-500" />}
                </div>
                <span className="text-[10px] text-muted-foreground font-normal">{language === "TH" ? "เปิดการแจ้งเตือนและข้อมูลช่วยเหลือฉุกเฉิน" : "Enable emergency alerts and help"}</span>
              </div>
            </div>
            <Switch checked={safetyModeActive} onCheckedChange={handleSafetyToggle} aria-label="Toggle safety mode" />
          </div>
          <MenuRow
            icon={iconBox("bg-destructive/10", "text-destructive", <PhoneCall className="size-5" />)}
            title={language === "TH" ? "ศูนย์ช่วยเหลือฉุกเฉิน" : "Emergency Center"}
            subtitle={language === "TH" ? "เบอร์สำคัญ จุดช่วยเหลือ และสถานพยาบาลใกล้เคียง" : "Important numbers, help points, nearby hospitals"}
            onClick={onOpenSafety}
            rightContent={<Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0.5 h-auto rounded-md">{language === "TH" ? "โทรด่วน" : "SOS"}</Badge>}
          />
        </div>
      </div>

      {/* Local Services */}
      <div className="px-4 mb-5">
        {sectionTitle(language === "TH" ? "บริการท้องถิ่น" : "Local Services")}
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          <MenuRow
            icon={iconBox("bg-primary/10", "text-primary", <Car className="size-5" />)}
            title={isTaxiDriver ? (language === "TH" ? "แดชบอร์ดผู้ให้บริการ" : "Driver Dashboard") : (language === "TH" ? "สมัครเป็นผู้ให้บริการรถรับจ้าง" : "Apply as Taxi Provider")}
            subtitle={isTaxiDriver ? (language === "TH" ? "เปิด/ปิดสถานะพร้อมให้บริการ" : "Toggle availability status") : (language === "TH" ? "ลงทะเบียนรถรับจ้างท้องถิ่น" : "Register as local taxi driver")}
            onClick={() => { if (isGuest) onGuestFeatureLocked?.(); else if (onNavigateToScreen) onNavigateToScreen(22); }}
            rightContent={renderRightContent(isGuest, isTaxiDriver, taxiAppStatus)}
          />
          <MenuRow
            icon={iconBox("bg-emerald-50 dark:bg-emerald-500/20", "text-emerald-600 dark:text-emerald-400", <Package className="size-5" />)}
            title={isSeller ? (language === "TH" ? "แดชบอร์ดร้านค้า" : "Seller Dashboard") : (language === "TH" ? "สมัครเป็นผู้ขายสินค้าในชุมชน" : "Apply as Community Seller")}
            subtitle={isSeller ? (language === "TH" ? "จัดการรายการสินค้าและร้านค้าของคุณ" : "Manage your products and shop") : (language === "TH" ? "ลงทะเบียนร้านค้า SME / OTOP / GI" : "Register SME / OTOP / GI store")}
            onClick={() => { if (isGuest) onGuestFeatureLocked?.(); else if (onNavigateToScreen) onNavigateToScreen(24); }}
            rightContent={renderRightContent(isGuest, isSeller, sellerAppStatus, true)}
          />
          <MenuRow
            icon={iconBox("bg-teal-50 dark:bg-teal-500/20", "text-teal-600 dark:text-teal-400", <Bed className="size-5" />)}
            title={isAccommodationOwner ? (language === "TH" ? "แดชบอร์ดเจ้าของที่พัก" : "Accommodation Dashboard") : (language === "TH" ? "ลงทะเบียนที่พัก / บ้านเช่า" : "Register Accommodation")}
            subtitle={isAccommodationOwner ? (language === "TH" ? "ดูสถานะที่พักที่เผยแพร่บนแผนที่" : "View your published accommodation status") : (language === "TH" ? "ส่งคำขอให้ที่พักแสดงในแผนที่และหน้าแนะนำ" : "Submit your hotel, homestay, or rental for review")}
            onClick={() => { if (isGuest) onGuestFeatureLocked?.(); else if (onNavigateToScreen) onNavigateToScreen(28); }}
            rightContent={renderRightContent(isGuest, isAccommodationOwner, accommodationAppStatus)}
          />
        </div>
      </div>

      {/* Admin */}
      {userRole === "admin" && (
        <div className="px-4 mb-5">
          {sectionTitle(language === "TH" ? "ระบบผู้ดูแล (Admin)" : "Admin Panel")}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <MenuRow
              icon={iconBox("bg-muted", "text-muted-foreground", <Settings className="size-5" />)}
              title={language === "TH" ? "ศูนย์จัดการระบบ" : "System Management Center"}
              subtitle={language === "TH" ? "ตรวจสอบคำขอ Local Taxi ตลาดชุมชน และที่พัก" : "Review taxi, marketplace, and accommodation applications"}
              onClick={() => onNavigateToScreen?.(40)}
              rightContent={<span className="px-2 py-1 bg-foreground text-background font-bold text-[10px] rounded-lg">{language === "TH" ? "เปิดแผงผู้ดูแล" : "Open Admin"}</span>}
            />
          </div>
        </div>
      )}

      {/* Account Settings */}
      <div className="px-4 mb-5">
        {sectionTitle(language === "TH" ? "การตั้งค่าบัญชี" : "Account Settings")}
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          <MenuRow
            icon={iconBox("bg-primary/10", "text-primary", <Edit3 className="size-5" />)}
            title={language === "TH" ? "แก้ไขข้อมูลโปรไฟล์" : "Edit Profile"}
            subtitle={language === "TH" ? "เปลี่ยนรูปประจำตัวและชื่อเล่น" : "Change avatar and display name"}
            onClick={handleEditProfileSim}
          />
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {iconBox("bg-teal-50 dark:bg-teal-500/20", "text-teal-600 dark:text-teal-400", <Globe className="size-5" />)}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground">{language === "TH" ? "ภาษาแอปพลิเคชัน" : "Application Language"}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{language === "TH" ? "เปลี่ยนภาษา TH หรือ EN" : "Change app language"}</div>
              </div>
            </div>
            <div className="bg-muted p-1 rounded-xl flex gap-1 border border-border/50">
              <button onClick={() => setLanguage("TH")} className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${language === "TH" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>TH</button>
              <button onClick={() => setLanguage("EN")} className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${language === "EN" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>EN</button>
            </div>
          </div>
          <MenuRow
            icon={iconBox("bg-primary/10", "text-primary", <Palette className="size-5" />)}
            title={language === "TH" ? "รูปลักษณ์แอป" : "Appearance"}
            subtitle={language === "TH" ? "สีแอป ขนาดหน้าจอ และรูปแบบการแสดงผล" : "App color, display size, and style"}
            onClick={onOpenAppearanceSettings}
          />
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                {darkMode ? <Moon className="size-5" /> : <Sun className="size-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground">{language === "TH" ? "โหมดกลางคืน" : "Dark Mode"}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{language === "TH" ? "เปลี่ยนเป็นโหมดสีเข้ม" : "Toggle dark color scheme"}</div>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Toggle dark mode" />
          </div>
          <MenuRow
            icon={iconBox("bg-purple-50 dark:bg-purple-500/20", "text-purple-600 dark:text-purple-400", <Sliders className="size-5" />)}
            title={language === "TH" ? "เปลี่ยนรหัสผ่านใหม่" : "Change Password"}
            subtitle={language === "TH" ? "เปลี่ยนรหัสความปลอดภัย" : "Update security password"}
            onClick={() => { if (isGuest) onGuestFeatureLocked?.(); else { setNewPassword(""); setConfirmNewPassword(""); setCurrentPassword(""); setShowChangePasswordModal(true); } }}
          />
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {iconBox("bg-orange-50 dark:bg-orange-500/20", "text-orange-500 dark:text-orange-400", <Bell className="size-5" />)}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground">{language === "TH" ? "การแจ้งเตือน" : "Notifications"}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{language === "TH" ? "แจ้งเตือนกิจกรรมและภัยธรรมชาติ" : "Event and emergency alerts"}</div>
              </div>
            </div>
            <Switch checked={localNotificationActive} onCheckedChange={setLocalNotificationActive} aria-label="Toggle notifications" />
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="px-4 mb-6">
        {sectionTitle(language === "TH" ? "ข้อมูลและความเป็นส่วนตัว" : "Data & Privacy")}
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          <MenuRow
            icon={iconBox("bg-rose-50 dark:bg-rose-500/20", "text-rose-500 dark:text-rose-400", <Trash2 className="size-5" />)}
            title={<span className="text-xs font-bold text-destructive">{language === "TH" ? "ล้างประวัติการเดินทาง" : "Clear Travel History"}</span>}
            subtitle={language === "TH" ? "ลบข้อมูลตราประทับ แสตมป์ และเส้นทางทั้งหมด" : "Delete stamps, badges, and all trip data"}
            onClick={() => setShowConfirmReset(true)}
            rightContent={<span className="text-[10px] text-destructive font-bold">{language === "TH" ? "รีเซ็ตข้อมูล" : "Reset Data"}</span>}
          />
          <MenuRow
            icon={iconBox("bg-muted", "text-muted-foreground", <LogOut className="size-5" />)}
            title={<span className="text-xs font-bold text-muted-foreground">{language === "TH" ? "ออกจากระบบ" : "Sign Out"}</span>}
            subtitle={language === "TH" ? "สลับบัญชีหรือออกจากระบบ" : "Switch account or sign out"}
            onClick={handleLogoutSim}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-muted-foreground leading-relaxed pb-8 px-8 select-none">
        {language === "TH" ? 'แอปพลิเคชันนำท่องเที่ยวด้วยระบบวัฒนธรรมอัจฉริยะ "ตองดีโก"' : 'Smart Cultural Tourism App "Tongdee Go"'}<br />
        {language === "TH" ? "สงวนลิขสิทธิ์บูรณาการร่วมกับผู้จัดงานท้องถิ่นพิชัย อุตรดิตถ์ 2026" : "Copyright Phichai Local Organizers, Uttaradit 2026"}
      </div>

      {/* Reset Confirm Modal */}
      {showConfirmReset && modalOverlay(
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="size-12 rounded-2xl bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-6 text-rose-500 animate-pulse" />
            </div>
            <button onClick={() => setShowConfirmReset(false)} className="p-1 hover:bg-muted rounded-xl transition-all cursor-pointer text-muted-foreground"><X className="size-5" /></button>
          </div>
          <h4 className="text-base font-bold text-foreground leading-snug">{language === "TH" ? "ล้างประวัติการเดินทางจริงหรือไม่?" : "Clear travel history?"}</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-2.5">
            {language === "TH"
              ? "การทำงานนี้จะทำการลบข้อมูลการเช็คอิน ตราแสตมป์ประวัติศาสตร์ใน Digital Passport และความคืบหน้าระดับทั้งหมดของท่านอย่างถาวร หากคุณยืนยัน ข้อมูลจะไม่สามารถกู้คืนได้ในภายหลัง"
              : "This will permanently delete all check-ins, stamps, and progress in your Digital Passport. This action cannot be undone."}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button variant="destructive" onClick={handleConfirmReset} className="w-full font-bold text-xs py-3"><Trash2 className="size-4 mr-1" />{language === "TH" ? "ยืนยัน! ลบสถิติทั่วประเทศ" : "Confirm Reset"}</Button>
            <Button variant="outline" onClick={() => setShowConfirmReset(false)} className="w-full font-bold text-xs py-3">{language === "TH" ? "ย้อนกลับ (ยกเลิก)" : "Cancel"}</Button>
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && modalOverlay(
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><Edit3 className="size-6 text-primary" /></div>
            <button onClick={() => setShowEditProfileModal(false)} className="p-1 hover:bg-muted rounded-xl transition-all cursor-pointer text-muted-foreground"><X className="size-5" /></button>
          </div>
          <h4 className="text-base font-bold text-foreground leading-snug">{language === "TH" ? "แก้ไขข้อมูลผู้ใช้" : "Edit Profile"}</h4>
          <form onSubmit={saveEditProfile} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground">{language === "TH" ? "ชื่อเล่น / ชื่อผู้ใช้" : "Display Name"}</Label>
              <Input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="text-xs font-semibold p-3.5 h-auto" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-muted-foreground">{language === "TH" ? "รูปประจำตัว" : "Avatar"}</span>
              <div className="flex items-center gap-3 mt-1 bg-amber-50/50 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-100/60 dark:border-amber-500/20">
                <User className="size-7 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">{language === "TH" ? "แมวตองดีแสนซนคู่ใจนำเที่ยว" : "Tongdee cat mascot"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={editLoading} className="w-full font-bold text-xs py-3">
                {editLoading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
                {language === "TH" ? "บันทึกข้อมูล" : "Save Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditProfileModal(false)} disabled={editLoading} className="w-full font-bold text-xs py-3">{language === "TH" ? "ยกเลิก" : "Cancel"}</Button>
            </div>
          </form>
        </>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && modalOverlay(
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center shrink-0"><Key className="size-6 text-purple-600" /></div>
            <button onClick={() => setShowChangePasswordModal(false)} className="p-1 hover:bg-muted rounded-xl transition-all cursor-pointer text-muted-foreground"><X className="size-5" /></button>
          </div>
          <h4 className="text-base font-bold text-foreground leading-snug">{language === "TH" ? "เปลี่ยนรหัสผ่าน" : "Change Password"}</h4>
          <form onSubmit={handleSaveChangePassword} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground">{language === "TH" ? "รหัสผ่านปัจจุบัน" : "Current Password"}</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="text-xs font-semibold p-3.5 h-auto" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground">{language === "TH" ? "รหัสผ่านใหม่" : "New Password"}</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={language === "TH" ? "อย่างน้อย 6 ตัวอักษร" : "At least 6 characters"} className="text-xs font-semibold p-3.5 h-auto" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground">{language === "TH" ? "ยืนยันรหัสผ่านใหม่" : "Confirm New Password"}</Label>
              <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="text-xs font-semibold p-3.5 h-auto" />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={passwordLoading} className="w-full font-bold text-xs py-3">
                {passwordLoading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
                {language === "TH" ? "เปลี่ยนรหัสผ่าน" : "Change Password"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowChangePasswordModal(false)} disabled={passwordLoading} className="w-full font-bold text-xs py-3">{language === "TH" ? "ยกเลิก" : "Cancel"}</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function renderRightContent(isGuest: boolean, isActive: boolean, status: string | null, isSeller?: boolean) {
  if (isGuest) return <span className="text-[9px] text-muted-foreground font-bold">{isSeller ? "Locked" : "Locked"}</span>;
  if (isActive) return <span className="px-2 py-1 bg-primary text-primary-foreground font-bold text-[10px] rounded-lg">Dashboard</span>;
  if (status === "pending") return <span className="px-2 py-1 bg-amber-500 dark:bg-amber-600 text-white font-bold text-[10px] rounded-lg">Pending</span>;
  if (status === "revision_required") return <span className="px-2 py-1 bg-rose-500 dark:bg-rose-600 text-white font-bold text-[10px] rounded-lg">Revise</span>;
  if (status === "approved") return <span className="px-2 py-1 bg-emerald-500 dark:bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Approved</span>;
  if (status === "rejected") return <span className="px-2 py-1 bg-rose-500 dark:bg-rose-600 text-white font-bold text-[10px] rounded-lg">Rejected</span>;
  return <span className="px-2 py-1 bg-primary text-primary-foreground font-bold text-[10px] rounded-lg">{isSeller ? "Apply" : "Apply"}</span>;
}
