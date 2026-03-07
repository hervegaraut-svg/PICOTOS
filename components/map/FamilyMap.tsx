"use client";

import "leaflet/dist/leaflet.css";
import { FormEvent, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LocationRow = {
  id: string;
  member_id: string;
  city: string;
  country: string;
  country_flag: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  profiles: { name: string; avatar: string | null; role: string | null } | null;
};

type WeatherRow = {
  temp: number;
  emoji: string;
};

const weatherToEmoji = (code: number) => {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code === 95) return "⛈️";
  return "🌤️";
};

const createMemberIcon = (avatar: string | null) =>
  L.divIcon({
    className: "",
    html: `<div style=\"width:44px;height:44px;border-radius:999px;background:#c47a45;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-size:20px;\">${avatar ?? "👤"}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18],
  });

export default function FamilyMap() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [weatherByMember, setWeatherByMember] = useState<Record<string, WeatherRow>>({});
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [countryFlag, setCountryFlag] = useState("");
  const [saving, setSaving] = useState(false);

  const centeredLocations = useMemo(
    () =>
      locations
        .map((item) => ({
          ...item,
          latitude: item.latitude ? Number(item.latitude) : null,
          longitude: item.longitude ? Number(item.longitude) : null,
        }))
        .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)),
    [locations],
  );

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("member_locations")
      .select("id, member_id, city, country, country_flag, latitude, longitude, profiles!member_locations_member_id_fkey(name, avatar, role)")
      .order("updated_at", { ascending: false });

    const safeRows = (data ?? []).map((row) => {
      const relation = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        member_id: row.member_id,
        city: row.city,
        country: row.country,
        country_flag: row.country_flag,
        latitude: row.latitude,
        longitude: row.longitude,
        profiles: relation
          ? {
              name: relation.name,
              avatar: relation.avatar,
              role: relation.role,
            }
          : null,
      } as LocationRow;
    });

    setLocations(safeRows);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const run = async () => {
      const entries = await Promise.all(
        centeredLocations.map(async (item) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${item.latitude}&longitude=${item.longitude}&current_weather=true`,
          );
          const data = await response.json();
          const code = data?.current_weather?.weathercode;
          const temp = data?.current_weather?.temperature;

          if (typeof code !== "number" || typeof temp !== "number") {
            return [item.member_id, { temp: 0, emoji: "🌤️" }] as const;
          }

          return [item.member_id, { temp, emoji: weatherToEmoji(code) }] as const;
        }),
      );

      setWeatherByMember(Object.fromEntries(entries));
    };

    if (centeredLocations.length) {
      void run();
    }
  }, [centeredLocations]);

  const onUpdateLocation = async (event: FormEvent) => {
    event.preventDefault();
    if (!city.trim() || !country.trim()) return;

    setSaving(true);
    const geocodeResponse = await fetch(
      `/api/geocode?city=${encodeURIComponent(city.trim())}&country=${encodeURIComponent(country.trim())}`,
    );

    if (!geocodeResponse.ok) {
      setSaving(false);
      return;
    }

    const geocode = (await geocodeResponse.json()) as { lat: number; lng: number };
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    await supabase.from("member_locations").upsert(
      {
        member_id: user.id,
        city: city.trim(),
        country: country.trim(),
        country_flag: countryFlag.trim() || null,
        latitude: geocode.lat,
        longitude: geocode.lng,
      },
      { onConflict: "member_id" },
    );

    setCity("");
    setCountry("");
    setCountryFlag("");
    setSaving(false);
    await load();
  };

  return (
    <section className="space-y-3">
      <form onSubmit={onUpdateLocation} className="card-soft space-y-2">
        <h2 className="font-semibold">📍 Mettre à jour ma ville</h2>
        <div className="grid grid-cols-3 gap-2">
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ville" className="rounded-xl border border-sand px-3 py-2" />
          <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Pays" className="rounded-xl border border-sand px-3 py-2" />
          <input value={countryFlag} onChange={(event) => setCountryFlag(event.target.value)} placeholder="🇫🇷" className="rounded-xl border border-sand px-3 py-2" />
        </div>
        <button type="submit" className="btn-main" disabled={saving}>
          {saving ? "Mise à jour..." : "Enregistrer"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-sand">
        <MapContainer center={[30, 20]} zoom={2} style={{ height: "calc(100vh - 160px)", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

          {centeredLocations.map((item) => (
            <Marker key={item.id} position={[Number(item.latitude), Number(item.longitude)]} icon={createMemberIcon(item.profiles?.avatar ?? null)}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{item.profiles?.name ?? "Membre"}</p>
                  <p>{item.profiles?.role ?? "Membre"}</p>
                  <p>
                    {item.country_flag ?? "🌍"} {item.city}, {item.country}
                  </p>
                  <p>
                    {weatherByMember[item.member_id]?.emoji ?? "🌤️"} {weatherByMember[item.member_id]?.temp ?? "--"}°C
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
