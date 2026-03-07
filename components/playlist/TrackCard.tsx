export function TrackCard({
  track,
  onLike,
}: {
  track: {
    id: string;
    title: string;
    artist: string;
    album: string | null;
    cover_url: string | null;
    preview_url: string | null;
    spotify_url: string;
    personal_note: string | null;
    likes_count: number;
    profiles: { name: string } | null;
  };
  onLike: (id: string, likes: number) => void;
}) {
  return (
    <article className="card-soft space-y-2">
      <div className="flex gap-3">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-sand text-xl">🎵</div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{track.title}</h3>
          <p className="truncate text-xs text-brown/80">{track.artist}</p>
          <p className="truncate text-[11px] text-brown/60">Ajouté par {track.profiles?.name ?? "Membre"}</p>
        </div>
      </div>

      {track.personal_note ? <p className="text-xs">💬 {track.personal_note}</p> : null}

      {track.preview_url ? <audio controls className="w-full" src={track.preview_url} /> : null}

      <div className="flex gap-2">
        <button type="button" onClick={() => onLike(track.id, track.likes_count)} className="btn-outline text-sm">
          ❤️ {track.likes_count}
        </button>
        <a className="btn-main text-sm" href={track.spotify_url} target="_blank" rel="noreferrer">
          Ouvrir Spotify
        </a>
      </div>
    </article>
  );
}
