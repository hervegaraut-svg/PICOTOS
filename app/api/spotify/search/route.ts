import { NextRequest, NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const query = request.nextUrl.searchParams.get("q")?.trim();
    if (!query) {
      return NextResponse.json({ tracks: [] });
    }

    const tracks = await searchTracks(query);
    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ error: "Spotify indisponible" }, { status: 500 });
  }
}
