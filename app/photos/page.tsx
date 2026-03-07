"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { PhotoGrid } from "@/components/photos/PhotoGrid";

type PhotoRow = {
  id: string;
  title: string;
  emoji: string | null;
  photo_url: string | null;
  event_date: string | null;
  author_id: string;
  profiles: { name: string } | null;
};

type MemberFilter = { id: string; name: string };

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [members, setMembers] = useState<MemberFilter[]>([]);
  const [selectedMember, setSelectedMember] = useState("all");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📸");
  const [eventDate, setEventDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: photosData } = await supabase
      .from("photos")
      .select("id, title, emoji, photo_url, event_date, author_id, profiles!photos_author_id_fkey(name)")
      .order("created_at", { ascending: false });
    const { data: membersData } = await supabase.from("profiles").select("id, name").order("name", { ascending: true });
    const safePhotos = (photosData ?? []).map((photo) => {
      const relation = Array.isArray(photo.profiles) ? photo.profiles[0] : photo.profiles;
      return {
        id: photo.id,
        title: photo.title,
        emoji: photo.emoji,
        photo_url: photo.photo_url,
        event_date: photo.event_date,
        author_id: photo.author_id,
        profiles: relation ? { name: relation.name } : null,
      } as PhotoRow;
    });
    setPhotos(safePhotos);
    setMembers((membersData ?? []) as MemberFilter[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => (selectedMember === "all" ? photos : photos.filter((photo) => photo.author_id === selectedMember)),
    [photos, selectedMember],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !file) return;

    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/album-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
    if (uploadError) return;
    const { data } = supabase.storage.from("photos").getPublicUrl(path);

    await supabase.from("photos").insert({
      author_id: user.id,
      title,
      emoji,
      photo_url: data.publicUrl,
      event_date: eventDate || null,
    });

    setTitle("");
    setEmoji("📸");
    setEventDate("");
    setFile(null);
    await load();
  };

  return (
    <section className="space-y-4">
      <form onSubmit={onSubmit} className="card-soft space-y-2">
        <h2 className="font-semibold">Ajouter une photo</h2>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre" className="w-full rounded-xl border border-sand px-3 py-2" />
        <div className="flex gap-2">
          <input value={emoji} onChange={(event) => setEmoji(event.target.value)} placeholder="📸" className="w-20 rounded-xl border border-sand px-3 py-2" />
          <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="flex-1 rounded-xl border border-sand px-3 py-2" />
        </div>
        <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button className="btn-main" type="submit">
          Upload
        </button>
      </form>

      <div className="card-soft">
        <label className="mb-1 block text-sm">Filtrer par membre</label>
        <select
          value={selectedMember}
          onChange={(event) => setSelectedMember(event.target.value)}
          className="w-full rounded-xl border border-sand px-3 py-2"
        >
          <option value="all">Tous les membres</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <PhotoGrid photos={filtered} />
    </section>
  );
}
