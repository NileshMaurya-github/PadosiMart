import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface LocationContextType {
  location: { lat: number; lng: number } | null;
  locationName: string;
  isLoadingLocation: boolean;
  locationError: string;
  requestLocation: () => void;
  hasLocation: boolean;
  calculateDistance: (lat: number, lng: number) => number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_NAME_KEY = "user_location_name";

// Default location (Delhi, India) for demo purposes
const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.2090 };

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_LOCATION;
      }
    }
    return DEFAULT_LOCATION;
  });

  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem(LOCATION_NAME_KEY) || "Delhi, India";
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Reverse geocode to get location name
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
      );
      const data = await response.json();

      if (data.address) {
        const { suburb, neighbourhood, city, town, village, state } = data.address;
        const area = suburb || neighbourhood || town || village || "";
        const mainCity = city || state || "";
        const name = area ? `${area}, ${mainCity}` : mainCity;
        return name || "Your Location";
      }
      return "Your Location";
    } catch {
      return "Your Location";
    }
  };

  // Calculate distance in km
  const calculateDistance = useCallback((lat: number, lng: number): number | null => {
    const userLoc = location || DEFAULT_LOCATION;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat - userLoc.lat);
    const dLng = toRad(lng - userLoc.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLoc.lat)) * Math.cos(toRad(lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [location]);

  const toRad = (deg: number) => deg * (Math.PI / 180);

  const requestLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);

        // Get readable location name
        const name = await getLocationName(newLocation.lat, newLocation.lng);
        setLocationName(name);

        // Persist to localStorage
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        localStorage.setItem(LOCATION_NAME_KEY, name);

        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Please allow location access in your browser settings";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        locationName,
        isLoadingLocation,
        locationError,
        requestLocation,
        hasLocation: !!location,
        calculateDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
