"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { TrackCard } from "@/components/playlist/TrackCard";

type TrackRow = {
  id: string;
  spotify_id: string;
  title: string;
  artist: string;
  album: string | null;
  cover_url: string | null;
  preview_url: string | null;
  spotify_url: string;
  personal_note: string | null;
  likes_count: number;
  profiles: { name: string } | null;
};

export default function PlaylistPage() {
  const [tracks, setTracks] = useState<TrackRow[]>([]);

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("playlist_tracks")
      .select("id, spotify_id, title, artist, album, cover_url, preview_url, spotify_url, personal_note, likes_count, profiles!playlist_tracks_added_by_fkey(name)")
      .order("created_at", { ascending: false });
    const safeTracks = (data ?? []).map((track) => {
      const relation = Array.isArray(track.profiles) ? track.profiles[0] : track.profiles;
      return {
        id: track.id,
        spotify_id: track.spotify_id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        cover_url: track.cover_url,
        preview_url: track.preview_url,
        spotify_url: track.spotify_url,
        personal_note: track.personal_note,
        likes_count: track.likes_count,
        profiles: relation ? { name: relation.name } : null,
      } as TrackRow;
    });
    setTracks(safeTracks);
  };

  useEffect(() => {
    void load();
  }, []);

  const onLike = async (id: string, likes: number) => {
    const supabase = createBrowserSupabaseClient();
    await supabase.from("playlist_tracks").update({ likes_count: likes + 1 }).eq("id", id);
    await load();
  };

  return (
    <section className="space-y-4">
      <div className="card-soft">
        <h2 className="font-semibold">Playlist familiale</h2>
        <p className="mt-1 text-sm text-brown/75">L’ajout par Spotify est temporairement désactivé.</p>
      </div>

      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} onLike={onLike} />
      ))}
    </section>
  );
}
