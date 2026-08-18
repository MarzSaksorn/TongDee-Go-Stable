import React, { useState } from "react";
import { ChevronLeft, Star, MapPin, Coffee, Utensils, Compass, Phone, Sparkles, Navigation, Award, CheckCircle, Clock } from "lucide-react";
import { LOCAL_FOODS } from "../data";

interface LocalShopDetailViewProps {
  onBack: () => void;
  shopName?: string;
}

export default function LocalShopDetailView({
  onBack,
  shopName,
}: LocalShopDetailViewProps) {
  // Let's create high fidelity catalog details of 4 top local businesses in Phichai
  const shops = [
    {
      name: "ไส้กรอกใหญ่รสเด็ดโบราณพิชัย",
      category: "สตรีทฟู้ด OTOP",
      desc: "ร้านไส้กรอกโบราณสูตรใบชะครามและสมุนไพรออชาร์ดรสออแกนิก เป็นไส้กรอกหมูชิ้นยักษ์ที่ปิ้งบนเตาถ่านไม้โกงกางหอมฟุ้ง ได้รับรางวัลอาหารประจำจังหวัดดีเด่น ปี 2567",
      specialty: "ไส้กรอกยักษ์รสสมุนไพรโบราณและใบข่าหมั่นโถว",
      priceRange: "15 - 40 บาท (ประหยัดมาก)",
      address: "ตรงข้ามซอยตรอกโรงยา ชุมชนวัดหน้าพระธาตุ อำเภอพิชัย",
      phone: "089-702-XXXX",
      hours: "07:00 น. - 12:00 น. (หมดไวมาก)",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      rating: 4.9,
    },
    {
      name: "ขนมวงร้านคุณยายละมุน",
      category: "ขนมดั้งเดิม",
      desc: "คุณยายละมุนสืบทอดแป้งนุ่มนิ่มทอเสร็จสิ้นจากมันเทศไทย นำมานวดคลุกเคล้าราดน้ำตาลเคี่ยวหอมอ้อยดั้งเดิม รสสัมผัสกรอบนอกนุ่มใน หวานละมุนชื่นชอบคู่ชาหรือกาแฟโบราณ",
      specialty: "ขนมวงโบราณเคลือบหวานน้ำตาลอ้อยแท้",
      priceRange: "5 - 10 บาท (อร่อยลืมใจ)",
      address: "ซอกมุมตลาดสดนายเฉลิม ในเมืองพิชัยเก่า",
      phone: "084-551-XXXX",
      hours: "06:00 น. - 09:30 น. (ช่วงสายจะหมด)",
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
      rating: 4.8,
    },
    {
      name: "คอฟฟี่ชุมชน น่านริเวอร์ไซด์",
      category: "คาเฟ่ท้องถิ่น",
      desc: "เรือนไม้ริมน้ำน่านโบราณที่นำมารีโนเวทเป็นบาร์ริเวอร์ไซด์แสนร่มรื่น เสิร์ฟกาแฟคั่วเมล็ดพันธุ์ภาคเหนือ และโซดาน้ำมะพร้าวสดออแกนิกที่คัดจากไร่สวนเพื่อนฝูงบ้านดารา",
      specialty: "กาแฟดริปสัญจร & อเมริกาโน่น้ำอ้อยเคี่ยวพิชัย",
      priceRange: "45 - 65 บาท",
      address: "เลียบโค้งแม่น้ำน่าน ถัดจากสถานีรถไฟชุมทางบ้านดารา",
      phone: "081-324-XXXX",
      hours: "09:00 น. - 17:30 น. (ปิดวันพุธ)",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
      rating: 4.7,
    }
  ];

  // Resolve matching shop or default
  const activeShop = shops.find(s => s.name === shopName) || shops[0];
  const [clickedBook, setClickedBook] = useState(false);

  return (
    <div
      id="shop-detail-screen"
      className="flex flex-col h-full w-full bg-white pb-20 overflow-y-auto animate-fade-in-up"
    >
      {/* Hero Header image with gradient covering */}
      <div className="relative h-60 w-full shrink-0">
        <img 
          src={activeShop.image} 
          alt={activeShop.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Navigation Action header placeholder */}
        <div className="absolute top-4 left-4 z-45">
          <button 
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center border border-white/10 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            title="ย้อนกลับ"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Categories tags overlay */}
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-[9px] font-bold rounded tracking-wider uppercase">
            {activeShop.category} • พันธมิตรอุดหนุนท้องถิ่น
          </span>
          <h1 className="text-lg font-bold mt-1 text-white leading-tight drop-shadow-sm">
            {activeShop.name}
          </h1>
        </div>
      </div>

      {/* Stats Summary strip */}
      <div className="grid grid-cols-2 divide-x divide-gray-150 border-b border-gray-100 py-3 text-center text-xs bg-gray-50/50 shrink-0">
        <div className="flex flex-col items-center justify-center gap-0.5">
          <div className="flex items-center gap-0.5 font-bold text-gray-800">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{activeShop.rating} / 5.0</span>
          </div>
            <span className="text-[10px] text-gray-400">เรตติ้งรสเด็ด</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="font-bold text-primary">{activeShop.priceRange}</span>
            <span className="text-[10px] text-gray-400">ระดับย่อมเยา</span>
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1">
        
        {/* Core Review statement */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-500">ABOUT THIS SHOP</span>
          <p className="text-xs text-gray-600 leading-relaxed font-light">
            {activeShop.desc}
          </p>
        </div>

        {/* Specialty Highlight Cards */}
        <div className="p-4 bg-amber-50 border border-amber-100/50 rounded-xl">
          <h3 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>เมนูแนะนำ OTOP เด่นในพิชัย:</span>
          </h3>
          <p className="text-xs text-amber-800 font-semibold leading-relaxed">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500 inline-block mr-1" /> {activeShop.specialty}
          </p>
        </div>

        {/* Practical Store Information Info */}
        <div className="space-y-3 pt-2 text-xs">
          <h3 className="text-xs font-medium text-gray-500 font-sans">
            <Phone className="w-3.5 h-3.5 inline-block mr-1" /> ข้อมูลติดต่อและการเปิด-ปิด
          </h3>

          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2.5 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="w-3 h-3" />
              </span>
              <span>เวลาทำการ: <strong>{activeShop.hours}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-rose-50 text-rose-500 flex items-center justify-center">
                <Phone className="w-3 h-3" />
              </span>
              <span>โทรสอบถาม: <strong className="font-mono">{activeShop.phone}</strong></span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3 h-3" />
              </span>
              <span className="leading-tight">พิกัดสถานที่: <strong>{activeShop.address}</strong></span>
            </div>
          </div>
        </div>

        {/* Dynamic OTOP Booking or Check Reservation Simulation */}
        <div className="pt-3">
          {clickedBook ? (
            <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl flex items-center gap-2 animate-fade-in text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>จองสิทธิ์สำเร็จ:</strong> บัดดี้ได้ส่งรหัสสิทธิพิเศษของร้านค้าให้กับคุณแล้ว แสดงรหัสนี้หน้าร้านเมื่อชำระเงินเพื่อรับส่วนลด 10% !
              </span>
            </div>
          ) : (
            <button
              onClick={() => setClickedBook(true)}
              className="w-full py-4 text-white active:scale-95 transition-all text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 flex justify-center items-center gap-1.5 hover:opacity-95 bg-gradient-to-r from-primary to-primary/80"
            >
              <Award className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>ขอรับโค้ดสิทธิ์ส่วนลด OTOP ทันตัว</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
