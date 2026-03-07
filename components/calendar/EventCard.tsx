const typeColor: Record<string, string> = {
  anniversaire: "#e8a87c",
  appel: "#7ec8a8",
  fete: "#a87ec8",
  visite: "#e87c9a",
  other: "#c47a45",
};

export function EventCard({
  event,
  highlight,
}: {
  event: { title: string; event_date: string; type: string; concerned: string | null };
  highlight?: boolean;
}) {
  const color = typeColor[event.type] ?? typeColor.other;

  return (
    <article className={`card-soft ${highlight ? "ring-2 ring-terracotta/40" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{event.title}</h3>
        <span style={{ backgroundColor: color }} className="rounded-full px-2 py-1 text-xs text-white">
          {event.type}
        </span>
      </div>
      <p className="mt-1 text-sm">📅 {event.event_date}</p>
      {event.concerned ? <p className="text-xs text-brown/70">👤 {event.concerned}</p> : null}
    </article>
  );
}
