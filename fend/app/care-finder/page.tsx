'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Building2,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  Hospital,
  MapPin,
  Microscope,
  Navigation as NavigationIcon,
  Phone,
  Search,
  ShieldCheck,
  Siren,
  Star,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CarePlace {
  id: string;
  name: string;
  address: string;
  primaryType: string;
  openNow: boolean | null;
  weekdayDescriptions: string[];
  phone: string | null;
  websiteUri: string | null;
  googleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  location: { lat: number; lng: number } | null;
  distanceKm: number | null;
}

const CITY_PRESETS = [
  { label: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { label: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { label: 'New Delhi', lat: 28.6139, lng: 77.209 },
  { label: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { label: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { label: 'Pune', lat: 18.5204, lng: 73.8567 },
];

const CATEGORIES = [
  { key: 'all', label: 'All Care', icon: Building2 },
  { key: 'gynecologist', label: 'Gynecologists', icon: Stethoscope },
  { key: 'hospital', label: 'Hospitals', icon: Hospital },
  { key: 'clinic', label: 'Clinics', icon: MapPin },
  { key: 'emergency', label: '24/7 Emergency', icon: Siren },
  { key: 'diagnostic', label: 'Diagnostics', icon: Microscope },
];

function MapCameraSync({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

function PlaceAdvancedMarker({
  place,
  selected,
  onSelect,
  onClose,
}: {
  place: CarePlace;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  if (!place.location) return null;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={place.location}
        title={place.name}
        onClick={onSelect}
      >
        <Pin
          background={selected ? '#be123c' : '#e11d48'}
          borderColor={selected ? '#881337' : '#9f1239'}
          glyphColor="#ffffff"
          scale={selected ? 1.25 : 1.0}
        />
      </AdvancedMarker>
      {selected && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={onClose}>
          <div className="space-y-1.5 text-slate-900 p-0.5">
            <p className="font-bold text-sm leading-snug">{place.name}</p>
            <p className="text-xs text-slate-600">{place.address}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {place.rating !== null && (
                <span className="font-semibold text-amber-700">★ {place.rating}</span>
              )}
              {place.distanceKm !== null && (
                <span className="text-slate-500">{place.distanceKm} km away</span>
              )}
              {place.openNow !== null && (
                <span className={place.openNow ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                  {place.openNow ? 'Open now' : 'Closed'}
                </span>
              )}
            </div>
            {place.googleMapsUri && (
              <a
                href={place.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 underline pt-1"
              >
                Open in Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function CareFinderPage() {
  const [apiKey, setApiKey] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  );
  const [configLoaded, setConfigLoaded] = useState(false);

  const [center, setCenter] = useState<{ lat: number; lng: number }>(CITY_PRESETS[0]);
  const [activeCity, setActiveCity] = useState<string>('Bengaluru');
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [geoConsented, setGeoConsented] = useState<boolean>(false);

  const [places, setPlaces] = useState<CarePlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/care-finder/config');
        const data = await res.json();
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        }
      } catch {
        // Ignore; falls back to env if injected
      } finally {
        setConfigLoaded(true);
      }
    }
    loadConfig();
  }, []);

  const fetchPlaces = useCallback(
    async (targetLat: number, targetLng: number, targetCategory: string, q: string) => {
      setSearching(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/care-finder/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: targetLat,
            lng: targetLng,
            category: targetCategory,
            query: q,
            radiusMeters: 9000,
          }),
        });

        const data = await res.json();
        if (res.status === 429 || data?.quotaExceeded) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setErrorMsg('Google Maps Platform quota reached for this key.');
          setPlaces([]);
          return;
        }

        if (!res.ok) {
          setErrorMsg(data.message || 'Unable to load nearby facilities right now.');
          setPlaces([]);
          return;
        }

        const list = Array.isArray(data.places) ? data.places : [];
        setPlaces(list);
        if (list.length > 0) {
          setSelectedPlaceId(list[0].id);
        }
      } catch {
        setErrorMsg('Unable to search nearby care facilities right now.');
      } finally {
        setSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPlaces(center.lat, center.lng, category, '');
  }, [center.lat, center.lng, category, fetchPlaces]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPlaces(center.lat, center.lng, category, searchQuery);
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Browser location is not available on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGeoConsented(true);
        setActiveCity('Current Location');
        setCenter(next);
        toast.success('Centered map on your current location');
      },
      () => {
        toast.error('Location permission declined. Showing selected city instead.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 mb-2">
              <Compass className="h-3.5 w-3.5" />
              Care Finder · Verified Clinics & Hospitals
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Find Women&apos;s Health & Emergency Care Nearby
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Search live clinics, OB-GYN specialists, 24/7 hospitals, and diagnostic centers powered by Google Maps Platform.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleUseMyLocation}
            className="border-rose-200 text-rose-700 hover:bg-rose-50 self-start md:self-auto"
          >
            <NavigationIcon className="h-4 w-4 mr-2" />
            {geoConsented ? 'Location Enabled (Refresh)' : 'Use My Location (Opt-In)'}
          </Button>
        </div>

        {/* Location Privacy Consent Notice */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            GPS location is only requested when you click <strong>Use My Location</strong> and is never stored permanently.
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-slate-500 mr-1">City:</span>
            {CITY_PRESETS.map((city) => (
              <button
                key={city.label}
                type="button"
                onClick={() => {
                  setActiveCity(city.label);
                  setCenter({ lat: city.lat, lng: city.lng });
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeCity === city.label
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs & Search Bar */}
        <Card className="border-slate-200">
          <CardContent className="pt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Optional area or specialty filter (e.g., Indiranagar maternity, ultrasound)..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={searching} className="bg-slate-900 hover:bg-slate-800 text-white">
                {searching ? 'Searching...' : 'Search Area'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {errorMsg && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Split Layout: Map + Results */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          <Card className="border-slate-200 overflow-hidden shadow-sm">
            <div className="h-[440px] lg:h-[600px] w-full relative bg-slate-100">
              {configLoaded && apiKey ? (
                <APIProvider apiKey={apiKey} libraries={['marker']}>
                  <GoogleMap
                    mapId="DEMO_MAP_ID"
                    defaultZoom={13}
                    defaultCenter={center}
                    gestureHandling="greedy"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    className="h-full w-full"
                  >
                    <MapCameraSync center={center} />
                    {places.map((place) => (
                      <PlaceAdvancedMarker
                        key={place.id}
                        place={place}
                        selected={selectedPlaceId === place.id}
                        onSelect={() => setSelectedPlaceId(place.id)}
                        onClose={() => setSelectedPlaceId(null)}
                      />
                    ))}
                  </GoogleMap>
                </APIProvider>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center text-slate-600">
                  <MapPin className="h-10 w-10 text-rose-400 mb-3" />
                  <p className="font-semibold text-slate-800">
                    {configLoaded
                      ? 'Interactive Google Map is awaiting runtime key activation.'
                      : 'Initializing Google Maps...'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Facility lookup results from the server-side Places proxy appear on the right once Google Maps Platform keys are active in runtime.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Facility List */}
          <Card className="border-slate-200 shadow-sm flex flex-col max-h-[600px]">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">
                Nearby Care Facilities ({places.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Centered near {activeCity}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto divide-y divide-slate-100 p-0">
              {searching ? (
                <div className="p-6 text-sm text-slate-500">Searching nearby care providers...</div>
              ) : places.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  No matching facilities returned for this query. Try broadening your category or selecting another city.
                </div>
              ) : (
                places.map((place) => {
                  const isSelected = selectedPlaceId === place.id;
                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        setSelectedPlaceId(place.id);
                        if (place.location) setCenter(place.location);
                      }}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-rose-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{place.name}</h3>
                        {place.openNow !== null && (
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-[10px] ${
                              place.openNow
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <Clock className="h-2.5 w-2.5 mr-1" />
                            {place.openNow ? 'Open' : 'Closed'}
                          </Badge>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-600">{place.address}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="capitalize font-medium text-rose-700">
                          {place.primaryType}
                        </span>
                        {place.rating !== null && (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {place.rating}
                            {place.userRatingCount ? ` (${place.userRatingCount})` : ''}
                          </span>
                        )}
                        {place.distanceKm !== null && (
                          <span>{place.distanceKm} km away</span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        {place.phone && (
                          <a
                            href={`tel:${place.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-rose-700 font-medium"
                          >
                            <Phone className="h-3 w-3" />
                            {place.phone}
                          </a>
                        )}
                        {place.websiteUri && (
                          <a
                            href={place.websiteUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-rose-700 font-medium"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                          </a>
                        )}
                        {place.googleMapsUri && (
                          <a
                            href={place.googleMapsUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-rose-700 hover:underline font-semibold ml-auto"
                          >
                            Get Directions <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Terms attribution notice */}
        <p className="text-[11px] text-slate-500 text-center">
          Care facility map & place details are provided via Google Maps Platform, subject to the{' '}
          <a
            href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Google Maps End User Terms
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Google Privacy Policy
          </a>
          . For acute medical emergencies, call 112 / 108 immediately.
        </p>
      </div>

      <Footer />
    </div>
  );
}
