type PhotoItem = {
  id: string;
  title: string;
  emoji: string | null;
  photo_url: string | null;
  event_date: string | null;
  author_id: string;
  profiles: { name: string } | null;
};

type PhotoGridProps = {
  photos: PhotoItem[];
  viewerId: string | null;
  onDelete: (photoId: string) => void;
};

export function PhotoGrid({ photos, viewerId, onDelete }: PhotoGridProps) {
  const gradients = [
    "from-[#faf7f2] to-[#f4e6d7]",
    "from-[#f6ece2] to-[#efe1cf]",
    "from-[#f9f2e9] to-[#eed8c3]",
    "from-[#f3e8dc] to-[#ebd7c3]",
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo, index) => (
        <article key={photo.id} className={`rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} p-3`}>
          <p className="mb-1 text-xs">{photo.emoji ?? "📸"}</p>
          {photo.photo_url ? (
            <img src={photo.photo_url} alt={photo.title} className="mb-2 h-24 w-full rounded-xl object-cover" />
          ) : null}
          <h3 className="text-sm font-semibold">{photo.title}</h3>
          <p className="text-[11px] text-brown/75">{photo.profiles?.name ?? "Membre"}</p>
          <p className="text-[11px] text-brown/60">{photo.event_date ?? "Date inconnue"}</p>
          {viewerId && photo.author_id === viewerId ? (
            <button
              type="button"
              onClick={() => onDelete(photo.id)}
              className="mt-2 rounded-lg border border-sand px-2 py-1 text-[11px]"
            >
              Supprimer
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
