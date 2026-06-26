import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Lazy import to avoid crash if native module isn't linked
let Location: any = null;
try {
  Location = require('expo-location');
} catch {}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: UserLocation | null;
  loading: boolean;
  errorMsg: string | null;
  refresh: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  loading: false,
  errorMsg: null,
  refresh: async () => {},
});

export function UserLocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    if (!Location) {
      setErrorMsg('Location services unavailable');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return (
    <LocationContext.Provider value={{ location, loading, errorMsg, refresh: fetchLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useUserLocation = () => useContext(LocationContext);
