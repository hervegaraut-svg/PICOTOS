"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

const AVATAR_OPTIONS = ["👤", "👩", "👨", "👧", "👦", "👵", "👴", "🧑", "👶", "🐱", "🌺", "🌴"];

export function FirstLoginForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("👤");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && password.length >= 8 && password === confirm,
    [name, password, confirm],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Remplissez votre prénom (min 2 car.) et un mot de passe (min 8 car.) identique.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: updateAuthError } = await supabase.auth.updateUser({ password });
    if (updateAuthError || !user) {
      setError("Impossible de mettre à jour le mot de passe.");
      setLoading(false);
      return;
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        first_login: false,
        name: name.trim(),
        role: role.trim() || null,
        avatar,
      })
      .eq("id", user.id);

    if (updateProfileError) {
      setError("Mot de passe changé, mais impossible de finaliser le profil.");
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="card-soft mx-auto mt-20 w-full max-w-sm space-y-4">
      <h2 className="font-title text-2xl italic text-terracotta">Premier accès</h2>
      <p className="text-sm text-brown/80">Bienvenue dans la famille ! Complétez votre profil.</p>

      <div>
        <label className="mb-1 block text-sm font-semibold">Prénom</label>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Votre prénom"
          className="w-full rounded-xl border border-sand bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Rôle dans la famille <span className="font-normal text-brown/50">(optionnel)</span></label>
        <input
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="Ex : Papa, Maman, Fille, Fils, Papi..."
          className="w-full rounded-xl border border-sand bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              className={`rounded-xl p-2 text-2xl transition ${avatar === emoji ? "bg-terracotta/20 ring-2 ring-terracotta" : "bg-white hover:bg-sand/50"}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-sand" />

      <p className="text-sm text-brown/80">Pour votre sécurité, choisissez un nouveau mot de passe.</p>

      <div>
        <label className="mb-1 block text-sm font-semibold">Nouveau mot de passe</label>
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-sand bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      <PasswordStrength password={password} />

      <div>
        <label className="mb-1 block text-sm font-semibold">Confirmer</label>
        <input
          required
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="w-full rounded-xl border border-sand bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button disabled={loading || !canSubmit} type="submit" className="btn-main w-full disabled:opacity-60">
        {loading ? "Enregistrement..." : "Valider"}
      </button>
    </form>
  );
}
