import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();
  const country = request.nextUrl.searchParams.get("country")?.trim();

  if (!city || !country) {
    return NextResponse.json({ error: "city and country are required" }, { status: 400 });
  }

  const q = `${city}, ${country}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PicotosFamily/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Geocoding unavailable" }, { status: 502 });
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data.length) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
      display_name: data[0].display_name,
    });
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
