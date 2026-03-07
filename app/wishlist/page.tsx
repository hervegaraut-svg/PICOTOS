"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { AddWishForm } from "@/components/wishlist/AddWishForm";
import { WishCard } from "@/components/wishlist/WishCard";

type MemberRow = {
  id: string;
  name: string;
  avatar: string | null;
};

type WishRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: "birthday" | "travel" | "recipe" | "culture";
  link: string | null;
  price_range: string | null;
  is_reserved: boolean;
  reserved_by_me?: boolean;
};

const categories = ["all", "birthday", "travel", "recipe", "culture"] as const;
type CategoryFilter = (typeof categories)[number];

export default function WishlistPage() {
  const [viewerId, setViewerId] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadMembers = async () => {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setViewerId(user.id);

    const { data: memberRows } = await supabase.from("profiles").select("id, name, avatar").order("name", { ascending: true });
    const safeMembers = (memberRows ?? []) as MemberRow[];
    setMembers(safeMembers);
    setSelectedMemberId((previous) => previous || user.id);

    const { data: wishCountRows } = await supabase.from("wish_items").select("owner_id");
    const map: Record<string, number> = {};
    (wishCountRows ?? []).forEach((row) => {
      map[row.owner_id] = (map[row.owner_id] ?? 0) + 1;
    });
    setCounts(map);
  };

  const loadWishes = async () => {
    if (!selectedMemberId || !viewerId) return;

    const supabase = createBrowserSupabaseClient();

    if (selectedMemberId === viewerId) {
      const { data } = await supabase
        .from("wish_items")
        .select("id, owner_id, title, description, category, link, price_range, is_reserved")
        .eq("owner_id", selectedMemberId)
        .order("created_at", { ascending: false });

      setWishes((data ?? []) as WishRow[]);
      return;
    }

    const { data } = await supabase
      .from("wish_items")
      .select("id, owner_id, title, description, category, link, price_range, is_reserved, reserved_by")
      .eq("owner_id", selectedMemberId)
      .order("created_at", { ascending: false });

    const safeRows = (data ?? []).map((row) => ({
      id: row.id,
      owner_id: row.owner_id,
      title: row.title,
      description: row.description,
      category: row.category,
      link: row.link,
      price_range: row.price_range,
      is_reserved: row.is_reserved,
      reserved_by_me: row.reserved_by === viewerId,
    })) as WishRow[];

    setWishes(safeRows);
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  useEffect(() => {
    void loadWishes();
  }, [selectedMemberId, viewerId]);

  const filteredWishes = useMemo(() => {
    if (selectedCategory === "all") return wishes;
    return wishes.filter((wish) => wish.category === selectedCategory);
  }, [wishes, selectedCategory]);

  const reserveWish = async (wishId: string) => {
    if (!viewerId) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from("wish_items").update({ is_reserved: true, reserved_by: viewerId }).eq("id", wishId).eq("is_reserved", false);
    await loadWishes();
  };

  const isOwnerView = selectedMemberId === viewerId;

  return (
    <section className="space-y-4">
      <div className="card-soft">
        <h1 className="font-playfair text-xl">Liste de souhaits 🎁</h1>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {members.map((member) => (
          <button
            type="button"
            key={member.id}
            onClick={() => setSelectedMemberId(member.id)}
            className={`rounded-2xl border p-3 text-left ${selectedMemberId === member.id ? "border-terracotta bg-sand/50" : "border-sand bg-white"}`}
          >
            <p className="text-sm font-semibold">
              {member.avatar ?? "👤"} {member.name}
            </p>
            <p className="text-xs text-brown/70">{counts[member.id] ?? 0} souhait(s)</p>
          </button>
        ))}
      </div>

      {isOwnerView && viewerId ? <AddWishForm ownerId={viewerId} onAdded={loadWishes} /> : null}

      <div className="card-soft">
        <label className="mb-1 block text-sm">Filtrer par catégorie</label>
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value as CategoryFilter)}
          className="w-full rounded-xl border border-sand px-3 py-2"
        >
          <option value="all">Toutes</option>
          <option value="birthday">🎂 Anniversaires & fêtes</option>
          <option value="travel">✈️ Voyages & déplacements</option>
          <option value="recipe">🍽️ Cuisine & recettes</option>
          <option value="culture">🎬 Livres, films, musique</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredWishes.map((wish) => (
          <WishCard key={wish.id} wish={wish} isOwnerView={isOwnerView} onReserve={reserveWish} />
        ))}
      </div>
    </section>
  );
}
