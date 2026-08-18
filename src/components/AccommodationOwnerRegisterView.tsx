import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Bed, Building2, CheckCircle2, Clock, FileEdit, Globe, HelpCircle, MapPin, Phone, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface AccommodationOwnerRegisterViewProps {
  onBack: () => void;
}

const propertyTypes = [
  { value: "hotel", label: "โรงแรม" },
  { value: "resort", label: "รีสอร์ต" },
  { value: "homestay", label: "โฮมสเตย์" },
  { value: "guesthouse", label: "เกสต์เฮาส์" },
  { value: "apartment", label: "อพาร์ตเมนต์" },
  { value: "rental", label: "บ้านเช่า / ห้องเช่า" },
  { value: "other", label: "อื่น ๆ" },
];

function parseAmenities(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AccommodationOwnerRegisterView({ onBack }: AccommodationOwnerRegisterViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [approvedAccommodation, setApprovedAccommodation] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    propertyName: "",
    ownerName: "",
    phone: "",
    lineId: "",
    propertyType: "hotel",
    address: "",
    latitude: "17.30",
    longitude: "100.08",
    priceRange: "",
    description: "",
    website: "",
    bookingDirectUrl: "",
    bookingAgodaUrl: "",
    bookingBookingUrl: "",
    amenities: "WiFi, ที่จอดรถ, เครื่องปรับอากาศ",
    roomSummary: "",
    imageUrl: "",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    cancellationPolicy: "",
    confirmTruth: false,
  });

  useEffect(() => {
    async function checkExistingApplication() {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const { data: accommodationData, error: accommodationError } = await supabase
          .from("accommodations")
          .select("id, name, property_type, phone, address, is_active")
          .eq("owner_user_id", session.user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (accommodationError && accommodationError.code !== "PGRST116") {
          console.error("Error fetching approved accommodation:", accommodationError);
        } else if (accommodationData) {
          setApprovedAccommodation(accommodationData);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("accommodation_applications")
          .select("application_status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching accommodation application:", error);
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target as HTMLInputElement;
    const checked = (event.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionError(null);
    setIsSubmitting(true);

    if (!formData.confirmTruth) {
      setSubmissionError("กรุณายืนยันว่าข้อมูลที่กรอกเป็นความจริง");
      setIsSubmitting(false);
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      setSubmissionError("กรุณาระบุละติจูดให้ถูกต้อง");
      setIsSubmitting(false);
      return;
    }

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      setSubmissionError("กรุณาระบุลองจิจูดให้ถูกต้อง");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubmissionError("กรุณาเข้าสู่ระบบก่อนทำการสมัคร");
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("accommodation_applications")
        .insert({
          user_id: session.user.id,
          property_name: formData.propertyName,
          owner_name: formData.ownerName,
          phone: formData.phone,
          line_id: formData.lineId || null,
          property_type: formData.propertyType,
          address: formData.address || null,
          latitude,
          longitude,
          price_range: formData.priceRange || null,
          description: formData.description || null,
          website: formData.website || null,
          booking_direct_url: formData.bookingDirectUrl || null,
          booking_agoda_url: formData.bookingAgodaUrl || null,
          booking_booking_url: formData.bookingBookingUrl || null,
          amenities: parseAmenities(formData.amenities),
          room_summary: formData.roomSummary || null,
          image_url: formData.imageUrl || null,
          check_in_time: formData.checkInTime || "14:00",
          check_out_time: formData.checkOutTime || "12:00",
          cancellation_policy: formData.cancellationPolicy || null,
          application_status: "pending",
        });

      if (insertError) throw insertError;

      setApplicationStatus("pending");
    } catch (err: any) {
      console.error(err);
      setSubmissionError(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-muted items-center justify-center space-y-4">
        <Clock className="w-10 h-10 text-primary animate-spin" />
        <p className="font-medium text-muted-foreground">กำลังตรวจสอบข้อมูล...</p>
      </div>
    );
  }

  if (approvedAccommodation) {
    return (
      <div className="flex flex-col h-full bg-muted relative overflow-hidden">
        <div className="bg-card px-4 pt-12 pb-4 relative z-20 flex items-center shrink-0 border-b border-border">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted/80 transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">แดชบอร์ดเจ้าของที่พัก</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Bed className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-emerald-800">{approvedAccommodation.name}</h2>
            <p className="mt-1 text-sm font-medium text-emerald-700">เผยแพร่บนแผนที่และหน้าที่พักแล้ว</p>
            <div className="mt-4 space-y-2 rounded-2xl bg-white/70 p-4 text-xs text-emerald-900">
              <p><Building2 className="mr-1 inline h-3.5 w-3.5" /> ประเภท: {approvedAccommodation.property_type}</p>
              <p><Phone className="mr-1 inline h-3.5 w-3.5" /> โทร: {approvedAccommodation.phone || "ยังไม่ระบุ"}</p>
              <p><MapPin className="mr-1 inline h-3.5 w-3.5" /> {approvedAccommodation.address || "พิกัดในอำเภอพิชัย"}</p>
            </div>
            <button onClick={onBack} className="mt-5 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95">
              กลับหน้าโปรไฟล์
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStatus) {
    let statusIcon, statusTitle, statusDesc, statusColor, statusBg;

    switch (applicationStatus) {
      case "pending":
        statusIcon = <Clock className="w-12 h-12 text-primary mb-4" />;
        statusTitle = "รอตรวจสอบ";
        statusDesc = "ส่งคำขอเรียบร้อยแล้ว แอดมินจะตรวจสอบข้อมูลที่พักก่อนอนุมัติให้แสดงบนแผนที่";
        statusColor = "text-primary";
        statusBg = "bg-blue-50 border-blue-200";
        break;
      case "revision_required":
        statusIcon = <FileEdit className="w-12 h-12 text-amber-500 mb-4" />;
        statusTitle = "ต้องแก้ไขข้อมูล";
        statusDesc = "ข้อมูลไม่ครบถ้วนหรือยังไม่ชัดเจน โปรดติดต่อแอดมินเพื่อแก้ไขข้อมูลก่อนส่งตรวจอีกครั้ง";
        statusColor = "text-amber-600";
        statusBg = "bg-amber-50 border-amber-200";
        break;
      case "approved":
        statusIcon = <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />;
        statusTitle = "ผ่านการอนุมัติ";
        statusDesc = "ที่พักของคุณได้รับการอนุมัติแล้ว และจะปรากฏในระบบหลังโหลดข้อมูลใหม่";
        statusColor = "text-emerald-600";
        statusBg = "bg-emerald-50 border-emerald-200";
        break;
      case "rejected":
        statusIcon = <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />;
        statusTitle = "ไม่อนุมัติ";
        statusDesc = "ข้อมูลที่พักยังไม่ผ่านเกณฑ์การเข้าร่วมระบบในรอบนี้";
        statusColor = "text-rose-600";
        statusBg = "bg-rose-50 border-rose-200";
        break;
      default:
        statusIcon = <HelpCircle className="w-12 h-12 text-muted-foreground mb-4" />;
        statusTitle = "สถานะไม่ชัดเจน";
        statusDesc = "เกิดข้อผิดพลาดในการโหลดสถานะ";
        statusColor = "text-muted-foreground";
        statusBg = "bg-muted border-border";
    }

    return (
      <div className="flex flex-col h-full bg-muted relative overflow-hidden">
        <div className="bg-card px-4 pt-12 pb-4 relative z-20 flex items-center shrink-0">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted/80 transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">สถานะคำขอที่พัก</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
          <div className={`border rounded-2xl p-8 flex flex-col items-center text-center w-full max-w-sm ${statusBg}`}>
            {statusIcon}
            <h2 className={`text-2xl font-bold mb-2 ${statusColor}`}>{statusTitle}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{statusDesc}</p>
            <button onClick={onBack} className="mt-8 bg-primary text-primary-foreground font-medium py-3 px-6 rounded-full shadow-sm hover:bg-primary/90 active:scale-95 transition-all w-full">
              กลับหน้าโปรไฟล์
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted relative overflow-hidden">
      <div className="bg-card px-4 pt-12 pb-4 relative z-20 shrink-0 border-b border-border">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted/80 transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">ลงทะเบียนที่พัก</h1>
          </div>
        </div>
        <p className="text-sm mt-3 font-medium text-muted-foreground ml-1">
          ส่งข้อมูลโรงแรม โฮมสเตย์ รีสอร์ต หรือบ้านเช่าเพื่อแสดงบนแผนที่ TongDee GO
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
        <section className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="w-5 h-5" />
            <h2 className="text-sm font-bold">ข้อมูลที่พัก</h2>
          </div>
          <Input label="ชื่อที่พัก" name="propertyName" value={formData.propertyName} onChange={handleInputChange} required />
          <Input label="ชื่อผู้ติดต่อ / เจ้าของ" name="ownerName" value={formData.ownerName} onChange={handleInputChange} required />
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">ประเภทที่พัก</label>
            <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30">
              {propertyTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
          <Input label="ช่วงราคา" name="priceRange" value={formData.priceRange} onChange={handleInputChange} placeholder="เช่น 800-1,500 บาท/คืน" />
          <TextArea label="รายละเอียดที่พัก" name="description" value={formData.description} onChange={handleInputChange} required />
        </section>

        <section className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <Phone className="w-5 h-5" />
            <h2 className="text-sm font-bold">ช่องทางติดต่อ</h2>
          </div>
          <Input label="เบอร์โทร" name="phone" value={formData.phone} onChange={handleInputChange} required />
          <Input label="LINE ID" name="lineId" value={formData.lineId} onChange={handleInputChange} />
          <Input label="เว็บไซต์" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." />
          <Input label="ลิงก์จองโดยตรง" name="bookingDirectUrl" value={formData.bookingDirectUrl} onChange={handleInputChange} />
          <Input label="ลิงก์ Agoda" name="bookingAgodaUrl" value={formData.bookingAgodaUrl} onChange={handleInputChange} />
          <Input label="ลิงก์ Booking.com" name="bookingBookingUrl" value={formData.bookingBookingUrl} onChange={handleInputChange} />
        </section>

        <section className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-600">
            <MapPin className="w-5 h-5" />
            <h2 className="text-sm font-bold">ตำแหน่งและบริการ</h2>
          </div>
          <Input label="ที่อยู่" name="address" value={formData.address} onChange={handleInputChange} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ละติจูด" name="latitude" value={formData.latitude} onChange={handleInputChange} required />
            <Input label="ลองจิจูด" name="longitude" value={formData.longitude} onChange={handleInputChange} required />
          </div>
          <Input label="สิ่งอำนวยความสะดวก" name="amenities" value={formData.amenities} onChange={handleInputChange} placeholder="คั่นด้วยเครื่องหมายจุลภาค" />
          <TextArea label="สรุปประเภทห้องพัก" name="roomSummary" value={formData.roomSummary} onChange={handleInputChange} placeholder="เช่น ห้องมาตรฐาน 2 คน, ห้องครอบครัว 4 คน" />
          <Input label="URL รูปหลัก" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="เวลาเช็คอิน" name="checkInTime" value={formData.checkInTime} onChange={handleInputChange} />
            <Input label="เวลาเช็คเอาต์" name="checkOutTime" value={formData.checkOutTime} onChange={handleInputChange} />
          </div>
          <TextArea label="นโยบายยกเลิก" name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleInputChange} />
        </section>

        <section className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <label className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
            <input type="checkbox" name="confirmTruth" checked={formData.confirmTruth} onChange={handleInputChange} className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" />
            <span>ยืนยันว่าข้อมูลทั้งหมดเป็นความจริง และยินยอมให้แอดมิน TongDee GO ตรวจสอบก่อนเผยแพร่</span>
          </label>
          {submissionError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {submissionError}
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งคำขอให้แอดมินตรวจสอบ"}
          </button>
        </section>

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          <span>หลังอนุมัติ ที่พักจะแสดงในแผนที่และหน้าแนะนำที่พัก</span>
          <Globe className="h-3.5 w-3.5 text-primary" />
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-foreground mb-1">{label}</label>
      <input {...props} className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}

function TextArea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-foreground mb-1">{label}</label>
      <textarea {...props} rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}
