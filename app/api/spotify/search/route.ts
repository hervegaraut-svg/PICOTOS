import { NextRequest, NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim();
    if (!query) {
      return NextResponse.json({ tracks: [] });
    }

    const tracks = await searchTracks(query);
    return NextResponse.json({ tracks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spotify indisponible";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
