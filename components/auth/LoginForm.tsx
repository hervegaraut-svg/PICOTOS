"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { phoneToPseudoEmail } from "@/lib/phone";

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    const email = phoneToPseudoEmail(phone);
    const { error: signInError, data } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError("Ce numéro n'est pas reconnu. Contactez l'administrateur.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_login")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.first_login ? "/first-login" : "/feed");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="card-soft mx-auto mt-20 w-full max-w-sm space-y-4">
      <h2 className="font-title text-2xl italic text-terracotta">Connexion privée</h2>
      <p className="text-sm text-brown/80">Entrez votre numéro de téléphone et votre mot de passe.</p>

      <div>
        <label className="mb-1 block text-sm font-semibold">Numéro</label>
        <input
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+33612345678"
          className="w-full rounded-xl border border-sand bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Mot de passe</label>
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-sand bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button disabled={loading} className="btn-main w-full" type="submit">
        {loading ? "Connexion..." : "Entrer"}
      </button>
    </form>
  );
}
