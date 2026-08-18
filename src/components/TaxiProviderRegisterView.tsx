import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileEdit,
  Power,
  Star,
  X,
  Loader2,
  Phone,
  ShieldCheck,
  Car,
  Luggage,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "./ToastProvider";
import { useLanguage } from "../i18n/LanguageContext";

interface TaxiProviderRegisterViewProps {
  onBack: () => void;
}

export default function TaxiProviderRegisterView({ onBack }: TaxiProviderRegisterViewProps) {
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    age: "",
    phone: "",
    serviceArea: "",
    standLocation: "",
    publicContactAddress: "",
    vehiclePlate: "",
    vehicleType: "รถยนต์",
    vehicleColor: "",
    vehicleDescription: "",
    capacity: "",
    luggageNote: "",
    confirmTruth: false,
  });

  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: "",
    serviceArea: "",
    standLocation: "",
    publicContactAddress: "",
    vehicleColor: "",
    vehicleDescription: "",
    capacity: "",
    luggageNote: "",
  });

  const tl = (thai: string, english: string) => (language === "TH" ? thai : english);

  useEffect(() => {
    async function checkExistingApplication() {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const { data: driverData, error: driverError } = await supabase
          .from("local_taxi_drivers")
          .select("*, local_taxi_vehicles (*), local_taxi_verifications (*)")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (driverError && driverError.code !== "PGRST116") {
          console.error("Error fetching driver profile:", driverError);
        } else if (driverData && driverData.is_active) {
          setDriverProfile(driverData);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("local_taxi_applications")
          .select("application_status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching application:", error);
        } else if (data) {
          setApplicationStatus(data.application_status);
        }
      } catch (err) {
        console.error("Error in checkExistingApplication:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkExistingApplication();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleToggleAvailability = async () => {
    if (!driverProfile) return;
    const newStatus = !driverProfile.available_now;
    try {
      const { error } = await supabase
        .from("local_taxi_drivers")
        .update({ available_now: newStatus })
        .eq("id", driverProfile.id);

      if (error) throw error;
      setDriverProfile((prev: any) => ({ ...prev, available_now: newStatus }));
      showToast(newStatus ? tl("เปิดรับงานแล้ว", "Now available") : tl("ปิดรับงานแล้ว", "Now unavailable"), "success");
    } catch (e) {
      console.error("Failed to toggle availability", e);
      showToast(tl("เปลี่ยนสถานะไม่สำเร็จ", "Failed to update status"), "error");
    }
  };

  const handleSaveServiceData = async () => {
    if (!driverProfile) return;
    setIsSubmitting(true);

    try {
      const { error: driverError } = await supabase
        .from("local_taxi_drivers")
        .update({
          phone: editFormData.phone,
          service_area: editFormData.serviceArea,
          stand_location: editFormData.standLocation,
          public_contact_address: editFormData.publicContactAddress,
        })
        .eq("id", driverProfile.id);

      if (driverError) throw driverError;

      const { error: vehicleError } = await supabase
        .from("local_taxi_vehicles")
        .update({
          vehicle_color: editFormData.vehicleColor,
          vehicle_description: editFormData.vehicleDescription,
          capacity: parseInt(editFormData.capacity, 10),
          luggage_note: editFormData.luggageNote,
        })
        .eq("driver_id", driverProfile.id);

      if (vehicleError) throw vehicleError;

      const { data: updatedProfile } = await supabase
        .from("local_taxi_drivers")
        .select("*, local_taxi_vehicles (*), local_taxi_verifications (*)")
        .eq("id", driverProfile.id)
        .single();

      if (updatedProfile) setDriverProfile(updatedProfile);

      setIsEditServiceModalOpen(false);
      showToast(tl("บันทึกข้อมูลเรียบร้อย", "Saved successfully"), "success");
    } catch (error: any) {
      console.error("Failed to update taxi provider profile:", error);
      showToast(tl("บันทึกไม่สำเร็จ", "Failed to save") + `: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setIsSubmitting(true);

    if (!formData.confirmTruth) {
      setSubmissionError(tl("กรุณายืนยันว่าข้อมูลที่กรอกเป็นความจริง", "Please confirm the information is true"));
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubmissionError(tl("กรุณาเข้าสู่ระบบก่อน", "Please sign in first"));
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("local_taxi_applications")
        .insert({
          user_id: session.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          nickname: formData.nickname,
          age: parseInt(formData.age, 10),
          phone: formData.phone,
          service_area: formData.serviceArea,
          stand_location: formData.standLocation,
          public_contact_address: formData.publicContactAddress,
          vehicle_plate: formData.vehiclePlate,
          vehicle_type: formData.vehicleType,
          vehicle_color: formData.vehicleColor,
          vehicle_description: formData.vehicleDescription,
          capacity: parseInt(formData.capacity, 10),
          luggage_note: formData.luggageNote,
          application_status: "pending",
        });

      if (insertError) throw insertError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "taxi_provider" })
        .eq("owner_id", session.user.id);

      if (profileError) console.warn("Could not update profile role", profileError);

      setApplicationStatus("pending");
      showToast(tl("ส่งคำขอเรียบร้อย", "Application submitted"), "success");
    } catch (err: any) {
      console.error(err);
      setSubmissionError(err.message || tl("เกิดข้อผิดพลาด", "An error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">{tl("กำลังตรวจสอบข้อมูล...", "Checking...")}</p>
      </div>
    );
  }

  if (driverProfile) {
    const isAvailable = driverProfile.available_now;
    const vInfo = driverProfile.local_taxi_vehicles?.[0] || driverProfile.local_taxi_vehicles || {};
    const verifInfo = driverProfile.local_taxi_verifications?.[0] || driverProfile.local_taxi_verifications || {};

    return (
      <div className="flex flex-col h-full w-full bg-background">
        <div className="bg-gradient-to-b from-primary to-primary/90 px-4 pt-12 pb-6 safe-bleed text-primary-foreground">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 -ml-1.5 hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-extrabold tracking-tight">{tl("แดชบอร์ดคนขับ", "Driver Dashboard")}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
            <h2 className="text-base font-bold text-foreground mb-1">
              {tl("สถานะการรับงาน", "Availability")}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              {tl("เปิดเพื่อให้นักท่องเที่ยวเห็นคุณ", "Turn on to let tourists find you")}
            </p>
            <button
              onClick={handleToggleAvailability}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                isAvailable
                  ? "bg-emerald-50 text-emerald-600 border-4 border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-muted text-muted-foreground border-4 border-border"
              }`}
            >
              <Power className={`w-9 h-9 mb-1.5 ${isAvailable ? "text-emerald-500" : ""}`} />
              <span className="text-xs font-extrabold">{isAvailable ? tl("พร้อม", "On") : tl("ปิด", "Off")}</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{driverProfile.first_name} {driverProfile.last_name}</h3>
              <p className="text-xs text-muted-foreground">
                {tl("ชื่อเล่น", "Nickname")}: {driverProfile.nickname}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {Number(driverProfile.rating || 5.0).toFixed(1)}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              {tl("ข้อมูลรถ", "Vehicle Info")}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 p-2.5 rounded-xl">
                <span className="text-[10px] text-muted-foreground">{tl("ประเภท", "Type")}</span>
                <p className="font-bold text-foreground mt-0.5">{vInfo.vehicle_type || "-"}</p>
              </div>
              <div className="bg-muted/50 p-2.5 rounded-xl">
                <span className="text-[10px] text-muted-foreground">{tl("ทะเบียน", "Plate")}</span>
                <p className="font-bold text-primary mt-0.5">{vInfo.vehicle_plate || "-"}</p>
              </div>
            </div>
            {vInfo.vehicle_description && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl leading-relaxed">
                {vInfo.vehicle_description}
              </p>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {tl("สถานะตรวจสอบ", "Verification Status")}
              </h3>
              {verifInfo.verification_status === "verified" ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {tl("ยืนยันแล้ว", "Verified")}
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tl("รอตรวจสอบ", "Pending")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {tl("อัปเดตล่าสุด", "Last updated")}: {verifInfo.verified_at || tl("อยู่ระหว่างดำเนินการ", "In progress")}
            </p>
          </div>

          <button
            onClick={() => {
              setEditFormData({
                phone: driverProfile.phone || "",
                serviceArea: driverProfile.service_area || "",
                standLocation: driverProfile.stand_location || "",
                publicContactAddress: driverProfile.public_contact_address || "",
                vehicleColor: vInfo.vehicle_color || "",
                vehicleDescription: vInfo.vehicle_description || "",
                capacity: vInfo.capacity ? vInfo.capacity.toString() : "",
                luggageNote: vInfo.luggage_note || "",
              });
              setIsEditServiceModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground font-bold text-sm py-3.5 rounded-2xl active:scale-[0.98] transition-all cursor-pointer hover:bg-accent"
          >
            <FileEdit className="w-4 h-4" />
            {tl("แก้ไขข้อมูลบริการ", "Edit Service Info")}
          </button>
        </div>

        {isEditServiceModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditServiceModalOpen(false)} />
            <div className="relative bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl border border-border animate-in slide-in-from-bottom duration-300">
              <div className="sticky top-0 bg-card border-b border-border z-10 px-5 py-4 flex items-center justify-between">
                <h2 className="font-bold text-foreground">{tl("แก้ไขข้อมูล", "Edit Service Info")}</h2>
                <button onClick={() => setIsEditServiceModalOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-all cursor-pointer">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>{tl("หากต้องการเปลี่ยนชื่อผู้ขับขี่ ประเภทรถ หรือทะเบียน กรุณาติดต่อผู้ดูแล", "To change name, vehicle type or plate, please contact admin.")}</p>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-sm font-bold text-foreground">{tl("ข้อมูลติดต่อและพื้นที่ให้บริการ", "Contact & Service Area")}</h3>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("เบอร์โทรศัพท์", "Phone")}</label>
                    <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("พื้นที่ให้บริการ", "Service Area")}</label>
                    <input type="text" value={editFormData.serviceArea} onChange={(e) => setEditFormData({ ...editFormData, serviceArea: e.target.value })} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("จุดจอดประจำ", "Stand Location")}</label>
                    <input type="text" value={editFormData.standLocation} onChange={(e) => setEditFormData({ ...editFormData, standLocation: e.target.value })} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("ที่อยู่ติดต่อสาธารณะ", "Public Contact")}</label>
                    <input type="text" value={editFormData.publicContactAddress} onChange={(e) => setEditFormData({ ...editFormData, publicContactAddress: e.target.value })} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-foreground">{tl("ข้อมูลรถ", "Vehicle Info")}</h3>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("สีรถ", "Vehicle Color")}</label>
                    <input type="text" value={editFormData.vehicleColor} onChange={(e) => setEditFormData({ ...editFormData, vehicleColor: e.target.value })} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("รายละเอียดรถ", "Vehicle Description")}</label>
                    <textarea value={editFormData.vehicleDescription} onChange={(e) => setEditFormData({ ...editFormData, vehicleDescription: e.target.value })} rows={2} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("จำนวนที่นั่ง", "Capacity")}</label>
                      <input type="number" value={editFormData.capacity} onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">{tl("สัมภาระ", "Luggage")}</label>
                      <input type="text" value={editFormData.luggageNote} onChange={(e) => setEditFormData({ ...editFormData, luggageNote: e.target.value })} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-2">
                <button
                  onClick={handleSaveServiceData}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-3.5 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? tl("กำลังบันทึก...", "Saving...") : tl("บันทึก", "Save")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (applicationStatus) {
    let statusIcon, statusTitle, statusDesc, statusColor, statusBg;

    switch (applicationStatus) {
      case "pending":
        statusIcon = <Clock className="w-12 h-12 text-primary mb-4" />;
        statusTitle = tl("รอตรวจสอบ", "Pending Review");
        statusDesc = tl("ส่งคำขอเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบข้อมูล", "Your application has been submitted and is pending review.");
        statusColor = "text-primary";
        statusBg = "bg-primary/5 border-primary/15";
        break;
      case "revision_required":
        statusIcon = <FileEdit className="w-12 h-12 text-amber-500 mb-4" />;
        statusTitle = tl("ต้องแก้ไขข้อมูล", "Revision Required");
        statusDesc = tl("เจ้าหน้าที่ตรวจสอบแล้วพบว่าข้อมูลไม่ถูกต้อง โปรดติดต่อเพื่อแก้ไข", "Please contact the admin to revise your information.");
        statusColor = "text-amber-600";
        statusBg = "bg-amber-50 border-amber-200";
        break;
      case "approved":
        statusIcon = <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />;
        statusTitle = tl("ผ่านการอนุมัติ", "Approved");
        statusDesc = tl("ข้อมูลของคุณได้รับการอนุมัติและเผยแพร่ในระบบแล้ว", "Your profile is now live on the Local Taxi service.");
        statusColor = "text-emerald-600";
        statusBg = "bg-emerald-50 border-emerald-200";
        break;
      case "rejected":
        statusIcon = <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />;
        statusTitle = tl("ไม่ผ่านการอนุมัติ", "Rejected");
        statusDesc = tl("ข้อมูลของคุณไม่ผ่านการประเมินเพื่อเข้าร่วมในระบบ", "Your application did not meet the requirements.");
        statusColor = "text-rose-600";
        statusBg = "bg-rose-50 border-rose-200";
        break;
      default:
        statusIcon = <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />;
        statusTitle = tl("สถานะไม่ชัดเจน", "Unknown Status");
        statusDesc = tl("เกิดข้อผิดพลาดในการโหลดสถานะ", "Failed to load application status.");
        statusColor = "text-muted-foreground";
        statusBg = "bg-muted border-border";
    }

    return (
      <div className="flex flex-col h-full w-full bg-background">
        <div className="bg-gradient-to-b from-primary to-primary/90 px-4 pt-12 pb-6 safe-bleed text-primary-foreground">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 -ml-1.5 hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-extrabold tracking-tight">{tl("สถานะการสมัคร", "Application Status")}</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className={`border rounded-2xl p-8 flex flex-col items-center text-center w-full max-w-sm ${statusBg}`}>
            {statusIcon}
            <h2 className={`text-xl font-extrabold mb-2 ${statusColor}`}>{statusTitle}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{statusDesc}</p>
            <button
              onClick={onBack}
              className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-3 rounded-2xl active:scale-[0.98] transition-all cursor-pointer"
            >
              {tl("กลับ", "Back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="bg-gradient-to-b from-primary to-primary/90 px-4 pt-12 pb-6 safe-bleed text-primary-foreground">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 -ml-1.5 hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold tracking-tight">{tl("สมัครเป็นผู้ให้บริการ", "Register as Provider")}</h1>
            <p className="text-[11px] text-primary-foreground/70 font-medium mt-0.5">
              {tl("ลงทะเบียนเพื่อเข้าร่วมบริการ Local Taxi พิชัย", "Join the Local Taxi Phichai network")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-[calc(100px+env(safe-area-inset-bottom))]">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">{tl("ข้อมูลผู้ขับขี่", "Driver Info")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("ชื่อ", "First Name")}</label>
              <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={tl("ชื่อจริง", "First name")} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("นามสกุล", "Last Name")}</label>
              <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={tl("นามสกุล", "Last name")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("ชื่อเล่น", "Nickname")}</label>
              <input required name="nickname" value={formData.nickname} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={tl("เช่น ลุงสมชาย", "e.g. Uncle Somchai")} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("อายุ", "Age")}</label>
              <input required name="age" value={formData.age} onChange={handleInputChange} type="number" min="18" max="99" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("เบอร์โทรศัพท์", "Phone")}</label>
            <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="08xxxxxxxx" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-foreground">{tl("พื้นที่ให้บริการ", "Service Area")}</h2>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("พื้นที่ให้บริการหลัก", "Main Service Area")}</label>
            <input required name="serviceArea" value={formData.serviceArea} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder={tl("เช่น รอบตัวเมือง สถานีรถไฟ", "e.g. City center, train station")} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("จุดจอดประจำ", "Stand Location")}</label>
            <input required name="standLocation" value={formData.standLocation} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder={tl("เช่น หน้าตลาดสดพิชัย", "e.g. Phichai Market")} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("ที่อยู่สังกัด", "Affiliation")}</label>
            <textarea required name="publicContactAddress" value={formData.publicContactAddress} onChange={handleInputChange} rows={2} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder={tl("เช่น ชมรมรถยนต์บริการท่องเที่ยว พิชัย", "e.g. Phichai Tourism Taxi Association")} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Truck className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">{tl("ข้อมูลรถ", "Vehicle Info")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("ประเภทรถ", "Vehicle Type")}</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer">
                <option value="รถยนต์">{tl("รถยนต์", "Car")}</option>
                <option value="รถตู้">{tl("รถตู้", "Van")}</option>
                <option value="รถสองแถว">{tl("รถสองแถว", "Songthaew")}</option>
                <option value="มอเตอร์ไซค์รับจ้าง">{tl("มอเตอร์ไซค์", "Motorbike")}</option>
                <option value="รถกระบะรับจ้าง">{tl("รถกระบะ", "Pickup")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("ทะเบียนรถ", "License Plate")}</label>
              <input required name="vehiclePlate" value={formData.vehiclePlate} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={tl("กข 1234 อุตรดิตถ์", "Plate number")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("สีรถ", "Color")}</label>
              <input required name="vehicleColor" value={formData.vehicleColor} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={tl("เขียว-เหลือง", "Green-Yellow")} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("ที่นั่ง", "Capacity")}</label>
              <input required name="capacity" value={formData.capacity} onChange={handleInputChange} type="number" min="1" max="20" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="4" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("รายละเอียดรถ", "Vehicle Description")}</label>
            <input required name="vehicleDescription" value={formData.vehicleDescription} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={tl("เช่น รถเก๋งใหม่ แอร์เย็น", "e.g. New sedan, AC")} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">{tl("หมายเหตุสัมภาระ", "Luggage Note")}</label>
            <input required name="luggageNote" value={formData.luggageNote} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={tl("เช่น ใส่กระเป๋า 28 นิ้วได้ 2 ใบ", "e.g. 2 large suitcases")} />
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200/50 rounded-2xl cursor-pointer">
          <input
            required
            name="confirmTruth"
            checked={formData.confirmTruth}
            onChange={handleInputChange}
            type="checkbox"
            className="w-5 h-5 mt-0.5 rounded border-amber-300 text-primary focus:ring-primary shrink-0"
          />
          <span className="text-xs text-amber-800 font-medium leading-relaxed">
            {tl(
              "ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดเป็นความจริง และยินยอมให้ตรวจสอบประวัติเพื่อยืนยันตัวตนก่อนเผยแพร่ในแอปพลิเคชัน",
              "I confirm all information is true and consent to background verification for publication in the app."
            )}
          </span>
        </label>

        {submissionError && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{submissionError}</p>
          </div>
        )}
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/95 to-transparent pointer-events-none z-[60]">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-3.5 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {tl("กำลังส่ง...", "Submitting...")}
              </>
            ) : (
              tl("ส่งคำขอตรวจสอบ", "Submit for Review")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
