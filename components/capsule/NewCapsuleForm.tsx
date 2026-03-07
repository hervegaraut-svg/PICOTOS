"use client";

import { FormEvent, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type NewCapsuleFormProps = {
  onCreated: () => Promise<void> | void;
};

const addYears = (date: Date, years: number) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

export function NewCapsuleForm({ onCreated }: NewCapsuleFormProps) {
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toInputDate(tomorrow);
  }, []);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [openDate, setOpenDate] = useState(toInputDate(addYears(new Date(), 5)));
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim() || !openDate) return;

    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    let photoUrl: string | null = null;

    if (file) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/capsule-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        photoUrl = data.publicUrl;
      }
    }

    await supabase.from("time_capsules").insert({
      author_id: user.id,
      title: title.trim(),
      message: message.trim(),
      photo_url: photoUrl,
      open_date: openDate,
      send_to_all: true,
    });

    setTitle("");
    setMessage("");
    setOpenDate(toInputDate(addYears(new Date(), 5)));
    setFile(null);
    setSaving(false);
    await onCreated();
  };

  return (
    <form onSubmit={onSubmit} className="card-soft space-y-2">
      <h2 className="font-semibold">+ Sceller une capsule</h2>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Titre"
        className="w-full rounded-xl border border-sand px-3 py-2"
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Ton message pour le futur"
        className="min-h-28 w-full rounded-xl border border-sand px-3 py-2"
      />
      <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <input
        type="date"
        value={openDate}
        min={minDate}
        onChange={(event) => setOpenDate(event.target.value)}
        className="w-full rounded-xl border border-sand px-3 py-2"
      />
      <p className="text-xs text-brown/75">📧 Toute la famille recevra un email ce jour-là</p>
      <button type="submit" className="btn-main" disabled={saving}>
        {saving ? "Scellage..." : "Sceller"}
      </button>
    </form>
  );
}
