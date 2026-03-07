type WishCardItem = {
  id: string;
  title: string;
  description: string | null;
  category: "birthday" | "travel" | "recipe" | "culture";
  link: string | null;
  price_range: string | null;
  is_reserved: boolean;
  reserved_by_me?: boolean;
};

type WishCardProps = {
  wish: WishCardItem;
  isOwnerView: boolean;
  onReserve: (wishId: string) => Promise<void> | void;
};

const categoryMeta: Record<WishCardItem["category"], { label: string; emoji: string; className: string }> = {
  birthday: { label: "Anniversaires & fêtes", emoji: "🎂", className: "bg-terracotta/15 text-brown" },
  travel: { label: "Voyages & déplacements", emoji: "✈️", className: "bg-sand/70 text-brown" },
  recipe: { label: "Cuisine & recettes", emoji: "🍽️", className: "bg-brown/10 text-brown" },
  culture: { label: "Livres, films, musique", emoji: "🎬", className: "bg-cream text-brown" },
};

export function WishCard({ wish, isOwnerView, onReserve }: WishCardProps) {
  const category = categoryMeta[wish.category];

  return (
    <article className="space-y-2 rounded-2xl border border-sand bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{wish.title}</h3>
        <span className={`rounded-full px-2 py-1 text-[11px] ${category.className}`}>
          {category.emoji} {category.label}
        </span>
      </div>

      {wish.description ? <p className="text-sm text-brown/80">{wish.description}</p> : null}
      {wish.price_range ? <p className="text-xs text-brown/70">Budget: {wish.price_range}</p> : null}
      {wish.link ? <a href={wish.link} target="_blank" rel="noreferrer" className="text-sm text-terracotta underline">Voir le lien</a> : null}

      {isOwnerView ? null : wish.is_reserved ? (
        <p className="rounded-xl border border-sand px-3 py-2 text-sm">
          {wish.reserved_by_me ? "✅ Réservé par moi" : "✅ Déjà pris"}
        </p>
      ) : (
        <button type="button" className="btn-outline" onClick={() => onReserve(wish.id)}>
          🎁 Je le prends !
        </button>
      )}
    </article>
  );
}
