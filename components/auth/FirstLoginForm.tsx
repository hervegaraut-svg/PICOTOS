"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

export function FirstLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => password.length >= 8 && password === confirm, [password, confirm]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Le mot de passe doit contenir au moins 8 caractères et être identique.");
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
      .update({ first_login: false })
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
