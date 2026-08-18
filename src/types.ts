export interface Attraction {
  id: string;
  name: string;
  desc: string;
  distance: string;
  locationCategory: string; // "วัฒนธรรม" | "อาหาร" | "ธรรมชาติ" | "ความสะดวก" | "จุดปลอดภัย"
  rating: number;
  historySummary: string;
  culturalHighlights: string;
  bestTime: string;
  needToKnow: string;
  image: string;
  image_url?: string;
  imageUrl?: string;
  audioStory: string;
  lat: number;
  lng: number;
  marker_icon?: string;
  marker_color?: string;
  video_url?: string | null;
  videoUrl?: string | null;
}

export interface Stamp {
  id: string;
  name: string;
  attractionId: string;
  imageUrl: string;
  unlockedAt?: string;
  dateUnlocked?: string;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "buddy";
  text: string;
  time: string;
}

export interface ItineraryItem {
  day: number;
  time: string;
  title: string;
  desc: string;
  distance: string;
  duration: string;
  category: string;
  audioStory: string;
}

export interface UserProfile {
  name: string;
  exp: number;
  nextLevelExp: number;
  tripsCount: number;
  checkInCount: number;
  badgesEarned: number;
}

export interface Seller {
  id: string;
  shop_name: string;
  phone: string;
  line_id: string;
  shop_location: string;
  is_active: boolean;
}

export interface Product {
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

export interface AccommodationBookingLinks {
  agoda?: string;
  booking?: string;
  direct?: string;
}

export interface AccommodationRoomType {
  name: string;
  price: number;
  description?: string;
  max_guests: number;
  images: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  description: string;
  propertyType: string; // hotel, resort, homestay, guesthouse, apartment
  priceRange: string;
  rating: number;
  phone: string;
  lineId: string;
  website: string;
  bookingLinks: AccommodationBookingLinks;
  amenities: string[];
  roomTypes: AccommodationRoomType[];
  images: string[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  lat: number;
  lng: number;
  address: string;
  marker_icon?: string;
  marker_color?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface TripPlanStop {
  id: string;
  placeId: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  timeLabel: string;
  durationLabel: string;
  note: string;
}

export interface TripPlanResult {
  title: string;
  summary: string;
  duration: string;
  pace: string;
  interests: string[];
  startPoint?: string;
  stops: TripPlanStop[];
  tips: string[];
  costEstimate?: TripCostBreakdown;
}

export type TripBudgetLevel = "low" | "medium" | "high";

export interface TripCostBreakdown {
  travelers: number;
  budgetLevel: TripBudgetLevel;
  transportCost: number;
  foodCost: number;
  entranceCost: number;
  shoppingCost: number;
  miscCost: number;
  totalCost: number;
  costPerPerson: number;
  note: string;
}

