 "use client";

import { useEffect, useRef, useState } from "react";
import { AddLocationForm } from "@/components/add-location/AddLocationForm";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { StaggerContainer, StaggerItem } from "@/components/ui/animations";

type LatLng = {
  lat: number;
  lng: number;
};

const AUSTIN_DOWNTOWN: LatLng = {
  lat: 30.2672,
  lng: -97.7431,
};

export default function Hero() {
  const { isLoaded, loadError } = useGoogleMaps();

  const [center, setCenter] = useState<LatLng>(AUSTIN_DOWNTOWN);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  // Try to get the user's location; fall back to downtown Austin
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Ignore errors and keep the Austin fallback
      },
      {
        maximumAge: 1000 * 60 * 5,
        timeout: 5000,
      }
    );
  }, []);

  // Initialize and update the Google Map background
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || typeof window === "undefined") {
      return;
    }

    const google = (window as any).google;

    if (!google?.maps) {
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        gestureHandling: "none",
        draggable: false,
        clickableIcons: false,
      });
    }
    // Don't re-center after creation - keep map fixed
  }, [isLoaded]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Test button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => {}}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white font-medium shadow-lg"
        >
          Test Button
        </button>
      </div>

      {/* Background map layer */}
      <div
        ref={mapContainerRef}
        className="pointer-events-none absolute inset-0 -z-20"
      />

      {/* Gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/40 via-50% to-background" />

      {/* Foreground content */}
      <StaggerContainer
        className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-12 pt-[22vh] md:px-8 md:pb-16 md:pt-[24vh]"
        delay={0.1}
      >
        <StaggerItem className="mb-8 max-w-xl space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
            Put bitcoin on the map
          </h1>
          <p className="max-w-lg text-base font-medium text-white/90 md:text-lg">
            Let everyone know your favorite store accepts bitcoin
          </p>
        </StaggerItem>

        <StaggerItem className="w-full max-w-xl rounded-2xl bg-card p-5 shadow-2xl backdrop-blur-lg md:p-8">
          <AddLocationForm />
        </StaggerItem>
      </StaggerContainer>

      {loadError && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
          <p className="rounded-full bg-destructive px-3 py-1 text-xs text-white shadow">
            There was a problem loading the map, but you can still add
            locations.
          </p>
        </div>
      )}
    </section>
  );
}




