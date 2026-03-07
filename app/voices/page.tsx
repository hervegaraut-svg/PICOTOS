"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { VoiceRecorder } from "@/components/voices/VoiceRecorder";
import { VoiceCard } from "@/components/voices/VoiceCard";

type VoiceRow = {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration_seconds: number | null;
  likes_count: number;
  created_at: string;
  profiles: { name: string; avatar: string | null } | null;
};

export default function VoicesPage() {
  const [memories, setMemories] = useState<VoiceRow[]>([]);
  const [showRecorder, setShowRecorder] = useState(false);

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("voice_memories")
      .select("id, title, description, audio_url, duration_seconds, likes_count, created_at, profiles!voice_memories_author_id_fkey(name, avatar)")
      .order("created_at", { ascending: false });

    const safeRows = (data ?? []).map((item) => {
      const relation = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        audio_url: item.audio_url,
        duration_seconds: item.duration_seconds,
        likes_count: item.likes_count,
        created_at: item.created_at,
        profiles: relation
          ? {
              name: relation.name,
              avatar: relation.avatar,
            }
          : null,
      } as VoiceRow;
    });

    setMemories(safeRows);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-brown/20 bg-brown p-4 text-cream">
        <h1 className="font-playfair text-xl">La voix de la mémoire</h1>
        <p className="text-sm text-cream/85">Préserver les voix et histoires de ceux qu&apos;on aime.</p>
        <button type="button" onClick={() => setShowRecorder((previous) => !previous)} className="btn-main">
          + Enregistrer un message
        </button>
      </div>

      {showRecorder ? <VoiceRecorder onSaved={load} /> : null}

      <div className="space-y-3">
        {memories.map((memory) => (
          <VoiceCard key={memory.id} memory={memory} />
        ))}
      </div>
    </section>
  );
}
