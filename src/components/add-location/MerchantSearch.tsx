"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type PlaceDetails } from "@/types/location";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { StaggerContainer, StaggerItem, smoothSpring } from "@/components/ui/animations";

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [nearbyMerchants, setNearbyMerchants] = useState<NearbyMerchant[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
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

  // Initialize Google Places Services
  useEffect(() => {
    if (!isLoaded) return;

    // Initialize AutocompleteService for predictions
    autocompleteServiceRef.current = new google.maps.places.AutocompleteService();

    // Create a hidden div to initialize PlacesService
    const div = document.createElement('div');
    placesServiceRef.current = new google.maps.places.PlacesService(div);
  }, [isLoaded]);

  // Fetch predictions when search value changes
  useEffect(() => {
    if (!searchValue || !autocompleteServiceRef.current || !isSearchExpanded) {
      setPredictions([]);
      return;
    }

    setPredictionsLoading(true);

    const request: google.maps.places.AutocompletionRequest = {
      input: searchValue,
      types: ['establishment'],
    };

    // Bias to user location if available
    if (userLocation) {
      request.locationBias = new google.maps.LatLng(userLocation.lat, userLocation.lng);
    }

    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (results, status) => {
        setPredictionsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      }
    );
  }, [searchValue, isSearchExpanded, userLocation]);

  // Handle selecting a prediction from our custom dropdown
  const handleSelectPrediction = useCallback((prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesServiceRef.current) return;

    setIsLoading(true);

    // Get full place details from the prediction's place_id
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: prediction.place_id,
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
      if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry?.location) {
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

        // Collapse the expanded search before transitioning
        setIsSearchExpanded(false);
        setSearchValue("");
        setPredictions([]);
        onSelect(details);
      }
      setIsLoading(false);
    });
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

  // Handle expanding and focusing - must be before early returns
  const handleSearchFocus = useCallback(() => {
    // Capture trigger position for animation
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setIsSearchExpanded(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchExpanded(false);
    setSearchValue("");
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      // Small delay to let the animation start
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchExpanded]);

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
    <>
      {/* Expanded Search Overlay - Portal to escape containing block from transforms */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4"
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" onClick={handleCloseSearch} />

              {/* Search card - animates from trigger position to top */}
              <motion.div
                initial={{
                  scale: 0.98,
                  opacity: 0,
                  y: triggerRect ? triggerRect.top - 16 : 0, // 16px = pt-4 padding
                  boxShadow: "0 0 0 0 rgba(0,212,50,0)"
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  boxShadow: "0 0 40px 8px rgba(0,212,50,0.12)"
                }}
                exit={{
                  scale: 0.98,
                  opacity: 0,
                  y: triggerRect ? triggerRect.top - 16 : 0,
                  boxShadow: "0 0 0 0 rgba(0,212,50,0)"
                }}
                transition={smoothSpring}
                className="relative w-full max-w-xl bg-card border border-border rounded-3xl overflow-hidden"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={handleCloseSearch}
                    className="p-2 -ml-2 hover:bg-secondary rounded-xl transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Find your merchant"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 text-lg bg-transparent border-0 outline-none placeholder:text-muted-foreground"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Results area - only render when there's content */}
                {(predictionsLoading || predictions.length > 0 || (searchValue && predictions.length === 0 && !predictionsLoading)) && (
                  <div className="border-t border-border max-h-[60vh] overflow-y-auto rounded-b-3xl">
                    {predictionsLoading && (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    )}

                    {!predictionsLoading && predictions.length === 0 && searchValue && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-muted-foreground text-center py-8"
                      >
                        No results found
                      </motion.p>
                    )}

                    {predictions.length > 0 && (
                      <div className="p-2">
                        {predictions.map((prediction, index) => (
                          <motion.button
                            key={prediction.place_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleSelectPrediction(prediction)}
                            disabled={isLoading}
                            className="w-full text-left p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-all"
                          >
                            <p className="font-medium text-base truncate">
                              {prediction.structured_formatting.main_text}
                            </p>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {prediction.structured_formatting.secondary_text}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-card/80 rounded-3xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <StaggerContainer className="space-y-6">
        {/* Search Input Trigger */}
        <StaggerItem>
          <motion.button
            ref={triggerRef}
            onClick={handleSearchFocus}
            className="w-full relative flex items-center"
            whileTap={{ scale: 0.98 }}
          >
            <Search className="absolute left-4 z-10 w-5 h-5 text-muted-foreground" />
            <div className="w-full h-14 pl-12 pr-4 rounded-2xl border border-input bg-card/50 flex items-center text-lg text-muted-foreground text-left hover:border-primary/30 hover:bg-card/80 transition-all shadow-sm">
              Find your merchant
            </div>
          </motion.button>
        </StaggerItem>

      {/* Enable Location - Only show if location not available */}
      {!userLocation && (
        <StaggerItem>
          <motion.button
            onClick={handleEnableLocation}
            className="w-full mt-4 p-5 rounded-2xl bg-secondary/50 hover:bg-secondary/80 active:bg-secondary border border-border/50 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
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
              <div className="flex-1 text-left">
                <p className="font-semibold text-base text-foreground">Find nearby merchants</p>
                <p className="text-sm text-muted-foreground mt-0.5">Use your location to discover places around you</p>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </motion.button>
        </StaggerItem>
      )}

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Nearby Merchants - shown directly below search */}
      {userLocation && (
        <StaggerItem className="mt-6">

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
        </StaggerItem>
      )}
    </StaggerContainer>
    </>
  );
}
