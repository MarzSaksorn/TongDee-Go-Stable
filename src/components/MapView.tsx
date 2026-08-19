import React, { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { useToast } from "./ToastProvider";
import { Search, ZoomIn, ZoomOut, Eye, Shield, Compass, ChevronUp, X, Star, Navigation, Car, Sparkles, MapPin, Bed, Phone, MessageSquare, Globe, Check, Hotel } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { ATTRACTIONS, ACCOMMODATIONS } from "../data";
import { Attraction, Accommodation } from "../types";
import PlaceDetailView from "./PlaceDetailView";
import AccommodationDetailView from "./AccommodationDetailView";
import { getDistanceKm, formatDistanceKm } from "../utils/distance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MapViewProps {
  onPlaceSelect: (id: string) => void;
  onSOSClick: () => void;
  onNavigateToTaxi?: () => void;
  onNavigateToMarketplace?: () => void;
  onAudioPlay?: (title: string, story: string) => void;
  selectedPlaceFromParent?: Attraction | null;
  restorePreview?: boolean;
  onPreviewRestored?: () => void;
  onSelectedPlaceChange?: (place: Attraction | null) => void;
  locations?: Attraction[];
  accommodations?: Accommodation[];
  onDetailOpenChange?: (open: boolean) => void;
  checkedInIds?: string[];
  onCheckIn?: (id: string) => void;
  displayName?: string;
  pendingPlaceId?: string | null;
  pendingAccommodationId?: string | null;
  pendingOpenMode?: "compact" | "detail";
  onPendingPlaceHandled?: () => void;
  onPendingAccommodationHandled?: () => void;
  userLocation?: { lat: number; lng: number } | null;
  onLocateUser?: (loc: { lat: number; lng: number }) => void;
  savedItems?: { id: string; kind: "place" | "hotel" }[];
  onToggleSave?: (kind: "place" | "hotel", id: string) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

// Helper component to handle dynamic camera controls and zoom syncing
function MapController({
  selectedPlace,
  zoomLevel,
  onMapClick,
  panToLocation
}: {
  selectedPlace: { lat: number; lng: number } | null;
  zoomLevel: number;
  onMapClick: () => void;
  panToLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener("click", () => {
      onMapClick();
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [map, onMapClick]);

  useEffect(() => {
    if (!map || !selectedPlace) return;
    map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
  }, [map, selectedPlace]);

  useEffect(() => {
    if (!map || !panToLocation) return;
    map.panTo(panToLocation);
  }, [map, panToLocation]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoomLevel);
  }, [map, zoomLevel]);

  return null;
}

const isInteractiveElement = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      'button, a, input, textarea, select, [role="button"], [data-no-drag="true"]'
    )
  );
};

export default function MapView({
  onPlaceSelect,
  onSOSClick,
  onNavigateToTaxi,
  onNavigateToMarketplace,
  onAudioPlay,
  selectedPlaceFromParent,
  restorePreview,
  onPreviewRestored,
  onSelectedPlaceChange,
  locations,
  accommodations,
  onDetailOpenChange,
  checkedInIds = [],
  onCheckIn,
  displayName = "คุณแมว",
  pendingPlaceId,
  pendingAccommodationId,
  pendingOpenMode,
  onPendingPlaceHandled,
  onPendingAccommodationHandled,
  userLocation,
  onLocateUser,
  savedItems = [],
  onToggleSave
}: MapViewProps) {
  const { showToast } = useToast();
  const allPlaces = locations && locations.length > 0 ? locations : ATTRACTIONS;
  const allAccommodations = accommodations && accommodations.length > 0 ? accommodations : ACCOMMODATIONS;
  const [activeFilter, setActiveFilter] = useState<string>("ทั้งหมด");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    selectedPlaceFromParent?.id || "wat_mahathat"
  );
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<string | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const mapSearchResults = useMemo(() => {
    const query = mapSearchQuery.trim().toLowerCase();

    if (!query) return [];

    const placeResults = allPlaces
      .filter((place) => {
        const searchableText = [
          place.name,
          place.locationCategory,
          place.desc,
          place.historySummary,
          place.culturalHighlights,
          place.distance,
          place.bestTime,
          place.needToKnow,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .map((place) => ({ type: "place" as const, item: place }));

    const accommodationResults = allAccommodations
      .filter((accommodation) => {
        const searchableText = [
          accommodation.name,
          accommodation.description,
          accommodation.propertyType,
          accommodation.priceRange,
          accommodation.address,
          accommodation.amenities.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .map((accommodation) => ({ type: "accommodation" as const, item: accommodation }));

    return [...placeResults, ...accommodationResults].slice(0, 8);
  }, [mapSearchQuery, allPlaces, allAccommodations]);

  const selectPlaceFromSearch = (place: Attraction) => {
    setSelectedPlaceId(place.id);
    setSelectedAccommodationId(null);
    setShowPopup(true);
    setSheetState("compact");
    setMapSearchQuery(place.name);
    setIsSearchFocused(false);

    if (typeof place.lat === "number" && typeof place.lng === "number") {
      setMapPanTarget({ lat: place.lat, lng: place.lng });
      setZoomLevel(15);
    }
  };

  const selectAccommodationFromSearch = (accommodation: Accommodation) => {
    setSelectedAccommodationId(accommodation.id);
    setSelectedPlaceId("");
    setShowPopup(true);
    setSheetState("compact");
    setMapSearchQuery(accommodation.name);
    setIsSearchFocused(false);

    if (typeof accommodation.lat === "number" && typeof accommodation.lng === "number") {
      setMapPanTarget({ lat: accommodation.lat, lng: accommodation.lng });
      setZoomLevel(15);
    }
  };

  const selectSearchResult = (result: (typeof mapSearchResults)[number]) => {
    if (result.type === "accommodation") {
      selectAccommodationFromSearch(result.item);
    } else {
      selectPlaceFromSearch(result.item);
    }
  };
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapPanTarget, setMapPanTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Bottom Sheet States
  type SheetState = "compact" | "hidden" | "transitioning" | "detail";
  const [sheetState, setSheetState] = useState<SheetState>("compact");
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [showPopup, setShowPopup] = useState(true);
  const [isOpeningDetail, setIsOpeningDetail] = useState(false);
  const [activeRoutingPlace, setActiveRoutingPlace] = useState<Attraction | null>(null);

  const detailScrollRef = useRef<HTMLDivElement | null>(null);
  const detailStartYRef = useRef<number | null>(null);
  const detailDraggingRef = useRef(false);
  const detailDragOffsetRef = useRef(0);

  const [isDetailDragging, setIsDetailDragging] = useState(false);
  const [detailDragOffsetY, setDetailDragOffsetY] = useState(0);

  const compactStartYRef = useRef<number | null>(null);
  const compactDraggingRef = useRef(false);
  const compactDragOffsetRef = useRef(0);

  const [isCompactDragging, setIsCompactDragging] = useState(false);
  const [compactDragOffsetY, setCompactDragOffsetY] = useState(0);

  const clearSelectedLocation = () => {
    setSelectedPlaceId("");
    setSelectedAccommodationId(null);
    setShowPopup(false);
    setSheetState("hidden");
    setCompactDragOffsetY(0);
    compactDragOffsetRef.current = 0;
  };

  const markerClickLockRef = useRef(false);

  const handleMarkerClick = (placeId: string) => {
    markerClickLockRef.current = true;
    setSelectedPlaceId(placeId);
    setSelectedAccommodationId(null);
    setSheetState("compact");
    setIsSearchFocused(false);
    window.setTimeout(() => {
      markerClickLockRef.current = false;
    }, 120);
  };

  const handleAccommodationMarkerClick = (accommodation: Accommodation) => {
    markerClickLockRef.current = true;
    setSelectedAccommodationId(accommodation.id);
    setSelectedPlaceId("");
    setSheetState("compact");
    setShowPopup(true);
    setIsSearchFocused(false);
    setMapPanTarget({ lat: accommodation.lat, lng: accommodation.lng });
    window.setTimeout(() => {
      markerClickLockRef.current = false;
    }, 120);
  };

  const handleMapClick = () => {
    if (markerClickLockRef.current) return;
    clearSelectedLocation();
    setIsSearchFocused(false);
  };

  const getTouchY = (event: TouchEvent | React.TouchEvent) => {
    return event.touches?.[0]?.clientY ?? event.changedTouches?.[0]?.clientY ?? 0;
  };

  const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  };

  const isDetailScrollAtTop = () => {
    return (detailScrollRef.current?.scrollTop ?? 0) <= 0;
  };

  const openDetailSheet = () => {
    if (!selectedPlace && !selectedAccommodation) return;

    setCompactDragOffsetY(0);
    compactDragOffsetRef.current = 0;

    setSheetState("transitioning");

    if (onPlaceSelect && selectedPlace && !selectedAccommodation) {
      onPlaceSelect(selectedPlace.id);
    }

    window.setTimeout(() => {
      setSheetState("detail");
    }, 280);
  };

  // Compact Swipe Up / Down Handlers
  const startCompactDrag = (clientY: number) => {
    compactDraggingRef.current = true;
    compactStartYRef.current = clientY;
    compactDragOffsetRef.current = 0;

    setIsCompactDragging(true);
    setCompactDragOffsetY(0);
  };

  const moveCompactDrag = (clientY: number) => {
    if (!compactDraggingRef.current || compactStartYRef.current === null) return;

    const delta = clientY - compactStartYRef.current;
    const clamped = clamp(delta, -160, 80);

    compactDragOffsetRef.current = clamped;
    setCompactDragOffsetY(clamped);
  };

  const endCompactDrag = () => {
    const offset = compactDragOffsetRef.current;

    if (offset < -55) {
      openDetailSheet();
    } else if (offset > 70) {
      clearSelectedLocation();
    }

    compactDraggingRef.current = false;
    compactStartYRef.current = null;
    compactDragOffsetRef.current = 0;

    setIsCompactDragging(false);
    setCompactDragOffsetY(0);
  };

  // Full-screen Detail Swipe Down / Drag Handlers
  const startDetailDrag = (clientY: number) => {
    detailDraggingRef.current = true;
    detailStartYRef.current = clientY;
    detailDragOffsetRef.current = 0;

    setIsDetailDragging(true);
    setDetailDragOffsetY(0);
  };

  const moveDetailDrag = (clientY: number) => {
    if (!detailDraggingRef.current || detailStartYRef.current === null) return;

    const delta = clientY - detailStartYRef.current;
    const clamped = clamp(delta, 0, 220);

    detailDragOffsetRef.current = clamped;
    setDetailDragOffsetY(clamped);
  };

  const endDetailDrag = () => {
    const offset = detailDragOffsetRef.current;

    if (offset > 85) {
      setSheetState("compact");
    }

    detailDraggingRef.current = false;
    detailStartYRef.current = null;
    detailDragOffsetRef.current = 0;

    setIsDetailDragging(false);
    setDetailDragOffsetY(0);
  };

  // Window-level events while Compact drag is in progress
  useEffect(() => {
    if (!isCompactDragging) return;

    const handleTouchMove = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
      moveCompactDrag(getTouchY(event));
    };

    const handleTouchEnd = () => {
      endCompactDrag();
    };

    const handleMouseMove = (event: MouseEvent) => {
      moveCompactDrag(event.clientY);
    };

    const handleMouseUp = () => {
      endCompactDrag();
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isCompactDragging]);

  // Window-level events while Detail drag is in progress
  useEffect(() => {
    if (!isDetailDragging) return;

    const handleTouchMove = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
      moveDetailDrag(getTouchY(event));
    };

    const handleTouchEnd = () => {
      endDetailDrag();
    };

    const handleMouseMove = (event: MouseEvent) => {
      moveDetailDrag(event.clientY);
    };

    const handleMouseUp = () => {
      endDetailDrag();
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDetailDragging]);


  // Sync open state change to show/hide bottom tab bar and chat bubble
  useEffect(() => {
    if (sheetState === "detail") {
      onDetailOpenChange?.(true);
    } else {
      onDetailOpenChange?.(false);
    }
  }, [sheetState, onDetailOpenChange]);

  // Handle hardware back click on Android and swipe back gestures in mobile browsers
  useEffect(() => {
    if (sheetState === "detail") {
      window.history.pushState({ mapDetailOpen: true }, "");
    }
  }, [sheetState]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (sheetState === "detail") {
        setSheetState("compact");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sheetState]);

  // Sync selectedPlaceId if parent sends a new one
  useEffect(() => {
    if (selectedPlaceFromParent) {
      setSelectedPlaceId(selectedPlaceFromParent.id);
      setSelectedAccommodationId(null);
      setShowPopup(true);
    }
  }, [selectedPlaceFromParent]);

  // Restore compact preview when returning from detail page
  useEffect(() => {
    if (restorePreview && selectedPlaceFromParent) {
      setSelectedPlaceId(selectedPlaceFromParent.id);
      setSelectedAccommodationId(null);
      setSheetState("compact");
      setIsOpeningDetail(false);
      setDragOffsetY(0);
      setShowPopup(true);
      onPreviewRestored?.();
    }
  }, [restorePreview, selectedPlaceFromParent, onPreviewRestored]);

  // Notify parent of selected place change
  useEffect(() => {
    if (showPopup && !selectedAccommodationId) {
      const p = allPlaces.find((a) => a.id === selectedPlaceId) || null;
      onSelectedPlaceChange?.(p);
    } else {
      onSelectedPlaceChange?.(null);
    }
  }, [selectedPlaceId, selectedAccommodationId, showPopup, allPlaces, onSelectedPlaceChange]);

  const isPendingSelectionRef = useRef<boolean>(false);

  // Handles pending selections from Home screen
  useEffect(() => {
    if (pendingPlaceId) {
      const found = allPlaces.find((p) => p.id === pendingPlaceId);
      if (found) {
        isPendingSelectionRef.current = true;
        setSelectedPlaceId(pendingPlaceId);
        setSelectedAccommodationId(null);
        setSheetState(pendingOpenMode || "detail");
        setDragOffsetY(0);
        setCompactDragOffsetY(0);
        setShowPopup(true);
        setIsOpeningDetail(false);
      }
      onPendingPlaceHandled?.();
    }
  }, [pendingPlaceId, pendingOpenMode, allPlaces, onPendingPlaceHandled]);

  useEffect(() => {
    if (pendingAccommodationId) {
      const found = allAccommodations.find((item) => item.id === pendingAccommodationId);
      if (found) {
        isPendingSelectionRef.current = true;
        setSelectedAccommodationId(pendingAccommodationId);
        setActiveFilter("ที่พัก");
        setSheetState(pendingOpenMode || "detail");
        setDragOffsetY(0);
        setCompactDragOffsetY(0);
        setShowPopup(true);
        setIsOpeningDetail(false);
      }
      onPendingAccommodationHandled?.();
    }
  }, [pendingAccommodationId, pendingOpenMode, allAccommodations, onPendingAccommodationHandled]);

  // Sync bottom sheet state on selection change
  useEffect(() => {
    if (isPendingSelectionRef.current) {
      isPendingSelectionRef.current = false;
    } else {
      setSheetState("compact");
    }
    setDragOffsetY(0);
    setCompactDragOffsetY(0);
    setShowPopup(true);
    setIsOpeningDetail(false);
  }, [selectedPlaceId, selectedAccommodationId]);

  const openPlaceDetailWithTransition = () => {
    if ((!selectedPlace && !selectedAccommodationId) || isOpeningDetail) return;
    setIsOpeningDetail(true);
    setSheetState("transitioning");

    if (onPlaceSelect && selectedPlace && !selectedAccommodationId) {
      onPlaceSelect(selectedPlace.id);
    }

    window.setTimeout(() => {
      setSheetState("detail");
      setIsOpeningDetail(false);
    }, 280);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpeningDetail) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragStartY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY === null || isOpeningDetail) return;
    const delta = e.clientY - dragStartY;

    if (delta < -120) {
      setDragOffsetY(-120);
    } else if (delta > 150) {
      setDragOffsetY(150);
    } else {
      setDragOffsetY(delta);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY === null) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);

    const thresholdUp = -60;
    const thresholdDown = 80;

    if (sheetState === "detail") {
      if (dragOffsetY > thresholdDown) {
        setSheetState("compact");
      }
    } else {
      if (dragOffsetY < thresholdUp) {
        openPlaceDetailWithTransition();
      } else if (dragOffsetY > thresholdDown) {
        setSheetState("hidden");
      }
    }

    setDragStartY(null);
    setDragOffsetY(0);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY === null) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDragStartY(null);
    setDragOffsetY(0);
  };

  const handleGetDirections = (place: Attraction) => {
    setActiveRoutingPlace(place);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCenterOnUser = () => {
    if (!navigator.geolocation) {
      showToast("เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่งปัจจุบัน", "error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocateUser?.(loc);
        setMapPanTarget(loc);
        setZoomLevel(15);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting high-accuracy position:", error);
        setIsLocating(false);
        showToast("ไม่สามารถเข้าถึงพิกัดปัจจุบันได้ กรุณาอนุญาตสิทธิ์การเข้าถึงพิกัดในเบราว์เซอร์", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const filters = ["ทั้งหมด", "วัฒนธรรม", "อาหาร", "ธรรมชาติ", "ที่พัก", "จุดปลอดภัย"];

  // Filter places based on horizontal category and search queries
  const filteredPlaces = activeFilter === "ที่พัก" ? [] : allPlaces.filter((p) => {
    const matchesFilter =
      activeFilter === "ทั้งหมด" ||
      (activeFilter === "จุดปลอดภัย" && (p.id === "wat_mahathat" || p.id === "shrine_station")) ||
      p.locationCategory === activeFilter;

    const matchesSearch =
      p.name.toLowerCase().includes(mapSearchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(mapSearchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredAccommodations = activeFilter === "ทั้งหมด" || activeFilter === "ที่พัก" ? allAccommodations.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(mapSearchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(mapSearchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  const selectedAccommodation = selectedAccommodationId
    ? allAccommodations.find((a) => a.id === selectedAccommodationId) || null
    : null;
  const selectedPlace = selectedAccommodation ? null : (allPlaces.find((p) => p.id === selectedPlaceId) || allPlaces[0] || null);
  const selectedMapTarget = selectedAccommodation || selectedPlace;

  useEffect(() => {
    if (selectedMapTarget) {
      gsap.fromTo(".map-sheet",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }
      );
    }
  }, [selectedMapTarget]);

  const distanceLabelMap = useMemo(() => {
    if (!userLocation) return {} as Record<string, string>;
    const labels: Record<string, string> = {};
    for (const place of allPlaces) {
      const km = getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng);
      labels[place.id] = formatDistanceKm(km, "TH");
    }
    for (const accommodation of allAccommodations) {
      const km = getDistanceKm(userLocation.lat, userLocation.lng, accommodation.lat, accommodation.lng);
      labels[accommodation.id] = formatDistanceKm(km, "TH");
    }
    return labels;
  }, [userLocation, allPlaces, allAccommodations]);

  const isLocationPreviewVisible = showPopup && !!selectedMapTarget && (sheetState === "compact" || sheetState === "transitioning");

  const getMarkerIconAndColor = (id: string) => {
    const dPlace = allPlaces.find((p) => p.id === id);
    if (dPlace && dPlace.marker_icon && dPlace.marker_color) {
      return { icon: dPlace.marker_icon, colorClass: dPlace.marker_color };
    }
    const mapping: Record<string, { icon: string; colorClass: string }> = {
      wat_mahathat: { icon: "ว", colorClass: "bg-primary" },
      monument: { icon: "อ", colorClass: "bg-primary" },
      museum: { icon: "พ", colorClass: "bg-amber-500" },
      pramin_bridge: { icon: "ส", colorClass: "bg-emerald-500" },
      dara_station: { icon: "ส", colorClass: "bg-emerald-500" },
      old_market: { icon: "ต", colorClass: "bg-amber-500" },
      shrine_station: { icon: "ศ", colorClass: "bg-primary" },
      shrine_mazu: { icon: "จ", colorClass: "bg-emerald-500" },
      sleeping_buddha: { icon: "พ", colorClass: "bg-primary" },
      new_market: { icon: "ต", colorClass: "bg-amber-500" }
    };
    return mapping[id] || { icon: "ท", colorClass: "bg-primary" };
  };

  const handleZoom = (type: "in" | "out") => {
    setZoomLevel((prev) => (type === "in" ? Math.min(18, prev + 1) : Math.max(10, prev - 1)));
  };

  // If there is no Google Maps Platform API key, display a beautiful setup helper
  if (!hasValidKey) {
    return (
      <div
        id="map-screen"
        className="flex flex-col h-full w-full bg-background overflow-y-auto p-6 justify-center items-center animate-fade-in-up"
      >
        <div className="max-w-md w-full bg-card backdrop-blur-md rounded-xl p-6 border border-border text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-foreground">ต้องการ Google Maps API Key</h2>

          <div className="text-xs text-muted-foreground text-left space-y-2.5 leading-relaxed bg-muted p-4 rounded-2xl border border-border">
            <p className="font-semibold text-amber-600">วิธีเปิดใช้งานแผนที่โต้ตอบ:</p>
            <p><strong>1. รับ API Key:</strong> สามารถสมัครรับคีย์ของ Google Cloud ได้ที่ <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-primary underline">ลิงก์ Google Cloud</a></p>
            <p><strong>2. ใส่ข้อมูลความลับ:</strong></p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-muted-foreground">
              <li>คลิกปุ่ม <strong>Settings</strong> (ไอคอนรูปเฟือง มุมบนขวา)</li>
              <li>เลือกหัวข้อ <strong>Secrets</strong></li>
              <li>สร้างตัวแปรชื่อ <code className="text-foreground">GOOGLE_MAPS_PLATFORM_KEY</code></li>
              <li>วาง API Key โครงการของคุณ แล้วกดตอบตกลง</li>
            </ul>
            <p className="text-[11px] text-amber-600/90 italic">ระบบของ AI Studio จะสั่งรีบิวด์และแสดงแผนที่สวยงามขึ้นให้อัตโนมัติทันทีโดยไม่ต้องรีโหลดหน้าจอ!</p>
          </div>

          <div className="text-xs text-muted-foreground pt-2">
            ข้อมูลจำลองพิกัดอำเภอพิชัย (17.303, 100.123) จะแสดงขึ้นแทนเมื่อตรวจพบ API Key
          </div>
        </div>
      </div>
    );
  }

  // Phichai District average coordinates: 17.308, 100.124
  const defaultCenter = { lat: 17.308, lng: 100.124 };

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div
        id="map-screen"
        className="relative flex flex-col h-full w-full bg-background overflow-hidden text-foreground animate-fade-in-up"
      >
        {/* Style configurations for custom interactive markers on GMaps */}
        <style>{`
          .google-map-container {
            width: 100%;
            height: 100%;
          }
          .custom-gmap-marker {
            transition: transform 0.2s ease-out;
            cursor: pointer;
          }
          .custom-gmap-marker:hover {
            transform: scale(1.15);
            z-index: 9999 !important;
          }
        `}</style>

        {/* Map Search Panel */}
        <div className="absolute top-4 left-4 right-4 z-20 space-y-2.5 pointer-events-auto">
          <div className="relative z-[130] flex items-center gap-2.5 px-4 py-3 bg-card/95 backdrop-blur-md rounded-lg border border-border text-foreground">
            <Search className="w-5 h-5 text-primary" />
            <input
              type="text"
              value={mapSearchQuery}
              onChange={(e) => setMapSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && mapSearchResults.length > 0) {
                  event.preventDefault();
                  selectSearchResult(mapSearchResults[0]);
                }

                if (event.key === "Escape") {
                  setIsSearchFocused(false);
                }
              }}
              placeholder="ค้นหาวัฒนธรรมและเส้นทางลี้ลับในพิชัย..."
              className="text-xs font-semibold bg-transparent flex-1 outline-none text-foreground placeholder:text-muted-foreground"
            />
            {mapSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setMapSearchQuery("");
                  setIsSearchFocused(true);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
                aria-label="ล้างการค้นหา"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Suggestions dropdown */}
            {isSearchFocused && mapSearchQuery.trim() && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[140] max-h-72 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-lg">
                {mapSearchResults.length > 0 ? (
                  mapSearchResults.map((result) => {
                    const item = result.item;
                    return (
                    <button
                      key={`${result.type}-${item.id}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSearchResult(result)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-accent active:scale-[0.99]"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${result.type === "accommodation" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                        {result.type === "accommodation" ? <Bed className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-semibold text-muted-foreground">
                          {result.type === "accommodation" ? "ที่พัก" : result.item.locationCategory || "สถานที่ท่องเที่ยว"}
                        </p>
                      </div>
                    </button>
                  );})
                ) : (
                  <div className="px-4 py-5 text-center text-xs font-bold text-muted-foreground">
                    ไม่พบสถานที่ที่ค้นหา
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Routing Active Banner */}
          {activeRoutingPlace && (
            <div
              className="text-white px-4 py-3 rounded-2xl border border-white/10 flex items-center justify-between animate-pulse bg-primary"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary-foreground/70">กำลังนำทางลัดเลาะ</p>
                  <p className="text-xs font-bold text-primary-foreground truncate">ไป {activeRoutingPlace.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg text-primary-foreground">{distanceLabelMap[activeRoutingPlace.id] || activeRoutingPlace.distance}</span>
                <button
                  onClick={() => setActiveRoutingPlace(null)}
                  className="bg-destructive/80 hover:bg-destructive text-destructive-foreground font-bold text-[10px] px-2 py-1 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Horizontal Filter chips */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 text-[10px] font-bold rounded-full backdrop-blur-md shrink-0 transition-all cursor-pointer ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-card/85 text-foreground hover:bg-card"
                }`}
              >
                {f === "ทั้งหมด" ? "ทั้งหมด" : f === "วัฒนธรรม" ? "วัฒนธรรม" : f === "อาหาร" ? "ของกิน OTOP" : f === "ธรรมชาติ" ? "ธรรมชาติ" : f === "ที่พัก" ? "ที่พัก" : "จุดปลอดภัย"}
              </button>
            ))}
          </div>
        </div>

        {/* Google Map Container with customized AdvancedMarkers */}
        <div className="absolute inset-0 z-0">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={zoomLevel}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            gestureHandling="greedy"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: "100%", height: "100%" }}
          >
            {filteredPlaces.map((place) => {
              const { icon, colorClass } = getMarkerIconAndColor(place.id);
              const isSelected = !selectedAccommodation && place.id === selectedPlaceId;

              return (
                <AdvancedMarker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => handleMarkerClick(place.id)}
                >
                  <div className="relative flex items-center justify-center custom-gmap-marker" style={{ width: "32px", height: "32px" }}>
                    {isSelected ? (
                      <div className="absolute -inset-1.5 rounded-full bg-amber-400 opacity-70 animate-ping"></div>
                    ) : null}
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg ${
                      isSelected
                        ? "bg-amber-400 border-white text-foreground scale-125 z-50 font-bold"
                        : `${colorClass} border-white text-white scale-100 z-10`
                    }`}>
                      <span className="text-xs select-none">{icon}</span>
                    </div>
                    <div className={`absolute top-8 px-2 py-0.5 whitespace-nowrap bg-foreground/90 text-[8px] font-bold tracking-wide rounded border border-white/10 shadow-md ${
                      isSelected ? "text-amber-300 scale-105" : "text-muted-foreground hidden"
                    }`}>
                      {place.name.replace(" เมืองพิชัย", "").replace("พระยาพิชัยดาบหัก", "ดาบหัก")}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {filteredAccommodations.map((accommodation) => {
              const isSelected = selectedAccommodation?.id === accommodation.id;
              const colorClass = accommodation.marker_color || "bg-emerald-600";

              return (
                <AdvancedMarker
                  key={`accommodation-${accommodation.id}`}
                  position={{ lat: accommodation.lat, lng: accommodation.lng }}
                  onClick={() => handleAccommodationMarkerClick(accommodation)}
                >
                  <div className="relative flex items-center justify-center custom-gmap-marker" style={{ width: "32px", height: "32px" }}>
                    {isSelected ? (
                      <div className="absolute -inset-1.5 rounded-full bg-emerald-400 opacity-70 animate-ping"></div>
                    ) : null}
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg ${
                      isSelected
                        ? "bg-emerald-400 border-white text-foreground scale-125 z-50 font-bold"
                        : `${colorClass} border-white text-white scale-100 z-10`
                    }`}>
                      {/* Hotel icon instead of the legacy initial-letter glyph */}
                      <Hotel className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <div className={`absolute top-8 px-2 py-0.5 whitespace-nowrap bg-foreground/90 text-[8px] font-bold tracking-wide rounded border border-white/10 shadow-md ${
                      isSelected ? "text-emerald-300 scale-105" : "text-muted-foreground hidden"
                    }`}>
                      {accommodation.name}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {userLocation && (
              <AdvancedMarker position={userLocation}>
                <div className="relative flex items-center justify-center" style={{ width: "36px", height: "36px" }}>
                  <div className="absolute inset-0 rounded-full bg-primary/30 opacity-30 animate-pulse"></div>
                  <div className="absolute inset-1.5 rounded-full bg-primary/50 opacity-50 animate-ping"></div>
                  <div className="relative w-4.5 h-4.5 rounded-full bg-primary border-2 border-white shadow-xl flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                </div>
              </AdvancedMarker>
            )}

            <MapController
              selectedPlace={selectedMapTarget}
              zoomLevel={zoomLevel}
              onMapClick={handleMapClick}
              panToLocation={mapPanTarget}
            />
          </Map>
        </div>

        {/* Zoom Controllers & SOS float button */}
        {sheetState !== "detail" && (
          <div
            className="absolute right-4 z-[95] flex flex-col gap-2.5 pointer-events-auto transition-all duration-300 ease-out"
            style={{
              bottom: isLocationPreviewVisible
                ? "calc(var(--map-preview-bottom) + 260px)"
                : "calc(var(--map-preview-bottom) + 140px)"
            }}
          >
            <button
              onClick={() => handleZoom("in")}
              className="w-10 h-10 bg-card/90 text-foreground rounded-full flex items-center justify-center hover:bg-card active:scale-90 shadow-md backdrop-blur-sm cursor-pointer"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="w-10 h-10 bg-card/90 text-foreground rounded-full flex items-center justify-center hover:bg-card active:scale-90 shadow-md backdrop-blur-sm cursor-pointer"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            {/* GPS Compass Button */}
            <button
              onClick={handleCenterOnUser}
              disabled={isLocating}
              className="w-10 h-10 bg-card/90 text-primary rounded-full flex items-center justify-center hover:bg-card active:scale-90 shadow-md backdrop-blur-sm cursor-pointer"
              title="ตำแหน่งปัจจุบันของคุณ"
            >
              <Compass className={`w-5 h-5 ${isLocating ? "animate-spin text-amber-500" : ""}`} />
            </button>

            {/* Red SOS Button */}
            <button
              onClick={onSOSClick}
              className="w-12 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full flex items-center justify-center active:scale-95 shadow-xl shadow-destructive/40 animate-pulse mt-4 cursor-pointer"
            >
              <span className="font-mono font-bold text-xs">SOS</span>
            </button>
          </div>
        )}

        {/* Map place draggable bottom sheet */}
        {showPopup && selectedMapTarget && (
          sheetState === "detail" ? (
            /* Full Screen Detail Custom Sheet wrapper */
            <div
              className={`absolute inset-0 z-[120] h-[100dvh] overflow-hidden bg-card transition-transform duration-300 ease-out pointer-events-auto flex flex-col ${
                isDetailDragging ? "transition-none" : ""
              }`}
              style={{
                transform: `translateY(${detailDragOffsetY}px)`
              }}
            >
              {/* Minimal Overlay Handle */}
              <div
                className="map-detail-top-handle absolute left-1/2 top-[calc(10px+env(safe-area-inset-top))] z-[150] -translate-x-1/2 touch-none select-none flex flex-col items-center cursor-grab active:cursor-grabbing"
                onPointerDown={(event) => {
                  event.preventDefault();
                  try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch(e) {}
                  startDetailDrag(event.clientY);
                }}
                onTouchStart={(event) => {
                  event.preventDefault();
                  startDetailDrag(event.touches[0].clientY);
                }}
              >
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30 shadow-sm" />
              </div>

              {/* Detail Content Area */}
              <div className="flex-1 overflow-hidden relative h-full w-full">
                {selectedAccommodation ? (
                  <AccommodationDetailView
                    accommodation={selectedAccommodation}
                    userLocation={userLocation}
                    isSaved={savedItems.some((s) => s.kind === "hotel" && s.id === selectedAccommodation.id)}
                    onToggleSave={() => onToggleSave?.("hotel", selectedAccommodation.id)}
                    onBack={() => setSheetState("compact")}
                  />
                ) : selectedPlace ? (
                  <PlaceDetailView
                    place={selectedPlace}
                    userLocation={userLocation}
                    isCheckedIn={checkedInIds.includes(selectedPlace.id)}
                    isSaved={savedItems.some((s) => s.kind === "place" && s.id === selectedPlace.id)}
                    onToggleSave={() => onToggleSave?.("place", selectedPlace.id)}
                    onBack={() => setSheetState("compact")}
                    onCheckIn={onCheckIn || (() => {})}
                    onNavigate={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    displayName={displayName}
                    showGestureHandle={false}
                    scrollRef={detailScrollRef}
                    onTouchStart={(event) => {
                      detailStartYRef.current = event.touches[0].clientY;
                    }}
                    onTouchMove={(event) => {
                      const currentY = event.touches[0].clientY;
                      const startY = detailStartYRef.current;

                      if (startY === null) return;

                      const delta = currentY - startY;

                      if (delta > 8 && isDetailScrollAtTop()) {
                        if (event.cancelable) event.preventDefault();

                        if (!detailDraggingRef.current) {
                          startDetailDrag(startY);
                        }

                        moveDetailDrag(currentY);
                      }
                    }}
                    onTouchEnd={() => {
                      if (detailDraggingRef.current) {
                        endDetailDrag();
                      }

                      detailStartYRef.current = null;
                    }}
                    onWheel={(event) => {
                      if (event.deltaY < -20 && isDetailScrollAtTop()) {
                        setSheetState("compact");
                      }
                    }}
                  />
                ) : null}
              </div>
            </div>
          ) : (
            /* Compact / Preview Bottom Sheet */
            <div
              style={{
                transform: sheetState === "hidden" ? "translateY(320px)" : `translateY(${compactDragOffsetY}px)`,
                transition: !isCompactDragging ? "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease" : "none"
              }}
              className={`map-sheet map-location-compact-box absolute inset-x-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[80] rounded-[2rem] bg-card shadow-xl flex flex-col pointer-events-auto border border-border overflow-hidden ${
                isCompactDragging ? "dragging transition-none" : ""
              } ${
                sheetState === "transitioning"
                  ? "fixed left-0 right-0 bottom-0 h-[92vh] rounded-t-[2rem] rounded-b-none border-t border-border"
                  : ""
              }`}
              onPointerDown={(event) => {
                if (isInteractiveElement(event.target)) return;
                event.preventDefault();
                try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch(e) {}
                startCompactDrag(event.clientY);
              }}
              onTouchStart={(event) => {
                if (isInteractiveElement(event.target)) return;
                event.preventDefault();
                startCompactDrag(event.touches[0].clientY);
              }}
            >
              {/* Smooth Top Drag Handle Area */}
              <div
                className="map-sheet-drag-handle w-full py-3 flex flex-col items-center cursor-grab active:cursor-grabbing shrink-0 select-none bg-muted border-b border-border rounded-t-[2rem] touch-none"
              >
                {/* Rounded Gray Bar */}
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full"></div>
                {sheetState === "transitioning" ? (
                  <span className="text-xs font-medium text-muted-foreground mt-1 animate-pulse">
                    กำลังดาวน์โหลดข้อมูลพิกัดท่องเที่ยว...
                  </span>
                ) : null}
              </div>

              {/* Bottom Sheet Inner Content */}
              <div className="p-[var(--map-preview-padding)] flex-1 flex flex-col min-h-0 overflow-hidden">

                {/* Core Place Info Row */}
                {selectedAccommodation ? (
                  <div className="flex gap-4 shrink-0">
                    <img
                      src={selectedAccommodation.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
                      alt={selectedAccommodation.name}
                      className="w-20 h-16 rounded-xl object-cover bg-muted shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 h-auto rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                            ที่พัก
                          </Badge>
                          {selectedAccommodation.rating && (
                            <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs shrink-0">
                              <Star className="w-3 h-3 fill-amber-500" /> <span className="text-foreground font-bold">{selectedAccommodation.rating}</span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-foreground truncate mt-1">
                          {selectedAccommodation.name}
                        </h4>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          <Bed className="w-3 h-3 inline-block mr-0.5" /> {selectedAccommodation.priceRange || "สอบถามราคา"}
                        </p>
                        <p className="text-[10px] text-primary font-bold mt-0.5">
                          <MapPin className="w-3 h-3 inline-block mr-0.5" /> {distanceLabelMap[selectedAccommodation.id] || "พิกัดในอำเภอพิชัย"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : selectedPlace ? (
                  <div className="flex gap-4 shrink-0">
                    <img
                      src={selectedPlace.image_url || selectedPlace.imageUrl || selectedPlace.image}
                      alt={selectedPlace.name}
                      className="w-20 h-16 rounded-xl object-cover bg-muted shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 h-auto rounded-full uppercase tracking-wider">
                            {selectedPlace.locationCategory}
                          </Badge>
                          {selectedPlace.rating && (
                            <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs shrink-0">
                              <Star className="w-3 h-3 fill-amber-500" /> <span className="text-foreground font-bold">{selectedPlace.rating}</span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-foreground truncate mt-1">
                          {selectedPlace.name}
                        </h4>
                        <p className="text-[10px] text-primary font-bold mt-0.5">
                          <MapPin className="w-3 h-3 inline-block mr-0.5" /> {distanceLabelMap[selectedPlace.id] || selectedPlace.distance || "พิกัดในอำเภอพิชัย"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {sheetState === "transitioning" ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-4 border-t-primary border-primary/20 animate-spin flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-foreground">
                        กำลังเปิดรายละเอียด...
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        สัมผัสเรื่องเล่าอันเป็นเอกลักษณ์และบริการใกล้เคียงที่คัดสรรมาเพื่อคุณ
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-foreground mt-2.5 line-clamp-2 leading-relaxed shrink-0">
                      {selectedAccommodation ? selectedAccommodation.description : selectedPlace?.desc}
                    </p>

                    <div className="flex gap-2.5 mt-auto pt-2 shrink-0">
                      <button
                        onPointerDown={(event) => event.stopPropagation()}
                        onTouchStart={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          openPlaceDetailWithTransition();
                        }}
                        className={`flex-1 py-3 ${selectedAccommodation ? "bg-emerald-600 hover:bg-emerald-600/90 shadow-emerald-600/30" : "bg-primary hover:bg-primary/90 shadow-primary/30"} text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูรายละเอียด</span>
                      </button>

                      <button
                        onPointerDown={(event) => event.stopPropagation()}
                        onTouchStart={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (selectedAccommodation) {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedAccommodation.lat},${selectedAccommodation.lng}`;
                            window.open(url, "_blank", "noopener,noreferrer");
                          } else if (selectedPlace) {
                            handleGetDirections(selectedPlace);
                          }
                        }}
                        className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-400/10"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>ขอเส้นทาง</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        )}

        {/* Pull Handle (Only visible when hidden) */}
        {showPopup && selectedMapTarget && sheetState === "hidden" && (
          <div
            style={{
              transform: `translateX(-50%) translateY(${dragOffsetY}px)`,
              transition: dragStartY === null ? "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms" : "none"
            }}
            onPointerDown={(e) => {
              (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
              setDragStartY(e.clientY);
            }}
            onPointerMove={(e) => {
              if (dragStartY === null) return;
              const delta = e.clientY - dragStartY;
              if (delta < 0) {
                setDragOffsetY(delta);
              }
            }}
            onPointerUp={(e) => {
              if (dragStartY === null) return;
              (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
              if (dragOffsetY < -30) {
                setSheetState("compact");
              } else {
                if (Math.abs(dragOffsetY) < 5) {
                  setSheetState("compact");
                }
              }
              setDragStartY(null);
              setDragOffsetY(0);
            }}
            onPointerCancel={(e) => {
              if (dragStartY === null) return;
              (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
              setDragStartY(null);
              setDragOffsetY(0);
            }}
            onClick={() => {
              setSheetState("compact");
            }}
            className="fixed left-1/2 -translate-x-1/2 bottom-[var(--map-preview-bottom)] z-40 bg-card border border-primary/20 shadow-xl rounded-full px-5 py-2.5 text-xs font-bold text-primary flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer select-none"
          >
            <ChevronUp className="w-3.5 h-3.5 animate-pulse" />
            <span className="truncate max-w-[180px]">
              ดึงขึ้นเพื่อดู {selectedAccommodation?.name || selectedPlace?.name}
            </span>
          </div>
        )}
      </div>
    </APIProvider>
  );
}
