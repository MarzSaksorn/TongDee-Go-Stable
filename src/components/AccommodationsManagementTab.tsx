import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bed, Edit, Eye, EyeOff, MoreVertical, Plus, RefreshCw, Save, Star, Trash2, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "./ToastProvider";

interface AccommodationsManagementTabProps {
  pushDebug: (message: string, payload?: unknown) => void;
  pushError: (message: string, error?: any, context?: any) => void;
  onRefreshAppAccommodations?: () => void;
}

const propertyTypes = ["hotel", "resort", "homestay", "guesthouse", "apartment"];

const defaultRoomTypes = JSON.stringify([
  {
    name: "ห้องมาตรฐาน",
    price: 800,
    description: "ห้องพักสะอาดพร้อมเครื่องปรับอากาศ",
    max_guests: 2,
    images: []
  }
], null, 2);

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaToArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AccommodationsManagementTab({
  pushDebug,
  pushError,
  onRefreshAppAccommodations
}: AccommodationsManagementTabProps) {
  const { showToast } = useToast();
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPropertyType, setFormPropertyType] = useState("hotel");
  const [formPriceRange, setFormPriceRange] = useState("");
  const [formRating, setFormRating] = useState("4.5");
  const [formPhone, setFormPhone] = useState("");
  const [formLineId, setFormLineId] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formAgoda, setFormAgoda] = useState("");
  const [formBooking, setFormBooking] = useState("");
  const [formDirect, setFormDirect] = useState("");
  const [formAmenities, setFormAmenities] = useState("WiFi, ที่จอดรถ, เครื่องปรับอากาศ");
  const [formRoomTypes, setFormRoomTypes] = useState(defaultRoomTypes);
  const [formImages, setFormImages] = useState("");
  const [formCheckIn, setFormCheckIn] = useState("14:00");
  const [formCheckOut, setFormCheckOut] = useState("12:00");
  const [formCancellationPolicy, setFormCancellationPolicy] = useState("");
  const [formLatitude, setFormLatitude] = useState("17.30");
  const [formLongitude, setFormLongitude] = useState("100.08");
  const [formAddress, setFormAddress] = useState("");
  const [formMarkerIcon, setFormMarkerIcon] = useState("พ");
  const [formMarkerColor, setFormMarkerColor] = useState("bg-emerald-600");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState("0");

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    setLoading(true);
    pushDebug("Fetching accommodations for admin panel");
    try {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        pushError("Failed to fetch accommodations", error);
        setAccommodations([]);
      } else {
        setAccommodations(data || []);
      }
    } catch (err: any) {
      pushError("Unexpected error fetching accommodations", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormId("");
    setFormName("");
    setFormDescription("");
    setFormPropertyType("hotel");
    setFormPriceRange("800-1,500 บาท/คืน");
    setFormRating("4.5");
    setFormPhone("");
    setFormLineId("");
    setFormWebsite("");
    setFormAgoda("");
    setFormBooking("");
    setFormDirect("");
    setFormAmenities("WiFi, ที่จอดรถ, เครื่องปรับอากาศ");
    setFormRoomTypes(defaultRoomTypes);
    setFormImages("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80");
    setFormCheckIn("14:00");
    setFormCheckOut("12:00");
    setFormCancellationPolicy("ยกเลิกฟรี 24 ชั่วโมงก่อนเช็คอิน");
    setFormLatitude("17.30");
    setFormLongitude("100.08");
    setFormAddress("");
    setFormMarkerIcon("พ");
    setFormMarkerColor("bg-emerald-600");
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormSortOrder((accommodations.length * 10).toString());
  };

  const openAddModal = () => {
    setIsEditing(false);
    setValidationError(null);
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true);
    setValidationError(null);
    setFormId(item.id || "");
    setFormName(item.name || "");
    setFormDescription(item.description || "");
    setFormPropertyType(item.property_type || "hotel");
    setFormPriceRange(item.price_range || "");
    setFormRating((item.rating || 4.5).toString());
    setFormPhone(item.phone || "");
    setFormLineId(item.line_id || "");
    setFormWebsite(item.website || "");
    setFormAgoda(item.booking_links?.agoda || "");
    setFormBooking(item.booking_links?.booking || "");
    setFormDirect(item.booking_links?.direct || "");
    setFormAmenities((item.amenities || []).join(", "));
    setFormRoomTypes(JSON.stringify(item.room_types || [], null, 2));
    setFormImages((item.images || []).join("\n"));
    setFormCheckIn(item.check_in_time || "14:00");
    setFormCheckOut(item.check_out_time || "12:00");
    setFormCancellationPolicy(item.cancellation_policy || "");
    setFormLatitude((item.latitude || 0).toString());
    setFormLongitude((item.longitude || 0).toString());
    setFormAddress(item.address || "");
    setFormMarkerIcon(item.marker_icon || "พ");
    setFormMarkerColor(item.marker_color || "bg-emerald-600");
    setFormIsActive(item.is_active ?? true);
    setFormIsFeatured(item.is_featured ?? false);
    setFormSortOrder((item.sort_order ?? 0).toString());
    setShowFormModal(true);
  };

  const saveAccommodation = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    const safeId = formId.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!safeId || safeId !== formId) {
      setValidationError(`ID ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และอันเดอร์สกอร์เท่านั้น แนะนำ: ${safeId || "phichai_hotel"}`);
      return;
    }

    if (!formName.trim()) {
      setValidationError("กรุณาระบุชื่อที่พัก");
      return;
    }

    const rating = parseFloat(formRating);
    const latitude = parseFloat(formLatitude);
    const longitude = parseFloat(formLongitude);
    const sortOrder = parseInt(formSortOrder, 10);

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      setValidationError("คะแนนรีวิวต้องอยู่ระหว่าง 1 ถึง 5");
      return;
    }
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      setValidationError("ละติจูดต้องถูกต้อง");
      return;
    }
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      setValidationError("ลองจิจูดต้องถูกต้อง");
      return;
    }
    if (Number.isNaN(sortOrder)) {
      setValidationError("ลำดับจัดเรียงต้องเป็นตัวเลข");
      return;
    }

    let roomTypes: any[] = [];
    try {
      roomTypes = JSON.parse(formRoomTypes || "[]");
      if (!Array.isArray(roomTypes)) throw new Error("room_types must be array");
    } catch {
      setValidationError("รูปแบบ JSON ของประเภทห้องพักไม่ถูกต้อง");
      return;
    }

    const payload = {
      id: safeId,
      name: formName.trim(),
      description: formDescription.trim() || null,
      property_type: formPropertyType,
      price_range: formPriceRange.trim() || null,
      rating,
      phone: formPhone.trim() || null,
      line_id: formLineId.trim() || null,
      website: formWebsite.trim() || null,
      booking_links: {
        agoda: formAgoda.trim() || undefined,
        booking: formBooking.trim() || undefined,
        direct: formDirect.trim() || undefined,
      },
      amenities: commaToArray(formAmenities),
      room_types: roomTypes,
      images: linesToArray(formImages),
      check_in_time: formCheckIn.trim() || "14:00",
      check_out_time: formCheckOut.trim() || "12:00",
      cancellation_policy: formCancellationPolicy.trim() || null,
      latitude,
      longitude,
      address: formAddress.trim() || null,
      marker_icon: formMarkerIcon.trim() || "พ",
      marker_color: formMarkerColor.trim() || "bg-emerald-600",
      is_active: formIsActive,
      is_featured: formIsFeatured,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = isEditing
        ? await supabase.from("accommodations").update(payload).eq("id", safeId)
        : await supabase.from("accommodations").insert(payload);

      if (error) {
        pushError("Failed to save accommodation", error, payload);
        setValidationError(`เกิดข้อผิดพลาดจาก Supabase: ${error.message}`);
        return;
      }

      showToast("บันทึกข้อมูลที่พักเรียบร้อยแล้ว", "success");
      setShowFormModal(false);
      await fetchAccommodations();
      onRefreshAppAccommodations?.();
    } catch (err: any) {
      pushError("Unexpected error saving accommodation", err);
      setValidationError(`เกิดข้อผิดพลาดไม่คาดคิด: ${err.message || err}`);
    }
  };

  const toggleActive = async (item: any) => {
    const nextStatus = !item.is_active;
    setAccommodations((current) => current.map((row) => row.id === item.id ? { ...row, is_active: nextStatus } : row));
    const { error } = await supabase
      .from("accommodations")
      .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      pushError("Failed to toggle accommodation active state", error);
      setAccommodations((current) => current.map((row) => row.id === item.id ? { ...row, is_active: item.is_active } : row));
    } else {
      onRefreshAppAccommodations?.();
    }
  };

  const deleteAccommodation = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("accommodations").delete().eq("id", deleteTarget.id);
    if (error) {
      pushError("Failed to delete accommodation", error);
      showToast(`ลบไม่สำเร็จ: ${error.message}`, "error");
      return;
    }
    setDeleteTarget(null);
    await fetchAccommodations();
    onRefreshAppAccommodations?.();
  };

  const filteredList = useMemo(() => {
    return accommodations.filter((item) => {
      const matchesSearch = [item.name, item.id, item.description, item.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" && item.is_active) || (statusFilter === "inactive" && !item.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [accommodations, searchQuery, statusFilter]);

  return (
    <div className="space-y-4" id="accommodations-tab-content">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-card p-4 rounded-xl border border-border">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="ค้นหาชื่อ, ID, ที่อยู่..."
          className="md:col-span-5 w-full pl-4 pr-4 py-2.5 text-xs bg-muted border border-border rounded-xl outline-none focus:border-primary focus:bg-card text-foreground font-sans"
        />
        <div className="md:col-span-4 flex gap-1 bg-muted/50 p-0.5 rounded-xl">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg cursor-pointer transition-all ${statusFilter === status ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              {status === "all" ? "ทั้งหมด" : status === "active" ? "เปิดบริการ" : "ปิดบริการ"}
            </button>
          ))}
        </div>
        <div className="md:col-span-3 flex gap-2 justify-end">
          <button onClick={fetchAccommodations} className="p-2.5 bg-muted/50 text-muted-foreground hover:bg-muted rounded-xl active:scale-95 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openAddModal} className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground text-xs font-black rounded-xl flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> เพิ่มที่พัก
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-xs font-semibold mt-4">กำลังโหลดข้อมูลที่พัก...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-border rounded-xl text-center p-6">
          <Bed className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-xs font-bold text-foreground">ไม่พบข้อมูลที่พัก</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4 text-foreground relative">
              <div className="flex items-start gap-3">
                <img src={item.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=160&auto=format&fit=crop&q=80"} alt={item.name} className="h-16 w-16 rounded-2xl object-cover bg-muted border border-border" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold truncate">{item.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{item.id}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-bold">{item.property_type}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-bold inline-flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-500" />{item.rating}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>{item.is_active ? "เปิดบริการ" : "ปิดบริการ"}</span>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === item.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-2xl shadow-xl py-1.5 z-50">
                        <button onClick={() => { openEditModal(item); setOpenMenuId(null); }} className="w-full px-4 py-2.5 text-foreground hover:bg-muted flex items-center gap-2 text-[11px] font-semibold">
                          <Edit className="w-3.5 h-3.5 text-primary" /> แก้ไขรายละเอียด
                        </button>
                        <button onClick={() => { toggleActive(item); setOpenMenuId(null); }} className="w-full px-4 py-2.5 text-foreground hover:bg-muted flex items-center gap-2 text-[11px] font-semibold border-t border-border">
                          {item.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-green-500" />} {item.is_active ? "ปิดบริการ" : "เปิดบริการ"}
                        </button>
                        <button onClick={() => { setDeleteTarget(item); setOpenMenuId(null); }} className="w-full px-4 py-2.5 text-destructive hover:bg-destructive/10 flex items-center gap-2 text-[11px] font-bold border-t border-border">
                          <Trash2 className="w-3.5 h-3.5" /> ลบที่พัก
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-muted border border-border p-3 text-[11px] text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">{item.price_range || "ยังไม่ระบุราคา"}</p>
                <p>{item.description}</p>
                <p className="font-mono text-[10px]">Lat {Number(item.latitude || 0).toFixed(5)} / Lng {Number(item.longitude || 0).toFixed(5)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold">{isEditing ? `แก้ไขที่พัก: ${formName}` : "เพิ่มที่พักใหม่"}</h3>
                <p className="text-[10px] text-white/80 mt-0.5">ข้อมูลแสดงบนแผนที่และหน้ารายละเอียดที่พัก</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={saveAccommodation} className="flex-1 overflow-y-auto p-5 space-y-4 text-foreground">
              {validationError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2.5 text-xs text-destructive font-semibold">
                  <AlertTriangle className="w-4 h-4 mt-0.5" /> {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Slug ID" value={formId} onChange={setFormId} disabled={isEditing} mono />
                <Field label="ชื่อที่พัก" value={formName} onChange={setFormName} />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">ประเภทที่พัก</label>
                  <select value={formPropertyType} onChange={(event) => setFormPropertyType(event.target.value)} className="w-full text-xs p-3 bg-muted border border-border rounded-lg outline-none">
                    {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <Field label="ช่วงราคา" value={formPriceRange} onChange={setFormPriceRange} />
                <Field label="คะแนน" value={formRating} onChange={setFormRating} mono />
                <Field label="โทรศัพท์" value={formPhone} onChange={setFormPhone} />
                <Field label="Line ID" value={formLineId} onChange={setFormLineId} />
                <Field label="เว็บไซต์" value={formWebsite} onChange={setFormWebsite} mono />
                <Field label="ละติจูด" value={formLatitude} onChange={setFormLatitude} mono />
                <Field label="ลองจิจูด" value={formLongitude} onChange={setFormLongitude} mono />
                <Field label="เช็คอิน" value={formCheckIn} onChange={setFormCheckIn} />
                <Field label="เช็คเอาท์" value={formCheckOut} onChange={setFormCheckOut} />
                <Field label="มาร์กเกอร์" value={formMarkerIcon} onChange={setFormMarkerIcon} />
                <Field label="สีมาร์กเกอร์" value={formMarkerColor} onChange={setFormMarkerColor} mono />
                <Field label="ลำดับจัดเรียง" value={formSortOrder} onChange={setFormSortOrder} mono />
              </div>

              <TextArea label="คำอธิบาย" value={formDescription} onChange={setFormDescription} />
              <TextArea label="ที่อยู่" value={formAddress} onChange={setFormAddress} />
              <TextArea label="นโยบายยกเลิก" value={formCancellationPolicy} onChange={setFormCancellationPolicy} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Agoda URL" value={formAgoda} onChange={setFormAgoda} mono />
                <Field label="Booking URL" value={formBooking} onChange={setFormBooking} mono />
                <Field label="Direct URL" value={formDirect} onChange={setFormDirect} mono />
              </div>

              <TextArea label="Amenities (คั่นด้วย comma)" value={formAmenities} onChange={setFormAmenities} />
              <TextArea label="รูปภาพ (1 URL ต่อบรรทัด)" value={formImages} onChange={setFormImages} mono />
              <TextArea label="Room Types JSON" value={formRoomTypes} onChange={setFormRoomTypes} mono tall />

              <div className="flex flex-wrap gap-4 rounded-xl bg-muted p-3 border border-border">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-foreground">
                  <input type="checkbox" checked={formIsActive} onChange={(event) => setFormIsActive(event.target.checked)} /> เปิดบริการ
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-foreground">
                  <input type="checkbox" checked={formIsFeatured} onChange={(event) => setFormIsFeatured(event.target.checked)} /> แนะนำพิเศษ
                </label>
              </div>

              <div className="sticky bottom-0 bg-card border-t border-border pt-3 flex gap-2">
                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 py-3 bg-muted text-foreground text-xs font-bold rounded-xl">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5">
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 border border-border max-w-sm w-full">
            <h3 className="text-sm font-bold text-foreground">ลบที่พักนี้?</h3>
            <p className="text-xs text-muted-foreground mt-2">ข้อมูล {deleteTarget.name} จะถูกลบออกจากระบบ</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 bg-muted rounded-xl text-xs font-bold">ยกเลิก</button>
              <button onClick={deleteAccommodation} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-xs font-bold">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, disabled, mono }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full text-xs p-3 bg-muted border border-border focus:border-primary focus:bg-card disabled:opacity-60 outline-none rounded-lg ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, mono, tall }: { label: string; value: string; onChange: (value: string) => void; mono?: boolean; tall?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full text-xs p-3 bg-muted border border-border focus:border-primary focus:bg-card outline-none rounded-lg resize-y ${mono ? "font-mono" : ""} ${tall ? "h-48" : "h-24"}`}
      />
    </div>
  );
}
