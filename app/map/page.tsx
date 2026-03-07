"use client";

import dynamic from "next/dynamic";

const FamilyMap = dynamic(() => import("@/components/map/FamilyMap"), { ssr: false });

export default function MapPage() {
  return (
    <section className="space-y-3">
      <div className="card-soft">
        <h1 className="font-playfair text-xl">Carte de la famille 🗺️</h1>
      </div>
      <FamilyMap />
    </section>
  );
}
