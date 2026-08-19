import React, { useState, useEffect } from "react";
import { ArrowLeft, Store, Plus, Package, Edit, CheckCircle2, Clock, Trash2, X, Image as ImageIcon, Power } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "./ToastProvider";

interface SellerDashboardViewProps {
  onBack: () => void;
  sellerProfile: any;
}

export default function SellerDashboardView({ onBack, sellerProfile }: SellerDashboardViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [isEditShopOpen, setIsEditShopOpen] = useState(false);
  const [editShopData, setEditShopData] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    lineId: "",
    serviceArea: "",
    shopLocation: "",
    publicContactAddress: "",
    description: "",
    sellerType: "",
  });
  const [isSavingShop, setIsSavingShop] = useState(false);
  const { showToast } = useToast();
  const [isActive, setIsActive] = useState<boolean>(() => Boolean(sellerProfile?.is_active));
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [sellerProfile]);

  const handleSaveShopProfile = async () => {
    setIsSavingShop(true);
    try {
      const { error } = await supabase
        .from('marketplace_sellers')
        .update({
          shop_name: editShopData.shopName,
          owner_name: editShopData.ownerName,
          phone: editShopData.phone,
          line_id: editShopData.lineId,
          service_area: editShopData.serviceArea,
          shop_location: editShopData.shopLocation,
          public_contact_address: editShopData.publicContactAddress,
          description: editShopData.description,
          seller_type: editShopData.sellerType,
        })
        .eq('id', sellerProfile.id);

      if (error) throw error;
      
      setIsEditShopOpen(false);
      showToast("บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว", "success");
      // Since sellerProfile comes from props, maybe refresh happens top-down, but it is enough here.
    } catch (err: any) {
      console.error("Failed to update seller profile:", {
        code: err?.code,
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        fullError: err,
      });
      showToast(`บันทึกไม่สำเร็จ: ${err.message}`, "error");
    } finally {
      setIsSavingShop(false);
    }
  };

  const handleToggleShopActive = async () => {
    if (!sellerProfile?.id) return;
    const nextActive = !isActive;
    try {
      const { error } = await supabase
        .from('marketplace_sellers')
        .update({ is_active: nextActive })
        .eq('id', sellerProfile.id);

      if (error) throw error;
      setIsActive(nextActive);
      showToast(
        nextActive
          ? "เปิดร้านแล้ว ร้านค้าจะแสดงในตลาดชุมชนอีกครั้ง"
          : "ปิดร้านแล้ว ร้านค้าจะไม่แสดงในตลาดชุมชน",
        "success"
      );
    } catch (err: any) {
      console.error("Failed to toggle shop active state:", err);
      showToast(`ดำเนินการไม่สำเร็จ: ${err?.message || ""}`, "error");
    }
  };

  const handleDeleteShop = async () => {
    if (!sellerProfile?.id) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('marketplace_sellers')
        .delete()
        .eq('id', sellerProfile.id);
      if (error) throw error;
      setIsDeleteConfirmOpen(false);
      showToast("ลบร้านค้าเรียบร้อยแล้ว", "success");
      onBack();
    } catch (err: any) {
      console.error("Failed to delete seller shop:", err);
      showToast(`ลบไม่สำเร็จ: ${err?.message || ""}`, "error");
      setIsDeleting(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('*')
        .eq('seller_id', sellerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (product: any = null) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleSaveProduct = async (formData: any) => {
    try {
      if (editingProduct) {
        // Edit existing
        const { error } = await supabase
          .from('marketplace_products')
          .update({
            name: formData.name,
            description: formData.description || null,
            price: formData.price ? Number(formData.price) : null,
            unit: formData.unit || null,
            category: formData.category || null,
            product_type: formData.productType || "community",
            stock_status: formData.stockStatus || "available",
            image_url: formData.imageUrl || null,
            is_gi: !!formData.isGi,
            gi_name: formData.isGi ? formData.giName : null,
            is_otop: !!formData.isOtop,
            is_sme: !!formData.isSme,
            approval_status: 'pending',
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('marketplace_products')
          .insert({
            seller_id: sellerProfile.id,
            name: formData.name,
            description: formData.description || null,
            category: formData.category || null,
            product_type: formData.productType || "community",
            price: formData.price ? Number(formData.price) : null,
            unit: formData.unit || null,
            stock_status: formData.stockStatus || "available",
            image_url: formData.imageUrl || null,
            is_gi: !!formData.isGi,
            gi_name: formData.isGi ? formData.giName : null,
            is_otop: !!formData.isOtop,
            is_sme: !!formData.isSme,
            is_active: false,
            approval_status: 'pending'
          });

        if (error) throw error;
      }

      fetchProducts();
      handleCloseForm();
    } catch (err) {
      console.error("Failed to save product:", err);
      showToast("ไม่สามารถบันทึกสินค้าได้ โปรดลองอีกครั้ง", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    try {
      const { error } = await supabase
        .from('marketplace_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchProducts();
    } catch (err) {
       console.error("Failed to delete product:", err);
    }
  };


  return (
    <div className="flex flex-col h-full bg-muted relative overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 pt-12 pb-6 relative z-20 shrink-0"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-card/10 active:bg-card/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="ml-2">
              <h1 className="text-xl font-bold tracking-tight">
                จัดการร้านค้าของคุณ
              </h1>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col gap-3 bg-card/10 p-4 rounded-[20px] backdrop-blur-md border border-white/10 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center shrink-0">
               <Store className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
               <h2 className="font-bold text-lg leading-tight">{sellerProfile.shop_name}</h2>
               <p className="text-xs text-primary-foreground/80 mt-1 flex items-center gap-1.5">
                 {isActive ? (
                   <span className="flex items-center gap-1 text-emerald-300 font-bold">
                     <span className="w-2 h-2 rounded-full bg-emerald-400"></span> เปิดร้านแล้ว
                   </span>
                 ) : sellerProfile.verification_status === "approved" ? (
                   <span className="flex items-center gap-1 text-amber-300 font-bold">
                     <Clock className="w-3 h-3" /> ปิดร้านอยู่
                   </span>
                 ) : (
                   <span className="flex items-center gap-1 text-amber-300 font-bold">
                     <Clock className="w-3 h-3" /> รอการยืนยันขั้นสุดท้าย
                   </span>
                 )}
               </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditShopData({
                shopName: sellerProfile.shop_name || "",
                ownerName: sellerProfile.owner_name || "",
                phone: sellerProfile.phone || "",
                lineId: sellerProfile.line_id || "",
                serviceArea: sellerProfile.service_area || "",
                shopLocation: sellerProfile.shop_location || "",
                publicContactAddress: sellerProfile.public_contact_address || "",
                description: sellerProfile.description || "",
                sellerType: sellerProfile.seller_type || "",
              });
              setIsEditShopOpen(true);
            }}
            className="w-full bg-card/20 hover:bg-card/30 text-white text-xs font-bold py-2 rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="w-3 h-3" /> แก้ไขข้อมูลร้านค้า
          </button>
          {sellerProfile.verification_status === "approved" && (
            <>
              <button
                onClick={handleToggleShopActive}
                className={`w-full text-xs font-bold py-2 rounded-xl border transition-colors flex items-center justify-center gap-1 ${
                  isActive
                    ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-400/40"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                }`}
              >
                <Power className="w-3 h-3" />
                {isActive ? "ปิดร้านชั่วคราว" : "เปิดร้านอีกครั้ง"}
              </button>
              <p className="text-[9px] text-primary-foreground/60 text-center -mt-1">
                {isActive
                  ? "ปิดแล้วร้านจะหายไปจากตลาดชุมชนจนกว่าจะเปิดใหม่"
                  : "ร้านจะแสดงในตลาดชุมชนอีกครั้งเมื่อเปิด"}
              </p>
            </>
          )}
          {sellerProfile.verification_status === "approved" && (
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold py-2 rounded-xl border border-rose-400/40 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> ลบร้านค้า
            </button>
          )}
        </div>

        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteConfirmOpen(false)} />
            <div className="relative bg-card w-full max-w-[340px] rounded-2xl p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-sm font-extrabold text-foreground text-center mb-2">ลบร้านค้า?</h3>
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed mb-5">
                สินค้าทั้งหมดของร้านจะถูกลบถาวรและไม่สามารถกู้คืนได้
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-3 bg-muted text-foreground text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteShop}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-destructive text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบถาวร"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-[calc(110px+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-2">
             <Package className="w-5 h-5 text-primary" />
            สินค้าของร้าน ({products.length})
          </h3>

          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> เพิ่มสินค้า
          </button>
        </div>

         {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center bg-card rounded-xl border border-dashed border-border">
             <Package className="w-12 h-12 text-muted-foreground/60 mb-3" />
             <h4 className="text-sm font-bold text-foreground">ยังไม่มีสินค้า</h4>
             <p className="text-xs text-muted-foreground mt-1 mb-4">เพิ่มสินค้าของคุณเพื่อให้คนที่สนใจสามารถดูและติดต่อซื้อได้</p>
             <button 
               onClick={() => handleOpenForm()}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 transition"
             >
               + เพิ่มสินค้าชิ้นแรก
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-card p-4 rounded-xl border border-border flex gap-4 relative group">
                <div className="w-20 h-20 bg-muted/50 rounded-2xl shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 pr-4">{p.name}</h4>
                      {p.approval_status === "approved" ? (
                         <span className="shrink-0 ml-2 bg-emerald-100 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">ผ่าน</span>
                      ) : p.approval_status === "rejected" ? (
                         <span className="shrink-0 ml-2 bg-rose-100 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">ไม่ผ่าน</span>
                      ) : (
                         <span className="shrink-0 ml-2 bg-amber-100 text-amber-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">รอตรวจ</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">หมวดหมู่: {p.category}</p>
                    <div className="font-black text-primary text-sm mt-1.5">฿{p.price} <span className="text-[10px] text-muted-foreground/60 font-medium">/{p.unit}</span></div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleOpenForm(p)} className="text-xs bg-muted hover:bg-muted/50 text-foreground font-bold px-3 py-1.5 rounded-lg border border-border flex items-center gap-1 transition">
                       <Edit className="w-3 h-3" /> แก้ไข
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold px-3 py-1.5 rounded-lg border border-destructive/20 flex items-center gap-1 transition">
                       <Trash2 className="w-3 h-3" /> ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <ProductFormModal 
          product={editingProduct} 
          onClose={handleCloseForm} 
          onSave={handleSaveProduct} 
        />
      )}

      {isEditShopOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 pb-20">
          <div className="bg-card w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <h2 className="font-bold text-lg text-foreground">แก้ไขข้อมูลร้านค้า</h2>
              <button
                onClick={() => setIsEditShopOpen(false)}
                className="p-2 -mr-2 bg-muted text-muted-foreground rounded-full hover:bg-muted/50"
              >
                <ArrowLeft className="w-5 h-5 -rotate-90 sm:rotate-0" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">ชื่อร้านค้า</label>
                <input type="text" value={editShopData.shopName} onChange={e => setEditShopData({...editShopData, shopName: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">ชื่อเจ้าของร้าน</label>
                <input type="text" value={editShopData.ownerName} onChange={e => setEditShopData({...editShopData, ownerName: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">เบอร์โทรศัพท์</label>
                <input type="tel" value={editShopData.phone} onChange={e => setEditShopData({...editShopData, phone: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Line ID (ถ้ามี)</label>
                <input type="text" value={editShopData.lineId} onChange={e => setEditShopData({...editShopData, lineId: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">พื้นที่ให้บริการ (เขต/อำเภอ)</label>
                <input type="text" value={editShopData.serviceArea} onChange={e => setEditShopData({...editShopData, serviceArea: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">พิกัดร้าน (ลิงก์ Google Maps) (ถ้ามี)</label>
                <input type="url" value={editShopData.shopLocation} onChange={e => setEditShopData({...editShopData, shopLocation: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">สถานที่ตั้งร้าน / ที่อยู่ติดต่อ</label>
                <input type="text" value={editShopData.publicContactAddress} onChange={e => setEditShopData({...editShopData, publicContactAddress: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">ประเภทผู้ขาย</label>
                <select value={editShopData.sellerType} onChange={e => setEditShopData({...editShopData, sellerType: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="community">รับจ้างทั่วไป</option>
                  <option value="otop">OTOP / วิสาหกิจ</option>
                  <option value="sme">SME</option>
                  <option value="restaurant">ร้านอาหาร/เครื่องดื่ม</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">รายละเอียดร้านค้า</label>
                <textarea rows={3} value={editShopData.description} onChange={e => setEditShopData({...editShopData, description: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

            </div>
            <div className="p-4 shrink-0 bg-card border-t border-border">
              <button
                onClick={handleSaveShopProfile}
                disabled={isSavingShop}
                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl py-3.5 transition-colors disabled:opacity-50"
              >
                {isSavingShop ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
              <div className="text-center mt-3">
                <button onClick={() => setIsEditShopOpen(false)} className="text-muted-foreground font-bold text-sm">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// Component: ProductFormModal
// -----------------------------------------------------------------------------------

interface ProductFormModalProps {
  product: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    unit: product?.unit || "ชิ้น",
    category: product?.category || "food",
    productType: product?.product_type || "community",
    stockStatus: product?.stock_status || "available",
    imageUrl: product?.image_url || "",
    isGi: product?.is_gi || false,
    giName: product?.gi_name || "",
    isOtop: product?.is_otop || false,
    isSme: product?.is_sme || true, // default to sme
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/60 sm:justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[85vh] animate-slide-up shadow-2xl">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shadow-sm relative z-10 shrink-0">
          <h2 className="font-bold text-lg text-foreground">{product ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
          <button onClick={onClose} className="p-2 bg-muted/50 hover:bg-muted/80 rounded-full text-muted-foreground transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
            
            {product && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-start mb-4">
                <Clock className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                <p>เมื่อแก้ไขสินค้าแล้ว สินค้าจะเปลี่ยนสถานะเป็นรอตรวจ และต้องให้ผู้ดูแลตรวจสอบอีกครั้งก่อนแสดงในตลาดชุมชน</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">รูปภาพสินค้า (URL)</label>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} type="text" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">ชื่อสินค้า</label>
              <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="ชื่อสินค้า..." />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">รายละเอียดสินค้า</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="อธิบายสินค้าของคุณ..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-muted-foreground ml-1">ราคา (บาท)</label>
                 <input required name="price" value={formData.price} onChange={handleChange} type="number" min="0" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-muted-foreground ml-1">หน่วยสินค้า</label>
                 <input required name="unit" value={formData.unit} onChange={handleChange} type="text" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="ชิ้น, กก., ลูก, อัน" />
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground ml-1">หมวดหมู่</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none">
                 <option value="food">อาหารพื้นถิ่น</option>
                 <option value="craft">งานหัตถกรรม</option>
                 <option value="souvenir">ของฝากทั่วไป</option>
                 <option value="other">อื่นๆ</option>
              </select>
            </div>

            <div className="p-4 bg-muted rounded-2xl border border-border space-y-3">
              <h4 className="text-xs font-bold text-foreground">สัญลักษณ์และประเภท</h4>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input name="isGi" checked={formData.isGi} onChange={handleChange} type="checkbox" className="w-4 h-4 rounded text-purple-600" />
                 <span className="text-sm font-medium text-foreground">สินค้า GI</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input name="isOtop" checked={formData.isOtop} onChange={handleChange} type="checkbox" className="w-4 h-4 rounded text-emerald-600" />
                 <span className="text-sm font-medium text-foreground">สินค้า OTOP</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input name="isSme" checked={formData.isSme} onChange={handleChange} type="checkbox" className="w-4 h-4 rounded text-primary" />
                 <span className="text-sm font-medium text-foreground">สินค้า SME ท้องถิ่น</span>
              </label>
            </div>

            <div className="p-4 bg-muted rounded-2xl border border-border mt-2 space-y-2">
               <div>
                  <h4 className="text-sm font-bold text-foreground">สถานะสต็อก</h4>
                  <p className="text-[11px] text-muted-foreground">ปรับเปลี่ยนตามจำนวนสินค้าที่มีอยู่ในปัจจุบัน</p>
               </div>
               <div className="relative">
                 <select name="stockStatus" value={formData.stockStatus} onChange={handleChange} className="w-full bg-card border border-border rounded-lg px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none">
<option value="available">(Available) พร้อมขาย</option>
                    <option value="low_stock">(Low Stock) ใกล้หมด</option>
                    <option value="sold_out">(Sold Out) หมด</option>
                    <option value="preorder">(Preorder) สั่งจองล่วงหน้า</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                   <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
               </div>
            </div>

            <p className="text-[11px] text-muted-foreground/60 font-medium text-center italic px-4">
              สินค้าใหม่ที่เพิ่มหรือแก้ไข จะถูกส่งให้แอดมินพิจารณาตรวจสอบก่อนแสดงบนแอปพลิเคชัน
            </p>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-border bg-card shrink-0 shadow-lg">
           <button 
             type="submit" 
             form="productForm"
             disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
           >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>{product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</span>
              )}
           </button>
        </div>

      </div>
    </div>
  );
}
