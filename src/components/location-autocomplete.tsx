'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeLocationName } from '@/lib/location';

type PlaceSelection = {
  name: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
};

type LocationAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: PlaceSelection) => void;
  placeholder?: string;
  className?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

let mapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string) {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

export function LocationAutocomplete({ value, onChange, onPlaceSelect, placeholder = 'Enter your area', className }: LocationAutocompleteProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sessionTokenRef = useRef<any>(null);
  const serviceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const blurTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!apiKey) return;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        const google = window.google;
        if (!google?.maps?.places) return;

        serviceRef.current = new google.maps.places.AutocompleteService();
        const container = document.createElement('div');
        placesServiceRef.current = new google.maps.places.PlacesService(container);
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        setIsReady(true);
      })
      .catch(() => {
        setIsReady(false);
      });
  }, [apiKey]);

  useEffect(() => {
    if (!isReady || !serviceRef.current) return;
    const normalized = normalizeLocationName(value);
    if (!normalized) {
      setPredictions([]);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    serviceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'ke' },
        sessionToken: sessionTokenRef.current
      },
      (results: any[] | null) => {
        if (currentRequestId !== requestIdRef.current) return;
        setPredictions(results ?? []);
      }
    );
  }, [isReady, value]);

  const shouldShowPredictions = useMemo(() => isReady && isFocused && predictions.length > 0, [isFocused, isReady, predictions.length]);

  const handleSelectPrediction = (prediction: any) => {
    onChange(prediction.description);
    setPredictions([]);

    const google = window.google;
    if (!google?.maps?.places || !placesServiceRef.current) {
      onPlaceSelect?.({ name: prediction.description, placeId: prediction.place_id });
      return;
    }

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'geometry', 'place_id', 'formatted_address'],
        sessionToken: sessionTokenRef.current
      },
      (place: any) => {
        const lat = place?.geometry?.location?.lat?.();
        const lng = place?.geometry?.location?.lng?.();

        onPlaceSelect?.({
          name: place?.formatted_address ?? place?.name ?? prediction.description,
          latitude: typeof lat === 'number' ? lat : undefined,
          longitude: typeof lng === 'number' ? lng : undefined,
          placeId: place?.place_id ?? prediction.place_id
        });

        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }
    );
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsFocused(false);
    }, 120);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsFocused(true);
  };

  if (!apiKey) {
    return <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} autoComplete="off" />;
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {shouldShowPredictions ? (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onMouseDown={() => handleSelectPrediction(prediction)}
              className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 last:border-b-0 hover:bg-slate-50"
            >
              {prediction.description}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
