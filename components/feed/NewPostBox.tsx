"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type NewPostBoxProps = {
  onCreated: () => void;
};

export function NewPostBox({ onCreated }: NewPostBoxProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let photo_url: string | null = null;

    if (file) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
    }

    await supabase.from("posts").insert({
      author_id: user.id,
      content,
      photo_url,
    });

    setContent("");
    setFile(null);
    setLoading(false);
    onCreated();
  };

  return (
    <form onSubmit={onSubmit} className="card-soft mb-4 space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Partagez une nouvelle de famille..."
        className="w-full rounded-xl border border-sand bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-terracotta/40"
        rows={3}
      />
      <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <button className="btn-main" disabled={loading} type="submit">
        {loading ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
