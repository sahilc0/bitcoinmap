import { useEffect, useState } from "react";

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

// Shared promise so the Google Maps script is only added once per page
let googleMapsScriptLoadingPromise: Promise<void> | null = null;

export function useGoogleMaps(): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If the Maps library is already available, we are done
    if ((window as any).google?.maps) {
      setIsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      setLoadError(
        new Error(
          "Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file."
        )
      );
      return;
    }

    // Reuse the same loading promise so we don't inject the script multiple times
    if (!googleMapsScriptLoadingPromise) {
      googleMapsScriptLoadingPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
          `script[src^="https://maps.googleapis.com/maps/api/js"]`
        );

        if (existingScript) {
          // If a script tag already exists, just wait for it to finish loading
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", () =>
            reject(new Error("Failed to load Google Maps script"))
          );
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps script"));

        document.head.appendChild(script);
      });
    }

    googleMapsScriptLoadingPromise
      .then(() => {
        if ((window as any).google?.maps) {
          setIsLoaded(true);
        } else {
          setLoadError(
            new Error("Google Maps loaded but maps library is unavailable")
          );
        }
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error : new Error(String(error)));
      });
  }, []);

  return { isLoaded, loadError };
}
