"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-sand bg-cream/95 px-4 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-title text-2xl italic text-terracotta">Picotos and Co</h1>
          <p className="text-xs text-brown/80">Votre maison familiale privée · Maurice & France</p>
        </div>
        <button type="button" onClick={onSignOut} className="btn-outline text-xs">
          Déconnexion
        </button>
      </div>
    </header>
  );
}
