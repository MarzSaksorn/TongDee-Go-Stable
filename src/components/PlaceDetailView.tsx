import React, { useState, useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { ChevronLeft, Star, MapPin, Volume2, VolumeX, Navigation, BookOpen, Clock, AlertTriangle, Lightbulb, CheckCircle2, Sparkles, Play, Pause } from "lucide-react";
import { Attraction } from "../types";
import { getDistanceKm, formatDistanceKm } from "../utils/distance";


interface PlaceDetailViewProps {
  place: Attraction;
  isCheckedIn: boolean;
  onBack: () => void;
  onCheckIn: (id: string) => void;
  onNavigate: (name: string) => void;
  displayName?: string;
  showGestureHandle?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
  onTouchMove?: React.TouchEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  onWheel?: React.WheelEventHandler<HTMLDivElement>;
  userLocation?: { lat: number; lng: number } | null;
}

export default function PlaceDetailView({
  place,
  isCheckedIn,
  onBack,
  onCheckIn,
  onNavigate,
  displayName = "คุณแมว",
  showGestureHandle = false,
  scrollRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onWheel,
  userLocation
}: PlaceDetailViewProps) {
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const toggleVideoPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsVideoPlaying(true);
    } else {
      v.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) setVideoTime(videoRef.current.currentTime);
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) setVideoDuration(videoRef.current.duration || 0);
  };

  const handleVideoSeek = (time: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = time;
    setVideoTime(time);
  };

  const formatVideoTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const hero = document.querySelector(".place-hero");
    const media = document.querySelector(".place-hero-media");
    if (!hero || !media) return;
    // Parallax ONLY the media — tweening the whole hero container would
    // slide the video controls and title over the detail text below.
    const tween = gsap.to(media, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: 0.5 }
    });
    // Kill only this tween's trigger — ScrollTrigger.getAll() would kill
    // every trigger in the app (e.g. HomeView's), breaking its animations.
    return () => {
      const st = tween.scrollTrigger as ScrollTrigger | undefined;
      st?.kill();
      tween.kill();
    };
  }, []);

  const computedDistanceLabel = useMemo(() => {
    if (!userLocation) return place.distance;
    const km = getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng);
    return formatDistanceKm(km, "TH");
  }, [userLocation, place]);

  const handleCheckInClick = () => {
    onCheckIn(place.id);
    setJustCheckedIn(true);
    setTimeout(() => {
      setJustCheckedIn(false);
    }, 4000);
  };

  const hasVideo = !!(place.video_url || place.videoUrl);

  return (
    <div 
      id="place-detail-screen" 
      className="flex flex-col h-full w-full bg-background relative overflow-hidden"
    >
      {/* Collapse handle for map sheet context */}
      {showGestureHandle ? (
        <div className="absolute top-[calc(10px+env(safe-area-inset-top))] left-0 right-0 flex justify-center z-40 pointer-events-auto">
          <button 
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onBack();
            }}
            className="px-6 py-2.5 bg-black/60 hover:bg-black/80 text-white active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-full border border-white/20 shadow-lg backdrop-blur-md"
            title="ย้อนกลับ (เลื่อนลง / ปิดโหมดเต็มจอ)"
          >
            <div className="w-12 h-1.5 bg-white/80 rounded-full"></div>
            <span className="text-[8px] font-bold tracking-widest leading-none">COLLAPSE</span>
          </button>
        </div>
      ) : (
        <div className="absolute top-[calc(12px+env(safe-area-inset-top))] left-4 z-40">
          <button 
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onBack();
            }}
            className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center border border-white/10 shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            title="ย้อนกลับ"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        className="flex-1 overflow-y-auto location-detail-scroll-content map-detail-scroll h-full overscroll-contain bg-background"
      >
        {/* Hero Section */}
        <div className="place-hero isolate relative h-[38vh] min-h-[280px] w-full overflow-hidden bg-muted">
          {hasVideo ? (
            <video
              ref={videoRef}
              src={place.video_url || place.videoUrl || undefined}
              poster={place.image_url || place.imageUrl || place.image}
              className="w-full h-full object-cover place-hero-media"
              autoPlay
              muted={isVideoMuted}
              loop
              playsInline
              preload="metadata"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
          ) : (
            <img
              src={place.image_url || place.imageUrl || place.image}
              alt={place.name}
              className="w-full h-full object-cover place-hero-media"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Mute toggle for video */}
          {hasVideo && (
            <div className="absolute top-[calc(12px+env(safe-area-inset-top))] right-4 z-10">
              <button 
                onPointerDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsVideoMuted(!isVideoMuted);
                }}
                className="w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center bg-black/40 text-white border border-white/10 hover:bg-black/60 transition-all pointer-events-auto"
                title={isVideoMuted ? "เปิดเสียง" : "ปิดเสียง"}
              >
                {isVideoMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
              </button>
            </div>
          )}

          {/* Video controls: play/pause, seek, time */}
          {hasVideo && (
            <>
              {/* Black fade follows down to the video's bottom edge */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 inset-x-0 z-10 px-3 pb-1 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={toggleVideoPlay}
                  aria-label={isVideoPlaying ? "หยุดวิดีโอ" : "เล่นวิดีโอ"}
                  className="w-9 h-9 shrink-0 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer"
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={videoDuration || 0}
                  step={0.1}
                  value={videoTime}
                  onChange={(e) => handleVideoSeek(Number(e.target.value))}
                  aria-label="เลือกช่วงเวลา"
                  className="flex-1 h-1.5 accent-primary cursor-pointer"
                />
                <span className="text-[10px] font-bold text-white/90 tabular-nums shrink-0">
                  {formatVideoTime(videoTime)} / {formatVideoTime(videoDuration)}
                </span>
              </div>
              </div>
            </>
          )}

          {/* Title overlay (raised when video controls are shown) */}
          <div className={`absolute left-5 right-5 text-white ${hasVideo ? "bottom-20" : "bottom-4"}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-white text-[10px] font-extrabold rounded-md tracking-wider uppercase bg-primary shadow-lg">
              <MapPin className="w-3 h-3" />
              {place.locationCategory}
            </span>
            <h1 className="text-2xl font-extrabold mt-2 text-white leading-tight drop-shadow-lg">
              {place.name}
            </h1>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="flex items-stretch gap-3 px-5 -mt-4 relative z-10 mb-4">
          <div className="flex-1 bg-card border border-border rounded-2xl px-3.5 py-3 flex flex-col items-center justify-center gap-1 shadow-sm">
            <div className="flex items-center gap-1 font-extrabold text-foreground text-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{place.rating}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Rating</span>
          </div>
          <div className="flex-1 bg-card border border-border rounded-2xl px-3.5 py-3 flex flex-col items-center justify-center gap-1 shadow-sm">
            <div className="flex items-center gap-1 font-extrabold text-primary text-sm">
              <MapPin className="w-4 h-4" />
              <span>{computedDistanceLabel}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {userLocation ? "จากคุณ" : "Distance"}
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-5 pb-32 space-y-4">

          {/* History Summary */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>ประวัติย่อสถานที่</span>
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed font-light">
              {place.historySummary}
            </p>
          </div>

          {/* Cultural Highlights */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>จุดเด่นทางวัฒนธรรมหัตถการ</span>
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed font-light">
              {place.culturalHighlights}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3" />
                เวลาแนะนำ
              </span>
              <span className="text-sm font-bold text-foreground">{place.bestTime}</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3" />
                ความยากง่าย
              </span>
              <span className="text-sm font-bold text-emerald-600">เดินเท้าสะดวก</span>
            </div>
          </div>

          {/* Need to Know */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>ข้อควรรู้ในการมาเยือน</span>
            </h3>
            <ul className="text-[13px] text-muted-foreground space-y-2 font-light">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{place.needToKnow}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>มีเจ้าหน้าที่และกล้องวงจรปิดครอบคลุมเกือบทุกตารางเมตร</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>มีรักษารหัส OTOP สนับสนุนร้านค้าริมทางโดยรอบ</span>
              </li>
            </ul>
          </div>

          {/* Check-in Success Toast */}
          {justCheckedIn && (
            <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 block">
                  เช็คอินสำเร็จ
                </span>
                <span className="text-xs text-emerald-600/70 dark:text-emerald-500/70 font-medium">
                  {displayName} ได้บันทึกการมาเยือน {place.name} เรียบร้อย
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="absolute bottom-3 left-3 right-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg flex gap-2.5 safe-area-bottom">
        <button
          onClick={() => onNavigate(place.name)}
          className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/30"
        >
          <Navigation className="w-4 h-4" />
          <span>นำทาง</span>
        </button>

        <button
          onClick={handleCheckInClick}
          disabled={isCheckedIn}
          className={`py-3 px-4 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 ${
            isCheckedIn
              ? "bg-emerald-500 text-white shadow-sm cursor-default opacity-80"
              : "bg-amber-400 hover:bg-amber-300 text-foreground shadow-md shadow-amber-400/20"
          }`}
        >
          {isCheckedIn ? (
            <><CheckCircle2 className="w-4 h-4" /><span className="hidden sm:inline">เช็คอินแล้ว</span></>
          ) : (
            <><MapPin className="w-4 h-4" /><span className="hidden sm:inline">เช็คอิน</span></>
          )}
        </button>
      </div>
    </div>
  );
}
