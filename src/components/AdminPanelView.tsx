import React, { useState, useEffect } from "react";
import { ArrowLeft, Car, Store, Package, CheckCircle2, AlertCircle, Clock, FileEdit, HelpCircle, User, Activity, ChevronDown, ChevronUp, MapPin, Phone, Bed, Building2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import TourismLocationsManagementTab from "./TourismLocationsManagementTab";
import AccommodationsManagementTab from "./AccommodationsManagementTab";
import { useToast } from "./ToastProvider";

const ADMIN_DEBUG = true;

function logAdminDebug(label: string, payload?: unknown) {
  if (!ADMIN_DEBUG) return;
  console.groupCollapsed(`[ADMIN DEBUG] ${label}`);
  console.log("time:", new Date().toISOString());
  console.log(payload);
  console.groupEnd();
}

function logSupabaseError(label: string, error: any, context?: Record<string, unknown>) {
  console.groupCollapsed(`[ADMIN ERROR] ${label}`);
  console.error("code:", error?.code);
  console.error("message:", error?.message);
  console.error("details:", error?.details);
  console.error("hint:", error?.hint);
  console.error("full error:", error);
  console.log("context:", context);
  console.groupEnd();
}

async function getAdminDebugContext() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  const user = sessionData?.session?.user;

  let profile = null;
  let profileError = null;

  if (user?.id) {
    const result = await supabase
      .from("profiles")
      .select("id, owner_id, display_name, role")
      .eq("owner_id", user.id)
      .maybeSingle();

    profile = result.data;
    profileError = result.error;
  }

  return {
    user: user
      ? {
          id: user.id,
          email: user.email,
          aud: user.aud,
          role: user.role,
        }
      : null,
    sessionError,
    profile,
    profileError,
  };
}

interface AdminPanelViewProps {
  onBack: () => void;
  onLocationsChange?: () => void;
  onAccommodationsChange?: () => void;
}

interface TabProps {
  pushDebug: (msg: string, payload?: unknown) => void;
  pushError: (msg: string, error?: any, context?: any) => void;
}

export default function AdminPanelView({ onBack, onLocationsChange, onAccommodationsChange }: AdminPanelViewProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [showDebugLog, setShowDebugLog] = useState<boolean>(() => {
    return localStorage.getItem("admin_debug_log_visible") === "true";
  });

  useEffect(() => {
    localStorage.setItem("admin_debug_log_visible", String(showDebugLog));
  }, [showDebugLog]);

  function pushDebug(message: string, payload?: unknown) {
    const time = new Date().toLocaleTimeString();
    const payloadText = payload ? " " + JSON.stringify(payload, null, 2) : "";
    const line = `[${time}] ${message}${payloadText}`;
    setDebugMessages(prev => [line, ...prev].slice(0, 30));
    console.log("[ADMIN DEBUG]", message, payload ?? "");
  }

  function pushError(message: string, error?: any, context?: any) {
    const time = new Date().toLocaleTimeString();
    const line = `[${time}] ERROR: ${message} | ${error?.code || "-"} | ${error?.message || error || "-"}`;
    setDebugMessages(prev => [line, ...prev].slice(0, 20));
    console.error("[ADMIN ERROR]", message, {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      fullError: error,
      context,
    });
  }

  useEffect(() => {
    async function checkRole() {
      try {
        const context = await getAdminDebugContext();
        logAdminDebug("checkRole context", context);

        if (!context.user) {
          setIsAdmin(false);
          return;
        }

        if (context.profileError) {
          logSupabaseError("Failed to load admin profile", context.profileError, context);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(context.profile?.role === "admin");
      } catch (err) {
        console.groupCollapsed("[ADMIN ERROR] checkRole unexpected error");
        console.error(err);
        console.groupEnd();
        setIsAdmin(false);
      }
    }
    checkRole();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex flex-col h-full bg-muted items-center justify-center space-y-4 animate-fade-in-up">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="font-medium text-muted-foreground font-sans">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col h-full bg-muted items-center justify-center p-6 text-center animate-fade-in-up">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        <button 
          onClick={onBack}
          className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted relative overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-4 relative z-20 shrink-0 border-b border-blue-800">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-card/10 active:bg-card/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold tracking-tight">ศูนย์จัดการระบบ (Admin)</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border overflow-x-auto no-scrollbar shrink-0">
        <div className="flex w-max min-w-full">
          {[
            { id: 0, label: "คำขอรถท้องถิ่น", icon: Car },
            { id: 1, label: "คำขอร้านค้า", icon: Store },
            { id: 2, label: "สินค้ารอตรวจสอบ", icon: Package },
            { id: 3, label: "รายการที่อนุมัติแล้ว", icon: Activity },
            { id: 4, label: "สถานที่ท่องเที่ยว", icon: MapPin },
            { id: 5, label: "คำขอที่พัก", icon: Bed },
            { id: 6, label: "ที่พัก", icon: Building2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-3 border-b-2 flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-5 h-5 mx-auto" />
              <span className="text-[10px] font-bold whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full relative p-4 pb-[calc(110px+env(safe-area-inset-bottom))]">
        {/* Toggle / Debug Log Header controls */}
        <div className="mb-3 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDebugLog((prev) => !prev)}
            className={`rounded-2xl border px-3 py-2 text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer ${
              showDebugLog
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {showDebugLog ? "ซ่อน Debug Log" : `แสดง Debug Log (${debugMessages.length})`}
          </button>

          {showDebugLog && (
            <button
              type="button"
              onClick={() => setDebugMessages([])}
              className="rounded-xl bg-muted/50 hover:bg-muted/80 px-3 py-2 text-xs font-bold text-muted-foreground active:scale-[0.98] transition-all cursor-pointer"
            >
              ล้าง Log
            </button>
          )}
        </div>

        {showDebugLog && (
          <div className="mb-4 mt-3 max-h-64 overflow-y-auto rounded-2xl border border-border bg-card p-3 text-[11px] text-foreground font-mono">
            <div className="font-bold text-white mb-2">Admin Debug Log</div>
            {debugMessages.length === 0 ? (
              <div className="text-muted-foreground/60">No admin action yet</div>
            ) : (
              debugMessages.map((msg, index) => <div key={index}>{msg}</div>)
            )}
          </div>
        )}

        {activeTab === 0 && <LocalTaxiApplicationsTab pushDebug={pushDebug} pushError={pushError} />}
        {activeTab === 1 && <MarketplaceApplicationsTab pushDebug={pushDebug} pushError={pushError} />}
        {activeTab === 2 && <MarketplaceProductsTab pushDebug={pushDebug} pushError={pushError} />}
        {activeTab === 3 && <ApprovedItemsTab />}
        {activeTab === 4 && <TourismLocationsManagementTab pushDebug={pushDebug} pushError={pushError} onRefreshAppLocations={onLocationsChange} />}
        {activeTab === 5 && <AccommodationApplicationsTab pushDebug={pushDebug} pushError={pushError} onRefreshAppAccommodations={onAccommodationsChange} />}
        {activeTab === 6 && <AccommodationsManagementTab pushDebug={pushDebug} pushError={pushError} onRefreshAppAccommodations={onAccommodationsChange} />}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------------
// TAB 1: Local Taxi Applications
// -----------------------------------------------------------------------------------
function LocalTaxiApplicationsTab({ pushDebug, pushError }: TabProps) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    
    const context = await getAdminDebugContext();

    logAdminDebug("Fetching local taxi applications", {
      table: "local_taxi_applications",
      orderBy: "submitted_at",
      context,
    });
    
    const { data, error: fetchError } = await supabase
      .from("local_taxi_applications")
      .select("*")
      .order("submitted_at", { ascending: false });
    
    if (fetchError) {
      logSupabaseError("Fetch local taxi applications failed", fetchError, {
        table: "local_taxi_applications",
        orderBy: "submitted_at",
        context,
      });
      setError(fetchError.message);
      setApps([]);
    } else {
      logAdminDebug("Fetch local taxi applications success", {
        count: data?.length || 0,
        data,
      });
      setApps(data || []);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, actionType: 'approve' | 'revise' | 'reject') => {
    pushDebug("handleAction entered", { id, actionType });
    const context = await getAdminDebugContext();

    logAdminDebug("Local taxi admin action started", {
      actionType,
      table: "local_taxi_applications",
      id,
      context,
    });

    setActionLoadingId(id);

    try {
      if (actionType === 'approve') {
        const rpcName = "approve_taxi_application";
        const rpcPayload = { p_application_id: id };

        pushDebug("Calling RPC", { rpcName, rpcPayload });
        logAdminDebug("Calling RPC", { rpcName, rpcPayload, context });

        const { data, error } = await supabase.rpc(rpcName, rpcPayload);
        
        pushDebug("RPC response received", { data, error });

        if (error) {
          pushError("RPC failed", error, { rpcName, rpcPayload });
          logSupabaseError("RPC failed", error, { rpcName, rpcPayload, context });
          showToast("อนุมัติไม่สำเร็จ", "error");
          return;
        }

        logAdminDebug("RPC success", { rpcName, data });

        showToast("อนุมัติสำเร็จ", "success");
      } else {
        const note = prompt(actionType === 'revise' ? "ระบุสิ่งที่ต้องแก้ไข:" : "ระบุเหตุผลที่ปฏิเสธ:");
        if (note === null) return;
        
        const updatePayload = {
          application_status: actionType === "revise" ? "revision_required" : "rejected",
          admin_note: note,
          updated_at: new Date().toISOString(),
        };

        logAdminDebug("Updating table", {
          table: "local_taxi_applications",
          actionType,
          id,
          updatePayload,
          context,
        });

        const { data, error } = await supabase
          .from('local_taxi_applications')
          .update(updatePayload)
          .eq('id', id)
          .select();
        
        if (error) {
          logSupabaseError("Update failed", error, {
            table: "local_taxi_applications",
            id,
            updatePayload,
            context,
          });
          showToast("บันทึกไม่สำเร็จ", "error");
          return;
        }
        
        logAdminDebug("Update success", { table: "local_taxi_applications", data });
        showToast(actionType === 'revise' ? "ส่งกลับแก้ไขสำเร็จ" : "ปฏิเสธคำขอสำเร็จ", "success");
      }
    } catch (err: any) {
      console.groupCollapsed("[ADMIN ERROR] Local taxi admin action unexpected error");
      console.error(err);
      console.groupEnd();
      showToast("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
    } finally {
      setActionLoadingId(null);
      fetchApps();
    }
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-rose-200 rounded-xl p-4 text-rose-700 text-xs mt-4">
        <p className="font-bold mb-1">โหลดข้อมูลไม่สำเร็จ</p>
        <p>{error}</p>
        <p className="mt-2 text-xs text-destructive">
          เปิด DevTools Console เพื่อดูรายละเอียด ADMIN ERROR
        </p>
      </div>
    );
  }
  if (loading) return <div className="text-center py-10 text-muted-foreground text-sm">กำลังโหลด...</div>;
  if (apps.length === 0) return <div className="text-center py-10 text-muted-foreground text-sm">ไม่มีคำขอ</div>;

  return (
    <div className="space-y-4">
      {apps.map(app => (
        <div key={app.id} className="bg-card p-4 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm text-foreground">{app.first_name} {app.last_name}</h3>
            <StatusBadge status={app.application_status} />
          </div>
          <p className="text-xs text-muted-foreground mb-1"><Phone className="w-3 h-3 inline-block mr-0.5" /> {app.phone}</p>
          <p className="text-xs text-muted-foreground mb-1"><MapPin className="w-3 h-3 inline-block mr-0.5" /> พื้นที่: {app.service_area}</p>
          <p className="text-xs text-muted-foreground mb-1"><Car className="w-3 h-3 inline-block mr-0.5" /> รถ: {app.vehicle_type} ({app.vehicle_plate})</p>
          {app.admin_note && <p className="text-xs text-rose-600 mt-2 bg-destructive/10 p-2 rounded">หมายเหตุ: {app.admin_note}</p>}
          <p className="text-xs font-medium text-muted-foreground mt-2 mb-3">เมื่อ: {new Date(app.submitted_at || app.updated_at).toLocaleString('th-TH')}</p>
          
          {app.application_status === 'pending' || app.application_status === 'revision_required' ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button 
                onClick={() => {
                  pushDebug("Clicked approve taxi button", { id: app.id });
                  handleAction(app.id, 'approve');
                }} 
                disabled={actionLoadingId !== null}
                className={`text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition ${
                  actionLoadingId === app.id
                    ? 'bg-muted/50 text-muted-foreground/60 cursor-not-allowed'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {actionLoadingId === app.id ? 'กำลังทำงาน...' : 'อนุมัติ'}
              </button>
              <button 
                onClick={() => handleAction(app.id, 'revise')} 
                disabled={actionLoadingId !== null}
                className="text-[10px] font-bold bg-amber-100 text-amber-700 py-1.5 rounded-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ขอแก้ไข
              </button>
              <button 
                onClick={() => handleAction(app.id, 'reject')} 
                disabled={actionLoadingId !== null}
                className="text-[10px] font-bold bg-rose-100 text-rose-700 py-1.5 rounded-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ปฏิเสธ
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// TAB 2: Marketplace Seller Applications
// -----------------------------------------------------------------------------------
function MarketplaceApplicationsTab({ pushDebug, pushError }: TabProps) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    
    const context = await getAdminDebugContext();

    logAdminDebug("Fetching marketplace seller applications", {
      table: "marketplace_seller_applications",
      orderBy: "submitted_at",
      context,
    });
    
    const { data, error: fetchError } = await supabase
      .from("marketplace_seller_applications")
      .select("*")
      .order("submitted_at", { ascending: false });
    
    if (fetchError) {
      logSupabaseError("Fetch marketplace seller applications failed", fetchError, {
        table: "marketplace_seller_applications",
        orderBy: "submitted_at",
        context,
      });
      setError(fetchError.message);
      setApps([]);
    } else {
      logAdminDebug("Fetch marketplace seller applications success", {
        count: data?.length || 0,
        data,
      });
      setApps(data || []);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, actionType: 'approve' | 'revise' | 'reject') => {
    pushDebug("handleAction entered", { id, actionType });
    const context = await getAdminDebugContext();

    logAdminDebug("Marketplace seller admin action started", {
      actionType,
      table: "marketplace_seller_applications",
      id,
      context,
    });

    setActionLoadingId(id);
    
    try {
      if (actionType === 'approve') {
        const rpcName = "approve_seller_application";
        const rpcPayload = { p_application_id: id };

        pushDebug("Calling RPC", { rpcName, rpcPayload });
        logAdminDebug("Calling RPC", { rpcName, rpcPayload, context });

        const { data, error } = await supabase.rpc(rpcName, rpcPayload);
        
        pushDebug("RPC response received", { data, error });
        
        if (error) {
          pushError("RPC failed", error, { rpcName, rpcPayload });
          logSupabaseError("RPC failed", error, { rpcName, rpcPayload, context });
          showToast("อนุมัติไม่สำเร็จ", "error");
          return;
        }
        
        logAdminDebug("RPC success", { rpcName, data });

        showToast("อนุมัติสำเร็จ", "success");
      } else {
        const note = prompt(actionType === 'revise' ? "ระบุสิ่งที่ต้องแก้ไข:" : "ระบุเหตุผลที่ปฏิเสธ:");
        if (note === null) return;
        
        const updatePayload = {
          application_status: actionType === "revise" ? "revision_required" : "rejected",
          admin_note: note,
          updated_at: new Date().toISOString(),
        };

        logAdminDebug("Updating table", {
          table: "marketplace_seller_applications",
          actionType,
          id,
          updatePayload,
          context,
        });

        const { data, error } = await supabase
          .from('marketplace_seller_applications')
          .update(updatePayload)
          .eq('id', id)
          .select();
        
        if (error) {
          logSupabaseError("Update failed", error, {
            table: "marketplace_seller_applications",
            id,
            updatePayload,
            context,
          });
          showToast("บันทึกไม่สำเร็จ", "error");
          return;
        }
        
        logAdminDebug("Update success", { table: "marketplace_seller_applications", data });
        showToast(actionType === 'revise' ? "ส่งกลับแก้ไขสำเร็จ" : "ปฏิเสธคำขอสำเร็จ", "success");
      }
    } catch (err: any) {
      console.groupCollapsed("[ADMIN ERROR] Marketplace seller admin action unexpected error");
      console.error(err);
      console.groupEnd();
      showToast("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
    } finally {
      setActionLoadingId(null);
      fetchApps();
    }
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-rose-200 rounded-xl p-4 text-rose-700 text-xs mt-4">
        <p className="font-bold mb-1">โหลดข้อมูลไม่สำเร็จ</p>
        <p>{error}</p>
        <p className="mt-2 text-xs text-destructive">
          เปิด DevTools Console เพื่อดูรายละเอียด ADMIN ERROR
        </p>
      </div>
    );
  }
  if (loading) return <div className="text-center py-10 text-muted-foreground text-sm">กำลังโหลด...</div>;
  if (apps.length === 0) return <div className="text-center py-10 text-muted-foreground text-sm">ไม่มีคำขอ</div>;

  return (
    <div className="space-y-4">
      {apps.map(app => (
        <div key={app.id} className="bg-card p-4 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm text-foreground">{app.shop_name}</h3>
            <StatusBadge status={app.application_status} />
          </div>
          <p className="text-xs text-muted-foreground mb-1"><User className="w-3 h-3 inline-block mr-0.5" /> ผู้ติดต่อ: {app.owner_name}</p>
          <p className="text-xs text-muted-foreground mb-1"><Phone className="w-3 h-3 inline-block mr-0.5" /> {app.phone} {app.line_id && `| LINE: ${app.line_id}`}</p>
          <p className="text-xs text-muted-foreground mb-1 line-clamp-1"><MapPin className="w-3 h-3 inline-block mr-0.5" /> พิกัด: {app.shop_location}</p>
          <p className="text-[10px] text-muted-foreground mb-1 line-clamp-1">ประเภท: {app.seller_type}</p>
          
          <div className="flex gap-1 mt-2">
            <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded">{app.seller_type}</span>
          </div>

          {app.admin_note && <p className="text-xs text-rose-600 mt-2 bg-destructive/10 p-2 rounded">หมายเหตุ: {app.admin_note}</p>}
          <p className="text-xs font-medium text-muted-foreground mt-2 mb-3">เมื่อ: {new Date(app.submitted_at || app.updated_at).toLocaleString('th-TH')}</p>
          
          {app.application_status === 'pending' || app.application_status === 'revision_required' ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button 
                onClick={() => {
                  pushDebug("Clicked approve seller button", { id: app.id });
                  handleAction(app.id, 'approve');
                }} 
                disabled={actionLoadingId !== null}
                className={`text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition ${
                  actionLoadingId === app.id
                    ? 'bg-muted/50 text-muted-foreground/60 cursor-not-allowed'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {actionLoadingId === app.id ? 'กำลังทำงาน...' : 'อนุมัติ'}
              </button>
              <button 
                onClick={() => handleAction(app.id, 'revise')} 
                disabled={actionLoadingId !== null}
                className="text-[10px] font-bold bg-amber-100 text-amber-700 py-1.5 rounded-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ขอแก้ไข
              </button>
              <button 
                onClick={() => handleAction(app.id, 'reject')} 
                disabled={actionLoadingId !== null}
                className="text-[10px] font-bold bg-rose-100 text-rose-700 py-1.5 rounded-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ปฏิเสธ
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// TAB 3: Accommodation Applications
// -----------------------------------------------------------------------------------
function AccommodationApplicationsTab({ pushDebug, pushError, onRefreshAppAccommodations }: TabProps & { onRefreshAppAccommodations?: () => void }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    const context = await getAdminDebugContext();

    logAdminDebug("Fetching accommodation applications", {
      table: "accommodation_applications",
      orderBy: "submitted_at",
      context,
    });

    const { data, error: fetchError } = await supabase
      .from("accommodation_applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (fetchError) {
      logSupabaseError("Fetch accommodation applications failed", fetchError, {
        table: "accommodation_applications",
        orderBy: "submitted_at",
        context,
      });
      setError(fetchError.message);
      setApps([]);
    } else {
      logAdminDebug("Fetch accommodation applications success", {
        count: data?.length || 0,
        data,
      });
      setApps(data || []);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, actionType: "approve" | "revise" | "reject") => {
    pushDebug("handleAction entered", { id, actionType });
    const context = await getAdminDebugContext();

    logAdminDebug("Accommodation admin action started", {
      actionType,
      table: "accommodation_applications",
      id,
      context,
    });

    setActionLoadingId(id);

    try {
      if (actionType === "approve") {
        const rpcName = "approve_accommodation_application";
        const rpcPayload = { p_application_id: id };

        pushDebug("Calling RPC", { rpcName, rpcPayload });
        logAdminDebug("Calling RPC", { rpcName, rpcPayload, context });

        const { data, error } = await supabase.rpc(rpcName, rpcPayload);

        pushDebug("RPC response received", { data, error });

        if (error) {
          pushError("RPC failed", error, { rpcName, rpcPayload });
          logSupabaseError("RPC failed", error, { rpcName, rpcPayload, context });
          showToast("อนุมัติไม่สำเร็จ", "error");
          return;
        }

        logAdminDebug("RPC success", { rpcName, data });
        showToast("อนุมัติที่พักสำเร็จ", "success");
        onRefreshAppAccommodations?.();
      } else {
        const note = prompt(actionType === "revise" ? "ระบุสิ่งที่ต้องแก้ไข:" : "ระบุเหตุผลที่ปฏิเสธ:");
        if (note === null) return;

        const updatePayload = {
          application_status: actionType === "revise" ? "revision_required" : "rejected",
          admin_note: note,
          updated_at: new Date().toISOString(),
        };

        logAdminDebug("Updating table", {
          table: "accommodation_applications",
          actionType,
          id,
          updatePayload,
          context,
        });

        const { data, error } = await supabase
          .from("accommodation_applications")
          .update(updatePayload)
          .eq("id", id)
          .select();

        if (error) {
          logSupabaseError("Update failed", error, {
            table: "accommodation_applications",
            id,
            updatePayload,
            context,
          });
          showToast("บันทึกไม่สำเร็จ", "error");
          return;
        }

        logAdminDebug("Update success", { table: "accommodation_applications", data });
        showToast(actionType === "revise" ? "ส่งกลับแก้ไขสำเร็จ" : "ปฏิเสธคำขอสำเร็จ", "success");
      }
    } catch (err: any) {
      console.groupCollapsed("[ADMIN ERROR] Accommodation admin action unexpected error");
      console.error(err);
      console.groupEnd();
      showToast("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
    } finally {
      setActionLoadingId(null);
      fetchApps();
    }
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-rose-200 rounded-xl p-4 text-rose-700 text-xs mt-4">
        <p className="font-bold mb-1">โหลดข้อมูลไม่สำเร็จ</p>
        <p>{error}</p>
        <p className="mt-2 text-xs text-destructive">เปิด DevTools Console เพื่อดูรายละเอียด ADMIN ERROR</p>
      </div>
    );
  }
  if (loading) return <div className="text-center py-10 text-muted-foreground text-sm">กำลังโหลด...</div>;
  if (apps.length === 0) return <div className="text-center py-10 text-muted-foreground text-sm">ไม่มีคำขอ</div>;

  return (
    <div className="space-y-4">
      {apps.map(app => (
        <div key={app.id} className="bg-card p-4 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-2 gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate">{app.property_name}</h3>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{app.property_type}</p>
            </div>
            <StatusBadge status={app.application_status} />
          </div>
          <p className="text-xs text-muted-foreground mb-1"><User className="w-3 h-3 inline-block mr-0.5" /> ผู้ติดต่อ: {app.owner_name}</p>
          <p className="text-xs text-muted-foreground mb-1"><Phone className="w-3 h-3 inline-block mr-0.5" /> {app.phone} {app.line_id && `| LINE: ${app.line_id}`}</p>
          <p className="text-xs text-muted-foreground mb-1 line-clamp-1"><MapPin className="w-3 h-3 inline-block mr-0.5" /> {app.address || `${app.latitude}, ${app.longitude}`}</p>
          {app.price_range && <p className="text-xs text-muted-foreground mb-1"><Bed className="w-3 h-3 inline-block mr-0.5" /> ราคา: {app.price_range}</p>}
          {app.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{app.description}</p>}
          {app.admin_note && <p className="text-xs text-rose-600 mt-2 bg-destructive/10 p-2 rounded">หมายเหตุ: {app.admin_note}</p>}
          <p className="text-xs font-medium text-muted-foreground mt-2 mb-3">เมื่อ: {new Date(app.submitted_at || app.updated_at).toLocaleString("th-TH")}</p>

          {app.application_status === "pending" || app.application_status === "revision_required" ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => {
                  pushDebug("Clicked approve accommodation button", { id: app.id });
                  handleAction(app.id, "approve");
                }}
                disabled={actionLoadingId !== null}
                className={`text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition ${
                  actionLoadingId === app.id
                    ? "bg-muted/50 text-muted-foreground/60 cursor-not-allowed"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                {actionLoadingId === app.id ? "กำลังทำงาน..." : "อนุมัติ"}
              </button>
              <button
                onClick={() => handleAction(app.id, "revise")}
                disabled={actionLoadingId !== null}
                className="text-[10px] font-bold bg-amber-100 text-amber-700 py-1.5 rounded-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ขอแก้ไข
              </button>
              <button
                onClick={() => handleAction(app.id, "reject")}
                disabled={actionLoadingId !== null}
                className="text-[10px] font-bold bg-rose-100 text-rose-700 py-1.5 rounded-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ปฏิเสธ
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// TAB 4: Marketplace Products Pending Review
// -----------------------------------------------------------------------------------
function MarketplaceProductsTab({ pushDebug, pushError }: TabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const context = await getAdminDebugContext();

    logAdminDebug("Fetching marketplace products", {
      table: "marketplace_products",
      status: "pending",
      context,
    });

    const { data, error } = await supabase
      .from("marketplace_products")
      .select("*, seller:marketplace_sellers(shop_name)")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      logSupabaseError("Fetch marketplace products failed", error, {
        table: "marketplace_products",
        status: "pending",
        context,
      });
    } else {
      logAdminDebug("Fetch marketplace products success", { count: data?.length || 0 });
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    pushDebug("handleApprove entered", { id });

    pushDebug("Skipping native confirm for debug mode", { id });

    const context = await getAdminDebugContext();
    const rpcName = "approve_marketplace_product";
    const rpcPayload = { p_product_id: id };

    logAdminDebug("Approving marketplace product", {
      rpcName,
      rpcPayload,
      table: "marketplace_products",
      context,
    });

    setActionLoadingId(id);

    try {
      pushDebug("Calling RPC", { rpcName, rpcPayload });
      logAdminDebug("Calling RPC", { rpcName, rpcPayload, context });
      const { data, error } = await supabase.rpc(rpcName, rpcPayload);
      
      pushDebug("RPC response received", { data, error });

      if (error) {
        pushError("RPC failed", error, { rpcName, rpcPayload });
        logSupabaseError("RPC failed", error, { rpcName, rpcPayload, context });
        showToast("อนุมัติสินค้าไม่สำเร็จ", "error");
        return;
      }

      logAdminDebug("RPC success", { rpcName, data });
      showToast("อนุมัติสินค้าสำเร็จ", "success");
    } catch (err) {
      console.groupCollapsed("[ADMIN ERROR] approve_marketplace_product unexpected error");
      console.error(err);
      console.groupEnd();
      showToast("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
    } finally {
      setActionLoadingId(null);
      fetchProducts();
    }
  };

  const handleReject = async (id: string) => {
    pushDebug("handleReject entered", { id });

    pushDebug("Skipping native confirm for debug mode", { id });

    const context = await getAdminDebugContext();
    const rpcName = "reject_marketplace_product";
    const rpcPayload = { p_product_id: id };

    logAdminDebug("Rejecting marketplace product", {
      rpcName,
      rpcPayload,
      table: "marketplace_products",
      context,
    });

    setActionLoadingId(id);

    try {
      pushDebug("Calling RPC", { rpcName, rpcPayload });
      logAdminDebug("Calling RPC", { rpcName, rpcPayload, context });
      const { data, error } = await supabase.rpc(rpcName, rpcPayload);

      pushDebug("RPC response received", { data, error });

      if (error) {
        pushError("RPC failed", error, { rpcName, rpcPayload });
        logSupabaseError("RPC failed", error, { rpcName, rpcPayload, context });
        showToast("ไม่อนุมัติสินค้าไม่สำเร็จ", "error");
        return;
      }

      logAdminDebug("RPC success", { rpcName, data });
      showToast("ไม่อนุมัติสำเร็จ", "success");
    } catch (err) {
      console.groupCollapsed("[ADMIN ERROR] reject_marketplace_product unexpected error");
      console.error(err);
      console.groupEnd();
      showToast("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
    } finally {
      setActionLoadingId(null);
      fetchProducts();
    }
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground text-sm">กำลังโหลด...</div>;
  if (products.length === 0) return <div className="text-center py-10 text-muted-foreground text-sm">ไม่มีคำขอ</div>;

  return (
    <div className="space-y-4">
      {products.map(p => (
        <div key={p.id} className="bg-card p-4 rounded-xl border border-border">
          <div className="flex gap-3 mb-2">
            <div className="w-16 h-16 bg-muted/50 rounded-xl overflow-hidden shrink-0">
               {p.image_url ? (
                 <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-6 h-6" /></div>
               )}
            </div>
            <div className="flex-1 min-w-0">
               <h3 className="font-bold text-sm text-foreground line-clamp-1">{p.name}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">หมวด: {p.category}</p>
                 <div className="font-bold text-primary text-sm mt-1">฿{p.price} <span className="text-xs text-muted-foreground/60 font-medium">/{p.unit}</span></div>
            </div>
          </div>
          
          <div className="bg-muted p-2 rounded-lg text-xs mt-2 border border-border">
            <p className="font-bold text-foreground"><Store className="w-3 h-3 inline-block mr-0.5" /> {p.seller?.shop_name || "ไม่ทราบร้านค้า"}</p>
            <p className="text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
            <div className="flex gap-1 mt-2">
              {p.is_gi && <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded">GI</span>}
              {p.is_otop && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded">OTOP</span>}
              {p.is_sme && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded">SME</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button 
              onClick={() => {
                pushDebug("Clicked approve product button", { id: p.id });
                handleApprove(p.id);
              }} 
              disabled={actionLoadingId !== null}
              className={`text-xs font-bold py-2 rounded-xl active:scale-95 transition ${
                actionLoadingId === p.id
                  ? 'bg-muted/50 text-muted-foreground/60'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
              }`}
            >
              {actionLoadingId === p.id ? 'กำลังทำงาน...' : 'อนุมัติให้ขายได้'}
            </button>
            <button 
              onClick={() => {
                pushDebug("Clicked reject product button", { id: p.id });
                handleReject(p.id);
              }} 
              disabled={actionLoadingId !== null}
              className="text-xs font-bold bg-rose-100 text-rose-700 py-2 rounded-xl active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ไม่อนุมัติ
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// TAB 4: Approved Items Summary & Management
// -----------------------------------------------------------------------------------
function ApprovedItemsTab() {
  const [subTab, setSubTab] = useState<'taxi' | 'marketplace'>('taxi');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [taxiItems, setTaxiItems] = useState<any[]>([]);
  const [marketplaceSellers, setMarketplaceSellers] = useState<any[]>([]);
  const [expandedSellerIds, setExpandedSellerIds] = useState<string[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'taxi' | 'seller' | 'product'>('taxi');
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (subTab === 'taxi') {
      fetchTaxiItems();
    } else {
      fetchMarketplaceItems();
    }
  }, [subTab]);

  const fetchTaxiItems = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('local_taxi_drivers')
        .select('*, local_taxi_vehicles(*)')
        .order('created_at', { ascending: false });
      setTaxiItems(data || []);
    } catch (err: any) {
      console.error("Failed to fetch taxi items:", err);
    }
    setLoading(false);
  };

  const fetchMarketplaceItems = async () => {
    setLoading(true);

    const { data: sellers, error: sellerError } = await supabase
      .from("marketplace_sellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (sellerError) {
      console.error("Failed to fetch marketplace sellers:", {
        code: sellerError.code,
        message: sellerError.message,
        details: sellerError.details,
        hint: sellerError.hint,
        fullError: sellerError,
      });
      setLoading(false);
      return;
    }

    const { data: products, error: productError } = await supabase
      .from("marketplace_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (productError) {
      console.error("Failed to fetch marketplace products:", {
        code: productError.code,
        message: productError.message,
        details: productError.details,
        hint: productError.hint,
        fullError: productError,
      });
      setLoading(false);
      return;
    }

    const grouped = (sellers || []).map((seller) => ({
      ...seller,
      products: (products || []).filter((product) => product.seller_id === seller.id),
    }));

    setMarketplaceSellers(grouped);
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean, type: 'taxi' | 'seller' | 'product') => {
    const table = type === 'taxi' ? 'local_taxi_drivers' : type === 'seller' ? 'marketplace_sellers' : 'marketplace_products';
    const { error } = await supabase.from(table).update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      if (type === 'taxi') {
        setTaxiItems(prev => prev.map(item => item.id === id ? { ...item, is_active: !currentStatus } : item));
      } else if (type === 'seller') {
        setMarketplaceSellers(prev => prev.map(seller => seller.id === id ? { ...seller, is_active: !currentStatus } : seller));
      } else if (type === 'product') {
        setMarketplaceSellers(prev => prev.map(seller => ({
          ...seller,
          products: seller.products.map((p: any) => p.id === id ? { ...p, is_active: !currentStatus } : p)
        })));
      }
    } else {
      showToast("Error: " + error.message, "error");
    }
  };

  const handleOpenEdit = (item: any, type: 'taxi' | 'seller' | 'product') => {
    setEditingItem(item);
    setEditType(type);
    
    if (type === 'taxi') {
      const vInfo = item.local_taxi_vehicles?.[0] || item.local_taxi_vehicles || {};
      setEditFormData({
        first_name: item.first_name || '',
        last_name: item.last_name || '',
        nickname: item.nickname || '',
        age: item.age || 0,
        phone: item.phone || '',
        service_area: item.service_area || '',
        stand_location: item.stand_location || '',
        public_contact_address: item.public_contact_address || '',
        available_now: !!item.available_now,
        is_active: !!item.is_active,
        rating: item.rating || 5,
        vehicle_id: vInfo.id || null,
        vehicle_plate: vInfo.vehicle_plate || '',
        vehicle_type: vInfo.vehicle_type || '',
        vehicle_color: vInfo.vehicle_color || '',
        vehicle_description: vInfo.vehicle_description || '',
        capacity: vInfo.capacity || 0,
        luggage_note: vInfo.luggage_note || ''
      });
    } else if (type === 'seller') {
      setEditFormData({
        shop_name: item.shop_name || '',
        owner_name: item.owner_name || '',
        phone: item.phone || '',
        line_id: item.line_id || '',
        service_area: item.service_area || '',
        shop_location: item.shop_location || '',
        public_contact_address: item.public_contact_address || '',
        description: item.description || '',
        seller_type: item.seller_type || '',
        verification_status: item.verification_status || '',
        is_active: !!item.is_active
      });
    } else if (type === 'product') {
      setEditFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        product_type: item.product_type || '',
        price: item.price || 0,
        unit: item.unit || '',
        stock_status: item.stock_status || '',
        image_url: item.image_url || '',
        is_gi: !!item.is_gi,
        gi_name: item.gi_name || '',
        is_otop: !!item.is_otop,
        is_sme: !!item.is_sme,
        approval_status: item.approval_status || '',
        is_active: !!item.is_active
      });
    }
    
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      if (editType === 'taxi') {
        const { error: dErr } = await supabase.from('local_taxi_drivers').update({
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          nickname: editFormData.nickname,
          age: Number(editFormData.age) || 0,
          phone: editFormData.phone,
          service_area: editFormData.service_area,
          stand_location: editFormData.stand_location,
          public_contact_address: editFormData.public_contact_address,
          available_now: editFormData.available_now,
          is_active: editFormData.is_active,
          rating: Number(editFormData.rating) || 5
        }).eq('id', editingItem.id);

        if (dErr) throw dErr;

        if (editFormData.vehicle_id) {
          const { error: vErr } = await supabase.from('local_taxi_vehicles').update({
            vehicle_plate: editFormData.vehicle_plate,
            vehicle_type: editFormData.vehicle_type,
            vehicle_color: editFormData.vehicle_color,
            vehicle_description: editFormData.vehicle_description,
            capacity: Number(editFormData.capacity) || 0,
            luggage_note: editFormData.luggage_note
          }).eq('id', editFormData.vehicle_id);

          if (vErr) throw vErr;
        }

      } else if (editType === 'seller') {
        const { error: sErr } = await supabase.from('marketplace_sellers').update({
          shop_name: editFormData.shop_name,
          owner_name: editFormData.owner_name,
          phone: editFormData.phone,
          line_id: editFormData.line_id,
          service_area: editFormData.service_area,
          shop_location: editFormData.shop_location,
          public_contact_address: editFormData.public_contact_address,
          description: editFormData.description,
          seller_type: editFormData.seller_type,
          verification_status: editFormData.verification_status,
          is_active: editFormData.is_active
        }).eq('id', editingItem.id);

        if (sErr) throw sErr;
      } else if (editType === 'product') {
        const { error: pErr } = await supabase.from('marketplace_products').update({
          name: editFormData.name,
          description: editFormData.description,
          category: editFormData.category,
          product_type: editFormData.product_type,
          price: Number(editFormData.price) || 0,
          unit: editFormData.unit,
          stock_status: editFormData.stock_status,
          image_url: editFormData.image_url,
          is_gi: editFormData.is_gi,
          gi_name: editFormData.gi_name,
          is_otop: editFormData.is_otop,
          is_sme: editFormData.is_sme,
          approval_status: editFormData.approval_status,
          is_active: editFormData.is_active
        }).eq('id', editingItem.id);

        if (pErr) throw pErr;
      }

      setIsEditModalOpen(false);
      showToast("บันทึกเรียบร้อยแล้ว", "success");
      if (editType === 'taxi') {
        fetchTaxiItems();
      } else {
        fetchMarketplaceItems();
      }
    } catch (error: any) {
      console.error("Admin save failed:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        fullError: error,
      });
      showToast(`บันทึกไม่สำเร็จ: ${error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderProductSubItem = (p: any) => (
    <div key={p.id} className="bg-muted p-2.5 rounded-xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-xs text-slate-805 text-foreground">{p.name}</span>
          {p.category && (
            <span className="bg-muted/60 text-muted-foreground text-[9px] px-1.5 py-0.5 rounded-md font-medium">
              {p.category}
            </span>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap font-sans">
          <span>ราคา: <strong className="text-foreground">{p.price} บาท / {p.unit || 'ชิ้น'}</strong></span>
          <span>•</span>
          <span>สต็อก: {p.stock_status === 'instock' ? 'มีสินค้า' : 'หมด'}</span>
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {p.is_gi && <span className="bg-blue-50 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded">GI: {p.gi_name || 'ใช่'}</span>}
          {p.is_otop && <span className="bg-orange-50 text-orange-600 text-[8px] font-bold px-1.5 py-0.5 rounded">OTOP</span>}
          {p.is_sme && <span className="bg-purple-50 text-purple-600 text-[8px] font-bold px-1.5 py-0.5 rounded">SME</span>}
          <StatusBadge status={p.approval_status} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button 
          onClick={() => handleOpenEdit(p, 'product')} 
          className="text-[10px] text-primary font-bold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
        >
          แก้ไข
        </button>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={p.is_active || false}
            onChange={() => toggleStatus(p.id, p.is_active || false, 'product')}
          />
          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
        <button onClick={() => setSubTab('taxi')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${subTab === 'taxi' ? 'bg-card text-primary' : 'text-muted-foreground'}`}>รถรับจ้าง</button>
        <button onClick={() => setSubTab('marketplace')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${subTab === 'marketplace' ? 'bg-card text-emerald-600' : 'text-muted-foreground'}`}>ร้านค้าชุมชน</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground text-sm">กำลังโหลด...</div>
      ) : (subTab === 'taxi' && taxiItems.length === 0) || (subTab === 'marketplace' && marketplaceSellers.length === 0) ? (
        <div className="text-center py-10 text-muted-foreground text-sm">ไม่มีข้อมูล</div>
      ) : (
        <div className="space-y-3">
          {subTab === 'taxi' ? (
            taxiItems.map(item => (
              <div key={item.id} className="bg-card p-3 rounded-xl border border-border flex flex-col">
                <div className="flex justify-between items-center w-full">
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="font-bold text-sm text-foreground line-clamp-1">
                      {`${item.first_name || ''} ${item.last_name || ''}`}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      รถ: {item.local_taxi_vehicles?.[0]?.vehicle_type || "-"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEdit(item, 'taxi')} className="text-xs text-primary font-bold bg-blue-50 px-2 py-1 rounded">แก้ไข</button>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={item.is_active || false}
                        onChange={() => toggleStatus(item.id, item.is_active || false, 'taxi')}
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))
          ) : (
            marketplaceSellers.map(seller => {
              const isExpanded = expandedSellerIds.includes(seller.id);
              const totalProducts = seller.products?.length || 0;
              
              return (
                <div key={seller.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground">{seller.shop_name}</h4>
                        <span className="bg-muted/50 text-muted-foreground text-[9px] px-1.5 py-0.5 rounded-md font-medium">
                          {seller.seller_type === 'restaurant' ? 'ร้านอาหาร/เครื่องดื่ม' : 
                           seller.seller_type === 'otop' ? 'OTOP / วิสาหกิจ' : 
                           seller.seller_type === 'sme' ? 'SME' : 'รับจ้างทั่วไป'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        เจ้าของ: {seller.owner_name} | โทร: {seller.phone}
                      </p>
                      {seller.shop_location && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                          พิกัด: {seller.shop_location}
                        </p>
                      )}
                      <div className="mt-2 flex gap-1 items-center">
                        <span className="text-[9px] text-muted-foreground/60 font-medium font-sans">สถานะร้านค้า:</span>
                        <StatusBadge status={seller.verification_status || 'approved'} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(seller, 'seller')} 
                        className="text-xs text-primary font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg"
                      >
                        แก้ไข
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={seller.is_active || false}
                          onChange={() => toggleStatus(seller.id, seller.is_active || false, 'seller')}
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-150 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      <Package className="w-3 h-3 inline-block mr-0.5" /> สินค้าในร้าน <strong className="text-primary">{totalProducts}</strong> รายการ
                    </span>
                    
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedSellerIds(prev => prev.filter(id => id !== seller.id));
                        } else {
                          setExpandedSellerIds(prev => [...prev, seller.id]);
                        }
                      }}
                      className="text-xs font-bold text-primary bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'ซ่อนสินค้า' : 'ดูสินค้า'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border pl-2 border-l border-border space-y-3">
                      {totalProducts === 0 ? (
                        <div className="text-center py-4 text-xs text-muted-foreground/60">ยังไม่มีสินค้าในร้านนี้</div>
                      ) : (
                        <>
                          {(() => {
                            const approvedProducts = seller.products.filter((p: any) => p.approval_status === 'approved');
                            const pendingProducts = seller.products.filter((p: any) => p.approval_status === 'pending');
                            const rejectedProducts = seller.products.filter((p: any) => p.approval_status === 'rejected');
                            
                            return (
                              <>
                                {approvedProducts.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-emerald-600 mb-1 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                      สินค้าที่อนุมัติแล้ว ({approvedProducts.length})
                                    </div>
                                    <div className="space-y-1">{approvedProducts.map(renderProductSubItem)}</div>
                                  </div>
                                )}
                                {pendingProducts.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-amber-600 mb-1 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                      สินค้ารอตรวจสอบ ({pendingProducts.length})
                                    </div>
                                    <div className="space-y-1">{pendingProducts.map(renderProductSubItem)}</div>
                                  </div>
                                )}
                                {rejectedProducts.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-rose-600 mb-1 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                      สินค้าที่ไม่ผ่าน ({rejectedProducts.length})
                                    </div>
                                    <div className="space-y-1">{rejectedProducts.map(renderProductSubItem)}</div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 pb-20">
          <div className="bg-card w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <h2 className="font-bold text-lg text-foreground">
                {editType === 'taxi' ? 'แก้ไขรถรับจ้าง' : editType === 'seller' ? 'แก้ไขร้านค้า' : 'แก้ไขสินค้า'}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              
              {editType === 'taxi' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-xs font-bold mb-1">ชื่อ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.first_name} onChange={e => setEditFormData({...editFormData, first_name: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">นามสกุล</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.last_name} onChange={e => setEditFormData({...editFormData, last_name: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-xs font-bold mb-1">ชื่อเล่น</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.nickname} onChange={e => setEditFormData({...editFormData, nickname: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">อายุ</label><input type="number" className="w-full bg-muted border-border p-2 rounded" value={editFormData.age} onChange={e => setEditFormData({...editFormData, age: e.target.value})} /></div>
                  </div>
                  <div><label className="block text-xs font-bold mb-1">เบอร์โทร</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold mb-1">พื้นที่ให้บริการ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.service_area} onChange={e => setEditFormData({...editFormData, service_area: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold mb-1">จุดจอด</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.stand_location} onChange={e => setEditFormData({...editFormData, stand_location: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold mb-1">สถานที่ติดต่อ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.public_contact_address} onChange={e => setEditFormData({...editFormData, public_contact_address: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-xs font-bold mb-1">รับงานอยู่?</label><select className="w-full bg-muted border-border p-2 rounded" value={editFormData.available_now ? 'true' : 'false'} onChange={e => setEditFormData({...editFormData, available_now: e.target.value === 'true'})} ><option value="true">ใช่</option><option value="false">ไม่</option></select></div>
                    <div><label className="block text-xs font-bold mb-1">is_active</label><select className="w-full bg-muted border-border p-2 rounded" value={editFormData.is_active ? 'true' : 'false'} onChange={e => setEditFormData({...editFormData, is_active: e.target.value === 'true'})} ><option value="true">ใช่</option><option value="false">ไม่</option></select></div>
                    <div><label className="block text-xs font-bold mb-1">rating</label><input type="number" step="0.1" className="w-full bg-muted border-border p-2 rounded" value={editFormData.rating} onChange={e => setEditFormData({...editFormData, rating: e.target.value})} /></div>
                  </div>
                  
                  {editFormData.vehicle_id && (
                    <div className="pt-2 border-t mt-4 border-border">
                      <h3 className="font-bold mb-2 font-sans">ข้อมูลรถ</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="block text-xs font-bold mb-1">ทะเบียน</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.vehicle_plate} onChange={e => setEditFormData({...editFormData, vehicle_plate: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold mb-1">ประเภท</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.vehicle_type} onChange={e => setEditFormData({...editFormData, vehicle_type: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold mb-1">สี</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.vehicle_color} onChange={e => setEditFormData({...editFormData, vehicle_color: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold mb-1">ความจุ</label><input type="number" className="w-full bg-muted border-border p-2 rounded" value={editFormData.capacity} onChange={e => setEditFormData({...editFormData, capacity: e.target.value})} /></div>
                      </div>
                      <div className="mt-2"><label className="block text-xs font-bold mb-1">ลักษณะรถ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.vehicle_description} onChange={e => setEditFormData({...editFormData, vehicle_description: e.target.value})} /></div>
                      <div className="mt-2"><label className="block text-xs font-bold mb-1">บันทึกสัมภาระ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.luggage_note} onChange={e => setEditFormData({...editFormData, luggage_note: e.target.value})} /></div>
                    </div>
                  )}
                </>
              )}

              {editType === 'seller' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-xs font-bold mb-1">ชื่อร้าน</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.shop_name} onChange={e => setEditFormData({...editFormData, shop_name: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">เจ้าของ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.owner_name} onChange={e => setEditFormData({...editFormData, owner_name: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-xs font-bold mb-1">โทรศัพท์</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">Line ID</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.line_id} onChange={e => setEditFormData({...editFormData, line_id: e.target.value})} /></div>
                  </div>
                  <div><label className="block text-xs font-bold mb-1">พื้นที่</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.service_area} onChange={e => setEditFormData({...editFormData, service_area: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold mb-1">พิกัดสถานที่</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.shop_location} onChange={e => setEditFormData({...editFormData, shop_location: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold mb-1">สถานที่ติดต่อ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.public_contact_address} onChange={e => setEditFormData({...editFormData, public_contact_address: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold mb-1">รายละเอียด</label><textarea className="w-full bg-muted border-border p-2 rounded" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} /></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="block text-xs font-bold mb-1">ประเภท</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.seller_type} onChange={e => setEditFormData({...editFormData, seller_type: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">สถานะยืนยัน</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.verification_status} onChange={e => setEditFormData({...editFormData, verification_status: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">is_active</label><select className="w-full bg-muted border-border p-2 rounded" value={editFormData.is_active ? 'true' : 'false'} onChange={e => setEditFormData({...editFormData, is_active: e.target.value === 'true'})} ><option value="true">ใช่</option><option value="false">ไม่</option></select></div>
                  </div>
                </>
              )}

              {editType === 'product' && (
                <>
                  <div><label className="block text-xs font-bold mb-1">ชื่อสินค้า</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold mb-1">รายละเอียด</label><textarea className="w-full bg-muted border-border p-2 rounded" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-xs font-bold mb-1">ประเภทสินค้าย่อย</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.product_type} onChange={e => setEditFormData({...editFormData, product_type: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">หมวดหมู่</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">ราคา</label><input type="number" className="w-full bg-muted border-border p-2 rounded" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">หน่วย</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.unit} onChange={e => setEditFormData({...editFormData, unit: e.target.value})} /></div>
                  </div>
                  <div><label className="block text-xs font-bold mb-1">URL รูปภาพ</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.image_url} onChange={e => setEditFormData({...editFormData, image_url: e.target.value})} /></div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div><label className="block text-xs font-bold mb-1">is_gi</label><select className="w-full bg-muted border-border p-2 rounded" value={editFormData.is_gi ? 'true' : 'false'} onChange={e => setEditFormData({...editFormData, is_gi: e.target.value === 'true'})} ><option value="true">ใช่</option><option value="false">ไม่</option></select></div>
                    <div><label className="block text-xs font-bold mb-1">is_otop</label><select className="w-full bg-muted border-border p-2 rounded" value={editFormData.is_otop ? 'true' : 'false'} onChange={e => setEditFormData({...editFormData, is_otop: e.target.value === 'true'})} ><option value="true">ใช่</option><option value="false">ไม่</option></select></div>
                    <div><label className="block text-xs font-bold mb-1">is_sme</label><select className="w-full bg-muted border-border p-2 rounded" value={editFormData.is_sme ? 'true' : 'false'} onChange={e => setEditFormData({...editFormData, is_sme: e.target.value === 'true'})} ><option value="true">ใช่</option><option value="false">ไม่</option></select></div>
                  </div>

                  <div className="mt-2"><label className="block text-xs font-bold mb-1">ชื่อ GI (ถ้ามี)</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.gi_name || ''} onChange={e => setEditFormData({...editFormData, gi_name: e.target.value})} /></div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div><label className="block text-xs font-bold mb-1 font-sans">สถานะสต็อก</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.stock_status} onChange={e => setEditFormData({...editFormData, stock_status: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">approval_status</label><input className="w-full bg-muted border-border p-2 rounded" value={editFormData.approval_status} onChange={e => setEditFormData({...editFormData, approval_status: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold mb-1">is_active</label><select className="w-full bg-muted border-border p-2 rounded" value={editFormData.is_active ? 'true' : 'false'} onChange={e => setEditFormData({...editFormData, is_active: e.target.value === 'true'})} ><option value="true">ใช่</option><option value="false">ไม่</option></select></div>
                  </div>
                </>
              )}

            </div>
            <div className="p-4 shrink-0 bg-card border-t border-border flex gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 bg-muted/50 text-foreground font-bold rounded-xl py-3"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 disabled:opacity-50"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// SHARED UI
// -----------------------------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">รออนุมัติ</span>;
  if (status === 'revision_required') return <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">รอแก้ไข</span>;
  if (status === 'approved') return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">อนุมัติ</span>;
  if (status === 'rejected') return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded">ปฏิเสธ</span>;
  return <span className="bg-muted/50 text-foreground text-[10px] font-bold px-2 py-0.5 rounded">{status}</span>;
}
