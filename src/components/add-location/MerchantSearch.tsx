"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type PlaceDetails } from "@/types/location";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { calculateDistance, formatDistance } from "@/utils/distance";

// Category mapping for common Google Place types
const CATEGORY_MAP: Record<string, string> = {
  // Food & Drink
  restaurant: "Restaurant",
  cafe: "Cafe",
  bar: "Bar",
  bakery: "Bakery",
  meal_takeaway: "Takeaway",
  meal_delivery: "Delivery",
  food: "Food",

  // Shopping
  grocery_or_supermarket: "Grocery Store",
  supermarket: "Supermarket",
  store: "Store",
  clothing_store: "Clothing Store",
  convenience_store: "Convenience Store",
  electronics_store: "Electronics Store",
  furniture_store: "Furniture Store",
  hardware_store: "Hardware Store",
  home_goods_store: "Home Goods",
  jewelry_store: "Jewelry Store",
  liquor_store: "Liquor Store",
  pet_store: "Pet Store",
  shoe_store: "Shoe Store",
  shopping_mall: "Shopping Mall",
  book_store: "Book Store",

  // Services
  atm: "ATM",
  bank: "Bank",
  gas_station: "Gas Station",
  car_wash: "Car Wash",
  car_repair: "Auto Repair",
  laundry: "Laundry",
  hair_care: "Hair Salon",
  beauty_salon: "Beauty Salon",
  spa: "Spa",
  gym: "Gym",

  // Health
  pharmacy: "Pharmacy",
  hospital: "Hospital",
  doctor: "Doctor",
  dentist: "Dentist",
  physiotherapist: "Physiotherapist",
  veterinary_care: "Veterinary",

  // Lodging
  lodging: "Hotel",
  hotel: "Hotel",

  // Entertainment
  movie_theater: "Movie Theater",
  night_club: "Night Club",
  casino: "Casino",
  amusement_park: "Amusement Park",
  art_gallery: "Art Gallery",
  museum: "Museum",

  // Other
  parking: "Parking",
  post_office: "Post Office",
  library: "Library",
  school: "School",
  university: "University",
};

// Generic types to skip
const GENERIC_TYPES = [
  "establishment",
  "point_of_interest",
  "premise",
  "geocode",
  "locality",
  "political",
];

function getCategoryFromTypes(types: string[]): string {
  // Filter out generic types
  const specificTypes = types.filter((type) => !GENERIC_TYPES.includes(type));

  // Try to find a mapped category
  for (const type of specificTypes) {
    if (CATEGORY_MAP[type]) {
      return CATEGORY_MAP[type];
    }
  }

  // Fallback: use first specific type and format it
  if (specificTypes.length > 0) {
    return specificTypes[0]
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return "Other";
}

interface MerchantSearchProps {
  onSelect: (details: PlaceDetails) => void;
}

interface NearbyMerchant {
  place: google.maps.places.PlaceResult;
  distance: number;
}

export function MerchantSearch({ onSelect }: MerchantSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [showNearbySheet, setShowNearbySheet] = useState(false);
  const [nearbyMerchants, setNearbyMerchants] = useState<NearbyMerchant[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Location access denied:", error);
        }
      );
    }
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      types: ["establishment"],
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "types",
        "website",
        "formatted_phone_number",
        "opening_hours",
      ],
    };

    // Bias results to user's location if available
    if (userLocation) {
      (options as any).locationBias = new google.maps.LatLng(
        userLocation.lat,
        userLocation.lng
      );
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    const listener = autocompleteRef.current.addListener(
      "place_changed",
      handlePlaceSelect
    );

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [isLoaded, userLocation]);

  // Initialize PlacesService for nearby search
  useEffect(() => {
    if (!isLoaded) return;

    // Create a hidden div to initialize PlacesService
    const div = document.createElement('div');
    placesServiceRef.current = new google.maps.places.PlacesService(div);
  }, [isLoaded]);

  const handlePlaceSelect = useCallback(() => {
    if (!autocompleteRef.current) return;

    setIsLoading(true);
    const place = autocompleteRef.current.getPlace();

    if (!place.geometry || !place.geometry.location) {
      setIsLoading(false);
      return;
    }

    // Extract category from types - filter out generic types
    const category = getCategoryFromTypes(place.types || []);

    const details: PlaceDetails = {
      name: place.name || "",
      address: place.formatted_address || "",
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      category,
      website: place.website,
      phone: place.formatted_phone_number,
      openingHours: place.opening_hours?.weekday_text?.join("\n"),
      placeId: place.place_id,
    };

    onSelect(details);
    setIsLoading(false);
  }, [onSelect]);

  const handleFindNearby = useCallback(() => {
    // Check for location permission
    if (!userLocation) {
      setNearbyError("Location permission required");
      // Try to request location again
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            // Retry the search after getting location
            setTimeout(() => handleFindNearby(), 100);
          },
          (error) => {
            setNearbyError("Please enable location access to find nearby merchants");
            setShowNearbySheet(true);
          }
        );
      }
      return;
    }

    if (!placesServiceRef.current) {
      setNearbyError("Maps service not ready");
      return;
    }

    setNearbyLoading(true);
    setNearbyError(null);
    setShowNearbySheet(true);

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: 50, // 50 meters
      type: 'establishment',
    };

    placesServiceRef.current.nearbySearch(
      request,
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Calculate distances and sort by closest
          const merchantsWithDistance = results
            .map((place) => {
              if (!place.geometry?.location) return null;
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                place.geometry.location.lat(),
                place.geometry.location.lng()
              );
              return { place, distance };
            })
            .filter((item): item is NearbyMerchant => item !== null)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Get top 5 closest

          setNearbyMerchants(merchantsWithDistance);

          if (merchantsWithDistance.length === 0) {
            setNearbyError("No merchants found nearby");
          }
        } else {
          setNearbyError("Could not find nearby merchants");
        }
        setNearbyLoading(false);
      }
    );
  }, [userLocation]);

  const handleSelectNearbyMerchant = useCallback((merchant: NearbyMerchant) => {
    if (!placesServiceRef.current) return;

    setIsLoading(true);

    // Get full place details
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: merchant.place.place_id!,
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "types",
        "website",
        "formatted_phone_number",
        "opening_hours",
      ],
    };

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const category = getCategoryFromTypes(place.types || []);

        const details: PlaceDetails = {
          name: place.name || "",
          address: place.formatted_address || "",
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
          category,
          website: place.website,
          phone: place.formatted_phone_number,
          openingHours: place.opening_hours?.weekday_text?.join("\n"),
          placeId: place.place_id,
        };

        setShowNearbySheet(false);
        onSelect(details);
      }
      setIsLoading(false);
    });
  }, [onSelect]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-destructive mb-4">Failed to load Google Maps</p>
        <p className="text-sm text-muted-foreground">
          Please check your API key configuration
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Find the Merchant</h2>
        <p className="text-muted-foreground">
          Search for the business you want to add
        </p>
      </div>

      {/* Search Input */}
      <Card className="p-1 shadow-lg">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a business..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border-0 text-lg h-14 focus-visible:ring-0"
          autoFocus
        />
      </Card>

      {/* Find Nearby Button */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        onClick={handleFindNearby}
        variant="outline"
        size="lg"
        className="w-full h-12 text-base"
        disabled={nearbyLoading}
      >
        {nearbyLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2" />
            Finding nearby merchants...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Find Nearby Merchants
          </>
        )}
      </Button>

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {userLocation
            ? "Showing results near you"
            : "Enable location for better results"}
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
