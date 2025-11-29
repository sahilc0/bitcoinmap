 "use client";

import { useEffect, useRef, useState } from "react";
import { AddLocationForm } from "@/components/add-location/AddLocationForm";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

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
    } else {
      mapRef.current.setCenter(center);
    }
  }, [center, isLoaded]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background map layer */}
      <div
        ref={mapContainerRef}
        className="pointer-events-none absolute inset-0 -z-20"
      />

      {/* Gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-background/90 to-background" />

      {/* Foreground content */}
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-12 pt-[22vh] md:px-8 md:pb-16 md:pt-[24vh]">
        <div className="mb-8 max-w-xl space-y-4">
          <p className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white shadow-sm backdrop-blur">
            Bitcoin Map
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-sm md:text-4xl lg:text-5xl">
            Find and add places that accept Bitcoin near you.
          </h1>
          <p className="max-w-lg text-sm text-white/80 md:text-base">
            We’ll try to use your location for the map. If that’s not available,
            you’ll see downtown Austin, Texas by default.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur-md md:p-6">
          <AddLocationForm />
        </div>
      </div>

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




