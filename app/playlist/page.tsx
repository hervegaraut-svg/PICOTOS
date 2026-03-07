"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { TrackCard } from "@/components/playlist/TrackCard";

type SpotifyResult = {
  id: string;
  name: string;
  preview_url: string | null;
  external_urls: { spotify: string };
  album: { name: string; images: Array<{ url: string }> };
  artists: Array<{ name: string }>;
};

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
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyResult[]>([]);
  const [noteByTrack, setNoteByTrack] = useState<Record<string, string>>({});

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

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setSearchResults(data.tracks ?? []);
  };

  const addTrack = async (track: SpotifyResult) => {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("playlist_tracks").insert({
      added_by: user.id,
      spotify_id: track.id,
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      cover_url: track.album.images?.[0]?.url ?? null,
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify,
      personal_note: noteByTrack[track.id] ?? null,
    });

    await load();
  };

  const onLike = async (id: string, likes: number) => {
    const supabase = createBrowserSupabaseClient();
    await supabase.from("playlist_tracks").update({ likes_count: likes + 1 }).eq("id", id);
    await load();
  };

  return (
    <section className="space-y-4">
      <form onSubmit={search} className="card-soft space-y-2">
        <h2 className="font-semibold">Rechercher un titre Spotify</h2>
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-sand px-3 py-2" placeholder="Ex: Sega mauricien" />
        <button className="btn-main" type="submit">
          Rechercher
        </button>
      </form>

      {searchResults.length ? (
        <div className="card-soft space-y-2">
          <h3 className="font-semibold">Résultats</h3>
          {searchResults.map((track) => (
            <div key={track.id} className="rounded-xl border border-sand p-2">
              <p className="text-sm font-semibold">{track.name}</p>
              <p className="text-xs text-brown/75">{track.artists.map((artist) => artist.name).join(", ")}</p>
              <input
                placeholder="Note personnelle (optionnelle)"
                className="mt-2 w-full rounded-lg border border-sand px-2 py-1 text-sm"
                value={noteByTrack[track.id] ?? ""}
                onChange={(event) => setNoteByTrack((prev) => ({ ...prev, [track.id]: event.target.value }))}
              />
              <button className="btn-main mt-2 text-sm" onClick={() => addTrack(track)}>
                Ajouter
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} onLike={onLike} />
      ))}
    </section>
  );
}
