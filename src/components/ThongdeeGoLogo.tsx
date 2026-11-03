import React from "react";

interface ThongdeeGoLogoProps {
  className?: string;
  size?: number | string;
  showBg?: boolean;
}

export default function ThongdeeGoLogo({ className = "", size = "100%", showBg = true }: ThongdeeGoLogoProps) {
  const logoUrl = "https://pub-b73952151b5a4abc954f3ac7693e3b6a.r2.dev/App-logo.png";
  
  return (
    <div 
      className={`relative select-none overflow-hidden flex items-center justify-center ${className}`}
      style={{ 
        width: typeof size === "number" ? `${size}px` : size, 
        height: typeof size === "number" ? `${size}px` : size,
        backgroundColor: showBg ? "#000000" : "transparent",
        borderRadius: showBg ? "1.5rem" : "0",
        boxShadow: showBg ? "0 20px 40px -10px rgba(0, 0, 0, 0.5)" : "none"
      }}
    >
      <img
        src={logoUrl}
        alt="Thongdee Go Logo"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
