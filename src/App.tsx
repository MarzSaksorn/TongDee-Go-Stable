import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { 
  Home, 
  Compass, 
  Map as MapIcon, 
  MessageSquare, 
  User, 
  Shield, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  X, 
  Award,
  BookOpen,
  Settings,
  HelpCircle,
  Smartphone,
  ArrowLeft,
  CarFront,
  Star
} from "lucide-react";
import gsap from "gsap";

import { Attraction, ChatMessage, ItineraryItem, Badge, TripPlanResult, Accommodation } from "./types";
import { ATTRACTIONS, STAMPS, BADGES, DEFAULT_ITINERARY } from "./data";
import { supabase } from "./lib/supabaseClient";
import { fetchTourismLocations } from "./services/locationService";
import { fetchAccommodations } from "./services/accommodationService";

// Import custom screen views
// Entry-path screens stay eager; everything else is code-split so the
// initial bundle only carries the splash/onboarding/home/auth shell.
import SplashView from "./components/SplashView";
import OnboardingView from "./components/OnboardingView";
import HomeView from "./components/HomeView";
import { ToastProvider, useToast } from "./components/ToastProvider";
import AuthScreens from "./components/AuthScreens";
import ProfileView from "./components/ProfileView";
import FloatingChatBubble from "./components/FloatingChatBubble";
import { AppearanceSettingsView } from "./components/AppearanceSettingsView";
import { WeatherView } from "./components/WeatherView";

const AITripPlannerView = lazy(() => import("./components/AITripPlannerView"));
const TripDetailPlanView = lazy(() => import("./components/TripDetailPlanView"));
const PlaceDetailView = lazy(() => import("./components/PlaceDetailView"));
const LocationDetailFullScreenView = lazy(() => import("./components/LocationDetailFullScreenView"));
const MapView = lazy(() => import("./components/MapView"));
const AIChatTravelBuddyView = lazy(() => import("./components/AIChatTravelBuddyView"));
const DigitalPassportView = lazy(() => import("./components/DigitalPassportView"));
const SafetyModeView = lazy(() => import("./components/SafetyModeView"));
const QRCheckInView = lazy(() => import("./components/QRCheckInView"));
const TravelDiaryView = lazy(() => import("./components/TravelDiaryView"));
const LocalShopDetailView = lazy(() => import("./components/LocalShopDetailView"));
const AIRouteResultView = lazy(() => import("./components/AIRouteResultView"));
const LocalTaxiView = lazy(() => import("./components/LocalTaxiView"));
const TaxiProviderRegisterView = lazy(() => import("./components/TaxiProviderRegisterView"));
const LocalMarketplaceView = lazy(() => import("./components/LocalMarketplaceView"));
const MarketplaceSellerRegisterView = lazy(() => import("./components/MarketplaceSellerRegisterView"));
const AccommodationOwnerRegisterView = lazy(() => import("./components/AccommodationOwnerRegisterView"));
const AdminPanelView = lazy(() => import("./components/AdminPanelView"));
const HotelSelectionView = lazy(() => import("./components/HotelSelectionView"));
const ActiveTripView = lazy(() => import("./components/ActiveTripView"));
const SavedPlacesView = lazy(() => import("./components/SavedPlacesView"));
import { useLanguage } from "./i18n/LanguageContext";
import { SCREENS, isGuestSafeScreen } from "./router/screens";
import { addGuestCheckin, addGuestStamp, getGuestCheckins, clearGuestData } from "./services/guestStore";
import { loadSavedItems, saveItem, removeSavedItem, migrateGuestSavedToAccount, type SavedItem } from "./services/savedService";

const CURRENT_SCREEN_KEY = "tongdee_current_screen";
const SHOW_FLOATING_ASK_AI_BUTTON = false;

function isRestorableScreen(screen: number) {
  return SCREENS[screen]?.restorable ?? false;
}

function saveCurrentScreen(screen: number) {
  if (!isRestorableScreen(screen)) return;
  sessionStorage.setItem(CURRENT_SCREEN_KEY, String(screen));
}

function getSavedScreen() {
  const raw = sessionStorage.getItem(CURRENT_SCREEN_KEY);
  const screen = raw ? Number(raw) : null;
  if (typeof screen !== "number" || Number.isNaN(screen)) {
    return null;
  }
  return screen;
}

export default function App() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  // Screen Router state: numbers 1 to 21
  const [currentScreen, setCurrentScreen] = useState<number>(() => {
    const saved = getSavedScreen();
    return (saved !== null && isRestorableScreen(saved)) ? saved : 1;
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [isMapDetailOpen, setIsMapDetailOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mapBtnRef = useRef<HTMLButtonElement>(null);
  const [activeShopName, setActiveShopName] = useState<string>("");
  const [initialProductId, setInitialProductId] = useState<string | null>(null);

  const handleScrollCapture = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const currentY = target.scrollTop;

    if (currentY > lastScrollYRef.current + 8) {
      setShowChatBubble(false);
    } else if (currentY < lastScrollYRef.current - 8) {
      setShowChatBubble(true);
    }
    
    lastScrollYRef.current = Math.max(currentY, 0);
  };
  const [activePlaceId, setActivePlaceId] = useState<string>("wat_mahathat");
  const [hasOpenedMap, setHasOpenedMap] = useState<boolean>(false);
  const [mapSelectedPlace, setMapSelectedPlace] = useState<Attraction | null>(null);
  const [returnToMapWithPreview, setReturnToMapWithPreview] = useState<boolean>(false);
  const [previousScreen, setPreviousScreen] = useState<number>(4);
  const [isHighDpiCompact, setIsHighDpiCompact] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const [homeDetailPlaceId, setHomeDetailPlaceId] = useState<string | null>(null);

  const openHomeLocationDetail = React.useCallback((placeId: string) => {
    setHomeDetailPlaceId(placeId);
  }, []);

  const closeHomeLocationDetail = React.useCallback(() => {
    setHomeDetailPlaceId(null);
  }, []);

  const [pendingMapPlaceId, setPendingMapPlaceId] = React.useState<string | null>(null);
  const [pendingMapAccommodationId, setPendingMapAccommodationId] = React.useState<string | null>(null);
  const [pendingMapOpenMode, setPendingMapOpenMode] = React.useState<"compact" | "detail">("detail");

  const openHomePlaceInMapDetail = React.useCallback((placeId: string) => {
    setPendingMapPlaceId(placeId);
    setPendingMapAccommodationId(null);
    setPendingMapOpenMode("detail");
    setHasOpenedMap(true);
    setCurrentScreen(8);
  }, []);

  const openHomeAccommodationInMapDetail = React.useCallback((accommodationId: string) => {
    setPendingMapAccommodationId(accommodationId);
    setPendingMapPlaceId(null);
    setPendingMapOpenMode("detail");
    setHasOpenedMap(true);
    setCurrentScreen(8);
  }, []);

  const handleHotelSelect = React.useCallback((accommodationId: string) => {
    setPendingMapAccommodationId(accommodationId);
    setPendingMapPlaceId(null);
    setPendingMapOpenMode("detail");
    setHasOpenedMap(true);
    setCurrentScreen(8);
  }, []);

  const handlePendingPlaceHandled = React.useCallback(() => {
    setPendingMapPlaceId(null);
  }, []);

  const handleMapSelectedPlaceChange = React.useCallback((place: Attraction | null) => {
    setMapSelectedPlace(place);
  }, []);

  const handlePendingAccommodationHandled = React.useCallback(() => {
    setPendingMapAccommodationId(null);
  }, []);

  // Tourism locations dynamic state & fetcher
  const [locations, setLocations] = useState<Attraction[]>([]);
  const [locationsLoading, setLocationsLoading] = useState<boolean>(true);

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [accommodationsLoading, setAccommodationsLoading] = useState<boolean>(true);

  const handleOpenMapLocation = React.useCallback((placeId: string) => {
    const found = locations.find(loc => loc.id === placeId);
    if (found) {
      setMapSelectedPlace(found);
      setPendingMapPlaceId(placeId);
      setPendingMapOpenMode("detail");
      setHasOpenedMap(true);
      setCurrentScreen(8);
    }
  }, [locations]);

  const loadLocations = async () => {
    setLocationsLoading(true);
    const data = await fetchTourismLocations();
    setLocations(data);
    setLocationsLoading(false);
  };

  const loadAccommodations = async () => {
    setAccommodationsLoading(true);
    const data = await fetchAccommodations();
    setAccommodations(data);
    setAccommodationsLoading(false);
  };

  useEffect(() => {
    loadLocations();
    loadAccommodations();
  }, []);

  useEffect(() => {
    if (currentScreen !== 8 && isMapDetailOpen) {
      setIsMapDetailOpen(false);
    }
  }, [currentScreen, isMapDetailOpen]);

  // Silent user geolocation fetch on mount (shared with HomeView + MapView)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
      );
    }
  }, []);

  const onLocateUser = useCallback((loc: { lat: number; lng: number }) => {
    setUserLocation(loc);
  }, []);

  // User Authentication & Account management state
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; emailOrPhone: string } | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true); // Defaults to true, can bypass or log in
  const [showGuestLockModal, setShowGuestLockModal] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // Initial fetch of session from Supabase
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("owner_id", session.user.id)
            .maybeSingle();

          setCurrentUser({
            name: profile?.display_name || "นักท่องเที่ยว",
            emailOrPhone: session.user.email || ""
          });
          setIsGuest(false);

          // Fetch user's persistent stamp check-ins
          const { data: dbCheckins } = await supabase
            .from("checkins")
            .select("place_id")
            .eq("user_id", session.user.id);

          if (dbCheckins && dbCheckins.length > 0) {
            const checkinList = dbCheckins.map((c) => c.place_id);
            const merged = Array.from(new Set(["wat_mahathat", ...checkinList]));
            setCheckedInIds(merged);
          }

          // Restore screen if restorable and saved, else default to Home (4)
          const saved = getSavedScreen();
          if (saved !== null && isRestorableScreen(saved)) {
            setCurrentScreen(saved);
          } else {
            setCurrentScreen(4);
          }
        } else {
          // No session, check if there is a saved screen we can restore for guest
          setIsGuest(true);
          setCurrentUser(null);

          // Restore guest-mode progress from localStorage
          const guestCheckins = getGuestCheckins();
          if (guestCheckins.length > 0) {
            setCheckedInIds(guestCheckins);
          }

          const saved = getSavedScreen();
          if (saved !== null && isRestorableScreen(saved) && isGuestSafeScreen(saved)) {
            setCurrentScreen(saved);
          }
        }

        // Load saved places & hotels (uses the DB for accounts, localStorage for guests)
        const savedItems = await loadSavedItems();
        if (mounted) {
          setSavedItems(savedItems);
        }
      } catch (err) {
        console.error("Failed to restore auth session:", err);
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };
    initAuth();

    // Listen to changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("owner_id", session.user.id)
          .maybeSingle();

        setCurrentUser({
          name: profile?.display_name || "นักท่องเที่ยว",
          emailOrPhone: session.user.email || ""
        });
        setIsGuest(false);

        // Migrate any guest-mode progress into the account, then fetch the
        // now-complete check-in list (migration runs before the read).
        const guestCheckins = getGuestCheckins();
        if (guestCheckins.length > 0) {
          for (const placeId of guestCheckins) {
            try {
              await supabase.from("checkins").insert({
                user_id: session.user.id,
                place_id: placeId,
                checkin_method: "gps"
              });
              await supabase.from("digital_passport_stamps").insert({
                user_id: session.user.id,
                place_id: placeId,
                stamp_code: `STAMP_${placeId.toUpperCase()}`
              }).select().maybeSingle();
            } catch (err) {
              console.error("Failed to migrate guest check-in:", err);
            }
          }
          clearGuestData();
        }

        // Fetch user's persistent stamp check-ins
        const { data: dbCheckins } = await supabase
          .from("checkins")
          .select("place_id")
          .eq("user_id", session.user.id);

        if (dbCheckins && dbCheckins.length > 0) {
          const checkinList = dbCheckins.map((c) => c.place_id);
          const merged = Array.from(new Set(["wat_mahathat", ...checkinList]));
          setCheckedInIds(merged);
        }

        // Migrate any guest-mode saved places/hotels into the account
        const migratedSaved = await migrateGuestSavedToAccount();
        if (migratedSaved.length > 0) {
          setSavedItems((prev) => {
            const merged = [...prev, ...migratedSaved];
            return Array.from(new Map(merged.map((m) => [`${m.kind}:${m.id}`, m])).values());
          });
        }

        // Only redirect of state if not on a restorable screen already
        setCurrentScreen((prevScreen) => {
          if (!isRestorableScreen(prevScreen)) {
            const saved = getSavedScreen();
            return (saved !== null && isRestorableScreen(saved)) ? saved : 4;
          }
          return prevScreen;
        });
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setIsGuest(true);
        setCheckedInIds(["wat_mahathat"]);
        setSavedItems([]);
        sessionStorage.removeItem(CURRENT_SCREEN_KEY);
        setCurrentScreen(17); // Go back to welcome
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isGuest || isGuestSafeScreen(currentScreen)) {
      saveCurrentScreen(currentScreen);
    }
  }, [currentScreen, isGuest]);

  const toggleSaved = useCallback(async (kind: "place" | "hotel", id: string) => {
    const alreadySaved = savedItems.some((item) => item.kind === kind && item.id === id);
    setSavedItems((prev) =>
      alreadySaved
        ? prev.filter((item) => !(item.kind === kind && item.id === id))
        : [...prev, { kind, id }]
    );

    try {
      if (alreadySaved) {
        await removeSavedItem(kind, id);
      } else {
        await saveItem(kind, id);
      }
    } catch (err) {
      console.error("Failed to update saved item:", err);
      setSavedItems((prev) =>
        alreadySaved
          ? [...prev, { kind, id }]
          : prev.filter((item) => !(item.kind === kind && item.id === id))
      );
      showToast("บันทึกไม่สำเร็จ โปรดตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง", "error");
    }
  }, [savedItems, showToast]);

  useEffect(() => {
    if (currentScreen === 8) {
      setHasOpenedMap(true);
    }
  }, [currentScreen]);

  // Admin panel is off-limits to guests even if a stale screen id is restored
  useEffect(() => {
    if (currentScreen === 40 && isGuest) {
      setShowGuestLockModal(true);
      setCurrentScreen(12);
    }
  }, [currentScreen, isGuest]);

  // Synchronize screen navigation history
  const [screenHistory, setScreenHistory] = useState<number[]>([1]);

  useEffect(() => {
    setScreenHistory((prev) => {
      // Do nothing if the screen hasn't changed from the top of the stack
      if (prev[prev.length - 1] === currentScreen) {
        return prev;
      }
      
      // If the new screen matches second-to-last, we popped back. Return popped stack of screens.
      if (prev.length > 1 && prev[prev.length - 2] === currentScreen) {
        return prev.slice(0, -1);
      }

      // Root tab, splash and authentication screens reset/initialize history to keep it light
      if ([1, 4, 8, 9, 12, 17].includes(currentScreen)) {
        return [currentScreen];
      }

      // Otherwise, keep growing history
      return [...prev, currentScreen];
    });
  }, [currentScreen]);

  // Page enter animation on screen switch
  useEffect(() => {
    const vp = document.getElementById("app-main-viewport");
    if (vp) {
      gsap.fromTo(vp,
        { opacity: 0.6, y: -8 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [currentScreen]);

  const handleUniversalBack = () => {
    if (currentScreen === 7 && previousScreen === 8) {
      setReturnToMapWithPreview(true);
    }
    if (screenHistory.length > 1) {
      const prevScreen = screenHistory[screenHistory.length - 2];
      setCurrentScreen(prevScreen);
    } else {
      // Robust fallbacks based on the central screen registry
      const target = SCREENS[currentScreen]?.backFallback ?? 4;
      setCurrentScreen(target);
    }
  };

  // Cultural stamp states
  const [checkedInIds, setCheckedInIds] = useState<string[]>(["wat_mahathat"]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Custom generated itinerary (initialized with static fallback)
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(DEFAULT_ITINERARY);
  const [generatedTripPlan, setGeneratedTripPlan] = useState<TripPlanResult | null>(null);
  const [activeTripPlan, setActiveTripPlan] = useState<TripPlanResult | null>(null);

  const handleTripGenerated = React.useCallback((result: TripPlanResult) => {
    setGeneratedTripPlan(result);
    
    // Map TripPlanResult stops to ItineraryItem[] so existing screen 16 (TripDetailPlanView) works seamlessly!
    const mappedItinerary: ItineraryItem[] = result.stops.map((stop) => {
      const original = locations.find(loc => loc.id === stop.placeId);
      return {
        day: stop.timeLabel.includes("Day 2") || stop.timeLabel.includes("วันที่ 2") ? 2 : 1,
        time: stop.timeLabel.replace(/Day \d+ - /g, "").replace(/วันที่ \d+ - /g, "").replace(/วันที่ \d+ /g, ""),
        title: stop.name,
        desc: stop.note || stop.description || original?.desc || "",
        distance: original?.distance || "ในเส้นทางพิชัย",
        duration: stop.durationLabel || "45-60 นาที",
        category: stop.category || original?.locationCategory || "ท่องเที่ยว",
        audioStory: original?.audioStory || stop.note || ""
      };
    });
    
    setItinerary(mappedItinerary);
    setCurrentScreen(5); // Transition to Screen 5 which conditionally renders AIRouteResultView
  }, [locations]);

  // Active chat log
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", role: "buddy", text: "สวัสดีครับคุณแมว! บัดดี้ Thong Dee Go ยินดีต้อนรับสู่อำเภอพิชัย จังหวัดอุตรดิตถ์ครับ เดี่ยวนี้เที่ยวคนเดียวก็เซฟ สนุก และลึกซึ้งได้นะ มีอะไรให้บัดดี้แนะนำ สอบถามมาได้เลย!", time: "07:33" }
  ]);
  const [chatSending, setChatSending] = useState<boolean>(false);

  // Safety tracking
  const [safetyModeActive, setSafetyModeActive] = useState<boolean>(false);

  // Audio Tour Guide Subtitle Overlay Simulation state
  const [playingAudio, setPlayingAudio] = useState<{ active: boolean; title: string; story: string } | null>(null);

  const exp = checkedInIds.length * 350 + 300;
  const nextLevelExp = 1000;

  const [badges, setBadges] = useState<Badge[]>(BADGES);

  // Auto trigger unlocking relative badges when goals are achieved
  useEffect(() => {
    setBadges((currentBadges) => 
      currentBadges.map((b) => {
        if (b.id === "b2" && checkedInIds.length >= 2) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        if (b.id === "b4" && checkedInIds.length >= 6) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return b;
      })
    );
  }, [checkedInIds]);

  // Shared handler to open Trip Planner page / Active Trip
  const handleOpenTripPlannerMenu = React.useCallback(() => {
    if (activeTripPlan) {
      setCurrentScreen(27);
    } else {
      setCurrentScreen(5);
    }
  }, [activeTripPlan]);

  // Bottom Navigation helper to map screen routes
  const handleNavClick = (tabIdx: number) => {
    if (tabIdx === 0) setCurrentScreen(4); // Home
    if (tabIdx === 1) {
      handleOpenTripPlannerMenu();
    }
    if (tabIdx === 2) setCurrentScreen(8); // Map
    if (tabIdx === 3) setCurrentScreen(21); // Local Taxi
    if (tabIdx === 4) setCurrentScreen(12); // Profile

    // GSAP bounce animation on tab click
    if (tabIdx === 2) {
      if (mapBtnRef.current) {
        gsap.fromTo(mapBtnRef.current, { scale: 0.85, rotation: -15 }, { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)" });
      }
    } else {
      const btn = tabRefs.current[tabIdx];
      if (btn) {
        gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
      }
    }
  };

  // Obtain active bottom tab index based on active route
  const getActiveTabIndex = (): number => {
    return SCREENS[currentScreen]?.tab ?? 0;
  };

  // Reset check-ins for demo convenience
  const handleResetApp = () => {
    setCheckedInIds(["wat_mahathat"]);
    if (isGuest) clearGuestData();
    setItinerary(DEFAULT_ITINERARY);
    const greetName = currentUser?.name || (isGuest ? "ผู้เยี่ยมชม" : "คุณแมว");
    setChatMessages([
      { id: "1", role: "buddy", text: `สวัสดีครับคุณ${greetName}! บัดดี้ Thong Dee Go รีเซ็ตข้อมูลเรียบร้อยแล้ว อยากให้เริ่มถามเรื่องประวัติวัดโบราณ หรือหาของกินOtopใหม่ ได้เลยคร้าบ`, time: "07:33" }
    ]);
    setSafetyModeActive(false);
  };

  // POST route trigger targeting backend - calling live Gemini-grounded session
  const handleSendMessage = async (text: string) => {
    // Append user message immediately
    const timeString = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text,
      time: timeString
    };
    
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const buddyMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "buddy",
        text: data.text,
        time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, buddyMsg]);
    } catch (error: any) {
      console.error("Failed to connect to the Gemini backend:", error);
      
      // Elegant offline local fallback to keep the app working offline or when Gemini key is not yet set
      let fallbackText = "";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("อาหาร") || lowerText.includes("กิน") || lowerText.includes("อร่อย") || lowerText.includes("ขนม") || lowerText.includes("otop") || lowerText.includes("โบราณ") || lowerText.includes("ของดี")) {
        fallbackText = "โอ้โห! พูดถึงของอร่อยและสตรีทฟู้ดเมืองพิชัย บัดดี้แนะนำห้ามพลาดเป็นอันขาดเลยครับ:\n\n1. **ขนมวงโบราณคุณยาย** (ในตลาดเก่าพิชัย): แป้งคลุกมันเทศคลุกเคล้าน้ำตาลอ้อยเคี่ยว ร้อนๆ เหนียวหนึบหวานละมุนละไม\n2. **ไส้กรอกใหญ่พริกขี้หนู** (ซื้อได้แถวตลาดสดวัดหน้าพระธาตุ): สมุนไพรหมูสูตรเฉพาะของดีอุตรดิตถ์แสนหอมรสตึงมือ\n3. **ขนมจีนไก่ต้มน้ำใบข่า**: รสชาติแซ่บร้อนชุ่มคอหอมใบข่าธรรมชาติ\n\n*(หมายเหตุ: ระบบสลับมาเป็นโหมดตอบคำถามแบบสำรอง เนื่องจากยังไม่มีการระบุหรือเชื่อมต่อ Gemini API Key ในหน้ารองรับครับ)*";
      } else if (lowerText.includes("ประวัติ") || lowerText.includes("วัด") || lowerText.includes("พระยาพิชัย") || lowerText.includes("ดาบหัก") || lowerText.includes("ทองดี") || lowerText.includes("พิพิธภัณฑ์")) {
        fallbackText = "เมืองพิชัยเป็นรากแก้วประวัติศาสตร์วีรบุรุษไทยที่มีเสน่ห์มากครับ!\n\n- **วัดหน้าพระธาตุ**: วัดคู่บ้านคู่เมืองเก่าแก่นับพันปี ตามตำนานสร้างขึ้นใน พ.ศ. 1470 มีหลวงพ่อโต พระพุทธรูปศักดิ์สิทธิ์ปั้นปางมารวิชัยหน้าตัก 3 วาสูงสง่าในวิหารปราสาทจัตุรมุข 5 ยอด และสระน้ำพุศักดิ์สิทธิ์โบราณ\n- **อนุสรณ์สถานบ้านเกิด**: ตั้งตระหง่านอยู่บ้านเกิดแท้ๆ ครอบคลุมพื้นที่ร้อยไร่ พร้อมสถูปไม้สักโบราณและนิทรรศการมวยไทยพิชัยอันเกรียงไกร\n\n*(หมายเหตุ: ระบบสลับมาเป็นโหมดตอบคำถามแบบสำรอง เนื่องจากยังไม่มีการระบุหรือเชื่อมต่อ Gemini API Key ในหน้ารองรับครับ)*";
      } else {
        fallbackText = "บัดดี้พร้อมอวดวิถี OTOP ดีคู่วัฒนธรรมท้องถิ่นในอำเภอพิชัยแล้วคร้าบ!\n\n*(หมายเหตุการจำลองข้อมูล: ขาดการสตรีม API Key จาก Settings > Secrets: " + (error.message || "Unknown Error") + " - บัดดี้จึงจำลองข้อมูลวิถีเมืองรองที่สถิตในแอปให้คุณรับชมชั่วคราวครับ)*";
      }

      const buddyMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "buddy",
        text: fallbackText,
        time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, buddyMsg]);
    } finally {
      setChatSending(false);
    }
  };

  // CheckIn triggered at specific Place Checkpoint
  const handlePlaceCheckIn = async (attractionId: string) => {
    if (!checkedInIds.includes(attractionId)) {
      const nextCheckedInList = [...checkedInIds, attractionId];
      setCheckedInIds(nextCheckedInList);

      // Calculate level based on check-ins
      const calculatedLevel = Math.max(1, Math.min(5, Math.floor(nextCheckedInList.length / 2) + 1));

      if (isGuest) {
        // Guest mode: persist locally instead of Supabase
        addGuestCheckin(attractionId);
        addGuestStamp(attractionId);
      } else {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // 1. Insert search or checkin
            await supabase.from("checkins").insert({
              user_id: session.user.id,
              place_id: attractionId,
              checkin_method: "gps"
            });

            // 2. Insert stamp (to align with tables)
            await supabase.from("digital_passport_stamps").insert({
              user_id: session.user.id,
              place_id: attractionId,
              stamp_code: `STAMP_${attractionId.toUpperCase()}`
            }).select().maybeSingle();
          }
        } catch (err) {
          console.error("Failed to sync check-in to database:", err);
        }
      }
      
      // Grant EXP for achievements
      setBadges((currentBadges) => 
        currentBadges.map((b) => {
          if (b.id === "b3" && !b.unlocked) {
            // Unlocked when checked in places count is high
            return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return b;
        })
      );
    }
  };

  const handleAudioTourTrigger = (title: string, story: string) => {
    setPlayingAudio({ active: true, title, story });
  };

  // Attraction resolution
  const allPlaces = locations && locations.length > 0 ? locations : ATTRACTIONS;
  const activePlace = allPlaces.find((a) => a.id === activePlaceId) || allPlaces[0];

  const homeDetailPlace = React.useMemo(() => {
    if (!homeDetailPlaceId) return null;
    return allPlaces.find((place) => place.id === homeDetailPlaceId) ?? null;
  }, [homeDetailPlaceId, allPlaces]);

  const handleNavigateToPlace = (place: Attraction) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePlayAiStory = (place: Attraction) => {
    handleAudioTourTrigger(place.name, place.audioStory);
  };

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-border border-t-primary animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">
            กำลังโหลดบัญชี...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
    <div className={`relative mx-auto min-h-[100dvh] h-[100dvh] w-full app-shell overflow-x-hidden bg-background flex flex-col text-foreground antialiased font-sans ${isHighDpiCompact ? "compact-dpi" : ""}`}>
        
        {/* INNER VIEW CONTENT ROUTER (Render Screen 1 to 16 dynamically) */}
        <div id="app-main-viewport" className="flex-1 overflow-hidden relative bg-background" onScrollCapture={handleScrollCapture}>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-background">
              <div className="h-10 w-10 rounded-full border-4 border-border border-t-primary animate-spin" />
            </div>
          }>
            {currentScreen === 1 && (
              <SplashView onNext={() => setCurrentScreen(2)} />
            )}

            {currentScreen === 2 && (
              <OnboardingView onNext={() => setCurrentScreen(17)} />
            )}

            {[17, 18, 19, 20].includes(currentScreen) && (
              <AuthScreens
                currentScreen={currentScreen}
                onNavigate={(screenNum) => setCurrentScreen(screenNum)}
                onLoginSuccess={(userData) => {
                  setCurrentUser({ name: userData.name, emailOrPhone: userData.emailOrPhone });
                  setIsGuest(false);
                  setChatMessages([
                    { id: "1", role: "buddy", text: `สวัสดีครับคุณ${userData.name}! บัดดี้ Thong Dee Go ยินดีต้อนรับสู่อำเภอพิชัย จังหวัดอุตรดิตถ์ครับ เดี่ยวนี้เที่ยวคนเดียวก็เซฟ สนุก และลึกซึ้งได้นะ มีอะไรให้บัดดี้แนะนำ สอบถามมาได้เลย!`, time: "07:33" }
                  ]);
                  setCurrentScreen(4); // Go directly to HomeView
                }}
                onRegisterSuccess={(userData) => {
                  setCurrentUser({ name: userData.name, emailOrPhone: userData.emailOrPhone });
                  setIsGuest(false);
                  setChatMessages([
                    { id: "1", role: "buddy", text: `สวัสดีครับคุณ${userData.name}! บัดดี้ Thong Dee Go ยินดีต้อนรับสู่อำเภอพิชัย จังหวัดอุตรดิตถ์ครับ เดี่ยวนี้เที่ยวคนเดียวก็เซฟ สนุก และลึกซึ้งได้นะ มีอะไรให้บัดดี้แนะนำ สอบถามมาได้เลย!`, time: "07:33" }
                  ]);
                  setCurrentScreen(4); // Go directly to HomeView
                }}
                onContinueAsGuest={() => {
                  setCurrentUser(null);
                  setIsGuest(true);
                  setChatMessages([
                    { id: "1", role: "buddy", text: `สวัสดีครับคุณผู้เยี่ยมชม! บัดดี้ Thong Dee Go ยินดีต้อนรับสู่อำเภอพิชัย จังหวัดอุตรดิตถ์ครับ เดี่ยวนี้เที่ยวคนเดียวก็เซฟ สนุก และลึกซึ้งได้นะ มีอะไรให้บัดดี้แนะนำ สอบถามมาได้เลย!`, time: "07:33" }
                  ]);
                  setCurrentScreen(4); // Go directly to HomeView
                }}
              />
            )}

            {currentScreen === 4 && (
              <HomeView 
                userLocation={userLocation}
                isGuest={isGuest}
                displayName={currentUser?.name || "คุณแมว"}
                locations={locations}
                accommodations={accommodations}
                onSearchClick={() => setCurrentScreen(5)}
                onPlaceClick={(id) => {
                  setActivePlaceId(id);
                  setPreviousScreen(4);
                  setCurrentScreen(7);
                }}
                onHeroClick={() => {
                  if (itinerary && itinerary.length > 0 && itinerary !== DEFAULT_ITINERARY) {
                    setCurrentScreen(16);
                  } else {
                    setCurrentScreen(5);
                  }
                }}
                onOpenTripPlanner={() => handleNavClick(1)}
                onAudioStoryClick={(id) => {
                  const placeObj = allPlaces.find((a) => a.id === id);
                  if (placeObj) handleAudioTourTrigger(placeObj.name, placeObj.audioStory);
                }}
                onOpenPassport={() => setCurrentScreen(10)}
                onOpenMarketplace={() => {
                  setInitialProductId(null);
                  setCurrentScreen(23);
                }}
                onProductClick={(productId) => {
                  setInitialProductId(productId);
                  setCurrentScreen(23);
                }}
                onOpenWeather={() => setCurrentScreen(26)}
                onOpenPlaceInMapDetail={openHomePlaceInMapDetail}
                onOpenAccommodationInMapDetail={openHomeAccommodationInMapDetail}
                onOpenLocationDetail={openHomeLocationDetail}
                onOpenScreen={setCurrentScreen}
              />
            )}

            {currentScreen === 5 && (
              generatedTripPlan ? (
                <AIRouteResultView 
                  tripPlan={generatedTripPlan}
                  onBack={() => {
                    setGeneratedTripPlan(null);
                    setItinerary(DEFAULT_ITINERARY);
                  }}
                  onCreateNewPlan={() => {
                    setGeneratedTripPlan(null);
                    setItinerary(DEFAULT_ITINERARY);
                  }}
                  onStartTrip={() => {
                    setSafetyModeActive(true);
                    setActiveTripPlan(generatedTripPlan);
                    setCurrentScreen(27);
                  }}
                  onOpenMapLocation={handleOpenMapLocation}
                  onAudioStoryClick={handleAudioTourTrigger}
                />
              ) : (
                <AITripPlannerView 
                  locations={locations}
                  onTripGenerated={handleTripGenerated}
                  displayName={currentUser?.name || "คุณแมว"}
                  onBack={() => {
                    if (previousScreen && previousScreen !== 5) {
                      setCurrentScreen(previousScreen);
                    } else {
                      setCurrentScreen(4);
                    }
                  }}
                />
              )
            )}

            {currentScreen === 6 && (
              <AIRouteResultView 
                tripPlan={generatedTripPlan}
                onBack={() => setCurrentScreen(5)}
                onStartTrip={() => {
                  setSafetyModeActive(true);
                  setActiveTripPlan(generatedTripPlan);
                  setCurrentScreen(27);
                }}
                onOpenMapLocation={handleOpenMapLocation}
                onAudioStoryClick={handleAudioTourTrigger}
              />
            )}

            {currentScreen === 16 && (
              <TripDetailPlanView 
                itinerary={itinerary}
                onBack={() => setCurrentScreen(4)}
                onStartTrip={() => {
                  setSafetyModeActive(true);
                  setCurrentScreen(11); // Start safety mode simulation
                }}
                onAudioStoryClick={handleAudioTourTrigger}
                onPlaceClick={(name) => {
                  // Resolve closest matching checkpoint by name or local shop
                  const found = ATTRACTIONS.find((a) => a.name.includes(name) || name.includes(a.name));
                  if (found) {
                    setActivePlaceId(found.id);
                    setPreviousScreen(16); // back from place detail should return to trip detail
                    setCurrentScreen(7);
                  } else {
                    setActiveShopName(name);
                    setCurrentScreen(15); // Open local shop OTOP voucher
                  }
                }}
              />
            )}

            {currentScreen === 7 && (
              <PlaceDetailView 
                place={activePlace}
                isCheckedIn={checkedInIds.includes(activePlace.id)}
                isSaved={savedItems.some((s) => s.kind === "place" && s.id === activePlace.id)}
                onToggleSave={() => toggleSaved("place", activePlace.id)}
                onBack={() => {
                  if (previousScreen === 8) {
                    setCurrentScreen(8);
                    setReturnToMapWithPreview(true);
                  } else if (previousScreen === 16) {
                    setCurrentScreen(16);
                  } else {
                    setCurrentScreen(4);
                  }
                }}
                onCheckIn={handlePlaceCheckIn}
                onNavigate={(name) => {
                  setCurrentScreen(8); // Open in map
                }}
                displayName={currentUser?.name || "คุณแมว"}
                showGestureHandle={previousScreen === 8}
              />
            )}

            {hasOpenedMap && (
              <div 
                className="w-full h-full" 
                style={{ display: currentScreen === 8 ? "block" : "none" }}
              >
                <MapView 
                  locations={locations}
                  accommodations={accommodations}
                  userLocation={userLocation}
                  onLocateUser={onLocateUser}
                  onPlaceSelect={(id) => {
                    const found = allPlaces.find((a) => a.id === id);
                    if (found) {
                      setMapSelectedPlace(found);
                    }
                    setActivePlaceId(id);
                    setPreviousScreen(8);
                  }}
                  onSOSClick={() => setCurrentScreen(11)}
                  onNavigateToTaxi={() => setCurrentScreen(21)}
                  onNavigateToMarketplace={() => setCurrentScreen(23)}
                  onAudioPlay={handleAudioTourTrigger}
                  selectedPlaceFromParent={mapSelectedPlace}
                  restorePreview={returnToMapWithPreview}
                  onPreviewRestored={() => setReturnToMapWithPreview(false)}
                  onSelectedPlaceChange={handleMapSelectedPlaceChange}
                  onDetailOpenChange={(open) => {
                    setIsMapDetailOpen(open);
                    setShowChatBubble(!open);
                  }}
                  checkedInIds={checkedInIds}
                  onCheckIn={handlePlaceCheckIn}
                  displayName={currentUser?.name || "คุณแมว"}
                  savedItems={savedItems}
                  onToggleSave={toggleSaved}
                  pendingPlaceId={pendingMapPlaceId}
                  pendingAccommodationId={pendingMapAccommodationId}
                  pendingOpenMode={pendingMapOpenMode}
                  onPendingPlaceHandled={handlePendingPlaceHandled}
                  onPendingAccommodationHandled={handlePendingAccommodationHandled}
                />
              </div>
            )}

            {/* FLOATING CHAT BUBBLE & MODAL */}
            {SHOW_FLOATING_ASK_AI_BUTTON && [4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 21, 23, 26, 29].includes(currentScreen) && !isChatOpen && (
              <FloatingChatBubble 
                onClick={() => setIsChatOpen(true)} 
                visible={showChatBubble}
              />
            )}

            {isChatOpen && (
              <div className="absolute inset-0 z-50 flex flex-col bg-background animate-in slide-in-from-bottom-full duration-300">
                <AIChatTravelBuddyView 
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isSending={chatSending}
                  onBack={() => setIsChatOpen(false)}
                />
              </div>
            )}

            {homeDetailPlace && (
              <LocationDetailFullScreenView
                place={homeDetailPlace}
                onBack={closeHomeLocationDetail}
                onNavigate={handleNavigateToPlace}
                isCheckedIn={checkedInIds.includes(homeDetailPlace.id)}
                onCheckIn={handlePlaceCheckIn}
                displayName={currentUser?.name || "คุณแมว"}
                backMode="home"
              />
            )}

            {currentScreen === 27 && activeTripPlan && (
              <ActiveTripView 
                tripPlan={activeTripPlan}
                onBackToRouteResult={() => setCurrentScreen(5)}
                onFinishTrip={() => {
                  setActiveTripPlan(null);
                  setCurrentScreen(5);
                }}
                onOpenMapLocation={handleOpenMapLocation}
              />
            )}

            {currentScreen === 10 && (
              <DigitalPassportView 
                exp={exp}
                nextLevelExp={nextLevelExp}
                checkedInIds={checkedInIds}
                badges={badges}
                onTriggerCheckIn={handlePlaceCheckIn}
                onOpenQRCheckIn={() => setCurrentScreen(13)}
                onOpenDiary={() => setCurrentScreen(14)}
                displayName={currentUser?.name || "คุณแมว"}
                onBack={() => {
                  if (previousScreen && previousScreen !== 10) {
                    setCurrentScreen(previousScreen);
                  } else {
                    setCurrentScreen(12);
                  }
                }}
              />
            )}

            {currentScreen === 11 && (
              <SafetyModeView 
                safetyModeActive={safetyModeActive}
                onToggleSafety={() => setSafetyModeActive(!safetyModeActive)}
                onBack={() => {
                  if (previousScreen && previousScreen !== 11) {
                    setCurrentScreen(previousScreen);
                  } else {
                    setCurrentScreen(12);
                  }
                }}
              />
            )}

            {currentScreen === 12 && (
              <ProfileView 
                tripsCount={itinerary && itinerary.length > 0 && itinerary !== DEFAULT_ITINERARY ? 1 : 0}
                onOpenTodayTrip={handleOpenTripPlannerMenu}
                checkInCount={checkedInIds.length}
                badgesCount={badges.filter((b) => b.unlocked || (b.id === "b2" && checkedInIds.length >= 2) || (b.id === "b4" && checkedInIds.length >= 6)).length}
                onOpenPassport={() => setCurrentScreen(10)}
                onOpenSafety={() => setCurrentScreen(11)}
                onResetApp={handleResetApp}
                isHighDpiCompact={isHighDpiCompact}
                onToggleHighDpi={setIsHighDpiCompact}
                safetyModeActive={safetyModeActive}
                onToggleSafety={() => setSafetyModeActive(!safetyModeActive)}
                onNavigateToScreen={(screenId) => setCurrentScreen(screenId)}
                isGuest={isGuest}
                displayName={currentUser?.name || "คุณแมว"}
                onGuestFeatureLocked={() => setShowGuestLockModal(true)}
                onLogout={async () => {
                  try {
                    await supabase.auth.signOut();
                  } catch (err) {
                    console.error(err);
                  }
                  setCurrentUser(null);
                  setIsGuest(true);
                  setCurrentScreen(17); // Go back to welcome
                }}
                onEditProfile={async (newName) => {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) throw new Error("Not authenticated");
                  const { error } = await supabase
                    .from("profiles")
                    .update({ display_name: newName })
                    .eq("owner_id", session.user.id);
                  if (error) throw error;
                  setCurrentUser(prev => prev ? { ...prev, name: newName } : null);
                }}
                onChangePassword={async (currentPassword, newPassword) => {
                  const email = currentUser?.emailOrPhone;
                  if (!email) throw new Error("Email not found");
                  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
                  if (signInError) throw new Error("Current password is incorrect");
                  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
                  if (updateError) throw updateError;
                }}
                onOpenAppearanceSettings={() => setCurrentScreen(25)}
                savedCount={savedItems.length}
                onOpenSavedPlaces={() => setCurrentScreen(30)}
              />
            )}

            {currentScreen === 25 && (
              <AppearanceSettingsView 
                onBack={() => setCurrentScreen(12)} 
              />
            )}

            {currentScreen === 13 && (
              <QRCheckInView 
                checkedInIds={checkedInIds}
                locations={locations}
                onCheckInSuccess={(id) => {
                  handlePlaceCheckIn(id);
                  setCurrentScreen(10); // Redirect to Passport to view stamp
                }}
                onBack={() => setCurrentScreen(10)}
              />
            )}

            {currentScreen === 14 && (
              <TravelDiaryView 
                checkedInIds={checkedInIds}
                selectedInterests={selectedInterests}
                locations={locations}
                onBack={() => setCurrentScreen(10)}
                onOpenPassport={() => setCurrentScreen(10)}
              />
            )}

            {currentScreen === 15 && (
              <LocalShopDetailView 
                shopName={activeShopName}
                onBack={() => setCurrentScreen(16)}
              />
            )}

            {currentScreen === 21 && (
              <LocalTaxiView 
                onBack={() => {
                  if (previousScreen && previousScreen !== 21) {
                    setCurrentScreen(previousScreen);
                  } else {
                    setCurrentScreen(8);
                  }
                }}
              />
            )}

            {currentScreen === 22 && (
              <TaxiProviderRegisterView 
                onBack={() => setCurrentScreen(12)}
              />
            )}

            {currentScreen === 23 && (
              <LocalMarketplaceView 
                onBack={() => {
                  setInitialProductId(null);
                  setCurrentScreen(4);
                }}
                initialProductId={initialProductId || undefined}
              />
            )}

            {currentScreen === 24 && (
              <MarketplaceSellerRegisterView
                onBack={() => setCurrentScreen(12)} // Back to Profile
              />
            )}

            {currentScreen === 28 && (
              <AccommodationOwnerRegisterView
                onBack={() => setCurrentScreen(12)}
              />
            )}

            {currentScreen === 26 && (
              <WeatherView
                onBack={handleUniversalBack}
              />
            )}

            {currentScreen === 40 && !isGuest && (
              <AdminPanelView
                onBack={() => setCurrentScreen(12)}
                onLocationsChange={loadLocations}
                onAccommodationsChange={loadAccommodations}
              />
            )}

            {currentScreen === 29 && (
              <HotelSelectionView
                accommodations={accommodations}
                userLocation={userLocation}
                savedItems={savedItems}
                onToggleSave={toggleSaved}
                onBack={() => setCurrentScreen(4)}
                onSelectAccommodation={handleHotelSelect}
              />
            )}

            {currentScreen === 30 && (
              <SavedPlacesView
                savedItems={savedItems}
                locations={locations}
                accommodations={accommodations}
                onToggleSave={toggleSaved}
                onBack={() => setCurrentScreen(12)}
                onOpenPlace={(placeId) => {
                  setActivePlaceId(placeId);
                  setPreviousScreen(30);
                  setCurrentScreen(7);
                }}
                onOpenHotel={(accommodationId) => {
                  setPendingMapAccommodationId(accommodationId);
                  setPendingMapPlaceId(null);
                  setPendingMapOpenMode("detail");
                  setHasOpenedMap(true);
                  setCurrentScreen(8);
                }}
              />
            )}

            {/* Simulated Live Audio Tour Subtitle progress card */}
            {playingAudio && playingAudio.active && (
              <div 
                className="absolute left-4 right-4 bottom-20 text-white p-3.5 rounded-2xl shadow-2xl z-50 border border-amber-300 animate-slide-up bg-gradient-to-r from-primary to-primary/80"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 leading-none">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>เสียงบรรยายทางธรรมนำเที่ยว OTOP</span>
                  </div>
                  <button 
                    onClick={() => setPlayingAudio(null)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-xs font-bold text-white mt-1 leading-tight">{playingAudio.title}</h4>
                <div className="mt-2 text-[11px] text-gray-200 bg-black/20 p-2.5 rounded-xl border border-white/5 max-h-[70px] overflow-y-auto leading-relaxed italic">
                  “...{playingAudio.story}...”
                </div>
              </div>
            )}

            {/* ELEGANT GUEST MODE LOCK MODAL */}
            {showGuestLockModal && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-6 text-foreground animate-fade-in">
                <div className="bg-card rounded-2xl w-full max-w-[340px] p-6 shadow-2xl border border-primary/10 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      <Compass className="w-8 h-8 text-primary" />
                    </div>

                    <h3 className="text-base font-bold text-primary leading-tight">
                      เข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้
                    </h3>
                    
                    <p className="text-[11px] text-muted-foreground mt-2.5 leading-relaxed">
                      การสะสมแสตมป์พาสปอร์ตดิจิทัล ปักหมุดเช็คอิน บันทึกประวัติการเดินท่องเที่ยว และใช้วางแผนท่องเที่ยวด้วย AI อัจฉริยะ จำเป็นต้องมีบัญชีตัวจริงก่อนค่ะ
                    </p>

                    <div className="w-full mt-5 flex flex-col gap-2">
                       <button
                        onClick={() => {
                          setShowGuestLockModal(false);
                          setCurrentScreen(18);
                        }}
                        className="w-full py-3 bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        เข้าสู่ระบบ
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowGuestLockModal(false);
                          setCurrentScreen(19);
                        }}
                        className="w-full py-3 bg-muted/50 hover:bg-muted active:scale-[0.98] text-foreground font-extrabold text-xs rounded-xl cursor-pointer transition-all border border-border"
                      >
                        สมัครสมาชิก
                      </button>

                      <button
                        onClick={() => setShowGuestLockModal(false)}
                        className="w-full py-2.5 text-xs text-muted-foreground/60 font-semibold hover:text-foreground/80 cursor-pointer active:scale-95 transition-all mt-1"
                      >
                        ย้อนกลับ / สำรวจผู้เยี่ยมชมต่อ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </Suspense>
          </div>

          {/* BOTTOM TAB MENU NAVIGATION */}
          {(SCREENS[currentScreen]?.showNav ?? false) && !(currentScreen === 5 && generatedTripPlan) && !homeDetailPlace && !isMapDetailOpen && (
            <nav 
              className="fixed left-1/2 z-50 w-[calc(100%-32px)] max-w-[400px] sm:max-w-[480px] transition-all duration-300 pointer-events-auto select-none"
              style={{
                bottom: showChatBubble ? "calc(12px + env(safe-area-inset-bottom))" : "-100px",
                opacity: showChatBubble ? 1 : 0,
                transform: showChatBubble ? "translateX(-50%) scale(1)" : "translateX(-50%) scale(0.95)",
              }}
            >
              <div className="w-full border border-border bg-card/95 px-3 py-2 backdrop-blur-xl rounded-3xl">
                <div className="grid grid-cols-5 items-center gap-1">
                  {[
                    { label: t("nav.home"), icon: <Home className="font-bold" />, idx: 0 },
                    { label: t("nav.plan"), icon: <Compass className="font-bold" />, idx: 1 },
                    { label: "map", icon: null, idx: 2 }, // Map center button
                    { label: t("nav.localTaxi"), icon: <CarFront className="font-bold" />, idx: 3 },
                    { label: t("nav.profile"), icon: <User className="font-bold" />, idx: 4 }
                  ].map((item, keyIdx) => {
                    if (item.idx === 2) {
                      return (
                        <button
                          key={keyIdx}
                          ref={mapBtnRef}
                          type="button"
                          onClick={() => handleNavClick(2)}
                          aria-label="เปิดแผนที่"
                          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.96] cursor-pointer ${
                            getActiveTabIndex() === 2
                              ? "bg-primary ring-4 ring-primary/20"
                              : "bg-primary"
                          }`}
                        >
                          <MapIcon className="h-6 w-6" />
                        </button>
                      );
                    }

                    const isActive = getActiveTabIndex() === item.idx;

                    return (
                      <button
                        key={keyIdx}
                        ref={(el) => { tabRefs.current[item.idx] = el; }}
                        type="button"
                        onClick={() => handleNavClick(item.idx)}
                        className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {React.cloneElement(item.icon as React.ReactElement, {
                            className: `h-5 w-5 ${isActive ? "text-primary" : ""}`
                          })}
                        </div>
                        <span className="truncate select-none">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
    </ToastProvider>
    );
  }
