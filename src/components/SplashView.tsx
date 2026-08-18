import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import ThongdeeGoLogo from "./ThongdeeGoLogo";

interface SplashViewProps {
  onNext: () => void;
}

export default function SplashView({ onNext }: SplashViewProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const sloganRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(logoRef.current, { scale: 0.3, opacity: 0, rotation: -8, duration: 0.8 })
      .from(titleRef.current, { y: 30, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(subtitleRef.current, { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(sloganRef.current, { opacity: 0, scale: 0.85, duration: 0.5 }, "-=0.2")
      .from(ctaRef.current, { y: 40, opacity: 0, duration: 0.6 }, "-=0.2");
    return () => { tl.kill(); };
  }, []);

  return (
    <div
      id="splash-screen"
      className="relative flex flex-col justify-between items-center h-full w-full bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground overflow-hidden"
    >
      <div className="absolute top-[-10%] right-[-15%] w-72 h-72 rounded-full border border-primary-foreground/10 pointer-events-none" />
      <div className="absolute top-[20%] left-[-20%] w-96 h-96 rounded-full border border-primary-foreground/5 pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl pointer-events-none" />

      <div />

      <div className="flex flex-col items-center text-center z-10">
        <div ref={logoRef}>
          <ThongdeeGoLogo size={140} showBg={true} className="mb-6 rounded-3xl border-4 border-amber-400/80 shadow-2xl shadow-black/60" />
        </div>
        <h1 ref={titleRef} className="text-7xl font-extrabold tracking-wider font-sans mb-2 drop-shadow-md">
          ทองดี <span className="text-amber-400">โก</span>
        </h1>
        <p ref={subtitleRef} className="text-sm font-light text-primary-foreground/80 uppercase tracking-widest max-w-[280px]">
          DIGITAL CULTURE & TOURISM
        </p>
        <div ref={sloganRef} className="mt-8 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/15 backdrop-blur-sm">
          <p className="text-xs font-medium text-amber-300">
            &ldquo;เที่ยวเมืองรอง เข้าใจวัฒนธรรม ด้วย AI&rdquo;
          </p>
        </div>
      </div>

      <div ref={ctaRef} className="w-full flex flex-col items-center z-10">
        <button
          id="btn-splash-continue"
          onClick={onNext}
          className="w-full max-w-[285px] py-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-primary text-base font-semibold rounded-full shadow-xl transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
        >
          เข้าสู่แอปพลิเคชัน
        </button>
      </div>
    </div>
  );
}
