// src/app/util/MapsContext.tsx
import  { createContext, useContext, useState, ReactNode } from 'react';

interface MapsContextType {
  latitude: number | null;
  longitude: number | null;
  setCoordinates: (latitude: number, longitude: number) => void;
}

const MapsContext = createContext<MapsContextType | undefined>(undefined);

export const useMapsContext = () => {
  const context = useContext(MapsContext);
  if (!context) {
    throw new Error('useMapsContext must be used within a MapsProvider');
  }
  return context;
};

export const MapsProvider = ({ children }: { children: ReactNode }) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const setCoordinates = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  return (
    <MapsContext.Provider value={{ latitude, longitude, setCoordinates }}>
      {children}
    </MapsContext.Provider>
  );
};
