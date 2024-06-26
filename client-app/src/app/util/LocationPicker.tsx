import { useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { useMapsContext } from '../util/MapsContext';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const initialCenter = {
  lat: 36.800228,
  lng: 10.186242,
};

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  const { latitude, longitude, setCoordinates } = useMapsContext();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAadmyoC2mQ1e2fTw_nu_82BiraFalL3LM', // Replace with your API key
    libraries: ['places'], // Include the places library
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onLoadAutocomplete = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates(lat, lng);
        onLocationSelect(lat, lng);
        mapRef.current?.panTo({ lat, lng });
      }
    });
  }, [onLocationSelect, setCoordinates]);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setCoordinates(lat, lng);
        onLocationSelect(lat, lng);
      }
    },
    [onLocationSelect, setCoordinates]
  );

  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Autocomplete onLoad={onLoadAutocomplete}>
          <input
            type="text"
            placeholder="Search location"
            style={{ width: '100%', height: '40px', padding: '5px' }}
          />
        </Autocomplete>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={latitude && longitude ? { lat: latitude, lng: longitude } : initialCenter}
        zoom={10}
        onClick={handleMapClick}
        onLoad={onLoadMap}
      >
        {latitude && longitude && <Marker position={{ lat: latitude, lng: longitude }} />}
      </GoogleMap>
    </div>
  );
};

export default LocationPicker;
