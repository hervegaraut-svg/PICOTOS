"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AddWishFormProps = {
  ownerId: string;
  onAdded: () => Promise<void> | void;
};

export function AddWishForm({ ownerId, onAdded }: AddWishFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"birthday" | "travel" | "recipe" | "culture">("birthday");
  const [link, setLink] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    const supabase = createBrowserSupabaseClient();
    await supabase.from("wish_items").insert({
      owner_id: ownerId,
      title: title.trim(),
      description: description.trim() || null,
      category,
      link: link.trim() || null,
      price_range: priceRange.trim() || null,
    });

    setTitle("");
    setDescription("");
    setCategory("birthday");
    setLink("");
    setPriceRange("");
    await onAdded();
  };

  return (
    <form onSubmit={onSubmit} className="card-soft space-y-2">
      <h2 className="font-semibold">Ajouter un souhait</h2>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre" className="w-full rounded-xl border border-sand px-3 py-2" />
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="min-h-20 w-full rounded-xl border border-sand px-3 py-2" />
      <select value={category} onChange={(event) => setCategory(event.target.value as "birthday" | "travel" | "recipe" | "culture")} className="w-full rounded-xl border border-sand px-3 py-2">
        <option value="birthday">🎂 Anniversaires & fêtes</option>
        <option value="travel">✈️ Voyages & déplacements</option>
        <option value="recipe">🍽️ Cuisine & recettes</option>
        <option value="culture">🎬 Livres, films, musique</option>
      </select>
      <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="Lien (optionnel)" className="w-full rounded-xl border border-sand px-3 py-2" />
      <input value={priceRange} onChange={(event) => setPriceRange(event.target.value)} placeholder="Budget (optionnel)" className="w-full rounded-xl border border-sand px-3 py-2" />
      <button type="submit" className="btn-main">
        Ajouter
      </button>
    </form>
  );
}
