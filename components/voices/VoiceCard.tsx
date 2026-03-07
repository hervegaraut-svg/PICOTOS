"use client";

import { useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type VoiceMemoryCard = {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration_seconds: number | null;
  likes_count: number;
  created_at: string;
  profiles: { name: string; avatar: string | null } | null;
};

const formatRelativeDate = (isoDate: string) => {
  const now = new Date();
  const created = new Date(isoDate);
  const diffSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffSeconds < 60) return "à l'instant";
  if (diffSeconds < 3600) return `il y a ${Math.floor(diffSeconds / 60)} min`;
  if (diffSeconds < 86400) return `il y a ${Math.floor(diffSeconds / 3600)} h`;
  return `il y a ${Math.floor(diffSeconds / 86400)} j`;
};

const formatDuration = (seconds: number | null) => {
  if (!seconds || seconds < 1) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

export function VoiceCard({ memory }: { memory: VoiceMemoryCard }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(memory.likes_count);

  const bars = useMemo(() => Array.from({ length: 18 }, (_, index) => index), []);

  const toggleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    const supabase = createBrowserSupabaseClient();
    await supabase.from("voice_memories").update({ likes_count: nextCount }).eq("id", memory.id);
  };

  return (
    <article className="space-y-3 rounded-2xl border border-sand bg-cream p-4 text-brown">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {memory.profiles?.avatar ?? "👤"} {memory.profiles?.name ?? "Membre"}
          </p>
          <p className="text-xs text-brown/70">{formatRelativeDate(memory.created_at)}</p>
        </div>
        <span className="rounded-full border border-sand px-2 py-1 text-xs">⏱️ {formatDuration(memory.duration_seconds)}</span>
      </header>

      <div>
        <h3 className="font-semibold">{memory.title}</h3>
        {memory.description ? <p className="text-sm text-brown/80">{memory.description}</p> : null}
      </div>

      <div className="flex h-7 items-end gap-1 rounded-xl bg-white/70 px-2 py-1">
        {bars.map((bar) => (
          <span
            key={bar}
            className="w-1 rounded-full bg-terracotta/80"
            style={{
              height: isPlaying ? `${8 + ((bar * 7) % 16)}px` : "7px",
              transition: "height 180ms ease",
            }}
          />
        ))}
      </div>

      <audio
        controls
        src={memory.audio_url}
        className="w-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <button type="button" onClick={toggleLike} className="rounded-xl border border-sand px-3 py-2 text-sm hover:bg-sand/50">
        ❤️ {likesCount}
      </button>
    </article>
  );
}
