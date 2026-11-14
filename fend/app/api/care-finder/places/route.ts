import { NextRequest, NextResponse } from 'next/server';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.primaryTypeDisplayName',
  'places.currentOpeningHours',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
].join(',');

const CATEGORY_CONFIG: Record<string, { includedTypes: string[]; textHint: string }> = {
  all: { includedTypes: ['hospital', 'doctor', 'medical_lab'], textHint: 'women health clinic hospital gynecologist' },
  hospital: { includedTypes: ['hospital'], textHint: 'hospital emergency maternity' },
  gynecologist: { includedTypes: ['doctor'], textHint: 'gynecologist obstetrician women clinic' },
  clinic: { includedTypes: ['doctor', 'hospital'], textHint: 'women health clinic primary care' },
  emergency: { includedTypes: ['hospital'], textHint: '24 hour emergency hospital urgent care' },
  diagnostic: { includedTypes: ['medical_lab'], textHint: 'diagnostic center blood test pathology lab' },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      (globalThis as unknown as { GOOGLE_MAPS_API_KEY?: string }).GOOGLE_MAPS_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json(
        {
          message: 'Google Maps Places API key is not configured in the server runtime yet.',
          places: [],
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const lat = Number(body.lat ?? 12.9716);
    const lng = Number(body.lng ?? 77.5946);
    const radiusMeters = Math.min(25000, Math.max(1000, Number(body.radiusMeters ?? 7000)));
    const category = typeof body.category === 'string' && CATEGORY_CONFIG[body.category] ? body.category : 'all';
    const query = typeof body.query === 'string' ? body.query.trim() : '';

    const config = CATEGORY_CONFIG[category];
    const useTextSearch = Boolean(query) || category === 'gynecologist' || category === 'emergency' || category === 'clinic';

    const endpoint = useTextSearch
      ? 'https://places.googleapis.com/v1/places:searchText'
      : 'https://places.googleapis.com/v1/places:searchNearby';

    const payload = useTextSearch
      ? {
          textQuery: query ? `${query} ${config.textHint}` : config.textHint,
          pageSize: 15,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radiusMeters,
            },
          },
        }
      : {
          includedTypes: config.includedTypes,
          maxResultCount: 15,
          rankPreference: 'DISTANCE',
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radiusMeters,
            },
          },
        };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 429 || data?.error?.status === 'RESOURCE_EXHAUSTED') {
      return NextResponse.json(
        {
          quotaExceeded: true,
          message: 'Google Maps Platform quota reached.',
          places: [],
        },
        { status: 429 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          message: data?.error?.message || `Places lookup returned status ${res.status}`,
          places: [],
        },
        { status: res.status }
      );
    }

    const places = (Array.isArray(data.places) ? data.places : []).map((p: any) => {
      const pLat = p.location?.latitude;
      const pLng = p.location?.longitude;
      return {
        id: p.id,
        name: p.displayName?.text || 'Healthcare Facility',
        address: p.formattedAddress || 'Address unavailable',
        primaryType: p.primaryTypeDisplayName?.text || category,
        openNow: typeof p.currentOpeningHours?.openNow === 'boolean' ? p.currentOpeningHours.openNow : null,
        weekdayDescriptions: Array.isArray(p.currentOpeningHours?.weekdayDescriptions)
          ? p.currentOpeningHours.weekdayDescriptions
          : [],
        phone: p.nationalPhoneNumber || null,
        websiteUri: p.websiteUri || null,
        googleMapsUri:
          p.googleMapsUri ||
          (pLat && pLng ? `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}` : null),
        rating: typeof p.rating === 'number' ? p.rating : null,
        userRatingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
        location: pLat && pLng ? { lat: pLat, lng: pLng } : null,
        distanceKm: pLat && pLng ? haversineKm(lat, lng, pLat, pLng) : null,
      };
    });

    return NextResponse.json({ success: true, places });
  } catch (error) {
    console.error('Care Finder Places proxy error:', error);
    return NextResponse.json({ message: 'Failed to search nearby care facilities', places: [] }, { status: 500 });
  }
}
