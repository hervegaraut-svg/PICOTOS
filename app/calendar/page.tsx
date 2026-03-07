"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { EventCard } from "@/components/calendar/EventCard";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  type: string;
  concerned: string | null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [type, setType] = useState("other");
  const [concerned, setConcerned] = useState("");

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, type, concerned")
      .order("event_date", { ascending: true });
    setEvents((data ?? []) as EventRow[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title || !eventDate) return;
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("events").insert({
      title,
      event_date: eventDate,
      type,
      concerned: concerned || null,
      created_by: user?.id ?? null,
    });
    setTitle("");
    setEventDate("");
    setType("other");
    setConcerned("");
    await load();
  };

  return (
    <section className="space-y-4">
      <form onSubmit={onSubmit} className="card-soft space-y-2">
        <h2 className="font-semibold">Ajouter un événement</h2>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre" className="w-full rounded-xl border border-sand px-3 py-2" />
        <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="w-full rounded-xl border border-sand px-3 py-2" />
        <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-xl border border-sand px-3 py-2">
          <option value="anniversaire">anniversaire</option>
          <option value="appel">appel</option>
          <option value="fete">fete</option>
          <option value="visite">visite</option>
          <option value="other">other</option>
        </select>
        <input value={concerned} onChange={(event) => setConcerned(event.target.value)} placeholder="Qui est concerné ?" className="w-full rounded-xl border border-sand px-3 py-2" />
        <button className="btn-main" type="submit">
          Ajouter
        </button>
      </form>

      {events.map((event, index) => (
        <EventCard key={event.id} event={event} highlight={index === 0} />
      ))}
    </section>
  );
}
