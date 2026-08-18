import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, MapPin, Compass, Sparkles, ChevronRight, Calendar, Package, CloudSun, Home, Map, ShoppingBag, BookOpen, User, Star, Bed, Wand2, Stamp, Car, Store } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Attraction, Product, Accommodation } from "../types";
import { ATTRACTIONS, ACCOMMODATIONS } from "../data";
import { supabase } from "../lib/supabaseClient";
import { useLanguage } from "../i18n/LanguageContext";
import { getHomeWeather, type HomeWeatherData } from "../services/weatherService";
import { appMenuSearchItemsTH, appMenuSearchItemsEN } from "../utils/appSearch";
import { getDistanceKm, formatDistanceKm } from "../utils/distance";
import { EmptyState } from "./shared";

interface HomeViewProps {
  onSearchClick: () => void;
  onPlaceClick: (id: string) => void;
  onHeroClick: () => void;
  onOpenTripPlanner?: () => void;
  onAudioStoryClick: (attractionId: string) => void;
  onOpenPassport: () => void;
  isGuest?: boolean;
  displayName?: string;
  onOpenMarketplace?: () => void;
  onProductClick?: (productId: string) => void;
  locations?: Attraction[];
  accommodations?: Accommodation[];
  onOpenWeather: () => void;
  onOpenPlaceInMapDetail?: (placeId: string) => void;
  onOpenAccommodationInMapDetail?: (accommodationId: string) => void;
  onOpenLocationDetail?: (placeId: string) => void;
  onOpenScreen?: (screenId: number) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function HomeView({
  onSearchClick,
  onPlaceClick,
  onHeroClick,
  onOpenTripPlanner,
  onAudioStoryClick,
  onOpenPassport,
  isGuest = true,
  displayName = "คุณแมว",
  onOpenMarketplace,
  onProductClick,
  locations,
  accommodations,
  onOpenWeather,
  onOpenPlaceInMapDetail,
  onOpenAccommodationInMapDetail,
  onOpenLocationDetail,
  onOpenScreen,
  userLocation
}: HomeViewProps) {
  const { t, language } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const nearbyRef = useRef<HTMLDivElement>(null);
  const marketRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = [headerRef, heroRef, quickActionsRef, nearbyRef, marketRef, eventsRef].filter(r => r.current);
      gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });

      sections.slice(1).forEach((ref) => {
        if (!ref.current) return;
        gsap.fromTo(ref.current,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.5, ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start: "top 88%", toggleActions: "play none none none", invalidateOnRefresh: true, scroller: "#home-screen" }
          }
        );
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const sections = [headerRef, heroRef, quickActionsRef, nearbyRef, marketRef, eventsRef].filter(r => r.current);
      sections.forEach((ref) => { gsap.set(ref.current, { y: 0, opacity: 1 }); });
    });
    return () => { mm.revert(); };
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  const allPlaces = locations && locations.length > 0 ? locations : ATTRACTIONS;
  const allAccommodations = accommodations && accommodations.length > 0 ? accommodations : ACCOMMODATIONS;

  const recommendedPlaces = useMemo(() => {
    if (userLocation) {
      const withDistance = allPlaces.map((place) => ({
        place,
        distanceKm: getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng),
      }));
      withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      return withDistance.slice(0, 6).map((item) => ({
        ...item.place,
        computedDistance: formatDistanceKm(item.distanceKm, language),
      }));
    }
    return allPlaces.slice(0, 6).map((p) => ({ ...p, computedDistance: p.distance }));
  }, [allPlaces, userLocation, language]);

  useEffect(() => { ScrollTrigger.refresh(); }, [recommendedPlaces.length, locations?.length]);

  const renderMenuIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      home: <Home className="size-5" />,
      map: <Map className="size-5" />,
      compass: <Compass className="size-5" />,
      "shopping-bag": <ShoppingBag className="size-5" />,
      "cloud-sun": <CloudSun className="size-5" />,
      user: <User className="size-5" />,
      "book-open": <BookOpen className="size-5" />,
    };
    return iconName && icons[iconName] ? icons[iconName] : <MapPin className="size-5" />;
  };

  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isGlobalSearchFocused, setIsGlobalSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchDropdownStyle, setSearchDropdownStyle] = useState<React.CSSProperties | null>(null);

  const measureSearchPosition = useCallback(() => {
    if (searchContainerRef.current) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setSearchDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    }
  }, []);

  useEffect(() => {
    if (!isGlobalSearchFocused) return;
    const handle = () => measureSearchPosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [isGlobalSearchFocused, measureSearchPosition]);

  const menuItems = useMemo(() => language === "TH" ? appMenuSearchItemsTH : appMenuSearchItemsEN, [language]);

  const locationSearchItems = useMemo(() => {
    return allPlaces.map((place) => ({
      id: `place-${place.id}`,
      type: "place" as const,
      title: place.name,
      subtitle: place.locationCategory || "สถานที่ท่องเที่ยว",
      imageUrl: place.image,
      keywords: [place.name, place.desc, place.locationCategory, place.historySummary, place.culturalHighlights, place.bestTime, place.needToKnow].filter(Boolean).join(" "),
      place
    }));
  }, [allPlaces]);

  const globalSearchResults = useMemo(() => {
    const query = globalSearchQuery.trim().toLowerCase();
    if (!query) return [];
    const matchedMenus = menuItems.filter((item) => [item.title, item.subtitle, ...item.keywords].join(" ").toLowerCase().includes(query));
    const matchedPlaces = locationSearchItems.filter((item) => [item.title, item.subtitle, item.keywords].join(" ").toLowerCase().includes(query));
    const scoredMenus = matchedMenus.map(m => ({ item: m, score: m.title.toLowerCase() === query ? 100 : m.title.toLowerCase().startsWith(query) ? 80 : m.title.toLowerCase().includes(query) ? 60 : 10 }));
    const scoredPlaces = matchedPlaces.map(p => ({ item: p, score: p.title.toLowerCase() === query ? 100 : p.title.toLowerCase().startsWith(query) ? 80 : p.title.toLowerCase().includes(query) ? 60 : 10 }));
    scoredMenus.sort((a, b) => b.score - a.score);
    scoredPlaces.sort((a, b) => b.score - a.score);
    return [...scoredMenus.map(m => m.item).slice(0, 5), ...scoredPlaces.map(p => p.item).slice(0, 8)].slice(0, 10);
  }, [globalSearchQuery, menuItems, locationSearchItems]);

  const handleGlobalSearchSelect = (item: any) => {
    setGlobalSearchQuery("");
    setIsGlobalSearchFocused(false);
    if (item.type === "place") {
      if (onOpenLocationDetail) { onOpenLocationDetail(item.place.id); return; }
      onPlaceClick(item.place.id);
      return;
    }
    if (item.action === "trip-planner") { onOpenTripPlanner?.(); return; }
    if (item.action === "marketplace") { onOpenMarketplace?.(); return; }
    if (item.action === "weather") { onOpenWeather?.(); return; }
    if (item.action === "passport") { onOpenPassport?.(); return; }
    if (onOpenScreen) onOpenScreen(item.screenId);
  };

  const localEvents = [
    {
      id: "e1",
      title: language === "TH" ? "เทศกาลกินไส้กรอกใหญ่ & ของดีเมืองพิชัย" : "Big Sausage Festival & Phichai Best Goods",
      date: language === "TH" ? "วันนี้ - 5 มิ.ย." : "Today - Jun 5",
      place: language === "TH" ? "ลานหน้าศาลวงเวียนใหม่" : "New Shrine Circle Plaza",
      image: allPlaces.find(a => a.id === "new_market")?.image || "https://images.unsplash.com/photo-1488459719751-411263fd836a?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "e2",
      title: language === "TH" ? "งานจำลองประชันมวยไทยโบราณมิ่งทองดี" : "Thongdee Muay Thai Traditional Showmatch",
      date: language === "TH" ? "สุดสัปดาห์นี้" : "This Weekend",
      place: language === "TH" ? "อนุสรณ์สถานบ้านเกิด" : "Patriot Birthplace Memorial",
      image: allPlaces.find(a => a.id === "monument")?.image || "https://storage.googleapis.com/tongdee-go/Phichai_home_monument.jpg"
    }
  ];

  const [availableTaxiCount, setAvailableTaxiCount] = useState<number>(0);
  const [homeWeather, setHomeWeather] = useState<HomeWeatherData | null>(null);
  const [homeWeatherLoading, setHomeWeatherLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    getHomeWeather().then(data => { if (alive) setHomeWeather(data); }).catch(() => {}).finally(() => { if (alive) setHomeWeatherLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    async function fetchTaxiCount() {
      try {
        const { count } = await supabase.from("local_taxi_drivers").select("*", { count: "exact", head: true }).eq("is_active", true).eq("available_now", true);
        if (count !== null) setAvailableTaxiCount(count);
      } catch (e) { console.error(e); }
    }
    fetchTaxiCount();
  }, []);

  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [previewProductsLoading, setPreviewProductsLoading] = useState(false);
  const [previewProductsError, setPreviewProductsError] = useState<string | null>(null);
  const [marketplaceStats, setMarketplaceStats] = useState({ products: 0, sellers: 0 });

  useEffect(() => {
    let alive = true;
    async function loadPreviewProducts() {
      try {
        setPreviewProductsLoading(true);
        setPreviewProductsError(null);
        const { data, error } = await supabase.from('marketplace_products').select(`*, seller:marketplace_sellers(*)`).eq('is_active', true).eq('approval_status', 'approved').limit(30);
        if (error) throw error;
        let productsList = (data || []) as Product[];
        productsList = productsList.filter(p => p.seller && p.seller.is_active);
        const uniqueSellerIds = new Set(productsList.map(p => p.seller?.id).filter(Boolean));
        if (alive) setMarketplaceStats({ products: productsList.length, sellers: uniqueSellerIds.size });
        const shuffled = productsList.sort(() => Math.random() - 0.5);
        if (alive) setPreviewProducts(shuffled.slice(0, 2));
      } catch (err) {
        if (alive) setPreviewProductsError(language === "TH" ? "ไม่สามารถโหลดสินค้าแนะนำได้" : "Failed to load recommended products");
      } finally { if (alive) setPreviewProductsLoading(false); }
    }
    loadPreviewProducts();
    return () => { alive = false; };
  }, [language]);

  useEffect(() => {
    if (previewProducts.length > 0) {
      gsap.fromTo(".market-product-card",
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: "power3.out" }
      );
    }
    ScrollTrigger.refresh();
  }, [previewProducts.length, previewProductsLoading]);

  useEffect(() => {
    if (previewProductsLoading) {
      gsap.fromTo(".market-skeleton",
        { opacity: 0.3 },
        { opacity: 1, duration: 0.8, repeat: -1, yoyo: true, ease: "power1.inOut" }
      );
    }
  }, [previewProductsLoading]);

  const quickActions = [
    {
      key: "trip-planner",
      icon: <Wand2 className="size-5" />,
      label: language === "TH" ? "วางแผนเที่ยว" : "Trip Planner",
      desc: language === "TH" ? "AI ออกแบบให้" : "AI-powered",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30",
      onClick: onOpenTripPlanner,
    },
    {
      key: "hotels",
      icon: <Bed className="size-5" />,
      label: language === "TH" ? "ที่พัก" : "Hotels",
      desc: language === "TH" ? "โรงแรม โฮมสเตย์" : "Hotels & stays",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30",
      onClick: () => onOpenScreen?.(29),
    },
    {
      key: "passport",
      icon: <Stamp className="size-5" />,
      label: language === "TH" ? "พาสปอร์ต" : "Passport",
      desc: language === "TH" ? "สะสมสแตมป์" : "Collect stamps",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30",
      onClick: onOpenPassport,
    },
    {
      key: "taxi",
      icon: <Car className="size-5" />,
      label: language === "TH" ? " taxi" : "Local Taxi",
      desc: availableTaxiCount > 0
        ? (language === "TH" ? `ว่าง ${availableTaxiCount} คัน` : `${availableTaxiCount} available`)
        : (language === "TH" ? "เรียกเลย" : "Call now"),
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30",
      onClick: () => onOpenScreen?.(21),
    },
  ];

  return (
    <div id="home-screen" className="flex flex-col h-full w-full bg-background pb-[calc(96px+env(safe-area-inset-bottom))] overflow-y-auto">
      {/* Header: Greeting + Weather + Search */}
      <div ref={headerRef} className="px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-muted-foreground/70 tracking-wide block leading-none mb-1">{t("home.welcomePrefix")}</span>
            <h1 className="text-xl font-bold text-foreground truncate">
              {isGuest ? t("home.greetingGuest") : displayName}
            </h1>
          </div>
          <button
            type="button"
            onClick={onOpenWeather}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors shrink-0 cursor-pointer"
            aria-label="open weather"
          >
            <CloudSun className="size-4 text-amber-400" />
            {homeWeather?.temperature != null ? `${Math.round(homeWeather.temperature)}°` : (language === "TH" ? "อากาศ" : "Weather")}
          </button>
        </div>

        {/* Search Bar */}
        <div ref={searchContainerRef} className="relative">
          <div className="flex items-center gap-2.5 px-4 bg-card border border-border rounded-xl transition-all duration-150 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary h-10">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => { setIsGlobalSearchFocused(true); measureSearchPosition(); }}
              onBlur={() => { setTimeout(() => setIsGlobalSearchFocused(false), 200); }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && globalSearchResults.length > 0) { event.preventDefault(); handleGlobalSearchSelect(globalSearchResults[0]); }
                if (event.key === "Escape") setIsGlobalSearchFocused(false);
              }}
              placeholder={t("home.searchPlaceholder")}
              className="border-none bg-transparent shadow-none text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 h-9"
            />
            {globalSearchQuery && (
              <button type="button" onClick={() => setGlobalSearchQuery("")} className="flex items-center justify-center size-5 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-[10px] font-extrabold transition-all shrink-0 cursor-pointer" aria-label="clear search">&times;</button>
            )}
          </div>

          {isGlobalSearchFocused && globalSearchQuery.trim() && searchDropdownStyle && ReactDOM.createPortal(
            <div style={searchDropdownStyle} className="z-[99999] max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-xl animate-fade-in">
              {globalSearchResults.length > 0 ? (
                <div className="space-y-0.5">
                  {globalSearchResults.map((item) => (
                    <button key={item.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleGlobalSearchSelect(item)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-accent active:scale-[0.99] border border-transparent hover:border-border cursor-pointer">
                      {item.type === "place" && item.imageUrl ? (
                        <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                          {renderMenuIcon(item.iconName)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-foreground">{item.title}</p>
                          <Badge variant={item.type === "place" ? "outline" : "secondary"} className="shrink-0 text-[9px] font-bold px-2 py-0.5 h-auto rounded-full">
                            {item.type === "place" ? (language === "TH" ? "สถานที่" : "Place") : (language === "TH" ? "เมนู" : "Menu")}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Search className="size-8" />} title={language === "TH" ? "ไม่พบผลลัพธ์การค้นหา" : "No results found"} description={language === "TH" ? "ลองค้นหาด้วยคำอื่น เช่น 'วัด', 'ตลาด', 'อากาศ'" : "Try other keywords like 'temple', 'market', 'weather'"} />
              )}
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Discover Hero */}
      <div ref={heroRef} className="px-4 mb-5">
        <button
          type="button"
          onClick={onHeroClick ?? onOpenTripPlanner}
          className="relative block w-full text-left h-44 rounded-2xl overflow-hidden shadow-md cursor-pointer group active:scale-[0.99] transition-transform duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src="https://storage.googleapis.com/tongdee-go/trip_photo.jpg"
            alt="Discover Phichai"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-40% to-transparent" />
          <Badge className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 h-auto gap-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 hover:bg-white/30">
            <Sparkles className="size-3" />
            <span>{t("home.heroTag")}</span>
          </Badge>
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <span className="text-[11px] font-medium text-amber-300 tracking-wide">{language === "TH" ? "ค้นพบเมืองพิชัย" : "Discover Phichai"}</span>
            <h3 className="text-lg font-bold mt-0.5 leading-tight text-white">{t("home.heroTitle")}</h3>
            <p className="text-xs text-white/60 font-light mt-1 line-clamp-1">
              {language === "TH" ? "วัดหน้าพระธาตุ - ชิมขนมวงคุณยาย - ตะลุยเมืองเกิดทองดีฟันขาว" : "Wat Na Phra That - Local sweet donuts - Birthplace of Phraya Phichai"}
            </p>
          </div>
          <div className="absolute right-3 bottom-4 size-8 bg-white/20 group-hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all group-hover:translate-x-0.5">
            <ChevronRight className="size-4" />
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div ref={quickActionsRef} className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-2.5 xl:grid-cols-8">
          {quickActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer active:scale-[0.97]"
              title={action.desc}
            >
              <div className={`flex items-center justify-center size-10 rounded-xl ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-[10px] font-bold text-foreground text-center leading-tight">{action.label}</span>
              <span className="text-[8px] text-muted-foreground text-center leading-none">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Places */}
      <div ref={nearbyRef} className="mt-5 mb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">{t("home.nearbyTitle")}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {userLocation
                ? (language === "TH" ? "ใกล้คุณที่สุด" : "Closest to you")
                : (language === "TH" ? "สถานที่น่าสนใจ" : "Popular spots")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenScreen?.(8)}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            {language === "TH" ? "ดูทั้งหมด" : "See all"}
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        {recommendedPlaces.length === 0 ? (
          <div className="mx-4 rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <Compass className="size-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-bold text-foreground">{language === "TH" ? "ไม่มีสถานที่ใกล้เคียง" : "No nearby places found"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{language === "TH" ? "ลองซูมออกหรือเปลี่ยนตำแหน่งของคุณ" : "Try zooming out or changing your location"}</p>
          </div>
        ) : (
          <div className="flex gap-3 px-4 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden 2xl:flex-wrap 2xl:overflow-visible">
            {recommendedPlaces.slice(0, 8).map((place, i) => (
              <button
                key={place.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); if (onOpenLocationDetail) onOpenLocationDetail(place.id); else if (onOpenPlaceInMapDetail) onOpenPlaceInMapDetail(place.id); else onPlaceClick(place.id); }}
                className="nearby-card flex-shrink-0 w-[155px] sm:w-[190px] lg:w-[210px] bg-card rounded-2xl border border-border overflow-hidden cursor-pointer active:scale-[0.97] transition-all text-left focus:outline-none flex flex-col hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 group"
              >
                <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden shrink-0">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {place.locationCategory && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[8px] font-bold text-foreground rounded-md shadow-sm">
                      {place.locationCategory}
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold rounded-md">
                    <Star className="size-2.5 fill-amber-400 text-amber-400" />
                    {place.rating}
                  </span>
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold rounded-md">
                    <MapPin className="size-2.5 shrink-0" />
                    <span>{place.computedDistance || place.distance}</span>
                  </span>
                </div>
                <div className="p-2.5 flex flex-col gap-0.5 min-w-0">
                  <span className="text-[11px] font-bold text-foreground leading-tight line-clamp-1">{place.name}</span>
                  <span className="text-[9px] text-muted-foreground line-clamp-1 leading-snug">{place.desc || place.locationCategory || ""}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Marketplace */}
      <div ref={marketRef} className="px-4 mb-5">
        <div onClick={onOpenMarketplace} className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-background border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-all active:scale-[0.99]">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm">
                  <Package className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{language === "TH" ? "ตลาดชุมชนพิชัย" : "Phichai Marketplace"}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">{language === "TH" ? "ของดี OTOP ของฝาก ของสด" : "Local products & OTOP specialties"}</p>
                </div>
              </div>
              <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ChevronRight className="size-4" />
              </div>
            </div>
          </div>

          {previewProductsLoading && (
            <div className="px-4 pb-4">
              <div className="flex gap-2.5">
                <div className="flex-1 rounded-xl bg-muted p-3">
                  <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-3 w-2/3 mt-2" />
                  <Skeleton className="h-2.5 w-1/2 mt-1.5" />
                </div>
                <div className="flex-1 rounded-xl bg-muted p-3">
                  <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-3 w-3/4 mt-2" />
                  <Skeleton className="h-2.5 w-1/3 mt-1.5" />
                </div>
              </div>
            </div>
          )}

          {previewProductsError && (
            <div className="px-4 pb-4">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 p-3.5 text-center">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{previewProductsError}</p>
              </div>
            </div>
          )}

          {!previewProductsLoading && !previewProductsError && previewProducts.length === 0 && (
            <div className="px-4 pb-4">
              <div className="rounded-xl bg-muted/50 p-5 text-center border border-dashed border-border">
                <Package className="size-6 text-muted-foreground/40 mx-auto mb-1.5" />
                <p className="text-[11px] font-bold text-muted-foreground">{language === "TH" ? "ยังไม่มีสินค้าแนะนำในตอนนี้" : "No products available yet"}</p>
              </div>
            </div>
          )}

          {!previewProductsLoading && !previewProductsError && previewProducts.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex gap-3">
                {previewProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); onProductClick?.(p.id); }}
                    className="market-product-card flex-1 min-w-0 bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors active:scale-[0.98] group"
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[9px] font-bold">{language === "TH" ? "ไม่มีรูป" : "No Image"}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <Badge className="absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 h-auto rounded-md border-0 shadow-sm">
                        {p.is_gi ? "GI" : p.is_otop ? "OTOP" : p.is_sme ? "SME" : p.category === "food" ? (language === "TH" ? "อาหาร" : "Food") : p.category === "craft" ? (language === "TH" ? "หัตถกรรม" : "Craft") : (language === "TH" ? "ของฝาก" : "Souvenir")}
                      </Badge>
                    </div>
                    <div className="p-2.5">
                      <h5 className="text-[11px] font-bold text-foreground line-clamp-1">{p.name}</h5>
                      <p className="text-[8px] text-muted-foreground mt-0.5 truncate">{p.seller?.shop_name || (language === "TH" ? "ร้านค้าชุมชน" : "Local shop")}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {p.price ? (
                          <span className="text-[11px] font-black text-foreground">฿{p.price}</span>
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground">{language === "TH" ? "สอบถามราคา" : "Ask for price"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {marketplaceStats.products > 0 && (
                <div className="mt-3 flex items-center justify-center gap-3 text-[9px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="size-2.5" />
                    {marketplaceStats.products}
                  </span>
                  <span className="size-0.5 rounded-full bg-muted-foreground/30" />
                  <span className="flex items-center gap-1">
                    <Store className="size-2.5" />
                    {marketplaceStats.sellers}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Local Events */}
      <div ref={eventsRef} className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">{t("home.todayEvents")}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{language === "TH" ? "กิจกรรมและเทศกาลในพื้นที่" : "Local events & festivals"}</p>
          </div>
        </div>
        {localEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <Calendar className="size-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-bold text-foreground">{language === "TH" ? "ไม่มีกิจกรรมวันนี้" : "No events today"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{language === "TH" ? "กลับมาตรวจสอบอีกครั้งพรุ่งนี้" : "Check back again tomorrow"}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {localEvents.map((event) => (
              <div key={event.id} className="p-3.5 bg-card border border-border rounded-xl flex gap-3 relative overflow-hidden items-center cursor-pointer hover:border-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant="destructive" className="text-[8px] font-bold px-1.5 py-0.5 h-auto rounded-sm border-0">LIVE</Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" /> {event.date}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold text-foreground leading-tight line-clamp-2">{event.title}</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-0.5 truncate">
                    <MapPin className="size-2.5 text-destructive shrink-0" /> <span className="truncate">{event.place}</span>
                  </p>
                </div>
                <div className="size-14 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
