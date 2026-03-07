"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/feed", label: "Fil", icon: "📰" },
  { href: "/photos", label: "Photos", icon: "📸" },
  { href: "/calendar", label: "Agenda", icon: "📅" },
  { href: "/playlist", label: "Playlist", icon: "🎵" },
  { href: "/on-this-day", label: "Souvenirs", icon: "🕰️" },
  { href: "/quiz", label: "Quiz", icon: "🧩" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-sand bg-cream/95 px-2 py-2 backdrop-blur">
      <div className="grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "flex flex-col items-center rounded-xl px-1 py-1 text-[10px] transition",
                active ? "bg-terracotta text-white" : "text-brown hover:bg-sand/60",
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
