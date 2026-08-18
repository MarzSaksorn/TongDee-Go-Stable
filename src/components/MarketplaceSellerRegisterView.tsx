import React, { useState, useEffect } from "react";
import { ArrowLeft, Store, PhoneCall, Package, CheckCircle2, AlertCircle, Clock, FileEdit, HelpCircle, User } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import SellerDashboardView from "./SellerDashboardView";

interface MarketplaceSellerRegisterViewProps {
  onBack: () => void;
}

export default function MarketplaceSellerRegisterView({ onBack }: MarketplaceSellerRegisterViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    lineId: "",
    serviceArea: "",
    shopLocation: "",
    publicContactAddress: "",
    description: "",
    sellerType: "community",
    confirmTruth: false
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

        // Check if there is an approved seller profile
        const { data: sellerData, error: sellerError } = await supabase
          .from("marketplace_sellers")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (sellerError && sellerError.code !== "PGRST116") {
          console.error("Error fetching seller profile:", sellerError);
        } else if (sellerData) {
          setSellerProfile(sellerData);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("marketplace_seller_applications")
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setIsSubmitting(true);

    if (!formData.confirmTruth) {
      setSubmissionError("กรุณายืนยันว่าข้อมูลที่กรอกเป็นความจริง");
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

      // Insert into marketplace_seller_applications
      const { error: insertError } = await supabase
        .from("marketplace_seller_applications")
        .insert({
          user_id: session.user.id,
          shop_name: formData.shopName,
          owner_name: formData.ownerName,
          phone: formData.phone,
          line_id: formData.lineId || null,
          service_area: formData.serviceArea || null,
          shop_location: formData.shopLocation || null,
          public_contact_address: formData.publicContactAddress || null,
          description: formData.description || null,
          seller_type: formData.sellerType || "community",
          application_status: "pending"
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

  // Active Seller Dashboard
  if (sellerProfile) {
    return <SellerDashboardView sellerProfile={sellerProfile} onBack={onBack} />;
  }

  // Application Display State
  if (applicationStatus) {
    let statusIcon, statusTitle, statusDesc, statusColor, statusBg;

    switch (applicationStatus) {
      case "pending":
        statusIcon = <Clock className="w-12 h-12 text-primary mb-4" />;
        statusTitle = "รอตรวจสอบ";
        statusDesc = "ส่งคำขอเรียบร้อยแล้ว แอดมินจะตรวจสอบข้อมูลร้านค้าก่อนอนุมัติในระบบ";
        statusColor = "text-primary";
        statusBg = "bg-blue-50 border-blue-200";
        break;
      case "revision_required":
        statusIcon = <FileEdit className="w-12 h-12 text-amber-500 mb-4" />;
        statusTitle = "ต้องแก้ไขข้อมูล";
        statusDesc = "ข้อมูลไม่ถูกต้องหรือครบถ้วน โปรดติดต่อแอดมินเพื่อแก้ไขข้อมูล";
        statusColor = "text-amber-600";
        statusBg = "bg-amber-50 border-amber-200";
        break;
      case "approved":
        statusIcon = <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />;
        statusTitle = "ผ่านการอนุมัติ";
        statusDesc = "ข้อมูลของคุณได้รับการอนุมัติเรียบร้อยแล้ว";
        statusColor = "text-emerald-600";
        statusBg = "bg-emerald-50 border-emerald-200";
        break;
      case "rejected":
        statusIcon = <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />;
        statusTitle = "ไม่อนุมัติ";
        statusDesc = "เอกสารหรือข้อมูลของคุณไม่ผ่านการประเมินเพื่อเข้าร่วมในระบบ";
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
        {/* Header */}
        <div className="bg-card px-4 pt-12 pb-4 relative z-20 flex items-center shrink-0">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              สถานะการลงทะเบียนร้านค้า
            </h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
          <div className={`border rounded-2xl p-8 flex flex-col items-center text-center w-full max-w-sm ${statusBg}`}>
            {statusIcon}
            <h2 className={`text-2xl font-bold mb-2 ${statusColor}`}>{statusTitle}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{statusDesc}</p>
            <button 
              onClick={onBack}
              className="mt-8 bg-primary text-primary-foreground font-medium py-3 px-6 rounded-full shadow-sm hover:bg-primary/90 active:scale-95 transition-all w-full"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted relative overflow-hidden">
      {/* Header */}
        <div className="bg-card px-4 pt-12 pb-4 relative z-20 shrink-0 border-b border-border">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              สมัครผู้ขายสินค้าชุมชน
            </h1>
          </div>
        </div>
        <p className="text-sm mt-3 font-medium text-muted-foreground ml-1">
          ลงทะเบียนเพื่อนำสินค้าของคุณจำหน่ายแก่นักท่องเที่ยว สำหรับร้านค้าเด่นในพื้นที่พิชัย
        </p>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto w-full relative">
        <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 pb-32">
          
          <section className="bg-card p-5 rounded-2xl border border-border space-y-4">
            <div className="flex items-center space-x-2 text-foreground mb-4 pb-2 border-b border-border">
              <Store className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">ข้อมูลร้านค้า</h2>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">ชื่อร้านค้า หรือ แบรนด์</label>
              <input required name="shopName" value={formData.shopName} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="ร้านของฝากป้าแอ๋ว" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">ชื่อ-สกุล ผู้ติดต่อ (เจ้าของร้าน)</label>
              <input required name="ownerName" value={formData.ownerName} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="ชื่อ สกุล" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">พื้นที่ให้บริการ/ชุมชน</label>
              <input required name="serviceArea" value={formData.serviceArea} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="เช่น ตำบลท่าสัก, เมืองพิชัย" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">พิกัด/ตำแหน่งที่ตั้งร้าน (ถ้ามี)</label>
              <textarea required name="shopLocation" value={formData.shopLocation} onChange={handleInputChange} rows={2} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="เช่น 15.1234, 100.5678 หรือ ลิงก์แผนที่" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">ที่อยู่อำนวยความสะดวกสาธารณะ</label>
              <textarea name="publicContactAddress" value={formData.publicContactAddress} onChange={handleInputChange} rows={2} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="แผงริมทางหลวงหมายเลข 11..." />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">คำอธิบายร้านค้า</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="จุดเด่นสินค้า ประวัติร้าน..." />
            </div>
          </section>

          <section className="bg-card p-5 rounded-2xl border border-border space-y-4">
             <div className="flex items-center space-x-2 text-foreground mb-4 pb-2 border-b border-border">
              <PhoneCall className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-lg">ข้อมูลติดต่อ</h2>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">เบอร์โทรศัพท์ (ที่ลูกค้าสามารถติดต่อได้)</label>
              <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="08xxxxxxxx" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">LINE ID ร้านค้า (ถ้ามี)</label>
              <input name="lineId" value={formData.lineId} onChange={handleInputChange} type="text" className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="@myshop หรือ line_id_123" />
            </div>
          </section>

          <section className="bg-card p-5 rounded-2xl border border-border space-y-5">
             <div className="flex items-center space-x-2 text-foreground mb-2 pb-2 border-b border-border">
              <Package className="w-5 h-5 text-purple-500" />
              <h2 className="font-bold text-lg">ประเภทผู้ขาย</h2>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">ประเภท (เลือกหนึ่งรายการ)</label>
              <div className="relative">
                <select name="sellerType" value={formData.sellerType} onChange={handleInputChange} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="community">ร้านค้าชุมชน / วิสาหกิจชุมชน</option>
                  <option value="sme">SME ท้องถิ่น / OTOP</option>
                  <option value="gi">สินค้า GI / ของฝากขึ้นชื่อ</option>
                  <option value="farm">เกษตรกร / สวนผลไม้</option>
                  <option value="other">อื่น ๆ</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-start space-x-3 p-4 bg-muted border border-border rounded-xl">
            <div className="mt-1 flex-shrink-0">
               <input required name="confirmTruth" checked={formData.confirmTruth} onChange={handleInputChange} type="checkbox" className="w-5 h-5 rounded text-primary border-border focus:ring-primary" />
            </div>
            <label className="text-xs text-foreground leading-relaxed font-medium">
              ข้าพเจ้ายืนยันว่าข้อมูลข้างต้นเป็นความจริง และยินยอมให้นำข้อมูลร้านค้าและสินค้าโปรโมทบนแอปพลิเคชันแก่นักท่องเที่ยว ข้อมูลส่วนบุคคลจะไม่ถูกเผยแพร่ในที่สาธารณะนอกเหนือจากจุดประสงค์ติดต่อซื้อขาย
            </label>
          </div>

          {submissionError && (
             <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm font-medium flex items-center">
               <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
               <p>{submissionError}</p>
             </div>
          )}

        </form>
      </div>

      {/* Floating Submit Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/95 to-transparent z-30 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-all"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>กำลังส่งข้อมูล...</span>
            </>
          ) : (
            <span>ลงทะเบียนร้านค้า</span>
          )}
        </button>
      </div>
    </div>
  );
}
