"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type PlaceDetails } from "@/types/location";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
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

  // Fetch nearby merchants when location and maps are ready
  const fetchNearbyMerchants = useCallback(() => {
    if (!userLocation || !placesServiceRef.current) return;

    setNearbyLoading(true);
    setNearbyError(null);

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

  // Auto-fetch nearby merchants when location becomes available
  useEffect(() => {
    if (userLocation && placesServiceRef.current) {
      fetchNearbyMerchants();
    }
  }, [userLocation, fetchNearbyMerchants]);

  const handleEnableLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // fetchNearbyMerchants will be called automatically via useEffect
        },
        (error) => {
          setNearbyError("Please enable location access to find nearby merchants");
          console.warn("Location access denied:", error);
        }
      );
    } else {
      setNearbyError("Geolocation is not supported by your browser");
    }
  }, []);

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

      {/* Enable Location Button - Only show if location not available */}
      {!userLocation && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            onClick={handleEnableLocation}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base"
          >
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
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Enable location to see merchants near you
            </p>
          </div>
        </>
      )}

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Nearby Merchants Section - Inline */}
      {userLocation && (
        <div className="mt-8 animate-in fade-in duration-300">
          {/* Section Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Nearby Merchants</h3>
            <p className="text-sm text-muted-foreground">
              Tap the merchant you&apos;re at to add it to BTC Map
            </p>
          </div>

          {/* Loading State */}
          {nearbyLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Finding nearby merchants...</p>
            </div>
          )}

          {/* Error State */}
          {nearbyError && !nearbyLoading && (
            <Card className="p-6 text-center border-dashed">
              <svg
                className="w-12 h-12 text-muted-foreground mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">{nearbyError}</p>
            </Card>
          )}

          {/* Merchant List */}
          {!nearbyLoading && !nearbyError && nearbyMerchants.length > 0 && (
            <div className="space-y-3">
              {nearbyMerchants.map((merchant, index) => (
                <button
                  key={merchant.place.place_id || index}
                  onClick={() => handleSelectNearbyMerchant(merchant)}
                  className="w-full text-left p-4 bg-card hover:bg-accent active:bg-accent/80 rounded-xl transition-all border border-border hover:border-primary/50 hover:shadow-md"
                  disabled={isLoading}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate mb-1">
                        {merchant.place.name}
                      </h3>
                      {merchant.place.vicinity && (
                        <p className="text-sm text-muted-foreground truncate">
                          {merchant.place.vicinity}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                        {formatDistance(merchant.distance)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
