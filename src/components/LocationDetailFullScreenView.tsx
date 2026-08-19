import React from "react";
import { Attraction } from "../types";
import PlaceDetailView from "./PlaceDetailView";

interface LocationDetailFullScreenViewProps {
  place: Attraction;
  onBack: () => void;
  onNavigate: (place: Attraction) => void;
  backMode?: "home" | "map";
  displayName?: string;
  isCheckedIn?: boolean;
  onCheckIn?: (id: string) => void;
}

export default function LocationDetailFullScreenView({
  place,
  onBack,
  onNavigate,
  backMode = "home",
  displayName = "คุณแมว",
  isCheckedIn = false,
  onCheckIn = () => {}
}: LocationDetailFullScreenViewProps) {
  return (
    <div
      id="home-selected-location-detail"
      className="fixed inset-0 z-[180] bg-background flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-300"
    >
      <PlaceDetailView
        place={place}
        isCheckedIn={isCheckedIn}
        onBack={onBack}
        onCheckIn={onCheckIn}
        onNavigate={(name) => onNavigate(place)}
        displayName={displayName}
        showGestureHandle={false}
      />
    </div>
  );
}
