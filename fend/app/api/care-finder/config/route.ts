import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    (globalThis as unknown as { GOOGLE_MAPS_API_KEY?: string }).GOOGLE_MAPS_API_KEY ||
    '';

  return NextResponse.json({
    configured: Boolean(apiKey),
    apiKey,
  });
}
