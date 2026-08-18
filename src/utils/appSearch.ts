export interface SearchMenuItem {
  id: string;
  type: "menu";
  title: string;
  subtitle: string;
  keywords: string[];
  icon: string;
  iconName: string;
  action: "home" | "map" | "trip-planner" | "marketplace" | "taxi" | "weather" | "profile" | "passport";
  screenId: number;
}

export const appMenuSearchItemsTH: SearchMenuItem[] = [
  {
    id: "home",
    type: "menu",
    title: "หน้าแรก",
    subtitle: "กลับไปหน้าหลักของแอปพลิเคชัน",
    keywords: ["home", "หน้าแรก", "หน้าหลัก", "กลับ"],
    icon: "",
    iconName: "home",
    action: "home",
    screenId: 4
  },
  {
    id: "map",
    type: "menu",
    title: "แผนที่ทองดีนำทาง",
    subtitle: "ค้นหาสถานที่ท่องเที่ยว วัฒนธรรม และจุดปลอดภัย",
    keywords: ["map", "maps", "แผนที่", "สถานที่", "นำทาง", "พิกัด", "เส้นทาง"],
    icon: "",
    iconName: "map",
    action: "map",
    screenId: 8
  },
  {
    id: "trip-planner",
    type: "menu",
    title: "วางแผนเที่ยวด้วย AI",
    subtitle: "สร้างแผนท่องเที่ยวอัจฉริยะและดูทริปวันนี้",
    keywords: ["trip", "plan", "planner", "แผนเที่ยว", "ทริป", "ทริปวันนี้", "เดินทาง", "จัดทริป", "สร้างทริป"],
    icon: "",
    iconName: "compass",
    action: "trip-planner",
    screenId: 5
  },
  {
    id: "marketplace",
    type: "menu",
    title: "ตลาดชุมชนออนไลน์",
    subtitle: "สินค้า OTOP ของฝาก และของดีเมืองพิชัย",
    keywords: ["market", "shop", "สินค้า", "ตลาด", "ของฝาก", "otop", "sme", "ซื้อของ", "ช้อปปิ้ง"],
    icon: "",
    iconName: "shopping-bag",
    action: "marketplace",
    screenId: 23
  },
  {
    id: "taxi",
    type: "menu",
    title: "รถรับจ้างท้องถิ่น",
    subtitle: "เรียกรถหรือดูผู้ให้บริการขับขี่ในพื้นที่",
    keywords: ["taxi", "รถ", "รถรับจ้าง", "เดินทาง", "รับส่ง", "เรียกมอไซค์", "รถยนต์"],
    icon: "",
    iconName: "car",
    action: "taxi",
    screenId: 21
  },
  {
    id: "weather",
    type: "menu",
    title: "สภาพอากาศพิชัย",
    subtitle: "ตรวจเช็คสภาพอากาศและพยากรณ์ก่อนเดินทาง",
    keywords: ["weather", "อากาศ", "ฝน", "แดด", "พยากรณ์", "อุณหภูมิ"],
    icon: "",
    iconName: "cloud-sun",
    action: "weather",
    screenId: 26
  },
  {
    id: "profile",
    type: "menu",
    title: "โปรไฟล์ & การตั้งค่า",
    subtitle: "จัดการบัญชี ภาษา และระบบความปลอดภัย",
    keywords: ["profile", "โปรไฟล์", "ตั้งค่า", "บัญชี", "ภาษา", "ความปลอดภัย"],
    icon: "",
    iconName: "user",
    action: "profile",
    screenId: 12
  },
  {
    id: "passport",
    type: "menu",
    title: "พาสปอร์ตดิจิทัล",
    subtitle: "สะสมแสตมป์ท่องเที่ยว และประวัติการเดินทาง",
    keywords: ["passport", "พาสปอร์ต", "แสตมป์", "เช็คอิน", "stamp", "สะสม", "เหรียญตรา"],
    icon: "",
    iconName: "book-open",
    action: "passport",
    screenId: 10
  }
];

export const appMenuSearchItemsEN: SearchMenuItem[] = [
  {
    id: "home",
    type: "menu",
    title: "Home",
    subtitle: "Return to the home screen",
    keywords: ["home", "main", "back", "welcome"],
    icon: "",
    iconName: "home",
    action: "home",
    screenId: 4
  },
  {
    id: "map",
    type: "menu",
    title: "Interactive Map",
    subtitle: "Find cultural places, attractions and safety zones",
    keywords: ["map", "maps", "location", "navigation", "route", "gps"],
    icon: "",
    iconName: "map",
    action: "map",
    screenId: 8
  },
  {
    id: "trip-planner",
    type: "menu",
    title: "AI Trip Planner",
    subtitle: "Generate custom smart itineraries & view today's trip",
    keywords: ["trip", "plan", "planner", "itinerary", "generate", "schedule", "travel"],
    icon: "",
    iconName: "compass",
    action: "trip-planner",
    screenId: 5
  },
  {
    id: "marketplace",
    type: "menu",
    title: "OTOP Marketplace",
    subtitle: "Shop local souvenirs, food & OTOP crafts",
    keywords: ["market", "shop", "shopping", "goods", "souvenir", "otop", "store"],
    icon: "",
    iconName: "shopping-bag",
    action: "marketplace",
    screenId: 23
  },
  {
    id: "taxi",
    type: "menu",
    title: "Local Taxi Service",
    subtitle: "Find verified local drivers & call a ride",
    keywords: ["taxi", "ride", "driver", "transport", "shuttle", "car"],
    icon: "",
    iconName: "car",
    action: "taxi",
    screenId: 21
  },
  {
    id: "weather",
    type: "menu",
    title: "Phichai Weather",
    subtitle: "Check local live weather & forecast",
    keywords: ["weather", "forecast", "rain", "temperature", "climate", "sun"],
    icon: "",
    iconName: "cloud-sun",
    action: "weather",
    screenId: 26
  },
  {
    id: "profile",
    type: "menu",
    title: "Profile & Settings",
    subtitle: "Manage account, languages & safety options",
    keywords: ["profile", "settings", "account", "language", "safety", "logout"],
    icon: "",
    iconName: "user",
    action: "profile",
    screenId: 12
  },
  {
    id: "passport",
    type: "menu",
    title: "Digital Passport",
    subtitle: "Collect digital stamps & view travel diaries",
    keywords: ["passport", "stamp", "checkin", "diary", "stamps", "badges", "history"],
    icon: "",
    iconName: "book-open",
    action: "passport",
    screenId: 10
  }
];
