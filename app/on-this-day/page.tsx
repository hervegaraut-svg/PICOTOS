"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { MemoryCard } from "@/components/on-this-day/MemoryCard";

type Memory = {
  id: string;
  content: string;
  image: string | null;
  date: string;
  yearsAgo: number;
};

export default function OnThisDayPage() {
  const [memories, setMemories] = useState<Memory[]>([]);

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();

    const [{ data: postsData }, { data: photosData }] = await Promise.all([
      supabase.from("posts").select("id, content, photo_url, created_at").order("created_at", { ascending: false }),
      supabase.from("photos").select("id, title, photo_url, created_at").order("created_at", { ascending: false }),
    ]);

    const mappedPosts = (postsData ?? [])
      .filter((post) => {
        const date = new Date(post.created_at);
        return date.getMonth() === month && date.getDate() === day && date.getFullYear() !== today.getFullYear();
      })
      .map((post) => {
        const date = new Date(post.created_at);
        return {
          id: post.id,
          content: post.content,
          image: post.photo_url,
          date: date.toLocaleDateString("fr-FR"),
          yearsAgo: today.getFullYear() - date.getFullYear(),
        };
      });

    const mappedPhotos = (photosData ?? [])
      .filter((photo) => {
        const date = new Date(photo.created_at);
        return date.getMonth() === month && date.getDate() === day && date.getFullYear() !== today.getFullYear();
      })
      .map((photo) => {
        const date = new Date(photo.created_at);
        return {
          id: photo.id,
          content: photo.title,
          image: photo.photo_url,
          date: date.toLocaleDateString("fr-FR"),
          yearsAgo: today.getFullYear() - date.getFullYear(),
        };
      });

    setMemories([...mappedPosts, ...mappedPhotos]);
  };

  useEffect(() => {
    void load();
  }, []);

  const shareMemory = async (memory: { content: string; image: string | null; yearsAgo: number }) => {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("posts").insert({
      author_id: user.id,
      content: `🕰️ Souvenir d'il y a ${memory.yearsAgo} an(s): ${memory.content}`,
      photo_url: memory.image,
    });
  };

  if (!memories.length) {
    return <div className="card-soft">Commencez à créer des souvenirs aujourd&apos;hui ! 📸</div>;
  }

  return (
    <section className="space-y-3">
      <h2 className="font-title text-2xl italic text-terracotta">Ce jour-là</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} onShare={shareMemory} />
        ))}
      </div>
    </section>
  );
}
