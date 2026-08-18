import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Save, RefreshCw, Check, X, AlertTriangle, Eye, EyeOff, ShieldAlert, Sparkles, MapPin, MoreVertical, BookOpen, Clock, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "./ToastProvider";

interface TourismLocationsManagementTabProps {
  pushDebug: (message: string, payload?: unknown) => void;
  pushError: (message: string, error?: any, context?: any) => void;
  onRefreshAppLocations?: () => void;
}

export default function TourismLocationsManagementTab({
  pushDebug,
  pushError,
  onRefreshAppLocations
}: TourismLocationsManagementTabProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("ทั้งหมด");

  // Add / Edit form state
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Danger action / Hard Delete Modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [placeToDelete, setPlaceToDelete] = useState<any | null>(null);
  const [hardDeleteInput, setHardDeleteInput] = useState<string>("");
  
  // Form fields
  const [formId, setFormId] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formLocationCategory, setFormLocationCategory] = useState<string>("วัฒนธรรม");
  const [formRating, setFormRating] = useState<string>("4.5");
  const [formHistorySummary, setFormHistorySummary] = useState<string>("");
  const [formCulturalHighlights, setFormCulturalHighlights] = useState<string>("");
  const [formBestTime, setFormBestTime] = useState<string>("");
  const [formNeedToKnow, setFormNeedToKnow] = useState<string>("");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [formVideoUrl, setFormVideoUrl] = useState<string>("");
  const [formAudioStory, setFormAudioStory] = useState<string>("");
  const [formLatitude, setFormLatitude] = useState<string>("17.304");
  const [formLongitude, setFormLongitude] = useState<string>("100.072");
  const [formMarkerIcon, setFormMarkerIcon] = useState<string>("");
  const [formMarkerColor, setFormMarkerColor] = useState<string>("bg-primary");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formSortOrder, setFormSortOrder] = useState<string>("0");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
  const { showToast } = useToast();

  const categories = ["ทั้งหมด", "วัฒนธรรม", "อาหาร", "ธรรมชาติ", "ความสะดวก"];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    pushDebug("Fetching toourism locations for admin panel");
    try {
      const { data, error } = await supabase
        .from("tourism_locations")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        pushError("Failed to fetch tourism locations", error);
        setLocations([]);
      } else {
        pushDebug("Fetch tourism locations success", { count: data?.length || 0 });
        setLocations(data || []);
      }
    } catch (err: any) {
      pushError("Unexpected error fetching tourism locations for admin panel", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setValidationError(null);
    
    // Default form fields to blanks or placeholders
    setFormId("");
    setFormName("");
    setFormDescription("");
    setFormLocationCategory("วัฒนธรรม");
    setFormRating("4.5");
    setFormHistorySummary("");
    setFormCulturalHighlights("");
    setFormBestTime("");
    setFormNeedToKnow("");
    setFormImageUrl("https://images.unsplash.com/photo-1508248467877-9dec35e22ba0?w=600&auto=format&fit=crop&q=80");
    setFormVideoUrl("");
    setFormAudioStory("");
    setFormLatitude("17.30");
    setFormLongitude("100.08");
    setFormMarkerIcon("");
    setFormMarkerColor("bg-primary");
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormSortOrder((locations.length * 10).toString());

    setShowFormModal(true);
  };

  const handleOpenEditModal = (place: any) => {
    setIsEditing(true);
    setValidationError(null);
    
    setFormId(place.id);
    setFormName(place.name || "");
    setFormDescription(place.description || "");
    setFormLocationCategory(place.location_category || "วัฒนธรรม");
    setFormRating((place.rating || 4.5).toString());
    setFormHistorySummary(place.history_summary || "");
    setFormCulturalHighlights(place.cultural_highlights || "");
    setFormBestTime(place.best_time || "");
    setFormNeedToKnow(place.need_to_know || "");
    setFormImageUrl(place.image_url || "");
    setFormVideoUrl(place.video_url || "");
    setFormAudioStory(place.audio_story || "");
    setFormLatitude((place.latitude || 0).toString());
    setFormLongitude((place.longitude || 0).toString());
    setFormMarkerIcon(place.marker_icon || "");
    setFormMarkerColor(place.marker_color || "bg-primary");
    setFormIsActive(place.is_active ?? true);
    setFormIsFeatured(place.is_featured ?? false);
    setFormSortOrder((place.sort_order ?? 0).toString());

    setShowFormModal(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Dynamic field validation
    if (!formId.trim()) {
      setValidationError("กรุณาระบุ ID ของสถานที่ (ใช้รูปแบบภาษาอังกฤษ ตัวพิมพ์เล็ก และคั่นด้วยอันเดอร์สก็อร์ เช่น museum_pichet)");
      return;
    }
    const safeId = formId.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (safeId !== formId) {
      setValidationError(`ID ควรเป็นอักษรภาษาอังกฤษตัวพิมพ์เล็ก ตัวเลข และอันเดอร์สก็อร์เท่านั้น แนะนำให้ใช้: "${safeId}"`);
      return;
    }

    if (!formName.trim()) {
      setValidationError("กรุณาระบุชื่อสถานที่");
      return;
    }

    const latNum = parseFloat(formLatitude);
    const lngNum = parseFloat(formLongitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setValidationError("ละติจูด (Latitude) ต้องเป็นจำนวนตัวเลขอยู่ระหว่าง -90 ถึง 90");
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setValidationError("ลองจิจูด (Longitude) ต้องเป็นจำนวนตัวเลขอยู่ระหว่าง -180 ถึง 180");
      return;
    }

    const ratingNum = parseFloat(formRating);
    if (isNaN(ratingNum) || ratingNum < 1.0 || ratingNum > 5.0) {
      setValidationError("คะแนนรีวิวต้องอยู่ระหว่าง 1.0 ถึง 5.0");
      return;
    }

    const sortOrderNum = parseInt(formSortOrder, 10);
    if (isNaN(sortOrderNum)) {
      setValidationError("ลำดับการจัดเรียงต้องเป็นตัวเลข");
      return;
    }

    // Check for duplicate ID on insertion
    if (!isEditing) {
      const isExisting = locations.some(p => p.id === formId);
      if (isExisting) {
        setValidationError(`สถานที่ที่มี ID: "${formId}" นี้มีอยู่แล้วในระบบ กรุณาใช้ ID อื่นที่จำเพาะมากขึ้น`);
        return;
      }
    }

    const payload = {
      id: formId,
      name: formName.trim(),
      description: formDescription.trim() || null,
      location_category: formLocationCategory,
      rating: ratingNum,
      history_summary: formHistorySummary.trim() || null,
      cultural_highlights: formCulturalHighlights.trim() || null,
      best_time: formBestTime.trim() || null,
      need_to_know: formNeedToKnow.trim() || null,
      image_url: formImageUrl.trim() || null,
      video_url: formVideoUrl.trim() || null,
      audio_story: formAudioStory.trim() || null,
      latitude: latNum,
      longitude: lngNum,
      marker_icon: formMarkerIcon.trim() || "map",
      marker_color: formMarkerColor.trim() || "bg-primary",
      is_active: formIsActive,
      is_featured: formIsFeatured,
      sort_order: sortOrderNum,
      updated_at: new Date().toISOString()
    };

    pushDebug(`Saving location: ${isEditing ? 'UPDATE' : 'INSERT'}`, payload);

    try {
      let error = null;
      if (isEditing) {
        const { error: updateError } = await supabase
          .from("tourism_locations")
          .update(payload)
          .eq("id", formId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tourism_locations")
          .insert(payload);
        error = insertError;
      }

      if (error) {
        pushError(`Failed to save location ID: ${formId}`, error);
        setValidationError(`เกิดข้อผิดพลาดจาก Supabase: ${error.message}`);
      } else {
        pushDebug(`Location save success: ${formId}`);
        setShowFormModal(false);
        fetchLocations();
        // Invoke app cache refresh if available
        if (onRefreshAppLocations) {
          onRefreshAppLocations();
        }
      }
    } catch (err: any) {
      pushError("Unexpected error saving location in admin panel", err);
      setValidationError(`เกิดข้อผิดพลาดไม่คาดคิด: ${err.message || err}`);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    pushDebug(`Toggling location active status to ${nextStatus} for ID: ${id}`);
    
    // Optimistic UI update
    setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, is_active: nextStatus } : loc));

    try {
      const { error } = await supabase
        .from("tourism_locations")
        .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        pushError(`Failed to update active status for ID: ${id}`, error);
        // Revert on error
        setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, is_active: currentStatus } : loc));
      } else {
        pushDebug(`Active status toggle success for ID: ${id}`);
        if (onRefreshAppLocations) {
          onRefreshAppLocations();
        }
      }
    } catch (err: any) {
      pushError(`Unexpected error toggling status for ID: ${id}`, err);
      setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, is_active: currentStatus } : loc));
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    pushDebug(`Toggling featured status to ${nextStatus} for ID: ${id}`);
    
    // Optimistic update
    setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, is_featured: nextStatus } : loc));

    try {
      const { error } = await supabase
        .from("tourism_locations")
        .update({ is_featured: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        pushError(`Failed to update featured status for ID: ${id}`, error);
        setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, is_featured: currentStatus } : loc));
      } else {
        pushDebug(`Featured status toggle success for ID: ${id}`);
        if (onRefreshAppLocations) {
          onRefreshAppLocations();
        }
      }
    } catch (err: any) {
      pushError(`Unexpected error toggling featured for ID: ${id}`, err);
      setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, is_featured: currentStatus } : loc));
    }
  };

  const handleOpenDeleteConfirm = (place: any) => {
    setPlaceToDelete(place);
    setHardDeleteInput("");
    setShowDeleteConfirmModal(true);
  };

  const handleExecuteHardDelete = async () => {
    if (!placeToDelete) return;
    
    if (hardDeleteInput.toLowerCase() !== "delete") {
      alert("กรุณากรอกคำว่า 'delete' ยืนยันให้ถูกต้อง เพื่อทำการลงโทษลบแบบฮาร์ดดีลีท");
      return;
    }

    pushDebug(`Executing Hard Delete for ID: ${placeToDelete.id}`);
    try {
      const { error } = await supabase
        .from("tourism_locations")
        .delete()
        .eq("id", placeToDelete.id);

      if (error) {
        pushError(`Hard delete failed for ID: ${placeToDelete.id}`, error);
        showToast(`เกิดข้อผิดพลาดในการลบ: ${error.message}`, "error");
      } else {
        pushDebug(`Hard delete success for ID: ${placeToDelete.id}`);
        setShowDeleteConfirmModal(false);
        setPlaceToDelete(null);
        fetchLocations();
        if (onRefreshAppLocations) {
          onRefreshAppLocations();
        }
      }
    } catch (err: any) {
      pushError("Unexpected error performing hard delete", err);
      showToast(`ลบไม่สำเร็จ: ${err.message || err}`, "error");
    }
  };

  // Filter & Search computation
  const filteredList = locations.filter(loc => {
    const matchesSearch = 
      (loc.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && loc.is_active) ||
      (statusFilter === "inactive" && !loc.is_active);

    const matchesCategory = 
      !categoryFilter ||
      categoryFilter === "ทั้งหมด" ||
      loc.location_category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-4" id="tourism-locations-tab-content">
      {/* Search and action header bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-card p-4 rounded-xl border border-border">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ID, คำบรรยาย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-muted border border-border rounded-xl outline-none focus:border-primary focus:bg-card text-foreground font-sans"
          />
        </div>

        <div className="md:col-span-3 flex gap-1 bg-muted/50 p-0.5 rounded-xl">
          {(["all", "active", "inactive"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg cursor-pointer transition-all ${
                statusFilter === st
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-slate-700"
              }`}
            >
              {st === "all" ? "ทั้งหมด" : st === "active" ? "เปิดบริการ" : "ปิดบริการ"}
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full text-xs font-bold py-2 px-3 bg-muted border border-border rounded-xl outline-none text-foreground"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ทั้งหมด" ? "ทุกหมวด" : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex gap-1.5 shrink-0 justify-end w-full">
          <button
            onClick={fetchLocations}
            className="p-2.5 bg-muted/50 text-muted-foreground hover:bg-slate-200 rounded-xl cursor-pointer active:scale-95 transition-all text-xs font-extrabold flex items-center justify-center"
            title="รีโหลดข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="flex-1 md:flex-none py-2 px-4 bg-primary hover:bg-primary/90 active:scale-95 transition-all text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสถานที่</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-xs font-semibold mt-4">กำลังเปิดดึงข้อมูลสถานที่ท่องเที่ยวจากคลื่นฐานระบบ...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-border rounded-xl text-center p-6">
          <div className="w-14 h-14 bg-muted border border-border rounded-full flex items-center justify-center text-muted-foreground/60 mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-foreground">ไม่พบข้อมูลสถานที่หลัก</h3>
          <p className="text-[10px] text-muted-foreground/60 max-w-xs mt-1">
            ลองปรับเปลี่ยนคำสืบค้น หรือกดปุ่ม "เพิ่มสถานที่" เพื่อลงทะเบียนจุดปักหมุดวัฒนธรรมแห่งใหม่ในพิชัย
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((place) => (
              <div 
                key={place.id} 
                className="w-full max-w-full overflow-hidden rounded-xl border border-border bg-card p-4 relative text-foreground font-medium hover:border-slate-200 transition-all"
              >
                {/* Card Header: image, names, category and status badges, actions button */}
                <div className="flex w-full items-start gap-3">
                  {/* Image with fallback */}
                  <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl bg-muted/50 border border-slate-150/60">
                    <img
                      src={place.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format"}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title and metadata */}
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-xs sm:text-sm font-extrabold text-foreground leading-tight">
                      {place.name}
                    </h3>
                    
                    <div className="text-[9px] text-amber-500 font-mono flex flex-wrap items-center gap-1 mt-1">
                      <span>ID:</span>
                      <span className="bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.2 select-all font-semibold font-mono text-amber-600 truncate max-w-[120px] sm:max-w-[150px]">
                        {place.id}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 font-bold inline-flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />{place.rating}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1 items-center">
                      {/* Category Badge */}
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold ${
                        place.location_category === "วัฒนธรรม" 
                          ? "bg-blue-50 text-blue-600 border border-blue-100/60" 
                          : place.location_category === "ธรรมชาติ" 
                           ? "bg-emerald-50 text-emerald-600 border border-emerald-100/60" 
                          : place.location_category === "อาหาร" 
                          ? "bg-amber-50 text-amber-600 border border-amber-100/60" 
                          : "bg-muted/50 text-muted-foreground border border-border/60"
                      }`}>
                        {place.location_category}
                      </span>

                      {/* Active Status Badge */}
                      <span className={`inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold py-0.5 px-1.5 rounded-full border ${
                        place.is_active
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-muted text-muted-foreground/60 border-border"
                      }`}>
                        {place.is_active ? (
                          <>
                            <Eye className="w-2.5 h-2.5 text-green-500 fill-green-100 shrink-0" />
                            <span>เปิดบริการ</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-2.5 h-2.5 text-muted-foreground/60 shrink-0" />
                            <span>ปิดบริการ</span>
                          </>
                        )}
                      </span>

                      {/* Featured Badge */}
                      {place.is_featured && (
                        <span className="text-[8px] sm:text-[9px] font-bold py-0.5 px-1.5 rounded-full border bg-destructive/10 text-rose-600 border-rose-100">
                          แนะนำพิเศษ
                        </span>
                      )}
                      
                      {place.video_url && (
                        <span className="text-[8px] sm:text-[9px] font-bold py-0.5 px-1.5 rounded-full border bg-violet-50 text-violet-600 border-violet-100">
                          มีวิดีโอ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Action Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === place.id ? null : place.id)}
                      className="p-1.5 hover:bg-slate-100 active:scale-95 text-muted-foreground hover:text-slate-800 rounded-xl transition-all cursor-pointer border border-border bg-card flex items-center justify-center"
                      title="เลือกการปรับแต่ง"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {openMenuId === place.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-2xl shadow-xl py-1.5 z-50 mr-1 text-left font-sans animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenEditModal(place);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-foreground hover:bg-slate-50 flex items-center gap-2 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-500" />
                            <span>แก้ไขรายละเอียด</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleToggleFeatured(place.id, place.is_featured);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-foreground hover:bg-slate-50 flex items-center gap-2 text-[11px] font-semibold transition-colors cursor-pointer border-t border-border"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${place.is_featured ? 'text-amber-500 fill-amber-50' : 'text-muted-foreground/60'}`} />
                            <span>{place.is_featured ? "ยกเลิกแนะนำพิเศษ" : "ตั้งเป็นแนะนำพิเศษ"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleToggleActive(place.id, place.is_active);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-foreground hover:bg-slate-50 flex items-center gap-2 text-[11px] font-semibold transition-colors cursor-pointer border-t border-border"
                          >
                            {place.is_active ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-muted-foreground/60" />
                                <span>ปิดบริการชั่วคราว</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-green-500" />
                                <span>เปิดให้บริการปกติ</span>
                              </>
                            )}
                          </button>

                          <div className="border-t border-border my-1" />

                          <button
                            type="button"
                            onClick={() => {
                              handleOpenDeleteConfirm(place);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-rose-600 hover:bg-destructive/10 flex items-center gap-2 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            <span>ลบสถานที่ท่องเที่ยว</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Vital Stats details in a beautiful secure grid */}
                <div className="mt-3.5 grid grid-cols-1 gap-2 text-xs">
                  <div className="rounded-xl bg-muted border border-border/50 p-2.5">
                    <div className="text-xs font-medium text-muted-foreground/60 font-sans">ลำดับจัดเรียง</div>
                    <div className="mt-0.5 font-bold text-foreground text-[11px]">
                      ลำดับที่ {place.sort_order ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted border border-border/50 p-2.5">
                    <div className="text-xs font-medium text-muted-foreground/60">พิกัดทางภูมิศาสตร์</div>
                    <div className="mt-0.5 font-mono text-[9px] sm:text-[10px] text-muted-foreground break-words leading-tight">
                      Lat: {(place.latitude || 0).toFixed(5)}<br />
                      Lng: {(place.longitude || 0).toFixed(5)}
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted border border-border/50 p-2 flex items-center justify-between">
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-medium text-muted-foreground/60">มาร์กเกอร์</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5 font-mono truncate">
                        {place.marker_color || "default"}
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-center p-1 border border-border rounded-full bg-card shadow-xs shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${place.marker_color || 'bg-primary'} text-white`}>
                        {place.marker_icon || <MapPin className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Toggle expandable summary area */}
                <button
                  type="button"
                  onClick={() => setExpandedPlaceId(expandedPlaceId === place.id ? null : place.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-muted hover:bg-slate-100 border border-border/80 px-3 py-2 text-[11px] font-extrabold text-muted-foreground active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{expandedPlaceId === place.id ? "ซ่อนรายละเอียดคัดสรร" : "ดูคำอธิบายและประวัติทั้งหมด"}</span>
                </button>

                {expandedPlaceId === place.id && (
                  <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/60 p-3 text-xs leading-relaxed animate-in fade-in duration-150 text-muted-foreground">
                    {place.description && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground/60">คำอธิบายสังเขป</div>
                        <div className="mt-1 whitespace-pre-wrap break-words">{place.description}</div>
                      </div>
                    )}

                    {place.history_summary && (
                      <div>
                        <div className="text-xs font-medium text-primary flex items-center gap-1"><BookOpen className="w-3 h-3" /> ประวัติคัดสรร</div>
                        <div className="mt-1 whitespace-pre-wrap break-words">{place.history_summary}</div>
                      </div>
                    )}

                    {place.cultural_highlights && (
                      <div>
                        <div className="text-xs font-medium text-blue-500 flex items-center gap-1"><Sparkles className="w-3 h-3" /> มรดกวัฒนธรรมเด่น</div>
                        <div className="mt-1 whitespace-pre-wrap break-words">{place.cultural_highlights}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-150/40">
                      {place.best_time && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1"><Clock className="w-3 h-3" /> ช่วงเวลาแนะนำ</div>
                          <div className="mt-0.5 font-bold text-foreground break-words leading-snug">{place.best_time}</div>
                        </div>
                      )}
                      
                      {place.need_to_know && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground/60">ข้อควรจำพึงรู้</div>
                          <div className="mt-0.5 font-bold text-foreground break-words leading-snug">{place.need_to_know}</div>
                        </div>
                      )}
                    </div>

                    
                    {place.image_url && (
                      <div className="pt-2 border-t border-slate-150/40">
                        <div className="text-xs font-medium text-muted-foreground/60">ที่อยู่รูปภาพ (Image URL)</div>
                        <div className="mt-1 font-mono text-[9px] text-muted-foreground/60 break-all select-all select-none p-1.5 bg-card border border-border rounded-lg">{place.image_url}</div>
                      </div>
                    )}

                    {place.audio_story && (
                      <div className="pt-2">
                        <div className="text-xs font-medium text-muted-foreground/60">เรื่องเล่านิทานเสียงสังเคราะห์ (Audio Story Script)</div>
                        <div className="mt-1 font-mono text-[9px] text-muted-foreground/60 break-all select-all bg-card border border-border rounded-lg p-1.5 whitespace-pre-wrap">{place.audio_story}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted border border-border/80 rounded-xl text-[10px] text-muted-foreground/60 font-medium text-center">
            แสดงผลคัดกรอง <strong>{filteredList.length}</strong> จากรายการข้อมูลท่องเที่ยวเมืองพิชัยทั้งหมด <strong>{locations.length}</strong> แห่ง
          </div>
        </div>
      )}

      {/* CORE HIGH-FIDELITY ADD / EDIT MODAL FORM */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[32px] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primary text-white p-5 flex justify-between items-center relative shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {isEditing ? `แก้ไขสถานที่: ${formName}` : "ลงทะเบียนจุดท่องเที่ยว อ.พิชัย"}
                  </h3>
                  <p className="text-[10px] text-blue-100 mt-0.5">
                    ประทับตราจารึกระบบวัฒนธรรมและพาสปอร์ตดิจิทัล
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-black/10 text-white/80 hover:text-white flex items-center justify-center"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <form onSubmit={handleSaveLocation} className="flex-1 overflow-y-auto p-5 space-y-4 text-foreground">
              
              {validationError && (
                <div className="p-3 bg-destructive/10 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 font-semibold animate-shake">
                  <AlertTriangle className="w-4.5 h-4.5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Grid 1: ID, Name, Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <span>รหัสจำเพาะสถานที่ (Slug ID)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.toLowerCase())}
                    placeholder="เช่น old_palace_museumic"
                    className="w-full text-xs p-3 bg-muted border border-border focus:border-primary focus:bg-card disabled:bg-muted/50 disabled:text-muted-foreground/60 outline-none rounded-lg font-mono"
                  />
                  {!isEditing && (
                    <p className="text-[10px] text-muted-foreground/60">ใช้เป็นคีย์เชื่อมกับ checkins, digital_passport ห้ามซ้ำและห้ามเปลี่ยนภายหลัง</p>
                  )}
                </div>

                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    ชื่อสถานที่หลัก <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น วัดธรรมมาธิปไตย"
                    className="w-full text-xs p-3 bg-muted border border-border focus:border-primary focus:bg-card outline-none rounded-lg"
                  />
                </div>
              </div>

              {/* Grid 2: Category, Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    หมวดหมู่ทัศนนา
                  </label>
                  <select
                    value={formLocationCategory}
                    onChange={(e) => setFormLocationCategory(e.target.value)}
                    className="w-full text-xs p-3 bg-muted border border-border rounded-lg outline-none"
                  >
                    {categories.filter(c => c !== "ทั้งหมด").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    คะแนนรีวิวเริ่มต้น (Rating)
                  </label>
                  <input
                    type="text"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    placeholder="4.8"
                    className="w-full text-xs p-3 bg-muted border border-border outline-none rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Description and Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  คำบรรยายย่อ (Short Description)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="รายละเอียดสั้นๆ แสดงบนป้ายป๊อปอัพแผนที่และลานแนะนำ..."
                  className="w-full text-xs p-3 bg-muted border border-border outline-none rounded-lg h-24 resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  ลิ้งก์ URL ของภาพสถานที่ (Image URL)
                </label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs p-3 bg-muted border border-border outline-none rounded-lg font-mono text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  วิดีโอสถานที่ URL (Video URL)
                </label>
                <input
                  type="url"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full text-xs p-3 bg-muted border border-border outline-none rounded-lg font-mono text-muted-foreground"
                />
                <p className="text-[9px] text-muted-foreground/60 font-medium">
                  ใช้สำหรับแสดงวิดีโอด้านบนของหน้ารายละเอียดสถานที่ ถ้าไม่ใส่จะใช้รูปภาพเดิมแทน
                </p>
              </div>

              {/* Latitude, Longitude, Map customizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/40 p-3 rounded-2xl border border-blue-50/80">
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-0.5">
                    <span>ละติจูด (Lat)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLatitude}
                    onChange={(e) => setFormLatitude(e.target.value)}
                    placeholder="17.304"
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 outline-none rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-0.5">
                    <span>ลองจิจูด (Lng)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLongitude}
                    onChange={(e) => setFormLongitude(e.target.value)}
                    placeholder="100.072"
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 outline-none rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    ไอคอนมาร์กเกอร์ (Icon)
                  </label>
                  <input
                    type="text"
                    value={formMarkerIcon}
                    onChange={(e) => setFormMarkerIcon(e.target.value)}
                    placeholder="map"
                    className="w-full text-xs p-2.5 bg-white border border-border outline-none rounded-lg text-center"
                  />
                </div>

                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    สีป้ายมาร์กเกอร์ (CSS)
                  </label>
                  <input
                    type="text"
                    value={formMarkerColor}
                    onChange={(e) => setFormMarkerColor(e.target.value)}
                    placeholder="bg-primary"
                    className="w-full text-xs p-2.5 bg-white border border-border outline-none rounded-lg font-mono text-muted-foreground"
                  />
                </div>
              </div>

              {/* Sort Order info */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    จัดเรียง (Sort Order)
                  </label>
                  <input
                    type="text"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs p-3 bg-muted border border-border outline-none rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Deep Details Tab */}
              <div className="p-5 bg-muted/50 rounded-2xl border border-border space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                  <span>ข้อมูลเชิงลึก & คอนเทนต์ท่องเที่ยว (Place Details Content)</span>
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase">
                      บทประวัติศาตรความเป็นมา (History Summary)
                    </label>
                    <textarea
                      value={formHistorySummary}
                      onChange={(e) => setFormHistorySummary(e.target.value)}
                      placeholder="เขียนรายละเอียดเชิงลึกของสถานที่ เช่น สร้างขึ้นในปี พ.ศ. ใด ผ่านศึกอะไร..."
                      className="w-full text-[11px] p-2.5 bg-white border border-border outline-none rounded-lg h-18 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase">
                      ไฮไลท์ทางพุทธศิลป์และวัฒนธรรม (Cultural Highlights)
                    </label>
                    <textarea
                      value={formCulturalHighlights}
                      onChange={(e) => setFormCulturalHighlights(e.target.value)}
                      placeholder="เช่น ขนมรสละมุนสูตรโบราณแกะสลัก, รอยพระพุทธบาทสลักลายไม้บนบานประตูศิลปะธนบุรี..."
                      className="w-full text-xs p-3 bg-white border border-border outline-none rounded-lg h-24 text-foreground resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-muted-foreground uppercase">
                        เวลาเที่ยวชมที่ดีที่สุด (Best Time)
                      </label>
                      <input
                        type="text"
                        value={formBestTime}
                        onChange={(e) => setFormBestTime(e.target.value)}
                        placeholder="เช่น 06:00 - 08:30 น. ของหมดเร็ว"
                        className="w-full text-[11px] p-2.5 bg-white border border-border outline-none rounded-lg text-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-muted-foreground uppercase">
                        สิ่งที่ต้องเตรียมใจ/รู้ล่วงหน้า (Need to Know)
                      </label>
                      <input
                        type="text"
                        value={formNeedToKnow}
                        onChange={(e) => setFormNeedToKnow(e.target.value)}
                        placeholder="เช่น แต่งกายสำรวม, บันไดทางขึ้นมีสภาพลาดชัน"
                        className="w-full text-[11px] p-2.5 bg-white border border-border outline-none rounded-lg text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase flex items-center gap-1">
                      <span>บทสคริปต์สุนทรบรรยายเสียง (Audio Story Narrator Script)</span>
                    </label>
                    <textarea
                      value={formAudioStory}
                      onChange={(e) => setFormAudioStory(e.target.value)}
                      placeholder="ฉันคือบัดดี้ของคุณ วันนี้ขอพามาชมความวิจิตรของ..."
                      className="w-full text-xs p-3 bg-white border border-border outline-none rounded-lg h-24 text-foreground resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Active & Featured Flags switches inside form */}
              <div className="flex gap-6 py-1 shrink-0">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 text-primary rounded-md outline-none border border-slate-300"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground leading-tight">เปิดบริการ / เปิดเผยในแอป</span>
                    <span className="text-[10px] text-muted-foreground/60">ถ้าเว้นว่าง สถานที่ข้อเสนอจุดนี้จะถูกซ่อนทันที</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.checked)}
                    className="w-4.5 h-4.5 text-destructive rounded-md outline-none border border-slate-300"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground leading-tight">แนะนำพิเศษ (Featured Spot)</span>
                    <span className="text-[10px] text-muted-foreground/60">นำไปแสดงบนหน้าแรกของแอปพลิเคชันเด่นสงคราม</span>
                  </div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 border border-border hover:bg-slate-50 active:scale-95 transition-all text-muted-foreground font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>บันทึกสถานที่</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORE HIGH-FIDELITY HARD DELETE CONFIRMATION MODAL OVERLAY */}
      {showDeleteConfirmModal && placeToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-6 select-none animate-fade-in">
          <div className="bg-card border-2 border-rose-300 rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-foreground">
            {/* Warning banner */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-rose-100 flex items-center justify-center text-destructive mb-4 animate-pulse">
                <ShieldAlert className="w-9 h-9" />
              </div>

              <h3 className="text-base font-black text-rose-600 leading-tight">
                แจ้งเตือน: ทำการลบข้อมูลถาวร!
              </h3>
              
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                คุณกำลังจะทำความผิดพลาดใหญ่ด้วยการลบสถานที่ <strong>"{placeToDelete.name}"</strong> (ID: {placeToDelete.id}) ออกจากโครงการอย่างถาวร! 
                การกระทำนี้ส่งผลให้ผู้ที่เคยสะสมเหรัญญิกแสตมป์ แฟ้มดิจิทัลพาสปอร์ต หรือบันทึกออแกนิคสูญหายทันที และไม่สามารถทำซ้ำขึ้นมาอีกได้
              </p>

              {/* Hard delete input barrier */}
              <div className="w-full bg-muted p-3 rounded-2xl border border-border mb-4 mt-3 text-left">
                <label className="block text-[9px] font-black text-muted-foreground uppercase mb-1">
                  กรุณาพิมพ์ข้อความว่า <span className="text-rose-600 font-bold">delete</span> เพื่ออนุญาตคำสั่ง
                </label>
                <input
                  type="text"
                  value={hardDeleteInput}
                  onChange={(e) => setHardDeleteInput(e.target.value)}
                  placeholder="พิมพ์ delete ตรงนี้"
                  className="w-full text-center text-xs p-2 bg-white border border-rose-100 rounded-lg font-mono tracking-widest uppercase outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                />
              </div>

              <div className="w-full flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setPlaceToDelete(null);
                  }}
                  className="flex-1 py-3 bg-muted/50 hover:bg-slate-200 active:scale-95 text-muted-foreground font-bold text-xs rounded-xl cursor-pointer transition-all border border-border"
                >
                  ยกเลิก / ปกป้องข้อมูล
                </button>
                
                <button
                  onClick={handleExecuteHardDelete}
                  disabled={hardDeleteInput.toLowerCase() !== "delete"}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-xs shadow-md rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span>ฉันแน่ใจ ลบถาวร!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
