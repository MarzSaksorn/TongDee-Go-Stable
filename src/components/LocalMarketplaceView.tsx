import React, { useState, useEffect } from "react";
import gsap from "gsap";
import {
  ArrowLeft,
  Search,
  MapPin,
  PhoneCall,
  MessageCircle,
  Store,
  Package,
  Award,
  ChevronRight,
  Navigation,
  ShoppingCart,
  MessageSquare,
  X,
  Star,
  Sparkles,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useLanguage } from "../i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image_url: string;
  is_gi: boolean;
  is_otop: boolean;
  is_sme: boolean;
  seller_id: string;
  in_stock?: boolean;
  stock_status?: "available" | "low_stock" | "sold_out" | "preorder";
  seller?: Seller;
}

interface Seller {
  id: string;
  shop_name: string;
  phone: string;
  line_id: string;
  shop_location: string;
  is_active: boolean;
}

interface LocalMarketplaceViewProps {
  onBack: () => void;
  initialProductId?: string;
}

export default function LocalMarketplaceView({ onBack, initialProductId }: LocalMarketplaceViewProps) {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  const categories = [
    { id: "all", labelTh: "ทั้งหมด", labelEn: "All" },
    { id: "gi", labelTh: "GI", labelEn: "GI" },
    { id: "otop", labelTh: "OTOP", labelEn: "OTOP" },
    { id: "sme", labelTh: "SME", labelEn: "SME" },
    { id: "food", labelTh: "อาหาร", labelEn: "Food" },
    { id: "craft", labelTh: "หัตถกรรม", labelEn: "Craft" },
    { id: "souvenir", labelTh: "ของฝาก", labelEn: "Souvenir" },
  ];

  const mockProducts: Product[] = [
    {
      id: "p1",
      name: "ข้าวกล้องไรซ์เบอร์รี่พิชัย",
      description: "ข้าวกล้องไรซ์เบอร์รี่อินทรีย์ ปลูกด้วยวิธีธรรมชาติในพื้นที่พิชัย อุดมไปด้วยสารอาหารและวิตามิน อร่อย นุ่ม หอม",
      price: 120,
      unit: "กิโลกรัม",
      category: "food",
      image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
      is_gi: false,
      is_otop: true,
      is_sme: true,
      seller_id: "s1",
      in_stock: true,
      seller: {
        id: "s1",
        shop_name: "วิสาหกิจชุมชนเกษตรอินทรีย์พิชัย",
        phone: "0812345678",
        line_id: "organic_phichai",
        shop_location: "ต.ในเมือง อ.พิชัย จ.อุตรดิตถ์",
        is_active: true
      }
    },
    {
      id: "p2",
      name: "ไม้กวาดตองกง",
      description: "ไม้กวาดทำมืออย่างประณีต ด้ามจับแข็งแรง ทนทาน ทำจากวัสดุธรรมชาติในพื้นที่ชุมชน",
      price: 80,
      unit: "อัน",
      category: "craft",
      image_url: "https://images.unsplash.com/photo-1585421514738-028bb40ceae8?auto=format&fit=crop&q=80&w=400",
      is_gi: false,
      is_otop: true,
      is_sme: false,
      seller_id: "s2",
      in_stock: true,
      seller: {
        id: "s2",
        shop_name: "กลุ่มหัตถกรรมพื้นบ้าน",
        phone: "0898765432",
        line_id: "handicraft_p",
        shop_location: "หน้าวัดมหาธาตุ อ.พิชัย",
        is_active: true
      }
    },
    {
      id: "p3",
      name: "สับปะรดห้วยมุ่น",
      description: "สับปะรดสายพันธุ์ดี หวาน กรอบ ฉ่ำ เนื้อสีเหลืองทอง ของแท้จากพื้นที่ GI สังเกตป้าย GI",
      price: 250,
      unit: "กล่อง (4 ลูก)",
      category: "food",
      image_url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=400",
      is_gi: true,
      is_otop: true,
      is_sme: true,
      seller_id: "s3",
      in_stock: true,
      seller: {
        id: "s3",
        shop_name: "สวนคุณป้า สับปะรด GI",
        phone: "0823456789",
        line_id: "pine_sweet",
        shop_location: "ตลาดผลไม้พิชัย",
        is_active: true
      }
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (initialProductId && products.length > 0) {
      const match = products.find((p) => p.id === initialProductId);
      if (match) setSelectedProduct(match);
    }
  }, [initialProductId, products]);

  useEffect(() => {
    if (products.length > 0) {
      gsap.fromTo(".market-product-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: "power3.out" }
      );
    }
  }, [products.length, activeCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:marketplace_sellers!inner(*)
        `)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .eq('marketplace_sellers.is_active', true);

      if (error || !data || data.length === 0) {
        setProducts(mockProducts);
      } else {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.warn("Failed to fetch products:", err);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleLine = (lineId: string) => {
    if (lineId) window.open(`https://line.me/R/ti/p/~${lineId}`, '_blank', 'noopener,noreferrer');
  };

  const handleNavigate = (location: string) => {
    if (location) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank', 'noopener,noreferrer');
  };

  const filteredProducts = products.filter(p => {
    const matchCat =
      activeCategory === "all" ||
      (activeCategory === "gi" && p.is_gi) ||
      (activeCategory === "otop" && p.is_otop) ||
      (activeCategory === "sme" && p.is_sme) ||
      (p.category === activeCategory);

    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.seller?.shop_name && p.seller.shop_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCat && matchSearch;
  });

  const getStockLabel = (product: Product) => {
    if (product.stock_status === "low_stock") return language === "TH" ? "ใกล้หมด" : "Low stock";
    if (product.stock_status === "preorder") return language === "TH" ? "สั่งจอง" : "Preorder";
    if (product.stock_status === "sold_out" || product.in_stock === false) return language === "TH" ? "หมดชั่วคราว" : "Sold out";
    return language === "TH" ? "พร้อมขาย" : "In stock";
  };

  const getStockVariant = (product: Product): "default" | "secondary" | "destructive" | "outline" => {
    if (product.stock_status === "low_stock") return "secondary";
    if (product.stock_status === "preorder") return "outline";
    if (product.stock_status === "sold_out" || product.in_stock === false) return "destructive";
    return "default";
  };

  const getProductBadges = (product: Product) => [
    product.is_gi ? "GI" : null,
    product.is_otop ? "OTOP" : null,
    product.is_sme ? "SME" : null,
  ].filter(Boolean);

  const hasActiveFilters = activeCategory !== "all" || searchQuery.trim().length > 0;

  // ============================================================
  // PRODUCT DETAIL VIEW
  // ============================================================
  if (selectedProduct) {
    return (
      <div className="flex flex-col h-full w-full bg-background animate-fade-in-up">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-[calc(100px+env(safe-area-inset-bottom))]">
          {/* Image Hero */}
          <div className="relative h-64 bg-muted overflow-hidden shrink-0">
            {selectedProduct.image_url ? (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-16 h-16" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10" />
            <div className="absolute top-4 left-4 flex gap-1.5">
              {getProductBadges(selectedProduct).map((badge) => (
                <Badge key={badge} variant="secondary" className="text-[10px] font-bold px-2 py-0.5 h-auto backdrop-blur-xs bg-white/90 text-foreground border-0 shadow-sm">
                  {badge === "GI" && <Award className="size-3 text-amber-600 mr-0.5" />}
                  {badge}
                </Badge>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 size-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors cursor-pointer"
              aria-label={language === "TH" ? "ย้อนกลับ" : "Back"}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-foreground leading-snug">{selectedProduct.name}</h1>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {selectedProduct.seller?.shop_name || "-"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-2xl font-black text-primary">฿{selectedProduct.price}</span>
                  <span className="block text-[10px] text-muted-foreground font-medium">/{selectedProduct.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant={getStockVariant(selectedProduct)} className="text-[10px] font-bold px-2 py-0.5 h-auto">
                  {getStockLabel(selectedProduct)}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
                  {selectedProduct.category || (language === "TH" ? "สินค้าชุมชน" : "Community product")}
                </span>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed mt-4">
                {selectedProduct.description}
              </p>
            </div>

            {/* Seller Info */}
            {selectedProduct.seller && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Store className="size-4 text-primary" />
                  {language === "TH" ? "ร้านค้า" : "Shop"}
                </h3>

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-foreground">{selectedProduct.seller.shop_name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedProduct.seller.shop_location}</p>
                  </div>
                </div>

                {selectedProduct.is_gi && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex items-start gap-2.5 mt-4">
                    <Award className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[11px] font-bold text-amber-950 dark:text-amber-300">{language === "TH" ? "สินค้า GI พิชัย" : "Phichai GI Product"}</h5>
                      <p className="text-[10px] text-amber-800 dark:text-amber-400/80 mt-0.5 leading-snug">
                        {language === "TH"
                          ? "ยืนยันอัตลักษณ์พื้นถิ่นโดยผู้ค้า เพื่อส่งเสริมเศรษฐกิจชุมชน"
                          : "Verified local identity product supporting community economy"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Bar */}
        {selectedProduct.seller && (
          <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
            <div className="max-w-lg mx-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pointer-events-auto">
              <div className="bg-card shadow-lg shadow-black/10 border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => handleCall(selectedProduct.seller?.phone || "")}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 active:scale-95 transition-all py-2.5 text-[11px] font-bold cursor-pointer"
                    >
                      <PhoneCall className="size-3.5" />
                      {language === "TH" ? "โทร" : "Call"}
                    </button>
                    <button
                      onClick={() => handleLine(selectedProduct.seller?.line_id || "")}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#06C755] text-white hover:bg-[#06C755]/90 active:scale-95 transition-all py-2.5 text-[11px] font-bold shadow-sm cursor-pointer"
                    >
                      <MessageCircle className="size-3.5" />
                      LINE
                    </button>
                  </div>
                  <button
                    onClick={() => handleNavigate(selectedProduct.seller?.shop_location || "")}
                    className="size-10 flex items-center justify-center rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all cursor-pointer shrink-0"
                    aria-label={language === "TH" ? "นำทาง" : "Navigate"}
                  >
                    <Navigation className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // MAIN MARKETPLACE VIEW
  // ============================================================
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-x-hidden relative animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground px-4 pt-5 pb-4 relative z-10">
        <div className="absolute top-[-20%] right-[-15%] w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-white/8 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="size-9 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-full text-primary-foreground transition-colors cursor-pointer shrink-0 backdrop-blur-xs"
              aria-label={language === "TH" ? "ย้อนกลับ" : "Back"}
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate leading-tight">{language === "TH" ? "ตลาดชุมชน" : "Marketplace"}</h1>
              <p className="text-[10px] text-primary-foreground/70 truncate leading-tight">
                {language === "TH" ? "ของดีเมืองพิชัย ส่งตรงถึงคุณ" : "Local goods from Phichai"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsChatHistoryOpen(true)}
              className="size-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-primary-foreground transition-all active:scale-[0.96] cursor-pointer"
              aria-label={language === "TH" ? "ประวัติแชท" : "Chat history"}
            >
              <MessageSquare className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="size-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-primary-foreground transition-all active:scale-[0.96] cursor-pointer"
              aria-label={language === "TH" ? "ตะกร้าสินค้า" : "Shopping cart"}
            >
              <ShoppingCart className="size-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 px-3.5 bg-white/15 backdrop-blur-sm border border-white/10 rounded-full h-9 transition-all focus-within:bg-white/25 focus-within:border-white/30">
            <Search className="size-3.5 text-primary-foreground/60 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "TH" ? "ค้นหาสินค้าหรือร้านค้า..." : "Search products or shops..."}
              className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-primary-foreground placeholder:text-primary-foreground/50 shadow-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="flex items-center justify-center size-4 rounded-full bg-white/20 text-primary-foreground/70 text-[8px] font-bold hover:bg-white/30 transition-colors cursor-pointer shrink-0"
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "shrink-0 h-8 px-3.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                )}
              >
                {language === "TH" ? cat.labelTh : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Content */}
      <div className="flex-1 px-4 pt-4 pb-[calc(110px+env(safe-area-inset-bottom))] overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square w-full animate-pulse bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
                  <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-muted" />
                  <div className="pt-1 flex items-center justify-between">
                    <div className="h-4 w-14 animate-pulse rounded-full bg-primary/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center mt-4">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="size-7" />
            </div>
            <h3 className="text-sm font-extrabold text-foreground">
              {language === "TH" ? "ยังไม่พบสินค้าที่ตรงกัน" : "No matching products yet"}
            </h3>
            <p className="mt-1 max-w-[260px] text-xs font-medium leading-relaxed text-muted-foreground">
              {language === "TH" ? "ลองล้างคำค้นหา หรือเลือกหมวดทั้งหมดเพื่อดูสินค้า OTOP, GI และ SME ในพิชัย" : "Clear the search or switch to All to browse Phichai OTOP, GI, and SME products."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 font-bold text-xs px-5"
              >
                {language === "TH" ? "ดูสินค้าทั้งหมด" : "Show all products"}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                {language === "TH"
                  ? `พบ ${filteredProducts.length} รายการ`
                  : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="market-product-item bg-card border border-border rounded-xl overflow-hidden text-left active:scale-[0.98] transition-all cursor-pointer hover:border-primary/30 flex flex-col"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-400" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="size-8" /></div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {getProductBadges(product).slice(0, 2).map((badge) => (
                        <span key={badge} className="rounded-md bg-white/90 backdrop-blur-xs px-1.5 py-0.5 text-[7px] font-black text-foreground shadow-sm border-0">
                          {badge}
                        </span>
                      ))}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={cn(
                        "size-2 rounded-full block shadow-sm",
                        product.stock_status === "sold_out" || product.in_stock === false ? "bg-rose-500"
                        : product.stock_status === "low_stock" ? "bg-amber-500"
                        : "bg-emerald-500"
                      )} />
                    </div>
                  </div>
                  <div className="p-2.5 flex flex-col gap-1 flex-1">
                    <h3 className="text-[11px] font-bold text-foreground leading-snug line-clamp-2">{product.name}</h3>
                    <p className="text-[8px] text-muted-foreground flex items-center gap-1 truncate">
                      <Store className="size-2.5 shrink-0" />
                      <span className="truncate">{product.seller?.shop_name || "-"}</span>
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1.5 border-t border-border/50">
                      <div>
                        <span className="text-sm font-black text-primary">฿{product.price}</span>
                        <span className="text-[7px] text-muted-foreground ml-0.5">/{product.unit}</span>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {language === "TH" ? "ซื้อ" : "Buy"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-lg border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/80 rounded-t-3xl" />
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    {language === "TH" ? "ตะกร้าสินค้า" : "Shopping Cart"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
                  aria-label={language === "TH" ? "ปิด" : "Close"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  {language === "TH" ? "ฟีเจอร์ตะกร้าจะพร้อมใช้งานเร็ว ๆ นี้" : "Cart feature will be available soon"}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 px-4 leading-relaxed">
                  {language === "TH"
                    ? "คุณสามารถติดต่อร้านค้าโดยตรงผ่าน LINE หรือโทรศัพท์เพื่อสั่งซื้อสินค้าได้ทันทีในระหว่างรอฟีเจอร์นี้"
                    : "In the meantime, you can contact shops directly via LINE or phone to place your orders."}
                </p>
              </div>

              <Button
                variant="default"
                onClick={() => setIsCartOpen(false)}
                className="w-full font-bold text-xs py-3"
              >
                {language === "TH" ? "เข้าใจแล้ว" : "Got it"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      {isChatHistoryOpen && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-lg border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    {language === "TH" ? "ประวัติแชท" : "Chat History"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsChatHistoryOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
                  aria-label={language === "TH" ? "ปิด" : "Close"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  {language === "TH" ? "ประวัติการพูดคุยกับร้านค้าจะอยู่ที่นี่" : "Conversation history with shops will be here"}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 px-4 leading-relaxed">
                  {language === "TH"
                    ? "ฟีเจอร์บันทึกแชทและการพูดคุยในแอปจะพร้อมให้บริการในเร็ว ๆ นี้ ปัจจุบันท่านสามารถแชทผ่าน LINE แอดของร้านค้าได้เลย"
                    : "Built-in chat history is coming soon. For now, please chat with the shops directly via LINE."}
                </p>
              </div>

              <Button
                variant="default"
                onClick={() => setIsChatHistoryOpen(false)}
                className="w-full font-bold text-xs py-3"
              >
                {language === "TH" ? "ตกลง" : "OK"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
