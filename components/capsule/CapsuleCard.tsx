type Capsule = {
  id: string;
  title: string;
  message: string;
  photo_url: string | null;
  open_date: string;
  is_opened: boolean;
  profiles: { name: string; avatar: string | null } | null;
};

const daysLeft = (openDate: string) => {
  const today = new Date();
  const target = new Date(openDate);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export function CapsuleCard({ capsule }: { capsule: Capsule }) {
  const remaining = daysLeft(capsule.open_date);

  if (!capsule.is_opened) {
    return (
      <article className="space-y-2 rounded-2xl border border-sand bg-sand/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{capsule.title}</h3>
          <span className="animate-pulse text-lg">🔒</span>
        </div>
        <p className="text-sm text-brown/70">Par {capsule.profiles?.name ?? "Membre"}</p>
        <p className="text-sm">Ouverture prévue le {capsule.open_date}</p>
        <p className="text-sm font-semibold">⏳ {Math.max(0, remaining)} jour(s) restants</p>
        <div className="rounded-xl border border-dashed border-brown/30 bg-cream/60 px-3 py-4 text-center text-sm text-brown/70">
          Contenu scellé jusqu&apos;à la date d&apos;ouverture
        </div>
      </article>
    );
  }

  return (
    <article className="space-y-2 rounded-2xl border border-terracotta/40 bg-[#fdf6e3] p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">💌 {capsule.title}</h3>
        <span className="text-xs text-brown/70">Ouverte</span>
      </div>
      <p className="text-sm text-brown/70">De {capsule.profiles?.name ?? "Membre"}</p>
      <p className="whitespace-pre-wrap text-sm">{capsule.message}</p>
      {capsule.photo_url ? <img src={capsule.photo_url} alt={capsule.title} className="max-h-72 w-full rounded-xl object-cover" /> : null}
    </article>
  );
}
