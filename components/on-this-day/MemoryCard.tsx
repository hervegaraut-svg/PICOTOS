export function MemoryCard({
  memory,
  onShare,
}: {
  memory: {
    id: string;
    content: string;
    image: string | null;
    date: string;
    yearsAgo: number;
  };
  onShare: (memory: { content: string; image: string | null; yearsAgo: number }) => void;
}) {
  return (
    <article className="w-72 shrink-0 rounded-2xl border border-sand bg-white p-3">
      <p className="mb-2 inline-block rounded-full bg-terracotta px-2 py-1 text-xs text-white">
        Il y a {memory.yearsAgo} an(s)
      </p>
      {memory.image ? <img src={memory.image} alt="Souvenir" className="mb-2 h-36 w-full rounded-xl object-cover" /> : null}
      <p className="line-clamp-4 text-sm">{memory.content}</p>
      <p className="mt-1 text-xs text-brown/70">{memory.date}</p>
      <button className="btn-main mt-3 w-full text-sm" onClick={() => onShare(memory)}>
        Partager ce souvenir
      </button>
    </article>
  );
}
