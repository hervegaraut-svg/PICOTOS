"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { NewCapsuleForm } from "@/components/capsule/NewCapsuleForm";
import { CapsuleCard } from "@/components/capsule/CapsuleCard";

type CapsuleRow = {
  id: string;
  title: string;
  message: string;
  photo_url: string | null;
  open_date: string;
  is_opened: boolean;
  profiles: { name: string; avatar: string | null } | null;
};

export default function CapsulePage() {
  const [capsules, setCapsules] = useState<CapsuleRow[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("time_capsules")
      .select("id, title, message, photo_url, open_date, is_opened, profiles!time_capsules_author_id_fkey(name, avatar)")
      .order("created_at", { ascending: false });

    const safeRows = (data ?? []).map((row) => {
      const relation = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        title: row.title,
        message: row.message,
        photo_url: row.photo_url,
        open_date: row.open_date,
        is_opened: row.is_opened,
        profiles: relation
          ? {
              name: relation.name,
              avatar: relation.avatar,
            }
          : null,
      } as CapsuleRow;
    });

    setCapsules(safeRows);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="card-soft space-y-2">
        <h1 className="font-playfair text-xl">Des messages pour le futur 💌</h1>
        <button type="button" className="btn-main" onClick={() => setShowForm((previous) => !previous)}>
          + Sceller une capsule
        </button>
      </div>

      {showForm ? <NewCapsuleForm onCreated={load} /> : null}

      <div className="space-y-3">
        {capsules.map((capsule) => (
          <CapsuleCard key={capsule.id} capsule={capsule} />
        ))}
      </div>
    </section>
  );
}
